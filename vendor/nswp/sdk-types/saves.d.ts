/**
 * Saves: what a world keeps for its visitor (protocol/12-saves.md).
 *
 *   const saves = createSaves({ signer });
 *   const last = await saves.load();                 // { data, at, from } or null
 *   await saves.save(JSON.stringify({ level: 3 }));  // says where it was kept
 *
 * A save is text: the world's own, in whatever shape it likes. It is always kept on this device, at once, so
 * nothing is lost to a closed tab. For a visitor who is signed in here it is also kept with their account, on
 * their own relays, encrypted so that only they can read it: then it is there on their next device.
 *
 * A world can read and write its own saves and nobody else's. It never says where a save is kept: the visitor's
 * signer works that out from this site's address. A guest's save stays on the device, and is taken up by their
 * account the first time it is loaded after they sign in.
 */
import { publishEvent, queryRelays } from "@nswp/core";
import type { WorldSigner } from "./signer.js";
export interface Saved {
    data: string;
    /** When it was saved, in seconds. */
    at: number;
    /** Where this copy came from: their account, or this device alone. */
    from: "account" | "device";
}
export interface SaveResult {
    /**
     * "account": kept with their account, on at least one of their relays, and on this device. "device": kept on
     * this device only (a guest, or their account couldn't be reached). "nowhere": it couldn't be kept at all.
     */
    kept: "account" | "device" | "nowhere";
    /** Words for the visitor, should the world want to say: "Saved to your account". */
    said: string;
}
export interface Saves {
    /** The newest save in a slot: from their account if they are signed in and it has a newer one, else this device's. Null if there is none, or it was cleared. */
    load(slot?: string): Promise<Saved | null>;
    /** Keep this. Text, at most `SAVE_LIMITS.dataBytes` bytes. An empty text clears the slot. */
    save(data: string, slot?: string): Promise<SaveResult>;
    /** Clear a slot: here, and with their account if they are signed in. */
    clear(slot?: string): Promise<SaveResult>;
}
export interface SavesOptions {
    /** The world's signer (`worldSigner()`), or a way to get it once there is one. Left out, saves stay on the device. */
    signer?: WorldSigner | (() => WorldSigner | null | undefined) | null;
    /** The relays asked when the visitor has published no list of their own. */
    relays?: string[];
    /** For tests: where the device's copy is kept, the clock, and how relays are asked. */
    storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
    now?: () => number;
    query?: typeof queryRelays;
    publish?: typeof publishEvent;
}
export declare function createSaves(opts?: SavesOptions): Saves;
