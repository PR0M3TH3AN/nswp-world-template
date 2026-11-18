/**
 * Modelling in code: the kit the reference places are built with.
 *
 * A builder collects faces and hands back one mesh. Every face is flat, with
 * its own normal, so bevels and insets catch the light as edges. Each vertex
 * carries three things the surface shader (alloy.ts) draws from:
 *
 *  - a tone: the face's own colour, already darkened where it is recessed;
 *  - a glow: how much of it is a light, 0 to 1;
 *  - a flow: a distance along the piece, which light travels along.
 *
 * Shapes are made the way a modeller would make them: boxes with their edges
 * bevelled and panels pressed into their faces, a profile swept along a path,
 * a profile turned on a lathe. Everything added to one builder is one draw
 * call, which is what lets a detailed room run on a headset.
 */
import * as THREE from "three";
export type V3 = [number, number, number];
export type P2 = [number, number];
export interface Paint {
    /** The face's colour. The builder's current tone when left out. */
    color?: THREE.ColorRepresentation;
    /** How much of a light it is, 0 to 1. */
    glow?: number;
    /** Darken (below 1) or lift (above 1): what a recess or a raised lip does. */
    shade?: number;
    /** Distance along the piece, for light that travels. One number, or one per corner. */
    flow?: number | [number, number, number, number];
}
export interface BoxOptions extends Paint {
    /** How much is cut from every edge. */
    bevel?: number;
    /** Press a panel into faces: how far in from the edge, how deep, and whether its rim is lit. */
    panel?: {
        margin: number;
        depth: number;
        glow?: number;
        faces?: string;
    };
}
/** A point on a path, with the two directions a profile is drawn in there. Travel must run along x × y. */
export interface Frame {
    p: V3;
    x: V3;
    y: V3;
    /** Distance along the path, for flow. */
    t?: number;
}
export declare class MeshBuilder {
    private positions;
    private normals;
    private tones;
    private glows;
    private flows;
    private matrix;
    private rotation;
    /** The colour faces take when they don't say. */
    tone: THREE.Color;
    /** The colour of this piece's lights, for a material that reads plain vertex colours (see `geometry`). */
    light: THREE.Color;
    private colors;
    get triangles(): number;
    /** Place and turn everything added from now on: a position, and degrees about the vertical. */
    at(position?: V3, degrees?: number, scale?: number): this;
    /** Place everything added from now on by any matrix: for a piece that leans or lies on its side. */
    place(matrix: THREE.Matrix4): this;
    /** A flat four-sided face. Pass `out`, roughly which way it faces, and the corners may be given in either order. */
    quad(a: V3, b: V3, c: V3, d: V3, paint?: Paint, out?: V3): void;
    tri(a: V3, b: V3, c: V3, paint?: Paint, out?: V3): void;
    /** A face with a panel pressed into it. Corners in order round the face; `out` is which way it faces. */
    panel(corners: [V3, V3, V3, V3], out: V3, o: {
        margin: number;
        depth: number;
        glow?: number;
    }, paint?: Paint): void;
    /** A box with its edges bevelled, and panels pressed into the faces named: "x+ x- y+ y- z+ z-", or "sides". */
    box(size: V3, at: V3, o?: BoxOptions): void;
    /**
     * Sweep a profile along a path. The profile is a closed outline drawn
     * anticlockwise in each frame's own x and y; `paint(i)` colours the side that
     * runs from point i to the next. Open ends are capped.
     */
    sweep(profile: P2[], frames: Frame[], paint?: (side: number) => Paint, o?: {
        caps?: boolean;
        loop?: boolean;
    }): void;
    /**
     * Turn a profile on a lathe about the vertical through `at`. The profile is
     * [radius, height] pairs from the bottom up. `sides` is how many faces round:
     * 4 makes a square column, 6 a hexagon, 24 a round one. `twist` turns it as it rises.
     * `paint(row, side)` colours each face: `row` counts up the profile, `side` round it.
     */
    lathe(profile: P2[], at: V3, sides: number, paint?: (row: number, side: number) => Paint, o?: {
        twist?: number;
        turn?: number;
    }): void;
    /** A thin lit line lying just proud of a surface: from a to b, `width` wide, on a face that points `out`. */
    line(a: V3, b: V3, width: number, out: V3, paint?: Paint): void;
    /** Everything added, as one geometry. */
    geometry(): THREE.BufferGeometry;
    /** Everything added, as one mesh in this material (see alloy.ts). */
    build(material: THREE.Material): THREE.Mesh;
}
