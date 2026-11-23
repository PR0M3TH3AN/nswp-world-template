/** The most keys whose lists count for one world. */
export declare const KEEPERS_MOST: 4;
import { type Issue, type Result } from "./result.js";
import type { World } from "./world.js";
/** Above this many megabytes, a world's first download is a lot to ask (spec §10.1, "Budgets": "initial world download warned above 50 MB"). */
export declare const DOWNLOAD_WARN_MB = 50;
/**
 * How big a world says its first download is, for an Airlock to say before the visitor crosses
 * (protocol/02-doors.md, "What an Airlock does"): `mb`, the words to show, and `heavy` above `DOWNLOAD_WARN_MB`.
 * It is the world's own claim, from its manifest's `budgets.initial_download_mb`, and nothing here checks it: the
 * words say so. Null where the world says nothing, or something that isn't a size.
 */
export declare function worldDownload(world: Pick<ManifestWorld, "budgets"> | null | undefined): {
    mb: number;
    words: string;
    heavy: boolean;
} | null;
export interface ManifestWorld {
    entry: {
        url: string;
        modes: string[];
    };
    entryPoints: string[];
    capabilities: string[];
    /**
     * What it draws of people's looks (protocol/05-looks.md, "A model of your own"): the model formats it draws
     * (`vrm`, `glb`; none, and everyone is drawn as their simple look), how heavy and how tall it lets one be, and
     * `dress: "own"` where it dresses everyone itself and draws nobody's look.
     */
    avatar?: {
        formats: string[];
        maxFileSizeMb?: number;
        maxTriangles?: number;
        height?: [number, number];
        dress?: "own";
    };
    multiplayer?: {
        endpoint: string;
        auth?: string;
    };
    budgets?: {
        initialDownloadMb?: number;
    };
    airlock?: string;
    /**
     * The listings this world is entered by, where it is paid (protocol/01-worlds.md, "A paid world"): each one a
     * listing's coordinate whose seller is a key this file names as a publisher of this world. Left out, it is free.
     */
    access?: string[];
    /**
     * Whose lists count for this world (protocol/10-identity.md, "A world's own lists"): at most four keys. Left out,
     * the world's publishers in this file; but a world that writes neither this nor a word that needs a list reads no
     * list at all.
     */
    keepers?: string[];
    /** In this world's rooms a visitor's kit shows and hears only people whose pass checks out: no guests. */
    namedOnly?: boolean;
    /** Only people a keeper's allow list names (and the keepers) may go in; its rooms show only them. */
    byInvitation?: boolean;
}
export interface Manifest {
    schema: string;
    listing: "allow" | "deny";
    publishers: Record<string, {
        worlds: string[];
    }>;
    worlds: Record<string, ManifestWorld>;
    relays: string[];
    /** The version of the kit the site was built with, when it says. Its own word, and only ever something to tell someone. */
    kit?: string;
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
/**
 * What the world at an address is entered by, as its own site says: the listings its manifest names for it, and the
 * keys that may sell it (its publishers). A world its manifest names no listing for is free: `listings` is empty.
 * Null where the manifest lists no world at that address at all, so nothing can be said of it.
 */
export declare function accessFor(manifest: Manifest, url: string): {
    d: string;
    listings: string[];
    sellers: string[];
    keepers: string[] | null;
    namedOnly: boolean;
    byInvitation: boolean;
} | null;
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
