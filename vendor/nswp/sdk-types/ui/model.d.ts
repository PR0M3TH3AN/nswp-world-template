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
    act(): void | Promise<void>;
    /** Leave it out while this returns true. */
    hidden?: () => boolean;
    /** For something that is on or off: whether it is on now. */
    on?: () => boolean;
    tone?: "normal" | "primary" | "warn";
    /** Put it in the row of things always at hand. Keep that row to six. */
    hotbar?: boolean;
    /** A word or two for where there is little room, such as under a hotbar key. */
    short?: Text;
    /**
     * What kind of control it is. Each kind is drawn by one small function in
     * each renderer, so a new kind is added there and nowhere else.
     * "swatch" is a choice of colour, and needs `color`.
     */
    kind?: "button" | "swatch";
    color?: string;
}
export interface UiSection {
    id: string;
    label: string;
    icon?: IconName;
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
    kind: "button" | "swatch";
    color: string;
}
export interface UiSectionView {
    id: string;
    label: string;
    icon: IconName | null;
    note: string;
    items: UiItemView[];
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
}
export interface UiView {
    title: string;
    address: string;
    target: string;
    /** A few more lines about what is pointed at. */
    detail: string[];
    presence: Presence;
    corner: Corner;
    keys: UiKeys;
    sections: UiSectionView[];
    hotbar: UiItemView[];
    theme: UiTheme;
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
    /** Do an action by its id, as pressing it would. Returns false if it isn't there or isn't showing. */
    run(id: string): boolean;
    /** Change the look. `keep` also remembers it as this visitor's choice, for this site. */
    setTheme(patch: Partial<UiTheme>, keep?: boolean): void;
    readonly presence: Presence;
    /** How much of the screen the controls take. A world can change it as it goes: quiet during play, full in a lobby. */
    setPresence(presence: Presence): void;
    /** Which corner the quiet mark sits in. */
    setCorner(corner: Corner): void;
    /** Which keys the HUD answers to. */
    setKeys(keys: Partial<UiKeys>): void;
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
export declare function createControls(opts: ControlsOptions): Controls;
export { DEFAULT_THEME };
