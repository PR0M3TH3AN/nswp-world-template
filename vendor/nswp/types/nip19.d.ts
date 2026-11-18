export interface AddressPointer {
    kind: number;
    pubkey: string;
    identifier: string;
    relays?: string[];
}
export declare function encodeNaddr(p: AddressPointer): string;
export declare function decodeNaddr(s: string): AddressPointer;
/** A public key as people write one down: `npub1…`. */
export declare function encodeNpub(pubkey: string): string;
/** Read a public key someone wrote down: an `npub1…`, or 64 hex characters. Throws when it is neither. */
export declare function decodeNpub(s: string): string;
/** An npub short enough to sit beside a figure: its start and its end. */
export declare function shortNpub(pubkey: string): string;
export declare function coordinate(p: {
    kind: number;
    pubkey: string;
    identifier: string;
}): string;
export declare function parseCoordinate(s: string): {
    kind: number;
    pubkey: string;
    identifier: string;
} | null;
