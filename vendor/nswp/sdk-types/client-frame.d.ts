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
 * Nothing about the visitor is in any of it. Words are taken only from the page directly above this one, which a
 * world's own rules have already said may frame it (`frame-ancestors`).
 */
/** Whether this page is inside another. */
export declare const framed: () => boolean;
/** Whether the page above this one has said it holds the screen. False for a world opened as a page of its own. */
export declare const clientHoldsScreen: () => boolean;
/** Whether it has the screen filled just now. */
export declare const clientScreenFilled: () => boolean;
/** Be told when either changes. */
export declare function onClientScreen(fn: () => void): () => void;
/** Ask the client to fill the screen, or to give it back. Call it from the visitor's own press. */
export declare function askClientForScreen(fill: boolean): void;
/**
 * Say this place has come up, and listen for what the client says of the screen. Once a page; does nothing for a
 * world opened as a page of its own.
 */
export declare function meetClient(): void;
/** For tests: forget who was met. */
export declare function resetClientFrame(): void;
