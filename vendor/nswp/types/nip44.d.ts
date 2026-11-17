export declare function getConversationKey(secretKey: Uint8Array, pubkey: string): Uint8Array;
/** `nonce` is for test vectors only; leave it unset for anything real. */
export declare function nip44Encrypt(plaintext: string, conversationKey: Uint8Array, nonce?: Uint8Array): string;
export declare function nip44Decrypt(payload: string, conversationKey: Uint8Array): string;
