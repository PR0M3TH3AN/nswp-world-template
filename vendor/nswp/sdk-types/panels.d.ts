/**
 * Panels: flat things a visitor hangs in the air round them.
 *
 * A panel shows a note, a picture or a video, in a frame with a bar along
 * its top. Take it by the bar to move it; it turns to face you as it goes.
 * Three buttons on the bar make it smaller, larger, or put it away. Where the
 * page asks, panels are kept in this browser and are there next visit.
 *
 * Everything on a panel is something the kit drew: text it laid out, a
 * picture or a video the page was allowed to load, or a file the visitor
 * chose from their own device. It is never another website. A page cannot
 * draw a web page into a 3D scene, and a browser that could is a different
 * thing (browser/spec.md).
 *
 * Like everything in a headset here, each control is one `select`. Moving a
 * panel with a grip is the faster way for someone who has one.
 *
 *   const panels = createPanels({ scene, camera, accent, input, keep: "my-site:panels" });
 *   panels.open({ kind: "note", title: "Read me", text: "..." });
 *   // each frame:  panels.update(t, dt)
 *   // on a ray:    const hit = panels.pick(raycaster); panels.aim(hit);
 *   // on select:   if (hit) panels.press(hit);
 *   // on a flat screen, so a panel can be dragged by its bar:
 *   //   pointerdown: if (panels.pointer("down", raycaster)) ...the panel has the drag
 */
import * as THREE from "three";
import type { XrInput } from "./input.js";
import { type Keyboard } from "./keyboard.js";
import { type Library } from "./library.js";
import type { Controls } from "./ui/model.js";
import { type PanelLook, type PanelPlace, type PanelSource, type V3 } from "./panel-store.js";
export type { PanelLook, PanelPlace, PanelRecord, PanelSource } from "./panel-store.js";
export { PANEL_LOOKS } from "./panel-store.js";
/**
 * What a panel can show. `custom` is a texture of the page's own, for
 * something the kit doesn't draw: it is not kept. It may ask to hear a press
 * on its picture (with where, each from 0 to 1, y downwards), and that it was
 * put away.
 */
export type PanelContent = PanelSource | {
    kind: "custom";
    title: string;
    texture: THREE.Texture;
    aspect: number;
    onPress?: (x: number, y: number) => void;
    onClose?: () => void;
};
export interface PanelsOptions {
    scene: THREE.Scene;
    camera: THREE.Camera;
    accent?: THREE.ColorRepresentation;
    textColor?: string;
    /** The kit's input layer, so a panel can be taken by its bar with a grip or a pinch. */
    input?: XrInput;
    /** Keep panels in this browser under this name, and bring them back next visit. Left out, they last for the visit. */
    keep?: string;
    /** Called when a panel is opened, moved, resized or put away. */
    onChange?: () => void;
    /** The headset session, if there is one: its browser may have a keyboard of its own to offer. */
    session?: () => XRSession | null | undefined;
}
export interface Panel {
    readonly id: string;
    readonly group: THREE.Group;
    readonly source: PanelContent;
    place(): PanelPlace;
    moveTo(place: Partial<PanelPlace>): void;
    /** How see-through it is. */
    readonly look: PanelLook;
    setLook(look: Partial<PanelLook>): void;
    /**
     * Whether it is pinned in the visitor's view: it comes with them, and stays
     * where they put it in front of them. On a flat screen it keeps its place on
     * the screen. In a headset it stays put while they look about and comes
     * round when they turn or move well away, because a thing glued to the eyes
     * is tiring. `pin` is where: metres right, up and ahead (ahead is negative).
     */
    readonly pin: V3 | null;
    setPinned(on: boolean): void;
    close(): void;
}
export interface PanelInfo {
    id: string;
    kind: string;
    title: string;
    place: PanelPlace;
    /** For a video: whether it is playing. */
    playing: boolean | null;
    held: boolean;
    /** Whether what it shows has loaded. */
    ready: boolean;
    look: PanelLook;
    pinned: boolean;
}
export interface Panels {
    /** Hang a panel. Without a place, it goes a comfortable reach in front of the visitor, facing them. */
    open(content: PanelContent, opts?: {
        id?: string;
        place?: Partial<PanelPlace>;
        keep?: boolean;
        look?: Partial<PanelLook>;
        pin?: V3 | null;
    }): Panel;
    /** Hang a file the visitor chose from their own device: a picture or a video. It goes into their library, and is kept in this browser. */
    openFile(file: Blob & {
        name?: string;
    }): Promise<Panel | null>;
    /** A keyboard to type on inside a headset. Its keys are found by `pick()` and pressed by `press()`, like a panel's. */
    readonly keyboard: Keyboard;
    /** The pictures and video of the visitor's own that this browser keeps, and a board to choose one from. */
    readonly library: Library;
    /** Where something `pick()` could return is in the world: a key, a cell of the library. For a test to point at. */
    pointOf(hit: string): THREE.Vector3 | null;
    list(): Panel[];
    /** Hide every panel, or show them again. They keep their places. */
    visible: boolean;
    /** What this ray points at on a panel: a name to hand to `aim()` and `press()`, or null. */
    pick(raycaster: THREE.Raycaster): string | null;
    aim(hit: string | null): void;
    press(hit: string): void;
    /** On a flat screen: tell it about the pointer, as a ray. "down" returns true if a panel's bar took the drag. */
    pointer(phase: "down" | "move" | "up", raycaster: THREE.Raycaster): boolean;
    update(t: number, dt: number): void;
    /** Settles when everything kept from last visit is hanging again. */
    readonly restored: Promise<void>;
    info(): PanelInfo[];
    dispose(): void;
}
export declare function createPanels(o: PanelsOptions): Panels;
/**
 * Give the visitor their panels under "Panels" in the controls: write a note,
 * hang a picture or video from their own device, and hide or show them all.
 * Writing and choosing a file happen on the page, so they are offered on a
 * flat screen; in a headset the panels already hanging are moved, resized and
 * put away.
 */
export declare function addPanelControls(controls: Controls, panels: Panels, o: {
    presenting: () => boolean;
    kept?: boolean;
}): void;
