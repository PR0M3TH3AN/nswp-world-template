import { type ReceiptIssuer } from "./receipt.js";
/** The kind a listing is: application data, addressed by its own name. */
export declare const LISTING_KIND = 30078;
/**
 * The least anything is sold for, in sats (the owner, 2026-11-21: section 13, 28 and 39). The selling service
 * registers nothing under it and the sign-in address shows no purchase under it; the kit shows nothing for sale
 * under it either.
 */
export declare const LEAST_PRICE_SATS = 500;
/** How many listings a world may be entered by: a day, a month, a year, for good, and room for a few more. */
export declare const ACCESS_MOST = 8;
/** What a listing says, once it has been checked. */
export interface Listing {
    /** Its coordinate: `30078:<the seller's key>:<its name>`. */
    readonly coordinate: string;
    /** Who sells it: the key that signed it. */
    readonly seller: string;
    /** What it is called, in the seller's words. Plain text, and theirs: show it as a name, never as a fact. */
    readonly name: string;
    /** What it costs, in sats. */
    readonly sats: number;
    /** How long it lasts, in seconds, or null for something bought for good. */
    readonly term: number | null;
    /** What buying it gives, where it says: the coordinate of a world or an item. "" where it doesn't. */
    readonly for: string;
    /** The service that sells it and signs its receipts: one the kit believes. */
    readonly issuer: ReceiptIssuer;
}
export type ListingRefusal = "not-a-listing" | "other-seller" | "not-signed" | "other-listing" | "not-for-sale" | "unknown-service" | "too-cheap" | "shared";
export type ListingRead = {
    readonly ok: true;
    readonly listing: Listing;
} | {
    readonly ok: false;
    readonly why: ListingRefusal;
};
/**
 * A name as it may be shown: one line of plain text, at most eighty characters, with nothing in it a reader can't
 * see. Control characters and the marks that hide or reorder text are dropped, so a name can't rearrange the line
 * it is shown on.
 */
export declare function cleanListingName(input: unknown): string;
/**
 * Read a listing a relay gave, as the one asked for. Good only if all of these hold, and refused with the first
 * that doesn't:
 *
 * - it is a note of the listing's kind, and `coordinate` is a listing's coordinate;
 * - it was signed by the seller the coordinate names (`other-seller`: nobody prices what isn't theirs), and the
 *   signature is real (`not-signed`);
 * - its own name is the one in the coordinate (`other-listing`);
 * - it is for sale now, through a service that signs receipts (`not-for-sale`);
 * - it has one price, in whole sats, and, if it lasts a time, says so once and properly (`not-a-listing`);
 * - the service it names is one whose receipts the kit believes (`unknown-service`): a purchase anywhere else
 *   would end in a receipt nothing here could take;
 * - it costs at least `LEAST_PRICE_SATS` (`too-cheap`);
 * - its price is not divided between several people (`shared`): shares are written down and not in force, and
 *   selling such a listing with them ignored would pay the seller what they wrote was someone else's.
 *
 * `issuers` is for a test or a trial against a service on one machine. Nothing in the kit lets a page pass it.
 */
export declare function readListing(event: unknown, coordinate: string, o?: {
    issuers?: readonly ReceiptIssuer[];
}): ListingRead;
/**
 * How long something lasts, in words to put after a price: "for 30 days", "for 1 hour", and "once" for something
 * bought for good. In the largest whole unit that says it exactly.
 */
export declare function termWords(term: number | null): string;
/** A listing's price and how long it lasts, in words: "500 sats, for 30 days". */
export declare function priceWords(listing: Pick<Listing, "sats" | "term">): string;
/**
 * What a world's page may reach beyond itself and relays because it is paid: the address of each service whose
 * receipts the kit believes, by name, so its gate can ask whether a receipt was taken back. For a world that names
 * no listing: nothing at all. A free world's rules must not change because paid worlds exist.
 */
export declare function paidWorldReaches(access: unknown): string[];
/**
 * What a world may say it is entered by: listings' coordinates, each once, at most `ACCESS_MOST`, and, where
 * `sellers` is given, only those sold by one of those keys. Anything else is dropped. Empty means free.
 */
export declare function cleanAccess(input: unknown, sellers?: readonly string[]): string[];
