import type { Controls, UiAction } from "./model.js";
/** Where the preference is kept, for this site. */
export declare const FULL_KEY = "nswp:full";
export declare const prefersFullscreen: () => boolean;
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
