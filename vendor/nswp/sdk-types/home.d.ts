/**
 * nswp-sdk/home — draws a home layout (spec §4.5) with Three.js, and the
 * standard portal that homes and worlds both use.
 *
 *   import { createHome } from "nswp-sdk/home";
 *   const home = createHome(layout);
 *   scene.add(home.group);
 *   // each frame: home.update(t, dt)
 *   // home.portals are the doors: send a visitor through with portal.go(p.destination)
 *
 * This is one renderer. A layout is data, so any other renderer can draw the
 * same home differently. Only the built-in catalogue is drawn here; a
 * published item (§10.4) appears as a marker of its place.
 */
import * as THREE from "three";
import { type Layout, type PortalDestination } from "@nswp/core";
export interface PortalGateOptions {
    /** First line of the sign above the portal. The address is always shown beneath it. */
    label?: string;
    color?: THREE.ColorRepresentation;
    textColor?: string;
}
export interface PortalGate {
    /** Place and turn this. The doorway stands on the floor at the group's origin and faces its local +Z. */
    group: THREE.Group;
    /** The surface to aim at: test rays against this. */
    target: THREE.Mesh;
    destination: PortalDestination;
    /** 1 while a visitor is aiming at the portal, 0 otherwise. The glow follows it. */
    aimed: number;
    setLabel(label: string): void;
    /** Show a preview of the destination through the portal (spec §5.8). Returns the window, for a world that needs to hide it while it photographs itself. */
    showThrough(pano: THREE.Texture): THREE.Mesh;
    update(t: number, dt: number): void;
}
/** The standard doorway's size, in metres. */
export declare const PORTAL_WIDTH = 1.5;
export declare const PORTAL_HEIGHT = 2.1;
/**
 * The standard portal: an arched doorway standing on the floor, with a sign
 * above it saying where it leads. It is the same shape wherever a visitor
 * meets one, so a way out is always recognisable.
 */
export declare function createPortalGate(destination: PortalDestination, opts?: PortalGateOptions): PortalGate;
export interface HomeOptions {
    textColor?: string;
    /** Relay hints written into portal destinations, so an Airlock can find the worlds. */
    relays?: string[];
    /** Add a soft overall light and a key light, for things of your own that need them. The home's own blocks don't. Default true. */
    lights?: boolean;
    /** Draw the ground: the grid to the horizon and the skyline. Default true. Pass false to stand the home on a ground of your own. */
    environment?: boolean;
}
export interface Home {
    group: THREE.Group;
    /** The home's doors, in layout order. */
    portals: PortalGate[];
    /** Placements this renderer doesn't draw (published items), shown as markers. */
    markers: number;
    update(t: number, dt: number): void;
}
/**
 * Draw a home layout. Positions are metres from the home's origin, which is
 * where the returned group sits. The home stands on the grid, and everything
 * built in is made of blocks: dark, with edges lit in the room's accent.
 */
export declare function createHome(layout: Layout, opts?: HomeOptions): Home;
export { createEnvironment, GROUND, type Environment, type EnvironmentOptions } from "./environment.js";
export { createBlocks, BLOCK, type Blocks, type BlockOptions } from "./blocks.js";
