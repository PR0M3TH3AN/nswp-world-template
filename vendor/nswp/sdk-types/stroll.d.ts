/**
 * Walking to a spot on a flat screen.
 *
 * A tap or a click on the floor used to be a jump of up to five metres, which
 * is how a headset moves (a slide there turns stomachs) and is wrong for a
 * phone or a desk: the room lurches, and a visitor loses where they were. So
 * on a flat screen a tap is a walk, at the pace the keys walk, to a spot no
 * further than a few metres away. A second tap changes where they are headed.
 *
 * Two taps close together are a run: the same few steps, taken at a run, and
 * each tap after that keeps them running until they arrive somewhere. It is
 * the only way to run for a visitor with no keys to hold.
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
/** How much faster a run is than a walk, however it is asked for: Shift, two taps, or a stick pressed in. */
export declare const RUN = 1.75;
/** Two taps within this many milliseconds are a run. */
export declare const DOUBLE_TAP = 400;
/**
 * How far one tap or click takes a visitor on a flat screen, in metres: two and a half seconds of walking.
 *
 * It was three. But a visitor standing up, looking level, can't see the floor nearer than about 2.8 metres: it is
 * below the bottom of their screen. So the mark for where a press would take them, and the line to it, were never
 * on screen. At six they are in the lower part of the view, where a press on the floor is made. It is still a walk
 * at the keys' pace and never a jump, and it is shown before it is taken, so it surprises nobody.
 */
export declare const TAP_REACH = 6;
/** How far dragging turns a visitor on a flat screen, in radians a pixel. Dragging right brings what was on the left round. */
export declare const DRAG_LOOK = 0.005;
/** The spot a tap leads to: the one tapped, or the point `reach` metres towards it when it is further off. */
export declare function reachOf(fromX: number, fromZ: number, toX: number, toZ: number, reach?: number): [number, number];
/**
 * The spots of a dotted line over the floor from one place to another: evenly spaced, starting a little way out
 * from under the visitor's feet and stopping short of where they are going, which has a mark of its own.
 */
export declare function dotsBetween(fromX: number, fromZ: number, toX: number, toZ: number, opts?: {
    gap?: number;
    clear?: number;
    short?: number;
    most?: number;
}): [number, number][];
export interface Stroll {
    /**
     * Start walking to (x, z), from wherever the visitor is. Asked twice close together, or while already
     * running, or with `run` true, they run there.
     */
    to(x: number, z: number, run?: boolean): void;
    /** Whether they are running to where they are headed. */
    readonly running: boolean;
    /** Where they are headed, or null: for showing them, and nobody else, where a tap is taking them. */
    readonly target: readonly [number, number] | null;
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
    /** Called when something in the way stopped the walk short. */
    onBlocked?: () => void;
    /** The time now, in milliseconds. For tests. */
    now?: () => number;
}): Stroll;
