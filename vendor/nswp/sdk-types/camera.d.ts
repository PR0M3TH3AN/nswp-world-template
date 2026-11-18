/**
 * The visitor's camera: pictures, selfies and short clips of the world they
 * are in, saved to their own device.
 *
 * It needs no account and contacts nothing. A picture is the scene drawn
 * once more into a file; a selfie is the same from a camera held out in
 * front, with the visitor's own figure put in for the moment; a clip is the
 * page's own canvas recorded for up to half a minute.
 *
 * Recording other people is said out loud: while a clip is being recorded,
 * everyone in the room sees a light on the recorder's figure (spec §9).
 */
import * as THREE from "three";
import type { Look } from "@nswp/core";
import type { Controls } from "./ui/model.js";
export interface PictureOptions {
    /** Pixels across and down. Default 1920 by 1080. */
    width?: number;
    height?: number;
    /** Things to leave out: a menu floating in the scene, say. */
    hide?: THREE.Object3D[];
    /** JPEG quality, 0 to 1. Default 0.92. */
    quality?: number;
}
/**
 * Draw the scene once from `camera` and return it as a JPEG. The camera's
 * own shape is left alone: a copy is fitted to the picture. Works during an
 * immersive session too, since it never draws to the headset.
 */
export declare function takePicture(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, opts?: PictureOptions): Promise<Blob>;
export interface SelfieOptions extends PictureOptions {
    /** How far in front of the visitor the camera is held, in metres. Default 1.7. */
    reach?: number;
}
/**
 * A picture of the visitor, from a camera held out in front of them and
 * turned back. Their own figure is put where their head is for the picture:
 * nobody sees themselves otherwise. Whoever is behind them is in it too.
 */
export declare function takeSelfie(renderer: THREE.WebGLRenderer, scene: THREE.Scene, head: THREE.PerspectiveCamera, look: Look | string, opts?: SelfieOptions): Promise<Blob>;
export interface Clip {
    /** Stop, and get the recording. */
    stop(): Promise<Blob>;
    /** Seconds recorded so far. */
    seconds(): number;
    /** Resolves when it stops for any reason, such as reaching its limit. */
    done: Promise<Blob>;
}
/** Can this browser record its own canvas? */
export declare function canRecord(): boolean;
/**
 * Record what the page's canvas shows: picture only, no sound, for at most
 * `maxSeconds`. Not available during an immersive session, when the page's
 * canvas isn't what is being drawn.
 */
export declare function recordClip(canvas: HTMLCanvasElement, opts?: {
    fps?: number;
    maxSeconds?: number;
}): Clip;
/** Hand a file to the visitor: their device's own save, as a download. */
export declare function saveFile(blob: Blob, name: string): void;
export interface Capture {
    kind: "picture" | "selfie" | "clip";
    blob: Blob;
    name: string;
}
export interface CameraOptions {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    /**
     * The visitor's own look, for selfies: what they are wearing, or a key to
     * generate one from. Usually `presence.selfLook`. Left out, they are a
     * figure of their own for this visit.
     */
    look?: () => Look | string;
    /** Tell the room a clip is being recorded, and when it stops. Usually `presence.setRecording`. */
    recording?: (on: boolean) => void;
    /** Things in the scene to leave out of every picture: the headset console, a pointer. */
    hide?: () => THREE.Object3D[];
    /** A word for file names: the world's name. */
    name?: string;
    /** Longest clip, in seconds. Default 30. */
    maxSeconds?: number;
    /** Called with everything taken: a picture, a selfie or a clip. A place to keep it, such as the visitor's library. */
    onCapture?: (capture: Capture) => void;
}
export interface Camera {
    /** What has been taken and not yet saved (for tests, and for a gallery of a world's own). */
    waiting(): Capture[];
    /** Whether a clip is being recorded now. */
    readonly recording: boolean;
    /** The most recent picture or clip, saved or not. */
    last(): Capture | null;
}
/**
 * Add the camera to a world's controls: a section with a picture, a selfie
 * and a clip. Outside a headset each is saved straight away. Inside one a
 * save can't be shown, so they are kept and offered once the visitor is out.
 */
export declare function addCameraControls(controls: Controls, d: CameraOptions): Camera;
