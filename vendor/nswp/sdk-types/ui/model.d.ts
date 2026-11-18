/**
 * The controls a world gives its visitor, as a list of things they can do.
 *
 * A world says what the actions are, once. Two renderers draw them: a HUD on a
 * flat screen (`mountHud`, in `nswp-sdk/ui`) and a console inside a headset
 * (`createConsole`, in `nswp-sdk/three`). They look nothing alike, and they
 * always offer the same things, because neither holds any of the logic.
 *
 *   const controls = createControls({ title: "My world", address: "example.org" });
 *   controls.add({ id: "home", section: "travel", label: "Back to your lobby", icon: "home", hotbar: true, act: () => portal.home() });
 *
 * Adding a button, a section, or a whole new kind of control later means
 * adding to this list. Nothing about either renderer has to change.
 */
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
export interface UiView {
    title: string;
    address: string;
    target: string;
    sections: UiSectionView[];
    hotbar: UiItemView[];
    theme: UiTheme;
}
export interface Controls {
    readonly theme: UiTheme;
    add(...actions: UiAction[]): void;
    remove(id: string): void;
    addSection(section: UiSection): void;
    /** Say what the visitor is pointing at, or "" for nothing. */
    setTarget(text: string): void;
    /** A few words shown for a moment. */
    say(text: string): void;
    /** Do an action by its id, as pressing it would. Returns false if it isn't there or isn't showing. */
    run(id: string): boolean;
    /** Change the look. `keep` also remembers it as this visitor's choice, for this site. */
    setTheme(patch: Partial<UiTheme>, keep?: boolean): void;
    view(): UiView;
    /** Be told when something changed: a new action, the theme, the target. Returns how to stop being told. */
    subscribe(fn: () => void): () => void;
    /** Be told when there is something to say. */
    onSay(fn: (text: string) => void): () => void;
}
export interface ControlsOptions {
    /** The world's name. */
    title: string;
    /** Its address, as a visitor should read it. This is the world speaking about itself, not a verification. */
    address?: string;
    /** The look this world would like. The visitor's own choice overrides it. */
    theme?: Partial<UiTheme>;
    sections?: UiSection[];
}
export declare function createControls(opts: ControlsOptions): Controls;
export { DEFAULT_THEME };
