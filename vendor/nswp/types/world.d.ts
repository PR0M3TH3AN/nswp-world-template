/** Spatial World Announcements (spec §5). */
import { type Audience, type Category, type ItemsRule } from "./constants.js";
import type { PreviewType } from "./constants.js";
import { type EventTemplate } from "./event.js";
import { type Result } from "./result.js";
export interface WorldComfort {
    locomotion?: string;
    intensity?: string;
    seated?: string;
}
/** The view through a portal: a still image of the world, fetched by hash (spec §5.8). */
export interface Preview {
    url: string;
    type: PreviewType;
    /** SHA-256 of the file, lowercase hex. Clients check the bytes against it. */
    sha256: string;
    width?: number;
    height?: number;
}
export interface WorldInput {
    d: string;
    title: string;
    url: string;
    summary?: string;
    description?: string;
    image?: {
        url: string;
        dimensions?: string;
    };
    previews?: Preview[];
    modes?: string[];
    capabilities?: string[];
    comfort?: WorldComfort;
    inputs?: string[];
    perf?: string;
    topics?: string[];
    /** ISO-639-1 codes. */
    languages?: string[];
    /** `true` for a warning with no reason. */
    contentWarning?: string | true;
    /** Who it is for: `kids`, `general` or `adult`. An adult world is given a content warning if it has none. */
    audience?: Audience;
    /** What kind of place it is: one of `CATEGORIES`. */
    category?: Category;
    /** What it does with the things visitors carry: one of `ITEM_RULES`. Left out, they work there (`allowed`); `none` turns them off. */
    items?: ItemsRule;
    status?: string;
    /** Only when the manifest is not at the well-known path (it then can't verify). */
    manifest?: string;
    coCreators?: string[];
    /** Coordinate of an access product, e.g. a BitUnlock product (`30078:<pubkey>:<d>`). */
    access?: string;
    createdAt?: number;
}
export interface World {
    /** `37300:<pubkey>:<d>` when the event has a pubkey. */
    coordinate?: string;
    pubkey?: string;
    d: string;
    title: string;
    url: string;
    summary?: string;
    description: string;
    image?: {
        url: string;
        dimensions?: string;
    };
    /** At most one per type; anything invalid or over the ceilings is left out. */
    previews: Preview[];
    modes: string[];
    capabilities: string[];
    comfort: WorldComfort;
    inputs: string[];
    perf?: string;
    topics: string[];
    languages: string[];
    contentWarning?: string;
    /** Who its maker says it is for. Left out when they didn't say, or said something else. */
    audience?: Audience;
    /** What kind of place its maker says it is. Left out when they didn't say, or said something else. */
    category?: Category;
    /** What its maker says it does with the things visitors carry. Left out when they didn't say: then it is `allowed`. A word nobody knows is `none`. */
    items?: ItemsRule;
    status: string;
    manifest?: string;
    coCreators: string[];
    access?: string;
    createdAt: number;
}
/**
 * How a reader that wants to be careful takes a world's word about itself.
 * `adult` when it says so, and also when it carries a content warning and
 * doesn't say who it is for: a warning with no audience is not a promise that
 * it is fit for everyone. `unrated` when it says nothing at all.
 *
 * This is the maker's own word. It keeps honest makers' worlds where they
 * belong; it does nothing about a maker who lies. That is what lists are for
 * (protocol/08-lists.md).
 */
export declare function audienceOf(w: Pick<World, "audience" | "contentWarning">): Audience | "unrated";
/** Build an unsigned world announcement, tag-first (spec §5.2). */
export declare function buildWorldEvent(w: WorldInput): EventTemplate;
export interface ParseWorldOptions {
    /** Require `id`, `pubkey` and `sig` fields (signature itself is checked by `verifyEvent`). */
    requireSigned?: boolean;
}
/** Validate a world announcement and return its structured form. */
export declare function parseWorldEvent(input: unknown, opts?: ParseWorldOptions): Result<World>;
export type PreviewCheck = {
    ok: true;
} | {
    ok: false;
    code: "preview_too_large" | "preview_hash_mismatch";
    message: string;
};
/**
 * Check a fetched preview file before showing it: it must be within the size
 * ceiling and must hash to what the signed announcement promised (spec §5.8).
 */
export declare function checkPreviewBytes(preview: Preview, bytes: Uint8Array): PreviewCheck;
/**
 * The picture a door to this world shows, which a world must have (protocol/04-previews.md): which kind it still
 * owes, or null when it has it. A place that can be stood in owes a `pano`, the 360° still a doorway is drawn
 * from. A place that is only an ordinary web page (every mode `2d`) has nowhere to stand, and may give a `flat`.
 *
 * This is for whoever makes or signs a world, and it is their tools that hold them to it. A reader never refuses
 * a world for having no picture: it draws a placeholder, as it always has, for the worlds made before this and
 * the sites that never announced themselves.
 */
export declare function doorPictureOwed(world: {
    modes?: readonly string[];
    previews?: readonly {
        type: string;
    }[];
}): PreviewType | null;
/**
 * True when a preview is served from the world's own site. Such a preview must
 * not be fetched while the world is merely listed (spec §5.7, §5.8).
 */
export declare function previewOnWorldOrigin(world: {
    url: string;
}, preview: Preview): boolean;
