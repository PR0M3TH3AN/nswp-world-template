/**
 * Signs that hold their size in a visitor's view.
 *
 * A sign made to be read from across a room is a wall of letters to someone
 * standing next to it: it was a size in the world, and what a reader needs
 * is a size in their view. So a sign is made for one distance, and at any
 * other it is scaled by how far away the reader is, within limits: up close
 * it shrinks instead of filling the view, and far off it grows instead of
 * becoming a speck.
 *
 *   // each frame, for a sign that reads well from six metres at its own size:
 *   sign.scale.copy(natural).multiplyScalar(viewScale(camera.position.distanceTo(sign.position), { at: 6 }));
 *
 * On a flat screen, prefer not to draw such a sign in the world at all: the
 * controls have a place for what is pointed at (`controls.setTarget(text,
 * detail)`), which is always the same size and never in the way.
 */
/**
 * How much to scale a sign that is `metres` from the reader, when it is the
 * right size at `at` metres. Between `least` and `most` it keeps the same
 * size in their view; past those it is held, so it never vanishes and never
 * becomes a billboard.
 */
export declare function viewScale(metres: number, opts: {
    at: number;
    least?: number;
    most?: number;
}): number;
