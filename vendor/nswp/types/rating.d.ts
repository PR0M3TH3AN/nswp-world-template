import { type EventTemplate, type NostrEvent } from "./event.js";
/** A rating: addressable, one for each world a person has rated. Experimental; not allocated by the NIPs process. */
export declare const RATING_KIND = 37305;
export declare const RATING_LIMITS: {
    /** Stars run from 1 to this. */
    readonly most: 5;
    /** The longest the words may be, in characters. A review longer than that is a comment (NIP-22), not a rating. */
    readonly words: 280;
};
/**
 * Marks a signer puts on what it signs, naming the site that asked: NSWP's own for a world, and BitLogin's for an
 * application. A rating that carries one naming the world it rates was asked for by that world, and isn't counted.
 */
export declare const SITE_MARKS: readonly string[];
export interface Rating {
    /** Who gave it. */
    by: string;
    /** The world it is of: `37300:<publisher>:<d>`. */
    world: string;
    /** 1 to 5. */
    stars: number;
    /** Their words, or "". Shown as text, never as markup. */
    words: string;
    /** When, in seconds. */
    at: number;
    /** The sites a signer says asked for it, as origins. Empty when no signer said. */
    askedAt: string[];
}
/** A world's coordinate as a rating may name it, or "". */
export declare function worldCoordinate(input: unknown): string;
/** Whole stars, 1 to 5, or 0 for anything else. */
export declare function cleanStars(input: unknown): number;
/**
 * A rating, ready to be signed by the person giving it. Null if the world isn't a world's coordinate or the stars
 * aren't 1 to 5. `relay` is a hint for whoever reads it: where the world's announcement can be found.
 */
export declare function buildRating(o: {
    world: string;
    stars: number;
    words?: string;
    relay?: string;
    now: number;
}): EventTemplate | null;
/** Read a rating. Null for anything that isn't one. The signature is checked by `tallyRatings`, or by the caller. */
export declare function parseRating(event: NostrEvent | null | undefined): Rating | null;
export interface Tally {
    /** How many of the people counted have rated it. */
    count: number;
    /** Their average, to one decimal place; 0 when nobody has. */
    average: number;
    /** What `me` gave it, or 0. */
    mine: number;
    /** The ratings counted, newest first: for showing whose they are and what they wrote. */
    ratings: Rating[];
}
/**
 * The tally for one world, from the ratings of the people a client counts.
 *
 * - Only a real signature counts, and only the newest rating each person has given that world.
 * - Only people in `counted` count. `me`, the visitor, always does.
 * - A rating that a signer says was asked for at the world it rates isn't counted: a world may not have its
 *   visitors rate it from inside. Pass the world's address as `worldUrl` for this to be checked.
 * - A world's own publisher doesn't count for it.
 */
export declare function tallyRatings(events: readonly NostrEvent[], o: {
    world: string;
    counted: Iterable<string>;
    me?: string | null;
    worldUrl?: string | null;
}): Tally;
/** A tally as a door's sign says it: "★ 4.5 from 12". "" when nobody counted has rated it: never "0 stars". */
export declare function tallyMark(tally: Pick<Tally, "count" | "average"> | null | undefined): string;
/** A tally as a few words: "4.5 of 5, from 12". "" when nobody counted has rated it. */
export declare function tallyWords(tally: Pick<Tally, "count" | "average">): string;
