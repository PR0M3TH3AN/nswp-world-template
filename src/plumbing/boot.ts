/**
 * PLUMBING. This file does the things every world on the protocol has to do
 * the same way, so that your scene doesn't have to:
 *
 * - reads how the visitor arrived, and removes that from the address at once;
 * - sends every outbound portal through the visitor's Airlock;
 * - runs VR on any headset, and mouse, touch and keyboard without one;
 * - offers the way back to the visitor's own lobby;
 * - runs the shared room (other visitors, with voice) when someone joins it.
 *
 * You can change this file. If you do, `npm run check` will tell you, because
 * the rules in AGENTS.md are then yours to keep by hand.
 *
 * Input uses only the WebXR `select` event, which controllers, hand pinches
 * and gaze-and-pinch all produce, so nothing here is specific to one headset.
 */
import * as THREE from "three";
import { decodeNaddr, parseLayoutEvent, parseWorldEvent, queryRelays, verifyEvent, WORLD_KIND, type Layout, type PortalDestination } from "@nswp/core";
import { arrival, configure, portal } from "nswp-sdk";
import { createPortalGate, type PortalGate } from "nswp-sdk/home";
import { attachRoomControls, capturePanorama, createPresence } from "nswp-sdk/three";
import site from "virtual:site";
import configJson from "../../world.json";
import type { BuildScene, PortalOptions, SceneContext, WorldConfig } from "./types.js";

interface TestHooks {
  state: Record<string, unknown>;
  portals(): { label: string; destination: PortalDestination; position: number[] }[];
  goThrough(index: number): Promise<void>;
  capturePreview(width?: number): Promise<{ base64: string; width: number; height: number; bytes: number }>;
  teleport(x: number, z: number): void;
  roomInfo(): unknown;
  device?: unknown;
}
declare global {
  interface Window {
    /** For automated tests and the preview script. Not an API for worlds. */
    __nswpTest?: TestHooks;
  }
}

const EMPTY_LAYOUT: Layout = { d: "home", room: { template: "hall", color: "#101217", accent: "#3fc584" }, items: [], createdAt: 0 };
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

export async function startWorld(buildScene: BuildScene): Promise<void> {
  // Before anything else: read the arrival context and scrub it from the
  // address, so it can't linger in history or be read by later code (spec §4.4).
  const { context, warnings } = arrival.read();
  const config = configJson as unknown as WorldConfig;
  configure({ defaultAirlock: config.airlock });

  const emulate = new URLSearchParams(location.search).get("xr") === "emulate";
  const state: Record<string, unknown> = { ready: false, world: config.world.title, arrival: context, arrivalWarnings: warnings, emulate, xr: "idle", leaving: false };
  const hooks: TestHooks = {
    state,
    portals: () => [],
    goThrough: async () => {},
    capturePreview: async () => ({ base64: "", width: 0, height: 0, bytes: 0 }),
    teleport: () => {},
    roomInfo: () => null,
  };
  window.__nswpTest = hooks;
  if (emulate) {
    // A pretend Meta Quest 3, for trying VR without a headset.
    const { XRDevice, metaQuest3 } = await import("iwer");
    const device = new XRDevice(metaQuest3, { stereoEnabled: false });
    device.installRuntime({ forceInstall: true });
    hooks.device = device;
  }

  // ------------------------------------------------------------- the stage
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType("local-floor");
  $("stage")!.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.sky ?? "#0a0b0d");
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 200);
  camera.position.set(0, 1.6, 0);
  const rig = new THREE.Group();
  rig.add(camera);
  scene.add(rig);

  // Arrive where the visitor asked to, or at the main entrance.
  const entryName = context?.entry && config.entryPoints[context.entry] ? context.entry : "main-entrance";
  const entry = config.entryPoints[entryName] ?? { position: [0, 0, 4] as [number, number, number], yaw: 0 };
  rig.position.set(...entry.position);
  rig.rotation.y = entry.yaw;
  state.entryPoint = entryName;

  const parsed = parseLayoutEvent(site.layout);
  const layout = parsed.ok ? parsed.value : EMPTY_LAYOUT;
  state.layoutWarnings = parsed.warnings.map((w) => w.message);

  // ------------------------------------------------------------- your scene
  const gates: PortalGate[] = [];
  const ctx: SceneContext = {
    scene,
    camera,
    rig,
    renderer,
    config,
    layout,
    arrival: context,
    addPortal(destination: PortalDestination, opts: PortalOptions = {}) {
      const gate = createPortalGate(destination, { label: opts.label, color: opts.color ?? layout.room.accent });
      const [x, y, z] = opts.position ?? [0, 0, -3];
      gate.group.position.set(x, y + 1.2, z);
      gate.group.rotation.y = THREE.MathUtils.degToRad(opts.rotation ?? 0);
      scene.add(gate.group);
      gates.push(gate);
      return gate;
    },
    usePortals(more) {
      for (const g of more) if (!gates.includes(g)) gates.push(g);
    },
  };
  const handle = await buildScene(ctx);
  hooks.portals = () => gates.map((g) => ({ label: g.group.userData.label ?? "", destination: g.destination, position: g.group.getWorldPosition(new THREE.Vector3()).toArray() }));
  void namePortals(gates, config.relays, state);

  // ------------------------------------------------------------- leaving
  // Every way out goes through an Airlock: a plain page that shows the real
  // address and waits for the visitor to agree (spec §6.2).
  const go = async (gate: PortalGate) => {
    if (state.leaving) return;
    state.leaving = true;
    document.body.classList.add("leaving");
    await portal.go(gate.destination, { xrSession: renderer.xr.getSession() });
  };
  hooks.goThrough = async (i) => {
    const gate = gates[i];
    if (gate) await go(gate);
  };

  // The way back to the visitor's own lobby, offered when they came from one.
  const homeButton = $<HTMLButtonElement>("home-button");
  if (homeButton && arrival.returnAirlock()) {
    homeButton.hidden = false;
    homeButton.addEventListener("click", () => void portal.home({ xrSession: renderer.xr.getSession() }));
  }

  // ------------------------------------------------------------- input
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(2, 2); // off-screen until the pointer moves
  const targets = () => gates.map((g) => g.target);
  const gateFor = (object: THREE.Object3D | undefined) => gates.find((g) => g.target === object) ?? null;
  let dragging = false;
  let lastX = 0;
  let moved = 0;
  const setPointer = (e: PointerEvent) => pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  renderer.domElement.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    moved = 0;
  });
  addEventListener("pointerup", (e) => {
    dragging = false;
    if (moved > 6 || renderer.xr.isPresenting || e.target !== renderer.domElement) return;
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    const gate = gateFor(raycaster.intersectObjects(targets(), false)[0]?.object);
    if (gate) void go(gate);
  });
  addEventListener("pointermove", (e) => {
    if (dragging && !renderer.xr.isPresenting) {
      rig.rotation.y += (e.clientX - lastX) * 0.005;
      moved += Math.abs(e.clientX - lastX);
      lastX = e.clientX;
    }
    setPointer(e);
  });

  // In VR: a `select` from any input source, aimed at a portal.
  const rotation = new THREE.Matrix4();
  const aimFrom = (source: THREE.Object3D): PortalGate | null => {
    rotation.identity().extractRotation(source.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(source.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rotation);
    return gateFor(raycaster.intersectObjects(targets(), false)[0]?.object);
  };
  const controllers: THREE.Group[] = [];
  for (let i = 0; i < 2; i++) {
    const c = renderer.xr.getController(i);
    c.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)]),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }),
      ),
    );
    c.addEventListener("select", () => {
      state.lastSelect = i;
      const gate = aimFrom(c);
      if (gate) void go(gate);
    });
    rig.add(c);
    controllers.push(c);
  }

  // Walking into a portal also goes through it.
  const head = new THREE.Vector3();
  const local = new THREE.Vector3();
  const walkedInto = (): PortalGate | null => {
    camera.getWorldPosition(head);
    for (const g of gates) {
      g.group.worldToLocal(local.copy(head));
      if (Math.hypot(local.x, local.y) < 0.8 && Math.abs(local.z) < 0.25) return g;
    }
    return null;
  };

  // Without a headset: W, A, S, D or the arrow keys.
  const keys = new Set<string>();
  addEventListener("keydown", (e) => {
    if (!(e.target instanceof HTMLButtonElement)) keys.add(e.code);
  });
  addEventListener("keyup", (e) => keys.delete(e.code));
  addEventListener("blur", () => keys.clear());
  const step = new THREE.Vector3();
  const walk = (dt: number) => {
    const forward = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
    const strafe = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
    if (!forward && !strafe) return;
    step.set(strafe, 0, -forward).normalize().multiplyScalar(2 * dt).applyAxisAngle(THREE.Object3D.DEFAULT_UP, rig.rotation.y);
    rig.position.add(step);
  };
  hooks.teleport = (x, z) => {
    rig.position.x = x - camera.position.x;
    rig.position.z = z - camera.position.z;
  };

  // ------------------------------------------------------------- the room
  // Other visitors appear only after someone presses Join (spec §9.4).
  const roomButton = $<HTMLButtonElement>("room-button");
  const status = $("room-status");
  let presenceUpdate = (_dt: number) => {};
  if (roomButton && status && config.world.capabilities?.includes("rooms")) {
    let refresh = () => {};
    const presence = createPresence({ scene, camera, rig, renderer, controllers, labelColor: "#f2f3f6", onChange: () => refresh() });
    ({ refresh } = attachRoomControls(presence, {
      roomButton,
      micButton: $<HTMLButtonElement>("mic-button")!,
      inviteButton: $<HTMLButtonElement>("invite-button")!,
      status,
      onState: (s) => (state.room = s),
    }));
    presenceUpdate = (dt) => presence.update(dt);
    hooks.roomInfo = () => presence.info();
  } else if (roomButton && status) {
    roomButton.hidden = true;
    status.hidden = true;
  }

  // ------------------------------------------------------------- preview
  // A 360° picture from the main entrance, for doors that lead here (spec §5.8).
  hooks.capturePreview = async (width = 2048) => {
    const main = config.entryPoints["main-entrance"] ?? entry;
    const blob = await capturePanorama(renderer, scene, new THREE.Vector3(main.position[0], main.position[1] + 1.6, main.position[2]), { width, hide: handle.hideFromPreview ?? [] });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { base64: btoa(binary), width, height: width / 2, bytes: bytes.length };
  };

  // ------------------------------------------------------------- VR
  const vrButton = $<HTMLButtonElement>("vr-button");
  const xr = navigator.xr;
  const supported = xr ? await xr.isSessionSupported("immersive-vr").catch(() => false) : false;
  state.vrSupported = supported;
  if (vrButton && supported) {
    vrButton.disabled = false;
    vrButton.textContent = "Enter VR";
    vrButton.addEventListener("click", async () => {
      if (renderer.xr.isPresenting) {
        await renderer.xr.getSession()?.end();
        return;
      }
      try {
        const session = await xr!.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "hand-tracking"] });
        await renderer.xr.setSession(session);
        state.xr = "presenting";
        vrButton.textContent = "Exit VR";
        session.addEventListener("end", () => {
          state.xr = "ended";
          vrButton.textContent = "Enter VR";
        });
      } catch (err) {
        state.xr = `error: ${err instanceof Error ? err.message : String(err)}`;
      }
    });
  } else if (vrButton) {
    vrButton.textContent = xr ? "VR isn't available on this device" : "This browser can't do VR";
  }

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // ------------------------------------------------------------- each frame
  const startedAt = performance.now();
  let last = 0;
  renderer.setAnimationLoop(() => {
    const t = (performance.now() - startedAt) / 1000;
    const dt = Math.min(t - last, 0.1);
    last = t;
    let aimed: PortalGate | null = null;
    if (renderer.xr.isPresenting) {
      for (const c of controllers) aimed = (c.visible ? aimFrom(c) : null) ?? aimed;
      const through = walkedInto();
      if (through) void go(through);
    } else {
      walk(dt);
      raycaster.setFromCamera(pointer, camera);
      aimed = gateFor(raycaster.intersectObjects(targets(), false)[0]?.object);
      renderer.domElement.style.cursor = aimed ? "pointer" : "grab";
    }
    for (const g of gates) g.aimed = g === aimed ? 1 : 0;
    presenceUpdate(dt);
    handle.update?.(t, dt);
    renderer.render(scene, camera);
  });
  state.portalCount = gates.length;
  state.ready = true;
}

/**
 * A portal placed by a world's coordinate knows the world's key, not its name
 * or address. Ask the relays for its announcement and write both on the sign.
 * If nothing comes back, the portal still works: the Airlock looks it up.
 */
async function namePortals(gates: PortalGate[], relays: string[], state: Record<string, unknown>): Promise<void> {
  const wanted = new Map<string, PortalGate[]>();
  for (const gate of gates) {
    if (!gate.destination.naddr || gate.destination.url) continue;
    try {
      const p = decodeNaddr(gate.destination.naddr);
      if (p.kind !== WORLD_KIND) continue;
      const key = `${p.pubkey}:${p.identifier}`;
      wanted.set(key, [...(wanted.get(key) ?? []), gate]);
    } catch {
      /* not an address this page can read; the Airlock will say so */
    }
  }
  if (wanted.size === 0) return;
  const keys = [...wanted.keys()].map((k) => k.split(":"));
  try {
    const found = await queryRelays(relays, { kinds: [WORLD_KIND], authors: [...new Set(keys.map((k) => k[0]!))], "#d": [...new Set(keys.map((k) => k.slice(1).join(":")))] });
    const newest = new Map<string, { at: number; title: string; url: string }>();
    for (const event of found.events) {
      if (!verifyEvent(event)) continue;
      const world = parseWorldEvent(event);
      if (!world.ok) continue;
      const key = `${event.pubkey}:${world.value.d}`;
      if (wanted.has(key) && (newest.get(key)?.at ?? -1) < event.created_at) newest.set(key, { at: event.created_at, title: world.value.title, url: world.value.url });
    }
    for (const [key, world] of newest) {
      for (const gate of wanted.get(key)!) {
        gate.destination.url = world.url;
        gate.setLabel(world.title);
        gate.group.userData.label = world.title;
      }
    }
    state.portalsNamed = newest.size;
  } catch {
    /* relays unreachable: the signs keep their short names */
  }
}
