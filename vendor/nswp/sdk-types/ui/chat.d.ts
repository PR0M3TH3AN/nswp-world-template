/** Where the preference is kept, for this site. */
export declare const CHAT_KEY = "nswp:chat";
/** Whether this visitor sees what people write, and may write. On, unless they turned it off here or where they came from. */
export declare function showsChat(): boolean;
export declare function setShowsChat(on: boolean): void;
/** Hear of the preference changing. Returns how to stop. */
export declare function onChatChange(cb: () => void): () => void;
/** For tests: forget what was read. */
export declare function resetChat(): void;
/** One line in the panel. */
export interface ChatLine {
    /** Tells it from every other line here. */
    key: string;
    /** Who wrote it, as the room knows them. Empty for a note. */
    who: string;
    text: string;
    /** The visitor wrote it themselves. */
    mine: boolean;
    /** Not something anyone wrote: someone came, someone left. */
    note: boolean;
    /** A colour for their name, as CSS, or "". */
    color: string;
    /** When it was read here, in milliseconds. */
    at: number;
}
export interface ChatView {
    /** There is somewhere to write: a room is joined, and the visitor sees chat. */
    ready: boolean;
    /** What the panel is called. */
    title: string;
    lines: ChatLine[];
    /** How many lines have arrived since the visitor last looked. */
    unread: number;
    /** The most characters in one line. */
    limit: number;
    /** Goes up whenever anything above changes, so a renderer knows to draw again. */
    version: number;
}
export interface UiChat {
    /**
     * There is somewhere to write now: a room was joined. `send` takes what the
     * visitor wrote and says it; it returns a few words for them if it couldn't
     * be said, or nothing.
     */
    attach(send: (text: string) => string | null | void, opts?: {
        title?: string;
    }): void;
    /** The room was left: there is nowhere to write, and what was written is forgotten. */
    detach(): void;
    /** A line arrived, or was said. A note is a line nobody wrote: someone came, someone left. */
    add(line: {
        who?: string;
        text: string;
        mine?: boolean;
        note?: boolean;
        color?: string;
        id?: string;
    }): void;
    /** Say what the visitor wrote. Returns a few words for them if it couldn't be said, or null. */
    send(text: string): string | null;
    /** The visitor is looking at the lines: none are unread. */
    seen(): void;
    view(): ChatView;
}
/** The chat a set of controls holds. `changed` is called whenever a renderer should draw again. */
export declare function createUiChat(changed: () => void): UiChat;
/**
 * Break a line of words into rows no wider than `width`, as `measure` counts
 * width, and no more than `rows` of them: what doesn't fit ends in "…". A word
 * too long for a row of its own is broken where it must be.
 */
export declare function wrapWords(text: string, measure: (s: string) => number, width: number, rows: number): string[];
