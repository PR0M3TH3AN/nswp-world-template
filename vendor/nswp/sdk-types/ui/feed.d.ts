/** How much of a post is shown, and how many of them. A post written elsewhere may be long. */
export declare const FEED_LIMITS: {
    readonly shown: 420;
    readonly kept: 30;
};
/** One post in the feed. */
export interface FeedPost {
    /** Tells it from every other post here. */
    key: string;
    text: string;
    /** When it was posted, in seconds. */
    at: number;
    /** "out": it is on a relay. "sending": on its way. "failed": it wasn't sent. */
    state: "out" | "sending" | "failed";
}
export interface FeedView {
    /** There is a feed: something signs for the visitor here. */
    ready: boolean;
    /** What the window is called. */
    title: string;
    /** Whose feed it is, as words: their name, or the short form of their key. */
    who: string;
    /** Newest first. */
    posts: FeedPost[];
    /** The posts are being asked for. */
    loading: boolean;
    /** How the last thing sent, or the asking, went, in a few words. "" for nothing to say. */
    said: string;
    /** The most characters in one post written here. */
    limit: number;
    /** Goes up whenever anything above changes. */
    version: number;
}
/** A post as it comes from wherever posts come from. */
export interface FeedSource {
    id: string;
    text: string;
    at: number;
}
export interface FeedOptions {
    /** Whose feed: their name, or the short form of their key. */
    who: string;
    /** Sign and send what they wrote. Resolves to a few words on how it went, and whether it did. */
    send(text: string): Promise<{
        ok: boolean;
        said: string;
    }>;
    /** Their posts so far, or null if they couldn't be had. */
    load?(): Promise<FeedSource[] | null>;
}
export interface UiFeed {
    /** There is something to post with now. */
    attach(opts: FeedOptions): void;
    /** There isn't any more: what was shown is put away. */
    detach(): void;
    /** The visitor is looking at it: their posts are asked for, if they haven't been lately. */
    opened(): void;
    /** Send out what the visitor wrote. Returns a few words if it couldn't even be tried, or null. */
    send(text: string): string | null;
    view(): FeedView;
}
/** The feed a set of controls holds. `changed` is called whenever a renderer should draw again. */
export declare function createUiFeed(changed: () => void, now?: () => number): UiFeed;
/** How long ago, in a few words: "just now", "5 min ago", "3 h ago", "2 days ago", then the date. */
export declare function ago(at: number, nowSec: number): string;
