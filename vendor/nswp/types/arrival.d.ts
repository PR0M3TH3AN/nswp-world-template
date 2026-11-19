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
    /**
     * This world is where the visitor starts: the home they chose
     * (protocol/07-homes.md). Said only by their own client, bringing them
     * home. From here "home" leads nowhere new, so the world offers the way to
     * their doors instead.
     */
    home?: true;
    /**
     * The visitor was among people where they came from, and stays among them
     * here: the world joins its open room without asking again. Said only by
     * their own client (protocol/03-arrival.md, "Staying joined").
     */
    joined?: true;
    /**
     * Their microphone was on, and they have told their client it may stay on
     * as they travel. Read only with `joined`. The browser still decides
     * whether this world may use a microphone at all.
     */
    mic?: true;
    /**
     * People the visitor has blocked, by the identity key behind each name:
     * their own client's list, which goes where they go. A world doesn't
     * connect them to anyone on it for this visit, and doesn't keep it
     * (protocol/03-arrival.md, "Blocks that travel").
     */
    blocked?: string[];
    /**
     * How the visitor was moving where they came from, when it was the
     * intense way: at a desk, the mouse looks and keys walk; in a headset,
     * they walk and turn smoothly. A world that offers the two ways starts
     * them in this one. A preference, and theirs to change the moment they
     * arrive. Left out, the casual way.
     */
    moving?: "intense";
    /**
     * What the visitor was using a flat screen with where they came from:
     * their fingers ("touch") or a mouse and keys ("desk"). A world that lays
     * itself out differently for the two starts them the same way, where
     * their device can do both. A preference, and theirs to change by simply
     * using the other. Left out, the world works it out from the device.
     * A headset session is `immersive`.
     */
    form?: "touch" | "desk";
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
