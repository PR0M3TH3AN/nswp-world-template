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
    /** "out": it is on a relay. "sending": on its way. "failed": it wasn't sent. "removing": its deletion is being asked for. */
    state: "out" | "sending" | "failed" | "removing";
    /** The note's own id, once it is known: what a deletion names. */
    id?: string;
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
    /** What the window says where they write: that it is public, as whom, and how a post is marked. */
    lead: string;
    /** The most characters in one post written here. */
    limit: number;
    /** A post here can be asked to be deleted: the visitor's sign-in address can be asked to sign that. */
    removable: boolean;
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
    /** Whose feed: their name, or the short form of their key. A function is asked each time: a name may arrive late. */
    who: string | (() => string);
    /**
     * The site every post sent from here is marked with, or "" for none. A world's signer marks each note with
     * the world that asked (protocol/10-identity.md, "Signing from a world"), and the visitor is told so.
     */
    marked?: string;
    /** Sign and send what they wrote. Resolves to a few words on how it went, whether it did, and the note's id if it went. */
    send(text: string): Promise<{
        ok: boolean;
        said: string;
        id?: string;
    }>;
    /**
     * Ask for one of their posts to be deleted, by the note's id: a deletion they sign themselves, at their own
     * sign-in address (protocol/10-identity.md, "Asking the person"). Left out where nothing can ask them.
     */
    remove?(id: string): Promise<{
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
    /** Ask for the post with this key to be deleted. Returns a few words if it couldn't even be tried, or null. */
    remove(key: string): string | null;
    view(): FeedView;
}
/** The feed a set of controls holds. `changed` is called whenever a renderer should draw again. */
export declare function createUiFeed(changed: () => void, now?: () => number): UiFeed;
/** How long ago, in a few words: "just now", "5 min ago", "3 h ago", "2 days ago", then the date. */
export declare function ago(at: number, nowSec: number): string;
