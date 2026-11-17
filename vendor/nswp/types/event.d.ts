export interface EventTemplate {
    kind: number;
    created_at: number;
    tags: string[][];
    content: string;
}
export interface UnsignedEvent extends EventTemplate {
    pubkey: string;
}
export interface NostrEvent extends UnsignedEvent {
    id: string;
    sig: string;
}
export declare function isHex64(v: unknown): v is string;
export declare function nowSeconds(): number;
export declare function serializeEvent(e: UnsignedEvent): string;
export declare function getEventHash(e: UnsignedEvent): string;
export declare function getPublicKey(secretKey: Uint8Array): string;
/**
 * Sign a template. `auxRand` exists only for reproducible test vectors;
 * leave it unset for anything real.
 */
export declare function finalizeEvent(template: EventTemplate, secretKey: Uint8Array, auxRand?: Uint8Array): NostrEvent;
/** True if `v` has the field types of a NIP-01 event (signature not checked). */
export declare function hasEventShape(v: unknown): v is NostrEvent;
/** Checks shape, that `id` is the event hash, and the BIP-340 signature. */
export declare function verifyEvent(v: unknown): v is NostrEvent;
export declare function getTags(e: {
    tags: string[][];
}, name: string): string[][];
export declare function getTagValue(e: {
    tags: string[][];
}, name: string): string | undefined;
