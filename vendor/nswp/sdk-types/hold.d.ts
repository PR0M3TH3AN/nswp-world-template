/**
 * Whether a thing may be taken in hand, and whether the visitor has let its own code run: the rules and the words,
 * the same whatever draws the world or the Bag.
 *
 * It is a file of its own, with no renderer in it, so that a client's page can run the kit's Bag (`nswp-sdk/bag`)
 * without loading one. Moved out of play.ts word for word; play.ts still hands these on.
 */
import { type Item } from "@nswp/core";
/** Whether this visitor has let an item's script run: by its hash, so a changed script is asked about again. */
export declare function scriptAllowed(sha256: string): boolean;
export declare function allowScript(sha256: string): void;
/**
 * Whether a thing may be taken in hand here, and the words for it where it may not: the same rules and the same
 * words whatever draws the world. `asked` remembers the script the visitor was last told about, so that a second
 * press on the same item is their yes to it.
 */
export declare function mayHold(described: Item | null, o: {
    rule: string;
    scripts: boolean;
    asked: {
        sha: string;
    };
}): {
    ok: true;
} | {
    ok: false;
    said: string;
};
