/**
 * Who the visitor follows, and following and unfollowing someone (protocol/14-people-and-messages.md).
 *
 *   const people = createPeople({ hand });
 *   await people.load();                       // who they follow, from their own relays
 *   people.isFollowing(theirKey);              // true, false, or null while it isn't known
 *   const r = await people.follow(theirKey);   // { ok, why, said }
 *
 * A follow list is one note that is replaced whole, so the one thing this must never do is write a list that
 * leaves people out. Every change starts from the newest list that can be found now, on the person's own relays
 * and the usual ones and on this device, and changes one line of it. If no relay could be reached, nothing is
 * changed. If relays answered and had no list, a first one is written only on a second press.
 *
 * The `hand` is whatever can have the list signed: in a world, the visitor's signer, once they have let that
 * world follow for them; in the visitor's own client, its own signer. Nothing here holds a key.
 */
import { publishEvent, queryRelays, type NostrEvent } from "@nswp/core";
export interface FollowHand {
    /** Whose follows these are: the key signed in here, or null for a guest. */
    pubkey(): string | null;
    /** Whether a change can be signed now, with nothing more asked of the visitor. */
    ready(): boolean;
    /** Have their list signed with one change. `list` null is a first list. Null if it couldn't be. */
    change(list: NostrEvent | null, change: {
        add: string;
    } | {
        remove: string;
    }): Promise<NostrEvent | null>;
}
export interface PeopleOptions {
    hand: FollowHand;
    /** The usual relays: asked beside the person's own, and written to when too few of their own are up. */
    relays?: string[];
    /** Where the newest list is kept on the device. Null keeps nothing. Left out, the browser's own. */
    storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
    now?: () => number;
    query?: typeof queryRelays;
    publish?: typeof publishEvent;
}
export type FollowWhy = "signed-out" | "not-allowed" | "unreachable" | "no-list" | "refused" | "not-sent" | "already";
export interface FollowResult {
    ok: boolean;
    /** Why not, or why nothing changed. */
    why?: FollowWhy;
    /** A sentence to say to the visitor. */
    said: string;
}
export interface People {
    /** Who they follow, as last found. Null while it hasn't been looked for, or for a guest. */
    follows(): string[] | null;
    /** True, false, or null while it isn't known. */
    isFollowing(pubkey: string): boolean | null;
    /** Look for their newest list: on their relays and on this device. Asked again only after a minute, unless `fresh`. */
    load(fresh?: boolean): Promise<string[] | null>;
    follow(pubkey: string, name?: string): Promise<FollowResult>;
    unfollow(pubkey: string, name?: string): Promise<FollowResult>;
    /** Be told when what is known changes. Returns how to stop. */
    onChange(fn: () => void): () => void;
}
export declare function createPeople(opts: PeopleOptions): People;
