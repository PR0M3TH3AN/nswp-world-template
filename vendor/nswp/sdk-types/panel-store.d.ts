/**
 * What a panel is, as data: what it shows and where it hangs. No three.js
 * here, so the rules about what may be kept are tested like arithmetic.
 *
 * A panel shows one of a few things the kit knows how to draw: a note, a
 * picture, a video. It is never a web page. A page can't be drawn into a 3D
 * scene by another page, and this kit doesn't pretend otherwise
 * (browser/spec.md).
 */
export type V3 = [number, number, number];
/** Where a panel hangs, in the world's own metres, and how large it is. */
export interface PanelPlace {
    position: V3;
    /** Which way it faces, in degrees round the vertical: 0 faces +Z. */
    yaw: number;
    /** How far it leans back or forward, in degrees. */
    pitch: number;
    /** Its width in metres. Its height follows from what it shows. */
    width: number;
}
/**
 * What a panel shows, in the form that can be kept. `src` is an address the
 * page is allowed to load, or `kept:<name>` for a file the visitor chose from
 * their own device, which the kit holds in this browser.
 */
export type PanelSource = {
    kind: "note";
    title: string;
    text: string;
} | {
    kind: "picture";
    title: string;
    src: string;
} | {
    kind: "video";
    title: string;
    src: string;
};
/**
 * How see-through a panel is. `opacity` is the whole of it, from 0.15 to 1.
 * `dark` is how much of its dark parts is left, from 0 (gone) to 1 (as solid
 * as the rest): a terminal with `dark` low is bright letters hanging in the
 * air, with the world showing between them.
 */
export interface PanelLook {
    opacity: number;
    dark: number;
}
/** The looks a visitor goes round with one button, in order. Any other look can be set by a page. */
export declare const PANEL_LOOKS: readonly (PanelLook & {
    name: string;
})[];
export declare function cleanLook(input: unknown): PanelLook;
/** The look after this one, going round `PANEL_LOOKS`. A look that isn't one of them goes to the first. */
export declare function nextLook(now: PanelLook): PanelLook & {
    name: string;
};
export interface PanelRecord {
    id: string;
    source: PanelSource;
    place: PanelPlace;
    /** Left out, it is solid. */
    look?: PanelLook;
    /** Where it sits in the visitor's view when it is pinned there: metres right, up and towards them. Left out, it hangs where it was put. */
    pin?: V3;
}
export declare const PANEL_LIMITS: {
    readonly count: 24;
    readonly titleChars: 80;
    readonly noteChars: 4000;
    readonly srcChars: 2048;
    readonly minWidth: 0.3;
    readonly maxWidth: 3;
    /** A panel is never kept further from the middle of a world than this, in metres. */
    readonly reach: 500;
    /** The largest file of the visitor's own that is kept, in bytes. */
    readonly fileBytes: number;
};
export declare function cleanPlace(input: unknown): PanelPlace | null;
export declare function cleanSource(input: unknown): PanelSource | null;
/** Read what was kept, dropping anything that isn't what it claims to be. This comes back from storage. */
export declare function cleanRecords(input: unknown): PanelRecord[];
/** Where a pinned panel sits in the view, kept within reach: never behind the visitor's head and never out of sight. */
export declare function cleanPin(input: unknown): V3 | null;
/** Where a visitor's view is, for something that follows it: a place and a heading, in degrees round the vertical. */
export interface Follow {
    position: V3;
    yaw: number;
    /** Still catching up with a turn, or a move. */
    turning: boolean;
    moving: boolean;
}
/**
 * Follow a head the way something pinned in a headset should: not glued to
 * the eyes, which is tiring and makes people ill, but staying put while they
 * look about, and coming round when they have turned or moved well away.
 * A small turn or a lean towards it changes nothing, so it can be read.
 */
export declare function tagAlong(now: Follow, head: {
    position: V3;
    yaw: number;
}, dt: number, o?: {
    turn?: number;
    reach?: number;
}): Follow;
/** The way a panel at `at` should turn to face a head at `head`: its yaw and pitch, in degrees. */
export declare function facing(at: V3, head: V3): {
    yaw: number;
    pitch: number;
};
/**
 * Where a new panel goes: a comfortable reach in front of the head, at eye
 * height. Each one after the first hangs further round the visitor, to one
 * side and then the other, so none opens on top of another.
 */
export declare function inFront(head: V3, yawDegrees: number, already?: number, distance?: number): V3;
/** A short random name for a panel or a kept file. */
export declare function newId(random?: () => number): string;
/** Break a note into lines no wider than `width` units, where `measure` says how wide some text is. */
export declare function wrapText(text: string, width: number, measure: (s: string) => number, maxLines?: number): string[];
/** One file of the visitor's own, kept in this browser: a picture or a video they hung or took. */
export interface LibraryItem {
    id: string;
    kind: "picture" | "video";
    title: string;
    bytes: number;
    /** Seconds since 1970. */
    addedAt: number;
    /** A small picture of it, as a data address, or "" when none could be made. */
    thumb: string;
}
export declare const LIBRARY_LIMITS: {
    readonly count: 60;
    readonly thumbChars: 60000;
};
/** Read the list of kept files back from storage, dropping anything that isn't what it claims to be. Newest first. */
export declare function cleanLibrary(input: unknown): LibraryItem[];
/** Which items are on a page of the board, and how many pages there are. */
export declare function libraryPage<T>(items: T[], page: number, perPage: number): {
    items: T[];
    page: number;
    pages: number;
};
