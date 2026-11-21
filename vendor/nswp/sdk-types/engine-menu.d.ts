import { type Sounds } from "./sound.js";
import { type Controls } from "./ui/model.js";
declare const tell: (event: Record<string, unknown>) => void;
/** For the rest of the engine's script to tell the engine something the same way. */
export declare const tellEngine: typeof tell;
/** The menu and the sounds, once the world has asked for them: for the rest of the engine's script to add to. */
export declare const engineParts: () => {
    controls: Controls;
    sounds: Sounds;
    presenting: boolean;
} | null;
export declare const onMenu: (fn: (look: {
    title: string;
    accent?: string;
    hold: boolean;
}) => void) => void;
/**
 * The numbers every world shares, and the two a visitor sets for themselves
 * (how fast the view turns, how wide they see), as JSON: how fast a visitor walks, how far
 * a tap takes them, how a drag and a mouse turn the view, and the size of the standard
 * doorway. An engine reads them here so that they are the kit's and not a
 * copy that drifts. Lengths are metres, angles radians, speeds per second.
 */
export declare function kit(): string;
/**
 * How a door's address should be read on its sign, as JSON: `domain` is the
 * part that says whose site it is, and `prefix` what comes before it. A sign
 * shows the domain, never a name alone. `ok` is false, with `code` saying
 * why, for an address a door can't lead to.
 */
export declare function check(url: string): string;
/**
 * Put the kit's menu over the engine's canvas, and start its sounds. Call it
 * once, after `start()`. `options` is JSON:
 *
 * - `title`: the world's name.
 * - `accent`: its colour, as `#rrggbb`. The visitor's own choice of look overrides it.
 * - `kit`: where the page serves the kit's sound files (a folder holding `sounds.json`), for example `"sounds/kit/"`.
 *   Left out, the sounds are the ones made in the browser.
 * - `sounds`: the world's own sounds, as in a world's settings (`docs/controls-kit.md`, "Sound"). Left out, the defaults.
 * - `help`: a few lines for the Help section.
 *
 * Returns JSON: `moving` is how the visitor starts out moving ("casual" or
 * "intense": as they arrived, or as they chose here before), and `mouse`
 * whether there is a mouse to move the intense way with.
 */
export declare function menu(options?: string): string;
/**
 * Who the visitor is here, now, as JSON: `guest` true, or `name`, `pubkey`, `picture` (an address, to be fetched the
 * way the kit fetches one or not at all) and `about`. It changes when they sign in or out in the menu: a `who`
 * event says so, with the same fields. A name is theirs only while they are signed in here.
 */
export declare function who(): string;
/**
 * Keep this for the visitor (protocol/12-saves.md): text, the world's own, in a slot ("main" when none is named).
 * It is kept on this device at once, and with their account if they are signed in here. A `saved` event says
 * where it was kept: `{"type":"saved","slot":...,"kept":"account"|"device"|"nowhere","said":...}`.
 */
export declare function save(data: string, slot?: string): void;
/**
 * Ask for what was kept in a slot. The answer is a `loaded` event: `{"type":"loaded","slot":...,"found":true,
 * "data":...,"at":...,"from":"account"|"device"}`, or `"found":false` when there is nothing. The newer of this
 * device's and their account's is given.
 */
export declare function load(slot?: string): void;
/** What happened since the engine last asked, as a JSON list, oldest first. Ask every frame. */
export declare function events(): string;
/** Play one of the kit's cues by name (`kit().cues`): the world's own sound for it, or the default. */
export declare function play(cue: string): void;
/** Say how far the visitor was moved this frame, in metres, by what moves them: their steps are heard. */
export declare function moved(metres: number): void;
/** They walked into something. */
export declare function bump(): void;
/** A few words shown for a moment, where the menu shows them. */
export declare function say(text: string): void;
/**
 * Say what the visitor is pointing at, or "" for nothing. `detail` is a JSON
 * list of a few more lines. On a flat screen it is shown beside the controls,
 * the same size wherever the thing is, so a world needn't hang a sign in
 * front of it.
 */
export declare function target(name: string, detail?: string): void;
/**
 * Tell the menu about a headset, as JSON: `supported` (this browser can start
 * a session, so the way in is offered), `presenting` (one is running, so
 * the page's menu is put away and the control becomes the way out) and
 * `failed` (a session was asked for and didn't start).
 *
 * A visitor who left a headset to come here is offered the way back in as
 * soon as the engine says one can start: the whole page is its button, as in
 * every world (ui/headset.ts). A press on it reaches the engine as the
 * menu's own control would: `{ type: "vr", enter: true }`.
 */
export declare function headset(state: string): void;
/**
 * Everything in the visitor's console, as JSON, for an engine that wants to
 * draw some or all of it in an interface of its own: the home button on its
 * own pause menu, the volumes in its own settings screen, wherever it likes.
 *
 * `sections` is the whole menu, in order, each with its `items`; `hotbar` is
 * the few kept always at hand. An item has an `id` to press it by (`run`),
 * the words on it as they stand now (`label`, and `short` for a small
 * space), and `on` (true, false, or null for something that isn't on or
 * off). The words change as things do: "Music: low", "Fullscreen: on". Ask
 * again when a `changed` event comes.
 */
export declare function view(): string;
/**
 * Press something in the visitor's console by its id, as pressing it there
 * would: "home", "fullscreen", "sound-music", "jump". It does exactly what
 * the console's own does, with the visitor's own settings and their own
 * home, which is the point: a button a world draws for itself is the same
 * button. Returns false if there is no such thing just now.
 */
export declare function run(id: string): boolean;
/** Bring the visitor's console up ("1" or true), or put it away: for a world's own button that opens it. */
export declare function open(on: unknown): void;
/**
 * How much of the screen the controls take: "full", "quiet" (one small mark
 * in a corner) or "hidden" (nothing at all). For a world with an interface
 * of its own, which leads. Whatever is chosen, the visitor can still bring
 * the controls up with the summons, which is theirs in every world: the key
 * left of 1, or two fingers held still (protocol/11-the-visitors-console.md).
 * The engine hears `menu` events as they come and go, and should stop
 * taking the visitor's input while they are up.
 */
export declare function presence(level: string): void;
/**
 * Take every key for the world ("1" or "true"), or give them back. While
 * claimed, the menu answers to none of its own keys. The summons still works.
 */
export declare function claim(on: unknown): void;
/**
 * List a door in the menu, as JSON: `id` and `label`. Choosing it there tells
 * the engine (`{"type":"door","id":...}`), which goes through it. With
 * `remove` true, the door is taken off the list.
 */
export declare function door(entry: string): void;
export {};
