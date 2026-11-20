/**
 * Where the visitor is, for a world drawn by an engine that isn't JavaScript's (docs/other-engines.md).
 *
 * The kit's own code for people and for the things they carry works on places and directions, and was written
 * for a Three.js scene. Here is such a scene with nothing in it to draw: the visitor's view is put where the
 * engine says it is, once a frame, and the kit's code is run on that. So nothing about who is where, or what
 * flew where, is written a second time for another engine.
 *
 * One call a frame, `frame`, carries everything both ways: the engine says where the visitor is and what it found
 * out, and is given back everything there is to draw. Each part of this script that has something to draw adds
 * its share (`addFramePart`).
 */
import * as THREE from "three";
export declare const read: (text: unknown) => Record<string, unknown>;
export declare const three: (v: unknown) => [number, number, number] | null;
export declare const num: (v: unknown, otherwise: number) => number;
/** Bytes as base64, a piece at a time: a model is too long to hand to the browser in one go. */
export declare function base64(bytes: Uint8Array): string;
export interface EngineWorld {
    scene: THREE.Scene;
    /** Where the visitor's view is, and which way it faces. */
    camera: THREE.PerspectiveCamera;
    /** Where they stand: under their view, on the floor. The kit moves this to move them (`nudge` in a frame). */
    rig: THREE.Group;
    /** In a headset, as the engine last said. */
    presenting: boolean;
    /** Their item is up at their eye, as the engine last said. */
    sighting: boolean;
}
/** The one place every part of this script works in. Made when first asked for. */
export declare function engineWorld(): EngineWorld;
/** What a part of this script does each frame: it is given what the engine said, and returns its share of what to draw. */
export type FramePart = (said: Record<string, unknown>, dt: number) => Record<string, unknown>;
/** Take part in every frame from now on. */
export declare function addFramePart(part: FramePart): void;
/** Hear what the engine said at the start of every frame, before any part does anything with it. */
export declare function addFrameStart(start: (said: Record<string, unknown>) => void): void;
/**
 * Every frame. `view` is JSON saying where the visitor is and what the engine found: `dt`, seconds since the last;
 * `head` and `turn`, where their view is and which way it faces (x, y, z, w); `floor`, how high the floor under
 * them is; `fov` and `aspect`; `presenting`, in a headset; `sighting`, whether their item is up at their eye; and
 * whatever each part asks of the engine (for items: `met` and `floors`).
 *
 * Returns everything there is to draw, as JSON: each part's share (`held`, `things`, `trails`, `own` for items;
 * `people` and `room` for people), and `nudge` when the visitor is to be moved a little along the floor (x and z,
 * in metres: they arrived on top of someone). Add it to where they stand.
 */
export declare function frame(view?: string): string;
