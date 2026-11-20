/**
 * Pressing what is in your hand (protocol/17-items.md): the same two presses on every kind of device.
 *
 * An item that does something says what its presses are called ("Fire", "Reload"). They are offered the way
 * everything else is:
 *
 * - **On the bar,** as its first two buttons: a tap on a phone, the 1 and 2 keys at a desk, a press on the wrist
 *   in a headset. They lead the bar while the item is in hand, so a narrow screen never leaves one off.
 * - **At a desk in the intense way of moving,** the mouse button is the first press, since the pointer is the
 *   view's there. R is the second, in either way of moving.
 * - **In a headset,** the trigger of the hand that holds it is the first press (`trigger`, which the world calls
 *   from its own handling of a trigger, after anything of its console that the hand was pointing at).
 *
 * Nothing is offered while the item in hand does nothing, or its logic isn't running.
 */
import type { Play } from "./play.js";
import type { Controls } from "./ui/model.js";
export interface ItemControlsOptions {
    /** What is in play now (`presence.play`), or null in a world with no items. */
    play(): Play | null;
    /** Which hand holds the item in a headset (`presence.holdingHand`): its controller's index, or -1. */
    holdingHand(): number;
    /** The view: a press of the mouse on it, while the pointer is the view's, is the first press. */
    dom?: HTMLElement | null;
}
export interface ItemControls {
    /** Call when what is held, or what it does, may have changed. */
    refresh(): void;
    /** A trigger was pressed in a headset, on nothing of the console: true if that was the item's first press. */
    trigger(hand: number): boolean;
    dispose(): void;
}
export declare function addItemControls(controls: Controls, o: ItemControlsOptions): ItemControls;
