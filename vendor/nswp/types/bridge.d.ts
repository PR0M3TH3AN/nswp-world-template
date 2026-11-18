import { type EventTemplate, type NostrEvent } from "./event.js";
import { type Result } from "./result.js";
/** Experimental, ephemeral-range kind; not allocated by the NIPs process. */
export declare const BRIDGE_GRANT_KIND = 27302;
export declare const BRIDGE_LIMITS: {
    /** How long a grant is good for connecting. The connection it opens may last longer. */
    readonly grantTtlSec: 300;
    /** How far the Bridge's clock and the signer's may disagree. */
    readonly skewSec: 120;
    /** Notes older or newer than this are ignored. */
    readonly signalMaxAgeSec: 60;
    readonly maxSdpChars: 20000;
    readonly minCols: 20;
    readonly maxCols: 300;
    readonly minRows: 5;
    readonly maxRows: 120;
    /** The largest frame either side sends or accepts, in bytes. */
    readonly frameBytes: 65536;
    readonly nameChars: 80;
    readonly whyChars: 200;
    /** Speech is sent as 16-bit samples, one channel, at this many a second. */
    readonly speechRate: 16000;
    /** The longest anyone may speak in one go, in seconds. */
    readonly speechSeconds: 90;
    /** The most text one go may come back as. */
    readonly speechChars: 2000;
};
/** Where a Bridge listens on relays. */
export declare function bridgeTopic(bridge: string): string;
/**
 * Four digits both ends work out from the grant, each on its own. The Bridge
 * shows them when it asks; the panel shows them while it waits. If they
 * differ, the question on the computer is about somebody else's request.
 */
export declare function grantCode(grantId: string): string;
export interface BridgeGrantInput {
    /** The throwaway session public key the grant is for. */
    session: string;
    /** The Bridge's public key. */
    bridge: string;
    createdAt?: number;
    ttlSec?: number;
}
/** A grant, ready for the owner's key to sign. */
export declare function buildBridgeGrant(input: BridgeGrantInput): EventTemplate;
export interface VerifyGrantOptions {
    /** The one key this Bridge answers. */
    owner: string;
    /** This Bridge's own public key. */
    bridge: string;
    /** The key that sent the grant: it must be the session key the grant names. */
    session: string;
    now?: number;
    /** The ids of grants already used. */
    seen?: {
        has(id: string): boolean;
    };
}
export interface VerifiedGrant {
    id: string;
    session: string;
    expiresAt: number;
}
/** Check a grant. Nothing opens until this says so. */
export declare function verifyBridgeGrant(event: unknown, opts: VerifyGrantOptions): Result<VerifiedGrant>;
/**
 * A second kind of grant, for a world its owner is building. It lets that one
 * world's page open a terminal on the owner's computer, so the owner can work
 * on the world from inside it.
 *
 * It is a different thing from the grant above, and kept apart from it: its
 * own kind, a world named beside the Bridge, hours instead of minutes, and
 * good for more than one connection so a refresh doesn't end the work. A
 * Bridge honours one only for a world it was told about when it was started.
 * Whatever runs at that world's address can use it: that is the trust given.
 */
export declare const BRIDGE_WORLD_GRANT_KIND = 27303;
export declare const WORLD_GRANT_LIMITS: {
    readonly defaultTtlSec: number;
    readonly maxTtlSec: number;
};
/**
 * A world's address, as the one thing a world grant names: its origin.
 * Encrypted sites, and this computer itself for a world still being built.
 * Null for anything else.
 */
export declare function cleanWorldOrigin(input: unknown): string | null;
export interface WorldGrantInput {
    session: string;
    bridge: string;
    /** The world's address, or its origin. */
    world: string;
    createdAt?: number;
    ttlSec?: number;
}
/** A world grant, ready for the owner's key to sign. Throws for an address that can't be a world's. */
export declare function buildWorldGrant(input: WorldGrantInput): EventTemplate;
export interface VerifyWorldGrantOptions {
    owner: string;
    bridge: string;
    /** The key that sent it: it must be the session key the grant names. */
    session: string;
    /** The worlds this Bridge was told about, as origins. A world's own page gives the one it is at. */
    worlds: readonly string[];
    now?: number;
}
export interface VerifiedWorldGrant extends VerifiedGrant {
    world: string;
}
/** Check a world grant. It may be used again until it expires, by the session key it names and nobody else. */
export declare function verifyWorldGrant(event: unknown, opts: VerifyWorldGrantOptions): Result<VerifiedWorldGrant>;
/**
 * What an owner's home hands a world they are building, so the world can
 * open terminals on their computer: the grant, the throwaway key it names,
 * and where the Bridge is found. It travels in the address, after `#`, and
 * is kept by the world for the tab.
 */
export interface Brought {
    grant: NostrEvent;
    /** The throwaway's secret half, as hex. */
    sessionKey: string;
    /** The Bridge's public key. */
    bridge: string;
    /** What the owner calls that computer. */
    name: string;
    /** Where the Bridge listens. Empty for the usual relays. */
    relays: string[];
    /** The owner left a headset session to come here. */
    immersive: boolean;
}
/** Pack it for the address. */
export declare function packBrought(b: Brought): string;
/**
 * Read what was handed over, at the world `origin`. Null unless every part
 * holds together: a world grant that verifies, made for this very origin,
 * for the session key that came with it, and not yet expired. Who signed it
 * is the Bridge's to judge; a world can't know its visitor's key.
 */
export declare function readBrought(text: string, origin: string, now?: number): Brought | null;
export type BridgeMessage = {
    t: "open";
    grant: NostrEvent;
    sdp: string;
}
/** The Bridge is asking at the computer. */
 | {
    t: "wait";
} | {
    t: "answer";
    sdp: string;
} | {
    t: "refused";
    why: string;
};
/**
 * A note for the other end, encrypted to its key (NIP-44). `bridge` is the
 * Bridge's public key, whichever end is writing. A reply names the note it
 * answers in `re`, so an old reply is never taken for a new one.
 */
export declare function buildBridgeSignal(bridge: string, key: Uint8Array, to: string, message: BridgeMessage, o?: {
    re?: string;
    createdAt?: number;
}): NostrEvent;
export interface OpenedBridgeSignal {
    from: string;
    message: BridgeMessage;
    id: string;
    /** The id of the note this one answers, when it is a reply. */
    re?: string;
}
/**
 * Check and decrypt a note. Returns null for anything that isn't a valid,
 * fresh note addressed to this key on this Bridge's topic. Who it is from,
 * and what it answers, are for the caller to judge: the Bridge by the grant
 * inside, the page by the Bridge's key and its own request's id.
 */
export declare function openBridgeSignal(event: unknown, key: Uint8Array, bridge: string, now?: number): OpenedBridgeSignal | null;
export type BridgeControl = {
    t: "size";
    cols: number;
    rows: number;
} | {
    t: "here";
} | {
    t: "ready";
    name: string;
    speech: boolean;
} | {
    t: "exit";
    code: number;
};
/** A terminal's size, held to what a Bridge will make. */
export declare function cleanSize(cols: unknown, rows: unknown): {
    cols: number;
    rows: number;
} | null;
/** Read a text frame from the channel. Returns null for anything that isn't one of the few things either side says. */
export declare function parseBridgeControl(text: string): BridgeControl | null;
/**
 * What is said on the second channel, `speech`: the page sends what a
 * microphone heard, and the computer sends back the words. Sound goes one
 * way as binary frames between a `begin` and an `end`.
 */
export type SpeechControl = {
    t: "begin";
    lang: string;
} | {
    t: "end";
} | {
    t: "cancel";
}
/** The words. Never a line break: speaking types, and never presses Enter. */
 | {
    t: "text";
    text: string;
} | {
    t: "sorry";
    why: string;
};
/** Words as they may be typed: one line, nothing hidden, nothing that is a key rather than a letter. */
export declare function cleanSpeechText(text: string): string;
/** Read a text frame from the speech channel, from either end. Null for anything else. */
export declare function parseSpeechControl(text: string): SpeechControl | null;
