/**
 * The intense way of moving at a desk: the way games have taught hands to move.
 *
 * There are two ways to move, on a desk and in a headset, and the menu calls
 * them the same things in both: casual and intense. Casual at a desk is made
 * for someone who has never played anything: click where you want to stand,
 * drag to look round. Intense is for people who have: the mouse looks, W A S
 * D walk, Shift runs, F uses what is in front of you, and Escape brings up
 * the menu. A visitor chooses in the menu, under Moving, and it is kept. (In
 * a headset the two are stepping and walking smoothly: see input.ts.)
 *
 * It needs a mouse or a trackpad, so it isn't offered on a phone, and it
 * stands down in a headset, where hands already do all of this.
 *
 *   const fps = createFps({ dom: renderer.domElement, camera, rig, controls, hud, canStand, presenting: () => renderer.xr.isPresenting, onUse });
 *   // each frame, in place of the page's own keys:
 *   if (!fps.update(dt)) walkWithKeys(dt);
 *   // in the page's own click handlers:  if (fps.enabled) return;
 *
 * Looking takes the pointer (the browser hides it and gives the page its
 * movements), which a browser grants only on a click and takes back on
 * Escape. So Escape is the menu: when the pointer comes back, the menu is
 * what the visitor finds, and a click on the view takes them in again.
 */
import type * as THREE from "three";
import type { Controls } from "./ui/model.js";
/** Radians of turn for each pixel the mouse moves. */
export declare const LOOK_SPEED = 0.0022;
/** How far up or down a visitor can look: a little short of straight up, so the view never flips. */
export declare const PITCH_LIMIT: number;
/** Running is this many times walking. */
export declare const SPRINT = 1.75;
/** Where a visitor is looking after the mouse moved by (dx, dy) pixels. Yaw turns left for a move left; pitch is held within its limit. */
export declare function lookAfter(yaw: number, pitch: number, dx: number, dy: number, speed?: number): {
    yaw: number;
    pitch: number;
};
export interface Held {
    forward?: boolean;
    back?: boolean;
    left?: boolean;
    right?: boolean;
    sprint?: boolean;
}
/**
 * How far the held keys move a visitor facing `yaw` in `dt` seconds, over
 * the floor: [dx, dz] in metres. Walking diagonally is no faster than
 * walking straight, and looking up or down doesn't change the pace.
 */
export declare function strideOf(held: Held, yaw: number, speed: number, dt: number, sprint?: number): [number, number];
/** Which held thing a key is, or null for a key this doesn't move with. */
export declare function heldKey(code: string): keyof Held | null;
/** Where the choice is kept, for this site, unless a world names another place. */
export declare const DESK_KEY = "nswp:fps";
/** What the control says, and what is said when it is pressed. One wording, whatever draws the world. */
export declare const DESK_WORDS: {
    readonly intense: "Desk controls: intense";
    readonly casual: "Desk controls: casual";
    readonly nowIntense: "Intense: click the view to look round with the mouse. W, A, S, D walk, Shift runs, Space jumps, F uses what is in front of you, and Escape brings up this menu.";
    readonly nowCasual: "Casual: click where you want to stand, twice to run there, and drag to look round. W, A, S, D walk, Shift runs and Space jumps.";
    readonly click: "Click the view to look round. Escape brings up the menu.";
};
/**
 * A way of moving that needs a mouse is not offered where there isn't one, or to a visitor who arrived using
 * their fingers on a device that has both (form.ts).
 */
export declare const hasMouse: () => boolean;
/** Whether a visitor starts out moving the intense way at a desk: they arrived so, or chose it here before. */
export declare function startsIntense(arrived: boolean, key?: string): boolean;
/** Keep the choice, or forget it. */
export declare function keepIntense(on: boolean, key?: string): void;
export interface FpsOptions {
    /** What is clicked to look round: the canvas. */
    dom: HTMLElement;
    camera: THREE.Object3D;
    /** What is turned and moved: the camera's parent. */
    rig: THREE.Object3D;
    controls: Controls;
    /** The menu, so Escape can bring it up and looking can stop while it is open. */
    hud?: {
        readonly open: boolean;
        setOpen(open: boolean): void;
    } | null;
    canStand(x: number, z: number): boolean;
    /** In a headset: this stands down. */
    presenting(): boolean;
    /** F, or a click while looking: use what the middle of the view points at. */
    onUse(): void;
    /** Walking pace, in metres a second. */
    speed?: number;
    /** They walked into something. */
    onBlocked?(): void;
    /** Start in it: their own client says they were moving this way where they came from. */
    arrived?: boolean;
    /** Keep the choice under this name, for this site. */
    keep?: string;
}
export interface Fps {
    /** Whether the visitor has chosen this way of moving. */
    readonly enabled: boolean;
    setEnabled(on: boolean): void;
    /** Whether the mouse is looking round now (the pointer is the page's). */
    readonly looking: boolean;
    /**
     * Call every frame. Returns true when this has the visitor's movement, and
     * the page's own keys and clicks should stand down.
     */
    update(dt: number): boolean;
    dispose(): void;
}
export declare function createFps(o: FpsOptions): Fps;
