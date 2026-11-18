export interface Blocked {
    /** Their identity key, as 64 hex characters. */
    key: string;
    /** What they were called when they were blocked. Their word, cleaned; a label for the visitor, nothing more. */
    name: string;
    /** When, in seconds. */
    at: number;
}
/** More than anyone needs, and a bound on what a page will read back. */
export declare const BLOCK_LIMIT = 500;
/** Read a kept list, trusting nothing in it. */
export declare function cleanBlocked(input: unknown): Blocked[];
/** The list with one more person on it, newest first. Blocking someone twice keeps the first. */
export declare function withBlocked(list: Blocked[], who: {
    key: string;
    name?: string;
}, now?: number): Blocked[];
export declare function withoutBlocked(list: Blocked[], key: string): Blocked[];
type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
/** The visitor's kept blocks on this site. */
export declare function loadBlocked(storage?: Store | null): Blocked[];
export declare function storeBlocked(list: Blocked[], storage?: Store | null): void;
export {};
