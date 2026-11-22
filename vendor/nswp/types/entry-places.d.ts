/**
 * Places to arrive (protocol/01-worlds.md, "Places to arrive"; the owner, 2026-11-21: "We need designated spawn
 * locations in each world with a minimum number set so that the game can always find a clear area to spawn if
 * someone else is there.").
 *
 * An entry point is a set of places, not one spot: at least `ENTRY_PLACES_LEAST`, and `ENTRY_PLACES_ROOMS` for a
 * world that is for meeting people. Arriving, a visitor takes the first place nobody is within `ENTRY_CLEAR` of,
 * never one the world says nobody may stand on; if every place is taken, the one with the most room. An entry point
 * written the old way, as one spot, still works: its places are a ring round it, filled to the least number.
 *
 * Which places are taken is what the visitor's own kit can see: the people in the room it has joined. Nothing here
 * moves anyone already in the room; it only says where the one arriving should stand.
 */
/** The least number of places an entry point gives. */
export declare const ENTRY_PLACES_LEAST = 4;
/** The least for a world whose rooms are for meeting people: one with "rooms" or "multiplayer" among what it offers. */
export declare const ENTRY_PLACES_ROOMS = 8;
/** The least room between an arriving visitor and anyone already there, in metres: closer, and they are inside them. */
export declare const ENTRY_CLEAR = 1;
/** How far out from a single spot the ring of places an old-style entry point gets is, in metres (as before). */
export declare const ENTRY_RING = 1.3;
/** One place to arrive: where (metres) and which way they face (degrees, 0 facing -Z), as entry points are written. */
export interface EntryPlace {
    position: [number, number, number];
    yaw: number;
}
/** An entry point as a world writes it in its code: its own spot, and optionally the rest of its places. */
export interface EntryPointSpec extends EntryPlace {
    places?: EntryPlace[];
}
/** The least number of places for a world that offers these (its capabilities). */
export declare function leastEntryPlaces(capabilities?: readonly string[]): number;
/**
 * The places of an entry point. Its own spot is always the first, so a door or link naming it lands where it did.
 * Places it gives come next, as given. An entry point that gives fewer than `least` has the rest filled with a ring
 * `ENTRY_RING` round its own spot, each facing the way the spot does: so a world written the old way, with one spot,
 * still keeps people from arriving inside each other.
 */
export declare function entryPlaces(point: EntryPointSpec, least?: number): EntryPlace[];
/**
 * Where an arriving visitor should stand: the index of the first place they may stand on (`canStand`) with nobody
 * of `others` (each `[x, z]`) within `ENTRY_CLEAR`. With every such place taken, the place they may stand on with
 * the most room round it (the farthest from its nearest person; ties to the earlier place). Only where none may be
 * stood on at all, the first place. Never decided by anything but these: the same answer everywhere.
 */
export declare function pickEntryPlace(places: readonly EntryPlace[], others?: readonly (readonly [number, number])[], canStand?: (x: number, z: number) => boolean): number;
/** What a world's check says about its entry points. */
export interface EntryPlacesIssue {
    level: "error" | "warn";
    code: "too_few" | "too_close" | "single_spot" | "invalid";
    entry: string;
    message: string;
}
/**
 * Check a world's entry points as its code writes them. A set of places given but smaller than the least is an
 * error, and so are two places nearer each other than `ENTRY_CLEAR` (a set packed tighter than one person's room
 * keeps nobody apart). An entry point written the old way, as one spot, is a warning: it works, with a ring filled
 * in, but its places should be chosen by whoever knows where people may stand.
 */
export declare function checkEntryPlaces(entryPoints: Record<string, EntryPointSpec>, opts?: {
    capabilities?: readonly string[];
}): EntryPlacesIssue[];
