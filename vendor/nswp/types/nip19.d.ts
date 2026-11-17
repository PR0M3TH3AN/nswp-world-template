export interface AddressPointer {
    kind: number;
    pubkey: string;
    identifier: string;
    relays?: string[];
}
export declare function encodeNaddr(p: AddressPointer): string;
export declare function decodeNaddr(s: string): AddressPointer;
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
