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
export declare const onSession: (fn: (presenting: boolean) => void) => void;
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
 * What a world offers, for the tiles beside its door, as JSON: thirteen lines
 * in a set order, each with `id`, `on` (the world's announcement says it),
 * `name`, `words` (one sentence, for whichever case it is) and `onDoor`. The
 * eight a door shows also have `icon`: the kit's line drawing for it, as SVG
 * path data on a 24-unit square. Draw them lit where `on`, dark where not,
 * and say `words` when one is pointed at. `world` is JSON with what the
 * place's announcement says: `modes`, `capabilities`, and `items`, `access`
 * and `byInvitation` (true) where it says them. Anything else in it is not read, and a world
 * it can't read offers nothing.
 */
export declare function offers(world: string): string;
/** Mount the console before the world has asked for it. `home` goes home (or to their doors) from here, the engine not yet listening. */
export declare function earlyMenu(o: {
    title: string;
    accent?: string;
    home: () => boolean;
}): void;
/**
 * The crossing's room changed. Out of "arriving", the line the early console put up goes (the world says its own, if
 * any); and a console the world never asked for goes too, once its doors have opened, or as the visitor leaves.
 */
export declare function roomChanged(state: string): void;
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
 * The gate of a paid world (protocol/10-identity.md, "The front room"), for a world made in another engine: the
 * same gate as a Three.js world's, since none of it is drawing. Call it once as the world comes up, after `start()`,
 * in a world that is paid. It asks what the visitor holds, reads what is for sale, and puts the one control that asks to buy
 * (`gate-buy`) in the kit's menu.
 *
 * Returns how the gate stands, as JSON, and a `gate` event with the same fields comes whenever that changes:
 * `state` ("checking", "shut", "open", "ending", or "free"), `open` (whether a visitor may go past it now: the one
 * thing to act on), `reason` and `why` (why it is shut: a stable word, and plain words for the visitor), `offers`
 * (what can be bought: `listing`, `name`, `sats`, `term`, `words`), and `until` (when a pass ends, in seconds, or null).
 *
 * The engine draws the gate and stops the visitor where it stands: everything before it is free, and where it
 * stands is the world's to choose. While `open` is false, nobody goes past. It is false until the gate knows.
 * `run("gate-buy")` presses the control, for a gate that is pressed in the world.
 *
 * What it is entered by, whose lists count and whether its rooms show only named people are the world's own
 * manifest's word (`access`, `keepers`, `named_only`); the gate stops someone its owner keeps out, and the room
 * takes the same rules. `options` is JSON: `paid` false says this world's own settings ask for none of that, and
 * then nothing is made, read or asked: the answer is "free". Such a world has no need to call this at all.
 */
export declare function gate(options?: string): string;
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
/** The visitor jumped: the kit's own sound for it, as in every world (two footsteps back to back, a little louder). */
export declare function jumped(): void;
/** Say how far the visitor was moved this frame, in metres, by what moves them: their steps are heard. */
export declare function moved(metres: number): void;
/** They walked into something. */
export declare function bump(): void;
/** The line in the menu that says the world is still loading, though the visitor is in: null ends it. */
export declare function loadingLine(state: {
    fraction?: number;
    words?: string;
} | null): void;
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
