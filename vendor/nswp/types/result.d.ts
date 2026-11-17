/**
 * Validation results and errors.
 *
 * Codes are lowercase snake_case and stable; messages are for humans and are
 * never parsed (BitBlocks convention D4).
 */
export interface Issue {
    code: string;
    /** Where the problem is, e.g. `tags.r`, `worlds.example-museum.entry.url`. */
    path: string;
    message: string;
}
export type Result<T> = {
    ok: true;
    value: T;
    warnings: Issue[];
} | {
    ok: false;
    errors: Issue[];
    warnings: Issue[];
};
export declare class NswpError extends Error {
    readonly code: string;
    readonly retryable: boolean;
    readonly details?: Record<string, unknown>;
    constructor(code: string, message: string, opts?: {
        retryable?: boolean;
        details?: Record<string, unknown>;
        cause?: unknown;
    });
}
/** Collects errors and warnings while a validator walks its input. */
export declare class Collector {
    readonly errors: Issue[];
    readonly warnings: Issue[];
    error(code: string, path: string, message: string): void;
    warn(code: string, path: string, message: string): void;
    result<T>(value: T): Result<T>;
}
export declare function isPlainObject(v: unknown): v is Record<string, unknown>;
