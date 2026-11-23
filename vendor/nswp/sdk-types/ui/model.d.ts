/**
 * The controls a world gives its visitor, as a list of things they can do.
 *
 * A world says what the actions are, once. Two renderers draw them: a HUD on a
 * flat screen (`mountHud`, in `nswp-sdk/ui`) and a console inside a headset
 * (`createConsole`, in `nswp-sdk/three`). They look nothing alike, and they
 * always offer the same things, because neither holds any of the logic.
 *
 *   const controls = createControls({ title: "My world", address: "example.org" });
 *   controls.add({ id: "home", section: "travel", label: "Go home", icon: "home", hotbar: true, act: () => portal.home() });
 *
 * Adding a button, a section, or a whole new kind of control later means
 * adding to this list. Nothing about either renderer has to change.
 */
import { type MenuFileKind } from "@nswp/core";
import { type ChatView, type UiChat } from "./chat.js";
import { type FeedView, type UiFeed } from "./feed.js";
import { type LettersView, type UiLetters } from "./letters.js";
import type { IconName } from "./icons.js";
import { DEFAULT_THEME, type UiTheme } from "./theme.js";
type Text = string | (() => string);
export interface UiAction {
    id: string;
    /** What it says. A function is read again as things change, so the words follow what they describe. */
    label: Text;
    /** A function is read again as things change, like the label. */
    icon?: IconName | (() => IconName);
    /** Which group it belongs to. Sections the kit doesn't know are added after the ones it does. */
    section?: string;
    /**
     * What a press does. For a row the visitor types into (`kind: "field"`) it is given what they typed, at their
     * press and not before. Where the menu has no box to type in (a headset's console draws the row as a button),
     * it is given nothing, and asks for the text its own way. For a row that takes a file (`kind: "file"`) it is
     * given the file the visitor chose, second, and nothing first; where the menu can show no chooser, nothing at all.
     */
    act(typed?: string, file?: Blob): void | Promise<void>;
    /** Leave it out while this returns true. */
    hidden?: () => boolean;
    /** For something that is on or off: whether it is on now. */
    on?: () => boolean;
    tone?: "normal" | "primary" | "warn";
    /** A tile's small icon in its corner, saying something about the thing at a glance (the bag's: it is in your bag). */
    mark?: IconName | (() => IconName | null);
    /** A tile drawn greyed: not the visitor's yet (offered here). Still pressable: grey is never "unavailable". */
    faint?: () => boolean;
    /** Put it in the row of things always at hand. Keep that row to six. */
    hotbar?: boolean;
    /**
     * Put it at the front of that row, ahead of what is always there: for what the visitor is doing right now with
     * the thing in their hand. So it is never one of those left off a narrow screen, and its key is 1 or 2.
     */
    lead?: boolean;
    /** A word or two for where there is little room, such as under a hotbar key. */
    short?: Text;
    /**
     * What kind of control it is. Each kind is drawn by one small function in
     * each renderer, so a new kind is added there and nowhere else.
     * "swatch" is a choice of colour, and needs `color`. "tile" is a thing with a picture of itself, one of several
     * laid out side by side: it needs `picture`. "line" is something to read and not to press: an icon, its words
     * (the whole sentence, in `label`) and whether it is so (`on`). A line never answers a press, is never focused
     * as a button and never goes on the hotbar; its `act` is never called. "copy" is a button that copies its `copy`
     * for the visitor. "field" is typed into: a box, and a button with the label, whose press gives `act` the text.
     * Whoever draws the menu does both of those itself: where a client above draws it, a press there is not a press
     * in this page, and a browser lets a page copy only at one (protocol/02-doors.md, "The client has the menu").
     * "file" takes a file from the visitor's device: whoever draws the menu opens the browser's chooser at the press,
     * offering only the kinds in `accept`, and gives `act` the file they chose. "save" is a button whose press may end
     * in something to save (`saveFile`): where a client above draws the menu, what is saved goes up to it.
     */
    kind?: "button" | "swatch" | "tile" | "line" | "copy" | "field" | "file" | "save";
    /** For a "copy" row: the text to copy. */
    copy?: Text;
    /** For a "file" row: the kinds of file it takes (the core's `MENU_FILE_KINDS`). */
    accept?: readonly MenuFileKind[];
    /**
     * For a tile: its picture as it is now, or null while there is none (a renderer then shows its first letter).
     * Asked again whenever the menu is drawn.
     */
    picture?: () => CanvasImageSource | null;
    /** A function is read again as things change, for a swatch that shows a choice as it stands. */
    color?: Text;
}
/**
 * A card at the head of a section: who, or what, the section is about just
 * now. The People section shows whoever was chosen. Every word on it is
 * plain text, and what a person wrote about themselves is shown as theirs.
 */
export interface UiCard {
    /** Their name. */
    title: string;
    /** A word for how they are known here: "By name", "Guest". */
    tag: string;
    /** Whether that word is one to trust a little more: a name their own client vouched for. */
    proven: boolean;
    /** One line under the name: the short form of their key, or that nobody vouched for them. */
    sub: string;
    /** Their key in full, to copy, or "". */
    copy: string;
    /** What they wrote about themselves, or "". Their own words, not a fact. */
    text: string;
    /** Where their picture is (for `loadPicture`), or "". */
    picture: string;
    /**
     * Their picture itself, already in hand, where there is no address to fetch it from: a card a framed world
     * described, whose picture crossed to the client's page as a bitmap. A client never fetches an address a world
     * names (protocol/02-doors.md, "The client has the menu").
     */
    face?: CanvasImageSource;
    /** A colour that stands for them where there is no picture, as CSS. */
    color: string;
    /** What is so about them now: recording, sharing their screen. */
    now: string[];
    /**
     * For a card about a thing and not a person: its picture as it is this moment, drawn large and asked for again
     * many times a second, so it may turn. Null while there is none.
     */
    draw?: () => CanvasImageSource | null;
    /**
     * Which of the section's own actions are about this card, by id: what to do with the thing it shows. Where
     * there is room they are drawn inside the card, beside its picture, and not in the list under it. Whatever
     * draws the menu may ignore this and list them as usual.
     */
    acts?: string[];
}
export interface UiSection {
    id: string;
    label: string;
    icon?: IconName;
    /** A card at the head of the section, or null for none. Asked each time the section is drawn. */
    card?: () => UiCard | null;
    /** A few lines shown with the section: what a visitor should know before using it. */
    note?: Text;
}
export interface UiItemView {
    id: string;
    label: string;
    icon: IconName | null;
    on: boolean | null;
    tone: "normal" | "primary" | "warn";
    /** The number key that presses it from the hotbar, or "". */
    key: string;
    short: string;
    kind: "button" | "swatch" | "tile" | "line" | "copy" | "field" | "file" | "save";
    /** For a "copy" row: the text to copy. */
    copy?: string;
    /** For a "file" row: the kinds of file it takes. */
    accept?: readonly MenuFileKind[];
    color: string;
    /** A tile's small icon in its corner, or null. */
    mark: IconName | null;
    /** A tile drawn greyed, and still pressable. */
    faint: boolean;
    /** A tile's picture, asked for as it is drawn. Not part of what is written out as text. */
    picture?: () => CanvasImageSource | null;
    /**
     * Whose row it is, where it isn't the menu's own: the name of the world in the frame, for a row that world
     * described to a client drawing the menu above it. Such rows stand below the client's own in a tab both fill,
     * under this name, so that a world's part is never taken for the client's.
     */
    from?: string;
}
export interface UiSectionView {
    id: string;
    label: string;
    icon: IconName | null;
    note: string;
    card: UiCard | null;
    items: UiItemView[];
    /** The visitor keeps this tab on their bar. */
    pinned: boolean;
    /**
     * What the world in the frame says in this tab, where the menu is its client's: a note of the world's own, shown
     * after the menu's own note and under the world's name. Never in `note`, which is the menu's own words.
     */
    said?: {
        from: string;
        note: string;
    };
}
/** A tab of the menu the visitor keeps on their bar: pressing it brings the menu up on that tab. */
export interface UiPinView {
    /** The tab's id. */
    id: string;
    label: string;
    icon: IconName | null;
    /** The number key that presses it, or "". */
    key: string;
}
/** Everything a renderer needs to draw, with every word already worked out. */
/**
 * How much of the screen the controls take. A world with an interface of its
 * own leads, and these controls stay out of its way (spec §21.3).
 *
 * - "full": the whole HUD, and in a headset the Menu button and the wrist.
 * - "quiet": one small mark in a corner, which opens everything else. In a
 *   headset, the wrist; the Menu button only where no hand is tracked.
 * - "hidden": nothing until the world opens it. For a world that draws these
 *   actions in menus of its own, or for a moment that shouldn't be interrupted.
 */
export type Presence = "full" | "quiet" | "hidden";
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
/** Which keys the HUD answers to. A game needs its keys more than a menu does. */
export interface UiKeys {
    /** The key that opens the menu, or null for none. */
    menu: string | null;
    /** Whether 1 to 6 press the hotbar. */
    hotbar: boolean;
    /** The key that opens the chat panel to write in, or null for none. Enter does too, while this is a key. */
    chat: string | null;
}
/**
 * The world is still loading, though the visitor is in it (`setLoading`): its own words for what, and how far along,
 * from 0 to 1, or null where it can't say.
 */
export interface UiLoading {
    fraction: number | null;
    words: string;
}
export interface UiView {
    title: string;
    address: string;
    target: string;
    /** A few more lines about what is pointed at. */
    detail: string[];
    /** Still loading, though the visitor is in: a line in the HUD and the headset console. Null when it isn't. */
    loading: UiLoading | null;
    presence: Presence;
    corner: Corner;
    keys: UiKeys;
    sections: UiSectionView[];
    hotbar: UiItemView[];
    /** The tabs they keep on the bar, after its own keys, in the order they pinned them. Only tabs this place has. */
    pins: UiPinView[];
    /** They have pinned as many as may be: another can't be until one is taken off. */
    pinsFull: boolean;
    theme: UiTheme;
    /** What the people in the room have written (ui/chat.ts). */
    chat: ChatView;
    /** The visitor's own public posts, and the place to send out another (ui/feed.ts). */
    feed: FeedView;
    /** A private conversation with one person (ui/letters.ts). */
    letters: LettersView;
}
export interface Controls {
    readonly theme: UiTheme;
    add(...actions: UiAction[]): void;
    remove(id: string): void;
    /** Whether there is a control with this id, showing or not. */
    has(id: string): boolean;
    addSection(section: UiSection): void;
    /**
     * Say what the visitor is pointing at, or "" for nothing. `detail` is a
     * few more lines about it: what it is, why it is here, how to use it. On a
     * flat screen they are shown beside the controls, the same size wherever
     * the thing is, so that a world needn't hang a sign in front of it.
     */
    setTarget(text: string, detail?: string[]): void;
    /** A few words shown for a moment. */
    say(text: string): void;
    /**
     * The world is still loading, though the visitor is in it: a slim line in the HUD and the headset console says so,
     * in the world's own words (plain text, at most 80 characters) and with how far along it is (0 to 1) where it can
     * say. Nothing is held up by it: the console, the way home and everything else work throughout. Null ends it.
     */
    setLoading(state: {
        fraction?: number;
        words?: string;
    } | null): void;
    /** Do an action by its id, as pressing it would. Returns false if it isn't there or isn't showing. */
    run(id: string, typed?: string, file?: Blob): boolean;
    /** Change the look. `keep` also remembers it as this visitor's choice, for this site. */
    setTheme(patch: Partial<UiTheme>, keep?: boolean): void;
    readonly presence: Presence;
    /** How much of the screen the controls take. A world can change it as it goes: quiet during play, full in a lobby. */
    setPresence(presence: Presence): void;
    /** Which corner the quiet mark sits in. */
    setCorner(corner: Corner): void;
    /** Which keys the HUD answers to. */
    setKeys(keys: Partial<UiKeys>): void;
    /** The tabs the visitor keeps on their bar, by id, in order. They go with them to the next world (settings.ts). */
    readonly pins: readonly string[];
    /**
     * Pin a tab of the menu to the bar, or take it off. It is the visitor's own doing, from the menu: a world
     * doesn't pin for them. False if it couldn't be: the bar holds `PINS_MOST`, or there is no such tab.
     */
    setPinned(section: string, pinned: boolean): boolean;
    /**
     * Take every key for the world, or give them back. While claimed, the HUD
     * answers to no key at all; its mark can still be clicked. For play that
     * needs the whole keyboard.
     */
    claimInput(claimed: boolean): void;
    view(): UiView;
    /** Be told when something changed: a new action, the theme, the target. Returns how to stop being told. */
    subscribe(fn: () => void): () => void;
    /** Be told when there is something to say. */
    onSay(fn: (text: string) => void): () => void;
    /**
     * Say that something happened, by a short name: a control was pressed
     * (`press`, which `run` says itself), the menu opened, a room was joined.
     * Nothing is shown. It is for whatever makes the controls heard or felt.
     */
    signal(name: string): void;
    onSignal(fn: (name: string) => void): () => void;
    /** What the people in the room write to each other (ui/chat.ts). The room fills it; every renderer draws it. */
    readonly chat: UiChat;
    /** The visitor's own public posts (ui/feed.ts). The room fills it once something signs for them; every renderer draws it. */
    readonly feed: UiFeed;
    /** A private conversation with one person (ui/letters.ts). Whoever holds the visitor's messages fills it; every renderer draws it. */
    readonly letters: UiLetters;
}
export interface ControlsOptions {
    /** The world's name. */
    title: string;
    /** Its address, as a visitor should read it. This is the world speaking about itself, not a verification. */
    address?: string;
    /** The look this world would like. The visitor's own choice overrides it. */
    theme?: Partial<UiTheme>;
    sections?: UiSection[];
    /** How much of the screen the controls take. "full" unless the world says otherwise. */
    presence?: Presence;
    /** Which corner the quiet mark sits in. Top left by default. */
    corner?: Corner;
    keys?: Partial<UiKeys>;
}
/** The tabs the menu has its own name for, by id, in the order they are shown. */
export declare const STANDARD_TABS: readonly string[];
/** What one of them is called, and its icon: the menu's own words for it, whoever fills it. Null for any other tab. */
export declare const standardTab: (id: string) => {
    label: string;
    icon: IconName | null;
} | null;
/**
 * The order of the things every place has, wherever in a world's code they
 * were added. So the taskbar reads the same in every world, and the same
 * number key does the same thing: the way home is first, then the visitor's
 * doors, the headset, the room and its chat, and jumping. A world's own things come after,
 * in the order it added them.
 */
export declare const STANDARD_ORDER: readonly string[];
/** A world's word that it is still loading, as the console shows it: plain text, one line, a fraction or none. */
export declare function cleanLoading(state: {
    fraction?: unknown;
    words?: unknown;
} | null | undefined): UiLoading | null;
export declare function createControls(opts: ControlsOptions): Controls;
export { DEFAULT_THEME };
