import { bytesToHex } from "@noble/hashes/utils.js";
import { type EventTemplate, type NostrEvent } from "./event.js";
import { type Result } from "./result.js";
export interface Arrival {
    v: string;
    entry?: string;
    /** Return address for outbound portals (spec §6.3). */
    airlock?: string;
    assertion?: NostrEvent;
    avatar?: string;
    /** The visitor's look, inline (spec §4.2): for someone who hasn't published an avatar. */
    look?: string;
    receipts?: NostrEvent[];
}
export declare function encodeArrival(a: Omit<Arrival, "v"> & {
    v?: string;
}): string;
/** Decode and validate the value of `#nswp=`. Never trusts its contents: verify assertions and receipts separately. */
export declare function decodeArrival(value: string): Result<Arrival>;
/** Append `nswp=<arrival>` to a destination's fragment, keeping any existing fragment. */
export declare function buildArrivalUrl(destination: string, arrival: Omit<Arrival, "v">): string;
/** Find `nswp=` in a fragment. Returns the raw value, or null. */
export declare function arrivalParam(hash: string): string | null;
/** The fragment with `nswp=` removed (for `history.replaceState` scrubbing). */
export declare function stripArrivalParam(hash: string): string;
export declare function randomNonce(): string;
export interface EntryAssertionInput {
    /** The destination URL the user is entering. */
    url: string;
    nonce?: string;
    createdAt?: number;
    ttlSec?: number;
    /** Ask the world to apply the user's public NIP-51 mute list. */
    shareMutes?: boolean;
}
export declare function buildEntryAssertion(input: EntryAssertionInput): EventTemplate;
export interface VerifyAssertionOptions {
    /** The verifying world's own origin, e.g. `https://museum.example`. */
    origin: string;
    now?: number;
    /** Event IDs already accepted; a hit means replay. Servers must persist these until expiry. */
    seen?: {
        has(id: string): boolean;
    };
}
export interface VerifiedAssertion {
    pubkey: string;
    id: string;
    expiresAt: number;
    shareMutes: boolean;
}
export declare function verifyEntryAssertion(event: unknown, opts: VerifyAssertionOptions): Result<VerifiedAssertion>;
/** Hex helper re-exported for callers that store nonces as hex. */
export declare const toHex: typeof bytesToHex;
