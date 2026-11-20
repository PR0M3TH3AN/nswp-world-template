import { type EventTemplate, type NostrEvent } from "./event.js";
/** A score: addressable, one for each person on each board of a world. Experimental; not allocated by the NIPs process. */
export declare const SCORE_KIND = 37306;
export declare const SCORE_LIMITS: {
    /** A world may have no more than this many scores signed in `perMs`, and in an hour. */
    readonly burst: 6;
    readonly perMs: 60000;
    readonly hourly: 60;
    /** The most a score may be. A whole number from 0 to this: what it counts is the board's to say. */
    readonly most: 9007199254740991;
};
/** One of a world's boards, as the world describes it. */
export interface Board {
    /** Its name among this world's boards: lower-case letters, digits and hyphens, 32 at most. */
    id: string;
    /** What it is called, for a reader. */
    title: string;
    /** Whether more is better, or less. */
    order: "high" | "low";
    /** What a score counts: a plain number, or a time in thousandths of a second. */
    format: "number" | "time";
}
/** A board's name as it may be used, or "". */
export declare function cleanBoard(input: unknown): string;
/** A score as it may be used: a whole number, zero or more. Null for anything else. */
export declare function cleanScore(input: unknown): number | null;
/** A score in a few words, as its board counts it: "1,200", or "42.5 s" for a time. */
export declare function scoreWords(board: Pick<Board, "format">, score: number): string;
/**
 * A score, ready to be signed by the person who made it. Null if the world isn't a world's coordinate, the board
 * isn't a board's name, or the score isn't one. `relay` is a hint: where the world's announcement can be found.
 */
export declare function buildScore(o: {
    world: string;
    board: string;
    score: number;
    relay?: string;
    now: number;
}): EventTemplate | null;
/**
 * What a signer does when a world asks for its visitor's score to be signed: the same note, marked with the site
 * that asked, which the signer takes from the browser and never from the world. Null for anything malformed.
 */
export declare function scoreForWorld(o: {
    world: unknown;
    board: unknown;
    score: unknown;
    origin: string;
    now: number;
}): EventTemplate | null;
export interface Score {
    /** Who made it. */
    by: string;
    /** The world: `37300:<publisher>:<d>`. */
    world: string;
    board: string;
    score: number;
    /** When it was posted, in seconds. */
    at: number;
    /** The sites a signer says asked for it, as origins. Empty when no signer said. */
    askedAt: string[];
}
/** Read a score. Null for anything that isn't one. The signature is checked by `rankScores`, or by the caller. */
export declare function parseScore(event: NostrEvent | null | undefined): Score | null;
/**
 * Whether a signed score is the one that was asked for: by the key the signer holds, really signed, for that
 * world and board with that score, and marked with this site.
 */
export declare function isScoreAsked(signed: unknown, o: {
    pubkey: string | null;
    world: string;
    board: string;
    score: number;
    origin: string;
}): signed is NostrEvent;
/** Someone's place on a board. */
export interface Standing {
    by: string;
    score: number;
    /** When they posted it, in seconds. */
    at: number;
    /** Their place among everyone on the board, from 1. Two with the same score: whoever posted first is ahead. */
    rank: number;
    /** Someone the reader has reason to know, or the reader. */
    known: boolean;
}
export interface Standings {
    /** The people the reader has reason to know, and the reader: best first. */
    known: Standing[];
    /** Everyone else: best first, a few at most. */
    others: Standing[];
    /** The reader's own, or null. */
    mine: Standing | null;
    /** How many people are on the board in all. */
    count: number;
}
/**
 * A board, from the scores relays have of it.
 *
 * - Only a real signature counts, and each person's newest score on that board.
 * - Only a score that a signer says was asked for at the world itself (`worldUrl`). A score signed anywhere
 *   else isn't on the board: another site can't put one there.
 * - `counted` are the people the reader has reason to know (the people they follow, say). They are listed apart
 *   and first. Everyone else is listed after, a few at most: keys cost nothing, and anyone can claim anything.
 */
export declare function rankScores(events: readonly NostrEvent[], o: {
    world: string;
    board: string;
    order: Board["order"];
    worldUrl: string;
    counted?: Iterable<string>;
    me?: string | null;
    most?: number;
}): Standings;
