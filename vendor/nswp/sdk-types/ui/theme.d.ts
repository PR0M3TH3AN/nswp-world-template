/**
 * The look of the controls kit: a handful of values every part of it draws
 * from, on a flat screen and in a headset alike.
 *
 * Three sources, weakest first: the kit's defaults, what a world asks for
 * (its own accent, say), and what the visitor chose. The visitor wins, because
 * the controls are theirs to read. Their choice is kept in this browser, for
 * this site. The size of their text, whether things move and which wrist
 * also go with them to the next world (settings.ts); the colours don't,
 * since those belong to each place.
 */
export interface UiTheme {
    /** The light the controls are drawn in. */
    accent: string;
    /** Text. */
    ink: string;
    /** What panels are made of. Drawn part see-through. */
    glass: string;
    /** For things that end or leave. */
    warn: string;
    /** Whether things move when they open and close. */
    motion: boolean;
    /** Size of text and controls, 1 being normal. */
    scale: number;
    /** Which wrist carries the console in a headset, where a hand is tracked. */
    wrist: "left" | "right" | "off";
}
export declare const DEFAULT_THEME: UiTheme;
/** Ready-made accents a visitor can pick from. The first is the default. */
export declare const UI_PRESETS: {
    id: string;
    label: string;
    accent: string;
}[];
/** Keep only values that are what they claim to be: this is read back from storage, and from a world's own settings. */
export declare function cleanTheme(input: unknown): Partial<UiTheme>;
export declare function loadVisitorTheme(): Partial<UiTheme>;
export declare function saveVisitorTheme(theme: Partial<UiTheme>): void;
export declare function resolveTheme(world?: Partial<UiTheme>, visitor?: Partial<UiTheme>): UiTheme;
/** "#rrggbb" as "r, g, b", for building see-through colours. */
export declare function rgb(hex: string): string;
