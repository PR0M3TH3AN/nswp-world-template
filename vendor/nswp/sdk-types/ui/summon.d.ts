/**
 * The summons: the one way a visitor can always bring up their controls,
 * whatever a world has done with its screen and its keys.
 *
 * A world with an interface of its own leads, and may put the traveller's
 * controls away altogether. What it can't do is take them from the visitor.
 * So one gesture on each kind of device is the visitor's, in every world,
 * and no world uses it for anything else (protocol/11-the-visitors-console.md):
 *
 * - At a desk: the key left of 1, the one a game's console has always been on.
 * - On a touch screen: two fingers held still for a moment.
 * - In a headset: the upper face button (B or Y) held for a moment.
 *
 * The same gesture puts them away again. Nothing is left on screen
 * afterwards, and whatever had the keys before has them back.
 */
/** The key, by where it is on the keyboard and not by what it types: left of 1 on every layout. */
export declare const SUMMON_KEY = "Backquote";
/** How long two fingers, or the button in a headset, are held: milliseconds. */
export declare const SUMMON_HOLD = 600;
/** How far a held finger may drift and still be held, in pixels. Further is a pinch or a drag, which are the world's. */
export declare const SUMMON_SLOP = 18;
export interface Point {
    x: number;
    y: number;
}
/**
 * Watches for two fingers held still. Tell it every time the fingers on the
 * screen change or move, with where each is; it calls `onHeld` once when
 * exactly two have stayed put for long enough.
 */
export declare function createHoldWatch(o: {
    onHeld(): void;
    hold?: number;
    slop?: number;
}): {
    touches(points: Point[]): void;
    cancel(): void;
};
/**
 * Counts how long a button has been held, a frame at a time. Returns true
 * once, on the frame it has been held long enough, and not again until it
 * has been let go.
 */
export declare function createHeldButton(hold?: number): (down: boolean, dt: number) => boolean;
