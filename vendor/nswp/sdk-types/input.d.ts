/**
 * Hands in a headset: controllers of any make, and tracked hands.
 *
 * This is the part of the kit that touches WebXR. It reads whatever the
 * visitor is holding through the standard layout (`actions.ts`), and does the
 * things every world would otherwise write again: turning and moving with a
 * stick, in the comfortable way unless the visitor asks otherwise; picking
 * things up with the grip; a buzz in the hand when something happens; a menu
 * button; and something to see where the hands are.
 *
 * It adds to pointing and selecting, and never replaces it. A visitor with
 * one button, a pinch, or their gaze can still do everything a world owes
 * them (protocol/09-what-a-world-owes.md). A world keeps its own `select`
 * handling; this needs only to be told how to step.
 *
 * Nothing here is downloaded. The controller a visitor sees is drawn by this
 * file, in the kit's own style, so it is the same for every make and no
 * request tells anyone which headset they own.
 *
 *   const input = createXrInput({ renderer, scene, rig, camera, canStand, controls,
 *     stepFrom: (i) => stepWhere(controllers[i]), onMenu: () => xrConsole.toggle() });
 *   // each frame:  input.update(dt)
 *   // on select:   if (input.claimed(i)) return;   // that pinch picked something up
 *   input.grabbable(mesh);
 */
import * as THREE from "three";
import { type Comfort, type Handedness, type PadState } from "./actions.js";
import { MOVE_QUESTION } from "./comfort-controls.js";
export { MOVE_QUESTION };
import type { Controls } from "./ui/model.js";
export interface GrabOptions {
    /** How close a hand must be, in metres from the thing's surface. Default 0.1. */
    reach?: number;
    /** May it be picked up by pointing at it from a distance and squeezing? It comes to the hand. Default true. */
    far?: boolean;
    /** Taken from a distance, does it come to the hand? False keeps it at arm's length and moves it from there: right for something large. Default true. */
    pull?: boolean;
    /** When let go: stay where it is put, or go back to where it was. Default "stay". */
    release?: "stay" | "return";
    onGrab?: (slot: number) => void;
    onRelease?: (slot: number) => void;
}
export interface XrInputOptions {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    /** The object that moves the visitor around; the camera is inside it. */
    rig: THREE.Object3D;
    camera: THREE.Camera;
    /**
     * The visitor arrived from a headset moving the intense way (their own client says so): they move that way
     * here too. A preference, and theirs to change.
     */
    arrivedIntense?: boolean;
    /** May the visitor's head be at (x, z)? Walking stops where this says no. Left out, anywhere. */
    canStand?: (x: number, z: number) => boolean;
    /**
     * Step to where the controller in this slot points, exactly as a `select` on
     * the floor would. Called when a stick pushed forward is let go. Left out,
     * a stick doesn't step, and pointing and selecting still does.
     */
    stepFrom?: (slot: number) => void;
    /**
     * The pace of stepping (stroll.ts), shared with the world's own steps: a step backwards with the stick is
     * taken only when it allows, so stepping back is no faster than any other way of going.
     */
    pace?: {
        take(metres: number): boolean;
    };
    /** The menu button (B or Y) went down. */
    onMenu?: () => void;
    /**
     * The menu button (B or Y) has been held for a moment: the visitor is summoning their controls, which no world
     * may refuse (ui/summon.ts). Open the console: `() => xrConsole.setOpen(true)`.
     */
    onSummon?: () => void;
    /** The jump button (A or X) went down. Give it the world's jump: `() => jump.jump()` (jump.ts). */
    onJump?: () => void;
    /** The light on the controllers and hands. */
    accent?: THREE.ColorRepresentation;
    /** Give the visitor their choices under "Moving" in the controls. */
    controls?: Controls;
    /** Draw controllers and hands. Default true. A world with hands of its own turns this off. */
    models?: boolean;
    /**
     * Where this world serves the kit's held hands (packages/sdk/assets/hands/, copied beside the page as the kit's
     * sounds are), for example "/hands/kit/". Given, a Quest's controllers are drawn as the kit's see-through hand
     * holding a see-through controller, moved by the trigger, grip and thumb (held-hands.ts). Left out, or where they
     * can't be had, the kit's own drawing is kept, as for any other controller.
     */
    handsAt?: string;
    /**
     * Whether the sticks are the menu's just now: while a ray rests on the headset's menu, a stick scrolls it and
     * doesn't also walk or turn the visitor (`XrConsole.scrolling`). Left out, never.
     */
    sticksTaken?: () => boolean;
}
export interface XrInputInfo {
    comfort: Comfort;
    /** What is in each of the two slots. */
    slots: {
        hand: Handedness;
        kind: "controller" | "hand" | "none";
        pad: PadState;
    }[];
    /** Slots choosing where to step: a stick is held forward. */
    aiming: number[];
    /** What each slot holds, by the name given to `grabbable`, or null. */
    holding: (string | null)[];
    /** How much of the view's edge is darkened, 0 to 1. */
    narrow: number;
    /** How dark the whole view is just now, 0 to 1: above 0 only while the kit fades a jump. */
    dark: number;
    /** How dark the view was as each of the last few jumps was made: 1 for a faded one, 0 for a cut. For tests. */
    jumped: number[];
    /** Buzzes sent so far, for tests: nothing else can see one. */
    pulses: number;
}
export interface XrInput {
    readonly comfort: Comfort;
    /** Whether the visitor moves the intense way in a headset: walking and turning smoothly. */
    readonly intense: boolean;
    /** Change how the visitor moves. `keep` remembers it as their choice, for this site. */
    setComfort(patch: Partial<Comfort>, keep?: boolean): void;
    /** Call once per frame with the seconds since the last one. */
    update(dt: number): void;
    /**
     * Make a jump: `fn` moves the visitor at once (a step, a respawn, a teleporter). In a headset, for someone whose
     * `fade` setting is on (casual's default), the view fades to black, `fn` runs while it is dark, and the view comes
     * back: nothing is seen to move. Otherwise `fn` runs now, an instant cut, as intense keeps.
     */
    jump(fn: () => void): void;
    /** Make something a visitor can pick up. Returns a function that takes that back. */
    grabbable(object: THREE.Object3D, opts?: GrabOptions): () => void;
    /** True while a pinch in this slot is holding something: its `select` picked that up, and is not a press. */
    claimed(slot: number): boolean;
    /** A short buzz in the hand, where the controller can. Strength 0 to 1, length in milliseconds. */
    pulse(slot: number, strength?: number, ms?: number): void;
    info(): XrInputInfo;
    dispose(): void;
}
/**
 * Where the visitor's own hands come in the order of drawing: after the menu a headset shows (`MENU_ORDER`,
 * console.ts), and so over it.
 */
export declare const HANDS_ORDER = 40;
/**
 * The visitor's own hands are drawn last, and over the menu, wherever they are held.
 *
 * The menu in a headset is drawn over the room with no regard to what is nearer, so that a wall can't hide it. Drawn
 * the usual way, a hand was painted first and the menu over it: a visitor reaching for a row lost sight of the hand
 * they were reaching with. The owner, 2026-11-24: "we need to make sure that the menu is not drawn above the hands
 * in VR", and then "ok lets draw the hands last".
 *
 * So everything under `root` is drawn in the last pass, after the menu. It is still hidden by what is really in
 * front of it in the room (a wall a hand is put through), since it keeps its place in depth; the menu keeps none.
 * Whatever is drawn of a hand goes through here: the kit's controller and joints today, and a better model or a
 * world's own when there is one.
 */
export declare function drawnLast(root: THREE.Object3D): void;
export declare function createXrInput(opts: XrInputOptions): XrInput;
