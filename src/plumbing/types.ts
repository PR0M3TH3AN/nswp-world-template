/** What your scene is given, and what it hands back. */
import type * as THREE from "three";
import type { Arrival, Layout, PortalDestination } from "@nswp/core";
import type { PortalGate } from "nswp-sdk/home";
import type { FigureStyle, GrabOptions, Sounds, SoundTheme } from "nswp-sdk/three";
import type { Controls, Corner, Presence, UiKeys } from "nswp-sdk/ui";

/** world.json */
export interface WorldConfig {
  world: { d: string; title: string; url: string; summary?: string; modes?: string[]; capabilities?: string[]; audience?: "kids" | "general" | "adult"; topics?: string[] };
  /**
   * The owner's own public key: the identity they sign in with (npub1…), not the key this folder signs with.
   * Naming it here lets the site admit it, which is how the owner shows this world is theirs (NSWP-07).
   */
  owner?: string;
  /** The Airlock a visitor is sent through when they arrived without one of their own. */
  airlock: string;
  /**
   * Where a visitor signs in who opened this world's address themselves, with no client to say where theirs is:
   * an https address. Left out, BitLogin's, so that signing in is the same in every world. "" for none. A
   * visitor a client brought signs in where that client says, whatever is here.
   */
  signer?: string;
  relays: string[];
  /**
   * Where visitors can arrive. `main-entrance` is the default. Positions are metres; yaw is degrees, 0 facing −Z.
   * Each is a set of places (NSWP-01, "Places to arrive"): its own spot first, then `places`, eight in all for a
   * world with rooms (four otherwise), each a metre or more from the others and where a visitor may stand, so that
   * people arriving together land apart. `npm run check` says if there are too few.
   */
  entryPoints: Record<string, { position: [number, number, number]; yaw: number; places?: { position: [number, number, number]; yaw: number }[] }>;
  sky?: string;
  /**
   * This world's own sounds. Each is a file in the `sounds/` folder, by name: `{ "cues": { "step": "sounds/step.ogg",
   * "press": null }, "music": "sounds/loop.ogg", "hum": null }`. A cue set to null is silent; one left out keeps
   * the default. A list of files for a cue is chosen among each time; a list for `music` plays in turn. `music`
   * and `hum` set to null mean none; left out, they are the ones every world starts with.
   */
  sounds?: SoundTheme;
  /**
   * `false` where this world wants no music shared between its visitors: a concert, a library. Each visitor
   * still hears their own. It can only be switched off here, never on: sharing and hearing are each visitor's choice.
   */
  sharedMusic?: boolean;
  /**
   * How much room the controls take. `presence` is "full" (the whole HUD),
   * "quiet" (one mark in `corner`) or "hidden". `keys` changes or switches off
   * the keys the HUD answers to: `{ "menu": "p", "hotbar": false }`.
   */
  controls?: { presence?: Presence; corner?: Corner; keys?: Partial<UiKeys> };
}

export interface PortalOptions {
  label?: string;
  /** Where the doorway stands on the floor, in metres. */
  position?: [number, number, number];
  /** Degrees about the vertical. 0 faces the main entrance. */
  rotation?: number;
  color?: THREE.ColorRepresentation;
}

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Move this, not the camera, to move the visitor. In VR the headset moves the camera inside it. */
  rig: THREE.Group;
  renderer: THREE.WebGLRenderer;
  config: WorldConfig;
  /** home.json, checked and ready to draw. */
  layout: Layout;
  /**
   * Everything a visitor can do here, drawn as a HUD on a flat screen and as a
   * console in a headset. Add your own: `ctx.controls.add({ id, label, icon,
   * section, act })`. Say a few words for a moment with `ctx.controls.say()`.
   */
  controls: Controls;
  /**
   * The world's sounds. `ctx.sounds.play("grab")` plays one of the cues: the
   * world's own file if `world.json` names one, the default otherwise, and
   * nothing if the visitor has effects off.
   */
  sounds: Sounds;
  /** How the visitor arrived, or null if they came by an ordinary link. */
  arrival: Arrival | null;
  /**
   * Make a portal to another place and add it to the scene. The plumbing
   * animates it, looks up its name, and lets visitors through. To switch one
   * off, set `gate.group.visible = false`: a hidden portal can't be used.
   */
  addPortal(destination: PortalDestination | { coordinate: string }, opts?: PortalOptions): PortalGate;
  /** Hand over portals made elsewhere (the home's own, say) so visitors can go through them. */
  usePortals(gates: PortalGate[]): void;
  /**
   * Make something a visitor in a headset can pick up, with a controller's
   * grip or a pinch of tracked fingers: `ctx.grabbable(mesh, { release:
   * "return" })`. It moves on their screen only; others in a room don't see
   * it move. Never make picking something up the only way to do anything a
   * visitor needs: most visitors have no grip.
   */
  grabbable(object: THREE.Object3D, options?: GrabOptions): void;
}

export interface SceneHandle {
  update?(t: number, dt: number): void;
  /**
   * May a visitor stand with their head above this spot on the floor? Return
   * false inside walls and past edges. Walking with the keyboard and stepping
   * both ask first. A visitor walking about their real room in a headset can't
   * be stopped, and shouldn't be moved against their will.
   */
  canStand?(x: number, z: number): boolean;
  /** Set false to turn off stepping (point at the floor and select to stand there). On by default. */
  stepping?: boolean;
  /**
   * Draw the other people in a room in this world's own way: a `material`
   * of your own, a `palette` their colours are fitted to, parts to `omit`.
   * Left out, each is drawn as they chose to look.
   */
  figureStyle?: FigureStyle;
  /** Things to leave out of this world's preview picture, such as anything about one visitor. */
  hideFromPreview?: THREE.Object3D[];
}

export type BuildScene = (ctx: SceneContext) => Promise<SceneHandle> | SceneHandle;
