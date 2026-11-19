export { bump, check, claim, door, events, headset, kit, menu, moved, play, presence, say, target } from "./engine-menu.js";
/** Bumped when what the functions take or give changes, so an engine's side can tell. */
export declare const VERSION = 3;
/**
 * How the visitor arrived, as JSON. Reading it takes it out of the page's
 * address, as it must be: an arrival is for this visit and not for whoever
 * the address is shared with next.
 *
 * `form` is how to lay things out for them on a flat screen: "touch" or
 * "desk". It is how they were in the place they came from, where this device
 * can do the same, and otherwise what the device is.
 *
 * `arrived` is false for someone who came by an ordinary link, and every
 * other field then has its plain value. `name` and `pubkey` are filled only
 * when they came by name and their pass checks out for this site; otherwise
 * `guest` is true. `canGoHome` says whether `home()` would lead anywhere.
 */
export declare function arrival(): string;
/**
 * Call once when the page comes up. `options` is JSON: `airlock` is the
 * Airlock to send a visitor through when they arrived without one of their
 * own. Returns what `arrival()` returns.
 */
export declare function start(options?: string): string;
/**
 * Send the visitor through a door. `destination` is JSON with `url`, and
 * `naddr` and `entryPoint` if the door has them. `state` is JSON saying how
 * they are leaving: `immersive` (from a headset session, which the engine
 * ends first), `joined`, `mic`, `moving`, `blocked`.
 *
 * Returns "" when they are on their way, or one word for why not: the page
 * is about to be left, so there is nothing to wait for.
 */
export declare function go(destination: string, state?: string): string;
/** Take the visitor home: their own client's start. Returns false, and does nothing, when there is no way there. */
export declare function home(state?: string): boolean;
/** Take the visitor to their doors: for a world that is someone's home, which offers this where it offers the way home. */
export declare function doors(state?: string): boolean;
