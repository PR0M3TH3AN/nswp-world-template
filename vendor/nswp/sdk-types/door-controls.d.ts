/**
 * A door's details in the menu, as an item's are: choose a door from the
 * list, and its card says what it is, the lines under it say what its world
 * offers, and one button takes it. The owner, 2026-11-21: "in the menus
 * doors need a details section like the items with this same info and a
 * travel here button." (NSWP `docs/backlog/doors-03-details-and-travel.md`.)
 *
 * The same in every world's Travel tab and wherever a client lists doors, so
 * a door reads the same in a list as it does standing in front of it: the
 * same list of what it offers, in the same words, as the tiles beside it.
 *
 * **"Travel here" is taking the door.** This never sends anyone anywhere
 * itself: it calls the page's own `travel`, which is whatever pointing at
 * that door and pressing it does, through the visitor's Airlock and every
 * check a door goes through.
 */
import type { Offer } from "@nswp/core";
import type { Controls, UiAction } from "./ui/model.js";
/** One door, as a list shows it. */
export interface MenuDoor {
    /** Unique among the doors listed: a coordinate, a name, an index. */
    id: string;
    /** What its sign says. */
    title: string;
    /** Where it leads, shown in full. */
    url: string;
    /**
     * Whether the place's own site vouches for the key that announced it, as the page last checked: `verified`,
     * `listed` (on a list, not vouched for), or `unknown` (nobody looked: a door in a world doesn't ask). Only a page
     * that checked may say either of the first two.
     */
    vouched: "verified" | "listed" | "unknown";
    /** Whose list it is on, for a door `listed`. */
    listedBy?: string | null;
    /** What it offers (the core's `worldOffers`), or null where its maker has said nothing for themselves. */
    offers: readonly Offer[] | null;
}
export interface DoorControlsOptions {
    /** Which section of the menu the doors are listed in: the kit's Travel by default. A section of the page's own is added first, or named with `label`. */
    section?: string;
    /** The section's name, for a section of the page's own that hasn't been added yet. */
    label?: string;
    doors(): readonly MenuDoor[];
    /** Take this door: the page's own way, through the visitor's Airlock. */
    travel(door: MenuDoor): void;
    /** What else this page offers for a chosen door (saving it, say), as the menu's own actions. Shown after "Travel here". */
    also?(door: MenuDoor): UiAction[];
}
export interface DoorControls {
    /** Draw the list again: the doors changed, or what is known of one did. */
    refresh(): void;
    /** Show one door's details, or the list again with null. */
    choose(id: string | null): void;
    /** The door whose details are shown, or null. */
    chosen(): MenuDoor | null;
}
/** What is known of whether a door's site vouches for it, in the Airlock's own words: one fact, one sentence, everywhere. */
export declare function vouchedWords(door: Pick<MenuDoor, "vouched" | "listedBy">): string;
export declare function addDoorControls(controls: Controls, opts: DoorControlsOptions): DoorControls;
