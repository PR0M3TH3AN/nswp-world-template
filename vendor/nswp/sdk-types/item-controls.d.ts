/**
 * Pressing what is in your hand (protocol/17-items.md): the same two presses on every kind of device.
 *
 * An item that does something says what its presses are called ("Fire", "Reload"). They are offered the way
 * everything else is:
 *
 * - **On a touch screen, under the thumb** (thumb-presses.ts; the owner, 2026-11-22, option B): a sight in the
 *   middle of the view, the first press as a large round button by the right thumb and the second as a smaller one
 *   (by the left thumb, if the visitor says so). The first press sends along the sight. A tap on the view is a walk,
 *   exactly as with nothing in hand: on a touch screen a tap never fires.
 * - **On the bar,** as its first two buttons, everywhere but a touch screen (where they are under the thumb): the
 *   1 and 2 keys at a desk, a press on the wrist in a headset. They lead the bar while the item is in hand, so a
 *   narrow screen never leaves one off.
 * - **A click on the view, at a desk,** is the first press, and what it sends out goes where the visitor clicked
 *   (`tap`, which the world calls from its own handling of a press, after its panels). A press held is not: that
 *   is still how they walk. So an item that reloads on a press when it is empty is reloaded by a click.
 * - **At a desk in the intense way of moving,** the mouse button is the first press, since the pointer is the
 *   view's there, and the other mouse button, held, aims along the item's sight where it has one. R is the second
 *   press, in either way of moving.
 * - **In a headset,** the trigger of the hand that holds it is the first press (`trigger`, which the world calls
 *   from its own handling of a trigger, after anything of its console that the hand was pointing at).
 *
 * Nothing is offered while the item in hand does nothing, or its logic isn't running.
 */
import type * as THREE from "three";
import type { Play } from "./play.js";
import type { Controls } from "./ui/model.js";
import { createThumbPresses } from "./thumb-presses.js";
export interface ItemControlsOptions {
    /** What is in play now (`presence.play`), or null in a world with no items. */
    play(): Play | null;
    /** Which hand holds the item in a headset (`presence.holdingHand`): its controller's index, or -1. */
    holdingHand(): number;
    /** The view: a press of the mouse on it, while the pointer is the view's, is the first press. */
    dom?: HTMLElement | null;
    /** They began, or stopped, aiming along the sight of what they hold (`presence.setSighting`). */
    sight?: (on: boolean) => void;
    /** Whether a headset session is running: nothing is put under the thumb then. */
    presenting?: () => boolean;
}
/** A press shorter than this is a tap; one held longer is the visitor walking, as it always was. */
export declare const TAP_MS = 320;
export interface ItemControls {
    /** Call when what is held, or what it does, may have changed. */
    refresh(): void;
    /** A trigger was pressed in a headset, on nothing of the console: true if that was the item's first press. */
    trigger(hand: number): boolean;
    /**
     * The view was pressed, at a desk, on none of the visitor's panels: `ray` is where, and `heldMs` for how long.
     * True if that was the item's first press, sent the way they pressed: the world then does nothing else with it.
     * `pointerType` is the press's own (a `PointerEvent`'s): a touch is never the item's, it is a walk. Left out,
     * the device they last pressed with decides.
     */
    tap(ray: {
        origin: THREE.Vector3;
        direction: THREE.Vector3;
    }, heldMs: number, pointerType?: string): boolean;
    /** What is under the thumb now, for tests. */
    thumbs(): ReturnType<ReturnType<typeof createThumbPresses>["info"]>;
    dispose(): void;
}
export declare function addItemControls(controls: Controls, o: ItemControlsOptions): ItemControls;
