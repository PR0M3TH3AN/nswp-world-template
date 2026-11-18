/**
 * A keyboard, as data: which keys there are, where each sits, and what
 * pressing one does to the words so far. No three.js and no page here, so it
 * is tested like arithmetic. `keyboard.ts` draws it in a headset.
 */
export type KeyKind = "char" | "shift" | "back" | "layer" | "space" | "enter" | "cancel" | "done" | "system" | "esc" | "tab" | "ctrl" | "up" | "down" | "left" | "right" | "pgup" | "pgdn" | "home" | "end" | "close" | "mic";
export interface Key {
    /** What a press of it is called: the character itself for a letter, a word for the rest. */
    id: string;
    /** What is written on it. */
    label: string;
    kind: KeyKind;
    /** How wide it is, in the width of one letter key. */
    w: number;
}
export interface PlacedKey extends Key {
    /** Its place on the board, each from 0 to 1: left edge, top edge, width, height. */
    x: number;
    y: number;
    width: number;
    height: number;
}
export type Layer = "letters" | "symbols";
/** The rows of a layer, top to bottom. Every row is ten letter-widths across, or is centred if it is shorter. */
export declare function keyRows(layer: Layer, o?: {
    system?: boolean;
    multiline?: boolean;
    mic?: boolean;
}): Key[][];
/** Where every key of a layer sits on a board ten letter-widths across. `rows` lays out other rows the same way. */
export declare function placeKeys(layer: Layer, o?: {
    system?: boolean;
    multiline?: boolean;
    mic?: boolean;
}, rows?: Key[][]): PlacedKey[];
/** The key under a point on the board (each from 0 to 1, y downwards), or null between keys. */
export declare function keyAt(keys: PlacedKey[], x: number, y: number): PlacedKey | null;
export type Shift = "off" | "once" | "lock";
export type Pressed = "typing" | "done" | "cancel" | "system" | "mic";
/** The words so far, and what each key does to them. */
export declare class TextEntry {
    value: string;
    shift: Shift;
    layer: Layer;
    readonly multiline: boolean;
    readonly maxLength: number;
    constructor(o?: {
        value?: string;
        multiline?: boolean;
        maxLength?: number;
    });
    /** Whether the next letter begins a sentence, and so is a capital unless the visitor says otherwise. */
    private startsSentence;
    /** Add text as it is: from a real keyboard, or pasted. */
    type(text: string): void;
    erase(): void;
    /** What a key shows now: a letter as a capital while shift is on. */
    label(k: Key): string;
    /** Press a key by its id. Returns what happened: still typing, finished, given up, or asked for the headset's own keyboard. */
    press(id: string, keys?: Key[]): Pressed;
}
