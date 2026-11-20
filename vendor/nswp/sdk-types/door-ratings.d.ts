/**
 * What the people a visitor has reason to trust thought of the places a world's doors lead to
 * (protocol/13-ratings.md, "On a world's own doors").
 *
 *   const ratings = createDoorRatings({ doors, me, counted });
 *   await ratings.load();
 *   gate.setRating(ratings.mark(doorsWorld));   // "★ 4.5 from 3", or "" where nobody they know has rated it
 *
 * A world is a Nostr client like any other. One its visitor has let see who they follow can count their
 * ratings as their own client does: the visitor's, and the people they follow. A world that hasn't been let
 * counts only the visitor's own. For a guest nothing is asked, and nothing is shown.
 *
 * Relays are asked by world, never by person. And this only shows ratings: giving one is done at the visitor's
 * own client, never from inside a world.
 */
import { queryRelays, type Tally } from "@nswp/core";
export interface DoorRatingsOptions {
    /** Where this world's doors lead: each place's coordinate and its address. */
    doors: {
        world: string;
        url: string;
    }[];
    /** The visitor's key here, or null for a guest. */
    me(): string | null;
    /** The people the visitor follows, where they have let this world see who that is; null where they haven't. */
    counted(): readonly string[] | null;
    relays?: string[];
    now?: () => number;
    query?: typeof queryRelays;
}
export interface DoorRatings {
    /** Ask relays what people thought of these places: again only after a few minutes, unless `fresh`. */
    load(fresh?: boolean): Promise<void>;
    /** The tally for one of them, from what was read and who is counted now. */
    tally(world: string): Tally | null;
    /** As a door's sign says it: "★ 4.5 from 3". "" where nobody counted has rated it. */
    mark(world: string): string;
    /** In full, with whose it is: "4.5 of 5, from you and 2 people you follow". "" where there is none. */
    words(world: string): string;
    onChange(fn: () => void): () => void;
}
export declare function createDoorRatings(opts: DoorRatingsOptions): DoorRatings;
