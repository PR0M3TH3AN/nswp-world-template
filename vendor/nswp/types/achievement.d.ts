import { type EventTemplate, type NostrEvent } from "./event.js";
/** An achievement held: addressable, one for each person for each achievement of a world. Experimental; not allocated by the NIPs process. */
export declare const ACHIEVEMENT_KIND = 37307;
export declare const ACHIEVEMENT_LIMITS: {
    /** A world may have no more than this many signed in `perMs`, and in an hour. */
    readonly burst: 6;
    readonly perMs: 60000;
    readonly hourly: 60;
    /** The longest a title may be, and the words about it, in characters. */
    readonly title: 60;
    readonly about: 160;
};
/** One of a world's achievements, as the world describes it. */
export interface Achievement {
    /** Its name among this world's achievements: lower-case letters, digits and hyphens, 32 at most. */
    id: string;
    /** What it is called, for a reader. */
    title: string;
    /** What it is for, in a few words. */
    about?: string;
    /** Not named to someone who hasn't earned it. */
    hidden?: boolean;
}
/** An achievement's name as it may be used, or "". */
export declare function cleanAchievementId(input: unknown): string;
/**
 * An achievement someone holds, ready to be signed by them. Null if the world isn't a world's coordinate, the name
 * isn't one, or there is no title. The title goes with it so that it can be shown anywhere: it is the holder's
 * word for what the world called it.
 */
export declare function buildAchievement(o: {
    world: string;
    id: string;
    title: string;
    relay?: string;
    now: number;
}): EventTemplate | null;
/**
 * What a signer does when a world asks for its visitor's achievement to be signed: the same note, marked with the
 * site that asked, which the signer takes from the browser and never from the world. Null for anything malformed.
 */
export declare function achievementForWorld(o: {
    world: unknown;
    id: unknown;
    title: unknown;
    origin: string;
    now: number;
}): EventTemplate | null;
export interface HeldAchievement {
    /** Who holds it. */
    by: string;
    /** The world: `37300:<publisher>:<d>`. */
    world: string;
    id: string;
    /** What they say the world called it. Shown as text. */
    title: string;
    /** When they showed it, in seconds. */
    at: number;
    /** The sites a signer says asked for it, as origins. Empty when no signer said. */
    askedAt: string[];
}
/** Read an achievement someone holds. Null for anything that isn't one. The signature is checked by `achievementsIn`, or by the caller. */
export declare function parseAchievement(event: NostrEvent | null | undefined): HeldAchievement | null;
/** Whether a signed achievement is the one that was asked for: by the key the signer holds, really signed, that one, marked with this site. */
export declare function isAchievementAsked(signed: unknown, o: {
    pubkey: string | null;
    world: string;
    id: string;
    title: string;
    origin: string;
}): signed is NostrEvent;
/** Who holds one of a world's achievements, as far as a reader can tell. */
export interface AchievementHolders {
    id: string;
    /** How many people show it. */
    holders: number;
    /** Which of them the reader has reason to know. */
    known: string[];
    /** Whether the reader shows it themselves. */
    mine: boolean;
}
/**
 * Who holds what in one world, from what relays have.
 *
 * - Only a real signature counts, and only an achievement a signer says was asked for at the world itself
 *   (`worldUrl`): another site can't hand them out.
 * - `counted` are the people the reader has reason to know: they are named, the rest are only counted.
 */
export declare function achievementsIn(events: readonly NostrEvent[], o: {
    world: string;
    worldUrl: string;
    counted?: Iterable<string>;
    me?: string | null;
}): {
    byId: Map<string, AchievementHolders>;
    held: HeldAchievement[];
};
