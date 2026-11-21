/**
 * A world's preview (protocol/04-previews.md): a 360° still, twice as wide as tall, with the middle of the picture
 * looking along -Z from where a visitor arrives.
 *
 * It is made from six ordinary square views, each 90° wide, painted onto the part of the panorama it covers. What
 * takes the six views is whatever draws the world: Three.js here (`capturePanorama`), or another engine, which
 * hands them over as pictures (engine-panorama.ts). The painting is this, once, for all of them.
 */
import * as THREE from "three";
/**
 * The six views, in the order they are taken: which way each looks, and which way is up in it. A view's right is
 * its looking direction crossed with its up.
 */
export declare const PANORAMA_VIEWS: readonly {
    forward: readonly [number, number, number];
    up: readonly [number, number, number];
}[];
/** The widest a panorama may be (the protocol's ceiling), and the narrowest worth making. */
export declare const panoramaWidth: (asked: number | undefined) => number;
export interface PanoramaPainter {
    /** Paint one of the six views onto the panorama. `face` is that view's picture, square, its first row at the bottom. */
    paint(face: THREE.Texture, view: number): void;
    /** The finished panorama, as a WebP file. */
    blob(quality?: number): Promise<Blob>;
    dispose(): void;
}
/**
 * Something to paint the six views onto. It leaves the renderer drawing to its own target and not clearing: whoever
 * made it puts the renderer back as it was.
 */
export declare function paintPanorama(renderer: THREE.WebGLRenderer, width: number): PanoramaPainter;
