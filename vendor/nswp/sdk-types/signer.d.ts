/**
 * Signing from inside a world (protocol/10-identity.md, "Signing from a
 * world").
 *
 * A world never holds its visitor's key. It embeds a hidden signer served
 * by the visitor's own client, and asks it. This is the world's side of
 * that: the embed, the question, and the check on what comes back.
 *
 *   const signer = worldSigner();
 *   signer.unlock();                                   // from a press: opens the client's own window
 *   const note = await signer.sign({ kind: 1, content: "Hello" });   // null if locked or refused
 *
 * What a world can learn from it: whether it is unlocked, and then whose key
 * it holds. What it can never get: the key, a password, or a reason for a
 * refusal. Nothing is asked of the visitor here. The window that unlocks it
 * is the client's own page, which this page can't read.
 */
import { type NostrEvent } from "@nswp/core";
/** "none": the visitor has no client here that offers one. "locked": there is one, and it hasn't been unlocked for this world. */
export type SignerState = "none" | "locked" | "unlocked";
export interface WorldSigner {
    readonly state: SignerState;
    /** Whose key it holds, once unlocked. */
    readonly pubkey: string | null;
    /** What the client calls them, once unlocked, or null. Their own choice of name, not a fact. */
    readonly name: string | null;
    /** The visitor's client, as a host to name in words, or null. */
    readonly host: string | null;
    /**
     * Open the client's window, where the visitor unlocks it for this world.
     * Call it from a press: a browser opens a window for nothing else. False
     * if there is no signer, or no window could be opened.
     */
    unlock(): boolean;
    /** Lock it again for this world. The visitor's own doing, from the world's menu. */
    lock(): void;
    /** Ask for a note to be signed. Null if it is locked, or it refused, or what came back wasn't what was asked. */
    sign(note: {
        kind: number;
        content: string;
        tags?: string[][];
    }): Promise<NostrEvent | null>;
    /** Be told when its state changes. Returns how to stop. */
    onChange(fn: () => void): () => void;
    dispose(): void;
}
export interface WorldSignerOptions {
    /** The visitor's Airlock: usually `portal.airlockFor()`. The signer is beside it. */
    airlock: string | null | undefined;
    /** This page's query string, for tests (`signer=test` asks the client's window for a throwaway identity). */
    search?: string;
}
/** A signer for this page, from the visitor's client. With no client, or off a browser, one that is always "none". */
export declare function createWorldSigner(opts: WorldSignerOptions): WorldSigner;
