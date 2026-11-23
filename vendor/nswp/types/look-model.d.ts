import type { NostrEvent } from "./event.js";
/** The most a look's model may be, whatever draws it. A world may lower it in its manifest, never raise it. */
export declare const LOOK_BUDGET: {
    /** The most a look's file may weigh, in bytes. */
    readonly bytes: 1000000;
    readonly triangles: 12000;
    readonly meshes: 24;
    readonly materials: 8;
    /** The longest side of any picture its surfaces use, in pixels. */
    readonly texture: 1024;
    /** The most joints its skeleton may have. */
    readonly joints: 128;
    /** The most morph targets (its faces' shapes) any one of its meshes may have. */
    readonly morphs: 64;
    /**
     * VRM's own extensions, which a VRM may say it requires: read for its skeleton and expressions only, its
     * materials drawn as the kit's standard material in their base colour. Anything else it requires refuses it.
     * Spring bones (`VRMC_springBone`) are not among them: hair and cloth that swing are physics the kit would run
     * for a stranger's file, and are left out in this first round (decided by the owner, 2026-11-22).
     */
    readonly extensions: readonly ["VRMC_vrm", "VRMC_materials_mtoon", "KHR_materials_unlit"];
};
/**
 * How tall a person's own model may be drawn, in metres: half to one and a half times standard (decided by the
 * owner, 2026-11-22). A world may narrow it. Height changes only the drawing: where the eyes are, reach, walking,
 * personal space and the places to arrive stay the kit's own.
 */
export declare const LOOK_HEIGHT: {
    readonly least: 0.85;
    readonly standard: 1.7;
    readonly most: 2.55;
};
/** The most people's own models drawn at once, the nearest first: everyone beyond is drawn as their simple look. */
export declare const LOOK_MODELS_AT_ONCE = 8;
/** The most a signed look note may be, in bytes, as one member hands it to the others in a room (NSWP-06). */
export declare const LOOK_NOTE_LIMIT = 8000;
/** The formats a look's model may be. */
export declare const LOOK_FORMATS: readonly ["vrm", "glb"];
export type LookFormat = (typeof LOOK_FORMATS)[number];
/** A look's model, as its note says it: the file by its hash (the url only a hint), its format, and how tall. */
export interface LookModel {
    url: string;
    format: LookFormat;
    sha256: string;
    /** How tall it is drawn, in metres: what the note asks, held within `LOOK_HEIGHT`. */
    height: number;
    /** A picture of it, for panels and cards, checked by its hash like the file. */
    thumb?: {
        url: string;
        sha256: string;
    };
}
/**
 * How tall a person's model is drawn: what they asked, held within the kit's limits and, where the world gives
 * them (its manifest's `avatar.height`), within the world's too. A world's limits only narrow the kit's: where they
 * would leave nothing, the kit's own are used. Anything that isn't a height is the standard one.
 */
export declare function lookHeight(asked: unknown, world?: readonly [number, number]): number;
/**
 * The model a look note names, or null where it names none that may be worn: a note of another kind, no `model`
 * tag, a format other than `vrm` or `glb`, an address that isn't https, or no real hash. A note with no model is a
 * simple look, drawn as today. Who signed it is checked by whoever took it: this reads only what it says.
 */
export declare function readLookModel(note: Pick<NostrEvent, "kind" | "tags">): LookModel | null;
/** The JSON part of a GLB, as it was written, or null for anything that isn't one. Only for a file `readGlb` passed. */
export declare function glbJson(bytes: Uint8Array): Record<string, unknown> | null;
/**
 * A look's file as an engine's own reader is handed it, once `readGlb` has passed it against `LOOK_BUDGET`: the
 * same file with its `extensionsRequired` emptied. An engine's reader refuses a file that requires what it doesn't
 * know, and VRM's own extensions are ones the kit has already read for what it uses of them; the rest of each is
 * left for the engine to ignore. Anything else is unchanged, byte for byte. Null for a file that isn't a GLB.
 */
export declare function withoutRequired(bytes: Uint8Array): Uint8Array | null;
/**
 * Which way a look's model faces as its file is written: `+z` for a glTF and a VRM 1.0 (glTF's own forward),
 * `-z` for a VRM 0.x (its own extension, `VRM`, faces the other way). The kit draws everyone facing -z.
 */
export declare function lookFacing(json: Record<string, unknown>): "+z" | "-z";
