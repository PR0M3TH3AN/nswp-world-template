/**
 * A held item's presses under the thumb, on a touch screen (the owner, 2026-11-22: option B, "as recommended").
 *
 * While something that does something is in hand on a phone: a sight in the middle of the view, which is where its
 * first press sends what it sends out, and that press as a large round button by the right thumb, with the second
 * press as a smaller one beside it. The visitor can put them by the left thumb instead (`THUMBS_KEY`). A tap on the
 * view is then a walk, as it is with nothing in hand, so a walk never fires and a press to fire never walks.
 *
 * Nothing of this shows with nothing in hand, at a desk, in a headset, or while the visitor's menu is open. It is
 * drawn over the controls' messages, so a message never covers Fire, and it hides whenever their menu opens; it
 * keeps clear of the menu button and the bar, the visitor's own ways to their controls.
 */
import { type UiTheme } from "./ui/theme.js";
/** Where the visitor keeps which thumb the buttons are by: "left", or nothing for the right. */
export declare const THUMBS_KEY = "nswp:thumbs";
/** The first press's button, across, in CSS pixels: big enough to find without looking. */
export declare const THUMB_FIRST = 78;
/** The second press's button: smaller, so the two are never mistaken for each other. */
export declare const THUMB_SECOND = 54;
export type ThumbSide = "left" | "right";
export declare function thumbSide(): ThumbSide;
export declare function setThumbSide(side: ThumbSide): void;
export interface ThumbPresses {
    /** Show them for these presses ("Fire", "Reload"; "" for none), on this side, in these colours; or hide them with null. */
    show(does: {
        use: string;
        second: string;
    } | null, side: ThumbSide, theme: UiTheme): void;
    /** What is showing, for tests: the two buttons' words and boxes, and whether the sight is up. */
    info(): {
        sight: boolean;
        side: ThumbSide | "";
        buttons: {
            label: string;
            x: number;
            y: number;
            w: number;
            h: number;
        }[];
    };
    dispose(): void;
}
export declare function createThumbPresses(o: {
    use(): void;
    second(): void;
}): ThumbPresses;
