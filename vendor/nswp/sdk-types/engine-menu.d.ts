/**
 * The numbers every world shares, as JSON: how fast a visitor walks, how far
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
 * a session, so the way in is offered) and `presenting` (one is running, so
 * the page's menu is put away and the control becomes the way out).
 */
export declare function headset(state: string): void;
/**
 * List a door in the menu, as JSON: `id` and `label`. Choosing it there tells
 * the engine (`{"type":"door","id":...}`), which goes through it. With
 * `remove` true, the door is taken off the list.
 */
export declare function door(entry: string): void;
