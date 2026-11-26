/**
 * The headset console: a world's controls inside an immersive session, where
 * the page and its HUD can't be seen.
 *
 * It draws the same controls the flat HUD draws (ui/model.ts), as one panel of
 * light: sections down the side, their buttons beside them. Two ways to reach
 * it, and a visitor always has the second:
 *
 *  - On the wrist. Where the headset tracks a hand or controller, raising it
 *    in front of the face brings the console up above it, and the other hand
 *    points at it. Which wrist, or none, is the visitor's choice.
 *  - A small arched Menu button that keeps low and in front of the visitor,
 *    and opens the console floating there. It needs no tracked hand, so it
 *    works with gaze-and-pinch too.
 *
 * A world with an interface of its own can turn this down (`Presence`, in
 * ui/model.ts). Quiet, the Menu button shows only where no hand is tracked,
 * and smaller. Hidden, nothing shows until the world opens it with setOpen().
 *
 * Everything is pressed with `select` (spec §21.2). It is drawn by the world:
 * it is that world's console, not a trusted surface (spec §3.2).
 *
 *   const xrConsole = createConsole(controls, { renderer, rig });
 *   scene.add(xrConsole.group);
 *   // each frame:        xrConsole.update(dt, camera, renderer.xr.isPresenting)
 *   // when aiming a ray: const hit = xrConsole.pick(raycaster); xrConsole.aim(hit);
 *   // on select:         if (hit) xrConsole.press(hit);
 */
import * as THREE from "three";
import type { Controls } from "./ui/model.js";
export { BUTTON_WITH_LINES, pageLines, TAB_MIN, tabLayout } from "./console-drawing.js";
export interface XrConsole {
    /** Add this to the scene (not to the camera or the rig). */
    group: THREE.Group;
    readonly open: boolean;
    setOpen(open: boolean): void;
    /** What this ray points at on the console: a name to hand to aim() and press(), or null. */
    pick(raycaster: THREE.Raycaster): string | null;
    aim(hit: string | null): void;
    press(hit: string): void;
    /** Call every frame. `presenting` is whether a headset session is running. */
    update(dt: number, camera: THREE.Camera, presenting: boolean): void;
    /** What it shows right now, in words. For tests. */
    describe(): {
        showing: boolean;
        open: boolean;
        mount: "wrist" | "floating";
        section: string;
        sections: string[];
        buttons: string[];
        lines: string[];
        linesPage: {
            page: number;
            pages: number;
        };
        note: string;
        card: string;
    };
    /** Press the thing with these words: a button, a section, "Menu" or "Close". For tests. */
    pressLabelled(label: string): boolean;
    /**
     * Whether a ray rests on the menu, so that a stick scrolls it and doesn't also walk or turn the visitor: give it to
     * the input layer (`createXrInput({ sticksTaken: () => xrConsole.scrolling })`). Only the flat menu's drawing
     * (`?menu=sheet`) scrolls; today's console never does.
     */
    readonly scrolling: boolean;
    /** For tests, with the flat menu's drawing only: where a thing is in the room (console-sheet.ts, `whereIs`), and its state. */
    sheet?: {
        whereIs(label: string): [number, number, number] | null;
        readonly state: {
            rowsScroll: number;
            forward: string;
            lifted: number;
            chat: string;
        };
    };
}
export { sheetAsked } from "./ui/sheet-asked.js";
/**
 * Where the menu a headset shows comes in the order of drawing: over the room, whatever is nearer, and under the
 * visitor's own hands (`HANDS_ORDER`, input.ts), which are drawn after it.
 */
export declare const MENU_ORDER = 30;
export declare function createConsole(controls: Controls, opts: {
    renderer: THREE.WebGLRenderer;
    rig: THREE.Object3D;
    sheet?: boolean;
    /** Ask for words on the kit's keyboard in the headset (`panels.keyboard.ask`): for a row to type in, and the chat panel. */
    ask?: (o: {
        title: string;
        maxLength?: number;
        multiline?: boolean;
    }) => Promise<string | null>;
}): XrConsole;
