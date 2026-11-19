import { type Issue, type Result } from "./result.js";
import type { World } from "./world.js";
export interface ManifestWorld {
    entry: {
        url: string;
        modes: string[];
    };
    entryPoints: string[];
    capabilities: string[];
    avatar?: {
        formats: string[];
        maxFileSizeMb?: number;
        maxTriangles?: number;
    };
    multiplayer?: {
        endpoint: string;
        auth?: string;
    };
    budgets?: {
        initialDownloadMb?: number;
    };
    airlock?: string;
}
export interface Manifest {
    schema: string;
    listing: "allow" | "deny";
    publishers: Record<string, {
        worlds: string[];
    }>;
    worlds: Record<string, ManifestWorld>;
    relays: string[];
}
export declare function wellKnownUrl(urlOrOrigin: string): string;
/** Validate a parsed manifest. Pass `byteLength` when you have the raw body. */
export declare function parseManifest(input: unknown, opts?: {
    byteLength?: number;
}): Result<Manifest>;
export interface VerificationCheck {
    name: "same_origin" | "publisher_listed" | "world_listed" | "entry_url_matches";
    ok: boolean;
    message: string;
}
export interface Verification {
    verified: boolean;
    checks: VerificationCheck[];
}
/**
 * Is this announcement verified for its origin? All four rules in spec §7.3
 * must hold. `manifestUrl` is where the manifest was actually fetched from.
 */
export declare function verifyOrigin(world: World, manifest: Manifest, manifestUrl: string): Verification;
/**
 * The door to a world as its own site names it: the announcement its manifest
 * lists for this address, and the address. A world uses it to send a visitor
 * back to itself through their own client, which checks it like any other
 * door. With no announcement for the address, or more than one publisher
 * claiming it, the door is the address alone.
 */
export declare function doorFor(manifest: Manifest, url: string): {
    naddr?: string;
    url: string;
};
export interface FetchManifestResult {
    url: string;
    manifest?: Manifest;
    issues: Issue[];
    warnings: Issue[];
    /** Only knowable outside a browser (in a browser a missing header makes the fetch fail). */
    corsHeader?: string | null;
}
/**
 * Fetch and validate an origin's manifest following spec §7.1: HTTPS only,
 * no redirects, size limit. Never throws for HTTP problems; they become issues.
 */
export declare function fetchManifest(urlOrOrigin: string, fetchImpl?: typeof fetch, timeoutMs?: number): Promise<FetchManifestResult>;
export declare function assertManifest(input: unknown): Manifest;
