import type { ItemBoxOptions } from "./item-box.js";
import { type ItemStore } from "./item-store.js";
import { type Presence } from "./presence.js";
/** What fetches and checks everything an item names. Made when first needed, by which time its relays are known. */
export declare function engineItemStore(): ItemStore;
/** The world's engine says what it does with items (`NSWP.items`). Until then nothing carried is fetched, drawn or run. */
export declare function engineAllowsItems(rule: unknown, scripts: boolean | ItemBoxOptions, relays?: string[]): string;
/** Be told when who is here, what anyone holds or how the visitor is may have changed. */
export declare function onEnginePresence(fn: () => void): void;
/** The presence, made when first asked for. Null until the world has its menu. */
export declare function enginePresence(): Presence | null;
