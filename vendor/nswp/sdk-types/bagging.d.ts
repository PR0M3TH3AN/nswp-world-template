import type { Bag } from "./bag.js";
import { type ItemPreviews } from "./item-preview.js";
import { type ItemStore } from "./item-store.js";
import type { Items } from "./items.js";
import type { Keyboard } from "./keyboard.js";
import type { Controls } from "./ui/model.js";
export interface BaggingOptions {
    bag: Bag;
    /**
     * What looks items up. Their descriptions are all that is needed; where it can also give a model (items.ts),
     * each thing is shown as itself, drawn from that model. Without, each is shown by its first letter.
     */
    items: Pick<ItemStore, "known" | "describe"> & Partial<Pick<Items, "model" | "elsewhere">>;
    /** What draws each thing's picture. Left out, one is made from `items.model`, where there is one. `null` for none. */
    previews?: ItemPreviews | null;
    /** Whether things may move for this visitor: off, the chosen thing is shown still. Left out, as the menu's own setting says. */
    motion?: () => boolean;
    /** What this place is called, for saying where a thing can't be held. */
    place?: () => string;
    /** The visitor's key here, or null: a guest carries nothing, and has no tab. */
    me(): string | null;
    /** What this place does with items: "none", "allowed" or "play". */
    rule(): string;
    /** What they hold now, by its coordinate, or "". */
    holding(): string;
    /** Take one in hand, in the colours they chose for it, or put it away with "". */
    hold(item: string, tints?: Record<string, string>): Promise<{
        ok: boolean;
        said: string;
    }>;
    /** They chose a colour for one of their things: where it is the one in their hand, it is recoloured now. */
    tinted?: (item: string, tints: Record<string, string>) => void;
    /** Where this place hasn't yet been let change the bag: have the visitor asked, from a press. */
    ask?: (then: () => void) => string;
    /** Whether a change can be signed now. */
    allowed?: () => boolean;
    keyboard?: () => Keyboard | null;
    presenting?: () => boolean;
    /**
     * A few items offered here, by coordinate, for someone to put in their bag with one press: a client's starter
     * items. Shown only where the bag can be changed, and only the ones not already in it. Twelve at most.
     */
    offered?: () => string[];
    /** Read what the visitor copied. For tests; left out, the browser's own. */
    copied?: () => Promise<string>;
}
/** Where a site keeps what its visitor last held there. */
export declare const HELD_KEY = "nswp:holding";
export interface Bagging {
    refresh(): void;
}
/** An item in what someone typed or pasted: its coordinate, or its `naddr`. "" for anything else. */
export declare function itemIn(text: unknown): string;
export declare function addBagControls(controls: Controls, opts: BaggingOptions): Bagging;
