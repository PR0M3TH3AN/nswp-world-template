/**
 * A visitor's bag: the items they have, and putting one in or taking one out (protocol/17-items.md).
 *
 *   const bag = createBag({ hand });
 *   await bag.load();                 // their bag, from their own relays
 *   await bag.add(itemsCoordinate);   // { ok, why, said }
 *
 * A bag is one note that is replaced whole, like a follow list. So it is changed the way a follow list is
 * (people.ts): from the newest that can be found now, one item at a time, with everything else kept; nothing is
 * changed when no relay could be reached; and a first bag is written only on a second press.
 *
 * The `hand` is whatever can have the bag signed. Reading a bag needs none: a bag is public.
 */
import { publishEvent, queryRelays, type NostrEvent } from "@nswp/core";
export interface BagHand {
    /** Whether a change can be signed now, with nothing more asked of the visitor. */
    ready(): boolean;
    /** Have a changed bag signed. Null if it couldn't be. */
    sign(bag: {
        kind: number;
        created_at: number;
        tags: string[][];
        content: string;
    }): Promise<NostrEvent | null>;
}
export interface BagOptions {
    /** Whose bag: the key signed in here, or null for a guest. */
    me(): string | null;
    /** What signs a change, where this place can: a visitor's own client. Left out, the bag can only be read. */
    hand?: BagHand | null;
    relays?: string[];
    storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
    now?: () => number;
    query?: typeof queryRelays;
    publish?: typeof publishEvent;
}
export interface BagResult {
    ok: boolean;
    why?: "signed-out" | "read-only" | "not-allowed" | "unreachable" | "no-bag" | "refused" | "not-sent" | "already";
    said: string;
}
export interface Bag {
    /** The items in it, as last found. Null while it hasn't been looked for, or for a guest. */
    items(): string[] | null;
    /**
     * While a look goes on past its first answers, in waves through the rest of their relays: how many of their own
     * relays have been asked, of how many. Null otherwise. For a line that says it is still looking, and how far.
     */
    looking(): {
        asked: number;
        of: number;
    } | null;
    load(fresh?: boolean): Promise<string[] | null>;
    /** Whether this place can change it at all. */
    canChange(): boolean;
    add(item: string, title?: string): Promise<BagResult>;
    remove(item: string, title?: string): Promise<BagResult>;
    /**
     * The colours they chose for one of their things (protocol/17-items.md, "A holder's own colours"): what this
     * device keeps for this place, over what their bag says. Empty where they chose none.
     */
    tints(item: string): Record<string, string>;
    /**
     * Choose them. They are kept on this device at once. Where this place can change the bag, they are written into
     * it a moment after the last change, so that they go with the thing to every world; elsewhere they are for here.
     */
    setTints(item: string, tints: Record<string, string>): void;
    onChange(fn: () => void): () => void;
}
export declare function createBag(opts: BagOptions): Bag;
