/**
 * Who a visitor follows (protocol/14-people-and-messages.md): Nostr's own follow list, NIP-02, kind 3.
 *
 * Following someone is nothing NSWP invented, and a visitor's follows are the same here as in every other Nostr
 * client. What this file adds is how the list is changed without losing any of it.
 *
 * A follow list is one note that is replaced whole. A client that writes a new one from an old copy, or from
 * nothing, wipes out everyone the person followed: it is the best-known way to lose a follow list. So a change
 * here is always made to the newest list that could be found, keeps everything in it that this file doesn't
 * understand, and is refused when there is no list to change unless the caller says the person truly has none.
 *
 * Nothing here signs anything or talks to a relay. A world can't have a follow list of its own making signed
 * (signing.ts: the kind is "careful", and `sign` refuses it). A world its visitor has let follow for them hands
 * the signer their newest list and one change, and the signer makes it: `followForWorld`, below.
 */
import { type EventTemplate, type NostrEvent } from "./event.js";
/** Who someone follows: NIP-02. A relay keeps the newest. */
export declare const FOLLOWS_KIND = 3;
/** The people a follow list names, in its order, each once. Empty for anything that isn't one. */
export declare function followsIn(event: Pick<NostrEvent, "tags"> | null | undefined): string[];
/**
 * The newest follow list by this person among what relays returned, or null when there is none. The events are
 * taken as already checked (`queryRelays` checks every signature); whose they are is checked here.
 */
export declare function newestFollows(events: readonly NostrEvent[], pubkey: string): NostrEvent | null;
export interface FollowChange {
    /** Someone to begin following. */
    add?: string;
    /** Someone to stop following. */
    remove?: string;
    /** Where the person being followed can be found, as a hint for other clients. */
    relay?: string;
    /** Now, in seconds. */
    now: number;
    /**
     * Write a list where none was found. Only when the person has said they follow nobody yet: a list written from
     * nothing replaces one that merely couldn't be reached.
     */
    fromNothing?: boolean;
}
/**
 * A follow list with one person added or taken out, ready to be signed by its owner. Null when there is nothing
 * to sign: no change asked for, a key that isn't one, following oneself, someone already followed, someone not
 * followed, or no list to change (see `fromNothing`).
 *
 * Everything else in the list is kept as it was and in its order: other people, the relay and the name each was
 * written with, tags of other kinds, and the content, where older clients keep their relays.
 */
export declare function changeFollows(newest: Pick<NostrEvent, "kind" | "pubkey" | "created_at" | "tags" | "content"> | null, change: FollowChange): EventTemplate | null;
/**
 * A world may be let change who its visitor follows (protocol/14-people-and-messages.md, "From inside a world").
 * How often: the pace of a person pressing a button, never of a script.
 */
export declare const FOLLOW_LIMITS: {
    readonly burst: 6;
    readonly perMs: 60000;
    readonly hourly: 60;
};
/**
 * What a signer does when a world it was allowed to asks for one person to be followed or unfollowed: the
 * world hands over the newest follow list it found, and the one change. The list must be the visitor's own, with
 * a real signature, so a world can't have a list of its own making signed: only one that the visitor signed
 * before, with one line changed. Null for anything else.
 *
 * `list` null is "they have none yet". A signer that has seen a list of theirs before should refuse that, and
 * refuse one older than the newest it has seen: pass that list's time as `seen`.
 */
export declare function followForWorld(o: {
    list: unknown;
    add?: unknown;
    remove?: unknown;
    pubkey: string;
    now: number;
    seen?: number;
}): EventTemplate | null;
/**
 * Whether a follow list a signer handed back is the one that was asked for: the visitor's own, really signed,
 * and exactly the list that was handed over with that one change. A world checks this before it sends it on.
 */
export declare function isFollowAsked(signed: unknown, o: {
    list: NostrEvent | null;
    add?: string;
    remove?: string;
    pubkey: string | null;
}): signed is NostrEvent;
