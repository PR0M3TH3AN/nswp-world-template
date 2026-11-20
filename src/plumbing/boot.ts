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
import { checkPreviewBytes, cleanItemsRule, decodeNaddr, encodeNaddr, parseLayoutEvent, portalTarget, parseWorldEvent, queryRelays, verifyEvent, WORLD_KIND, type Layout, type PortalDestination } from "@nswp/core";
import { arrival, configure, portal, somethingBrought, takeBrought, watchBrought } from "nswp-sdk";
import { createPortalGate, PORTAL_HEIGHT, PORTAL_WIDTH, type PortalGate } from "nswp-sdk/home";
import { addBagControls, addItemControls, type ItemControls, createBag, createItems, createDoorRatings, signerNamed, worldPeople, worldSigner, addCameraControls, addPanelControls, addRoomControls, lookScale, createFps, type Fps, addSoundControls, createSounds, addJump, createFloorMarks, currentForm, DOOR_REACH, createStepPace, createStroll, reachOf, RUN, KEY_TURN, WALK_SPEED, TAP_REACH, addViewControls, capturePanorama, panoramaTexture, createConsole, createCrossing, createPanels, createPresence, createStay, createXrInput, type Camera, type GrabOptions, type Panels, type Presence, type XrConsole, type XrInput } from "nswp-sdk/three";
import { createControls, mountHud, type Controls } from "nswp-sdk/ui";
import site from "virtual:site";
import configJson from "../../world.json";
import type { BuildScene, PortalOptions, SceneContext, WorldConfig } from "./types.js";

interface TestHooks {
  marks?: () => { ring: [number, number] | null; dot: [number, number] | null; dots: number; turns: number };
  /** The way they are walking: each spot still ahead. */
  path?: () => number[][];
  jump?: { jump(): boolean; readonly height: number; readonly airborne: boolean };
  state: Record<string, unknown>;
  /** What this place sounds like: cues, its music, and the visitor's own. */
  sounds?: unknown;
  /** Game controls on a desk: the mouse looks, keys walk. */
  fps?: Fps;
  /** The menu on a flat screen. */
  hud?: { readonly open: boolean; setOpen(open: boolean): void };
  /** The visitor's camera: what it has taken. */
  camera?: Camera;
  /** What the visitor's hands are doing in a headset, as the input layer reads them. */
  input?: () => unknown;
  /** Where a crossing stands: arriving in the chamber, its doors opening, leaving, or none. */
  crossing?: () => string;
  portals(): { label: string; destination: PortalDestination; position: number[] }[];
  goThrough(index: number): Promise<void>;
  capturePreview(width?: number): Promise<{ base64: string; width: number; height: number; bytes: number }>;
  teleport(x: number, z: number): void;
  /** Turn the visitor to face this many degrees left of −Z. */
  face(degrees: number, pitch?: number): void;
  /** Items in play, for tests: what is in the air, this visitor's health, what their item shows. */
  play?: () => unknown;
  itemUse?: () => void;
  itemSecond?: () => void;
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
  /** The visitor's own panels: notes, pictures and video they hang here, and the keyboard drawn in a headset. */
  panels?: Panels;
  /** Terminals the owner brought from their home, when this is a world they are building. */
  brought?: { terminals(): unknown[]; restore(): Promise<void> };
  /** Where something named is: in the world, and as seen from the visitor's rig. */
  thing?: (name: string) => { world: number[]; local: number[] } | null;
  /** A spot on something flat, by how far across and down it is (0 to 1): where a button drawn on a panel is. */
  spot?: (name: string, u: number, v: number) => { local: number[]; screen: number[] } | null;
  screenOf?: (name: string) => number[] | null;
  /** Which way the visitor faces, in degrees left of -Z. */
  heading?: () => number;
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
  // The owner of this world, working on it, may have brought leave to open terminals on their own computer
  // (the NSWP repository's browser/bridge.md). It is taken out of the address at once, like the arrival context.
  // Nobody else can bring it: it is made in the owner's home, for this address, and their computer has to have
  // been told about this world too.
  const brought = somethingBrought() ? takeBrought() : null;
  watchBrought();
  const config = configJson as unknown as WorldConfig;
  // The same sign-in however a visitor came (NSWP-10, "One sign-in"): someone who opened this address themselves
  // is offered the signer this world names, which is BitLogin's unless world.json says another, or "" for none.
  configure({ defaultAirlock: config.airlock });
  try {
    configure({ defaultSigner: config.signer === undefined ? "https://bitlogin.network/" : config.signer || null });
  } catch {
    // Not an https address: no signer is offered. `npm run check` says so.
  }

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
  scene.background = new THREE.Color(config.sky ?? "#04070b");
  // The far plane is a long way off: the ground a home stands on runs to a horizon.
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 700);
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
  // A refresh is not an arrival: whoever was here is put back where they stood, facing the way they faced.
  // Someone changing this world refreshes it all day.
  const stay = createStay();
  const stood = context || brought?.fresh ? null : stay.before;
  if (stood) {
    rig.position.x = stood.x;
    rig.position.z = stood.z;
    rig.rotation.y = THREE.MathUtils.degToRad(stood.yaw);
  }
  state.stood = !!stood;
  const keepPlace = () => stay.keep({ x: rig.position.x, z: rig.position.z, yaw: THREE.MathUtils.radToDeg(rig.rotation.y), headset: renderer.xr.isPresenting });
  addEventListener("pagehide", keepPlace);
  setInterval(keepPlace, 1000);

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
  // world.json's `controls` says how much room they take; a scene can change that as it goes.
  const controls = createControls({ title: config.world.title, address: new URL(config.world.url).host, theme: { accent: layout.room.accent }, ...config.controls });
  const hud = mountHud(controls);
  hooks.controls = controls;
  hooks.hud = hud;
  // Sound: the kit's cues unless world.json names this world's own, the place's music, and the visitor's own
  // songs. The volumes are the visitor's, kept for this site.
  const sounds = createSounds({ context: THREE.AudioContext.getContext() as unknown as AudioContext, seed: config.world.title, kit: "sounds/kit/", theme: config.sounds ?? null });
  addSoundControls(controls, sounds);
  hooks.sounds = sounds;

  // ------------------------------------------------------------- your scene
  const gates: PortalGate[] = [];
  const ownGates: PortalGate[] = []; // made by addPortal, so animated here
  let built = false;
  // Settles when the world is drawn and ready to be walked into.
  let worldOpened = () => {};
  const opened = new Promise<void>((resolve) => (worldOpened = resolve));
  // Hands in a headset are set up further down, once there is something to point with.
  let input: XrInput | null = null;
  const toHold: [THREE.Object3D, GrabOptions | undefined][] = [];
  /**
   * What a door looks into: a 360° picture of the world it leads to, seen through the doorway (spec §5.8). Only
   * a picture this site ships itself is ever shown (doors/, made by `npm run doors`), so nothing is asked of the
   * world a door leads to until someone goes there. It is checked against its hash before it is drawn, and a
   * door with none keeps its field of light.
   */
  const lookedThrough = new Set<PortalGate>();
  const doorWindows: THREE.Object3D[] = [];
  const showThrough = (which: PortalGate[]) => {
    for (const gate of which) {
      if (lookedThrough.has(gate) || !gate.destination.naddr) continue;
      let hash: string | undefined;
      try {
        const to = decodeNaddr(gate.destination.naddr);
        const coordinate = to.kind === WORLD_KIND ? `${WORLD_KIND}:${to.pubkey}:${to.identifier}` : "";
        hash = site.doors?.[coordinate];
        // What kind of place it leads to, on its sign: its own word, noted when `npm run doors` last asked.
        gate.setCategory(site.kinds?.[coordinate]);
        // And whether items are part of play there (NSWP-17): told on the sign, before anyone goes in.
        gate.setItems(site.carried?.[coordinate]);
      } catch {
        /* not an address this page can read */
      }
      if (!hash) continue;
      lookedThrough.add(gate);
      const sha256 = hash;
      void (async () => {
        try {
          const res = await fetch(new URL(`doors/${sha256}.webp`, document.baseURI));
          if (!res.ok) return;
          const bytes = new Uint8Array(await res.arrayBuffer());
          if (!checkPreviewBytes({ url: res.url, type: "pano", sha256 }, bytes).ok) return;
          const image = new Image();
          const address = URL.createObjectURL(new Blob([bytes], { type: "image/webp" }));
          image.src = address;
          await image.decode();
          URL.revokeObjectURL(address);
          doorWindows.push(gate.showThrough(panoramaTexture(image)));
          state.doorsShown = ((state.doorsShown as number | undefined) ?? 0) + 1;
        } catch {
          /* the doorway keeps its field of light */
        }
      })();
    }
  };
  const ctx: SceneContext = {
    grabbable(object, options) {
      if (input) input.grabbable(object, options);
      else toHold.push([object, options]);
    },
    scene,
    camera,
    rig,
    renderer,
    config,
    layout,
    controls,
    sounds,
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
      // A portal added later (an exit that appears, say) gets its name looked up too, and its picture.
      if (built) {
        void namePortals([gate], config.relays, state);
        showThrough([gate]);
      }
      return gate;
    },
    usePortals(more) {
      for (const g of more) if (!gates.includes(g)) gates.push(g);
      if (built) showThrough(more);
    },
  };
  const handle = await buildScene(ctx);
  built = true;
  showThrough(gates);
  hooks.portals = () => gates.map((g) => ({ label: g.group.userData.label ?? "", destination: g.destination, position: g.group.getWorldPosition(new THREE.Vector3()).toArray() }));
  void namePortals(gates, config.relays, state);

  // ------------------------------------------------------------- leaving
  // Every way out goes through an Airlock: a plain page that shows the real
  // address and waits for the visitor to agree (spec §6.2).
  // Leaving and arriving happen in the kit's chamber: the same small room at both ends of every trip. It is
  // scenery, and has nothing in it to press: the visitor's Airlock is what checks where a door really leads.
  // The crossing's room is drawn over everything where it stands. The visitor's own hands and console are drawn
  // over it: they are added to this as they are made.
  const keptInSight: THREE.Object3D[] = [rig];
  const crossing = createCrossing({ scene, camera, accent: controls.theme.accent, motion: () => controls.theme.motion, keep: keptInSight });
  hooks.crossing = () => crossing.state;
  const hostOf = (url: string | undefined) => {
    try {
      return url ? new URL(url).host : "";
    } catch {
      return "";
    }
  };
  // Whether the visitor is in the room here, and heard: it goes with them, so the next place needn't ask again.
  let travelling = (): { joined: boolean; mic: boolean } => ({ joined: false, mic: false });
  let movingNow = (): "intense" | "casual" => "casual";
  let stopWalking = () => {};
  /**
   * Through a door. Chosen from where they stand (a click, a trigger, the menu), the crossing's room comes up round
   * them first, naming where the door says it leads. Walked into, there is nothing to bring up: they are already
   * going through it, so they go. Either way their Airlock shows the real address next.
   */
  const go = async (gate: PortalGate, how: "chosen" | "walked" = "chosen") => {
    if (state.leaving) return;
    state.leaving = true;
    state.left = how;
    stopWalking();
    sounds.play("cross");
    if (how === "chosen") await crossing.leave({ title: String(gate.group.userData.label ?? "another place"), address: hostOf(gate.destination.url) });
    document.body.classList.add("leaving");
    await portal.go(gate.destination, { xrSession: renderer.xr.getSession(), ...travelling(), moving: movingNow() });
  };
  const goHome = async () => {
    const back = arrival.returnAirlock();
    if (!back || state.leaving) return;
    state.leaving = true;
    sounds.play("cross");
    await crossing.leave({ title: "home", address: hostOf(back) });
    document.body.classList.add("leaving");
    await portal.home({ xrSession: renderer.xr.getSession(), ...travelling(), moving: movingNow() });
  };
  const goToDoors = async () => {
    const back = arrival.returnAirlock();
    if (!back || state.leaving) return;
    state.leaving = true;
    sounds.play("cross");
    await crossing.leave({ title: "your doors", address: hostOf(back) });
    document.body.classList.add("leaving");
    await portal.doors({ xrSession: renderer.xr.getSession(), ...travelling(), moving: movingNow() });
  };
  hooks.goThrough = async (i) => {
    const gate = gates[i];
    if (gate) await go(gate);
  };

  // The way home, offered when the visitor came from a client that said where home is. Home is wherever their
  // own client starts them: its own room, or a world of theirs they chose. When that world is this one, the way
  // home leads nowhere new, and isn't offered.
  controls.add({
    id: "home",
    section: "travel",
    icon: "home",
    hotbar: true,
    label: "Go home",
    short: "Home",
    hidden: () => !arrival.returnAirlock() || arrival.atHome(),
    act: () => void goHome(),
  });
  // A world that says it can be someone's home owes them the way to their doors (NSWP-07): the place their own
  // client keeps the worlds they saved. It stands where the way home stands in every other world, for the visitor
  // whose home this is: for anyone else the way home leads there already, and one key does one thing everywhere.
  if (config.world.capabilities?.includes("home")) {
    controls.add({
      id: "doors",
      section: "travel",
      icon: "door",
      hotbar: true,
      label: "Your doors",
      short: "Doors",
      hidden: () => !arrival.returnAirlock() || !arrival.atHome(),
      act: () => void goToDoors(),
    });
  }
  state.atHome = arrival.atHome();
  controls.addSection({
    id: "help",
    label: "Help",
    icon: "help",
    note: "Drag to look around. Walk with W, A, S, D or the up and down arrows; the left and right arrows turn you. Or point at the floor and select to step there: twice to run. Shift runs and Space jumps. The key left of 1 brings these controls up in any world, whatever is on screen; on a touch screen, hold two fingers still. Select a doorway to see where it leads before you go. These controls are this world's own: your headset's or browser's own controls always get you out.",
  });

  // In a headset the page can't be seen, so the same controls go on a console in the scene.
  const xrConsole = createConsole(controls, { renderer, rig });
  keptInSight.push(xrConsole.group);
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
  /** Which door a pointed-at thing is, whether or not it is near enough to choose. */
  const anyGateFor = (object: THREE.Object3D | undefined) => gates.find((g) => g.target === object) ?? null;
  const gateAt = new THREE.Vector3();
  const eyesAt = new THREE.Vector3();
  /** How far the visitor is from a door, over the floor. */
  const gateFar = (gate: PortalGate) => {
    camera.getWorldPosition(eyesAt);
    gate.group.getWorldPosition(gateAt);
    return Math.hypot(gateAt.x - eyesAt.x, gateAt.z - eyesAt.z);
  };
  /**
   * Which door a pointed-at thing is, if it is near enough to choose from where they stand: within ten feet (the
   * kit's DOOR_REACH). A door across the place is not lit and can't be gone through by a press, so nobody leaves by
   * a stray click on one. Walking into a doorway goes through whatever this says.
   */
  const gateFor = (object: THREE.Object3D | undefined) => {
    const gate = anyGateFor(object);
    return gate && gateFar(gate) <= DOOR_REACH ? gate : null;
  };
  // ------------------------------------------------------------- moving
  // Where the visitor may stand is the scene's to say (walls, edges). Movement
  // of every kind asks first, so a scene blocks all of them in one place.
  const canStand = (x: number, z: number) => crossing.allows(x, z) && (handle.canStand?.(x, z) ?? true);
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
  // A step in a headset lands at once, and the next waits as long as running there would have taken (the kit's
  // pace): nobody covers ground faster than a run, whatever they hold or wear.
  const pace = createStepPace();
  // On a flat screen a tap is a walk at the keys' pace, to a spot a few steps off at most (the kit's stroll).
  const stroll = createStroll({
    where: () => {
      camera.getWorldPosition(headAt);
      return [headAt.x, headAt.z];
    },
    canStand,
    move: (dx, dz) => {
      rig.position.x += dx;
      rig.position.z += dz;
    },
    speed: 2,
    onBlocked: () => sounds.bump(),
  });
  stopWalking = () => stroll.stop();
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
    const most = renderer.xr.isPresenting ? STEP_MAX : TAP_REACH;
    if (far > most) spotAt.set(headAt.x + (dx / far) * most, 0, headAt.z + (dz / far) * most);
    return spotAt;
  };
  const visible = (o: THREE.Object3D | null) => {
    for (; o; o = o.parent) if (!o.visible) return false;
    return true;
  };
  /**
   * Whether the ray reaches the floor it was last pointed at. Pointing at a thing is not pointing at the floor
   * behind it: if anything solid is in the way, the scene's own handling of that thing stands.
   */
  const floorIsClear = () => {
    const toFloor = raycaster.ray.origin.distanceTo(floorHit);
    const inTheWay = raycaster.intersectObjects(scene.children, true).find((h) => (h.object as THREE.Mesh).isMesh && h.object !== reticle && visible(h.object));
    return !(inTheWay && inTheWay.distance < toFloor - 0.05);
  };
  // Where a press would take them, where they are going and the way there: drawn for this visitor and nobody else.
  const marks = createFloorMarks(controls.theme.accent);
  scene.add(marks.group);
  hooks.marks = () => marks.info();
  hooks.path = () => stroll.path.map(([x, z]) => [Math.round(x * 100) / 100, Math.round(z * 100) / 100]);
  const stepTo = (spot: THREE.Vector3) => {
    if (!floorIsClear()) return;
    camera.getWorldPosition(headAt);
    // In a headset a step is a jump, which is what sits well there, at the pace of someone running: a press that
    // comes too soon does nothing, and the ring on the floor is dim until one would. On a flat screen it is
    // always a walk, on a phone as at a desk, with motion on or off: the same walk the keys make.
    if (renderer.xr.isPresenting) {
      if (!pace.take(Math.hypot(spot.x - headAt.x, spot.z - headAt.z))) return;
      moveTowards(spot.x, spot.z);
    } else stroll.tap(floorHit.x, floorHit.z); // where they pressed: standing, a walk there; walking, the path goes on from its end
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
  let downAt = 0;
  const setPointer = (e: PointerEvent) => pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  // The visitor's own panels, set up further down. One taken by its bar is dragged, and the view stays still.
  let panels: Panels | null = null;
  // The room, once there is one: someone's picture over their head is pressed like anything else pointed at.
  let roomPresence: Presence | null = null;
  let itemControls: ItemControls | null = null;
  let panelDrag = false;
  // Game controls, for a visitor who turned them on: the mouse looks, keys walk, F uses. While they are on, the
  // clicks and drags below stand down.
  let fps: Fps | null = null;
  const gameControls = () => !!fps?.enabled && !renderer.xr.isPresenting;
  /** Which of the two ways the visitor is moving now, on the device they are using: it goes with them through a door. */
  movingNow = () => ((renderer.xr.isPresenting ? input?.intense : fps?.enabled) ? "intense" : "casual");
  /** Use what the middle of the view points at: a panel, or a door. */
  const use = () => {
    pointer.set(0, 0);
    raycaster.setFromCamera(pointer, camera);
    const onPanel = panels?.pick(raycaster);
    if (onPanel) return void panels!.press(onPanel);
    // With something in hand that does something, a tap is its first press, sent where they tapped. A press held
    // is still how they walk, choose someone or go through a door.
    if (itemControls?.tap(raycaster.ray, performance.now() - downAt)) return;
    // Someone's picture, over their head: pressing it chooses them.
    if (roomPresence?.pressAt(raycaster)) return;
    // Moving the intense way, a door is gone through by walking into it and no other way.
  };
  fps = createFps({ dom: renderer.domElement, camera, rig, controls, hud, canStand, presenting: () => renderer.xr.isPresenting, onUse: use, onBlocked: () => sounds.bump(), arrived: context?.moving === "intense" && !context.immersive });
  hooks.fps = fps;
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (gameControls()) return;
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    panelDrag = !renderer.xr.isPresenting && !!panels?.pointer("down", raycaster);
    dragging = !panelDrag;
    lastX = e.clientX;
    moved = 0;
    downAt = performance.now();
  });
  addEventListener("pointerup", (e) => {
    dragging = false;
    if (panelDrag) {
      panelDrag = false;
      setPointer(e);
      raycaster.setFromCamera(pointer, camera);
      panels?.pointer("up", raycaster);
      return;
    }
    if (moved > 6 || renderer.xr.isPresenting || gameControls() || e.target !== renderer.domElement) return;
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    // A panel is in front of whatever is behind it.
    const onPanel = panels?.pick(raycaster);
    if (onPanel) return void panels!.press(onPanel);
    if (roomPresence?.pressAt(raycaster)) return;
    const any = anyGateFor(raycaster.intersectObjects(targets(), false)[0]?.object);
    if (any && gateFar(any) <= DOOR_REACH) void go(any);
    else if (any) {
      // A door too far off to choose: a press on it is a few steps towards it, like a press on the floor in front of it.
      any.group.getWorldPosition(gateAt);
      camera.getWorldPosition(headAt);
      stroll.to(...reachOf(headAt.x, headAt.z, gateAt.x, gateAt.z));
    } else {
      const spot = floorUnder();
      if (spot) stepTo(spot);
    }
  });
  renderer.domElement.addEventListener("pointerleave", () => pointer.set(2, 2));
  addEventListener("pointermove", (e) => {
    if (dragging && !renderer.xr.isPresenting) {
      rig.rotation.y += (e.clientX - lastX) * 0.005 * lookScale();
      moved += Math.abs(e.clientX - lastX);
      lastX = e.clientX;
    }
    if (!gameControls()) setPointer(e);
    if (panelDrag) {
      raycaster.setFromCamera(pointer, camera);
      panels?.pointer("move", raycaster);
    }
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
      if (input?.claimed(i)) return; // that pinch picked something up; it wasn't a press
      state.lastSelect = i;
      const gate = aimFrom(c); // leaves the ray pointing where this hand points
      // While the keyboard is up it is in front of everything, the console's own button included.
      const key = panels?.keyboard.pick(raycaster) ?? null;
      const button = key ? null : xrConsole.pick(raycaster);
      const onPanel = key ?? (button ? null : (panels?.pick(raycaster) ?? null));
      // The hand that holds something that does something: its trigger is the item's, on anything but the console.
      if (!button && !key && !onPanel && itemControls?.trigger(i)) return void input?.pulse(i, 0.4, 25);
      const person = button || onPanel ? null : (roomPresence?.personAt(raycaster) ?? null);
      if (button || gate || onPanel || person) input?.pulse(i, 0.5, 30);
      if (button) xrConsole.press(button);
      else if (onPanel) panels!.press(onPanel);
      else if (person) roomPresence?.pressAt(raycaster);
      else if (gate) void go(gate);
      else {
        const spot = floorUnder();
        if (spot) stepTo(spot);
      }
    });
    rig.add(c);
    controllers.push(c);
  }
  // Sticks, grips and buttons, for visitors who have them. They add to pointing and selecting and never
  // replace it. A stick's step is the same step as a select on the floor.
  input = createXrInput({
    renderer,
    scene,
    rig,
    // They left a headset moving the intense way: the same here.
    arrivedIntense: context?.moving === "intense" && !!context.immersive,
    camera,
    canStand,
    controls,
    pace,
    stepFrom: (i) => {
      aimFrom(controllers[i]!);
      const spot = floorUnder();
      if (spot) stepTo(spot);
    },
    onMenu: () => xrConsole.setOpen(!xrConsole.open),
    onJump: () => void jump.jump(),
    // The visitor's own way to their controls, whatever this world is showing: the menu button held (NSWP-11).
    onSummon: () => xrConsole.setOpen(true),
  });
  for (const [object, options] of toHold) input.grabbable(object, options);
  hooks.input = () => input!.info();

  // ------------------------------------------------------------- panels
  // Notes, pictures and video a visitor hangs for themselves, with a keyboard drawn in the headset and a way to
  // speak instead of typing. They are the visitor's own: kept in their browser, and never shown to anyone else here.
  panels = createPanels({ scene, camera, accent: controls.theme.accent, input, keep: `nswp-world:${location.pathname}:panels`, session: () => renderer.xr.getSession() });
  addPanelControls(controls, panels, { presenting: () => renderer.xr.isPresenting, kept: true });
  hooks.panels = panels;
  if (brought) {
    // The terminal's own code is fetched only now, and only for the owner who brought one.
    const { addBroughtTerminals } = await import("nswp-sdk/terminal");
    hooks.brought = addBroughtTerminals({ brought, controls, panels, presenting: () => renderer.xr.isPresenting, accent: controls.theme.accent });
  }
  state.brought = !!brought;
  hooks.thing = (name) => {
    const object = scene.getObjectByName(name);
    const world = object ? object.getWorldPosition(new THREE.Vector3()) : (panels?.pointOf(name) ?? null);
    return world ? { world: world.toArray(), local: rig.worldToLocal(world.clone()).toArray() } : null;
  };
  hooks.spot = (name, u, v) => {
    const object = scene.getObjectByName(name);
    if (!object) return null;
    const world = object.localToWorld(new THREE.Vector3(u - 0.5, 0.5 - v, 0));
    const at = world.clone().project(camera);
    return { local: rig.worldToLocal(world.clone()).toArray(), screen: [Math.round(((at.x + 1) / 2) * innerWidth), Math.round(((1 - at.y) / 2) * innerHeight)] };
  };
  hooks.screenOf = (name) => {
    const object = scene.getObjectByName(name);
    if (!object) return null;
    const at = object.getWorldPosition(new THREE.Vector3()).project(camera);
    return at.z > 1 ? null : [Math.round(((at.x + 1) / 2) * innerWidth), Math.round(((1 - at.y) / 2) * innerHeight)];
  };
  hooks.heading = () => Math.round(THREE.MathUtils.radToDeg(rig.rotation.y) * 10) / 10;

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

  // Without a headset: W, A, S, D, and the arrow keys. Up and down walk; left and right turn. A and D step to the side.
  const keys = new Set<string>();
  addEventListener("keydown", (e) => {
    if (!(e.target instanceof HTMLButtonElement)) keys.add(e.code);
  });
  addEventListener("keyup", (e) => keys.delete(e.code));
  addEventListener("blur", () => keys.clear());
  const step = new THREE.Vector3();
  const walk = (dt: number) => {
    const forward = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
    const strafe = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
    const turn = (keys.has("ArrowLeft") ? 1 : 0) - (keys.has("ArrowRight") ? 1 : 0);
    if (turn) {
      stroll.stop(); // a walk a tap began turns them its own way
      rig.rotation.y += turn * KEY_TURN * dt;
    }
    if (!forward && !strafe) return;
    stroll.stop(); // the keys take over from a walk a tap began
    // The kit's own walking pace, and Shift runs, moving the casual way as it does the intense way.
    const pace = WALK_SPEED * (keys.has("ShiftLeft") || keys.has("ShiftRight") ? RUN : 1);
    step.set(strafe, 0, -forward).normalize().multiplyScalar(pace * dt).applyAxisAngle(THREE.Object3D.DEFAULT_UP, rig.rotation.y);
    camera.getWorldPosition(headAt);
    // Try the whole step, then each direction alone, so a visitor slides along a wall instead of sticking to it.
    if (canStand(headAt.x + step.x, headAt.z + step.z)) rig.position.add(step);
    else if (canStand(headAt.x + step.x, headAt.z)) rig.position.x += step.x;
    else if (canStand(headAt.x, headAt.z + step.z)) rig.position.z += step.z;
    else sounds.bump();
  };
  hooks.where = () => {
    const at = camera.getWorldPosition(new THREE.Vector3());
    return [Math.round(at.x * 100) / 100, Math.round(at.z * 100) / 100];
  };
  hooks.face = (degrees, pitch = 0) => {
    rig.rotation.y = THREE.MathUtils.degToRad(degrees);
    camera.rotation.x = THREE.MathUtils.degToRad(pitch);
  };
  hooks.teleport = (x, z) => {
    rig.position.x = x - camera.position.x;
    rig.position.z = z - camera.position.z;
  };

  // ------------------------------------------------------------- the room
  // Other visitors appear only after someone presses Join (spec §9.4).
  let presenceUpdate = (_dt: number) => {};
  let selfLook: (() => ReturnType<Presence["selfLook"]>) | undefined;
  let sayRecording: ((on: boolean) => void) | undefined;
  if (config.world.capabilities?.includes("rooms")) {
    let refresh = () => {};
    // A visitor is drawn to the others as they chose to arrive: by name,
    // wearing their look, or plain. Going by name means their own client signed
    // a pass for this site (NSWP-10); this world never sees their key. A scene
    // can dress everyone its own way with `figureStyle`.
    // What this world does with the things visitors carry (NSWP-17): `"items": "allowed"` or `"play"` in
    // world.json. Left out, nothing carried is drawn here and no model is fetched from anywhere.
    const itemsRule = cleanItemsRule((config.world as { items?: unknown }).items);
    const items = createItems({ relays: config.relays, ...(itemsRule === "none" ? { fetchBytes: async () => null } : {}) });
    // Where items are drawn, an item's own logic runs too, in its locked box (`item-box.html`, written by the build).
    const presence = createPresence({ scene, camera, rig, renderer, controllers, ...(itemsRule === "none" ? {} : { items, itemsRule: () => itemsRule, itemScripts: true, sounds, theme: () => ({ accent: controls.theme.accent, motion: controls.theme.motion }) }), labelColor: "#f2f3f6", look: () => arrival.look(), identity: () => arrival.identity(), figureStyle: handle.figureStyle, onChange: () => (refresh(), itemControls?.refresh()) });
    // What is in their hand, pressed: on the bar, by the mouse and R at a desk, by the trigger in a headset.
    itemControls = addItemControls(controls, { play: () => presence.play, holdingHand: () => presence.holdingHand, dom: renderer.domElement, sight: (on) => presence.setSighting(on) });
    hooks.play = () => presence.play?.info() ?? null;
    hooks.itemUse = () => presence.play?.use();
    hooks.itemSecond = () => presence.play?.second();
    roomPresence = presence;
    // Their bag, and the one thing in their hand. A world looks through its visitor's bag and can't change it:
    // that is done at their own client. A guest has no bag, and no tab.
    if (signerNamed()) {
      const me = () => (worldSigner().state === "unlocked" ? worldSigner().pubkey : null);
      const bagging = addBagControls(controls, {
        bag: createBag({ me, relays: config.relays }),
        items,
        me,
        rule: () => itemsRule,
        holding: () => presence.holding,
        hold: async (item, tints) => {
          const done = await presence.setHolding(item, tints);
          state.holding = presence.holding || null;
          return done;
        },
        // A colour they chose for the thing in their hand shows on it at once, and the room is told.
        tinted: (item, tints) => void (presence.holding === item && presence.setTints(tints)),
        keyboard: () => panels?.keyboard ?? null,
        presenting: () => renderer.xr.isPresenting,
      });
      worldSigner().onChange(() => bagging.refresh());
    }
    // A visitor who was in the room where they came from stays joined here: their own client says so (NSWP-03).
    ({ refresh, travelling } = addRoomControls(controls, presence, { onState: (s) => (state.room = s), arrived: context, panels, sounds, presenting: () => renderer.xr.isPresenting, ...(config.sharedMusic === false ? { sharedMusic: false } : {}) }));
    // What the people this visitor follows thought of where each door leads, on the door's sign (NSWP-13). Their
    // own rating always counts; the people they follow do where they have let this world see who that is. Asked of
    // relays by world, never by person; for a guest nothing is asked or shown. Only for a door whose address
    // `npm run doors` has noted: without it, a rating the place asked for itself couldn't be told from the rest.
    const rated: { gate: PortalGate; world: string; url: string }[] = [];
    for (const gate of gates) {
      try {
        const to = gate.destination.naddr ? decodeNaddr(gate.destination.naddr) : null;
        const world = to && to.kind === WORLD_KIND ? `${WORLD_KIND}:${to.pubkey}:${to.identifier}` : "";
        const url = site.places?.[world];
        if (world && url) rated.push({ gate, world, url });
      } catch {
        /* not an address this page can read */
      }
    }
    if (rated.length && signerNamed()) {
      const signedIn = () => worldSigner().state === "unlocked";
      const doorRatings = createDoorRatings({
        doors: rated.map((r) => ({ world: r.world, url: r.url })),
        me: () => (signedIn() ? worldSigner().pubkey : null),
        counted: () => (signedIn() && worldSigner().more.includes("follows") ? worldPeople().follows() : null),
        relays: config.relays,
      });
      const paint = () => {
        for (const r of rated) r.gate.setRating(doorRatings.mark(r.world));
        state.rated = Object.fromEntries(rated.map((r) => [r.world, doorRatings.mark(r.world)]));
      };
      const look = () => {
        if (signedIn() && worldSigner().more.includes("follows") && worldPeople().follows() === null) void worldPeople().load();
        void doorRatings.load();
      };
      doorRatings.onChange(paint);
      worldPeople().onChange(paint);
      worldSigner().onChange(look);
      look();
    }
    // Shut in the crossing's room, nobody else is in it with the visitor, wherever they happen to be standing.
    presenceUpdate = (dt) => {
      presence.setHidden(crossing.state !== "none");
      presence.update(dt);
    };
    // How loud other people are is the visitor's to set, with the rest of their volumes.
    sounds.onChange((levels) => presence.setVolume(levels.off ? 0 : levels.voices));
    hooks.roomInfo = () => presence.info();
    selfLook = () => presence.selfLook();
    sayRecording = (on) => presence.setRecording(on);
  }

  // ------------------------------------------------------------- the camera
  // Pictures, selfies and short clips, saved to the visitor's own device.
  // While a clip is recorded, the others in the room are shown that it is.
  hooks.camera = addCameraControls(controls, {
    renderer,
    scene,
    camera,
    ...(selfLook ? { look: selfLook } : {}),
    ...(sayRecording ? { recording: sayRecording } : {}),
    hide: () => [xrConsole.group, reticle, ...(handle.hideFromPreview ?? [])],
    name: config.world.title,
  });

  // ------------------------------------------------------------- preview
  // A 360° picture from the main entrance, for doors that lead here (spec §5.8).
  hooks.capturePreview = async (width = 2048) => {
    const main = config.entryPoints["main-entrance"] ?? entry;
    const blob = await capturePanorama(renderer, scene, new THREE.Vector3(main.position[0], main.position[1] + 1.6, main.position[2]), { width, hide: [...(handle.hideFromPreview ?? []), ...doorWindows] });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { base64: btoa(binary), width, height: width / 2, bytes: bytes.length };
  };

  // ------------------------------------------------------------- VR
  // Someone who came through an Airlock starts in the chamber, and its doors open when the world is ready. If they
  // left a headset session to get here, the one thing asked of them is whether to go back into one.
  // The same is offered to someone whose headset session a refresh ended, and to an owner who came from their home
  // in a headset to work here.
  const backToHeadset = !!context?.immersive || !!stood?.headset || !!brought?.immersive;
  let offered = backToHeadset;
  if (context) {
    camera.updateMatrixWorld(true);
    crossing.arrive({ title: config.world.title, address: location.host, ready: opened, hold: () => offered });
  }
  state.vrSupported = await addViewControls(controls, {
    renderer,
    rig,
    camera,
    hud,
    onState: (s) => (state.xr = s),
    ...(backToHeadset ? { arrived: { title: config.world.title } } : {}),
    onOffer: (showing) => (offered = showing),
    // Who they are and how they look are their own client's to keep. They leave by the crossing's room, as through
    // any door, and come back the same way: in the room they were in, moving as they were.
    leaving: async (to) => {
      state.leaving = true;
      stopWalking();
      sounds.play("cross");
      await crossing.leave(to);
      document.body.classList.add("leaving");
      return { ...travelling(), moving: movingNow() };
    },
  });
  if (!state.vrSupported) offered = false;

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // ------------------------------------------------------------- each frame
  const startedAt = performance.now();
  let last = 0;
  let wasBusy = false;
  const movedFrom = rig.position.clone();
  let hoverKept: [number, number] | null = null;
  let hoverTick = 0;
  // A jump, the same however they are moving: Space, the Jump control where there is no keyboard, A or X in a headset.
  const floorY = rig.position.y;
  const jump = addJump(controls, { presenting: () => renderer.xr.isPresenting, sounds, hud, busy: () => !!panels?.keyboard.open });
  hooks.jump = jump;
  renderer.setAnimationLoop(() => {
    const t = (performance.now() - startedAt) / 1000;
    const dt = Math.min(t - last, 0.1);
    last = t;
    // Steps are made from how far the visitor was moved, not from how their head sways, and not while they are in the air.
    if (state.ready && !jump.airborne) sounds.moved(Math.hypot(rig.position.x - movedFrom.x, rig.position.z - movedFrom.z));
    movedFrom.copy(rig.position);
    rig.position.y = floorY + jump.update(dt);
    let aimed: PortalGate | null = null;
    reticle.visible = false;
    input!.update(dt);
    panels!.update(t, dt);
    // The keyboard and the library's board come up where the console is: it steps aside for them.
    const busy = panels!.keyboard.open || panels!.library.showing;
    if (busy && !wasBusy) xrConsole.setOpen(false);
    wasBusy = busy;
    crossing.update(t, dt);
    let panelAimed: string | null = null;
    let hover: [number, number] | null = null;
    let going: readonly (readonly [number, number])[] | null = null;
    if (renderer.xr.isPresenting) {
      let button: string | null = null;
      for (const c of controllers) {
        if (!c.visible) continue;
        const gate = aimFrom(c);
        const key = panels!.keyboard.pick(raycaster);
        if (key) {
          panelAimed = key;
          continue;
        }
        const onMenu = xrConsole.pick(raycaster);
        if (onMenu) {
          button = onMenu;
          continue;
        }
        const onPanel = panels!.pick(raycaster);
        if (onPanel) {
          panelAimed = onPanel;
          continue;
        }
        aimed = gate ?? aimed;
        const spot = gate ? null : floorUnder();
        if (spot) {
          reticle.position.set(spot.x, 0.02, spot.z);
          reticle.visible = true;
          // Dim while the last step is still being paid for: a press now would do nothing.
          (reticle.material as THREE.MeshBasicMaterial).opacity = pace.ready ? 0.8 : 0.22;
        }
      }
      xrConsole.aim(button);
    } else {
      // Game controls have the visitor's movement when they are on, and aim from the middle of the view.
      if (fps!.update(dt)) pointer.set(0, 0);
      else {
        walk(dt);
        stroll.update(dt);
        // They face the way they walk, so the next press ahead is a press where they are looking. Not while they
        // are turning the view themselves.
        if (stroll.going && !dragging) rig.rotation.y = stroll.face(rig.rotation.y, dt);
      }
      raycaster.setFromCamera(pointer, camera);
      panelAimed = panels!.pick(raycaster);
      aimed = panelAimed ? null : gateFor(raycaster.intersectObjects(targets(), false)[0]?.object);
      // Moving the intense way, the pointer's picture is the kit's to hide: the middle of the view is what points.
      if (!fps!.enabled) renderer.domElement.style.cursor = aimed || panelAimed ? "pointer" : "grab";
      // The casual way, with a pointer that hovers: a ring on the floor where a press would take them. With a finger
      // there is nothing to hover with, so only where they are going is marked.
      const mayHover = !fps!.enabled && !dragging && !panelAimed && !aimed && Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1 && currentForm() !== "touch";
      if (!mayHover) hoverKept = null;
      else if (hoverTick++ % 3 === 0) {
        // Looked for every third frame: finding what is in the way means looking at everything in the place.
        const spot = floorUnder();
        // Where a press would lead: from their feet standing, from the end of the path they are walking.
        const led = spot ? stroll.reach(floorHit.x, floorHit.z) : null;
        hoverKept = led && floorIsClear() && canStand(led[0], led[1]) ? led : null;
      }
      hover = hoverKept;
      going = fps!.enabled ? null : stroll.path;
    }
    camera.getWorldPosition(headAt);
    marks.update({ hover, from: [headAt.x, headAt.z], path: going, t });
    // Walking into a doorway goes through it, on foot or in a headset, with nothing brought up first.
    const through = state.ready ? walkedInto() : null;
    if (through) void go(through, "walked");
    panels!.aim(panelAimed);
    for (const g of gates) g.aimed = g === aimed ? 1 : 0;
    for (const g of ownGates) g.update(t, dt);
    xrConsole.update(dt, camera, renderer.xr.isPresenting);
    if (panels!.keyboard.open) xrConsole.group.visible = false;
    // Say what is being pointed at, in the words on its sign.
    const sign = aimed ? String(aimed.group.userData.label ?? "A doorway") : "";
    controls.setTarget(aimed ? `${sign}${aimed.destination.url ? `, at ${new URL(aimed.destination.url).host}` : ""}` : "");
    presenceUpdate(dt);
    handle.update?.(t, dt);
    renderer.render(scene, camera);
  });
  state.portalCount = gates.length;
  // Out of a door, if they came through one. A browser may hold this back until their first touch.
  if (context) sounds.play("arrive");
  state.ready = true;
  worldOpened();
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
