import type { Bag } from "./bag.js";
import { type Items } from "./items.js";
import type { Keyboard } from "./keyboard.js";
import type { Controls } from "./ui/model.js";
export interface BaggingOptions {
    bag: Bag;
    items: Items;
    /** The visitor's key here, or null: a guest carries nothing, and has no tab. */
    me(): string | null;
    /** What this place does with items: "none", "allowed" or "play". */
    rule(): string;
    /** What they hold now, by its coordinate, or "". */
    holding(): string;
    /** Take one in hand, or put it away with "". */
    hold(item: string): Promise<{
        ok: boolean;
        said: string;
    }>;
    /** Where this place hasn't yet been let change the bag: have the visitor asked, from a press. */
    ask?: (then: () => void) => string;
    /** Whether a change can be signed now. */
    allowed?: () => boolean;
    keyboard?: () => Keyboard | null;
    presenting?: () => boolean;
    /** Read what the visitor copied. For tests; left out, the browser's own. */
    copied?: () => Promise<string>;
}
export interface Bagging {
    refresh(): void;
}
/** An item in what someone typed or pasted: its coordinate, or its `naddr`. "" for anything else. */
export declare function itemIn(text: unknown): string;
export declare function addBagControls(controls: Controls, opts: BaggingOptions): Bagging;
