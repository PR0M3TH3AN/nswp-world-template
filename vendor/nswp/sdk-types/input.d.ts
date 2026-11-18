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
    /** May the visitor's head be at (x, z)? Walking stops where this says no. Left out, anywhere. */
    canStand?: (x: number, z: number) => boolean;
    /**
     * Step to where the controller in this slot points, exactly as a `select` on
     * the floor would. Called when a stick pushed forward is let go. Left out,
     * a stick doesn't step, and pointing and selecting still does.
     */
    stepFrom?: (slot: number) => void;
    /** The menu button (B or Y) went down. */
    onMenu?: () => void;
    /** The light on the controllers and hands. */
    accent?: THREE.ColorRepresentation;
    /** Give the visitor their choices under "Moving" in the controls. */
    controls?: Controls;
    /** Draw controllers and hands. Default true. A world with hands of its own turns this off. */
    models?: boolean;
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
    /** Buzzes sent so far, for tests: nothing else can see one. */
    pulses: number;
}
export interface XrInput {
    readonly comfort: Comfort;
    /** Change how the visitor moves. `keep` remembers it as their choice, for this site. */
    setComfort(patch: Partial<Comfort>, keep?: boolean): void;
    /** Call once per frame with the seconds since the last one. */
    update(dt: number): void;
    /** Make something a visitor can pick up. Returns a function that takes that back. */
    grabbable(object: THREE.Object3D, opts?: GrabOptions): () => void;
    /** True while a pinch in this slot is holding something: its `select` picked that up, and is not a press. */
    claimed(slot: number): boolean;
    /** A short buzz in the hand, where the controller can. Strength 0 to 1, length in milliseconds. */
    pulse(slot: number, strength?: number, ms?: number): void;
    info(): XrInputInfo;
    dispose(): void;
}
export declare function createXrInput(opts: XrInputOptions): XrInput;
