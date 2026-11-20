export interface LetterLine {
    key: string;
    mine: boolean;
    /** Who wrote it, as a name. */
    who: string;
    text: string;
    /** When, in seconds. */
    at: number;
    /** "out": it was sent, or it arrived. "sending": on its way. "failed": it wasn't sent. */
    state: "out" | "sending" | "failed";
}
export interface LettersView {
    /** A conversation is up. */
    ready: boolean;
    /** What the panel is called: "Ada, privately". */
    title: string;
    /** Who it is with, as a name. */
    with: string;
    /** Oldest first. */
    lines: LetterLine[];
    /** How the last thing sent went, in a few words. "" for nothing to say. */
    said: string;
    /** What the panel says where they write: who can read it. */
    lead: string;
    limit: number;
    version: number;
}
export interface LettersOptions {
    /** Who it is with, as a name. A function is asked each time: a name may arrive late. */
    with: string | (() => string);
    /** The conversation so far, oldest first. Asked each time it is drawn. */
    lines(): Omit<LetterLine, "state">[];
    /** Seal and send what they wrote. Resolves to whether it went, and a few words if it didn't. */
    send(text: string): Promise<{
        ok: boolean;
        said: string;
    }>;
    /** The visitor is looking at it. */
    seen?(): void;
}
export interface UiLetters {
    /** Put a conversation up. */
    attach(opts: LettersOptions): void;
    /** Put it away. */
    detach(): void;
    /** What the conversation holds has changed: draw it again. */
    touch(): void;
    /** The visitor is looking at it. */
    seen(): void;
    /** Send what the visitor wrote. Returns a few words if it couldn't even be tried, or null. */
    send(text: string): string | null;
    view(): LettersView;
}
export declare function createUiLetters(changed: () => void, now?: () => number): UiLetters;
