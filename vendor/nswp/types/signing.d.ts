/**
 * Signing from inside a world (protocol/10-identity.md, "Signing from a
 * world"): the pure parts.
 *
 * A world never holds its visitor's key. It asks a hidden signer served by
 * the visitor's own client, embedded in the world's page, and that signer
 * answers with a signed note or a refusal. This file is what both sides
 * agree on: where a client's signer and its sign-in window are, what the
 * messages between a world and the signer look like, which kinds of note a
 * world may have signed, and how a note is tidied and marked before it is
 * signed.
 *
 * Nothing here signs anything, and nothing here is a secret.
 */
import type { EventTemplate, NostrEvent } from "./event.js";
export declare const SIGNER_PROTOCOL = "nswp-signer";
export declare const SIGNER_VERSION = 1;
export declare const SIGN_LIMITS: {
    /** The longest a note's content may be, in characters. */
    readonly contentChars: 8000;
    readonly tags: 60;
    readonly tagItems: 8;
    readonly tagChars: 400;
    /** How long an unlocked signer stays unlocked for a world, at most. Closing the world's page ends it sooner. */
    readonly grantSec: number;
    /** No more than this many notes for one world in `perMs`. */
    readonly burst: 6;
    readonly perMs: 60000;
    /** And no more than this many in an hour. */
    readonly hourly: 60;
};
/**
 * How a kind of note is treated when a world asks for it.
 *
 * - "ordinary": allowed once the visitor has unlocked the signer for that world.
 * - "careful": only with the visitor's say each time, on a surface their client draws. Not built yet: refused.
 * - "never": refused, whatever anyone says.
 */
export type SignClass = "ordinary" | "careful" | "never";
/** What a world may have signed once the visitor has said yes to it: a note, and a reaction to one. */
export declare const ORDINARY_KINDS: readonly number[];
/**
 * What is never signed for a world: private messages and their wrappings,
 * passes and room signals (a world would be signing itself in), anything
 * that proves who someone is to a server or a relay, wallet and remote-signer
 * traffic, and application data, which is where a client keeps its own.
 */
export declare const NEVER_KINDS: readonly number[];
export declare function signClass(kind: unknown): SignClass;
/** The tag a signer puts on every note it signs for a world: which world asked. A world can't leave it off. */
export declare const WORLD_TAG = "nswp:world";
/** A place as it may be named in a tag or shown to someone: an http(s) origin, or "". */
export declare function cleanOrigin(input: unknown): string;
/**
 * What a world asked to have signed, as it may be signed for that world: an
 * ordinary kind, its words within the limit, its tags tidied, and marked with
 * the world that asked. The time is the signer's own, never the world's.
 * Null for anything else.
 */
export declare function prepareForWorld(input: unknown, world: string, now: number): EventTemplate | null;
/** Whether a signed note is the one that was asked for: the same kind, words and tags, plus the signer's mark. */
export declare function isWhatWasAsked(asked: {
    kind: number;
    content: string;
    tags: string[][];
}, signed: NostrEvent): boolean;
export interface SignGate {
    /** Whether another note may be signed for this world now. Counts it if so. `now` is in milliseconds. */
    take(now: number): boolean;
}
/** One world's notes, counted: a world the visitor said yes to still can't pour notes out under their name. */
export declare function createSignGate(limits?: {
    burst: number;
    perMs: number;
    hourly: number;
}): SignGate;
/**
 * Where a client's signer and its sign-in window are: beside its Airlock.
 * A client whose Airlock is at `https://client.example/go/` serves them at
 * `/signer/` and `/connect/`. Null for an Airlock that isn't an https address.
 */
export declare function signerAddresses(airlock: string | null | undefined): {
    origin: string;
    signer: string;
    window: string;
} | null;
/** From a world: "what state are you in?", "sign this", or "lock": the visitor's own way to end it from the world's menu. */
export type SignerRequest = {
    t: "state";
    id: string;
} | {
    t: "lock";
    id: string;
} | {
    t: "sign";
    id: string;
    event: {
        kind: number;
        content: string;
        tags: string[][];
    };
};
/**
 * From the signer. `ready` is said once, unasked, when it has loaded. `state`
 * answers a request and is said again whenever it changes. A refusal never
 * says why.
 */
export type SignerReply = {
    t: "ready";
} | {
    t: "state";
    id?: string;
    unlocked: boolean;
    pubkey?: string;
    name?: string;
    until?: number;
} | {
    t: "signed";
    id: string;
    event: NostrEvent;
} | {
    t: "refused";
    id: string;
};
export declare const signerMessage: <T extends SignerRequest | SignerReply>(message: T) => T & {
    nswp: string;
    v: number;
};
/** Read what a world sent the signer. Null for anything else. The event is checked later, by `prepareForWorld`. */
export declare function readSignerRequest(data: unknown): SignerRequest | null;
/** Read what the signer sent a world. Null for anything else. A signed note is checked by the caller. */
export declare function readSignerReply(data: unknown): SignerReply | null;
export declare const HANDOFF_PROTOCOL = "nswp-handoff";
export type HandoffMessage = 
/** Window to every frame of the page that opened it: "is one of you mine?" */
{
    t: "hello";
    nonce: string;
}
/** Signer to window: which world embeds it (as the browser says), and a throwaway key to seal the hand-off to. */
 | {
    t: "frame";
    nonce: string;
    world: string;
    recipient: string;
}
/** Window to signer, after the visitor pressed Allow: the sealed hand-off, for that world. */
 | {
    t: "grant";
    nonce: string;
    world: string;
    sealed: {
        senderPublicKey: string;
        payload: string;
    };
    name?: string;
}
/** Signer to window: it is unlocked, or it could not be. */
 | {
    t: "done";
    nonce: string;
    ok: boolean;
};
export declare const handoffMessage: <T extends HandoffMessage>(message: T) => T & {
    nswp: string;
    v: number;
};
export declare function readHandoffMessage(data: unknown): HandoffMessage | null;
