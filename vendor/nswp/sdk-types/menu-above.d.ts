/**
 * The world's end of the menu's port, where a client above has the menu (protocol/02-doors.md, "The client has the
 * menu"; docs/plans/the-clients-menu.md).
 *
 * A world shown in its client's frame says in its `here` that it speaks the menu's words. If the client answers that
 * it has the menu, this page draws no console: it says upward what it is called, the tabs it fills and the state of
 * the things only it can run, and takes back the visitor's presses, their settings, and that the menu came up or
 * went. If nothing is said in time, the world draws its own menu as it always has (ui/hud.ts).
 *
 * **Loading this file is saying so.** It tells the page's `here` to carry `menu`, as it loads, so it must be
 * imported with the page's first files (a plain `import`, never `await import()`), and by a world that will keep
 * its word: once `portAbove` reports that the client has the menu, the world mounts none.
 *
 * This file is not the menu and doesn't load it. It is small, and is what lets a framed world never fetch the menu.
 */
import { type MenuState } from "@nswp/core";
import type { Controls, UiView } from "./ui/model.js";
export { helpWords } from "./ui/help.js";
export { keepMenu, type KeptMenu } from "./menu-keeper.js";
export interface MenuAbove {
    /** Whether a client above has the menu, once that is known: at its answer, or with none in `MENU_WAIT_MS`. */
    readonly ready: Promise<boolean>;
    /** Whether it has the menu now. */
    readonly has: boolean;
    /** Be told when that changes: a client that answered late, or stopped. Returns how to stop. */
    onChange(fn: (has: boolean) => void): () => void;
    /**
     * The client's menu, as far as a world's own parts need it: whether it is up, and a way to ask for it to come up
     * or go, as the visitor's own summons does. For the part that looks round with the mouse: when the browser takes
     * the pointer back at Escape the world hears no key, and asks for the menu here.
     */
    readonly menu: {
        readonly open: boolean;
        setOpen(open: boolean): void;
    };
    /** Stop: nothing more is said upward or taken from above. */
    dispose(): void;
}
export interface MenuAboveOptions {
    /** The things every place has and only the world can run, as they are now. What is left out is not so. */
    state?: () => Partial<MenuState>;
    /**
     * What the world says of itself in Help: a sentence or two on what the place is for. The client's own help (how
     * to move, how to bring the controls up) comes first there, and this is a note after it, under the world's name.
     * Left out, or over the limit on a note, a world says nothing in Help.
     */
    help?: () => string;
    /**
     * Sign the visitor out of this world: lock whatever signs for them here and forget their name. Their client's own
     * row was pressed. It is done without asking, and it can only take away: there is no word for signing in.
     */
    signOut?: () => void;
    /** Leave for home, carrying what the visitor carries: the client's Home was pressed. */
    home?: () => void;
    /** For tests and other carriers: the page above. By default the one this page is framed by (client-frame.ts). */
    above?: {
        framed(): boolean;
        sinceHere(): number | null;
        say(word: Record<string, unknown>): void;
        hear(fn: ((word: unknown) => void) | null): void;
    };
    /** For tests: where the visitor's keys are heard. By default this page's window. */
    keys?: Pick<Window, "addEventListener" | "removeEventListener">;
    /**
     * For tests: how a picture is made ready to cross to the page above, from what the world's own menu would have
     * drawn (a canvas, an image) or from the address of someone's picture. By default a bitmap of at most
     * `MENU_LIMITS.picture` a side; the address is fetched by the kit's own `loadPicture`, in this page.
     */
    picture?: (from: CanvasImageSource | string) => Promise<unknown>;
}
/**
 * What a world says of itself, from what its own menu would have drawn. Only the tabs that are the world's to fill
 * are in it: nothing of the visitor's own tabs is ever said upward.
 */
export declare function describeWorld(view: UiView, state?: Partial<MenuState>, help?: string): Record<string, unknown>;
/**
 * Meet the client above, for a world's controls. Call it once, as the world starts and before any menu is mounted;
 * then mount the world's own menu only if `ready` says no client has it, and put it away if `onChange` says one
 * now does.
 */
export declare function portAbove(controls: Controls, opts?: MenuAboveOptions): MenuAbove;
