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
import { publishEvent, queryRelays, type Filter, type NostrEvent, type QueryResult } from "@nswp/core";
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
/** For tests: forget everything. */
export declare function forgetRelays(): void;
