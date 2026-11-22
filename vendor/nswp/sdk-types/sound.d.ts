import { type SoundPlace, type Cue, type Song, type SoundLevels, type SoundTheme } from "./sound-store.js";
import type { Controls } from "./ui/model.js";
export { CUES, type Cue, type Song, type SoundLevels, type SoundPlace, type SoundTheme } from "./sound-store.js";
export interface SoundsOptions {
    /** The page's sound context, if it has one already (three.js keeps one: `THREE.AudioContext.getContext()`). */
    context?: AudioContext;
    /** The world's own sounds. Left out, everything is the default. */
    theme?: SoundTheme | null;
    /** What the place's own music is made from when the world names none: its title is a good choice. */
    seed?: string;
    /** Where the theme's addresses are relative to. Left out, this page. */
    base?: string;
    /**
     * Where this site serves the kit's own sound files: a folder holding `sounds.json` (for example "/sounds/kit/").
     * With it, the defaults are those files: recorded cues, a hum, a piece of music. Without it, or where a file
     * can't be had, the defaults are the ones made in the browser.
     */
    kit?: string;
    /** Keep the visitor's volumes and songs under these names. Left out, the kit's own, for this site. */
    keep?: {
        levels?: string;
        songs?: string;
    };
}
export interface Jukebox {
    /** The visitor's songs, in the order they were added. */
    list(): Song[];
    /** Keep a file as a song. Returns words for the visitor if it can't be kept, or null when it is. */
    add(file: Blob & {
        name?: string;
    }): Promise<string | null>;
    remove(id: string): Promise<void>;
    /** Play a song, or carry on with the current one. Returns false if it couldn't be played. */
    play(id?: string): Promise<boolean>;
    pause(): void;
    next(): Promise<boolean>;
    readonly playing: boolean;
    readonly current: Song | null;
    /**
     * What the jukebox is playing, as a line that can be sent to someone else:
     * for sharing music with people nearby, which is the visitor's to turn on.
     * It is the music as it is, whatever their own volume is set to.
     */
    output(): MediaStreamTrack;
}
export interface Sounds {
    /**
     * Play a cue: the world's, the default, or nothing if it is silenced or the visitor has effects off. With
     * `from`, it is heard from where somebody stands: quieter and duller the further off, and to their side.
     */
    play(cue: Cue, from?: SoundPlace): void;
    /**
     * Tell it how far the visitor was moved this frame, in metres: it makes
     * the steps. A long way at once is a jump, and lands. Give it what moved
     * them (keys, a tap, a stick), not how their head swayed.
     */
    moved(metres: number): void;
    /** They walked into something. */
    bump(): void;
    /**
     * They jumped: two footsteps back to back, a little louder than a step (`JUMP_STEPS`). The world's own `step`
     * sound where it named one, silent where it silenced it, and at the visitor's own volume for effects.
     */
    jumped(): void;
    readonly levels: SoundLevels;
    setLevels(patch: Partial<SoundLevels>): void;
    /** The visitor's own music. */
    readonly jukebox: Jukebox;
    /** Be told when a volume or the jukebox changed. Called once at the start. */
    onChange(fn: (levels: SoundLevels) => void): () => void;
    /** What the place's music is: the world's own, the kit's recorded default, the one made in the browser, or none. */
    readonly music: "world" | "kit" | "made" | "none";
    /**
     * The piece of the place's music that is playing now, by name (its file's name), and how many pieces the place
     * has. Null when the place has none, when it is made in the browser, and before any has begun.
     */
    readonly piece: {
        name: string;
        of: number;
    } | null;
    /** Go on to the place's next piece now. Returns false when there is only one, or none. */
    nextPiece(): boolean;
    /** Whether this place has a hum to hear. */
    readonly hasHum: boolean;
    /** How loud everything going out is right now, from 0. For tests. */
    loudness(): number;
    /**
     * Make a sound that isn't one of the kit's ready to play: an item's own (protocol/17-items.md). Null if it
     * isn't a sound, or runs longer than `FOREIGN_SOUND.seconds`. It is levelled as it is read, so that none can be
     * louder than the kit's own cues.
     */
    decode(bytes: Uint8Array): Promise<ForeignSound | null>;
    /**
     * Play one, at the visitor's own volume for effects. With `from` it is heard from where it happened: quieter
     * and duller the further off, to its side, and not at all beyond `FOREIGN_SOUND.gone` metres.
     */
    playForeign(sound: ForeignSound, from?: SoundPlace): void;
    /** How many sounds that aren't the kit's have been played. For tests. */
    readonly foreignPlayed: number;
    dispose(): void;
}
/** A sound that isn't one of the kit's own, ready to play. */
export interface ForeignSound {
    buffer: AudioBuffer;
    /** What it is turned down by, so its loudest moment is no louder than a cue's. */
    gain: number;
}
/** The longest such a sound may be, how loud its loudest moment may come out, and where it stops being heard. */
export declare const FOREIGN_SOUND: {
    readonly seconds: 4;
    readonly peak: 0.7;
    readonly fades: 25;
    readonly gone: 45;
};
export declare function createSounds(o?: SoundsOptions): Sounds;
/**
 * The Sound part of a world's controls: the visitor's volumes and their own
 * music. It also makes the kit's controls heard: a press, the menu, and the
 * things other parts of the kit signal (joining a room, a microphone).
 */
export declare function addSoundControls(controls: Controls, sounds: Sounds): {
    refresh(): void;
};
