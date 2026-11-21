import type { World } from "./world.js";
/** The seven a door shows, in the order it shows them. */
export declare const DOOR_OFFERS: readonly ["headset", "people", "voice", "items", "saves", "records", "paid"];
/** The rest, which a door's details show after those seven. */
export declare const MORE_OFFERS: readonly ["tips", "doors", "looks", "by-name", "home"];
export declare const OFFERS: readonly ["headset", "people", "voice", "items", "saves", "records", "paid", "tips", "doors", "looks", "by-name", "home"];
export type OfferId = (typeof OFFERS)[number];
export interface Offer {
    id: OfferId;
    /** Whether the announcement says it. */
    on: boolean;
    /** A word or two, for a heading or a label. The same whether it is on or not. */
    name: string;
    /** What it means for the visitor, as one plain sentence: one for a world that says it, another for one that doesn't. */
    words: string;
    /** Whether a door shows it. Otherwise it is for a door's details. */
    onDoor: boolean;
}
/** What `worldOffers` reads. A whole `World` does. */
export type OffersOf = Pick<World, "modes" | "capabilities"> & Partial<Pick<World, "items" | "access">>;
/**
 * Everything a world may say it offers, each with whether this one says it
 * and the words for that: the seven a door shows first, then the rest. From
 * the announcement alone.
 */
export declare function worldOffers(world: OffersOf): Offer[];
