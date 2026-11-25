/**
 * The kit's held hands: a see-through blue hand holding a see-through controller, for each side, in a headset with a
 * Quest's controllers (docs/backlog/hands-in-a-headset.md, part 2). Made by the 3D artist for the owner (bitportal-art
 * c30f660; packages/sdk/assets/hands/PROVENANCE.md), authored in WebXR grip space, so each goes straight onto its
 * controller's grip. The owner, 2026-11-25: "Use the live game as the testing ground. Ill let you know if they feel
 * off".
 *
 * Carried with the kit and served by the world itself, beside the kit's sounds (`hands/kit/`), never fetched from
 * anyone else while someone plays. Fetched once, on the first controller that is a Quest's, so a visitor on a flat
 * screen fetches none of it.
 *
 * The hand's clips are moved as the artist named them: `hold`, `index-rest`/`index-pulled` by the trigger,
 * `fingers-open`/`fingers-squeezed` by the grip, and one of `thumb-lower`, `-upper`, `-stick`, `-rest` or `-up` by
 * which control the thumb is on. The controller's trigger, grip, buttons and stick move by its own parts, as the
 * WebXR Input Profiles code moves them. Not part of the package's entries.
 */
import * as THREE from "three";
import type { PadLike } from "./actions.js";
export type HeldSide = "left" | "right";
/** A Quest's controllers, by the profile ids a headset gives them: the ones these hands are made for. */
export declare function wantsHeldHands(profiles: readonly string[] | undefined): boolean;
export interface HeldModel {
    /** The hand and its controller, in grip space. */
    readonly group: THREE.Group;
    /** Move them as the controller is held now. */
    pose(pad: PadLike | null | undefined): void;
}
/** Which control the thumb is on, from the xr-standard buttons: A/X lower, B/Y upper, the stick, the thumb rest, or none. */
export declare function thumbOn(b: PadLike["buttons"]): "lower" | "upper" | "stick" | "rest" | "up";
/**
 * The held hand and controller for `side`, from the world's `at` (where it serves the kit's hand files, for example
 * "/hands/kit/"). `finish` is given each mesh as it is made, so the kit draws it as it draws a hand (last, and not
 * aimed at). Null where the files couldn't be had: the kit's own drawing is kept then.
 */
export declare function heldHand(at: string, side: HeldSide, finish: (root: THREE.Object3D) => void): Promise<HeldModel | null>;
