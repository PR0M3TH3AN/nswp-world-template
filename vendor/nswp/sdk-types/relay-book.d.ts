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
/** Where to send something of a person's, or look for it: their own relays, best first, and the usual ones if too few of theirs are up. */
export declare function relaysWell(o: {
    own: string[];
    usual: string[];
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
 * Send something to the relays that are working. If none of the first choice takes it, the rest of the usual
 * relays are tried once: something signed should not be lost because the first few were down.
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
