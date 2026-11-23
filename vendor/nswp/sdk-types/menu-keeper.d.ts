/**
 * One menu, never two: who draws the visitor's menu for a world, kept in one place
 * (docs/plans/the-clients-menu.md, section 6; protocol/02-doors.md, "The client has the menu").
 *
 * A world asks the page above whether it has the menu (`portAbove`). This keeps to the answer, however the answer
 * and the world's own loading fall:
 *
 * - **Nobody above has it:** the world's own menu is mounted.
 * - **The client has it:** the world draws none. Until a client runs the room's chat, messages and posts itself,
 *   the world keeps that one pane, mounted only once there is something to write to.
 * - **The answer changes** (a client that answered late, or stopped): what was mounted is put away and the other
 *   takes its place.
 * - **The world's own menu arrives late.** Where the menu is a file fetched when it is needed, a client can answer
 *   while it is on its way. So who has the menu is asked again each time a mount finishes, and a menu that arrives
 *   for a world whose client now has one is put away before it is seen. (Asked only before the fetch, a world drew
 *   its menu over the client's: found by a trial on a busy machine, 2026-11-23.)
 *
 * This file is not the menu and doesn't load it: whoever uses it says how a menu is mounted (`mount`), which for a
 * world that fetches its menu when needed is where the fetching is.
 */
import type { MenuAbove } from "./menu-above.js";
import type { Hud } from "./ui/hud.js";
import type { Controls } from "./ui/model.js";
export interface KeptMenu {
    /** Whether the menu is up, whoever draws it. */
    readonly open: boolean;
    /** Bring the menu up or put it away, whoever draws it. `at` names a tab, where the world's own menu is the one. */
    setOpen(open: boolean, at?: string): void;
    /** Hide whatever this page draws (in a headset session, where the page can't be seen), or show it again. */
    setHidden(hidden: boolean): void;
    /** The world's own menu, where that is what is drawn. Null where the client has the menu, or none is up yet. */
    readonly own: Hud | null;
    /** Whether this page is drawing the chat's pane by itself, its client having the rest of the menu. */
    readonly chatPane: boolean;
    /** Done once it is known who has the menu and, where it is the world, the world's own is up. */
    readonly ready: Promise<void>;
    /** Put away whatever this page draws, and stop keeping. */
    remove(): void;
}
/**
 * Keep one menu for these controls. `mount` makes the world's own menu, or with `"chat"` the chat's pane alone, and
 * may take its time (fetching the menu's file).
 */
export declare function keepMenu(controls: Controls, above: MenuAbove, mount: (only?: "chat") => Hud | Promise<Hud>): KeptMenu;
