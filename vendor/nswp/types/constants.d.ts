/** Experimental event kinds. Not allocated by the NIPs process (spec §5.1, §22). */
export declare const WORLD_KIND = 37300;
export declare const AVATAR_KIND = 37301;
/** NIP-98 HTTP auth shape, reused for entry assertions (spec §4.4, Q3). */
export declare const ENTRY_ASSERTION_KIND = 27235;
/** NIP-51 curation sets, used for third-party world listings (spec §5.4). */
export declare const CURATION_SET_KIND = 30004;
export declare const SCHEMAS: {
    readonly manifest: "nswp/manifest/0.3";
    readonly portal: "nswp/portal/0.3";
    readonly arrival: "nswp/arrival/0.3";
};
export declare const WELL_KNOWN_PATH = "/.well-known/nswp.json";
/**
 * The version of the kit this code is: the library, the SDK, the engine
 * script and the Godot addon are built together and share it. It is the
 * spec's version, the newest heading in CHANGELOG.md, and a test keeps the
 * two the same. A world says it in its manifest (`kit`), so a visitor's
 * client can tell how old a world's controls are without loading the world
 * (protocol/01-worlds.md, "Which kit a world was built with").
 */
export declare const KIT_VERSION = "0.57.0";
/** A version as three numbers, or null for anything that isn't one. */
export declare function parseKitVersion(v: unknown): [number, number, number] | null;
/**
 * How a world's kit stands beside the one a reader has: "same" (the same
 * release, give or take a fix), "older", "newer", or "unknown" when the world
 * doesn't say or what it says isn't a version. Only ever something to tell a
 * visitor or a world's owner. An older kit still works: a reader ignores what
 * it doesn't know, and that is what keeps old worlds open.
 */
export declare function kitAge(theirs: unknown, mine?: string): "same" | "older" | "newer" | "unknown";
export declare const MODES: readonly ["2d", "inline-3d", "immersive-vr", "immersive-ar"];
export declare const CAPABILITIES: readonly ["webxr", "rooms", "multiplayer", "voice", "spatial-portals", "avatars", "entry-assertion", "payments", "home"];
/**
 * Who a world is for, as its maker says. `kids`: made for children. `general`:
 * not made for children, and nothing an adult would need warning about.
 * `adult`: not for anyone under age; what some call NSFW.
 */
export declare const AUDIENCES: readonly ["kids", "general", "adult"];
export type Audience = (typeof AUDIENCES)[number];
/**
 * What kind of place a world is, as its maker says: one word from a short closed list, so that a door, a list and
 * the Airlock can all say it the same way.
 *
 * `game`: there is something to win, beat or finish. `experience`: a place to walk through and look at. `social`:
 * made for meeting other people. `app`: a tool that does a job. `site`: mostly words and pictures to read.
 */
/**
 * What a world does with the things its visitors carry (protocol/17-items.md), as its maker says: one word from a
 * short closed list, so that a door and the Airlock can warn a visitor before they go in.
 *
 * `none`: nothing carried is drawn or works there. `allowed`: items work, and can affect other people; anyone
 * may mute them. `play`: items are part of the game, and nobody there is out of their reach.
 *
 * A world that says nothing is `none`.
 */
export declare const ITEM_RULES: readonly ["none", "allowed", "play"];
export type ItemsRule = (typeof ITEM_RULES)[number];
/** A world's rule for items, as it may be used: one on the list, and `none` for anything else. */
export declare function cleanItemsRule(rule: unknown): ItemsRule;
/**
 * A world's rule for items as words for a visitor, on a door or at the Airlock. A place where items are part of
 * the game is always said. One that only allows them is said too, more quietly. Null where there are none.
 */
export declare function itemsWords(rule: unknown): string | null;
export declare const CATEGORIES: readonly ["game", "experience", "social", "app", "site"];
export type Category = (typeof CATEGORIES)[number];
/** A category as words for a visitor: "A game". Null for none, or one this doesn't know. */
export declare function categoryWords(category: unknown): string | null;
export declare const COMFORT: {
    readonly locomotion: readonly ["stationary", "teleport", "smooth", "vehicle"];
    readonly intensity: readonly ["low", "medium", "high"];
    readonly seated: readonly ["supported", "required", "unsupported"];
};
export declare const INPUTS: readonly ["controllers", "hands", "gaze", "keyboard-mouse", "touch", "gamepad"];
export declare const PERF_TIERS: readonly ["mobile", "standalone", "desktop"];
export declare const STATUSES: readonly ["live", "beta", "maintenance", "retired"];
/** Kinds of preview a world can publish (spec §5.8). */
export declare const PREVIEW_TYPES: readonly ["pano", "flat"];
export type PreviewType = (typeof PREVIEW_TYPES)[number];
/** Ceilings a client enforces whatever a world claims (spec §5.8). */
export declare const PREVIEW_LIMITS: {
    readonly pano: {
        readonly width: 4096;
        readonly height: 2048;
        readonly bytes: number;
    };
    readonly flat: {
        readonly width: 1920;
        readonly height: 1080;
        readonly bytes: number;
    };
};
export declare const LIMITS: {
    readonly manifestBytes: number;
    readonly arrivalChars: number;
    readonly maxReceipts: 8;
    /** Keys a visitor's client may say they have blocked, in one arrival. */
    readonly maxBlocked: 64;
    /** Keys a world may report as newly blocked, on one link. */
    readonly maxBlockedOnLink: 16;
    readonly maxIdLength: 128;
    readonly maxTitleLength: 200;
    readonly maxUrlLength: 2048;
    readonly assertionTtlSec: 60;
    readonly assertionFutureSkewSec: 10;
    readonly minNonceLength: 16;
};
export type Mode = (typeof MODES)[number];
export type Capability = (typeof CAPABILITIES)[number];
export type Locomotion = (typeof COMFORT.locomotion)[number];
export type Intensity = (typeof COMFORT.intensity)[number];
export type Seated = (typeof COMFORT.seated)[number];
export type Input = (typeof INPUTS)[number];
export type PerfTier = (typeof PERF_TIERS)[number];
export type Status = (typeof STATUSES)[number];
