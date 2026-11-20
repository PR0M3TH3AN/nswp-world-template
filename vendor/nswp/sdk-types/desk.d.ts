import type { Controls } from "./ui/model.js";
/** Where they are kept, for this site. */
export declare const DESK_PREFS_KEY = "nswp:desk";
/** The speeds the control steps through, and what each is called. */
export declare const LOOK_STEPS: readonly {
    value: number;
    word: string;
}[];
/** The widths the control steps through. Null is the world's own. */
export declare const FOV_STEPS: readonly (number | null)[];
/** How much faster or slower than the kit's own speed the view turns under their hand. */
export declare const lookScale: () => number;
export declare const aimScale: () => number;
export declare const setAimScale: (k: number) => void;
export declare const setLookScale: (v: number) => void;
/** How wide they have asked to see, in degrees top to bottom, or null for each world's own. Only ever at a desk. */
export declare const visitorFov: () => number | null;
export declare const setVisitorFov: (v: number | null) => void;
/** Hear of either changing. Returns how to stop. */
export declare function onDeskChange(cb: () => void): () => void;
/** The two controls: look speed under Moving, field of view under View. The same in every world. */
export declare function addDeskControls(controls: Controls, o: {
    presenting(): boolean;
}): void;
/**
 * Keep a camera as wide as the visitor asked. `own` is how wide the world
 * would have it (a world that fits its view to the window says so here; left
 * out, it is what the camera had). Returns a function to call when the
 * window or the form changes.
 */
export declare function watchFov(camera: {
    fov: number;
    updateProjectionMatrix(): void;
}, o?: {
    own?: () => number;
    presenting?: () => boolean;
}): () => void;
/** For tests: forget what was loaded. */
export declare function resetDesk(): void;
