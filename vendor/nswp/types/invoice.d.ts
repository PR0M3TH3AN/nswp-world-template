/** No invoice is longer than this. */
export declare const INVOICE_LIMIT = 2000;
/** A Lightning invoice as it may be passed on: the bolt11 form, lower case, and no longer than one could be. "" for anything else. */
export declare function cleanInvoice(input: unknown): string;
/** The payment hash an invoice names, in hex, or null if it can't be read (not an invoice, a bad checksum, none in it). */
export declare function invoicePaymentHash(invoice: unknown): string | null;
/** Whether `preimage` (64 hex characters) is the proof that this invoice was paid: its SHA-256 is the invoice's payment hash. */
export declare function provesPayment(invoice: unknown, preimage: unknown): boolean;
