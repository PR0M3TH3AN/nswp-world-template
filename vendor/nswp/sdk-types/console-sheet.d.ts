/**
 * The headset's menu as the flat one (docs/plans/headset-menu.md, step 3): the sheet drawn by `createMenuDrawing`,
 * hung 1.0 m wide where the console opens, the bar under it leaning back to the eyes, and whatever is pointed at come
 * forward off it. Behind `?menu=sheet` for now; the console (console.ts) hosts it, with its Menu button, its wrist and
 * where it stands, and asks it what a ray points at and what a press does.
 *
 * Drawn over the room and under the visitor's own hands (`MENU_ORDER`, then `HANDS_ORDER`, input.ts), as the
 * console is.
 */
import * as THREE from "three";
import type { Controls } from "./ui/model.js";
/** The sheet's width, in metres, floating (the owner's B) and on the wrist. */
export declare const SHEET_M: {
    readonly floating: 1;
    readonly wrist: 0.36;
};
/** How far a thing pointed at comes forward, in metres, and how long it takes, in seconds. */
export declare const FORWARD: {
    readonly by: 0.035;
    readonly takes: 0.12;
    readonly clear: 0.01;
};
/**
 * The most the sheet may be tall, in the flat menu's pixels: floating, 520 (0.67 m, about 35° down at 1.05 m with
 * the bar, the design's B); on the wrist, a phone's 640 (0.48 m). A longer tab scrolls, as on a flat screen.
 */
export declare const SHEET_MOST: {
    readonly floating: 520;
    readonly wrist: 640;
};
export interface SheetMenu {
    /** Its meshes, to add to the console's group. */
    readonly root: THREE.Group;
    /** The tab that is up. */
    section: string;
    /** Draw it for this mount, where anything it shows has changed. */
    paint(mount: "wrist" | "floating"): void;
    /** What this ray points at: "sheet:<id>", "bar:<id>", "pane" (the glass, nothing on it), or null. */
    pick(raycaster: THREE.Raycaster): string | null;
    aim(hit: string | null): void;
    /** Do what pressing it does. Says "close" where it closed the menu. */
    press(hit: string): "close" | void;
    /** Each frame while open: scrolls by the sticks, brings the thing pointed at forward. */
    update(dt: number, session: XRSession | null | undefined, mount: "wrist" | "floating", presence: string): void;
    /** Whether a ray rests on it: the sticks are its, and don't walk or turn the visitor. */
    readonly holding: boolean;
    /** For tests: the tabs, and the pressable things of the open tab, by their words. */
    describe(): {
        sections: string[];
        buttons: string[];
        lines: string[];
        note: string;
        card: string;
        section: string;
    };
    /** For tests: press the thing with these words. */
    pressLabelled(label: string): boolean;
    /**
     * For tests: where the thing with these words is in the room, its middle: a tab, a row, "Close", "Keep this tab on
     * your bar", or "bar:<words>" for a key on the bar. Null where it isn't shown.
     */
    whereIs(label: string): [number, number, number] | null;
    /** For tests: how far the list is scrolled, and whether something has come forward, and how far. */
    readonly state: {
        rowsScroll: number;
        forward: string;
        lifted: number;
    };
}
export declare function createSheetMenu(controls: Controls, opts: {
    menuOrder?: number;
    motion: () => boolean;
    shown: () => boolean;
}): SheetMenu;
