/**
 * Fetching an item and getting it ready to draw (protocol/17-items.md).
 *
 *   const items = createItems();
 *   const lantern = await items.describe("37303:<maker>:brass-lantern");   // its maker's signed description
 *   const model = lantern && (await items.model(lantern));                 // something to add to a scene
 *
 * An item is something a stranger made. So nothing of it is trusted until it has been checked:
 *
 * - its description is taken only with a real signature by the maker its coordinate names;
 * - its model is taken only if its bytes have the hash the description gives, and are no larger than this allows;
 * - what comes out of the file is counted, and one with too much in it is not drawn.
 *
 * Whatever fails, there is a plain marker of the item's own size to draw instead: a visitor is never left
 * holding nothing because a file was missing.
 *
 * Fetching a model tells the place that keeps it the visitor's address, as fetching a picture does. A visitor
 * who would rather not has one switch for all items (`showsItems`).
 */
import { queryRelays, type Item } from "@nswp/core";
import * as THREE from "three";
export declare const ITEM_BUDGET: {
    /** The most a model file may weigh, in bytes. */
    readonly bytes: 2000000;
    /** The most triangles, meshes and materials a model may have. */
    readonly triangles: 20000;
    readonly meshes: 40;
    readonly materials: 16;
    /** The longest side of any picture a model's surfaces may use, in pixels. */
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
export interface ItemsOptions {
    relays?: string[];
    query?: typeof queryRelays;
    /** Fetch a file's bytes. For tests; left out, the browser's own. */
    fetchBytes?: (url: string) => Promise<Uint8Array | null>;
    now?: () => number;
}
export interface Items {
    /** An item's description, by its coordinate: from relays, really signed by the maker it names. Null if there is none. */
    describe(coordinate: string): Promise<Item | null>;
    /** What is known of one already, with nothing asked. */
    known(coordinate: string): Item | null;
    /**
     * Something to draw for an item: its own model where every check passes, and a plain marker of its size where
     * one doesn't, or where the visitor has items turned off. Each call gives a copy of its own.
     */
    model(item: Item, tints?: Record<string, string>): Promise<THREE.Object3D>;
    /** A plain marker of an item's size. */
    marker(item: Pick<Item, "size">): THREE.Object3D;
    /** The animations an item's own model brings, by name. Empty until its model has been made, and for a marker. */
    clips(item: Item): THREE.AnimationClip[];
    /** Something to draw for one of the things an item sends out: checked and counted like its model, or a marker. */
    sent(item: Item, name: string, tints?: Record<string, string>): Promise<THREE.Object3D>;
    /** One of an item's own sounds, as its bytes: fetched and checked against its hash. Null if there is none, or it failed. */
    sound(item: Item, name: string): Promise<Uint8Array | null>;
    /** An item's script, as its text: fetched and checked against its hash. Null if it has none, or it failed. */
    script(item: Item): Promise<string | null>;
}
/** Count what a loaded model holds, and say whether it is within what may be drawn. */
/**
 * Colour the parts of a drawn item that its holder may choose (protocol/17-items.md, "A holder's own colours"):
 * every material named `tint:<slot>` takes the colour chosen for that tint, or the one its maker gave it. A part
 * that glows, glows in that colour. Call it again to change them. Nothing else about the model is touched.
 */
export declare function applyTints(root: THREE.Object3D, item: Pick<Item, "tints">, tints?: Record<string, string>): void;
export declare function withinBudget(root: THREE.Object3D): boolean;
/** Scale and place a model so that it stands inside the box its description gives, on that box's floor. */
export declare function fitToSize(root: THREE.Object3D, size: readonly [number, number, number]): THREE.Object3D;
export declare function createItems(opts?: ItemsOptions): Items;
