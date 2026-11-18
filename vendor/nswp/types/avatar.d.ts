import { type EventTemplate, type NostrEvent } from "./event.js";
import { type Result } from "./result.js";
/** The closed lists a look is chosen from. The first of each is what an unknown value falls back to. */
export declare const LOOK_PARTS: {
    readonly build: readonly ["medium", "slight", "broad"];
    readonly head: readonly ["round", "square", "tall", "wedge", "flat", "faceted"];
    readonly face: readonly ["band", "split", "dots", "tee", "slit", "wide"];
    readonly accessory: readonly ["none", "antenna", "halo", "hat", "crest", "fins"];
    readonly body: readonly ["cloak", "coat", "plate", "robe"];
    readonly shoulders: readonly ["none", "pads", "mantle", "collar"];
    readonly pattern: readonly ["plain", "halves", "stripe", "bands", "yoke"];
    readonly finish: readonly ["matte", "gloss", "sheen"];
};
export type LookPart = keyof typeof LOOK_PARTS;
export declare const LOOK_COLORS: readonly ["color", "accent", "light"];
export type LookColor = (typeof LOOK_COLORS)[number];
export interface Look {
    /** The main colour, as `#rrggbb`. */
    color: string;
    /** The second colour: trim, and the other half of a pattern. */
    accent: string;
    /** The colour of everything that glows: the face, the seams, the hands. */
    light: string;
    build: (typeof LOOK_PARTS.build)[number];
    head: (typeof LOOK_PARTS.head)[number];
    face: (typeof LOOK_PARTS.face)[number];
    accessory: (typeof LOOK_PARTS.accessory)[number];
    body: (typeof LOOK_PARTS.body)[number];
    shoulders: (typeof LOOK_PARTS.shoulders)[number];
    pattern: (typeof LOOK_PARTS.pattern)[number];
    finish: (typeof LOOK_PARTS.finish)[number];
    /**
     * What the mark on the chest is drawn from: fifteen bits, as four hex
     * digits. It is not a choice. It comes from the key (or, for a guest, from
     * the seed their lobby keeps), so it stays the same whatever else changes.
     */
    mark: string;
}
/**
 * The look a key has before its owner chooses one. `seed` is a public key in
 * hex, or any string a lobby keeps for a guest. The same seed always gives
 * the same look, in every implementation: the bytes of SHA-256(seed) pick
 * each part in the order below.
 */
export declare function generatedLook(seed: string): Look;
/** The mark for a key or seed: fifteen bits of SHA-256(seed), as four hex digits. */
export declare function markFor(seed: string): string;
/**
 * The mark as a picture: five rows of five cells, mirrored left to right.
 * `true` is a lit cell. Every renderer draws the same grid from the same mark.
 */
export declare function markGrid(mark: string): boolean[][];
/** Apply someone's choices on top of the look their key gives them. Anything unknown or missing keeps the generated value. */
export declare function applyChoices(base: Look, choices: Record<string, unknown>): {
    look: Look;
    warnings: string[];
};
/** A look as `["simple", name, value]` tags, for an avatar event. The mark is left out: a reader works it out from the key. */
export declare function lookToTags(look: Look): string[][];
/** Read a look from an avatar event's tags, on top of what `seed` (the author's key) generates. */
export declare function lookFromTags(tags: string[][], seed: string): {
    look: Look;
    warnings: string[];
};
/**
 * A look small enough to travel in an arrival context or a room's hello: a
 * short JSON object. It carries a seed, so a guest's mark and unchosen parts
 * come out the same in every world without anything being published.
 */
export declare function encodeLook(look: Look, seed: string): string;
export declare const LOOK_LIMITS: {
    readonly chars: 600;
    readonly seedChars: 64;
};
export declare function decodeLook(text: string): Result<{
    look: Look;
    seed: string;
}>;
export interface AvatarInput {
    /** The avatar's slot. Most people have one: `default`. */
    d?: string;
    title?: string;
    look: Look;
    createdAt?: number;
}
/** An avatar event (kind 37301) carrying the simple tier. */
export declare function buildAvatarEvent(a: AvatarInput): EventTemplate;
/** Read the simple tier of an avatar event. The author's key decides the mark and anything they didn't choose. */
export declare function parseAvatarEvent(event: Pick<NostrEvent, "kind" | "tags" | "pubkey">): Result<{
    d: string;
    title?: string;
    look: Look;
}>;
