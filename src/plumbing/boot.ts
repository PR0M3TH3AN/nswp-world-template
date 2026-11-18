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
import { decodeNaddr, encodeNaddr, parseLayoutEvent, portalTarget, parseWorldEvent, queryRelays, verifyEvent, WORLD_KIND, type Layout, type PortalDestination } from "@nswp/core";
import { arrival, configure, portal } from "nswp-sdk";
import { createPortalGate, PORTAL_HEIGHT, PORTAL_WIDTH, type PortalGate } from "nswp-sdk/home";
import { addRoomControls, addViewControls, capturePanorama, createConsole, createPresence, type XrConsole } from "nswp-sdk/three";
import { createControls, mountHud, type Controls } from "nswp-sdk/ui";
import site from "virtual:site";
import configJson from "../../world.json";
import type { BuildScene, PortalOptions, SceneContext, WorldConfig } from "./types.js";

interface TestHooks {
  state: Record<string, unknown>;
  portals(): { label: string; destination: PortalDestination; position: number[] }[];
  goThrough(index: number): Promise<void>;
  capturePreview(width?: number): Promise<{ base64: string; width: number; height: number; bytes: number }>;
  teleport(x: number, z: number): void;
  /** Turn the visitor to face this many degrees left of −Z. */
  face(degrees: number): void;
  /** Step towards a spot on the floor, as pointing at it and selecting would. */
  step(x: number, z: number): void;
  /** Where the visitor's head is over the floor: [x, z] in metres. */
  where(): [number, number];
  /** Everything a visitor can do here: `view()` lists it, `run(id)` does one. */
  controls?: Controls;
  /** The console shown in a headset: `describe()` says what it shows, `pressLabelled(text)` presses something. */
  console?: XrConsole;
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
    face: () => {},
    step: () => {},
    where: () => [0, 0],
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
  rig.rotation.y = THREE.MathUtils.degToRad(entry.yaw ?? 0);
  state.entryPoint = entryName;

  const parsed = parseLayoutEvent(site.layout);
  const layout = parsed.ok ? parsed.value : EMPTY_LAYOUT;
  // Away from the world's own address (localhost, a test deployment), this
  // site's own pictures are fetched from where the page is. The hash check stays.
  const own = config.world.url;
  if (!own.startsWith(`${location.origin}/`)) {
    for (const item of layout.items) {
      if (item.type === "frame" && item.args[0]?.startsWith(own)) item.args[0] = `${location.origin}/${item.args[0].slice(own.length)}`;
    }
  }
  state.layoutWarnings = parsed.warnings.map((w) => w.message);

  // ------------------------------------------------------------- the controls
  // One list of what a visitor can do here. The HUD draws it on a flat screen
  // and the console draws it in a headset; neither has any logic of its own.
  // The console takes this world's accent unless the visitor has chosen a look.
  const controls = createControls({ title: config.world.title, address: new URL(config.world.url).host, theme: { accent: layout.room.accent } });
  const hud = mountHud(controls);
  hooks.controls = controls;

  // ------------------------------------------------------------- your scene
  const gates: PortalGate[] = [];
  const ownGates: PortalGate[] = []; // made by addPortal, so animated here
  let built = false;
  const ctx: SceneContext = {
    scene,
    camera,
    rig,
    renderer,
    config,
    layout,
    controls,
    arrival: context,
    addPortal(to: PortalDestination | { coordinate: string }, opts: PortalOptions = {}) {
      let destination: PortalDestination;
      if ("coordinate" in to) {
        // A world named the way home.json names one: 37300:<its publisher's key>:<its name>.
        const target = portalTarget(to.coordinate);
        if (!target || "url" in target) throw new Error(`addPortal: "${to.coordinate}" isn't a world's coordinate (37300:<key>:<name>).`);
        destination = { naddr: encodeNaddr({ kind: WORLD_KIND, pubkey: target.pubkey, identifier: target.d, relays: config.relays.slice(0, 2) }) };
      } else destination = to;
      const gate = createPortalGate(destination, { label: opts.label, color: opts.color ?? layout.room.accent });
      const [x, y, z] = opts.position ?? [0, 0, -3];
      gate.group.position.set(x, y, z);
      gate.group.rotation.y = THREE.MathUtils.degToRad(opts.rotation ?? 0);
      scene.add(gate.group);
      gates.push(gate);
      ownGates.push(gate);
      // A portal added later (an exit that appears, say) gets its name looked up too.
      if (built) void namePortals([gate], config.relays, state);
      return gate;
    },
    usePortals(more) {
      for (const g of more) if (!gates.includes(g)) gates.push(g);
    },
  };
  const handle = await buildScene(ctx);
  built = true;
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
  controls.add({
    id: "home",
    section: "travel",
    icon: "home",
    hotbar: true,
    label: "Back to your lobby",
    short: "Home",
    hidden: () => !arrival.returnAirlock(),
    act: () => void portal.home({ xrSession: renderer.xr.getSession() }),
  });
  controls.addSection({
    id: "help",
    label: "Help",
    icon: "help",
    note: "Drag to look around. Walk with W, A, S, D, or point at the floor and select to step there. Select a doorway to see where it leads before you go. These controls are this world's own: your headset's or browser's own controls always get you out.",
  });

  // In a headset the page can't be seen, so the same controls go on a console in the scene.
  const xrConsole = createConsole(controls, { renderer, rig });
  scene.add(xrConsole.group);
  hooks.console = xrConsole;

  // ------------------------------------------------------------- input
  const raycaster = new THREE.Raycaster();
  // Signs are sprites, and a sprite can't be tested against a ray without
  // knowing the camera. Rays from a hand controller don't set it themselves.
  raycaster.camera = camera;
  const pointer = new THREE.Vector2(2, 2); // off-screen until the pointer moves
  // A portal that is hidden, or inside something hidden, can't be used.
  const shown = (g: PortalGate) => {
    for (let o: THREE.Object3D | null = g.group; o; o = o.parent) if (!o.visible) return false;
    return true;
  };
  hooks.step = (x, z) => {
    raycaster.ray.origin.copy(camera.getWorldPosition(new THREE.Vector3()));
    raycaster.ray.direction.set(x, 0, z).sub(raycaster.ray.origin).normalize();
    const spot = floorUnder();
    if (spot) stepTo(spot);
  };
  const targets = () => gates.filter(shown).map((g) => g.target);
  const gateFor = (object: THREE.Object3D | undefined) => gates.find((g) => g.target === object) ?? null;
  // ------------------------------------------------------------- moving
  // Where the visitor may stand is the scene's to say (walls, edges). Movement
  // of every kind asks first, so a scene blocks all of them in one place.
  const canStand = (x: number, z: number) => handle.canStand?.(x, z) ?? true;
  const headAt = new THREE.Vector3();
  /** Move the visitor's head towards (x, z) in a straight line, stopping at the first place they may not stand. */
  const moveTowards = (x: number, z: number) => {
    camera.getWorldPosition(headAt);
    const dx = x - headAt.x;
    const dz = z - headAt.z;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.1));
    let reached = 0;
    for (let i = 1; i <= steps; i++) {
      if (!canStand(headAt.x + (dx * i) / steps, headAt.z + (dz * i) / steps)) break;
      reached = i;
    }
    rig.position.x += (dx * reached) / steps;
    rig.position.z += (dz * reached) / steps;
  };
  // Stepping: point at the floor and select (click, tap, trigger or pinch) to
  // stand there. It is a jump, not a slide, which is what keeps it comfortable
  // in a headset, and it is the only way to move for a visitor with no keyboard.
  const stepping = handle.stepping !== false;
  const STEP_MAX = 5;
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const spotAt = new THREE.Vector3();
  const floorHit = new THREE.Vector3();
  /** Where the current ray meets the floor, no further than one step away. */
  const floorUnder = (): THREE.Vector3 | null => {
    if (!stepping || !raycaster.ray.intersectPlane(floor, spotAt)) return null;
    floorHit.copy(spotAt);
    camera.getWorldPosition(headAt);
    const dx = spotAt.x - headAt.x;
    const dz = spotAt.z - headAt.z;
    const far = Math.hypot(dx, dz);
    if (far < 0.3) return null;
    if (far > STEP_MAX) spotAt.set(headAt.x + (dx / far) * STEP_MAX, 0, headAt.z + (dz / far) * STEP_MAX);
    return spotAt;
  };
  const visible = (o: THREE.Object3D | null) => {
    for (; o; o = o.parent) if (!o.visible) return false;
    return true;
  };
  const stepTo = (spot: THREE.Vector3) => {
    // Pointing at a thing is not pointing at the floor behind it: if anything
    // solid is in the way, the scene's own handling of that thing stands.
    const toFloor = raycaster.ray.origin.distanceTo(floorHit);
    const inTheWay = raycaster.intersectObjects(scene.children, true).find((h) => (h.object as THREE.Mesh).isMesh && h.object !== reticle && visible(h.object));
    if (inTheWay && inTheWay.distance < toFloor - 0.05) return;
    moveTowards(spot.x, spot.z);
    state.steps = ((state.steps as number | undefined) ?? 0) + 1;
  };
  const reticle = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.28, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthTest: false }));
  reticle.rotation.x = -Math.PI / 2;
  reticle.renderOrder = 5;
  reticle.visible = false;
  scene.add(reticle);

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
    else {
      const spot = floorUnder();
      if (spot) stepTo(spot);
    }
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
      const gate = aimFrom(c); // leaves the ray pointing where this hand points
      const button = xrConsole.pick(raycaster);
      if (button) xrConsole.press(button);
      else if (gate) void go(gate);
      else {
        const spot = floorUnder();
        if (spot) stepTo(spot);
      }
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
      if (!shown(g)) continue;
      g.group.worldToLocal(local.copy(head));
      if (Math.abs(local.x) < PORTAL_WIDTH / 2 - 0.15 && local.y > 0 && local.y < PORTAL_HEIGHT && Math.abs(local.z) < 0.25) return g;
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
    camera.getWorldPosition(headAt);
    // Try the whole step, then each direction alone, so a visitor slides along a wall instead of sticking to it.
    if (canStand(headAt.x + step.x, headAt.z + step.z)) rig.position.add(step);
    else if (canStand(headAt.x + step.x, headAt.z)) rig.position.x += step.x;
    else if (canStand(headAt.x, headAt.z + step.z)) rig.position.z += step.z;
  };
  hooks.where = () => {
    const at = camera.getWorldPosition(new THREE.Vector3());
    return [Math.round(at.x * 100) / 100, Math.round(at.z * 100) / 100];
  };
  hooks.face = (degrees) => (rig.rotation.y = THREE.MathUtils.degToRad(degrees));
  hooks.teleport = (x, z) => {
    rig.position.x = x - camera.position.x;
    rig.position.z = z - camera.position.z;
  };

  // ------------------------------------------------------------- the room
  // Other visitors appear only after someone presses Join (spec §9.4).
  let presenceUpdate = (_dt: number) => {};
  if (config.world.capabilities?.includes("rooms")) {
    let refresh = () => {};
    const presence = createPresence({ scene, camera, rig, renderer, controllers, labelColor: "#f2f3f6", onChange: () => refresh() });
    ({ refresh } = addRoomControls(controls, presence, { onState: (s) => (state.room = s) }));
    presenceUpdate = (dt) => presence.update(dt);
    hooks.roomInfo = () => presence.info();
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
  state.vrSupported = await addViewControls(controls, { renderer, rig, camera, hud, onState: (s) => (state.xr = s) });

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
    reticle.visible = false;
    if (renderer.xr.isPresenting) {
      let button: string | null = null;
      for (const c of controllers) {
        if (!c.visible) continue;
        const gate = aimFrom(c);
        const onMenu = xrConsole.pick(raycaster);
        if (onMenu) {
          button = onMenu;
          continue;
        }
        aimed = gate ?? aimed;
        const spot = gate ? null : floorUnder();
        if (spot) {
          reticle.position.set(spot.x, 0.02, spot.z);
          reticle.visible = true;
        }
      }
      xrConsole.aim(button);
      const through = walkedInto();
      if (through) void go(through);
    } else {
      walk(dt);
      raycaster.setFromCamera(pointer, camera);
      aimed = gateFor(raycaster.intersectObjects(targets(), false)[0]?.object);
      renderer.domElement.style.cursor = aimed ? "pointer" : "grab";
    }
    for (const g of gates) g.aimed = g === aimed ? 1 : 0;
    for (const g of ownGates) g.update(t, dt);
    xrConsole.update(dt, camera, renderer.xr.isPresenting);
    // Say what is being pointed at, in the words on its sign.
    const sign = aimed ? String(aimed.group.userData.label ?? "A doorway") : "";
    controls.setTarget(aimed ? `${sign}${aimed.destination.url ? `, at ${new URL(aimed.destination.url).host}` : ""}` : "");
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
