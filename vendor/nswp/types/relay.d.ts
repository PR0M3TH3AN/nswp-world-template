/**
 * A deliberately small NIP-01 relay client: one REQ per relay, collect until
 * EOSE or timeout, verify every signature locally (spec §5.6). Works in
 * browsers and Node 22+ (global WebSocket).
 */
import { type NostrEvent } from "./event.js";
export interface Filter {
    ids?: string[];
    authors?: string[];
    kinds?: number[];
    since?: number;
    until?: number;
    limit?: number;
    [tag: `#${string}`]: string[] | undefined;
}
export declare const DEFAULT_RELAYS: string[];
/** A person's own relay list (NIP-65): the relays they say they write to and read from. */
export declare const RELAY_LIST_KIND = 10002;
export interface RelayList {
    /** Where they publish: where their notes are sent, and where to look for them. */
    write: string[];
    /** Where they read: where a note that mentions them is sent. */
    read: string[];
}
/**
 * A relay's address as it may be connected to: `wss`, a real host name, no
 * credentials, at most 200 characters. "" for anything else. A list is
 * someone's own say, and still only an address on the open web is dialled:
 * never plain `ws`, a bare machine name, or a number for a machine.
 */
export declare function cleanRelayUrl(url: unknown): string;
/**
 * Read someone's relay list out of what relays returned: their newest kind
 * 10002 event, its `r` tags, cleaned, with no relay twice and at most `max`
 * of each. A tag with no marker is both. Null when they have published none.
 * The events are taken as already checked (`queryRelays` checks every
 * signature); whose they are is checked here.
 */
export declare function readRelayList(events: NostrEvent[], pubkey: string, max?: number): RelayList | null;
/**
 * Where one of someone's notes is sent, and where theirs are looked for
 * (NIP-65): the relays they write to. A list too thin to count on (fewer
 * than two) is filled out from `fallback`, to four in all; with no list, it
 * is `fallback`. `own` says how many of them are the person's own.
 */
export declare function writeRelaysFor(list: RelayList | null, fallback: string[]): {
    relays: string[];
    own: number;
};
/** What is remembered of one relay: how often it answered and how often it didn't, lately, and when it was last tried. */
export interface RelayNote {
    ok: number;
    failed: number;
    /** When it was last tried, in milliseconds. */
    at: number;
}
export type RelayNotes = Record<string, RelayNote>;
export declare const RELAY_PICK: {
    /** A person's own relays are used up to this many. */
    readonly most: 6;
    /** There should be this many that are thought to be working, their own or not. */
    readonly least: 3;
    /** Below this, a relay is thought not to be working. One nothing is known of scores 0.5. */
    readonly working: 0.34;
    /** What is remembered of a relay fades: past this many tries, the counts are halved, so lately counts for more. */
    readonly remembered: 8;
    /** A relay that hasn't been tried for this long is given another chance: what was known of it is forgotten. */
    readonly staleMs: number;
    /** No more relays than this are remembered. */
    readonly kept: 40;
};
/** How far a relay can be counted on, 0 to 1, from what is remembered of it. Nothing known is 0.5. */
export declare function relayScore(note: RelayNote | undefined, now: number): number;
/**
 * What is remembered, after some relays were asked or sent to: `results` is what `queryRelays` or `publishEvent`
 * said of each. "ok" and "eose" are an answer; anything else is none, or a refusal.
 */
export declare function learnRelays(notes: RelayNotes, results: Record<string, string>, now: number): RelayNotes;
/**
 * Where to send something of a person's, and where to look for it.
 *
 * Their own relays come first, always: it is where they said they write, and where anyone looking for them will
 * look. They are put in order of how well they have been answering. If fewer than `least` of them are thought to
 * be working, the best of the usual relays are added, so that what is sent is kept somewhere that is up.
 * `own` is how many of the result are the person's own; `added` is which were added.
 */
export declare function pickRelays(o: {
    own: string[];
    usual: string[];
    notes: RelayNotes;
    now: number;
}): {
    relays: string[];
    own: number;
    added: string[];
};
export interface QueryResult {
    events: NostrEvent[];
    /** Per relay: "eose", "timeout", or an error message. */
    relays: Record<string, string>;
}
export declare function queryRelays(relays: string[], filter: Filter, timeoutMs?: number): Promise<QueryResult>;
/** For addressable events: keep only the newest event per (pubkey, kind, d). */
export declare function latestAddressable(events: NostrEvent[]): NostrEvent[];
export interface PublishResult {
    relays: Record<string, string>;
}
export declare function publishEvent(relays: string[], event: NostrEvent, timeoutMs?: number): Promise<PublishResult>;
