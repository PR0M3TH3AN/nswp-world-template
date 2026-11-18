/**
 * What an owner brings from their home to a world they are building
 * (browser/bridge.md, "A world of your own"): leave to open terminals on
 * their computer from inside the world.
 *
 * It arrives in the address, after `#`, and is taken off at once. It is kept
 * for the tab, so a refresh doesn't lose it, and nowhere else. This file is
 * the small part: is there anything, and is it good. The terminals
 * themselves are in `nswp-sdk/terminal`, fetched only when there is.
 *
 * A world gets this only from its owner's own home, only if they named this
 * world there, and their computer honours it only if it was started naming
 * this world too. Nothing a visitor to the world does can bring it about.
 */
import { type Brought } from "@nswp/core";
export type { Brought } from "@nswp/core";
/** Whether there is anything to take: in the address, or kept for this tab. Cheap, and reads nothing. */
export declare function somethingBrought(): boolean;
/**
 * Take what was brought. From the address if it is there, which is then
 * cleaned; otherwise what this tab kept. Null when there is nothing, or it
 * isn't for this world, or it has run out. `fresh` says it came in the
 * address just now, on an arrival and not a refresh.
 */
export declare function takeBrought(now?: number): (Brought & {
    fresh: boolean;
}) | null;
/**
 * A world that is already open may be handed something in its address: its
 * owner going there again from their home, in the same tab. Then nothing
 * loads, and the page has to notice. This takes it out of the address and
 * starts the page again, so it is never left sitting where it can be copied.
 * Call once.
 */
export declare function watchBrought(): void;
/** Let go of it: the owner is done here. */
export declare function dropBrought(): void;
