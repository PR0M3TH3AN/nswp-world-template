/**
 * Passes (protocol/10-identity.md): how a visitor is known by name in a world
 * that never holds their key.
 *
 * The visitor's own client makes a throwaway session key for one trip and
 * signs a pass with their identity key: "at this site, until this time, this
 * session key speaks for me". The world is handed the pass and the session
 * key. Anyone who checks the pass knows which identity is behind the session
 * key, and the identity key itself never leaves the client.
 */
import { type EventTemplate } from "./event.js";
import { type Result } from "./result.js";
export declare const PASS_LIMITS: {
    readonly defaultTtlSec: number;
    readonly maxTtlSec: number;
    /** How far a reader's clock and a signer's may disagree. */
    readonly skewSec: 120;
    readonly nameChars: 48;
    /** A pass as JSON, as it travels between the members of a room. */
    readonly chars: 4000;
};
/**
 * A name as it may be shown: one line, no control or formatting characters,
 * no doubled spaces, at most 48 characters. Returns "" when nothing is left.
 */
export declare function cleanName(name: string): string;
/** A seed that is a public key is a claim to that key. Only a pass makes the claim good. */
export declare function claimsKey(seed: string): boolean;
export interface RoomPassInput {
    /** The session public key the pass speaks for. */
    session: string;
    /** The world's address, or its origin. The pass is good at that origin and nowhere else. */
    origin: string;
    /** The name to be known by. Cleaned; left out when nothing is left. */
    name?: string;
    createdAt?: number;
    ttlSec?: number;
}
/** A pass, ready for the identity key to sign. */
export declare function buildRoomPass(input: RoomPassInput): EventTemplate;
export interface VerifyPassOptions {
    /** The origin of the world doing the checking. */
    origin: string;
    /** The session key the pass must speak for: the key the member is using. */
    session?: string;
    now?: number;
}
export interface VerifiedPass {
    /** The identity behind the session key. */
    pubkey: string;
    session: string;
    /** The name they chose to be known by, cleaned, or "" for none. */
    name: string;
    expiresAt: number;
    id: string;
}
/** Check a pass. Nothing about it is believed until this says so. */
export declare function verifyRoomPass(event: unknown, opts: VerifyPassOptions): Result<VerifiedPass>;
