import type { Controls, UiAction } from "./ui/model.js";
/**
 * The rows, by id, that are the visitor's own in a tab a world otherwise fills, and so are never in a world's
 * description: the switches here, how wide they see (desk.ts, `fov`, under View), and in Sound the volumes, the
 * hum's switch and the visitor's own music (sound.ts).
 */
export declare const VISITOR_SWITCHES: readonly string[];
/**
 * Whether a row is the visitor's own, by its id: one of the switches above, anything of their own music (`juke-`),
 * or one of their songs (`song-`, a row for each, whose words are the song's name). A world never describes these
 * to a client: what a visitor listens to is not a world's to say.
 */
export declare const visitorsOwnRow: (id: string) => boolean;
/** Whether this visitor sees pictures at all. It is theirs, and goes with them from world to world. */
export declare const picturesSwitch: (controls: Pick<Controls, "say">) => UiAction;
/** Whether this visitor sees people's own models, where a world draws them. Theirs, and it travels. */
export declare const modelsSwitch: (controls: Pick<Controls, "say">) => UiAction;
/** Whether this visitor sees what people write in a room, and may write. `tell` says the words for a moment. */
export declare const chatSwitch: (tell: (text: string) => void) => UiAction;
/** For tests: forget the choice, so it is read afresh. */
export declare function forgetDeskMoving(): void;
/**
 * How they move at a desk, casual or intense, for a page that draws the menu but moves nobody: a client's page,
 * above a world. It holds the visitor's choice here, kept as a world keeps it, and says it with their other
 * settings; the world in the frame takes it at once and moves them that way (fps.ts). The same row, by the same
 * words, as a world draws for itself. Not offered where there is no mouse, or in a headset.
 */
export declare function deskMovingSwitch(controls: Pick<Controls, "say">, o?: {
    presenting?: () => boolean;
}): UiAction;
/**
 * The one-time question, "how you move at a desk": casual or intense, asked once and kept (the owner, 2026-11-21:
 * "the first time someone enters the game in 2D desktop mode. Casual or intense."). Whoever draws the console
 * asks. Above a world that is the visitor's client, so this is the question in a form a client's page runs: the
 * same tab, rows and words as a world asks with (fps.ts), with the answer kept here as their travelling setting and
 * said to every world. A world whose client has the menu doesn't ask.
 *
 * Asked a moment after the page is up, the first time a visitor is at a desk with a mouse and has no choice said
 * or kept. Put away without an answer, it is casual, and that is an answer. Never asked on a phone, in a headset
 * (the world draws the console there, and asks its own question), or of a browser driven by a script unless the
 * page's address says `?ask=moving`. Returns how to stop.
 */
export declare function askDeskMoving(controls: Controls, o?: {
    presenting?: () => boolean;
    after?: number;
}): () => void;
