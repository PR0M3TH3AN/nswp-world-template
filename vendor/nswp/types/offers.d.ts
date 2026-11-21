/**
 * What a world offers, as its own announcement says it: the list a door
 * shows, and a door's details (NSWP-01, "What a world offers").
 *
 * One rule for every line: it is `on` only for what the announcement says in
 * so many words. Nothing is on by a default, by a guess from something else
 * it said, or because most worlds have it. A world that says nothing about
 * the things visitors carry does allow them (NSWP-17), and its door still
 * doesn't say so: that is the world's to say.
 *
 * So what is not `on` is never "this world doesn't": it is "this world
 * doesn't say", and the words say exactly that. A reader has only the
 * announcement, and looking at a door contacts no site.
 */
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
