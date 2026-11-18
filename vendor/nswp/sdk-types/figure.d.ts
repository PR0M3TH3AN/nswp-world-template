/**
 * A visitor's figure, drawn from their look (spec §4.2).
 *
 * A look is a few choices from closed lists and three colours. This turns
 * one into a head, a body and two hands, modelled with the kit (mesh.ts). It
 * is what other people in a room are drawn as, the same in every world that
 * uses it.
 *
 * A world that wants its visitors to match its own art can re-dress the
 * figure: its own material, its own palette, parts left off. The shapes stay,
 * so people can still tell each other apart. Or it can read the look and draw
 * something of its own entirely.
 */
import * as THREE from "three";
import { type Look } from "@nswp/core";
export interface FigureStyle {
    /**
     * Draw the figure in a material of the world's own. The geometry carries
     * plain vertex colours (`vertexColors: true`), with the look's lights
     * already in them. Called once per figure, with the look's light colour.
     */
    material?: (light: THREE.Color, look: Look) => THREE.Material;
    /** Keep to the world's own colours: each of the look's three becomes the nearest of these. */
    palette?: THREE.ColorRepresentation[];
    /** Parts to leave off: a world with hats of its own, say. */
    omit?: ("accessory" | "shoulders" | "mark")[];
}
/** What is known about the person, as opposed to how they chose to look. */
export interface FigureFacts {
    /**
     * Their pass checked out (protocol/10-identity.md), so the mark is their
     * identity key's. It is drawn with a lit ring round it. Never set this on
     * anyone's say-so.
     */
    proven?: boolean;
}
export interface Figure {
    group: THREE.Group;
    /** Faces -Z, like a camera. Its origin is between the eyes. */
    head: THREE.Group;
    torso: THREE.Mesh;
    hands: [THREE.Mesh, THREE.Mesh];
    /** What it is drawn in: alloy, unless a style supplied something else. */
    metal: THREE.Material;
    look: Look;
    /** Call each frame with seconds since the start, so its lights move. */
    tick(t: number): void;
    dispose(): void;
}
/**
 * Make a figure. `look` is someone's look, or a key or seed to generate one
 * from. As made, the head is at the origin facing -Z, the body hangs below
 * it and the hands rest at its sides: whoever uses it moves the parts.
 */
export declare function createFigure(look: Look | string, style?: FigureStyle, facts?: FigureFacts): Figure;
