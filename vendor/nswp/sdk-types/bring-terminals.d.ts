/**
 * Terminals in a world its owner is building: the part with the terminal in
 * it. See `bring.ts` for what is brought and why it is trusted.
 *
 *   if (somethingBrought()) {
 *     const brought = takeBrought();
 *     if (brought) (await import("nswp-sdk/terminal")).addBroughtTerminals({ brought, controls, panels, presenting });
 *   }
 *
 * Only the owner sees these. Panels are drawn for the one who hung them, and
 * are never sent to anyone else in a room.
 */
import { type Brought } from "@nswp/core";
import type { Panels } from "./panels.js";
import { type TerminalPanel } from "./terminal.js";
import type { Controls } from "./ui/model.js";
export interface BroughtTerminalsOptions {
    brought: Brought;
    controls: Controls;
    panels: Panels;
    presenting: () => boolean;
    accent?: number | string;
}
export interface BroughtTerminals {
    /** The open terminals, oldest first. */
    terminals(): TerminalPanel[];
    /** Bring back the ones that were open before a refresh, one at a time. Done by itself after a refresh; here for a test. */
    restore(): Promise<void>;
}
export declare function addBroughtTerminals(o: BroughtTerminalsOptions): BroughtTerminals;
