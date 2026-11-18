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
    /**
     * A pass (protocol/10-identity.md): the visitor's identity key saying that
     * `sessionKey` speaks for them at the destination. Present only with
     * `sessionKey`, and only when the visitor chose to go by name.
     */
    pass?: NostrEvent;
    /** The secret half of the session key the pass names, as 64 hex characters. A throwaway, made for this trip. */
    sessionKey?: string;
    /**
     * The visitor left a headset session to make this trip. A world offers the
     * way back into one before anything else (protocol/02-doors.md). It says
     * what they were doing, not who they are.
     */
    immersive?: true;
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
