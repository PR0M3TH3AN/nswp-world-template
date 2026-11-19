/**
 * Marks on the floor for a visitor moving the casual way on a flat screen:
 * where a click or a tap would take them, and, once they have pressed, where
 * they are going and the way there.
 *
 * - A **ring** under the pointer, on the spot a press would walk them to. It
 *   is never further off than one press reaches, so it also shows how far
 *   that is.
 * - A **dot** where they are headed, once they have pressed.
 * - A **dotted line** from their feet to it, which they walk along.
 *
 * They are drawn for this visitor alone. Nothing about them is sent to
 * anyone else in the room: other people see someone walking, as before.
 *
 *   const marks = createFloorMarks(accent);
 *   scene.add(marks.group);
 *   // every frame, on a flat screen, moving the casual way:
 *   marks.update({ hover: spotUnderThePointer, from: [head.x, head.z], to: stroll.target, t });
 *   // otherwise:
 *   marks.update({ hover: null, from: [head.x, head.z], to: null, t });
 */
import * as THREE from "three";
export interface FloorMarks {
    group: THREE.Group;
    update(o: {
        hover: readonly [number, number] | null;
        from: readonly [number, number];
        to: readonly [number, number] | null;
        t: number;
    }): void;
    /** How many dots the line has now, and what is showing. For tests. */
    info(): {
        ring: [number, number] | null;
        dot: [number, number] | null;
        dots: number;
    };
    dispose(): void;
}
export declare function createFloorMarks(accent: THREE.ColorRepresentation, opts?: {
    height?: number;
}): FloorMarks;
