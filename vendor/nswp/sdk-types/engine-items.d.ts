/**
 * Begin. Call once, after `menu`. `options` is JSON: `rule`, what this world does with items ("allowed" or "play":
 * it must be what the world's announcement says), `box`, where the page serves the locked box for an item's own
 * logic (left out, `item-box.html` beside the page; `false` for none, and items are then shapes), and `relays`.
 * Returns `{ ok, rule }`. With no rule, or "none", there is nothing to begin: nothing carried is drawn here.
 */
export declare function items(options?: string): string;
/**
 * A model's bytes, as base64, by the hash its file is named by (`held.model`, `things[].model`). They have been
 * fetched, checked against that hash and counted: the engine reads them as a binary glTF. "" while they are on
 * their way, and "!" where the file failed a check: then a plain box of the thing's size is drawn in its place.
 */
export declare function model(sha: unknown): string;
/**
 * The view was pressed, on none of the engine's own controls: `press` is JSON with `from` and `dir`, where the
 * press points from and which way, and `heldMs`, how long it was held. True if that was the item's first press
 * (a tap, with something in hand that does something), sent the way they pressed: the engine then does nothing
 * else with it. A press held is still how they walk.
 */
export declare function itemTap(press?: string): boolean;
/** The item's first press, from a control of the engine's own (a trigger in a headset). `toward` is where to send what it sends out, or nothing for where they look. */
export declare function itemUse(toward?: string): boolean;
/** What is in play for this visitor, as JSON: for tests. */
export declare function itemsInfo(): string;
/** The item's second press. */
export declare function itemSecond(): boolean;
