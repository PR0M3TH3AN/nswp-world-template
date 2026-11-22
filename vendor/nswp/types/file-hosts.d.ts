import type { NostrEvent } from "./event.js";
/** The kind of a person's list of the file hosts they keep their files on (Blossom's user server list, NIP-B7). */
export declare const FILE_HOST_LIST_KIND = 10063;
/** The kit's own default file hosts: hosts BitBlocks runs, each serving files named by their hashes. */
export declare const FILE_HOSTS: readonly string[];
/** The most file hosts taken from one person's list, and the longest a host's address may be. */
export declare const FILE_HOST_LIMITS: {
    readonly list: 6;
    readonly url: 200;
};
/**
 * A file host's address as it may be used: `https`, no name or password in it, nothing after a `?` or `#`, and
 * ending in `/`, so that a hash put after it names a file inside it. Null for anything else.
 */
export declare function cleanFileHost(input: unknown): string | null;
/** A file's extension, from its hint: `.glb`, `.ogg`, `.js`. "" where the hint has none worth using. */
export declare function fileExtension(hint: string): string;
/** Where a file is on a file host: `<host><sha256><ext>`. */
export declare function fileAt(host: string, sha256: string, hint?: string): string;
/** Whether an address is inside one of these file hosts. */
export declare function onFileHost(url: string, hosts: readonly string[]): boolean;
/**
 * The file hosts a person's list names, in their order: from the newest of their lists that really is theirs.
 * Each is cleaned, the same one isn't named twice, and only the first `FILE_HOST_LIMITS.list` are taken.
 */
export declare function parseFileHostList(events: readonly NostrEvent[], pubkey: string): string[];
