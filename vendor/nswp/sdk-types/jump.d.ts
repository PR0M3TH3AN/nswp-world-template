import type { Controls } from "./ui/model.js";
/** How high a jump lifts a visitor, in metres. */
export declare const JUMP_HEIGHT = 0.45;
/** How hard they are pulled back down, in metres a second, each second. */
export declare const JUMP_GRAVITY = 9.8;
/** How fast they leave the floor, in metres a second: what reaches that height against that pull. */
export declare const JUMP_SPEED: number;
export interface Jump {
    /** Leave the floor. Returns false, and does nothing, if they are already in the air. */
    jump(): boolean;
    /** Call every frame with the seconds since the last. Returns how far above the floor they are now, in metres. */
    update(dt: number): number;
    /** How far above the floor they are. */
    readonly height: number;
    readonly airborne: boolean;
    /** Put them back on the floor at once: a door was taken, a headset session began or ended. */
    land(): void;
    dispose(): void;
}
/** The jump itself, with nothing that asks for it. */
export declare function createJump(o?: {
    onJump?(): void;
    onLand?(): void;
}): Jump;
export interface AddJumpOptions {
    /** In a headset, the page's keys and its control stand down: the controller's button asks instead. */
    presenting(): boolean;
    /**
     * Something to make it heard: leaving the floor is two footsteps back to back (`jumped`), and coming down is a
     * landing. Something with no `jumped` plays one step, as before.
     */
    sounds?: {
        play(cue: "step" | "land"): void;
        jumped?(): void;
    } | null;
    /** The menu, so that Space works it while it is open and doesn't jump. */
    hud?: {
        readonly open: boolean;
    } | null;
    /** Return true while the keys belong to something else: a keyboard on screen, a game of the world's own. */
    busy?(): boolean;
}
/**
 * A jump, with the two ways of asking for it that a page has: Space, and a
 * control in the menu's Moving section. Where there is no keyboard, the
 * control is with the ones always at hand. A headset's button is the input
 * layer's (`createXrInput({ onJump: () => jump.jump() })`).
 */
export declare function addJump(controls: Controls, o: AddJumpOptions): Jump;
