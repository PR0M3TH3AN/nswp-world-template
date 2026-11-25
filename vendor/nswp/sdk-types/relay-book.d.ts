/**
 * Which relays have been working, remembered on this device, and a way to send something to the ones that are.
 *
 *   const sent = await sendWell(event, { own: theirWriteRelays, usual: DEFAULT_RELAYS });   // { took, relays, own }
 *
 * A person's own relays are always used: it is where they said they write. What this adds is the order (the ones
 * that have been answering, first), a few of the usual relays when too few of their own are up, and one more
 * try elsewhere if nothing took it. What it learns stays on the device, is about relays and never about people,
 * and is never sent anywhere.
 */
import { publishEvent, queryRelays, type DiscoveredRelays, type Filter, type NostrEvent, type QueryResult } from "@nswp/core";
/** Remember how these relays answered: what `queryRelays` or `publishEvent` said of each. */
export declare function learnFrom(results: Record<string, string>, now?: number): void;
/**
 * Where to send something of a person's, or look for it: their own relays, best first, and the usual ones if too few
 * of theirs are up. `for` leaves out relays found closed to reading or to writing; `usualAtLeast` makes sure of that
 * many usual relays among them.
 */
export declare function relaysWell(o: {
    own: string[];
    usual: string[];
    for?: "read" | "write";
    usualAtLeast?: number;
}, now?: number): {
    relays: string[];
    own: number;
    added: string[];
};
export interface SentWell {
    /** How many relays took it. */
    took: number;
    /** Every relay that was tried. */
    relays: string[];
    /** How many of those were the person's own. */
    own: number;
}
/**
 * Send something of a person's to the relays that are working, until `RELAY_PICK.took` of them said they took it.
 *
 * - Their own relays, best first, and always at least `RELAY_PICK.usual` of the usual ones as well: a world that
 *   hasn't their relay list yet looks only there. Never for a wrapped private message, which goes only where its
 *   reader said.
 * - Where fewer than `RELAY_PICK.took` took it, the rest of the usual relays are tried once. `took` says how many
 *   took it in all, for the caller to say so where it is fewer, and to send it again.
 * - Relays found closed to writing take no place.
 */
export declare function sendWell(event: NostrEvent, o: {
    own: string[];
    usual: string[];
    publish?: typeof publishEvent;
    query?: typeof queryRelays;
    now?: () => number;
}): Promise<SentWell>;
/** Ask the relays that are working, and remember how each answered. */
export declare function askWell(filter: Filter, o: {
    own: string[];
    usual: string[];
    query?: typeof queryRelays;
    timeoutMs?: number;
    now?: () => number;
}): Promise<QueryResult>;
/** What a look for a person's own note found: the notes, and whether there is none or it couldn't be looked for. */
export interface AskedOwn {
    events: NostrEvent[];
    /** "found": something came back. "none": enough relays answered to the end and none had it. "unreached": too few answered to say. */
    state: "found" | "none" | "unreached";
    /** Per relay asked: "eose", "timeout", or what it said instead. */
    relays: Record<string, string>;
    /** Their own relays, as their relay list gives them; empty where none was found. */
    own: string[];
}
/**
 * A person's own relays, as their relay list gives them, for sending something of theirs: by the same rules as a
 * look (`askOwn`). The visitor's own list (`mine`) is kept on their device once known and used at once, while a
 * newer one is asked for behind; anyone else's is kept for the page's life. A list not found is never kept: it is
 * asked for again next time. Empty where none was found.
 */
export declare function relaysOf(who: string, o: {
    usual: string[];
    mine?: boolean;
    query?: typeof queryRelays;
    publish?: typeof publishEvent;
    now?: () => number;
}): Promise<string[]>;
/**
 * Look for a person's own note: `filter` asks for it, `who` is whose it is.
 *
 * - Their relay list is asked for on the usual relays while the usual relays are asked for the note, and waited
 *   for up to `RELAY_PICK.listWaitMs`. When it comes, their own relays, best first, are asked too. The visitor's own
 *   list, once known, is kept on their device and used at once next time while a newer one is asked for. A list
 *   not found is never kept: it is asked for again next time.
 * - `mine`, the visitor's own note on their own device: where nothing was found, the rest of their listed relays
 *   (up to `RELAY_PICK.listed`) are asked in waves of `RELAY_PICK.wave`, each waited for `RELAY_PICK.waveMs`; then
 *   each relay that ran out of time is asked once more, waited for `RELAY_PICK.lateMs`. `onWave` is told as each wave begins (its number, and how many of their own relays are asked with it, of how many)
 *   begins. Their newest note, found or `mine.kept` on the device, is put back where it is missing (`RELAY_PICK.mend`).
 *   Anyone else's note gets the first look and no more: no waves, nothing put back.
 * - "none" only once every relay there was to ask was asked, and at least half of those asked answered to the end,
 *   and never fewer than three of them (or all, where fewer than three could be asked). Otherwise "unreached".
 * - Relays found closed to reading take no place. One that answered with a challenge to sign in and then to the end
 *   answered like any other.
 * - Where nobody answered at all, a few relays monitors found working are asked, as `askWell` does.
 */
export declare function askOwn(filter: Filter, who: string, o: {
    usual: string[];
    mine?: {
        kept?: NostrEvent | null;
    } | false;
    query?: typeof queryRelays;
    publish?: typeof publishEvent;
    timeoutMs?: number;
    now?: () => number;
    onWave?: (wave: number, asked: number, of: number) => void;
    onNewer?: (got: AskedOwn) => void;
}): Promise<AskedOwn>;
/** Whether the backup is used, and the way to turn it off or on for this page. On unless turned off. */
export declare function relayBackup(on?: boolean): boolean;
/**
 * What relay monitors have found (NIP-66): relays to try as a backup, and relays that are closed to a stranger.
 * Asked for once a day at most, from relays that keep monitors' notes, and kept on the device. It is asked for
 * only when it is needed: when everything else has failed, or when a visitor is choosing where their private
 * messages should reach them. Empty, never an error, when no monitor could be asked.
 */
export declare function foundRelays(o?: {
    not?: readonly string[];
    query?: typeof queryRelays;
    now?: () => number;
}): Promise<DiscoveredRelays>;
/**
 * Ask relays, and where none of them answers, ask a few that monitors have found working. The same call as the
 * core's `queryRelays`: for anything that asks relays and would rather have an answer than none.
 */
export declare function queryBacked(relays: string[], filter: Filter, timeoutMs?: number, o?: {
    query?: typeof queryRelays;
    now?: () => number;
}): Promise<QueryResult>;
/**
 * Send something to relays, and where none of them takes it, to a few that monitors have found working. The same
 * call as the core's `publishEvent`.
 *
 * Never for a wrapped private message: that goes where its reader said their messages reach them, and nowhere
 * else, or it is never read.
 */
export declare function publishBacked(relays: string[], event: NostrEvent, o?: {
    publish?: typeof publishEvent;
    query?: typeof queryRelays;
    now?: () => number;
}): Promise<{
    relays: Record<string, string>;
}>;
/** For tests: forget everything. */
export declare function forgetRelays(): void;
