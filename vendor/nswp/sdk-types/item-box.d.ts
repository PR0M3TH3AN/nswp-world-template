/**
 * Running an item's script in its locked box (protocol/17-items.md, "An item's own logic").
 *
 * The box is a page of its own (`@nswp/core`, `ITEM_BOX_HTML`), which the world serves as `item-box.html` under
 * rules that let it reach nothing. This file is the world's side of it: it frames that page with no rights but
 * to run script, hands it the item's script, tells it of the few things an item hears about, and takes what it
 * asks for through a closed list with a ceiling on each (`cleanAsk`, `ITEM_ASKS`).
 *
 * Nothing of the visitor or the world is ever sent in: not who they are, where they are, or what is near them.
 * What comes out is only ever one of the asks, tidied, or nothing.
 */
import { cleanAsk, type ItemEvent } from "@nswp/core";
export type BoxAsk = NonNullable<ReturnType<typeof cleanAsk>>;
export interface BoxHandlers {
    /** The script asked for something on the list, within its ceiling. */
    ask(ask: BoxAsk): void;
    /** The script is over: it was stopped, it stopped answering, or the box couldn't run it. */
    stopped?(why: string): void;
}
export interface BoxRun {
    /** Tell the script of something that happened to its item. */
    tell(event: ItemEvent, arg?: number): void;
    stop(): void;
    readonly running: boolean;
}
export interface ItemBoxOptions {
    /** Where the world serves the box's page. Left out, `item-box.html` beside the world's own page. */
    url?: string;
    /** How long the box is given to start, in milliseconds. */
    startMs?: number;
}
/**
 * Run a script in a box of its own. Resolves to null if it couldn't be started here: no such page, a page served
 * under rules that stop it, or a script that fails as it begins. Then the item is a shape and nothing more.
 */
export declare function runInBox(script: string, on: BoxHandlers, opts?: ItemBoxOptions): Promise<BoxRun | null>;
