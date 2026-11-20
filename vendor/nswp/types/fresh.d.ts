/**
 * Whether a world is served so that a visitor always gets its latest.
 *
 * A world is a website, and a browser keeps copies of what a website sends
 * it. Left to itself, a browser may go on using a kept copy of a world's page
 * or script for minutes, hours or days after the world was updated, with
 * nobody told. Then two visitors in one room are running two different
 * worlds, and "it works for me" is true and useless.
 *
 * So a world's page and its scripts are served with a `Cache-Control` that
 * makes a browser ask before it uses a copy it kept: `no-cache`, or
 * `max-age=0` with `must-revalidate`, or `no-store`. Asking is cheap (a
 * browser that has the latest is told so in a few bytes). A file whose name
 * changes whenever its contents do (one with a hash in it) may be kept for
 * good: it is never the stale one.
 * (protocol/09-what-a-world-owes.md, "Always the latest".)
 */
/**
 * Whether something served with this `Cache-Control` is asked for again each time it is used. False for a header
 * that lets a browser keep using its copy without asking, and for none at all: with none, a browser guesses, and
 * its guess can be days.
 */
export declare function servedFresh(cacheControl: string | null | undefined): boolean;
/** The header a world's page and scripts are served with, for a host that is told what to send. */
export declare const FRESH_HEADER = "no-cache";
