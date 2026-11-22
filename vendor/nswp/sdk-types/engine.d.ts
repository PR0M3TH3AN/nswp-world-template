export { bump, check, claim, door, events, gate, headset, jumped, kit, load, menu, moved, offers, open, play, presence, run, save, say, target, view, who } from "./engine-menu.js";
export { frame } from "./engine-world.js";
export { entryPlace } from "./engine-presence.js";
export { items, itemSecond, itemsInfo, itemTap, itemUse, model } from "./engine-items.js";
export { board, figure, people, peopleInfo } from "./engine-people.js";
export { capturePreview, previewFaces, previewViews } from "./engine-panorama.js";
/** Bumped when what the functions take or give changes, so an engine's side can tell. */
export declare const VERSION = 17;
/** The kit this script was built from, as a world's manifest should say it (`"kit": NSWP.KIT`). */
export declare const KIT = "0.82.0";
/** Where the crossing's room is: "arriving" (doors shut, the world loading), "opening", "none", "leaving", "shut", or "failed". */
export declare function crossing(): string;
/**
 * How much of the world has arrived, from 0 to 1, or anything else (-1, say) for "loading, and nobody knows how much".
 *
 * - **Before the doors open,** the line of light over them fills. The page that starts the engine calls this as the
 *   engine downloads. `words` aren't shown there: the room's sign is the world's name and address.
 * - **Once the visitor is in** (after `ready()`, or asking for the menu, or on a page with no room), it is a line in the
 *   visitor's menu: `words` (plain text, at most 80 characters, "Loading the arena") and how far along. The menu,
 *   the way home and everything else work throughout. `loaded()`, or `loading(1)`, ends it.
 *
 * So a world that takes a while to be playable opens the doors as soon as there is something to see, and says what
 * it is still loading meanwhile, rather than keeping the visitor in the room.
 */
export declare function loading(fraction: number, words?: string): void;
/** The world has finished loading: the line in the visitor's menu that said it was still loading goes. */
export declare function loaded(): void;
/**
 * The world is ready to be stepped into: the doors open. Asking for the menu does this by itself, so a world calls
 * it only if it asked for its menu with `hold` true, to open the doors at a moment of its own choosing.
 */
export declare function ready(): void;
/** The world couldn't start: the doors stay shut, and the sign says why. Plain words, shown as text. */
export declare function failed(words: string): void;
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
 * for someone signed in here, whose pass checks out for this site; otherwise
 * `guest` is true. It changes when they sign in or out in the menu: ask `who()`
 * when a `who` event comes. `canGoHome` says whether `home()` would lead anywhere, and
 * `signIn()` with it: both go to the visitor's own client.
 */
export declare function arrival(): string;
/**
 * Call once when the page comes up. `options` is JSON: `airlock` is the
 * Airlock to send a visitor through when they arrived without one of their
 * own, and `signer` the sign-in address offered to a visitor no client
 * brought. Returns what `arrival()` returns.
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
