/**
 * The client's end of the menu's port, where the client has the menu (protocol/02-doors.md, "The client has the
 * menu"; docs/plans/the-clients-menu.md).
 *
 * A client that keeps the screen shows a world in a frame and draws the visitor's menu above it, from its own copy of
 * the kit. This is what the menu is mounted on there: the client's own controls (the visitor's own tabs, the way
 * home), with the tabs the world describes laid in among them, and the words between the two pages carried for it.
 *
 * - A world's `here` that says it speaks the words is answered at once: this page has the menu.
 * - Everything a world says is read by the core's own reader and held to its limits before the menu sees any of it.
 * - A description lasts only as long as the page that sent it: it is dropped at every load of the frame.
 * - A press on something the world described goes down as a word. It is not the visitor's press in the world's
 *   page, so a row that copies is copied here, and a row typed into is typed here.
 * - Words go only to the origin that last said `here`, never to whatever happens to be in the frame.
 *
 * Nothing of the visitor's own tabs is ever said down: only their settings, and their presses on the world's rows.
 */
import { type MenuSaveType, type MenuSettings, type MenuWorld, type TravelSettings } from "@nswp/core";
import { type Controls, type UiAction, type UiView } from "./model.js";
import type { WorldPort } from "./port.js";
/** Before the id of everything that is the world's, in what the menu draws: so a world's id can never be one of the client's own. */
export declare const WORLDS = "world:";
/**
 * What the client's menu draws over a world: the client's own view, with what the world described laid in.
 *
 * - The world's name and address head it; how much room the console takes, and whether the keys are the world's,
 *   are the world's to say.
 * - A tab every place has keeps the client's name and icon for it, and the client's rows come first in it.
 * - A tab of the world's own stands after every other, and carries the world's name.
 * - The bar is the client's keys, then the world's while there is room; the visitor's pinned tabs follow.
 * - The look is the visitor's own. A world's colour doesn't tint the menu.
 */
export declare function mergeView(base: UiView, world: MenuWorld | null, from: {
    address: string;
    pins: readonly string[];
    pictures?: ReadonlyMap<string, unknown>;
}): UiView;
export interface MenuBelowOptions {
    /** The client's own controls: the visitor's own tabs, and the way home. */
    controls: Controls;
    /**
     * Visitor's tabs this client doesn't yet run itself, and so still takes from a world (the core's
     * `MenuReadOptions.also`). None, for a client that runs them all.
     */
    also?: readonly string[];
    /** The visitor's settings as they are now. By default what this page's own parts of the kit say they are. */
    settings?: () => MenuSettings;
    /**
     * Take the visitor home: send the frame there, whatever the world in it does. `left` is true where the world
     * didn't go by itself in time, so what was in the visitor's hand is not carried.
     */
    home?: (left: boolean) => void;
    /**
     * A world reported settings the visitor changed in its headset session: comfort and layout only, already cleaned
     * (the core's `MENU_REPORTED`), and taken only while the world says its session is running. Left out, they become
     * the visitor's settings in this page (`changeSettings`), and so are said to the next world. A client that keeps
     * the visitor's settings somewhere of its own takes them here.
     */
    onReported?: (settings: TravelSettings) => void;
    /** Whether something a world sent as a picture may be kept. By default a bitmap within the limit on its size. */
    picture?: (value: unknown) => boolean;
    /**
     * A world handed up a picture or a clip to be saved, as the answer to the visitor's press on a row that saves:
     * already checked for its kind and size, and named by this page (the world's name, the date and time, an ending
     * from its kind). Left out, this page saves it to the device as a download. A client that keeps the visitor's
     * files somewhere of its own takes it here instead. Either way the visitor is told, for a moment, what was saved
     * and from which world; return words of the client's own to say those instead.
     */
    onSave?: (file: Blob, about: SavedAbout) => string | void;
    /**
     * The frame's first page had already finished loading when this was made. Say so if it may have: a `here` is
     * told apart from the next page's by whether a load is still waiting for one (below).
     */
    loaded?: boolean;
    /** For tests: where words from the frame are heard. By default this page's window. */
    hear?: {
        addEventListener(type: "message", fn: (e: MessageEvent) => void): void;
        removeEventListener(type: "message", fn: (e: MessageEvent) => void): void;
    };
    /** For tests: this page's own origin. */
    origin?: string;
    /** For tests: the time, in milliseconds. */
    now?: () => number;
}
/** What a client is told of something a world handed up to be saved. */
export interface SavedAbout {
    /** The name this page gave it. A world never names a file on the visitor's device. */
    name: string;
    /** The world it came from: its title, or its address where it has none. */
    world: string;
    kind: "picture" | "clip";
    type: MenuSaveType;
}
export interface MenuBelow {
    /** What the menu is mounted on: `mountMenu(below.port)`. */
    readonly port: WorldPort;
    /** The origin of the page that last said `here`, or "" before any has since the frame last loaded. */
    readonly origin: string;
    /** Whether that page speaks the menu's words. A client draws no menu over one that doesn't: it draws its own. */
    readonly speaks: boolean;
    /** What the world last described, as it was kept, or null. */
    readonly world: MenuWorld | null;
    /** Be told when any of those change. Returns how to stop. */
    onChange(fn: () => void): () => void;
    /** The menu that was mounted, so that the keys a world forwards act on it. */
    attach(menu: {
        pressKey(key: string): void;
    } | null): void;
    /** The visitor's own Home was pressed: the world is told, and they are taken home within `LEAVE_MS` whatever it does. */
    leave(): void;
    /**
     * The visitor's own "Sign out here" was pressed: the world is told to sign them out. It can only take away, and
     * the world does it without asking. Whether it did is read from `world.state.named`.
     */
    signOut(): void;
    /**
     * The visitor took something up in this menu's Bag, or put what they held away (`""`): the world is told. It
     * takes a thing in hand only if it is in their own bag as they signed it, and where it lets things be carried,
     * so this waits for the world to say what is in hand (`world.state.holding`) and resolves whether it is this.
     *
     * `script` is the mark of the item's own logic (its SHA-256), said only where the visitor has let that logic run,
     * in this menu: a thing that does things of its own is asked about before it is first held, and that asking is
     * the Bag's own, here. A world lets a thing's logic run unasked only for the very script named.
     */
    hold(item: string, how?: {
        tints?: Record<string, string>;
        script?: string;
    }): Promise<boolean>;
    dispose(): void;
}
/** The client's end of the port, for the frame the world is shown in. */
export declare function portBelow(frame: HTMLIFrameElement, opts: MenuBelowOptions): MenuBelow;
/**
 * The client's own rows, under You, for signing in to the world in the frame and out of it. You is the visitor's
 * own tab, and a world never puts a row in it: a sign-in row under a world's name, naming a host, is exactly what a
 * visitor should never be taught to trust. So the world says only facts (`state.named`, `state.signIn`), and these
 * words are the menu's own, the same in every client.
 *
 * - Signing in opens the sign-in address's own panel for the world in the frame, which is the client's to do
 *   (`ask`): a world's word can't open it.
 * - Signing out tells the world, which does it without asking (`below.signOut`).
 * - Where the world names nothing that signs for a visitor, neither row is shown.
 */
export declare function signInRows(below: Pick<MenuBelow, "world" | "signOut">, opts: {
    ask(): void;
}): UiAction[];
