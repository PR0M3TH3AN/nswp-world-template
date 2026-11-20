/**
 * A world's scores (protocol/15-scores.md): the visitor's best on each of the world's boards, posting it when
 * they say to, and reading the board.
 *
 *   const scores = createScores({ world, worldUrl, boards, hand });
 *   scores.record("main", 42_500);              // a run just ended: kept on the device if it is their best
 *   await scores.post("main");                  // from their press: signed by them, and sent to relays
 *   const board = await scores.standings("main");
 *
 * Optional, like everything about scores: a world that names no boards has none of this.
 *
 * A visitor's best is kept on the device, whoever they are. It becomes public only when they post it, which
 * they do by pressing: a score on a board says that this person was in this world, and how they did.
 */
import { publishEvent, queryRelays, type Board, type NostrEvent, type Standings } from "@nswp/core";
export interface ScoreHand {
    /** Who is signed in here, or null for a guest. */
    pubkey(): string | null;
    /** Have a score signed for this world, saying what the board is called and how it counts. Null if it couldn't be. */
    sign(world: string, board: string, score: number, said: {
        title: string;
        format: Board["format"];
    }): Promise<NostrEvent | null>;
}
export interface ScoresOptions {
    /** This world's own coordinate: `37300:<publisher>:<d>`. */
    world: string;
    /** This world's address. A score counts on its board only if it was asked for here. */
    worldUrl: string;
    boards: Board[];
    hand: ScoreHand;
    /** The people the visitor has reason to know: listed first. Usually who they follow, where that is known. */
    counted?: () => Iterable<string>;
    relays?: string[];
    storage?: Pick<Storage, "getItem" | "setItem"> | null;
    now?: () => number;
    query?: typeof queryRelays;
    publish?: typeof publishEvent;
}
export interface Scores {
    readonly boards: Board[];
    /** Their best on a board, as kept on this device, or null. */
    best(board: string): number | null;
    /** What they last posted to a board from this device, or null. */
    posted(board: string): number | null;
    /** A score they just made. True if it is their best: it is kept. Nothing is sent. */
    record(board: string, score: number): boolean;
    /** Post their best to the board: signed by them, sent to relays. From their press. */
    post(board: string): Promise<{
        ok: boolean;
        said: string;
    }>;
    /** The board, from relays: asked again only after a minute, unless `fresh`. Null where no relay answered. */
    standings(board: string, fresh?: boolean): Promise<Standings | null>;
    /** A score in the board's own words: "42.5 s". */
    words(board: string, score: number): string;
    /**
     * Where someone stands on a board, from what was last read of it: for saying so on their card. Null where they
     * aren't on it, or it hasn't been read. Nothing is asked of a relay by this.
     */
    standingOf(board: string, pubkey: string): {
        score: number;
        rank: number;
        of: number;
    } | null;
    onChange(fn: () => void): () => void;
}
export declare function createScores(opts: ScoresOptions): Scores;
