import { type EventTemplate } from "./event.js";
import { type Result } from "./result.js";
export declare const PASS_LIMITS: {
    readonly defaultTtlSec: number;
    readonly maxTtlSec: number;
    /** How far a reader's clock and a signer's may disagree. */
    readonly skewSec: 120;
    readonly nameChars: 48;
    /** The longest address a picture may have. */
    readonly pictureChars: 300;
    /** The most a pass says about its holder, in their own words. */
    readonly aboutChars: 280;
    /** A pass as JSON, as it travels between the members of a room. */
    readonly chars: 4000;
};
/**
 * A name as it may be shown: one line, no control or formatting characters,
 * no doubled spaces, at most 48 characters. Returns "" when nothing is left.
 */
export declare function cleanName(name: string): string;
/**
 * Where a picture is, as it may be fetched: an `https` address with no
 * credentials in it, at most 300 characters. Returns "" for anything else.
 * A picture is fetched from wherever its owner keeps it, so whoever shows one
 * tells that place their address: a reader shows pictures only to someone
 * who hasn't said not to (protocol/10-identity.md, "Pictures").
 */
export declare function cleanPicture(url: unknown): string;
/**
 * A few words someone wrote about themselves, as they may be shown: one line
 * of plain text, nothing invisible that reorders or hides it, at most 280
 * characters. Returns "" when nothing is left. It is their own say about
 * themselves and nothing more: a reader shows it as theirs, never as a fact.
 */
export declare const cleanAbout: (about: unknown) => string;
/** A seed that is a public key is a claim to that key. Only a pass makes the claim good. */
export declare function claimsKey(seed: string): boolean;
export interface RoomPassInput {
    /** The session public key the pass speaks for. */
    session: string;
    /** The world's address, or its origin. The pass is good at that origin and nowhere else. */
    origin: string;
    /** The name to be known by. Cleaned; left out when nothing is left. */
    name?: string;
    /** Where their picture is: the one in their Nostr profile. Left out unless it is an https address. */
    picture?: string;
    /** A few words about themselves, from their Nostr profile. Cleaned and cut short; left out when nothing is left. */
    about?: string;
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
    /** Where their picture is, or "" for none. It is theirs because their own key signed it; what is there is not checked. */
    picture: string;
    /** What they wrote about themselves, cleaned, or "" for none. Their own words, not a fact. */
    about: string;
    expiresAt: number;
    id: string;
    /**
     * The pass is a guest account's (`["nswp:guest", "1"]`, protocol/10-identity.md, "A guest"): a key its sign-in
     * address made for a visitor nobody was signed in as, not yet secured. The same key in every world of its family.
     */
    guest: boolean;
}
/** Check a pass. Nothing about it is believed until this says so. */
export declare function verifyRoomPass(event: unknown, opts: VerifyPassOptions): Result<VerifiedPass>;
