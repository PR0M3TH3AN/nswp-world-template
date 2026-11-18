import { type EventTemplate } from "./event.js";
import { type Result } from "./result.js";
/** Ceilings a reader enforces whatever a list claims. */
export declare const LIST_LIMITS: {
    readonly worlds: 200;
    readonly titleChars: 200;
    readonly descriptionChars: 1000;
};
export interface ListInput {
    /** The list's name under its curator's key. */
    d: string;
    title: string;
    description?: string;
    /** World coordinates, `37300:<pubkey>:<d>`, in the order to show them. */
    worlds: string[];
    createdAt?: number;
}
export interface WorldList {
    d: string;
    /** The curator's title, or the list's `d` when it has none. */
    title: string;
    description: string;
    /** World coordinates, in the curator's order, each once. */
    worlds: string[];
    createdAt: number;
    /** The curator's key, when the event carries one. */
    pubkey?: string;
    /** `30004:<pubkey>:<d>`: what a client follows. */
    coordinate?: string;
}
/** A list event, ready to sign. */
export declare function buildListEvent(l: ListInput): EventTemplate;
export interface ParseListOptions {
    /** Require `id`, `pubkey` and `sig` fields (the signature itself is checked by `verifyEvent`). */
    requireSigned?: boolean;
}
/** Read a list. Anything on it that isn't a world is passed over; too many worlds are cut off with a warning. */
export declare function parseListEvent(input: unknown, opts?: ParseListOptions): Result<WorldList>;
