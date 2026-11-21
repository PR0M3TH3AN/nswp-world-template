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
import { type Message, type SealedMessage } from "./message.js";
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
    /** No more than this many notes for one world in `perMs`: the pace of a person, not of a script. */
    readonly burst: 3;
    readonly perMs: 60000;
    /** And no more than this many in an hour. */
    readonly hourly: 20;
    /**
     * A pass is counted apart from notes, so signing in doesn't use up a post: no more than this many passes for
     * one world in `perMs`, and in an hour. A reader asks once per sign-in and once when a pass runs out.
     */
    readonly passBurst: 2;
    readonly passHourly: 10;
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
/**
 * Where a signer and its sign-in window are, for a client that keeps them
 * somewhere of their own and says where in the arrival (`signer`): at
 * `signer/` and `connect/` under that address. Null for anything that isn't
 * an https address.
 */
export declare function signerAt(base: string | null | undefined): {
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
}
/**
 * A room pass for this world, for the session key named (protocol/10-identity.md, "A pass from the signer").
 * The world gives the session's public key and nothing else: the signer writes the rest.
 */
 | {
    t: "pass";
    id: string;
    session: string;
}
/**
 * Keep this for me (protocol/12-saves.md). The world gives a slot's name and the words to keep, and nothing
 * else: the signer works out where it is kept from the world's own address, encrypts it, and signs it.
 */
 | {
    t: "save";
    id: string;
    slot: string;
    data: string;
}
/** Where is my save in this slot kept? So the world can ask a relay for it. */
 | {
    t: "find";
    id: string;
    slot: string;
}
/** Open this save, which a relay gave me. Opened only if it is this world's. */
 | {
    t: "open";
    id: string;
    event: NostrEvent;
}
/**
 * This world would like to be let do more than a note and a reaction (protocol/10-identity.md, "Asking for
 * more"). It approves nothing: the signer remembers it for its own window, where the visitor is shown it.
 */
 | {
    t: "want";
    id: string;
    more: SignerMore[];
}
/**
 * Follow or unfollow one person (protocol/14-people-and-messages.md). The world hands over the newest follow
 * list it found for the visitor, or null where they have none, and the one change. The signer makes the change.
 */
 | {
    t: "follow";
    id: string;
    list: NostrEvent | null;
    add?: string;
    remove?: string;
}
/**
 * Send a private message (protocol/14-people-and-messages.md). The world gives who it is to and the words, and
 * nothing else. The signer writes it and seals it, to its reader and to the visitor; the world wraps and sends.
 */
 | {
    t: "seal";
    id: string;
    to: string;
    text: string;
}
/** Open this wrapped message, which a relay gave me. The signer opens both layers and checks who wrote it. */
 | {
    t: "unwrap";
    id: string;
    event: NostrEvent;
}
/** Sign where the visitor's private messages reach them: a few relays (kind 10050). */
 | {
    t: "reach";
    id: string;
    relays: string[];
}
/**
 * Sign my visitor's score (protocol/15-scores.md). The world gives its own coordinate, the board and the score,
 * and nothing else: the signer writes the note and marks it with the site that asked.
 */
 | {
    t: "score";
    id: string;
    world: string;
    board: string;
    score: number;
    title?: string;
    format?: "number" | "time";
}
/**
 * Sign that my visitor holds one of my achievements (protocol/16-achievements.md). The world gives its own
 * coordinate, the achievement's name and what it is called: the signer writes the note and marks it.
 */
 | {
    t: "achieve";
    id: string;
    world: string;
    achievement: string;
    title: string;
}
/**
 * Put this to the person themselves (protocol/10-identity.md, "Asking the person"): a note of a careful kind,
 * which the signer never signs on a world's word. The sign-in address shows it to them in words, on a page of
 * its own, and it is signed only at their press there.
 */
 | {
    t: "propose";
    id: string;
    event: {
        kind: number;
        content: string;
        tags: string[][];
    };
}
/** Ask the person for a wallet connection for this world, the same way: on the sign-in address's own page. */
 | {
    t: "wallet";
    id: string;
}
/**
 * Ask the person to pay this Lightning invoice, the same way. The world made the invoice; the sign-in address
 * shows them the amount and pays at their press. The world is told it was paid and nothing about their wallet.
 */
 | {
    t: "pay";
    id: string;
    invoice: string;
};
/**
 * The careful kinds a world may put to its visitor, to be signed at their own press on the sign-in address's page:
 * their profile (0), a deletion (5), their relay list (10002). A closed list. Not who they follow (3): a whole
 * list signed for a world could unfollow everyone, so following is one person at a time (`follow`).
 */
export declare const PROPOSE_KINDS: readonly number[];
/** A wallet connection as it may be handed to a world: a Nostr Wallet Connect address, and not too long. */
export declare function cleanWalletUri(input: unknown): string;
/**
 * What a world may ask its visitor to let it do, beyond a note and a reaction. A closed list: each is a thing a
 * visitor can be asked in a few plain words, and none is "sign whatever I hand you".
 *
 * - "follows": follow and unfollow people for them, one at a time (the `follow` message).
 * - "messages": send private messages as them, and read the ones sent to them (`seal`, `unwrap`, `reach`).
 */
export declare const SIGNER_MORE: readonly ["follows", "messages"];
export type SignerMore = (typeof SIGNER_MORE)[number];
/** What was asked for or allowed, as it may be used: only names on the list, each once. */
export declare function cleanMore(input: unknown): SignerMore[];
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
    picture?: string;
    about?: string;
    until?: number;
    remembered?: boolean;
    more?: SignerMore[];
    offers?: SignerMore[];
} | {
    t: "signed";
    id: string;
    event: NostrEvent;
}
/** Answers `find`: the `d` of this world's save in that slot. */
 | {
    t: "found";
    id: string;
    d: string;
}
/** Answers `open`: what was kept, in which slot, and when. */
 | {
    t: "opened";
    id: string;
    slot: string;
    data: string;
    at: number;
}
/** Answers `seal`: the message as written, and its two seals. */
 | {
    t: "sealed";
    id: string;
    message: SealedMessage["message"];
    seals: SealedMessage["seals"];
}
/** Answers `unwrap`: the message that was inside. */
 | {
    t: "message";
    id: string;
    message: Message;
}
/**
 * Answers `propose` and `wallet`, at once: the person is to be asked. The world has the sign-in address's page
 * shown (its panel, or its window), and the real answer comes later under the same `id`.
 */
 | {
    t: "asking";
    id: string;
}
/** Answers `wallet`, once the person has said yes: the connection, for this world. */
 | {
    t: "wallet";
    id: string;
    uri: string;
}
/** Answers `pay`, once the person has paid: with the payment's proof, where their wallet was given one. */
 | {
    t: "paid";
    id: string;
    preimage?: string;
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
