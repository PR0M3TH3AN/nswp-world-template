import type { Controls, UiCard, UiItemView, UiSectionView, UiView } from "./ui/model.js";
/** How wide words are, in CSS pixels, in a CSS font (`"500 13px …"`). A browser's canvas measures; a test counts. */
export type Measure = (text: string, font: string) => number;
/** A thing on the menu, where it is, in the flat menu's CSS pixels from the sheet's (or the bar's) own top left. */
export interface MenuBox {
    /** What pressing it does: "tab:<id>", "act:<item id>", "pin", "close", "tabs-left", "tabs-right"; or what it is. */
    id: string;
    /** What it is: "tab", "row", "line", "field", "slider", "file", "swatch", "tile", "card", "from", "note", "said", "pin", "close", "key", "more". */
    kind: string;
    x: number;
    y: number;
    w: number;
    h: number;
    /** Its words, as drawn: wrapped into lines where it wraps. */
    lines?: string[];
    item?: UiItemView;
    card?: UiCard;
}
/** The sheet, laid out for one tab. */
export interface SheetLayout {
    width: number;
    /** One size on every tab: what the tallest of them needs, as the flat menu's is (`sizeSheet`, ui/hud.ts). */
    height: number;
    section: UiSectionView | null;
    tabs: MenuBox[];
    /** How far the strip of tabs is slid along, and whether there is more to either side. */
    tabsScroll: number;
    more: {
        left: boolean;
        right: boolean;
    };
    /** Where the list of rows is, and how tall what is in it is (it scrolls inside its room where that is taller). */
    rowsAt: {
        y: number;
        h: number;
    } | null;
    rowsContent: number;
    /** The rows, cards, tiles and the rest, where they are with the list scrolled to its top. */
    rows: MenuBox[];
    note: MenuBox | null;
    said: MenuBox | null;
    /** The strip a said line has, above the foot. */
    says: MenuBox;
    pin: MenuBox | null;
    close: MenuBox;
}
/** Words wrapped into lines no wider than `width`, at spaces, as a browser does where nothing says otherwise. */
export declare function wrapWords(measure: Measure, text: string, f: string, width: number): string[];
/**
 * How each kind of row is laid out: across the whole width, or in a column (`half`), or one of a run laid side by
 * side. A kind added to ui/model.ts fails the type check here until it is drawn (and in ui/hud.ts, `kindLaid`).
 */
export declare function kindLaid(item: UiItemView): "half" | "full" | "run";
export interface LayOptions {
    measure: Measure;
    /** The sheet's width: `SHEET_LOOK.sheet.wide` (two columns, a desk's) or `.narrow` (one column, a phone's). */
    width?: number;
    /** The most the sheet may be tall, in CSS pixels. */
    most?: number;
    /** The world's name, for the line under a row that sends something to it. */
    title?: string;
    /** How far the strip of tabs was slid along before (from its start, 0, where left out). */
    tabsScroll?: number;
    /**
     * Bring the open tab into sight, as the flat menu does when a tab is chosen or the menu comes up: from where the
     * strip was, slid only as far as it takes, clear of the arrows. Left out, so; false keeps it where it was.
     */
    bring?: boolean;
    /**
     * Whether the bar is shown, and with it the foot's "Keep this tab on your bar": as at a desk, only where the
     * world's presence is "full" (a quiet world, a game, keeps the bar away). Left out, so.
     */
    bar?: boolean;
}
/** The sheet laid out for the tab `section` (its id), with every tab measured for the sheet's one size. */
export declare function laySheet(view: UiView, sectionId: string, o: LayOptions): SheetLayout;
/** The bar laid out: the place's own keys, then the tabs kept on it, as at a desk. */
export declare function layBar(view: UiView, o: {
    measure: Measure;
}): {
    width: number;
    height: number;
    keys: MenuBox[];
    theirs: number | null;
};
/**
 * Where a pressable thing is on the sheet just now, by its id: with the strip of tabs and the list as they are slid.
 * Null where it isn't on the sheet, or is slid out of sight.
 */
export declare function boxAt(L: SheetLayout, id: string, rowsScroll: number): MenuBox | null;
/** How the menu is drawn: its scale, its glass, what is pointed at, and what has come forward off it. */
export interface DrawOptions {
    /** Canvas pixels to each of the flat menu's CSS pixels. */
    scale: number;
    /** The glass's fill: darker than a desk's, since nothing is blurred behind it in a headset. */
    glass?: number;
    /** What is pointed at: lit, as the flat menu lights what is under the mouse. */
    hot?: string | null;
    /** What has come forward off the sheet: its place is left an empty slot, so its words aren't seen twice. */
    hollow?: string | null;
    /** How far the list of rows is scrolled. */
    rowsScroll?: number;
    /** Pictures for tiles and a thing's card, by item id or "card". */
    picture?: (id: string) => CanvasImageSource | null;
}
type G = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
/** Paint a laid-out sheet onto `g`, at `o.scale`. The canvas is the layout's size times the scale. */
export declare function drawSheet(g: G, view: UiView, L: SheetLayout, o: DrawOptions): void;
/** Paint a laid-out bar onto `g`, at `o.scale`. */
export declare function drawBar(g: G, view: UiView, L: ReturnType<typeof layBar>, o: DrawOptions & {
    open?: string | null;
}): void;
export interface MenuDrawingOptions {
    /** The sheet's width: two columns (`SHEET_LOOK.sheet.wide`) or one (`.narrow`, on the wrist). */
    width?: number;
    /** Canvas pixels to each of the flat menu's CSS pixels. */
    scale?: number;
    /** The glass's fill. */
    glass?: number;
    /** The most the sheet may be tall. */
    most?: number;
    /** Whether it can be seen just now: nothing is drawn that nobody sees. */
    shown?: () => boolean;
    /** Told each time a picture has been drawn anew. */
    painted?: (what: "sheet" | "bar") => void;
}
/** The menu's two pictures, the sheet and the bar, kept drawn as the controls change. */
export interface MenuDrawing {
    readonly sheet: HTMLCanvasElement;
    readonly bar: HTMLCanvasElement;
    /** The tab that is up. */
    section: string;
    /** What is pointed at, by a box's id, or null. */
    aimed: string | null;
    /** What has come forward off the sheet, left an empty slot where it was. */
    hollow: string | null;
    /** The same for the bar: what is pointed at on it, and what has come forward off it. */
    barAimed: string | null;
    barHollow: string | null;
    /** How far the list of rows, and the strip of tabs, are slid along. The strip is slid to the open tab as it opens. */
    rowsScroll: number;
    tabsScroll: number;
    /** The layouts last drawn: where every pressable thing is, in the flat menu's CSS pixels. */
    readonly sheetLayout: SheetLayout | null;
    readonly barLayout: ReturnType<typeof layBar> | null;
    /** Draw both, where what they show has changed. True where either was drawn anew. */
    paint(): boolean;
    /** Whatever they show, the next `paint` draws them anew. */
    again(): void;
    /** What is at a point of the sheet (in CSS pixels from its top left): a pressable box's id, or null. */
    sheetAt(x: number, y: number): string | null;
    barAt(x: number, y: number): string | null;
}
/**
 * The menu on two canvases, from `controls.view()`: the sheet and the bar, drawn as the flat menu is. Where each
 * thing is comes with them (`sheetLayout`, `sheetAt`), for a ray to find. Pressing is the caller's.
 */
export declare function createMenuDrawing(controls: Controls, opts?: MenuDrawingOptions): MenuDrawing;
/** Which side of the panel is up: what the room writes, the visitor's own posts, or a private conversation. */
export type ChatSide = "room" | "feed" | "letters";
/** The flat menu's panel at the side (ui/hud.ts, `.chat`): its measures, from its styles. */
export declare const CHAT_LOOK: {
    readonly width: 340;
    readonly header: {
        readonly pad: readonly [9, 8, 8, 14];
        readonly tab: 30;
        readonly gap: 8;
    };
    readonly list: {
        readonly pad: readonly [10, 14];
        readonly gap: 7;
    };
    readonly form: {
        readonly pad: 8;
        readonly gap: 6;
        readonly box: number;
    };
    readonly corners: readonly [14, 6, 6, 14];
    readonly edge: 2;
};
export interface ChatLayout {
    width: number;
    height: number;
    side: ChatSide;
    /** The sides there are, as tabs, where more than one is there; else the one side's name. */
    tabs: MenuBox[];
    title: string;
    close: MenuBox;
    /** The box to write in and its button, pressed together: the kit's keyboard asks for the words. */
    write: MenuBox;
    send: MenuBox;
    /** Words over the list (the feed's and a conversation's own), and what was last said about sending. */
    lead: string[];
    said: string[];
    /** The lines that fit, newest at the foot (the feed's newest at the top, under where to write). */
    lines: {
        y: number;
        who: string;
        text: string[];
        small: string;
        mine: boolean;
        note: boolean;
        color: string;
        faint: boolean;
    }[];
    /** Nothing written yet: what it says instead. */
    empty: string[];
}
/** Which sides are there now, in the flat panel's order. */
export declare function chatSides(view: UiView): ChatSide[];
/** The panel laid out for one side, `height` tall, as the flat one is at the side of a screen. */
export declare function layChat(view: UiView, side: ChatSide, o: {
    measure: Measure;
    height: number;
}): ChatLayout;
/** Paint a laid-out panel onto `g`, at `o.scale`. */
export declare function drawChat(g: G, view: UiView, L: ChatLayout, o: {
    scale: number;
    glass?: number;
    hot?: string | null;
}): void;
/** Where a song's bar runs along its row, in the same pixels: where a press along it lands. */
export declare function sliderTrack(b: MenuBox, words: string, measure: Measure, scale: number): {
    left: number;
    wide: number;
};
/** What is at a point of the panel: a tab, the press that puts it away, or where to write. */
export declare function chatAt(L: ChatLayout, x: number, y: number): string | null;
export {};
