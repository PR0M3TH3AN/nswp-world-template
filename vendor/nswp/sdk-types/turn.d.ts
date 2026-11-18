import * as THREE from "three";
/**
 * Turn the visitor on the spot, in one step. A turn in one step is the
 * comfortable kind; a slow spin of the whole view makes people ill. It is also
 * the only way to face the other way for someone seated who can't turn round.
 */
export declare function turnVisitor(rig: THREE.Object3D, camera: THREE.Camera, degrees: number): void;
