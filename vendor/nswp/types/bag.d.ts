/**
 * What a person has: their bag (protocol/17-items.md, "A visitor's bag").
 *
 * A bag is a list of items, by their coordinates, kept by the person whose it is: ones they made, ones they took
 * up from someone else's site, ones a world gave them. It is one note, signed by their key, and public: what
 * someone carries is on show anyway.
 *
 * Like a follow list (people.ts), it is replaced whole each time. So it is changed the same careful way: from the
 * newest that can be found, one line at a time, keeping everything else, and never written from nothing unless
 * the person has said they have none.
 *
 * Nothing here signs anything or talks to a relay.
 */
import { type EventTemplate, type NostrEvent } from "./event.js";
/** A person's bag: addressable, one for each person. Experimental; not allocated by the NIPs process. */
export declare const BAG_KIND = 37308;
/** The one name a bag is kept under. */
export declare const BAG_D = "bag";
export declare const BAG_LIMITS: {
    /** No more than this many items are read from a bag. */
    readonly items: 200;
};
/** An item's coordinate as it may be used: `37303:<maker>:<name>`. "" for anything else. */
export declare function itemCoordinate(input: unknown): string;
/** The items a bag names, in its order, each once. Empty for anything that isn't one. */
export declare function bagIn(event: Pick<NostrEvent, "tags"> | null | undefined): string[];
/** The newest bag by this person among what relays returned, or null. Whose it is, is checked here. */
export declare function newestBag(events: readonly NostrEvent[], pubkey: string): NostrEvent | null;
/**
 * A bag with one item put in or taken out, ready to be signed by its owner. Null when there is nothing to sign:
 * no change asked for, something that isn't an item, one already there, one that isn't, or no bag to change
 * unless `fromNothing` says the person truly has none. Everything else in it is kept as it was.
 */
export declare function changeBag(newest: Pick<NostrEvent, "kind" | "created_at" | "tags"> | null, change: {
    add?: string;
    remove?: string;
    relay?: string;
    now: number;
    fromNothing?: boolean;
}): EventTemplate | null;
