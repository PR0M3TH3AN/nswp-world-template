/**
 * Fetching someone else's file by its hash, only from file hosts on the viewer's own list
 * (protocol/17-items.md, "Where a file is fetched from").
 *
 * The viewer's list is the file hosts their own sign-in address keeps their files on (their kind 10063 list, read
 * from relays by their key), then the kit's default (`FILE_HOSTS`). Each is asked for the hash itself, at
 * `<host><sha256><ext>`. The address an item gives for a file is only a hint: it is used when it is inside one of
 * those hosts, or when the viewer turned on "Load people's files from anywhere" (`files-anywhere`). Whatever
 * comes is still taken only if its bytes have the hash.
 *
 * A guest has no list of their own: only `FILE_HOSTS`.
 */
import { queryRelays } from "@nswp/core";
/**
 * Whether this visitor loads other people's files from anywhere they say they are kept. Off unless they turned it
 * on here, with their own press. Turning it off goes with them, as their other settings do; turning it on never
 * does, since any world can write the link a visitor arrives by, and so could turn it on for them unasked.
 */
export declare function filesAnywhere(): boolean;
/** Turn loading files from anywhere on, or off again, for this visitor. */
export declare function setFilesAnywhere(on: boolean): void;
/** Be told when the switch changes, or the viewer's own list arrives. Returns how to stop. */
export declare function onFileHostsChange(fn: () => void): () => void;
/** For tests: forget the switch and the viewer's list, so both are read afresh. */
export declare function forgetFileHosts(): void;
export interface FileHostsOptions {
    relays?: string[];
    query?: typeof queryRelays;
    now?: () => number;
}
/**
 * Read the file hosts this viewer keeps their files on, from their kind 10063 list: once for each key, and kept
 * for the visit. Null (a guest) leaves only the kit's own. What is read is what `fileHosts()` gives from then on.
 */
export declare function learnFileHosts(pubkey: string | null, opts?: FileHostsOptions): Promise<string[]>;
/** The viewer's list, as it is known now: the hosts their own sign-in address keeps their files on, then `FILE_HOSTS`. */
export declare function fileHosts(): string[];
/**
 * Whether the place a file says it is kept is somewhere this viewer doesn't load files from: off their list, with
 * `files-anywhere` off. Such a file is still asked for by its hash from the hosts on their list.
 */
export declare function keptElsewhere(hint: string): boolean;
export interface FetchByHashOptions {
    /** The most bytes taken. */
    most?: number;
    /** Fetch an address's bytes: the browser's own, with nothing sent with it, unless given. */
    fetchBytes?: (url: string) => Promise<Uint8Array | null>;
    /** Whose own list is used, read first if it hasn't been: the signed-in viewer's key, or null for a guest. */
    viewer?: string | null;
    hosts?: FileHostsOptions;
}
/** The addresses a file is asked for at, in order: the hint first where it is on the list (or anything goes), then each listed host. */
export declare function addressesFor(sha256: string, hint: string, hosts?: readonly string[], anywhereOn?: boolean): string[];
/** What asking for a file came to: its bytes, or null; and whether something came that wasn't it. */
export interface Fetched {
    bytes: Uint8Array | null;
    /** Something came that was too big, or didn't have the hash: asking the same places again would get the same. */
    wrong: boolean;
}
/** `fetchByHash`, saying whether something wrong came. */
export declare function fetchByHashSaying(sha256: string, hint: string, opts?: FetchByHashOptions): Promise<Fetched>;
/**
 * A file's bytes, by its hash: asked for only where the viewer's own list allows (`addressesFor`), one address at a
 * time, and taken only if they have that hash and are no more than `most`. Null where none had it.
 */
export declare function fetchByHash(sha256: string, hint: string, opts?: FetchByHashOptions): Promise<Uint8Array | null>;
