import { type EventTemplate, type NostrEvent, type UnsignedEvent } from "./event.js";
/** A message as it is written: never signed, never published as itself. */
export declare const MESSAGE_KIND = 14;
/** A message sealed to its reader, signed by its sender. Carries no tags. */
export declare const SEAL_KIND = 13;
/** A seal wrapped for one reader, signed by a key used once. */
export declare const WRAP_KIND = 1059;
/** Where someone's private messages reach them (NIP-17): a list of a few relays. */
export declare const MESSAGE_RELAYS_KIND = 10050;
export declare const MESSAGE_LIMITS: {
    /** The most characters in one message as this library writes and shows it. */
    readonly chars: 2000;
    /** How far back a wrap's time may be moved, in seconds, so that a relay can't tell when it was sent. */
    readonly backdateSec: number;
    /** No more than this many relays are taken from someone's list. */
    readonly relays: 4;
};
/**
 * A message's words, as they may be sent and shown: plain text, new lines kept (no more than two together),
 * nothing invisible that reorders or hides text, at most `MESSAGE_LIMITS.chars`. "" when nothing is left.
 */
export declare function cleanMessage(text: unknown): string;
/** A message, written and not signed: what is sealed. It has an id so that it can be told from another. */
export type WrittenMessage = UnsignedEvent & {
    id: string;
};
/**
 * Write a message from one person to another. Null if either key isn't one, they are the same, or there are no
 * words. `relay` is a hint for the reader's client: where the sender's messages reach them.
 */
export declare function buildMessage(o: {
    from: string;
    to: string;
    text: string;
    now: number;
    relay?: string;
}): WrittenMessage | null;
/**
 * The seal, ready for the sender's signer: `sealed` is the written message as JSON, encrypted (NIP-44) by the
 * sender's key to the reader's. A seal has no tags, so nothing on it says who it is for.
 *
 * Its time is now. NIP-59 lets it be moved back as a wrap's is; but only the reader ever sees a seal, and a
 * signer that sets or checks the time of what it signs would refuse another.
 */
export declare function sealTemplate(sealed: string, now: number): EventTemplate;
/**
 * Wrap a signed seal for one reader, with a key made for this and thrown away. The wrap's time is moved back by
 * up to two days. Null for anything that isn't a real seal or a real key.
 *
 * `secretKey`, `nonce`, `random` and `auxRand` exist for reproducible test vectors: leave them unset for anything real.
 */
export declare function wrapSeal(seal: NostrEvent, to: string, o: {
    now: number;
    secretKey?: Uint8Array;
    nonce?: Uint8Array;
    random?: number;
    auxRand?: Uint8Array;
}): NostrEvent | null;
/** Whether this could be a wrap for this reader, as far as can be told without opening it. The signature is checked. */
export declare function looksLikeWrap(event: NostrEvent | null | undefined, reader: string): event is NostrEvent;
/**
 * What a wrap held, once the reader's signer has opened it: a seal. Null unless it is a seal with a real
 * signature and no tags. Who signed it is who the message is from, and the only word on that there is.
 */
export declare function readSeal(opened: string): NostrEvent | null;
export interface Message {
    /** What tells it from another: worked out here from what it says, never taken from it. */
    id: string;
    /** Who wrote it: the key that signed the seal. */
    from: string;
    /** Who it is to. More than one is a conversation among several. */
    to: string[];
    /** Their words, as plain text. Shown as text, never as markup. */
    text: string;
    /** When they say they wrote it, in seconds. */
    at: number;
}
/**
 * What a seal held, once the reader's signer has opened it: the message. Null unless it is a message, written by
 * the one who signed the seal, with words in it, and the reader is its writer or one of the people it is to.
 *
 * The first of those is the one that matters. A message that says it is from one person, sealed by another, is
 * somebody passing themselves off: it is dropped.
 */
export declare function readMessage(opened: string, seal: Pick<NostrEvent, "pubkey">, reader: string): Message | null;
/** The other person in a message between two, as the reader sees it; "" for a message among several. */
export declare function writtenWith(message: Pick<Message, "from" | "to">, reader: string): string;
/**
 * Open a wrap with the reader's key in hand: every check `readSeal` and `readMessage` make. For a client that
 * holds a key, and for the test vectors. A client whose key is in a signer asks the signer to open each layer.
 */
export declare function openWrap(wrap: NostrEvent | null | undefined, secretKey: Uint8Array): Message | null;
/**
 * Where someone's private messages reach them: the relays in their newest kind 10050, cleaned, none twice, a few
 * at most. Empty when they have published none: they can't be sent a message this way until they have.
 */
export declare function readMessageRelays(events: readonly NostrEvent[], pubkey: string): string[];
/**
 * A world may be let send and read its visitor's private messages (protocol/14-people-and-messages.md, "Messages
 * from inside a world"). How often it may have one sealed: the pace of a person writing.
 */
export declare const MESSAGE_WORLD_LIMITS: {
    readonly burst: 10;
    readonly perMs: 60000;
    readonly hourly: 200;
};
/** A message written and sealed twice: once for its reader, and once for its writer to read back. */
export interface SealedMessage {
    message: WrittenMessage;
    /** For the reader, then for the writer. Each is wrapped for the one it is for, by whoever sends it. */
    seals: [NostrEvent, NostrEvent];
}
/**
 * What a signer does when it is asked to send a message, with the writer's key in hand: write it, and seal it to
 * its reader and to its writer. Whoever asked wraps each seal (`wrapSeal`) and sends it; they never see a key.
 * Null if the reader isn't a key, is the writer, or there are no words.
 *
 * `nonces` and `auxRand` exist for reproducible test vectors: leave them unset for anything real.
 */
export declare function sealMessage(o: {
    secretKey: Uint8Array;
    to: unknown;
    text: unknown;
    now: number;
    nonces?: [Uint8Array, Uint8Array];
    auxRand?: Uint8Array;
}): SealedMessage | null;
/**
 * Whether what a signer handed back is the message that was asked for, as far as whoever asked can tell: written
 * by the key the signer holds, to that reader, with those words, and sealed twice by that key. What is inside a
 * seal can't be read here, and doesn't need to be.
 */
export declare function isSealAsked(sealed: unknown, o: {
    pubkey: string | null;
    to: string;
    text: string;
}): sealed is SealedMessage;
/** Whether a signed list of where messages reach someone is the one that was asked for: theirs, and exactly those relays. */
export declare function isReachAsked(signed: unknown, o: {
    pubkey: string | null;
    relays: readonly string[];
}): signed is NostrEvent;
/** A message as it is handed about once read: every part checked again, the words tidied. Null for anything else. */
export declare function cleanRead(input: unknown): Message | null;
/** A list of where someone's private messages reach them, ready to be signed by them. Null with no usable relay. */
export declare function buildMessageRelays(relays: readonly string[], now: number): EventTemplate | null;
