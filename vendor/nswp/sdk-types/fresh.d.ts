/**
 * Noticing that the world a visitor is in has been updated since they opened it.
 *
 * A browser that asks before using a kept copy (core/fresh.ts) gets the latest
 * world every time a page is loaded. It does nothing for a page that is
 * already open: a tab left for an hour, or one a browser brought back whole
 * when the visitor pressed Back, goes on running what it loaded. So the page
 * asks, itself: has what I was made from changed?
 *
 * It asks about the page and its own script, and nothing else, with the
 * question a browser asks when it checks a copy (a HEAD request to its own
 * site). The answer is a mark the host puts on each file, which changes when
 * the file does. No mark, no answer: on a host that gives none, this does
 * nothing.
 *
 * What it does about it is as gentle as it can be. A visitor coming back to
 * the tab, who isn't in the middle of anything, is given the latest there and
 * then: the page loads again, and puts them back where they stood. Anyone
 * else (in a room, in a headset, writing something) is told, and reloads when
 * they choose.
 *
 *   const fresh = watchFresh({ busy: () => inARoom(), onStale: () => controls.say("…") });
 *   // fresh.stale, fresh.reload()
 */
export interface Fresh {
    /** The site has been updated since this page was loaded. */
    readonly stale: boolean;
    /**
     * Ask now. `returning` is true when the visitor has just come back to the page (it became visible, or a browser
     * brought it back from memory): then, if it is stale and they aren't busy, it is loaded again at once.
     * Resolves to whether it is stale.
     */
    check(returning?: boolean): Promise<boolean>;
    /** Load the page again, for the latest. */
    reload(): void;
    stop(): void;
}
export interface FreshOptions {
    /** The mark of what this page was made from, or null if the host gives none. Left out: the page's and its script's own. */
    stamp?: () => Promise<string | null>;
    /** Whether the visitor is in the middle of something a reload would break: in a room, in a headset, writing. */
    busy?: () => boolean;
    /** The site was updated and the page wasn't loaded again: say so. Called once. */
    onStale?: () => void;
    /** Load the page again. Left out: `location.reload()`. */
    reload?: () => void;
    /** The time now, in milliseconds. For tests. */
    now?: () => number;
    /** For tests: watch nothing by itself, and wait to be asked. */
    manual?: boolean;
}
export declare function watchFresh(o?: FreshOptions): Fresh;
