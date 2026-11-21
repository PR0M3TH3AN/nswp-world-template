/**
 * A straight row of doors, as distances along the wall from its middle, left
 * to right: the least a wall can be and hold them. `apart` may be more than
 * the spacing, never less.
 */
export declare function doorRow(count: number, apart?: number): number[];
/**
 * The angle between two neighbouring doors standing on a circle of this
 * radius, facing its middle, in radians: the smallest that keeps their
 * middles `DOOR_SPACING` apart in a straight line. A circle too small to
 * hold two doors at all gives a half turn.
 */
export declare function doorArcStep(radius: number): number;
/**
 * How many doors a wall that curves through `span` radians of a circle of
 * this radius holds. More than that go somewhere else: a list, another wall.
 * A door is never squeezed in.
 */
export declare function doorsOnArc(radius: number, span: number): number;
/** A door's place on the floor: `[x, y, z]` as a world writes it, or its `x` and `z`. */
export type DoorPlace = readonly [number, number, number] | {
    readonly x: number;
    readonly z: number;
};
/**
 * Every two doors standing nearer than `DOOR_SPACING`: which two, by their
 * place in the list, and how far apart they are. Empty when all is well.
 * Height is left out: doors on two floors, one over the other, are a
 * building's business.
 */
export declare function doorsTooClose(doors: readonly DoorPlace[]): {
    a: number;
    b: number;
    apart: number;
}[];
