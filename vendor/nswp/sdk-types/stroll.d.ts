/**
 * Walking to a spot on a flat screen.
 *
 * A tap or a click on the floor used to be a jump of up to five metres, which
 * is how a headset moves (a slide there turns stomachs) and is wrong for a
 * phone or a desk: the room lurches, and a visitor loses where they were. So
 * on a flat screen a tap is a walk, at the pace the keys walk, to a spot no
 * further than a few metres away.
 *
 * **A path, clicked out.** A tap while they are already walking doesn't start
 * again from their feet: it adds a stretch to the way they are going, from
 * where the last tap ended. So a visitor taps out a path as they walk it,
 * round a corner or between things, and the line on the floor is that path.
 *
 * **They face the way they walk.** While a walk is on, the view turns to
 * look along the stretch being walked, at an easy rate (`face`). Tapping
 * ahead is then always tapping where they are looking.
 *
 * Two taps close together are a run, straight to that spot, whatever was
 * planned: the way to change one's mind, and the only way to run for a
 * visitor with no keys to hold. Each tap after that keeps them running until
 * they arrive somewhere.
 *
 *   const stroll = createStroll({ where: () => [head.x, head.z], canStand, move: (dx, dz) => { rig.position.x += dx; rig.position.z += dz; } });
 *   // a tap on the floor, outside a headset:
 *   stroll.tap(spot.x, spot.z);
 *   // every frame:
 *   stroll.update(dt);
 *   if (stroll.going && !dragging) rig.rotation.y = stroll.face(rig.rotation.y, dt);
 *   // a key was pressed, a door was taken, a headset session began:
 *   stroll.stop();
 */
/** Metres a second: the pace the keys walk at, and so the pace a tap walks at. */
export declare const WALK_SPEED = 2.4;
/** How much faster a run is than a walk, however it is asked for: Shift, two taps, or a stick pressed in. */
export declare const RUN = 1.75;
/**
 * Radians a second: how fast the left and right arrow keys turn someone, the casual way on a flat screen. A
 * quarter turn in a little under a second: quick enough to look about, slow enough to stop where they meant.
 */
export declare const KEY_TURN = 1.9;
/**
 * The fastest anyone goes on foot, in metres a second: a run. Nobody in a room covers ground faster than this,
 * whatever they hold or wear: keys, a mouse, a finger on a phone, or a headset's sticks and steps.
 */
export declare const TOP_SPEED: number;
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
/** How many stretches a path may have waiting. More taps than this are not added until some are walked. */
export declare const PATH_MOST = 12;
/** How fast the view turns to face the way they walk, at most, in radians a second: a little under half a turn. */
export declare const FACE_RATE = 2.8;
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
/**
 * The pace of stepping. In a headset the casual way to move is a step that lands at once, because a slide there
 * turns stomachs. Left unpaced, a press is a jump of five metres and a visitor who presses fast enough outruns
 * everybody. So each step is paid for after it is taken: the next may not land until someone running would have
 * covered the same ground. A short step is ready again almost at once; a long one takes about a second.
 *
 *   const pace = createStepPace();
 *   // a step of `far` metres is asked for:
 *   if (pace.take(far)) moveThere();
 *   // each frame, to show whether a press would do anything:
 *   reticle.material.opacity = pace.ready ? 0.8 : 0.25;
 */
export interface StepPace {
    /** Take a step of this many metres, if one may be taken now. False, and nothing is spent, if it is too soon. */
    take(metres: number): boolean;
    /** Whether a step may be taken now. */
    readonly ready: boolean;
    /** Seconds until one may. 0 when ready. */
    readonly wait: number;
}
export declare function createStepPace(o?: {
    speed?: number;
    now?: () => number;
}): StepPace;
export interface Stroll {
    /**
     * Start walking to (x, z), from wherever the visitor is, and forget any path they had tapped out. Asked twice
     * close together, or while already running, or with `run` true, they run there. For a walk the page starts
     * itself (up to a door, say). A press on the floor is `tap`.
     */
    to(x: number, z: number, run?: boolean): void;
    /**
     * A press on the floor at (x, z). Standing still, it starts a walk towards it, no further than one press
     * reaches. Already walking, it adds a stretch to the path, from where the path ends, as far as one press
     * reaches from there. Two presses close together are a run straight to the spot, with the rest forgotten.
     */
    tap(x: number, z: number): void;
    /** Where a press at (x, z) would lead: for the ring under the pointer. From the end of the path while walking. */
    reach(x: number, z: number): [number, number];
    /** Whether they are running to where they are headed. */
    readonly running: boolean;
    /** Where they will end up, or null: the end of the path. */
    readonly target: readonly [number, number] | null;
    /** The way they are going: each spot still to be walked to, in order. Empty when they are standing. */
    readonly path: readonly (readonly [number, number])[];
    /**
     * The way they are walking now, as a turn about the vertical for something that looks down -Z (a three.js
     * camera's rig), in radians. Null when they are standing.
     */
    readonly heading: number | null;
    /** `yaw`, turned a little towards the way they are walking: call it every frame of a walk with their own turn. */
    face(yaw: number, dt: number): number;
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
    /** How far one press reaches, in metres. `TAP_REACH` when left out. */
    reach?: number;
    /** Called when something in the way stopped the walk short. */
    onBlocked?: () => void;
    /** The time now, in milliseconds. For tests. */
    now?: () => number;
}): Stroll;
