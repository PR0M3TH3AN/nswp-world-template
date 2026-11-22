import { type EventTemplate } from "./event.js";
import { type Result } from "./result.js";
/**
 * Ceilings a reader enforces whatever a list claims. `ahead`: how far ahead of the reader's clock a copy may be
 * dated, in seconds, and still be chosen.
 */
export declare const LIST_LIMITS: {
    readonly worlds: 200;
    readonly titleChars: 200;
    readonly descriptionChars: 1000;
    readonly ahead: 600;
};
export interface ListInput {
    /** The list's name under its curator's key. */
    d: string;
    title: string;
    description?: string;
    /** World coordinates, `37300:<pubkey>:<d>`, in the order to show them. */
    worlds: string[];
    createdAt?: number;
}
export interface WorldList {
    d: string;
    /** The curator's title, or the list's `d` when it has none. */
    title: string;
    description: string;
    /** World coordinates, in the curator's order, each once. */
    worlds: string[];
    createdAt: number;
    /** The curator's key, when the event carries one. */
    pubkey?: string;
    /** `30004:<pubkey>:<d>`: what a client follows. */
    coordinate?: string;
}
/** A list event, ready to sign. */
export declare function buildListEvent(l: ListInput): EventTemplate;
export interface ParseListOptions {
    /** Require `id`, `pubkey` and `sig` fields (the signature itself is checked by `verifyEvent`). */
    requireSigned?: boolean;
}
/** Read a list. Anything on it that isn't a world is passed over; too many worlds are cut off with a warning. */
export declare function parseListEvent(input: unknown, opts?: ParseListOptions): Result<WorldList>;
/** The list as chosen from what relays gave: the newest good copy, or null; and the copies left out for being dated ahead. */
export interface ListChosen {
    list: WorldList | null;
    /** The id of the copy chosen, or null. */
    id: string | null;
    /** The ids of copies left out for being dated more than `LIST_LIMITS.ahead` seconds ahead: worth saying. */
    futureDated: string[];
}
/**
 * Choose a list from whatever relays gave for its coordinate (`30004:<pubkey>:<d>`): the copies of that kind,
 * signed by that key, with exactly that `d` and a good signature. Those dated more than ten minutes ahead of `now`
 * are left out first, and named in `futureDated`. The newest of the rest is the list, a tie going to the smallest
 * id (NIP-01). Anything else relays sent is passed over.
 */
export declare function resolveList(events: readonly unknown[], q: {
    coordinate: string;
    now?: number;
}): ListChosen;
