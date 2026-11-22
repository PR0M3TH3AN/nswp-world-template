import type { Controls, UiAction } from "./model.js";
/** Where the preference is kept, for this site. */
export declare const FULL_KEY = "nswp:full";
export declare const prefersFullscreen: () => boolean;
/**
 * Something else is waiting for the visitor's next press (the way back into a headset, ui/headset.ts). A browser
 * gives one press to one thing, so while that is so the screen isn't filled by it.
 */
export declare const holdFullscreen: (on: boolean) => void;
/**
 * A visitor who prefers the world filling their screen has it filling their
 * screen, as early as a browser allows.
 *
 * A browser gives up fullscreen whenever the page changes, and fills the
 * screen again only on a press: nothing a page does can change either. So
 * this is the first thing looked at when a world reads how its visitor
 * arrived, before the place is built or anything is drawn, and it takes the
 * very first press of any kind: a key, a click, a touch, and a key that was
 * already held down as they walked through the door. It keeps trying until
 * the screen is filled. Leaving fullscreen with the browser's own key holds
 * for the rest of this visit, and changes nothing about what they prefer:
 * the next world fills the screen again. Only the control turns it off.
 *
 * `arrival.read()` calls it. A client's own page calls it itself, after
 * saying what the visitor arrived with (`arriveWith`).
 */
export declare function resumeFullscreen(presenting?: () => boolean): void;
/** Whether the screen is still waiting for a press to fill it again. */
export declare const fullscreenWaiting: () => boolean;
export declare function fullscreenAction(controls: Controls, presenting: () => boolean): UiAction;
/** Be told when the browser itself took the visitor out of fullscreen (its own Escape): the menu comes up then. */
export declare function onBrowserLeftFullscreen(fn: () => void): () => void;
/**
 * Hold Escape whenever this page fills the screen, where the browser lets it; and say when the browser took the
 * screen back by itself. Called once, by the control; idempotent.
 */
export declare function watchEscape(): void;
/** Whether Escape is this page's just now: in fullscreen, with the key held by it. */
export declare const escapeHeld: () => boolean;
/**
 * What Escape does, given how things stand. One rule, asked by the menu and by the intense way of moving, so the
 * two never answer the same press differently.
 *
 * - The menu open, in fullscreen with Escape held: leave fullscreen (the menu stays open).
 * - The menu open otherwise: close it.
 * - The menu closed, in fullscreen with Escape held: open it.
 * - The menu closed otherwise: nothing here (moving the intense way, the pointer coming back opens it).
 */
export declare function escapeDoes(state: {
    menuOpen: boolean;
    held: boolean;
}): "leave-fullscreen" | "close-menu" | "open-menu" | "nothing";
/** Leave fullscreen from the page's own doing: not taken for the browser's. */
export declare function leaveFullscreen(): Promise<void>;
/**
 * The small "Full screen" button at the top centre: shown on a desk, where this page may fill the screen and
 * doesn't yet, never in a headset session, and never on a touch screen (a phone that offers fullscreen at all keeps
 * it in the menu). Pressing it fills the screen, as the menu's control does, and keeps that as what they prefer.
 */
export declare const fullscreenButton: {
    shown(): boolean;
    label: string;
    press(controls?: Controls): Promise<void>;
};
