/**
 * What a world offers, drawn beside its door: a column of small tiles, lit
 * for what the world's announcement says and dark for what it doesn't
 * (`worldOffers` in the core; NSWP-01, "What a world offers").
 *
 * One piece for every door there is: the kit's own doorway stands it beside
 * itself (`createPortalGate`), and a client that draws its doors another way
 * adds it to each. So the tiles, their order and their words are the same on
 * every door in every world. The owner, 2026-11-21: "icons that are lit up
 * or dark if not supported. And when the user hovers over one it should
 * display in game text explaining what that icon means."
 *
 * A tile is something to point at, never something to press: pointing says
 * what it means. On a flat screen that goes in the card over the controls,
 * which the page that owns the door fills from `offerOf`; in a headset this
 * shows the words itself, in front of the door (`point`).
 */
import * as THREE from "three";
import { type Offer } from "@nswp/core";
import { OFFER_ICONS } from "./offer-icons.js";
export { OFFER_ICONS };
/** A tile's side, in metres: large enough to tell lit from dark across a room. */
export declare const OFFER_TILE = 0.24;
/** How far left of the doorway's middle the column stands: clear of the frame, and inside half the least distance between two doors. */
export declare const OFFER_COLUMN_X: number;
/** Where each tile's middle is, top to bottom in the order given, in the door's own space. */
export declare function doorOfferPlaces(count: number): [x: number, y: number, z: number][];
export interface DoorOffersOptions {
    color?: THREE.ColorRepresentation;
    textColor?: string;
}
export interface DoorOffers {
    /** Add this to the door's own group: the column stands beside the opening, on the floor the door stands on. */
    group: THREE.Group;
    /** Test rays against these. */
    targets: THREE.Mesh[];
    /** Which line a pointed-at thing is, or null if it isn't one of these tiles. */
    offerOf(object: THREE.Object3D | null | undefined): Offer | null;
    /**
     * Say which tile is pointed at, or null for none: it is drawn brighter.
     * With `words` (a headset, where there is no card to read), what it means
     * is shown in front of the door for as long as it is pointed at.
     */
    point(offer: Offer | null, words?: boolean): void;
    /** What the world offers, when it is learned or changes. Only the lines a door shows are drawn. */
    set(offers: readonly Offer[]): void;
    dispose(): void;
}
export declare function createDoorOffers(offers?: readonly Offer[], opts?: DoorOffersOptions): DoorOffers;
