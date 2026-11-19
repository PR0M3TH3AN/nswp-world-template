import type { Controls } from "./model.js";
export interface Hud {
    /** The element on the page. */
    element: HTMLElement;
    readonly open: boolean;
    /** Bring the menu up or put it away. `at` names the section to bring it up on. */
    setOpen(open: boolean, at?: string): void;
    /** How much of the top and bottom of the window the HUD covers, in pixels. For placing a scene's picture clear of it. Nothing when it is quiet or hidden. */
    cover(): {
        top: number;
        bottom: number;
    };
    /** Where each visible part of the HUD is, so a world can lay its own interface out around it. */
    bounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    }[];
    /** Hide it all (in a headset session, where the page can't be seen anyway) or show it again. */
    setHidden(hidden: boolean): void;
    remove(): void;
}
export declare function mountHud(controls: Controls, opts?: {
    parent?: HTMLElement;
}): Hud;
