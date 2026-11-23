/**
 * The world's port: the only way the visitor's menu learns anything of a world, or does anything in it
 * (docs/plans/the-clients-menu.md, "One menu, two places it runs").
 *
 * The menu (ui/hud.ts, `mountMenu`) is given a port and nothing else. Today there is one carrier for it:
 *
 * - **Direct** (`portHere`): the menu runs in the world's own page and the port's calls are the world's own
 *   controls'. This is what every world does, and is the fallback wherever no client above has the menu.
 *
 * The next step adds a second, where the menu runs in the client's page above a framed world and the same port is
 * carried by words between the two pages (protocol/02-doors.md, "A client that keeps the screen"). The menu can't
 * tell which it has, so the two can't drift apart.
 *
 * So the port is kept narrow on purpose, and nothing reaches the menu round it: `portHere` hands over an object with
 * these members and no others, never the controls themselves. Each member is either already plain data and ids
 * (ready to be said in words), or marked below as not yet.
 */
import type { UiChat } from "./chat.js";
import type { UiFeed } from "./feed.js";
import type { UiLetters } from "./letters.js";
import type { Controls, Presence, UiView } from "./model.js";
import type { UiTheme } from "./theme.js";
export interface WorldPort {
    /**
     * Everything to draw, with every word already worked out. Plain data, but for two things that are still asked for
     * as they are drawn and will cross as pictures: a tile's `picture`, and a card's `draw`.
     */
    view(): UiView;
    /** Be told when what `view()` gives may have changed. Returns how to stop. */
    subscribe(fn: () => void): () => void;
    /**
     * The visitor pressed something, by its id, with what they typed if it is a row typed into, or the file they
     * chose if it is a row that takes one. False if there is no such thing just now.
     */
    run(id: string, typed?: string, file?: Blob): boolean;
    /** Words from the menu itself, shown for a moment ("Your bar is full"). */
    say(text: string): void;
    /** Words to show for a moment, from the world or the menu. */
    onSay(fn: (text: string) => void): () => void;
    /** The menu says something happened: it came up or went (`menuOpen`, `menuClose`), the chat did, a press was made. */
    signal(name: string): void;
    /** The world asks something of the menu by name (to open on a tab, to look again). */
    onSignal(fn: (name: string) => void): () => void;
    /** The visitor pins a tab to their bar, or takes it off. False where it couldn't be (the bar is full). */
    setPinned(tab: string, pinned: boolean): boolean;
    /** How much room the world gives the menu just now. */
    readonly presence: Presence;
    /** How the menu looks: the visitor's own choices over the world's colour. */
    readonly theme: UiTheme;
    /** What the room writes, the visitor's own posts, and their private messages. Not yet words: models with calls of their own. */
    readonly chat: UiChat;
    readonly feed: UiFeed;
    readonly letters: UiLetters;
}
/** The direct carrier: a world's own controls, as a port. Exactly the port's members, and nothing else of the controls. */
export declare function portHere(controls: Controls): WorldPort;
