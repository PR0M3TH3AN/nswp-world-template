/** What your scene is given, and what it hands back. */
import type * as THREE from "three";
import type { Arrival, Layout, PortalDestination } from "@nswp/core";
import type { PortalGate } from "nswp-sdk/home";

/** world.json */
export interface WorldConfig {
  world: { d: string; title: string; url: string; summary?: string; modes?: string[]; capabilities?: string[] };
  /** The Airlock a visitor is sent through when they arrived without one of their own. */
  airlock: string;
  relays: string[];
  /** Where visitors can arrive. `main-entrance` is the default. Positions are metres; yaw is degrees, 0 facing −Z. */
  entryPoints: Record<string, { position: [number, number, number]; yaw: number }>;
  sky?: string;
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
  /** Things to leave out of this world's preview picture, such as anything about one visitor. */
  hideFromPreview?: THREE.Object3D[];
}

export type BuildScene = (ctx: SceneContext) => Promise<SceneHandle> | SceneHandle;
