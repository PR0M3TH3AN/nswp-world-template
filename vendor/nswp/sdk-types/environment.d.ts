/**
 * The ground a place stands on: a plane ruled with a grid of light that runs
 * to the horizon, a low glow where it ends, and a skyline of blocks.
 *
 * It is the look of the reference worlds, of a home drawn by `createHome`, and
 * of BitPortal's room: one place to change it for all of them. Three draw
 * calls, no textures, nothing fetched, so it costs a headset almost nothing.
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
    /** The colour of the plane the grid is drawn on. Dark by default. */
    ground?: THREE.ColorRepresentation;
    /** Metres round the middle that the nearest blocks of the skyline keep well back from. */
    clear?: number;
    /** Draw the skyline of blocks. Default true. */
    skyline?: boolean;
}
/** The ground colour this look is drawn on unless a place asks for another. */
export declare const GROUND = 263947;
export declare function createEnvironment(accent: THREE.ColorRepresentation, opts?: EnvironmentOptions): Environment;
