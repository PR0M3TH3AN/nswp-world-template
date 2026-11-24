/**
 * Where the console floats and how big, in metres, as the kit's own does in a Three.js world (console.ts): so wide,
 * so far in front of the visitor when it opens, so far below their eyes and never lower than `least`, and put away
 * once they have walked `away` from it.
 */
export declare const CONSOLE_PLACE: {
    readonly wide: 0.84;
    readonly reach: 1.05;
    readonly drop: 0.18;
    readonly least: 0.4;
    readonly away: 2.6;
};
/**
 * What the console is now, after doing what was asked. `input` is JSON, every part optional:
 *
 * - `open`: `true` to bring it up, `false` to put it away (the menu button on a controller does one, then the other).
 * - `press`: the `id` of the row a press landed on. Only an id from `rows`, as last given.
 * - `have`: the `stamp` of the picture the engine already holds. `rows` is left out while it is still that one.
 *
 * It answers with JSON:
 *
 * - `open`.
 * - `stamp`: goes up when the picture changed. Then, and only then, take `NSWP.consolePixels()` again.
 * - `w`, `h`: the picture's size, in its own units, which `rows` is in too.
 * - `wide`, `reach`, `drop`, `least`, `away`: where it floats, in metres, as in every world (`CONSOLE_PLACE`).
 * - `rows`: each thing that can be pressed, `{ id, x, y, w, h, lit }`. `lit` is how it is lit when pointed at
 *   (`{ fill, fillAlpha, stroke, strokeAlpha, line, corners }`, the corners clockwise from the top left), or null
 *   where nothing lights it. A place on the panel that is in no row is the pane: it lights nothing, presses
 *   nothing, and a ray at it reaches nothing behind.
 *
 * An engine that calls this draws the console, so it is here that a visitor is asked, the first time they are in
 * a headset, which way they would like to move: the question is one of the console's sections.
 */
export declare function engineConsole(input?: string): string;
/**
 * The console's picture as it now is: `w` by `h` pixels, four bytes each (red, green, blue, how solid), from the
 * top row down. Null while the console is put away. Take it only when `stamp` has changed: it is 2.6 MB.
 */
export declare function consolePixels(): Uint8ClampedArray | null;
/** For tests: forget the console that was made. */
export declare function resetConsole(): void;
