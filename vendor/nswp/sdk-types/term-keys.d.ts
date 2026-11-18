/**
 * Typing into a terminal, as data: what each key sends. A terminal takes
 * bytes, not words, and takes them as they are typed, so this is a different
 * thing from `keys.ts`, where a visitor writes a line and then says done. No
 * three.js and no page here, so it is tested like arithmetic.
 */
import { type Key, type PlacedKey, type Shift } from "./keys.js";
/** What a letter becomes with Ctrl held: Ctrl-C is 3, Ctrl-[ is escape. Anything else is itself. */
export declare function ctrlCode(ch: string): string;
export interface TypedKey {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
}
/**
 * What a key on a real keyboard sends, or null for one that is not the
 * terminal's: a modifier by itself, and the browser's own copy and paste
 * (Ctrl-Shift-C and -V, and Cmd with anything). Ctrl-V is left to the
 * browser too, so a paste arrives as a paste.
 */
export declare function keyBytes(e: TypedKey): string | null;
/** In a program that asked for it (an editor, a pager), the arrows and Home and End are sent another way. */
export declare function forApplication(bytes: string, applicationCursor: boolean): string;
/** Text pasted in, wrapped the way a program that asked to be told about pastes expects. A paste can't end itself early. */
export declare function pasteBytes(text: string, bracketed: boolean): string;
export type LiveLayer = "letters" | "symbols" | "more";
/**
 * The rows of the keyboard a terminal gets: the same letters, with a row
 * above them for what a terminal needs and words don't, and no Done. It
 * stays up until it is put away.
 */
export declare function liveRows(layer: LiveLayer, o?: {
    mic?: boolean;
}): Key[][];
/** Where every key sits, as `placeKeys` lays them. */
export declare function placeLiveKeys(layer: LiveLayer, o?: {
    mic?: boolean;
}): PlacedKey[];
export type LivePressed = {
    send: string;
} | {
    close: true;
} | {
    mic: true;
} | null;
/** The drawn keyboard's own state: shift, ctrl and which layer, and what each press sends. */
export declare class LiveKeys {
    shift: Shift;
    /** Ctrl is pressed first, then the letter: there is one pointer, not ten fingers. */
    ctrl: boolean;
    layer: LiveLayer;
    /** Whether a key should be drawn lit. */
    lit(k: Key): boolean;
    label(k: Key): string;
    press(id: string, keys?: Key[]): LivePressed;
}
