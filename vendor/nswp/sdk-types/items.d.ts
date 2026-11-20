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
 * - the file is read and counted before Three.js sees it, and one with too much in it, or that names anything
 *   outside itself, is not drawn (`item-store.ts`, which is the part every engine shares).
 *
 * Whatever fails, there is a plain marker of the item's own size to draw instead: a visitor is never left
 * holding nothing because a file was missing.
 *
 * Fetching a model tells the place that keeps it the visitor's address, as fetching a picture does. A visitor
 * who would rather not has one switch for all items (`showsItems`).
 */
import { type Item } from "@nswp/core";
import * as THREE from "three";
import { type ItemStore, type ItemStoreOptions } from "./item-store.js";
export { forgetItemsSwitch, ITEM_BUDGET, onItemsChange, setShowsItems, showsItems } from "./item-store.js";
export type ItemsOptions = ItemStoreOptions;
export interface Items extends ItemStore {
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
}
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
