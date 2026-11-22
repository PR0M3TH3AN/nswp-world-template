import type { ItemBoxOptions } from "./item-box.js";
import { type Items } from "./items.js";
import { type Presence } from "./presence.js";
/**
 * What fetches and checks everything an item names. Made when first needed, by which time its relays are known.
 * It can also make a model of an item for the page to draw: the Bag tab's pictures are drawn by the page, in
 * every world (item-preview.ts). What is in the world itself is the engine's to draw, from the checked bytes.
 */
export declare function engineItemStore(): Items;
/** The world's engine says what it does with items (`NSWP.items`). Until then nothing carried is fetched, drawn or run. */
export declare function engineAllowsItems(rule: unknown, scripts: boolean | ItemBoxOptions, relays?: string[]): string;
/** Be told when who is here, what anyone holds or how the visitor is may have changed. */
export declare function onEnginePresence(fn: () => void): void;
/** The presence, made when first asked for. Null until the world has its menu. */
export declare function enginePresence(): Presence | null;
/**
 * Where the visitor should arrive (protocol/01-worlds.md, "Places to arrive"; `NSWP.entryPlace`): `json` is the
 * places of the entry point they came by, as the engine's scene has them (`places`: each `position` [x, y, z] and
 * `yaw`, its own spot first; only places a visitor may stand on), and `least` if the world is for meeting people (8).
 * Fewer than the least are filled with a ring round the first. Returns JSON with `index` and the `place` to stand
 * them on, picked with whoever is in the room the visitor has joined, if any; and keeps the places, so that if they
 * join and find themselves inside someone the kit steps them aside (a frame's `nudge`).
 */
export declare function entryPlace(json?: string): string;
