/**
 * Staying put through a refresh.
 *
 * Someone building a world refreshes it all day. Being sent back to the
 * entrance each time, facing the wrong way, makes every change feel like
 * starting again. This remembers where a visitor stood and which way they
 * faced, for this tab only, and gives it back when the page comes up again
 * because it was refreshed. Arriving any other way is an arrival: through a
 * door, by a link, in a new tab.
 *
 *   const stay = createStay();
 *   const stood = arrivedThroughADoor ? null : stay.before;
 *   if (stood) { rig.position.set(stood.x, 0, stood.z); rig.rotation.y = stood.yaw * Math.PI / 180; }
 *   // now and then, and as the page goes:  stay.keep({ x, z, yaw, headset })
 *
 * A refresh always ends a headset session: that is the browser's rule, not
 * ours. `headset` says they were in one, so the way back in can be offered
 * first and alone.
 */
export interface Stood {
    x: number;
    z: number;
    /** Which way they faced, in degrees round the vertical. */
    yaw: number;
    /** Whether they were in a headset session when the page went. */
    headset: boolean;
    /** Seconds since 1970. */
    at: number;
}
/** Read what was kept, or null for anything that isn't a place someone could have stood. */
export declare function cleanStood(input: unknown, now: number, maxAgeSec?: number): Stood | null;
/** Whether this page came up because it was refreshed. */
export declare function wasRefreshed(): boolean;
export interface Stay {
    /** Where they stood before a refresh brought this page up, or null on any other kind of arrival. */
    readonly before: Stood | null;
    keep(now: {
        x: number;
        z: number;
        yaw: number;
        headset: boolean;
    }): void;
    /** Forget it: they left on purpose. */
    clear(): void;
}
export declare function createStay(o?: {
    name?: string;
    refreshed?: boolean;
    storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
    now?: () => number;
}): Stay;
