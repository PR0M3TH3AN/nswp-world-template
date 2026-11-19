/**
 * The control that fills the screen with the world, and gives it back. The
 * same in every world, whatever draws it.
 */
import type { Controls, UiAction } from "./model.js";
export declare function fullscreenAction(controls: Controls, presenting: () => boolean): UiAction;
