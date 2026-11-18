/**
 * A menu a visitor can reach inside a headset.
 *
 * In an immersive session the page around the scene is gone, and every HTML
 * button with it: the way home, the room's controls, the microphone. This puts
 * the same actions in the scene. Closed, it is one small "Menu" button that
 * keeps to the visitor's side, low and in front. Selecting it opens a short
 * column of large buttons.
 *
 * It needs only `select`, so it works with controllers, hand pinches and
 * gaze-and-pinch alike (spec §21.2). A wrist menu would need a tracked hand,
 * which not every headset gives a web page.
 *
 * It is drawn by the world. It is the world's own menu and nothing more: it is
 * not a trusted surface, and a visitor's real way out of any world is their
 * headset's own controls (spec §3.2).
 *
 *   const menu = createWorldMenu({ items: [{ label: "Go home", act: () => portal.home() }] });
 *   scene.add(menu.group);
 *   // each frame:        menu.update(dt, camera, renderer.xr.isPresenting)
 *   // when aiming a ray: const hit = menu.pick(raycaster); menu.aim(hit);
 *   // on select:         if (hit) menu.press(hit);
 */
import * as THREE from "three";
export interface MenuItem {
    /** What the button says. A function is read again while the menu is open, so the words can follow what they describe. */
    label: string | (() => string);
    act(): void | Promise<void>;
    /** Leave the button out while this returns true. */
    hidden?: () => boolean;
}
export interface WorldMenuOptions {
    items: MenuItem[];
    /** A line or two above the buttons, such as a room's status. Read again while the menu is open. */
    note?: () => string;
    textColor?: string;
}
export interface WorldMenu {
    /** Add this to the scene (not to the camera or the rig). */
    group: THREE.Group;
    readonly open: boolean;
    setOpen(open: boolean): void;
    /** The menu button this ray points at, or null. */
    pick(raycaster: THREE.Raycaster): THREE.Mesh | null;
    /** Say which button is being pointed at, so it can show it. */
    aim(button: THREE.Mesh | null): void;
    /** Press a button that pick() returned. */
    press(button: THREE.Mesh): void;
    /** Call every frame. `showing` is normally whether a headset session is running: on a flat screen the page has its own buttons. */
    update(dt: number, camera: THREE.Camera, showing: boolean): void;
    /** What the menu shows right now, in words. For tests. */
    describe(): {
        showing: boolean;
        open: boolean;
        buttons: string[];
        note: string;
    };
    /** Press the showing button with these words. For tests. Returns false if there is none. */
    pressLabelled(label: string): boolean;
}
/** A button on the page as a menu item: it says what the button says and presses it. One piece of logic serves both. */
export declare function menuItemFor(button: HTMLButtonElement): MenuItem;
export declare function createWorldMenu(opts: WorldMenuOptions): WorldMenu;
/**
 * Turn the visitor on the spot, in one step. A turn in one step is the
 * comfortable kind; a slow spin of the whole view makes people ill. It is also
 * the only way to face the other way for someone seated who can't turn round.
 */
export declare function turnVisitor(rig: THREE.Object3D, camera: THREE.Camera, degrees: number): void;
