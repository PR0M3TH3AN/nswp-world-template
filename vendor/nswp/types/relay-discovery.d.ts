/**
 * Relays that others have found to be working (NIP-66, "Relay Liveness Monitoring"), as a backup for when a
 * person's own relays and the usual ones all fail.
 *
 * A monitor is a key that tries relays and publishes what it found, one note for each relay (kind 30166). Anyone
 * can be a monitor, and a monitor can be wrong or lying. So, as the NIP asks: nothing here is ever needed for a
 * client to work; no single monitor is believed; and what is taken from them is a short list to *try*, which
 * then has to answer like any other relay before it is leaned on.
 *
 * This file is the pure part: reading a monitor's note, and choosing from many of them.
 */
import { type NostrEvent } from "./event.js";
/** What a monitor found of one relay: addressable, one for each relay it watches. NIP-66. */
export declare const RELAY_DISCOVERY_KIND = 30166;
/** Where monitors' notes are looked for, beside the usual relays: relays that keep them. */
export declare const DISCOVERY_RELAYS: readonly string[];
export declare const DISCOVERY: {
    /** A finding older than this says nothing about now, in seconds. */
    readonly freshSec: number;
    /** A relay is taken only where this many different monitors found it working. */
    readonly agree: 2;
    /** No more than this many are offered as a backup. */
    readonly most: 6;
    /** A relay slower to open than this, by every monitor's count, is no backup, in milliseconds. */
    readonly slowMs: 2500;
};
/** What one monitor found of one relay. A thing it didn't say is null. */
export interface RelayFinding {
    url: string;
    monitor: string;
    /** When, in seconds. */
    at: number;
    /** Whether a reader or writer has to prove who they are. */
    auth: boolean | null;
    payment: boolean | null;
    /** Whether writing is restricted to some people. */
    restricted: boolean | null;
    pow: boolean | null;
    /** How long it took to open, in milliseconds. */
    rttOpen: number | null;
    /** How long a write took, where the monitor wrote something to it and it was taken. */
    rttWrite: number | null;
    /** Kinds it says it won't take. */
    refuses: number[];
}
/**
 * Read a monitor's note. Null unless it is one, about a relay this library would dial at all: a public `wss`
 * address on the open internet. A relay on another network (tor, i2p) is not for a browser.
 */
export declare function readRelayFinding(event: NostrEvent | null | undefined): RelayFinding | null;
export interface DiscoveredRelays {
    /** Relays to try as a backup, best first: found open, by more than one monitor, lately. */
    open: string[];
    /** Relays some monitor found closed to a stranger: asking for proof of who they are, or payment. */
    closed: string[];
}
/**
 * Choose from what monitors found. `open` is a short list to try when everything a person chose has failed.
 * `closed` is for leaving a relay out of somewhere a stranger has to be able to read or write.
 *
 * - Only a finding made lately counts, and each monitor's newest of each relay.
 * - A relay is open only where at least two monitors found it so, and none found that it asks for proof of
 *   who someone is, for payment, for work, or keeps writing to a few. One monitor is never believed alone.
 * - `kind`, where given, leaves out a relay any monitor says refuses that kind.
 * - `not` leaves out relays already known: there is no use offering as a backup what was just tried.
 */
export declare function pickDiscovered(events: readonly NostrEvent[], o: {
    now: number;
    not?: readonly string[];
    kind?: number;
    most?: number;
}): DiscoveredRelays;
