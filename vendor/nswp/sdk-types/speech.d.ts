/**
 * Speaking instead of typing.
 *
 * Something has to turn the sound into words, and who does that is the whole
 * question. There are two that this kit will use:
 *
 * - **The visitor's own computer**, where a terminal is connected to a Bridge
 *   that listens (browser/bridge.md). The sound goes to their computer over
 *   the connection the terminal already has, and nowhere else.
 * - **The browser itself**, where it has speech recognition. Some browsers do
 *   this on the device. Others send the sound to their maker's service, so
 *   the visitor is told, once, before the first word is heard.
 *
 * Their own computer is preferred whenever it is there. Whatever was said
 * comes back as plain words on one line: speaking types, and never presses
 * Enter.
 */
/** Samples as a microphone gives them, turned into 16-bit at the rate a recogniser wants. Each new sample is the average of the old ones it covers. */
export declare function toPcm16(samples: Float32Array, fromRate: number, toRate?: number): Int16Array;
/** Words as they may be typed: one line, nothing hidden. */
export declare function cleanSpoken(text: string): string;
export interface Hearing {
    /** They have finished: work out the words. */
    stop(): void;
    /** Never mind. Nothing is typed. */
    cancel(): void;
}
export interface VoiceSource {
    /** Who turns the speech into words, as the visitor is told it. */
    name: string;
    /** Whether what is said stays on the visitor's own devices. */
    private: boolean;
    hear(o: {
        lang: string;
        onText(text: string): void;
        onEnd(why: string | null): void;
    }): Hearing;
}
/** Record from the microphone until told to stop. What comes back is ready for a recogniser. */
export declare function recordVoice(maxSeconds?: number): Promise<{
    stop(): Promise<Int16Array>;
    cancel(): void;
}>;
/** The visitor's own computer, through a connection that will turn sound into words. */
export declare function computerVoice(name: string, transcribe: (pcm: Int16Array, lang: string) => Promise<string>): VoiceSource;
/**
 * The browser's own speech recognition, or null where it has none. It is
 * `private` only where the browser says it can do the work on the device, and
 * is then told it must.
 */
export declare function browserVoice(lang: string, scope?: unknown): Promise<VoiceSource | null>;
export type VoiceState = "idle" | "asking" | "listening" | "working";
export interface Voice {
    /** Offer another way to turn speech into words. Returns how to take it back. */
    add(source: VoiceSource): () => void;
    /** The one that would be used now: the visitor's own devices first. Null when there is none. */
    readonly source: VoiceSource | null;
    readonly state: VoiceState;
    /**
     * The one button: start listening, or finish. `onText` gets the words;
     * `say` gets a line to show the visitor about what is happening. The first
     * time a source that sends sound away would be used, it asks, and a second
     * press goes ahead.
     */
    toggle(o: {
        onText(text: string): void;
        say(message: string): void;
    }): void;
    cancel(): void;
    /** Be told when the state or the sources change. Returns how to stop being told. */
    subscribe(fn: () => void): () => void;
}
export declare function createVoice(o?: {
    lang?: string;
    storage?: Pick<Storage, "getItem" | "setItem"> | null;
    browser?: Promise<VoiceSource | null>;
}): Voice;
