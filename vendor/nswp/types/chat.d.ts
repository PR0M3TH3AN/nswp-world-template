/**
 * Room chat: a few written words, said to the people in the room with you
 * (protocol/06-rooms.md, "Words").
 *
 * It travels the way a pose does: straight from one browser to the others, on
 * the connection a room already has. No relay sees it, nothing signs it, and
 * nobody keeps it: it is gone when the room is left. Who said something is
 * whoever holds the connection it arrived on, so a name beside a line is the
 * member's name as the room already knows it, never anything in the line.
 *
 * This file is the pure part: what a line looks like on the wire, how it is
 * tidied before it is shown, and how many of them one member may say.
 */
export declare const CHAT_LIMITS: {
    /** The most characters in one thing said. Longer is cut, by the one saying it and again by the one reading. */
    readonly chars: 240;
    /** A line is sent this many times, because the channel doesn't try again; a reader takes the first. */
    readonly repeats: 3;
    readonly repeatGapMs: 180;
    /** No more than `burst` lines from one member in `perMs`. The rest are dropped, unseen. */
    readonly burst: 5;
    readonly perMs: 10000;
    /** How many lines a reader keeps for the visit. */
    readonly kept: 100;
    /** How many ids are remembered for each member, to know a repeat from a new line. */
    readonly remembered: 32;
};
/**
 * Something said, as it may be shown: one line, nothing invisible that
 * reorders or hides text, no doubled spaces, at most `CHAT_LIMITS.chars`
 * characters. Returns "" when nothing is left, or for anything not a string.
 */
export declare function cleanChat(text: unknown): string;
/** A new id for a line: eight hex digits, random. It only tells a repeat from a new line. */
export declare function chatId(): string;
/** A line as it goes on the room's channel, or null if there is nothing to say. */
export declare function buildSay(text: string, id?: string): string | null;
/** Read a line off the channel. Null for anything that isn't one, or that says nothing. */
export declare function parseSay(data: unknown): {
    id: string;
    text: string;
} | null;
export interface ChatGate {
    /**
     * Whether this line is one to show: not a repeat of one already taken, and
     * not past what one member may say in a while. `now` is in milliseconds.
     */
    take(id: string, now: number): boolean;
    /** Whether another line could be said now, without saying one. */
    room(now: number): boolean;
}
/** One member's lines, counted. A reader keeps one for each member, and one for the visitor's own. */
export declare function createChatGate(limits?: {
    burst: number;
    perMs: number;
    remembered: number;
}): ChatGate;
/** How long a line stays over someone's head, in seconds: longer for more words, within reason. */
export declare function bubbleSeconds(text: string): number;
