/**
 * Walking to a spot on a flat screen.
 *
 * A tap or a click on the floor used to be a jump of up to five metres, which
 * is how a headset moves (a slide there turns stomachs) and is wrong for a
 * phone or a desk: the room lurches, and a visitor loses where they were. So
 * on a flat screen a tap is a walk, at the pace the keys walk, to a spot no
 * further than a few steps away. A second tap changes where they are headed.
 *
 *   const stroll = createStroll({ where: () => [head.x, head.z], canStand, move: (dx, dz) => { rig.position.x += dx; rig.position.z += dz; } });
 *   // a tap on the floor, outside a headset:
 *   stroll.to(...reachOf(head.x, head.z, spot.x, spot.z));
 *   // every frame:
 *   stroll.update(dt);
 *   // a key was pressed, a door was taken, a headset session began:
 *   stroll.stop();
 */
/** Metres a second: the pace the keys walk at, and so the pace a tap walks at. */
export declare const WALK_SPEED = 2.4;
/** How far one tap or click takes a visitor on a flat screen, in metres. A little over a second of walking. */
export declare const TAP_REACH = 3;
/** The spot a tap leads to: the one tapped, or the point `reach` metres towards it when it is further off. */
export declare function reachOf(fromX: number, fromZ: number, toX: number, toZ: number, reach?: number): [number, number];
export interface Stroll {
    /** Start walking to (x, z), from wherever the visitor is. */
    to(x: number, z: number): void;
    /** Stop where they are. */
    stop(): void;
    /** Call every frame with the seconds since the last. */
    update(dt: number): void;
    /** Whether they are on their way somewhere. */
    readonly going: boolean;
}
export declare function createStroll(o: {
    /** Where the visitor's head is over the floor. */
    where(): [number, number];
    /** May they stand at (x, z)? */
    canStand(x: number, z: number): boolean;
    /** Move them by this much. */
    move(dx: number, dz: number): void;
    /** Metres a second. */
    speed?: number;
}): Stroll;
