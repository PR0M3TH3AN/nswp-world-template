/**
 * The visitor's private messages (protocol/14-people-and-messages.md): Nostr's own, NIP-17, the same ones every
 * other Nostr app that speaks it shows.
 *
 *   const messages = createMessages({ hand });
 *   await messages.load();                       // what has been sent to them, and what they sent
 *   messages.conversations();                    // one for each person, newest first
 *   await messages.send(theirKey, "Hello.");     // { ok, said }
 *
 * The `hand` is whatever seals and opens for the visitor: in a world, their signer, once they have let that world
 * handle their messages; in their own client, its own signer. Nothing here holds a key, and nothing that was
 * read is kept once the page is closed: only how far each conversation had been read.
 *
 * A relay is told who a message is for, and nothing of who sent it or what it says.
 */
import { publishEvent, queryRelays, type Message, type NostrEvent, type SealedMessage } from "@nswp/core";
export interface MessageHand {
    /** Whose messages: the key signed in here, or null for a guest. */
    pubkey(): string | null;
    /** Whether a message can be sealed and opened now, with nothing more asked of the visitor. */
    ready(): boolean;
    /** Write a message and seal it: for its reader, then for its writer. Null if it couldn't be. */
    seal(to: string, text: string): Promise<SealedMessage | null>;
    /** Open a wrapped message that a relay gave. Null if it isn't a message for them. */
    open(wrap: NostrEvent): Promise<Message | null>;
    /** Sign the list of where their messages reach them. Null if it couldn't be. */
    reach(relays: readonly string[]): Promise<NostrEvent | null>;
}
export interface MessagesOptions {
    hand: MessageHand;
    /** The usual relays. */
    relays?: string[];
    /** Whether a message from this person is one the visitor would expect: someone they follow. */
    known?: (pubkey: string) => boolean;
    /** Where how far each conversation was read is kept. Null keeps nothing. Left out, the browser's own. */
    storage?: Pick<Storage, "getItem" | "setItem"> | null;
    now?: () => number;
    query?: typeof queryRelays;
    publish?: typeof publishEvent;
}
export interface Conversation {
    /** The other person. */
    with: string;
    last: Message;
    /** How many of theirs have arrived since the visitor last looked. */
    unread: number;
    /** From someone they follow, or someone they have written to. Anything else is a request. */
    known: boolean;
}
/**
 * - "off": nobody is signed in, or this place hasn't been let.
 * - "looking": being asked for.
 * - "unreachable": no relay answered.
 * - "no-inbox": they haven't said where messages reach them, so nobody can write to them this way yet.
 * - "ready".
 */
export type MessagesState = "off" | "looking" | "unreachable" | "no-inbox" | "ready";
export interface Messages {
    state(): MessagesState;
    /** Where their messages reach them, as they have said. */
    inbox(): string[];
    /** The relays offered when they have said nowhere: their own, or the usual ones. */
    offered(): string[];
    load(fresh?: boolean): Promise<void>;
    /** Say where messages reach them: the relays offered. Signed by them, and sent to their relays. */
    setUp(): Promise<{
        ok: boolean;
        said: string;
    }>;
    conversations(): Conversation[];
    /** One conversation, oldest first. */
    thread(peer: string): Message[];
    send(to: string, text: string, name?: string): Promise<{
        ok: boolean;
        said: string;
    }>;
    /** The visitor is looking at this conversation: what has arrived in it is read. */
    seen(peer: string): void;
    /** How many unread there are, from people they would expect. */
    unread(): number;
    onChange(fn: () => void): () => void;
    /** Be told of each message from someone else as it is first read, after the first look. */
    onNew(fn: (message: Message) => void): () => void;
}
export declare function createMessages(opts: MessagesOptions): Messages;
