/**
 * The place a world stands in: a sky, a ground ruled with light that runs to
 * the horizon, a skyline, and dust in the air.
 *
 * It is the look of the reference worlds, of a home drawn by `createHome`, and
 * of BitPortal's room: one place to change it for all of them. A dozen draw
 * calls, no textures, nothing fetched.
 *
 *   const environment = createEnvironment("#3df2a0");
 *   scene.add(environment.group);
 *   // each frame: environment.update(t)
 *
 * It needs a camera that sees a long way: set the far plane to 700 or more.
 */
import * as THREE from "three";
export interface Environment {
    group: THREE.Group;
    /** Call each frame with seconds since the start. Pass 0 always to keep it still. */
    update(t: number): void;
}
export interface EnvironmentOptions {
    /** The colour of the ground the grid is drawn on, and of the night above it. Dark by default. */
    ground?: THREE.ColorRepresentation;
    /** Metres round the middle that the nearest towers of the skyline keep well back from. */
    clear?: number;
    /** Draw the skyline. Default true. */
    skyline?: boolean;
    /** Draw dust drifting in the air near the middle. Default true. */
    dust?: boolean;
    /** Draw the constellations that come and go among the stars. Default true. */
    constellations?: boolean;
    /** Any number: it turns the sky, so two worlds don't share one. Taken from the colours when left out. */
    seed?: number;
}
/** The ground colour this look is drawn on unless a place asks for another. */
export declare const GROUND = 263947;
export declare function createEnvironment(accent: THREE.ColorRepresentation, opts?: EnvironmentOptions): Environment;
