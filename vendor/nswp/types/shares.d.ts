/** The tag a share is written in, on a listing. */
export declare const SHARE_TAG = "nswp:share";
/** Who a share is for when it is for whichever client brought the buyer: this word, where a key would be. */
export declare const SHARE_CLIENT = "client";
/**
 * The limits. `most`: how many shares a listing may have, the seller's among them (each is its own payment, from
 * its own place, and a buyer waits for every one: four to begin, at the selling service's asking).
 * `whole`: what the parts add up to. `least`: the least any one payment may be, in sats (a smaller one costs more to
 * send than it carries). `label`: the longest a share's word may be.
 */
export declare const SHARE_LIMITS: {
    readonly most: 4;
    readonly whole: 10000;
    readonly least: 10;
    readonly label: 32;
};
/** One share, as a listing gives it. */
export interface Share {
    /** Whose it is: a key, or `client`. */
    readonly to: string;
    /** How much: parts in ten thousand of the price. */
    readonly parts: number;
    /** What it is for, in a word or two, as the buyer is shown it. */
    readonly label: string;
}
export type SharesRefusal = "not-a-share" | "too-many" | "twice" | "not-whole" | "no-seller";
export type SharesRead = {
    readonly ok: true;
    readonly shares: readonly Share[];
} | {
    readonly ok: false;
    readonly why: SharesRefusal;
};
/** A share's word, as one: a line of at most `SHARE_LIMITS.label` characters with nothing unseen in it, or "". */
export declare function cleanShareLabel(input: unknown): string;
/**
 * The shares a listing's tags give, for a listing sold by `seller`. A listing with no `nswp:share` at all has none
 * (`shares` is empty: the seller is paid everything). One with any must have them all right, or the listing can't be
 * sold with shares at all: nothing is guessed, dropped or made to fit.
 *
 * Right means: each is exactly `["nswp:share", <a key, or "client">, <parts: 1 to 10000, in digits>]` with, if it
 * likes, a word after; at most `SHARE_LIMITS.most` of them; nobody twice; the seller among them; adding up to the whole.
 */
export declare function readShares(tags: unknown, seller: unknown): SharesRead;
/** One payment a price comes to. */
export interface SharePart {
    /** Who is paid: a key. */
    readonly to: string;
    /** How much, in sats. */
    readonly sats: number;
    /** What it is for, as the buyer is shown it. */
    readonly label: string;
    /** Whether this is the seller's own part: the one paid last, and the one the service's charge came out of. */
    readonly seller: boolean;
}
export type SplitRefusal = "not-a-price" | "no-seller" | "too-small";
export type SplitRead = {
    readonly ok: true;
    readonly parts: readonly SharePart[];
} | {
    readonly ok: false;
    readonly why: SplitRefusal;
};
/**
 * What a price comes to, person by person, in the order it is to be paid: the smallest first and the seller last,
 * so that a payment cut short leaves as little astray as it can.
 *
 * `shares` is what `readShares` gave (empty for a listing with none). `client` is the key of the client that brought
 * the buyer, where one did and can be paid; left out, or the seller's own, and the client's share is the seller's.
 * `charge` is what the selling service takes, in sats: it comes out of the seller's part.
 *
 * Whether a client can be paid is the selling service's to say (it pays only someone who has agreed to be paid, and
 * told it where). So for one listing and one client there are two right answers, this with `client` and this without,
 * and whoever checks the service's plan against the listing takes either, and nothing else.
 *
 * Refused, and so not to be sold this way, where any one payment would be under `SHARE_LIMITS.least`.
 */
export declare function splitPrice(price: unknown, shares: readonly Share[], seller: unknown, o?: {
    client?: string;
    charge?: number;
}): SplitRead;
