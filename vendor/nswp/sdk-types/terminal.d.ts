/**
 * A terminal on the visitor's own computer, in a panel (browser/bridge.md).
 *
 * This is for a home, never for a world: it needs the owner's signer, and a
 * world is never given one. It is its own entry (`nswp-sdk/terminal`) so that
 * nothing else pays for the terminal emulator.
 *
 * The panel shows what stage the connection is at, with the code the
 * computer will show when it asks. Once open, press the panel to type into
 * it: with a real keyboard anywhere, and with the kit's drawn one in a
 * headset. Press anywhere else to stop typing into it.
 *
 * Along its foot are six buttons, each one press: speak, back and forward
 * through what has scrolled away, larger and smaller letters, and copy.
 * Speak types what is said, and never presses Enter. The words are worked out
 * on the visitor's own computer where its Bridge listens, and otherwise by
 * their browser where it can, after saying so. The panel's
 * own + and - change how large the whole panel is; these change how much
 * fits on it.
 *
 *   const term = openTerminalPanel({ panels, bridge, owner, relays, sign, presenting });
 *   term.close();
 */
import * as THREE from "three";
import { type BridgeStatus } from "./bridge-link.js";
import type { Panel, PanelLook, PanelPlace, Panels } from "./panels.js";
import type { V3 } from "./panel-store.js";
import type { EventTemplate, NostrEvent } from "@nswp/core";
export type { BridgeStatus } from "./bridge-link.js";
export { addBroughtTerminals, type BroughtTerminals, type BroughtTerminalsOptions } from "./bring-terminals.js";
/** How many letters fit across, from the largest letters to the smallest. */
export declare const TERMINAL_COLUMNS: readonly [60, 80, 100, 120, 140, 160];
export type TerminalButton = "speak" | "back" | "forward" | "larger" | "smaller" | "copy";
export interface TerminalPanelOptions {
    panels: Panels;
    /** The computer's Bridge, as 64 hex characters. */
    bridge: string;
    /** In the owner's home: their public key and signer. The signer is asked for one grant per connection. */
    owner?: string;
    sign?(template: EventTemplate): Promise<NostrEvent>;
    /** In a world the owner is building: the world grant their home signed, and the throwaway key it names (`takeBrought`). */
    held?: {
        grant: NostrEvent;
        sessionKey: Uint8Array;
    };
    relays: string[];
    /** What the owner calls this computer, for the panel's bar. */
    name?: string;
    /** How many letters fit across to begin with: one of `TERMINAL_COLUMNS`. 100 unless told. */
    cols?: number;
    accent?: THREE.ColorRepresentation;
    /** Whether the visitor is in a headset now: there, pressing the panel brings up the drawn keyboard. */
    presenting?: () => boolean;
    iceServers?: RTCIceServer[];
    onStatus?(status: BridgeStatus): void;
    /** The visitor chose larger or smaller letters. A home may remember it. */
    onColumns?(cols: number): void;
    /** The panel was put away, and the connection with it. */
    onClosed?(): void;
    /** Where to hang it, how see-through it is, and where it is pinned in the view: for a home bringing one back as it was. */
    place?: Partial<PanelPlace>;
    look?: Partial<PanelLook>;
    pin?: V3 | null;
}
export interface TerminalPanel {
    readonly panel: Panel;
    readonly status: BridgeStatus;
    /** Whether keys typed go to it. */
    readonly focused: boolean;
    /** How many letters fit across, and how many lines down. */
    readonly size: {
        cols: number;
        rows: number;
    };
    focus(): void;
    blur(): void;
    /** Send keys, as if typed. */
    type(bytes: string): void;
    /** What is on its screen, as lines of text. */
    text(): string[];
    /** Go back or forward through what has scrolled away, by so many lines. */
    scroll(lines: number): void;
    /** Fit this many letters across: the nearest of `TERMINAL_COLUMNS`. The program is told its new size. */
    setColumns(cols: number): void;
    /** Put what is on the screen on the clipboard. Resolves false where the browser won't allow it. */
    copy(): Promise<boolean>;
    /** Where each button along the foot is on the panel's picture, each from 0 to 1 with y downwards. For a test to press. */
    buttons(): Record<TerminalButton, [number, number]>;
    close(): void;
}
/** The nearest size there is to the one asked for. */
export declare function nearestColumns(cols: number): number;
export declare function openTerminalPanel(o: TerminalPanelOptions): TerminalPanel;
