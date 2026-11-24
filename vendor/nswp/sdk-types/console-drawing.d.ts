/**
 * The headset console's picture: a world's controls drawn on a canvas, as one panel of light. Sections down the
 * side, their buttons beside them, a card and lines where a section has them.
 *
 * Nothing here knows what shows the picture. A Three.js world puts it on a panel in its scene (console.ts). A
 * world made with another engine is handed the pixels by the engine script, and shows them its own way
 * (engine-console.ts). Both draw with this, so the console is drawn once.
 *
 * Where each pressable thing is, is kept beside the picture (`regions`): the same rectangles say what a ray points
 * at and what a press lands on.
 */
import { type IconName } from "./ui/icons.js";
import type { Controls, UiView } from "./ui/model.js";
/** The picture's size, in its own units. */
export declare const CONSOLE_W = 1024;
export declare const CONSOLE_H = 640;
/** The least height a section's tab is given in one column; fewer, and the sections go into two columns instead. */
export declare const TAB_MIN = 52;
/** A button's height while there are lines under it: room is kept for the lines, never by shrinking their words. */
export declare const BUTTON_WITH_LINES = 72;
/**
 * Where the sections go down the left: one column while each tab can have `TAB_MIN`, else two, filled down the first
 * and then the second, so every section is one select away and no icon touches its neighbour. `left` is where the
 * open section's buttons begin.
 */
export declare function tabLayout(count: number): {
    cols: 1 | 2;
    rows: number;
    tabH: number;
    colW: number;
    left: number;
};
/**
 * The lines of a section, a page at a time: as many whole lines as fit the room, in order, and the rest on the next
 * page. Their words are always the console's usual size: a page more, never a smaller sentence. Every page has at
 * least one line, even one taller than the room.
 */
export declare function pageLines(heights: readonly number[], room: number): number[][];
/**
 * How a thing is lit when pointed at, for whatever shows the picture drawn plain and lights the row itself (an
 * engine that isn't JavaScript's): a box over the thing's own place, filled and edged in these colours, with these
 * corners (top left, top right, bottom right, bottom left), all in the console's own units. The look is the kit's:
 * whatever draws the box chooses nothing.
 */
export interface Lit {
    fill: string;
    fillAlpha: number;
    stroke: string;
    strokeAlpha: number;
    line: number;
    corners: [number, number, number, number];
}
/** A thing on the console that can be pressed: where it is, in the console's own units, and its words. */
export interface Region {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    /** How it is lit when pointed at. Null: nothing lights it. Left out where the picture itself carries the light. */
    lit?: Lit | null;
}
export declare function strokeIcon(g: CanvasRenderingContext2D, name: IconName | null, x: number, y: number, size: number): void;
export declare const SANS = "system-ui, \"Segoe UI\", Roboto, sans-serif";
export interface ConsoleDrawingOptions {
    /** The canvas to draw on, `CONSOLE_W` by `CONSOLE_H`. */
    canvas: HTMLCanvasElement;
    /** Its 2D context, where whoever made the canvas made it a particular way. */
    context?: CanvasRenderingContext2D;
    /** Whether the console can be seen just now: a picture that arrives late is drawn in only if so. */
    shown?: () => boolean;
    /** Told each time the picture has been drawn anew, with the theme it was drawn in. */
    painted?: (theme: UiView["theme"]) => void;
    /**
     * Never draw a row lit. For whatever lights the row pointed at itself, from each region's `lit`, so that the
     * picture is drawn again only when what it shows changes and never for pointing.
     */
    plain?: boolean;
}
/** The console's picture and what is on it. What it shows is kept here; where it is shown is the caller's. */
export interface ConsoleDrawing {
    /** The section that is up. */
    section: string;
    /** What is pointed at: a region's id, or anything else the caller points at ("open"), or null. */
    aimed: string | null;
    /** The pressable things, as last drawn. */
    readonly regions: readonly Region[];
    /** Which page of the open section's lines is shown, counted from nought, and of how many. */
    readonly linePage: number;
    readonly linePages: number;
    /** Show the next page of lines, round to the first. */
    turnPage(): void;
    /** Draw it, if anything it shows has changed. True where it was drawn anew. */
    paint(): boolean;
    /** Whatever it shows, the next `paint` draws it anew. */
    again(): void;
}
export declare function createConsoleDrawing(controls: Controls, opts: ConsoleDrawingOptions): ConsoleDrawing;
