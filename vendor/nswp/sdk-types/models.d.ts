/**
 * The pieces the reference places are made of, modelled with mesh.ts: the
 * doorway's frame, walls, furniture, and a few things to look at.
 *
 * Each is a function that adds itself to a builder, standing at the builder's
 * current place. So a whole room is still one mesh, however much is in it.
 * Sizes are in metres and match what a home layout expects (spec §4.5).
 */
import * as THREE from "three";
import type { Frame, MeshBuilder, P2, V3 } from "./mesh.js";
import { PORTAL_HEIGHT, PORTAL_WIDTH } from "./gate-size.js";
/** The doorway's opening, in metres. */
export { PORTAL_HEIGHT, PORTAL_WIDTH };
/**
 * The outline of the doorway's moulding, to sweep along a path: `hw` half its
 * width across the opening, `hd` half its depth, its corners cut by `bev`, and
 * a channel `c` to each side of the middle and `cd` deep let into its front and
 * its back. Paint it with `mouldingPaint`, which puts the light in the channels.
 */
export declare function mouldingProfile(hw: number, hd: number, bev: number, c: number, cd: number): P2[];
export declare function mouldingPaint(side: number): {
    glow?: number;
    shade?: number;
};
/**
 * The doorway's frame: a moulding swept up one side, over the arch and down
 * the other, with a channel of light let into its face. It stands on two
 * blocks and a threshold, and has a keystone at the top.
 */
export declare function addArchFrame(b: MeshBuilder): void;
/** A run of wall, `length` long and `height` high, standing along x with its face to +Z. Bays of panels between posts with a seam of light. */
export declare function addWall(b: MeshBuilder, length: number, height: number, o?: {
    color?: THREE.ColorRepresentation;
}): void;
export declare function addPlinth(b: MeshBuilder): void;
export declare function addBench(b: MeshBuilder, soft: THREE.ColorRepresentation): void;
export declare function addTable(b: MeshBuilder, soft: THREE.ColorRepresentation): void;
export declare function addLamp(b: MeshBuilder): void;
/** A planter with a spray of blades growing from it, their tips lit. */
export declare function addPlant(b: MeshBuilder, soft: THREE.ColorRepresentation, seed?: number): void;
/** The border of a picture: `w` by `h` inside, centred on the builder's place, facing +Z. */
export declare function addPictureFrame(b: MeshBuilder, w: number, h: number): void;
/** Frames for sweeping a profile round a closed curve. `at(u)` gives a point for u from 0 to 1. */
export declare function loopFrames(at: (u: number) => V3, steps: number): Frame[];
/** A flattened band, for a ribbon: `wide` across and `thick` through, with its edges eased and a seam of light along the outside. */
export declare function bandProfile(wide: number, thick: number): P2[];
/** The metal a place's things are made of: a few shades up from its ground, so they stand out from it. */
export declare function metalTone(ground: THREE.ColorRepresentation): THREE.Color;
/**
 * A ribbon tied in a knot, `size` across, centred on the builder's place, with
 * a seam of light round its outside. `p` and `q` choose the knot: 2 and 3 is a
 * trefoil, 2 and 5 a cinquefoil, 3 and 4 something busier.
 */
export declare function addKnot(b: MeshBuilder, size?: number, p?: number, q?: number): void;
/** Two ribbons winding round each other as they rise, `size` high, centred on the builder's place. */
export declare function addHelix(b: MeshBuilder, size?: number): void;
/** Three hoops, one inside another and each tipped a different way, round a point of light. */
export declare function addGyro(b: MeshBuilder, size?: number): void;
/** A cluster of crystals growing from one root, the tallest in the middle. About `size` high, standing on the builder's place. */
export declare function addCrystal(b: MeshBuilder, size?: number, seed?: number, at?: V3, degrees?: number): void;
/**
 * A tower of square frames, each turned a little further than the one below
 * and widest at the middle, so its corners draw four spirals. Every third
 * frame is lit. About `size` high, centred on the builder's place.
 */
export declare function addSpiral(b: MeshBuilder, size?: number): void;
/**
 * A tree: a trunk that turns a little as it rises, and tiers of leaves, each
 * edged with light and lit a little from beneath, like a lantern. `leaf` is the leaves' colour.
 */
export declare function addTree(b: MeshBuilder, leaf: THREE.ColorRepresentation, seed?: number, tall?: number): void;
