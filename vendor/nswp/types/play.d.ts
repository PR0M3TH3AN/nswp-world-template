/** How fast things fall, in metres a second, each second. The same everywhere, so an arc is the same for all. */
export declare const GRAVITY = 9.8;
export declare const PLAY_LIMITS: {
    /** The fastest anything may be sent out, in metres a second. */
    readonly speed: 40;
    /** The longest a thing may stay stuck where it landed, in seconds. */
    readonly stick: 10;
    /** The longest a thing may fly before it is gone, in seconds. */
    readonly life: 5;
    /** How far from the middle of a world anything may be said to start, in metres. */
    readonly far: 10000;
    /** How many things one person may send out: a burst, and then so many a second. */
    readonly burst: 8;
    readonly perSecond: 6;
    /** How many of anyone's things are flown or left lying at once. The oldest go first. */
    readonly flown: 48;
    /** How long a hit may wait for the person hit to say so, in seconds, before the thing drops off them. */
    readonly agree: 0.6;
    /** The most an item's own words may be: its counter. */
    readonly words: 24;
};
/** One thing sent out: which of its item's things it is, where it started, and how it was going. */
export interface Shot {
    /** Its number among the things its sender has sent out on this visit. */
    id: number;
    /** Which of the item's described things it is. */
    name: string;
    from: [number, number, number];
    /** Metres a second. */
    velocity: [number, number, number];
    /** How long it stays where it lands, in seconds. */
    stick: number;
}
/**
 * A thing sent out, as it is said to a room. Null if it couldn't be: no name, a place or a speed that isn't a
 * number. Speed and stick are brought within their ceilings here, and again by whoever reads it.
 */
export declare function buildShot(o: Shot): string | null;
/** Read what a member said they sent out. Null for anything that isn't one. */
export declare function parseShot(text: unknown): Shot | null;
/** Where a thing is, `t` seconds after it was sent out: straight on, and falling. */
export declare function shotAt(shot: Pick<Shot, "from" | "velocity">, t: number): [number, number, number];
/** Someone saying a thing reached them: whose it was, which, and where on them (from their feet, in metres). */
export interface Hit {
    /** Who sent it out. */
    by: string;
    id: number;
    /** Where it struck, from the middle of where they stand, at floor height. */
    at: [number, number, number];
}
export declare function buildHit(o: Hit): string | null;
export declare function parseHit(text: unknown): Hit | null;
/** Something an item did that the others see or hear: one of its own sounds, or one of its own animations. */
export interface Did {
    kind: "sound" | "clip";
    name: string;
}
export declare function buildDid(o: Did): string | null;
export declare function parseDid(text: unknown): Did | null;
/**
 * The state a world keeps of a person, where it keeps none of its own: health. It is theirs to say, as a hit is.
 * A world with a game of its own defines what it likes; this is what a place that only allows items has.
 */
export declare const HEALTH: {
    /** How much someone has when nothing has reached them. */
    readonly full: 5;
    /** The most one thing may take at once. */
    readonly most: 5;
    /** After this long with nothing reaching them, they are back to full, in seconds. */
    readonly restSeconds: 6;
    /** How long they stay at nothing before they are back to full, in seconds. */
    readonly downSeconds: 3;
};
/** How much of something a person has, as they say it to the room: "st:health,3,5". */
export interface PersonState {
    name: "health";
    value: number;
    full: number;
}
export declare function buildState(o: PersonState): string | null;
export declare function parseState(text: unknown): PersonState | null;
/**
 * What a person has after something reached them, by the rules of a place with none of its own: `by` is taken
 * (never more than `HEALTH.most` at once, never below nothing).
 */
export declare function struck(value: number, by: number): number;
/**
 * Where along the way from `a` to `b` a thing first meets a person: a standing capsule of `radius`, from their feet
 * at `feet` up to `height`. Returns how far along (0 at `a`, 1 at `b`), or null if it passes them by. A person is
 * a simple shape that things can hit, and never the drawn figure.
 */
export declare function meetsPerson(a: readonly number[], b: readonly number[], feet: readonly number[], height: number, radius: number): number | null;
/** A person's shape for things to hit: how tall, and how wide, in metres. */
export declare const PERSON_SHAPE: {
    readonly radius: 0.28;
};
/**
 * Everything an item's script may ask of the kit, and how often (protocol/17-items.md, "An item's own logic").
 * A closed list: a script that asks for anything else is asking for nothing. Each is `burst` at once, and then
 * `perSecond`.
 */
export declare const ITEM_ASKS: {
    /** Play one of its own sounds, by name. */
    readonly play: {
        readonly burst: 6;
        readonly perSecond: 6;
    };
    /** Play one of its own animations, by name. */
    readonly clip: {
        readonly burst: 4;
        readonly perSecond: 4;
    };
    /** Send out one of the things it has described. */
    readonly send: {
        readonly burst: 8;
        readonly perSecond: 6;
    };
    /** Show its own words: a counter. */
    readonly show: {
        readonly burst: 8;
        readonly perSecond: 8;
    };
};
export type ItemAsk = keyof typeof ITEM_ASKS;
/** What an item's script is told of: its own item, and the passing of time. Nothing of the visitor or the world. */
export declare const ITEM_EVENTS: readonly ["held", "away", "use", "second", "tick"];
export type ItemEvent = (typeof ITEM_EVENTS)[number];
/** The longest an item's script may be, in bytes, and how long it may go without answering before it is stopped. */
export declare const SCRIPT_LIMITS: {
    readonly bytes: 64000;
    readonly silentMs: 1500;
};
/** A gate that lets `burst` through at once and then `perSecond`: for what one person, or one script, may ask. */
export declare function createRate(burst: number, perSecond: number): {
    take(nowMs: number): boolean;
};
/** An ask as the kit takes it from a script: its name on the list, and what goes with it, tidied. Null otherwise. */
export declare function cleanAsk(name: unknown, args: unknown): {
    ask: "play" | "clip";
    name: string;
} | {
    ask: "send";
    name: string;
    speed: number;
    stick: number;
    lift: number;
} | {
    ask: "show";
    text: string;
} | null;
