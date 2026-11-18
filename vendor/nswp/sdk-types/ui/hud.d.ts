import type { Controls } from "./model.js";
export interface Hud {
    /** The element on the page. */
    element: HTMLElement;
    readonly open: boolean;
    setOpen(open: boolean): void;
    /** How much of the top and bottom of the window the HUD covers, in pixels. For placing a scene's picture clear of it. */
    cover(): {
        top: number;
        bottom: number;
    };
    /** Hide it all (in a headset session, where the page can't be seen anyway) or show it again. */
    setHidden(hidden: boolean): void;
    remove(): void;
}
export declare function mountHud(controls: Controls, opts?: {
    parent?: HTMLElement;
}): Hud;
