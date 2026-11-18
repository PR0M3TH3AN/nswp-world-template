/**
 * Things built from blocks: dark boxes with lit edges, the solid half of the
 * grid look. Furniture, walls, trees, whatever a place is made of.
 *
 * Every box added to one builder is drawn together: one mesh and one set of
 * lines, however many boxes there are. Nothing is lit by the scene's lights.
 * Each face carries its own shade instead, which is what keeps a room of
 * furniture at two draw calls on a headset.
 *
 *   const blocks = createBlocks("#3df2a0");
 *   blocks.box([0.6, 1, 0.6], [0, 0.5, 0]);              // a plinth
 *   blocks.box([0.3, 0.3, 0.3], [0, 1.2, 0], { lit: true }); // a glowing cube on it
 *   scene.add(blocks.build());
 */
import * as THREE from "three";
export interface BlockOptions {
    /** The box's own colour. Dark by default. */
    color?: THREE.ColorRepresentation;
    /** Drawn at full brightness on every face, like something giving off light. */
    lit?: boolean;
    /** Leave its edges undrawn. */
    bare?: boolean;
}
export interface Blocks {
    /** Add a box: its size, then where its centre is. */
    box(size: [number, number, number], at: [number, number, number], opts?: BlockOptions): void;
    /** Place and turn every box added from now on: an item's position, and its rotation in degrees about the vertical. */
    at(position: [number, number, number], degrees?: number): void;
    readonly count: number;
    build(): THREE.Group;
}
/** The colour blocks are unless told otherwise. */
export declare const BLOCK = 791837;
export declare function createBlocks(accent: THREE.ColorRepresentation): Blocks;
