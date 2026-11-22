/**
 * What the kit's sounds are made of, with nothing that needs a browser:
 * the list of cues and how each default is built, what a world may put in
 * their place, the visitor's volumes, the music a place makes when nobody
 * gave it any, and the list of a visitor's own songs.
 *
 * Kept apart from the part that makes noise (sound.ts) so every rule here
 * can be tested without one.
 */
/**
 * Every sound the kit makes for something that happened. A closed list: a
 * world can replace or silence any of them, and can't add to it, so a
 * visitor's "effects" volume always covers everything a world plays through
 * the kit.
 */
export declare const CUES: readonly ["step", "land", "bump", "grab", "drop", "hover", "press", "menuOpen", "menuClose", "cross", "arrive", "join", "leave", "micOn", "micOff", "notice", "chat", "error"];
export type Cue = (typeof CUES)[number];
/** One piece of a default cue: a tone that may slide, or a breath of filtered noise. Times in seconds. */
export type CuePart = {
    kind: "tone";
    wave: "sine" | "triangle" | "square";
    from: number;
    to?: number;
    at: number;
    dur: number;
    gain: number;
} | {
    kind: "noise";
    band: number;
    at: number;
    dur: number;
    gain: number;
};
export declare function cueRecipe(cue: Cue): CuePart[];
/** How long a recipe lasts, in seconds. */
export declare function recipeLength(parts: CuePart[]): number;
export declare const SOUND_LIMITS: {
    /** A world's own cue: a file this size at most, this long at most. Longer ones aren't sounds for something that happened. */
    readonly cueBytes: number;
    readonly cueSeconds: 3;
    /** Kinds of file a world may name. */
    readonly extensions: readonly ["ogg", "oga", "opus", "mp3", "m4a", "aac", "wav", "webm", "flac"];
    /** Files for one cue: one is chosen each time, so a sound heard often isn't the same sound every time. */
    readonly variants: 6;
    /** Pieces of music for one place: they play in turn. */
    readonly tracks: 8;
    /** The visitor's own songs: this many, each this size at most. */
    readonly songs: 60;
    readonly songBytes: number;
    readonly titleChars: 80;
};
/**
 * A world's sounds. For each cue: an address of a file on the world's own
 * site to play instead, or null for silence. A cue it doesn't name keeps the
 * default. `music` is what plays in the place: an address, null for none, or
 * left out for the music the kit makes.
 */
export interface SoundTheme {
    /** A file, or several to choose among each time, or null for silence. */
    cues?: Partial<Record<Cue, string | string[] | null>>;
    /** A piece of music, or several to play in turn, or null for none. */
    music?: string | string[] | null;
    /**
     * A steady sound under the music: a room's hum. An address, null for
     * none, or left out for the kit's own where the kit's sounds are served.
     */
    hum?: string | null;
}
/** The same, read and checked: every address is on the world's own site and names a sound file. */
export interface CleanTheme {
    cues: Partial<Record<Cue, string[] | null>>;
    music?: string[] | null;
    hum?: string | null;
}
/** Read a world's theme, trusting nothing in it. What can't be used falls back to the default, never to silence. */
export declare function cleanTheme(input: unknown, base: string): CleanTheme;
/**
 * The kit's own sound files, as a site serves them: a folder holding
 * `sounds.json` and the files it names. Each sound may come in two forms,
 * because no one form plays in every browser: `{ "ogg": "…", "mp3": "…" }`.
 */
export interface KitSounds {
    cues: Partial<Record<Cue, string[]>>;
    music?: string[];
    hum?: string;
}
/** Read the kit's `sounds.json`, choosing for each sound the form this browser plays. Addresses are relative to the folder. */
export declare function cleanKit(input: unknown, folder: string, playsOgg: boolean): KitSounds;
/**
 * What a piece of music is called, from where it is kept: the file's own name, without what kind of file it is.
 * It is what a visitor reads in the menu, and what they can tell whoever runs the place if they'd rather not
 * hear it.
 */
export declare function pieceName(address: string): string;
/**
 * How one footstep differs from the last. No two real steps sound alike: the
 * weight on each foot differs, and so does what is under it. And a step is a
 * quiet thing, heard a thousand times a visit, so it sits well under every
 * other cue.
 */
export interface StepShape {
    /** How loud, as a share of what any other cue is. */
    gain: number;
    /** How fast it is played: above 1 is higher and shorter, below is lower and longer. */
    rate: number;
    /** Where its brightness is cut off, in hertz: a lower number is a softer tread. */
    cutoff: number;
    /** Which side it is on, from -1 (left) to 1: a little to the side of the foot that made it. */
    pan: number;
}
/** How loud the loudest step is, beside any other cue. */
export declare const STEP_LEVEL = 0.45;
/**
 * A jump is heard as two footsteps back to back, a little louder than a step (the owner, 2026-11-21: "play two of
 * our random footstep sounds back to back and slightly louder"). `louder`: how much a step's level is raised, 1.35
 * times (about 2.6 dB), which keeps the loudest jump step at 0.61 beside any other cue, still quieter than every one
 * of them. `gap`: the seconds from the first step to the second. Each is a footstep of its own (`stepShape`), so no
 * two jumps sound the same either.
 */
export declare const JUMP_STEPS: {
    readonly louder: 1.35;
    readonly gap: 0.09;
};
/**
 * The shape of the step a foot makes: `foot` counts steps, so even ones are
 * the left foot and odd ones the right. The two feet differ a little and
 * steadily, and every step differs a little more by chance.
 */
/** Where a sound made by somebody comes from: how far off they are, in metres, and how far to one side (-1 left, 1 right). */
/** How far a visitor walks between steps, in metres: the pace of their footsteps, and of anything that keeps time with them. */
export declare const STRIDE = 0.75;
export interface SoundPlace {
    distance: number;
    pan?: number;
}
/** Within `near` metres a sound is as written. By `far` it is as dull as it gets. It is never quieter than `floor`. */
export declare const HEARD: {
    readonly near: 2;
    readonly far: 25;
    readonly floor: 0.14;
    readonly fall: 6;
};
/**
 * How a sound made by somebody is heard from where they stand: quieter and
 * duller the further off, and to the side they are on. It never goes silent,
 * because what it says (someone wrote something) is true however far they
 * are; distance says where, not whether.
 */
export declare function heardFrom(place: SoundPlace): StepShape;
export declare function stepShape(foot: number, random?: () => number): StepShape;
/** Which of several to play next: any but the one just played, so nothing is heard twice running. */
export declare function nextVariant(count: number, last: number, random?: () => number): number;
/** The visitor's volumes, each from 0 to 1. Theirs, kept for this site, and nothing a world sets. */
export interface SoundLevels {
    /** Everything off, whatever the rest says. */
    off: boolean;
    /** Cues: steps, presses, doors. */
    effects: number;
    /** The place's music, and the visitor's own. */
    music: number;
    /** Other people's voices. */
    voices: number;
    /**
     * Whether to hear music that people nearby are sharing. Off until the
     * visitor turns it on: nobody's music reaches anyone who didn't ask.
     */
    hearShared: boolean;
    /** How loud other people's music is. */
    shared: number;
    /** Whether the room's hum is heard: the steady sound under the music, where a place has one. */
    hum: boolean;
}
export declare const DEFAULT_LEVELS: SoundLevels;
/** The steps a volume goes through when its control is pressed. */
export declare const LEVEL_STEPS: readonly [0, 0.35, 0.7, 1];
export declare const LEVEL_WORDS: readonly ["off", "low", "medium", "high"];
export declare function cleanLevels(input: unknown): SoundLevels;
/** Which step a volume is nearest, from 0 to 3. */
export declare function levelStep(v: number): number;
/** The next volume up, going round to off after the highest. */
export declare function nextLevel(v: number): number;
/** How far someone's shared music carries, in metres. Past it, it isn't asked for and isn't sent. */
export declare const MUSIC_RANGE = 12;
/** How many people's music one visitor hears at once: the nearest. More than this is noise. */
export declare const MUSIC_SOURCES = 2;
/** How much shared music steps back while someone is speaking. */
export declare const MUSIC_DUCK = 0.35;
/**
 * Whose music to listen to: of the people sharing, the nearest few within
 * range, leaving out anyone the visitor has stopped hearing. Returns their
 * keys, nearest first.
 */
export declare function musicToHear(sharing: {
    pubkey: string;
    metres: number;
    refused?: boolean;
}[], hear: boolean): string[];
/** How much of someone's music is left at this distance, from 1 beside them to 0 at the edge of its range. */
export declare function musicFade(metres: number): number;
/** A small generator of numbers from a seed: the same seed, the same numbers, on every device. */
export declare function seeded(seed: string): () => number;
export interface AmbiencePlan {
    /** The note everything hangs from, in hertz. */
    root: number;
    /** The notes it may play, as multiples of the root, within one octave. */
    scale: number[];
    /** Notes held under everything: a frequency, how far it drifts in cents, and how many seconds its swell takes. */
    drones: {
        hz: number;
        detune: number;
        swell: number;
    }[];
    /** How bright it is: where the filter sits, in hertz. */
    colour: number;
    /** Seconds between the single notes that come and go over the top, least and most. */
    gap: [number, number];
}
/**
 * The music a place makes when its world gave it none: a few held notes
 * that swell and fade, and single notes over them now and then. It comes
 * from the place's name, so each place has its own and has the same one for
 * everybody, with no file anywhere.
 */
export declare function ambiencePlan(seed: string): AmbiencePlan;
/** A song the visitor added from their own device. The file itself is kept beside this, in this browser. */
export interface Song {
    id: string;
    title: string;
    /** Its size in bytes. */
    size: number;
    /** When it was added, in seconds. */
    at: number;
}
/** A name for a song from its file's name: no folder, no ending, nothing invisible. */
export declare function songTitle(fileName: unknown): string;
export declare function cleanSongs(input: unknown): Song[];
/** Whether a file may be kept as a song, and if not, why, in words for the visitor. */
export declare function songRefusal(file: {
    type?: string;
    size?: number;
    name?: string;
}, have: number): string | null;
