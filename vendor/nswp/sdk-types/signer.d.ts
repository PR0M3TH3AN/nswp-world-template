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
import { type NostrEvent, type Message, type SealedMessage, type SignerMore } from "@nswp/core";
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
     * What the visitor let this world do beyond a note and a reaction (protocol/10-identity.md, "Asking for more"):
     * "follows", or nothing. Empty while it is locked, and from a signer that offers none of it.
     */
    readonly more: readonly SignerMore[];
    /**
     * What this signer can be asked for at all, as it says ("Asking for more"), or null where it doesn't say. A
     * name that is missing has no question in its window: asking would open a window that says nothing of it.
     */
    readonly offers: readonly SignerMore[] | null;
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
    /**
     * Ask for something to be kept for this world, in a slot (protocol/12-saves.md). What comes back is a signed
     * save that only the visitor can read: this page sends it to their relays. Null if it is locked, or it
     * refused, or it is a signer that keeps nothing, or what came back isn't a save by the key it holds.
     */
    save(slot: string, data: string): Promise<NostrEvent | null>;
    /** Where this world's save in a slot is kept: the `d` to ask a relay for. Null as for `save`. */
    find(slot: string): Promise<string | null>;
    /** Have a save opened. Null if it isn't this world's, or isn't theirs, or as for `save`. */
    open(event: NostrEvent): Promise<{
        slot: string;
        data: string;
        at: number;
    } | null>;
    /**
     * Say what this world would like to be let do. It approves nothing: the signer remembers it for its own window,
     * so call `unlock()` after it, from the same press, for the visitor to be shown it. False where there is no
     * signer to tell.
     */
    want(more: readonly SignerMore[]): boolean;
    /**
     * Follow or unfollow one person, for a visitor who let this world do so (protocol/14-people-and-messages.md).
     * `list` is the newest follow list of theirs that could be found, or null where they have said they follow
     * nobody yet. What comes back is their new list, signed, for this page to send to their relays. Null if it is
     * locked, or they haven't allowed it, or it refused, or what came back isn't that list with that one change.
     */
    follow(list: NostrEvent | null, change: {
        add: string;
    } | {
        remove: string;
    }): Promise<NostrEvent | null>;
    /**
     * Have a private message written and sealed, for a visitor who let this world send them
     * (protocol/14-people-and-messages.md). What comes back is the message and its two seals: one for its reader,
     * one for the visitor to read back. This page wraps each and sends it. Null if it is locked, or they haven't
     * allowed it, or it refused, or what came back isn't that message, sealed by the key it holds.
     */
    seal(to: string, text: string): Promise<SealedMessage | null>;
    /** Have a wrapped message opened: one a relay gave this page, sent to the visitor. Null as for `seal`, or if it isn't a message for them. */
    unwrap(wrap: NostrEvent): Promise<Message | null>;
    /** Have the list of where their private messages reach them signed. Null as for `seal`. */
    reach(relays: readonly string[]): Promise<NostrEvent | null>;
    /**
     * Have the visitor's score signed (protocol/15-scores.md): for this world, on one of its boards. Any world its
     * visitor has unlocked may ask; a score is public, so ask only when the visitor has said to post it. What
     * comes back is for this page to send to relays. Null if it is locked, or it refused, or it is a signer that
     * signs no scores, or what came back isn't that score, by the key it holds, marked for this site.
     */
    score(world: string, board: string, score: number, said?: {
        title?: string;
        format?: "number" | "time";
    }): Promise<NostrEvent | null>;
    /**
     * Have it signed that the visitor holds one of this world's achievements (protocol/16-achievements.md). Any
     * world its visitor has unlocked may ask; it is public, so ask only when the visitor has said to show it. Null
     * as for `score`.
     */
    achieve(world: string, achievement: string, title: string): Promise<NostrEvent | null>;
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
