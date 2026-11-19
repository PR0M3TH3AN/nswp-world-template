export { bump, check, claim, door, events, headset, kit, menu, moved, open, play, presence, run, say, target, view } from "./engine-menu.js";
/** Bumped when what the functions take or give changes, so an engine's side can tell. */
export declare const VERSION = 7;
/** The kit this script was built from, as a world's manifest should say it (`"kit": NSWP.KIT`). */
export declare const KIT = "0.27.0";
/**
 * How the visitor arrived, as JSON. Reading it takes it out of the page's
 * address, as it must be: an arrival is for this visit and not for whoever
 * the address is shared with next.
 *
 * `form` is how to lay things out for them on a flat screen: "touch" or
 * "desk". It is how they were in the place they came from, where this device
 * can do the same, and otherwise what the device is.
 *
 * `settings` is what they had set where they came from (volumes, text size
 * and the rest). The menu and the sounds here begin from them already; an
 * engine with an interface of its own may read them too.
 *
 * `arrived` is false for someone who came by an ordinary link, and every
 * other field then has its plain value. `name` and `pubkey` are filled only
 * when they came by name and their pass checks out for this site; otherwise
 * `guest` is true. `canGoHome` says whether `home()` would lead anywhere, and
 * `signIn()` with it: both go to the visitor's own client.
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
/**
 * The visitor asked to say who they are: to sign in, switch to another
 * profile, or go on as a guest. A world never asks that itself, so this
 * leaves for their own client, which asks them in its own way and brings them
 * back here, by name if they chose that. The menu offers it; call this from a
 * button of your own if you draw one. Returns false, and does nothing, when
 * they came through no client.
 */
export declare function signIn(state?: string): boolean;
/**
 * The visitor asked to change how they look. Their look is kept by their own
 * client and is the same in every world, so this leaves for it and brings
 * them back here wearing it. The menu offers it (a `figure` event); call this
 * then, or from a button of your own. A world never edits a look itself.
 */
export declare function changeLook(state?: string): boolean;
/** Take the visitor to their doors: for a world that is someone's home, which offers this where it offers the way home. */
export declare function doors(state?: string): boolean;
