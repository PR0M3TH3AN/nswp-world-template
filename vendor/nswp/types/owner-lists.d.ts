/** The kind a list is: application data, addressed by its own name. The same kind as a listing and a receipt. */
export declare const LIST_KIND = 30078;
/** The namespace every client's lists for worlds are written under. */
export declare const LIST_NAMESPACE = "nswp";
/**
 * The limits. `read`: the most entries a list may have and still be read at all (one with more is refused, not
 * cut short). `write`: the most the kit's own writers put in one (a longer note is refused by many relays). `ahead`:
 * how far ahead of the reader's clock a list may be dated, in seconds. `root`: the most keys a root may be.
 */
export declare const OWNER_LIST_LIMITS: {
    readonly read: 2000;
    readonly write: 500;
    readonly ahead: 600;
    readonly root: 4;
};
export type ListScope = "user-allow" | "user-deny";
export type ListRefusal = "not_an_event" | "wrong_kind" | "bad_d" | "unsupported_version" | "unsupported_scope" | "bad_subject" | "tag_mismatch" | "wrong_signer" | "content_not_empty" | "too_many_entries" | "from_the_future" | "bad_signature";
/** What one list says, once it has been read and checked. */
export interface OwnerList {
    readonly ok: true;
    readonly scope: ListScope;
    /** What it is for: the world's coordinate. */
    readonly subject: string;
    /** Who signed it: a key of the root. */
    readonly signer: string;
    /** The people on it, each once, in order of their keys (as BitGate gives them). */
    readonly entries: readonly string[];
    /** How many `p` tags weren't a key in lowercase hex, and were left out. */
    readonly skipped: number;
}
export type ListRead = OwnerList | {
    readonly ok: false;
    readonly reason: ListRefusal;
};
/** The list as chosen from what relays gave: the newest copy, or why there is none. `futureDated` lists the copies left out for being dated ahead. */
export type ListResolved = (OwnerList | {
    readonly ok: false;
    readonly reason: ListRefusal | "not_found";
}) & {
    readonly futureDated: readonly string[];
};
/** A subject, as the grammar has it: a kind, a key, and the rest is the name. True if it is one. */
export declare function isListSubject(subject: unknown): subject is string;
/** A world's coordinate as a list's subject: `37300:<the key that announced it>:<its d>`. */
export declare function worldSubject(publisher: string, d: string): string;
/** The `d` a list is filed under. */
export declare function listD(scope: ListScope, subject: string, namespace?: string): string;
/** A root as it may be given: one key or a list of one to four, each 64 lowercase hex. Null for anything else. */
export declare function cleanRoot(root: unknown): string[] | null;
/**
 * Read one list, the way BitGate's document says, refusing with the first check that fails. `root` is the keys
 * that may sign it (left out: the subject's own key). `now` is the reader's clock, in seconds.
 */
export declare function readOwnerList(event: unknown, o?: {
    root?: string | readonly string[];
    now?: number;
}): ListRead;
/**
 * Choose the list from whatever relays gave: the copies signed by a root key, under exactly the expected `d`, with
 * a good signature. Those dated more than ten minutes ahead are left out first, and named in `futureDated`. The
 * newest of the rest (a tie to the smallest id) is read in full; if it is refused, the list is unreadable.
 */
export declare function resolveOwnerList(events: readonly unknown[], q: {
    scope: ListScope;
    subject: string;
    namespace?: string;
    root?: string | readonly string[];
    now?: number;
}): ListResolved;
/**
 * A list to sign, for the kit's own writers (the `nswp` command, and later the owner's screen): the tags BitGate's
 * shape needs, in that order, and one `p` for each person, each once and in order of their keys (as a reader gives
 * them back), at most `OWNER_LIST_LIMITS.write`. Null where it can't be written: a subject that isn't one, a key that
 * isn't one, or too many people. `vectors/owner-list-writing.json` is what another writer is held to.
 */
export declare function ownerListTemplate(o: {
    scope: ListScope;
    subject: string;
    people: readonly string[];
    createdAt: number;
    namespace?: string;
}): {
    kind: number;
    created_at: number;
    content: string;
    tags: string[][];
} | null;
