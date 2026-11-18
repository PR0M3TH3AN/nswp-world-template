/**
 * The chamber: the small round room a visitor leaves from and arrives in.
 *
 * Going from one world to another means leaving one website for another, and
 * a browser shows flat pages in between: the Airlock, then the new world's
 * own page. Nothing a world draws can change that. What it can do is make the
 * two ends of the trip the same place. Walls rise round the visitor as they
 * leave; they arrive standing in the same room, and its doors open onto the
 * new world once that world is ready. Whatever was loading is behind the doors.
 *
 * **It is scenery, and proves nothing.** The world a visitor is in draws it,
 * so a dishonest world could draw it any way it liked. The check on where a
 * door really leads is the Airlock, which is the visitor's own page and which
 * no world can draw. So the chamber never asks for anything, never says
 * "verified", and has nothing in it to press (protocol/02-doors.md).
 *
 *   const crossing = createCrossing({ scene, camera, accent });
 *   crossing.arrive({ title, ready: worldLoaded, hold: () => waitingToEnterVr });
 *   await crossing.leave({ title: "The Grove", address: "grove.example" }); portal.go(...);
 *   // each frame: crossing.update(t, dt)
 */
import * as THREE from "three";
export interface Chamber {
    group: THREE.Group;
    /** How far the doors are open: 0 shut, 1 open. */
    door: number;
    /** How much of the room is there: 0 nothing, 1 all of it. The walls rise from the floor. */
    presence: number;
    /** What the sign over the doors says. The first line is the larger. */
    say(lines: string[]): void;
    tick(t: number): void;
    dispose(): void;
}
/** The room itself, standing at its group's origin with its doors towards -Z. */
export declare function createChamber(accent: THREE.ColorRepresentation, opts?: {
    textColor?: string;
}): Chamber;
export interface CrossingOptions {
    scene: THREE.Scene;
    camera: THREE.Camera;
    accent: THREE.ColorRepresentation;
    textColor?: string;
    /** Whether things may move. Someone who asked for less motion gets the room without its rising and sinking. */
    motion?: () => boolean;
}
export interface ArriveOptions {
    /** This world's name, for the sign. */
    title: string;
    /** This world's own address, for the line under it. */
    address?: string;
    /** Settles when the world is ready to be seen. The doors stay shut until then. */
    ready?: Promise<unknown>;
    /** Keep the doors shut while this is true: until the visitor has put the headset view back on, say. */
    hold?: () => boolean;
}
export type CrossingState = "none" | "arriving" | "opening" | "leaving" | "shut";
export interface Crossing {
    readonly state: CrossingState;
    /** Begin the visit inside the room. It opens when the world is ready, and then goes. */
    arrive(opts: ArriveOptions): void;
    /**
     * Bring the room up round the visitor, with where they are going over the
     * doors. Resolves when it is shut: leave then. The address shown is this
     * world's word for it; the visitor's Airlock shows the real one next.
     */
    leave(opts: {
        title: string;
        address?: string;
    }): Promise<void>;
    /** May the visitor's head be here? While the room is shut round them, only inside it. */
    allows(x: number, z: number): boolean;
    update(t: number, dt: number): void;
    dispose(): void;
}
export declare function createCrossing(o: CrossingOptions): Crossing;
