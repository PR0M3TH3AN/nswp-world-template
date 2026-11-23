import { type WorldPort } from "./port.js";
import type { Controls } from "./model.js";
export interface Hud {
    /** The element on the page. */
    element: HTMLElement;
    readonly open: boolean;
    /** Bring the menu up or put it away. `at` names the section to bring it up on. */
    setOpen(open: boolean, at?: string): void;
    /** Whether the chat panel is open to write in. */
    readonly chatOpen: boolean;
    /** Which of its two sides the panel is on: what the room writes, or the visitor's own public feed. */
    readonly chatTab: "room" | "feed" | "letters";
    /**
     * Open the panel to write in, or put it away. `tab` says which side: the room's chat, which opens only where
     * there is a room to write to, or "feed", the visitor's own public posts, which opens only once something
     * signs for them. Left out, the side it was on.
     */
    setChatOpen(open: boolean, tab?: "room" | "feed" | "letters"): void;
    /** How much of the top and bottom of the window the HUD covers, in pixels. For placing a scene's picture clear of it. Nothing when it is quiet or hidden. */
    cover(): {
        top: number;
        bottom: number;
    };
    /** Where each visible part of the HUD is, so a world can lay its own interface out around it. */
    bounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    }[];
    /** Hide it all (in a headset session, where the page can't be seen anyway) or show it again. */
    setHidden(hidden: boolean): void;
    /**
     * Do what one of the visitor's few keys does, by its name: "summon", "escape", "menu" or a digit "1" to "9". For a
     * client's menu, drawn above a framed world: while the world has the keyboard this page hears no key, and the
     * world says the key's name (protocol/02-doors.md, "The client has the menu").
     */
    pressKey(key: string): void;
    remove(): void;
}
/**
 * The visitor's menu, drawn from a world's port and from nothing else (ui/port.ts; docs/plans/the-clients-menu.md).
 * The port is all it is given of the world: what to draw comes as `view()`, and a press goes back as an id. So the
 * same menu can be given a port carried some other way (by words, from a page above the world) and not know it.
 */
export interface MenuMountOptions {
    parent?: HTMLElement;
    /**
     * Draw the chat's pane and nothing else: no bar, no mark, no sheet, no words for a moment, and no key but the
     * chat's own. For a world whose client above has the menu (protocol/02-doors.md, "The client has the menu"): until
     * a client runs the room's chat, messages and posts itself, the world keeps that one pane, in its own frame, opened
     * from a row it describes. Its colour is the world's, as the client's menu's is the visitor's.
     */
    only?: "chat";
}
export declare function mountMenu(port: WorldPort, opts?: MenuMountOptions): Hud;
/**
 * The menu over a world's own controls: the direct carrier, which is what a world with no client above it has.
 * `mountMenu(portHere(controls))`, under the name it has always had.
 */
export declare function mountHud(controls: Controls, opts?: {
    parent?: HTMLElement;
}): Hud;
