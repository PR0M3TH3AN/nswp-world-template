import { type EventTemplate, type NostrEvent } from "./event.js";
/** A save: addressable, so a relay keeps the newest for each slot. Experimental; not allocated by the NIPs process. */
export declare const SAVE_KIND = 37304;
export declare const SAVE_LIMITS: {
    /** The most a save may hold, in bytes of UTF-8. It has to fit in one note that any relay will take. */
    readonly dataBytes: 32768;
    /** A world may write no more than this many saves in `perMs`, and in an hour: often enough to keep up with a game, not to flood. */
    readonly burst: 6;
    readonly perMs: 60000;
    readonly hourly: 60;
};
/** The slot a world uses when it names none. */
export declare const SAVE_SLOT = "main";
/** A slot's name as it may be used: lower-case letters, digits and hyphens, 32 at most. "" for anything else. */
export declare function cleanSlot(input: unknown): string;
/** Whether these words may be a save: text, within the limit. */
export declare function fitsInSave(data: unknown): data is string;
/**
 * Where one world's save in one slot is kept, for the visitor whose key this is: the save's `d`. It is made from
 * the visitor's own secret (`conversationKey`: their key with itself, as NIP-44 makes it), so only they can work
 * it out, and it says nothing of the world to anyone else. "" if the world or the slot can't be used.
 */
export declare function saveAddress(conversationKey: Uint8Array, world: string, slot: string): string;
/**
 * A save, ready to be signed by the visitor's key: for a signer to write when a world asks. The world and the
 * slot are written inside what is encrypted, so that opening it can check them again. Null if anything is wrong
 * with what was asked.
 */
export declare function sealSave(o: {
    conversationKey: Uint8Array;
    world: string;
    slot: string;
    data: unknown;
    now: number;
    nonce?: Uint8Array;
}): EventTemplate | null;
export interface OpenedSave {
    slot: string;
    data: string;
    /** When it was saved, in seconds, as its signer wrote it. */
    at: number;
}
/**
 * Open a save for the world that asks: for a signer. It is opened only if it is the visitor's own, of this kind,
 * and what is inside says it is that world's, in the slot its address is for. Null for anything else: another
 * world's save is never opened for this one, whatever it was handed.
 *
 * The caller checks the signature first (`verifyEvent`): this checks whose it is and what it says.
 */
export declare function openSave(event: NostrEvent | null | undefined, o: {
    conversationKey: Uint8Array;
    pubkey: string;
    world: string;
}): OpenedSave | null;
/**
 * Whether what a signer handed back could be the save that was asked for, as far as a world can tell: a save, by
 * the key the signer holds, kept at an address. The world can't read it, and doesn't need to. The caller checks
 * the signature (`verifyEvent`).
 */
export declare function looksLikeSave(event: NostrEvent | null | undefined, pubkey: string | null): event is NostrEvent;
