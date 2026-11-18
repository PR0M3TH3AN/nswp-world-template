/**
 * Alloy: the one surface everything modelled is drawn in.
 *
 * Dark metal that is never lit by a light. Its shape shows from three things
 * worked out per pixel instead: a fixed light from above and in front, the
 * horizon's glow reflected in it, and a rim of that glow where it turns away
 * from the eye. Faces marked as lights (mesh.ts) are drawn bright, with a
 * pulse that travels along them. One program for every mesh, so a headset
 * compiles it once.
 */
import * as THREE from "three";
export interface AlloyOptions {
    /** How mirror-like it is, 0 to 1. Furniture is about 0.5, a sculpture 1. */
    gloss?: number;
    /** The ground colour reflections fade into, and that distance fades to. */
    ground?: THREE.ColorRepresentation;
    /** How fast light travels along the seams. 0 holds it still. */
    speed?: number;
    /** Colours shift with the angle of view, like oil on water. 0 to 1. */
    sheen?: number;
    /** How far apart the pulses that travel along the seams are, in units of flow (metres, for most things). Default 3. */
    reach?: number;
}
export interface Alloy extends THREE.ShaderMaterial {
    /** Call each frame with seconds since the start. */
    tick(t: number): void;
    /** 0 to 1: how strongly it is being pointed at. Its lights answer. */
    aim(amount: number): void;
}
/** The sky as the reflections see it. Shared with the sky dome so the two agree. */
export declare const SKY_GLSL = "\nvec3 skyGlow(vec3 d, vec3 accent, vec3 ground){\n  float h = clamp(d.y, -1.0, 1.0);\n  float band = pow(1.0 - abs(h), 9.0);\n  float line = pow(1.0 - abs(h), 60.0);\n  vec3 up = mix(ground * 0.55, ground * 0.2, smoothstep(0.0, 0.7, h));\n  vec3 base = h > 0.0 ? up : ground;\n  return base + accent * (band * 0.4 + line * 0.9);\n}";
export declare function createAlloy(accent: THREE.ColorRepresentation, opts?: AlloyOptions): Alloy;
