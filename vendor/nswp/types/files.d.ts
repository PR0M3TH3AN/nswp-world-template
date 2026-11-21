export declare const FILE_LIMITS: {
    /** The most a file passed this way may hold: 25 MB. */
    readonly bytes: number;
    /** The most characters in its name. */
    readonly name: 120;
};
/**
 * A file's name, as only a name: no path, nothing unseen, one line, not too long, and not "." or "..". "" for
 * anything that leaves nothing.
 */
export declare function cleanFileName(input: unknown): string;
/** A file's type, as a media type and nothing else ("image/png"). What isn't one is "application/octet-stream": just bytes. */
export declare function cleanFileType(input: unknown): string;
/** A file's bytes, as bytes: some, and no more than may be passed. Null for anything else. */
export declare function cleanFileBytes(input: unknown): Uint8Array | null;
/**
 * Where a public file is kept, as a server says it: a secure address that ends in the SHA-256 of the file (with
 * or without an ending like ".png"), and nothing after it. "" for anything else.
 */
export declare function cleanFileUrl(input: unknown): string;
/** Whether that address names exactly these bytes: the hash in it is theirs. An address that doesn't is not believed. */
export declare function fileUrlNames(url: unknown, bytes: Uint8Array): boolean;
