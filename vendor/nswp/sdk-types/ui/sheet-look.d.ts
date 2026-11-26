/**
 * The menu's look in numbers: its sheet, its rows and its bar, read by both of the menu's drawings. The flat menu's
 * styles are written from these (ui/hud.ts), and the headset draws the same menu on a canvas from them
 * (menu-drawing.ts). A measure changed here is changed in both, so the two can't drift apart as the headset's console
 * once did from the flat menu (docs/plans/headset-menu.md, "How the two are kept the same").
 *
 * Lengths are CSS pixels at the visitor's own text size of 1. Sizes of words are in the menu's ems (`text.size`).
 * Alphas are of the theme's colours: accent, ink, glass, warn. `trials/headset-menu-same.mjs` holds the two drawings
 * to each other, tab by tab, within 2 px.
 */
export declare const SHEET_LOOK: {
    /** The menu's words: 13 px, 1.35 lines apart. An icon is 1.55 times the words, drawn with lines 1.6 wide (of 24). */
    readonly text: {
        readonly size: 13;
        readonly line: 1.35;
        readonly icon: 1.55;
        readonly iconLine: 1.6;
        readonly family: 'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
        readonly mono: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace';
    };
    /** Glass: its fill and its edge. */
    readonly glass: {
        readonly fill: 0.7;
        readonly edge: 0.34;
    };
    /**
     * The sheet. At a desk (`desk`, at least that wide and high) it is `wide` across, in two columns; else `narrow`,
     * in one. It is at most `tall` high, or that share of the screen. Its top edge is lit by a line, glowing.
     */
    readonly sheet: {
        readonly wide: 780;
        readonly narrow: 480;
        readonly desk: {
            readonly width: 900;
            readonly height: 560;
        };
        readonly side: 20;
        readonly deskSide: 40;
        readonly tall: {
            readonly desk: 780;
            readonly deskShare: 74;
            readonly narrow: 640;
            readonly narrowShare: 70;
        };
        readonly corners: readonly [22, 22, 12, 12];
        readonly top: {
            readonly line: 2;
            readonly glow: 16;
        };
    };
    /** The strip of tabs: its room, and each tab. A tab brought into sight is kept `clear` of the arrows at the ends. */
    readonly tabs: {
        readonly pad: readonly [12, 12, 0];
        readonly gap: 4;
        readonly clear: 46;
        readonly more: {
            readonly width: 40;
            readonly inset: 9;
            readonly fade: 45;
        };
        readonly tab: {
            readonly pad: readonly [9, 13, 8];
            readonly gap: 7;
            readonly corners: 14;
            readonly under: 2;
            readonly ink: 0.72;
            readonly on: 0.1;
        };
    };
    /** The list of rows under the strip: its gap, its room, and the line over it. */
    readonly rows: {
        readonly gap: 6;
        readonly pad: 12;
        readonly line: 0.22;
    };
    /** A row to press. */
    readonly row: {
        readonly height: 46;
        readonly pad: readonly [8, 12];
        readonly corners: 10;
        readonly gap: 12;
        readonly edge: 0.12;
        readonly fill: 0.03;
        readonly hoverFill: 0.13;
        readonly hoverEdge: 0.7;
        readonly onEdge: 0.8;
        readonly primaryFill: 0.16;
        readonly primaryEdge: 0.75;
        readonly state: 0.86;
        readonly stateInk: 0.6;
    };
    /** A line to read. */
    readonly line: {
        readonly pad: readonly [4, 12];
        readonly gap: 12;
        readonly dim: 0.55;
        readonly iconDim: 0.55;
        readonly iconAt: 1;
    };
    /** A row typed into: a box and its button, and a line under them. */
    readonly field: {
        readonly pad: readonly [8, 12];
        readonly gap: readonly [6, 8];
        readonly box: 40;
        readonly boxPad: readonly [6, 10];
        readonly boxCorners: 8;
        readonly boxEdge: 0.25;
        readonly boxGlass: 0.6;
        readonly buttonPad: readonly [6, 14];
        readonly to: 0.86;
        readonly toInk: 0.6;
    };
    /** A song's bar: its words, the bar, and where it is. */
    readonly slide: {
        readonly pad: readonly [8, 12];
        readonly gap: readonly [4, 12];
        readonly bar: 28;
        readonly time: 0.86;
        readonly timeInk: 0.7;
        readonly onEdge: 0.5;
    };
    /** A row that takes a file, and the line under it. */
    readonly takes: {
        readonly gap: 4;
        readonly to: 0.86;
        readonly toInk: 0.6;
    };
    /** Choices of colour: small doorways in a row. */
    readonly swatches: {
        readonly gap: readonly [6, 4];
        readonly pad: readonly [4, 2, 8];
    };
    readonly swatch: {
        readonly width: 66;
        readonly gap: 6;
        readonly text: 0.86;
        readonly ink: 0.8;
        readonly arch: readonly [38, 44];
        readonly corners: readonly [19, 5];
        readonly sill: readonly [46, 2];
        readonly sillAt: -3;
        readonly sillInk: 0.25;
    };
    /** Things with pictures, side by side: each at least `min` wide at a desk, `narrowMin` on a phone. */
    readonly tiles: {
        readonly min: 112;
        readonly narrowMin: 104;
        readonly gap: 8;
        readonly pad: readonly [2, 0, 4];
    };
    readonly tile: {
        readonly pad: readonly [8, 6, 9];
        readonly gap: 4;
        readonly corners: readonly [14, 8];
        readonly text: 0.9;
        readonly line: 1.2;
        readonly ink: 0.85;
        readonly glow: 0.13;
        readonly letter: 1.9;
        readonly mark: {
            readonly size: 24;
            readonly inset: 6;
            readonly corners: 8;
            readonly icon: 15;
            readonly glass: 0.85;
            readonly edge: 0.55;
        };
    };
    /** A card at the head of a tab: who, or what, it is about. */
    readonly card: {
        readonly pad: 12;
        readonly corners: readonly [16, 8];
        readonly face: 56;
        readonly gap: readonly [3, 12];
        readonly edge: 0.45;
        readonly fill: 0.07;
        readonly title: 1.15;
        readonly tag: 0.76;
        readonly keyline: 0.9;
        readonly quote: 7;
        readonly thing: 200;
    };
    /** A world's own part of a tab, under its name. */
    readonly from: {
        readonly top: 6;
        readonly padX: 12;
        readonly text: 0.82;
        readonly ink: 0.55;
    };
    /** A tab's note. */
    readonly note: {
        readonly pad: readonly [4, 12, 0, 12];
        readonly inset: 12;
        readonly text: 0.95;
        readonly edge: 0.6;
        readonly ink: 0.78;
    };
    /** The strip a said line has in the sheet, above its foot: one line high and `pad` more, then `after`. */
    readonly says: {
        readonly pad: 18;
        readonly after: 8;
    };
    /** The foot: keep this tab on the bar, and Close. */
    readonly foot: {
        readonly pad: readonly [0, 12, 12];
        readonly gap: 10;
        readonly pin: {
            readonly pad: readonly [7, 12];
            readonly corners: 10;
            readonly text: 0.93;
            readonly icon: 16;
            readonly gap: 7;
            readonly edge: 0.22;
            readonly ink: 0.82;
        };
        readonly close: {
            readonly height: 38;
            readonly padX: 14;
            readonly corners: 10;
            readonly edge: 0.22;
        };
    };
    /** The bar of things at hand: its keys, each a small doorway on a sill. */
    readonly bar: {
        readonly corners: readonly [20, 10];
        readonly pad: readonly [12, 14, 8];
        readonly gap: 10;
        readonly more: 30;
        readonly theirs: 0.2;
    };
    readonly key: {
        readonly width: 62;
        readonly gap: 7;
        readonly arch: readonly [52, 54];
        readonly corners: readonly [26, 7];
        readonly sill: readonly [60, 2];
        readonly sillAt: -4;
        readonly name: 0.84;
        readonly line: 1.2;
        readonly ink: 0.82;
        readonly fill: 0.08;
        readonly edge: 0.42;
        readonly sillInk: 0.28;
        readonly hoverFill: 0.2;
        readonly onFill: 0.26;
    };
};
/** An alpha as the styles write it: ".7", not "0.7". */
export declare const alpha: (a: number) => string;
/** Lengths as the styles write them, nought as "0": `[4, 12, 0]` is "4px 12px 0". */
export declare const lengths: (p: readonly number[]) => string;
