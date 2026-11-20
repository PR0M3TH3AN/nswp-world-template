import type { Issue } from "./result.js";
export interface DestinationInfo {
    /** Normalized href. */
    url: string;
    origin: string;
    hostname: string;
    /** e.g. `example.co.uk`; null for IP addresses and unknown suffixes. */
    registrableDomain: string | null;
    /** Everything left of the registrable domain, e.g. `museum.` — shown de-emphasised. */
    hostPrefix: string;
}
export type DestinationCheck = {
    ok: true;
    value: DestinationInfo;
    warnings: Issue[];
} | {
    ok: false;
    error: Issue;
    warnings: Issue[];
};
export interface DestinationOptions {
    /** Allow http://localhost, 127.0.0.1 and [::1] for local development. Default false. */
    allowLocalhost?: boolean;
}
export declare function checkDestination(input: string, opts?: DestinationOptions): DestinationCheck;
export declare function isHttpsUrl(v: unknown): v is string;
export declare function isWssUrl(v: unknown): v is string;
/** Normalized href for comparisons, or null if not a URL. */
export declare function normalizeUrl(v: string): string | null;
/** A place as it may be named in a tag or shown to someone: an http(s) origin, or "". */
export declare function cleanOrigin(input: unknown): string;
