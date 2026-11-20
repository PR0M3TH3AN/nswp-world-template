/**
 * The control that tells a visitor the world they are in has been updated,
 * and loads the latest (fresh.ts; protocol/09-what-a-world-owes.md, "Always
 * the latest"). It is in every world's console, and shows only when there is
 * something newer to load.
 */
import { type Fresh } from "../fresh.js";
import type { Controls, UiAction } from "./model.js";
/**
 * Watch for the site being updated, and return the control for it: "This place has been updated. Reload for the
 * latest", on the bar and under Help while it is so, and absent otherwise. `busy` says when a reload would break
 * what they are doing, beyond being in a room or writing, which are known here: in a headset, say.
 */
export declare function freshAction(controls: Controls, opts?: {
    busy?: () => boolean;
    fresh?: Fresh;
}): UiAction;
