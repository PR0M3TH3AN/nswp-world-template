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
    /** Place and turn this. The portal faces its local +Z. */
    group: THREE.Group;
    /** The surface to aim at: test rays against this. */
    target: THREE.Mesh;
    destination: PortalDestination;
    /** 1 while a visitor is aiming at the portal, 0 otherwise. The glow follows it. */
    aimed: number;
    setLabel(label: string): void;
    /** Show a preview of the destination through the portal (spec §5.8). */
    showThrough(pano: THREE.Texture): void;
    update(t: number, dt: number): void;
}
/** The standard portal: a ring, a moving surface, and a sign saying where it leads. */
export declare function createPortalGate(destination: PortalDestination, opts?: PortalGateOptions): PortalGate;
export interface HomeOptions {
    textColor?: string;
    /** Relay hints written into portal destinations, so an Airlock can find the worlds. */
    relays?: string[];
    /** Add a soft overall light and a key light. Default true. */
    lights?: boolean;
}
export interface Home {
    group: THREE.Group;
    /** The home's doors, in layout order. */
    portals: PortalGate[];
    /** Placements this renderer doesn't draw (published items), shown as markers. */
    markers: number;
    update(t: number, dt: number): void;
}
/** Draw a home layout. Positions are metres from the home's origin, which is where the returned group sits. */
export declare function createHome(layout: Layout, opts?: HomeOptions): Home;
