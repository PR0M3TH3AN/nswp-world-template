/**
 * A picture of an item, for the Bag tab: the item itself, drawn from its own model (protocol/17-items.md).
 *
 * Nobody has to make a thumbnail for an item, and nobody can make a misleading one: what is shown in the bag is
 * the very model that would be in the visitor's hand, read and checked the same way, in the colours they chose.
 *
 * It is drawn by the page, in a small view of its own, whatever draws the world: so a bag looks the same in a
 * world made with Three.js and in one made with another engine. One view serves every picture. A still is drawn
 * once and kept; the one item the visitor has chosen is drawn again each time it is asked for, turning.
 */
import type { Item } from "@nswp/core";
import * as THREE from "three";
export interface ItemPreviews {
    /** An item as a still picture: kept once it has been drawn. Null while its model is on its way, or can't be drawn here. */
    still(item: Item, tints?: Record<string, string>): HTMLCanvasElement | null;
    /** The same, turning: drawn again each time this is asked for. `moving` false holds it still, for someone who asked for no motion. */
    turning(item: Item, tints?: Record<string, string>, moving?: boolean): HTMLCanvasElement | null;
    /** Be told when a picture that wasn't ready is. */
    onChange(fn: () => void): void;
}
export interface ItemPreviewsOptions {
    /** What gives an item's model: fetched, checked and counted (items.ts). A plain marker where that failed. */
    model(item: Item, tints?: Record<string, string>): Promise<THREE.Object3D>;
    /** Pixels along each side of a picture. Left out, 256. */
    size?: number;
}
export declare function createItemPreviews(o: ItemPreviewsOptions): ItemPreviews;
