/**
 * A world shown inside its visitor's client (protocol/02-doors.md, "A client that keeps the screen").
 *
 * A client can keep one page on the screen and show each world in a frame inside it, so a filled screen isn't
 * given up at every door. The world in the frame is then not given the screen to fill (a frame that filled it
 * would take the client's with it when it left): the client holds it. So the world asks the client, in a few
 * words passed between the two pages, and the visitor's own control for it works as it does anywhere.
 *
 * What is said, and all that is said:
 *
 * - the world, as it loads: `{ nswp: "here", at }`, where `at` is its own path. So the client knows the place in
 *   its frame came up (and can go to it the ordinary way if it didn't), and where to come back to.
 * - the client, in answer and whenever it changes: `{ nswp: "screen", holds: true, filled }`.
 * - the world, at the visitor's press: `{ nswp: "screen", fill }`. A browser fills a screen only on a press, and a
 *   press in a frame counts for the page that holds it.
 *
 * And, where the client can show the sign-in address's own panel over the world, so that signing in doesn't take a
 * window either (which would give up the screen):
 *
 * - the client says so in the same answer: `signIn`, the sign-in address the panel is for.
 * - the world, at the visitor's press: `{ nswp: "sign-in", mode, menu? }`. `mode` is what the panel is for ("ask":
 *   let this world sign; "switch": another account; "account": the account's own pages; "files": their own
 *   files; "wallet": their own wallet; "library": what they have bought). `menu` is where the
 *   world's menu is on the screen, so the panel can be drawn in its place.
 * - the client, as the panel comes and goes: `{ nswp: "sign-in", open }`, with `failed` if it never came up, and
 *   `allowed` as it goes if the sign-in address said the visitor allowed this world.
 *
 * The panel is the sign-in address's page, drawn by the client above the world: this page can't see into it or
 * touch it. Whether the visitor said yes is learned from the world's own signer, as it always was.
 *
 * Nothing about the visitor is in any of it. Words are taken only from the page directly above this one, which a
 * world's own rules have already said may frame it (`frame-ancestors`).
 */
/** Whether this page is inside another. */
export declare const framed: () => boolean;
/** What a panel can be asked for. */
export type ClientPanelMode = "ask" | "switch" | "account" | "files" | "wallet" | "library";
/** Where the world's menu is on the screen, in CSS pixels: its left edge, its width, and how far its foot is from the bottom. */
export interface MenuPlace {
    left: number;
    width: number;
    bottom: number;
}
/** For the menu: say where it is, when asked, so a panel can be drawn in its place. */
export declare function setMenuPlace(fn: (() => MenuPlace | null) | null): void;
/** Whether the page above this one has said it holds the screen. False for a world opened as a page of its own. */
export declare const clientHoldsScreen: () => boolean;
/** Whether it has the screen filled just now. */
export declare const clientScreenFilled: () => boolean;
/** Be told when either changes. */
export declare function onClientScreen(fn: () => void): () => void;
/** Ask the client to fill the screen, or to give it back. Call it from the visitor's own press. */
export declare function askClientForScreen(fill: boolean): void;
/** The sign-in address the client above shows a panel for (its origin), or null: then signing in takes a window. */
export declare const clientSignsInAt: () => string | null;
/** Whether that panel is up just now. */
export declare const clientPanelOpen: () => boolean;
/**
 * Be told when the panel comes and goes; whether it failed to come up at all; and, as it goes, whether the sign-in
 * address said the visitor allowed this world. That last is a hint for not waiting on a "no": what is really so
 * is asked of the world's own signer.
 */
export declare function onClientSignIn(fn: (open: boolean, failed: boolean, allowed: boolean) => void): () => void;
/**
 * Ask the client to show the sign-in address's panel. Call it from the visitor's own press: a client shows it for
 * nothing else. False where the client has no panel to show.
 */
export declare function askClientForSignIn(mode?: ClientPanelMode): boolean;
/**
 * Say this place has come up, and listen for what the client says of the screen. Once a page; does nothing for a
 * world opened as a page of its own.
 */
export declare function meetClient(): void;
/** For tests: forget who was met. */
export declare function resetClientFrame(): void;
