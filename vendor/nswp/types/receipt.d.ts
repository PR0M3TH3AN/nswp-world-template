/** The kind a receipt is: application data, addressed by its own name. */
export declare const RECEIPT_KIND = 30078;
/** A service whose receipts are believed: its name for people, its address, and the key it signs with. */
export interface ReceiptIssuer {
    readonly name: string;
    readonly service: string;
    readonly pubkey: string;
}
/**
 * The services whose receipts the kit believes. A list, and a short one: BitUnlock, whose key was read from its own
 * signed policy at `/.well-known/bitunlock.json` on 2026-11-21. Another service that signs receipts the same way is
 * one more line here, and adding a line is the owner's decision, not a world's.
 */
export declare const RECEIPT_ISSUERS: readonly ReceiptIssuer[];
/**
 * A listing's coordinate, as it may be asked about: `30078:<the seller's key>:<its name>`. "" for anything else.
 * The seller's key is in it, which is what lets anyone see whose thing was sold with no call to anyone.
 */
export declare function cleanListing(input: unknown): string;
/** The key that sells a listing: the one in its coordinate. "" where it isn't one. */
export declare function listingSeller(listing: unknown): string;
/** What a receipt says, once it has been checked. */
export interface Receipt {
    /** Who signed it. */
    readonly issuer: ReceiptIssuer;
    /** What was bought: the listing's coordinate. */
    readonly listing: string;
    /** Whose it is. */
    readonly buyer: string;
    /** Who sold it. */
    readonly seller: string;
    /** When it was signed, in seconds. */
    readonly issuedAt: number;
    /** When it stops, in seconds, or null for something bought for good. */
    readonly expiresAt: number | null;
    /** Its own name at the service: what a "was this taken back?" question is asked about. */
    readonly fulfillment: string;
}
export type ReceiptRefusal = "not-a-receipt" | "not-signed" | "unknown-issuer" | "other-listing" | "other-buyer" | "run-out";
export type ReceiptCheck = {
    readonly ok: true;
    readonly receipt: Receipt;
} | {
    readonly ok: false;
    readonly why: ReceiptRefusal;
};
/**
 * Read a receipt and check it. Good only if: it is really signed, by a service on the list; it is a receipt in the
 * form this knows, under its own right name; and, where asked, it is for this listing, it is this buyer's, and it
 * has not run out. `now` is in seconds.
 *
 * It does not ask whether the receipt was taken back: nothing in a receipt can say.
 */
export declare function readReceipt(event: unknown, expect?: {
    listing?: string;
    buyer?: string;
    now?: number;
    issuers?: readonly ReceiptIssuer[];
}): ReceiptCheck;
/** A lightning address, as one: `name@host`, lower case. "" for anything else. Public: typing or showing one gives nothing away. */
export declare function cleanLightningAddress(input: unknown): string;
/** The least and the most that may be asked for in one tip, in sats: what the sign-in address will take as a request at all. */
export declare const TIP_LIMITS: {
    readonly least: 1;
    readonly most: 1000000;
};
/** An amount for a tip, as one: a whole number of sats within the limits, or null. */
export declare function cleanTip(input: unknown): number | null;
