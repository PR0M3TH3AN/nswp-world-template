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
    /** Where their picture is, as their sign-in address read it from their own profile, or null. For their own card. */
    readonly picture: string | null;
    /** What they wrote about themselves there, or null. Their own words. */
    readonly about: string | null;
    /**
     * Whether the signer will still be unlocked for this world the next time its page is loaded: true, false, or
     * null where it is locked or doesn't say. False means this visit only: the visitor is asked again next time.
     */
    readonly remembered: boolean | null;
    /** The visitor's client, as a host to name in words, or null. */
    readonly host: string | null;
    /**
     * True when a signer was named for this visitor (in the arrival, or
     * outright) and has had time to answer, and hasn't: it couldn't be
     * loaded, or the browser kept it out. Then there is something to say.
     */
    readonly unanswered: boolean;
    /** True while it is being asked again because the visitor pressed for it (`retry`), and hasn't answered yet. */
    readonly asking: boolean;
    /**
     * Where the signer is being asked for on this page, when that is a
     * development server's copy and not the real address: something to name
     * when it didn't answer. Null on a real site.
     */
    readonly copy: string | null;
    /**
     * Open the client's window, where the visitor unlocks it for this world.
     * Call it from a press: a browser opens a window for nothing else. False
     * if there is no signer, or no window could be opened.
     */
    unlock(): boolean;
    /**
     * Load the signer again and ask it once more: for one that was named and said nothing. False if there is nothing
     * to ask again (none was named, or it has answered).
     */
    retry(): boolean;
    /** Lock it again for this world. The visitor's own doing, from the world's menu. */
    lock(): void;
    /** Ask for a note to be signed. Null if it is locked, or it refused, or what came back wasn't what was asked. */
    sign(note: {
        kind: number;
        content: string;
        tags?: string[][];
    }): Promise<NostrEvent | null>;
    /**
     * Ask for a room pass for this world, for the session key whose public key is given
     * (protocol/10-identity.md, "A pass from the signer"). Null if it is locked, or it refused, or it is a signer
     * that makes none, or what came back isn't a pass by the key it holds, for this site and that session.
     */
    pass(session: string): Promise<NostrEvent | null>;
    /** Be told when its state changes. Returns how to stop. */
    onChange(fn: () => void): () => void;
    /**
     * Wait until it has said whether it is unlocked, or `ms` have passed. A signer that remembers this world
     * says so a moment after the page loads: this is how to not decide anything before it has.
     */
    whenAnswered(ms: number): Promise<void>;
    dispose(): void;
}
export interface WorldSignerOptions {
    /** The visitor's Airlock: usually `portal.airlockFor()`. The signer is beside it. */
    airlock?: string | null | undefined;
    /**
     * Or where the visitor's client said their signer is: usually
     * `arrival.signer()`. Its `signer/` and `connect/` pages are under that
     * address. Given, it is used in place of the Airlock's.
     */
    under?: string | null | undefined;
    /**
     * Or the signer and its window, named outright: for a site that isn't a
     * world, whose visitor arrived from no client. Both must be https
     * addresses on one origin.
     */
    at?: {
        signer: string;
        window: string;
    };
    /** This page's query string, for tests (`signer=test` asks the client's window for a throwaway identity). */
    search?: string;
}
/** A signer for this page, from the visitor's client. With no client, or off a browser, one that is always "none". */
export declare function createWorldSigner(opts: WorldSignerOptions): WorldSigner;
