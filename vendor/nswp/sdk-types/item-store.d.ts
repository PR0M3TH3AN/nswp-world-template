/**
 * Fetching an item, with nothing drawn (protocol/17-items.md): its description, and each file it names, as bytes
 * that have been checked. This is the part every engine shares. What draws a world takes a model's bytes from
 * here and makes of them what it draws with: Three.js in `items.ts`, Godot in its addon.
 *
 * An item is something a stranger made. So nothing of it is handed on until it has been checked:
 *
 * - its description is taken only with a real signature by the maker its coordinate names;
 * - each file is taken only if its bytes have the hash the description gives, and are no larger than allowed;
 * - a model is read and counted first (`readGlb` in the core): one with too much in it, or one that names
 *   anything outside itself, is not handed on at all.
 *
 * Fetching a file tells the place that keeps it the visitor's address, as fetching a picture does. A visitor
 * who would rather not has one switch for all items (`showsItems`).
 */
import { queryRelays, type GlbCount, type Item } from "@nswp/core";
/** The most an item's files may be: its models (the core's `MODEL_BUDGET`, the same for every engine), and a sound. */
export declare const ITEM_BUDGET: {
    readonly bytes: 2000000;
    readonly triangles: 20000;
    readonly meshes: 40;
    readonly materials: 16;
    readonly texture: 1024;
    /** The most one of an item's sounds may weigh, in bytes. */
    readonly sound: 150000;
};
/**
 * Whether this visitor has items drawn, and run, at all. Theirs to set; on unless they turned it off, here or
 * where they came from: it goes with them from world to world, as their other settings do
 * (protocol/11-the-visitors-console.md, "Settings that travel").
 */
export declare function showsItems(): boolean;
/** Turn every item off, or on again, for this visitor: nothing of anyone's is fetched, drawn or run while it is off. */
export declare function setShowsItems(on: boolean): void;
/** For tests: forget what was read, so the next look reads it afresh. */
export declare function forgetItemsSwitch(): void;
export declare function onItemsChange(fn: () => void): () => void;
export interface ItemStoreOptions {
    relays?: string[];
    query?: typeof queryRelays;
    /** Fetch a file's bytes. For tests; left out, the browser's own. */
    fetchBytes?: (url: string) => Promise<Uint8Array | null>;
    now?: () => number;
}
/** A model file and its box: an item's own, or one of the things it sends out. */
export interface ModelNamed {
    model: {
        url: string;
        sha256: string;
    };
    size: [number, number, number];
}
export interface ItemStore {
    /** An item's description, by its coordinate: from relays, really signed by the maker it names. Null if there is none. */
    describe(coordinate: string): Promise<Item | null>;
    /** What is known of one already, with nothing asked. */
    known(coordinate: string): Item | null;
    /**
     * A model's bytes, once: fetched, checked against its hash, read and counted. Null where any of that fails, or
     * the visitor has items turned off: whatever draws the world then draws a plain marker of the thing's size.
     */
    modelBytes(named: ModelNamed): Promise<{
        bytes: Uint8Array;
        count: GlbCount;
    } | null>;
    /** One of an item's own sounds, as its bytes: fetched and checked against its hash. Null if there is none, or it failed. */
    sound(item: Item, name: string): Promise<Uint8Array | null>;
    /** An item's script, as its text: fetched and checked against its hash. Null if it has none, or it failed. */
    script(item: Item): Promise<string | null>;
}
/** Count what a loaded model holds, and say whether it is within what may be drawn. */
export declare function createItemStore(opts?: ItemStoreOptions): ItemStore;
