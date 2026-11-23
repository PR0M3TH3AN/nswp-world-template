/**
 * The client has the menu: the words between a world in a frame and the page above it that draws the visitor's
 * console (protocol/02-doors.md, "The client has the menu"; docs/plans/the-clients-menu.md).
 *
 * A client that keeps the screen can draw the console itself, above the world, so that it is the same in every
 * world. The world's own console steps aside and says a few words upward: what it is called, the tabs it fills,
 * and the state of the things only it can run. Presses on those come back down as words.
 *
 * This file is those words as data, and nothing else: what each side may say, the limits a client holds a world
 * to, and the reading of whatever arrives. Nothing here draws, sends or listens. Everything a world says is plain
 * data, shown as text; nothing in it is ever run. What is over a limit is left out, never cut to fit.
 *
 * Both sides read with these functions, so a world and a client built from different copies of the kit agree on
 * what a word means. The examples are `vectors/menu-words.json`.
 */
import { type ItemsRule } from "./constants.js";
import { type TravelSettings } from "./settings.js";
/** The version of these words this code speaks: what a world says as `menu` in its `here`, and a client as `v`. */
export declare const MENU_VERSION = 1;
/** What a client holds a world to, whatever it sends. */
export declare const MENU_LIMITS: {
    /** Tabs in one description. */
    readonly sections: 12;
    /** Rows in one tab. */
    readonly rows: 60;
    /** Rows in all. */
    readonly allRows: 200;
    /** Characters in a row's label, and in any other short line. */
    readonly label: 120;
    /** Pixels a side, for a picture. */
    readonly picture: 256;
    /** Bytes of description, as JSON, without its pictures. */
    readonly bytes: 65536;
    /** Tabs of its own a world may add. */
    readonly ownTabs: 2;
    /** Characters in words shown for a moment. */
    readonly say: 200;
    /** Characters of text a `copy` row carries. */
    readonly copy: 2000;
    /** Characters typed into a `field` row. */
    readonly field: 500;
    /** Characters in the world's name. */
    readonly title: 80;
    /** Characters in a tab's note, and in what a card says at length. */
    readonly note: 400;
    /** Bytes in a file the visitor chose for a `file` row: 64 MB. */
    readonly file: number;
    /** Characters in that file's own name. A longer name is left out, and the file goes without one. */
    readonly fileName: 255;
    /** Bytes in a picture or a clip a world hands up to be saved: 64 MB. */
    readonly save: number;
    /** How many a world may hand up in answer to one press. */
    readonly saves: 12;
};
/** How long a framed world waits for a client to say it has the menu, before drawing its own. */
export declare const MENU_WAIT_MS = 300;
/** How long a client waits for a world to leave by itself, before taking the visitor home. */
export declare const LEAVE_MS = 1000;
/** How long after a press on a `save` row a client still takes what the world hands up for it. */
export declare const MENU_SAVE_MS = 10000;
/**
 * The visitor's own tabs. A world never fills, reads or presses them, and is never told what is in them.
 * (`figure` is "Your look" and `look` is "Display": the names are the kit's, and travel as pins already.)
 */
export declare const MENU_VISITOR_TABS: readonly ["you", "figure", "bag", "wallet", "files", "following", "messages", "look"];
/**
 * The tabs every place has that a world fills: its room and people, its own doors under Travel, its keeper's list.
 * Several are filled by both: the client's own rows come first in them, and the world's stand below, under the
 * world's name. Sound, Help and Moving are of that kind. The volumes and the visitor's own music are the client's,
 * and a world adds what is its own (the piece it is playing); the client's help comes first, and a world's words
 * about itself are a note after it; how the visitor moves is the client's to switch, and a world adds what it does
 * for them (a jump). Nothing typed goes to a world from any of the three: a `field` row there is left out.
 */
export declare const MENU_WORLD_TABS: readonly ["travel", "room", "people", "camera", "panels", "view", "scores", "achievements", "guests", "sound", "help", "moving"];
/** The few keys that are the visitor's, which a world forwards while it has the keyboard. Never any other. */
export declare const MENU_KEYS: readonly ["summon", "escape", "menu", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
export type MenuKey = (typeof MENU_KEYS)[number];
/**
 * Before a tab's id, for the picture of the card at its head: a card has no id of its own, so its picture is sent
 * as `{ picture, id: "card:people" }`. So that this can never be taken for a row's picture, no row's id may begin
 * with it: a row that does is left out as it is read.
 */
export declare const MENU_CARD_PICTURE = "card:";
/**
 * What kind of row it is. `copy` and `field` are done by the client itself, since the word of a press is not a
 * press in the world's page: `copy` carries text the client writes to the clipboard, and `field` is typed into.
 *
 * `file` and `save` are the two things a browser gives only to the page that was pressed, handed across instead.
 * A `file` row has the client's page open the browser's chooser and hand the chosen file down with the press. A
 * `save` row's press may be answered by the world handing a picture or a clip up, which the client's page saves.
 */
export declare const MENU_ROW_KINDS: readonly ["button", "swatch", "tile", "line", "copy", "field", "file", "save"];
export type MenuRowKind = (typeof MENU_ROW_KINDS)[number];
/**
 * The kinds of file a `file` row may ask for. A world names some of these and never "any file": the chooser offers
 * only them, and a file of another kind is not handed over. A file's kind is the first part of the type the
 * browser gives it (`image/png` is an `image`).
 */
export declare const MENU_FILE_KINDS: readonly ["image", "video"];
export type MenuFileKind = (typeof MENU_FILE_KINDS)[number];
/** What a world may hand up to be saved: a picture or a clip, of one of these types. Anything else is not read. */
export declare const MENU_SAVE_TYPES: readonly ["image/jpeg", "image/png", "image/webp", "video/webm", "video/mp4"];
export type MenuSaveType = (typeof MENU_SAVE_TYPES)[number];
export interface MenuRow {
    id: string;
    label: string;
    /** A word or two for where there is little room. */
    short?: string;
    /** A name from the console's own set of icons. A client leaves out a name it has no icon for. */
    icon?: string;
    kind: MenuRowKind;
    /** Whether it is so, for a row that is on or off. */
    on?: boolean;
    tone?: "primary" | "warn";
    /** A colour, as `#rrggbb`. */
    color?: string;
    /** A tile's small icon in its corner. */
    mark?: string;
    /** A tile drawn greyed, and still pressable. */
    faint?: true;
    /** The world would have it on the bar. */
    bar?: true;
    /** For a `copy` row: the text. */
    copy?: string;
    /** For a `file` row: the kinds of file it takes. */
    accept?: MenuFileKind[];
    /** A small picture, as whatever the caller's own check let through (a bitmap, in a browser). */
    picture?: unknown;
}
/** A card at the head of a tab: who, or what, the tab is about just now. Every word on it is plain text. */
export interface MenuCard {
    title: string;
    tag?: string;
    /** The mark for a name their own client vouched for. Only ever kept from a page of the client's own origin. */
    proven?: true;
    sub?: string;
    /** Text to copy from it (a key in full). */
    copy?: string;
    text?: string;
    color?: string;
    /** What is so about them now, a line each. */
    now?: string[];
    /** Which of the tab's rows are about this card, by id. */
    acts?: string[];
    picture?: unknown;
}
export interface MenuSection {
    id: string;
    /** For a world's own tab only: its name. The tabs every place has are named by the client. */
    label?: string;
    icon?: string;
    note?: string;
    card?: MenuCard;
    rows: MenuRow[];
}
/**
 * Where a world's own way of signing in stands, as a fact. The client words its own row from it ("Sign in",
 * "Asking again…", "It didn't answer"): a world never supplies those words, and never puts a row in You.
 *
 * - `none`: this world names nothing that signs for a visitor. There is no signing in here.
 * - `ready`: it can be asked, or has answered.
 * - `asking`: asked, and waiting on the visitor's sign-in address.
 * - `unanswered`: the sign-in address didn't answer.
 */
export declare const MENU_SIGN_IN: readonly ["none", "ready", "asking", "unanswered"];
export type MenuSignIn = (typeof MENU_SIGN_IN)[number];
/** The things every place has and only the world can run. */
export interface MenuState {
    room: {
        has: boolean;
        joined: boolean;
        mic: boolean | null;
        count: number;
    };
    headset: {
        supported: boolean;
        presenting: boolean;
    };
    /** Whether this world has the visitor's name. */
    named: boolean;
    /** Where the world's own way of signing in stands (`MENU_SIGN_IN`). */
    signIn: MenuSignIn;
    /** The address of what is in their hand, or "". */
    holding: string;
    /** The world's rule for items. */
    items: ItemsRule;
    /** Whether the place has a hum under its music: the visitor's own switch for it is shown only where it does. */
    hum: boolean;
}
/** A world's description of itself, as a client keeps it after reading. */
export interface MenuWorld {
    title: string;
    level: "full" | "quiet" | "hidden";
    corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    /** False while the world has taken every key. */
    keys: boolean;
    state: MenuState;
    /** What is pointed at: its name, then a few more lines about it. Empty for nothing. */
    target: string[];
    loading: {
        fraction: number | null;
        words: string;
    } | null;
    sections: MenuSection[];
}
export interface MenuReadOptions {
    /**
     * The page is of the client's own origin, exactly (its own room, its Airlock). Such a page may fill any tab, add
     * any number of its own, and put a `field` row anywhere. This is a client's rule about itself.
     */
    own?: boolean;
    /**
     * Visitor's tabs this client does not yet run itself, and so still takes from a world. A `field` row may stand
     * in one. Empty in a client that runs them all, which is what the protocol describes.
     */
    also?: readonly string[];
    /** Whether something sent as a picture may be kept: the caller's own check of its kind and size. No check, no pictures. */
    picture?: (value: unknown) => boolean;
}
/** The kind of a file, by the type the browser gives it (`image/png` is an `image`): one a row may ask for, or null. */
export declare function menuFileKind(type: unknown): MenuFileKind | null;
/**
 * A file's own name as it may go with the file: one line of plain text, `MENU_LIMITS.fileName` characters at most.
 * Undefined for anything else, and the file then goes without a name. Never cut to fit.
 */
export declare function menuFileName(name: unknown): string | undefined;
/**
 * The type of something handed up to be saved, without what follows a `;` (a recorder adds how it packed a clip):
 * one of `MENU_SAVE_TYPES`, or null.
 */
export declare function menuSaveType(type: unknown): MenuSaveType | null;
/**
 * A world's description as a client keeps it: everything unknown, over a limit or not the world's to say left
 * out. Null if it isn't a description at all, or is over the limit on its size once read. Never throws.
 *
 * The work done is bounded whatever is sent: only the first tabs and rows up to the limits are looked at.
 */
export declare function cleanMenuWorld(input: unknown, opts?: MenuReadOptions): MenuWorld | null;
/** How big a description is, as the limit counts it: the bytes of its JSON, as UTF-8, without its pictures. */
export declare function menuBytes(world: MenuWorld): number;
/**
 * The visitor's settings as a client says them to a world: the settings that travel (settings.ts), and nothing a
 * link couldn't carry.
 *
 * "Load people's files from anywhere" is not among them. It is turned on by the visitor's own press for the one
 * place they are in, and that place keeps it: where a client draws the menu the row is still the world's, pressed
 * through the client. So nothing above a world can turn it on, and `filesAnywhere: true` from a client is dropped
 * exactly as a link's is. (`false` is still taken: turning it off is always safe.)
 */
export type MenuSettings = TravelSettings;
/** Settings as a client said them, cleaned as a link's are. Never throws. */
export declare function cleanMenuSettings(input: unknown): MenuSettings;
/**
 * The settings a world may report back, by name: comfort and layout, and nothing else. A world's report can never
 * turn a privacy switch on, or change who the visitor is, what they hold or what they see of other people.
 */
export declare const MENU_REPORTED: readonly ["headset", "intense", "turn", "hand", "narrow", "fade", "look", "fov", "wrist", "sound", "motion", "text", "tabs", "pins"];
/** What a client takes from the settings a world reported: the ones named in `MENU_REPORTED`, cleaned. Never throws. */
export declare function reportedSettings(input: unknown): TravelSettings;
/** What a client may say to a world. */
export type MenuWordDown = {
    what: "has";
    has: true;
    v: number;
    settings: MenuSettings;
} | {
    what: "has";
    has: false;
} | {
    what: "settings";
    settings: MenuSettings;
} | {
    what: "press";
    press: string;
    field?: string;
    file?: undefined;
} | {
    what: "press";
    press: string;
    file: Blob;
    kind: MenuFileKind;
    name?: string;
    field?: undefined;
} | {
    what: "open";
    open: boolean;
} | {
    what: "go";
    go: "home";
} | {
    what: "sign";
    sign: "out";
};
/** What a world may say to a client. */
export type MenuWordUp = {
    what: "world";
    world: MenuWorld;
} | {
    what: "key";
    key: MenuKey;
} | {
    what: "say";
    say: string;
} | {
    what: "settings";
    settings: TravelSettings;
} | {
    what: "picture";
    id: string;
    picture: unknown;
} | {
    what: "save";
    id: string;
    save: Blob;
    type: MenuSaveType;
};
/**
 * A word from the page above, as a world reads it, or null if it is none of these words. One word says one thing:
 * the first of `has`, `settings`, `press`, `open`, `go`, `sign` that is there. A word with anything in it that only a world
 * says is not read at all. Never throws.
 *
 * A `press` is given whatever its id: only the world knows what it last described, and it checks. A press may
 * carry what was typed (`field`) or a file the visitor chose (`file`), never both. A file is given with its kind
 * and, where it has one that may go with it, its name; the world checks the kind against the row it described.
 */
export declare function readMenuWordDown(data: unknown): MenuWordDown | null;
/**
 * A word from the page in the frame, as a client reads it, or null if it is none of these words. One word says one
 * thing: the first of `world`, `key`, `say`, `settings`, `picture`, `save` that is there. A word with anything in
 * it that only a client says is not read at all. Never throws.
 *
 * A `save` is read here for what it is (a picture or a clip, within the limit, for a row by id). Whether it is the
 * answer to a press this client sent, and in time, only the client knows, and it checks.
 */
export declare function readMenuWordUp(data: unknown, opts?: MenuReadOptions): MenuWordUp | null;
/** Whether a `here` says the world speaks these words, and which version of them is spoken with it: the lower. 0 for none. */
export declare function menuVersionOf(here: unknown): number;
