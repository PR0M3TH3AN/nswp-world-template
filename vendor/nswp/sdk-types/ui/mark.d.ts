/**
 * The mark: a lit doorway, an arch filled with the world's accent fading downward, glowing, standing on a short
 * light line, in a rounded glass tile. The menu's button everywhere the kit draws one (the owner, 2026-11-24: "can
 * we use this menu icon everywhere? With no text?"). Its shape is here and nowhere else: the flat menu's styles,
 * the headset's button and any picture of it are made from these numbers, so none can drift from the others.
 *
 * In CSS pixels, within the tile. Not part of the package's entries.
 */
export declare const MARK: {
    /** The tile: its size, the round of its top corners and of its bottom ones, and its edge. */
    readonly tile: {
        readonly w: 44;
        readonly h: 48;
        readonly top: 22;
        readonly bottom: 8;
        readonly edge: 1;
    };
    /** The arch: its size, where it stands in the tile, the round of its top (a half circle) and of its foot. */
    readonly arch: {
        readonly w: 18;
        readonly h: 24;
        readonly x: 13;
        readonly y: 11;
        readonly top: 9;
        readonly bottom: 2;
    };
    /** The line it stands on: how far it reaches past the arch on each side, how thick, and how far below its foot. */
    readonly sill: {
        readonly over: 3;
        readonly h: 2;
        readonly below: 3;
    };
    /** How far the arch's glow reaches. */
    readonly glow: 14;
    /** The arch's fill: the accent at the top, and at the foot. */
    readonly fill: {
        readonly top: 0.95;
        readonly foot: 0.25;
    };
    /** The glow's strength, the tile's glass, and its edge when it isn't lit. */
    readonly glowAlpha: 0.55;
    readonly glass: 0.7;
    readonly edgeAlpha: 0.34;
};
/** Where the line under the arch is, within the tile: x, y, width, height. */
export declare const sillBox: () => [number, number, number, number];
/**
 * Paint the mark onto a canvas, its tile's top left at (x, y), `scale` canvas pixels to a CSS pixel. `lit` is the
 * tile as it is hovered or while the menu is up: its edge in the accent. `glass` is how much the tile's glass
 * covers (the flat menu's is 0.7 over a blur; where nothing blurs behind it, more).
 */
export declare function paintMark(c: CanvasRenderingContext2D, o: {
    x: number;
    y: number;
    scale: number;
    accent: string;
    ink: string;
    glass: string;
    lit?: boolean;
    glassAlpha?: number;
    tile?: boolean;
}): void;
/**
 * The mark as a picture: an SVG, from the same numbers the menu's button and the headset's are drawn from. For a
 * page's icon, an app's icon, or anything else that shows the mark; nobody draws their own copy.
 *
 *   markSvg()                          // the tile and the mark, in the kit's own colours
 *   markSvg({ accent: "#4fd08b" })     // in a place's own colour
 *   markSvg({ tile: false })           // the doorway on its line alone
 *
 * Colours are "#rrggbb"; anything else is the kit's own. The tile's glass here is solid where nothing blurs behind it.
 */
export declare function markSvg(o?: {
    accent?: string;
    ink?: string;
    glass?: string;
    tile?: boolean;
}): string;
