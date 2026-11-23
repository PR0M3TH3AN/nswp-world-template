/**
 * Items in play, drawn (protocol/17-items.md): the things an item sends out, what they do to the people they
 * reach, and the item's own logic.
 *
 * Who decides what, here:
 * - **The item's script** runs in its locked box on the device of whoever carries it (`item-box.ts`). It asks for
 *   one of a few things; this file does them, or doesn't.
 * - **Every device flies a thing the same way,** from the few numbers its sender said (`shotAt` in the core):
 *   straight on and falling, so it has to be aimed higher to go further.
 * - **It sticks to whatever solid shape it meets:** any mesh of the world. Nothing of the world has to be an
 *   item. It lets go after a few seconds, drops, and is gone.
 * - **The person a thing reaches decides that it did,** on their own device, and says so. Until they have, it
 *   only looks stuck to them, and drops off if they never say so.
 * - **What it does to them is the world's rule.** Where the world has none, it takes from their health
 *   (`HEALTH`), which comes back by itself.
 *
 * Nothing here runs anything of an item on anyone's device but its carrier's. What the others get is words: a
 * thing was sent out from here, going this way.
 */
import { type Item } from "@nswp/core";
import * as THREE from "three";
import { allowScript, mayHold, scriptAllowed } from "./hold.js";
import { type ItemBoxOptions } from "./item-box.js";
import type { Items } from "./items.js";
import type { Sounds } from "./sound.js";
/** Someone else in the room, as this needs them: where they are, what to stick things to, what they hold. */
export interface PlayPerson {
    pubkey: string;
    /** Where their head is, in the world. */
    head: THREE.Vector3;
    /** Something of theirs that moves with them, for a thing to stay stuck to. */
    body: THREE.Object3D;
    /** Their head, to put a bar over. */
    over: THREE.Object3D;
    /** The whole of their figure, which blinks while they have nothing left. */
    root?: THREE.Object3D;
    /** The item they say they hold, by its coordinate, and what is drawn for it. */
    holding: string;
    held: THREE.Object3D | null;
}
export interface PlayOptions {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    /** What the visitor stands on: its height is the floor under them. */
    rig: THREE.Object3D;
    items: Items;
    sounds?: Sounds | null;
    /** What this place does with items. Nothing happens here where it is "none". */
    rule(): string;
    /** Whether an item's own logic runs in this world, and where its box is served. Left out, items are shapes. */
    scripts?: boolean | ItemBoxOptions;
    /** Who this visitor is in the room, or null while they are in none. */
    me(): string | null;
    people(): PlayPerson[];
    /** Whether this visitor has muted what that person's items do. Asked only where items are allowed, not where they are the game. */
    itemsMuted?(pubkey: string): boolean;
    /** Say something of an item in play to the room. */
    tell(said: string): void;
    /** Where a thing leaves from when this visitor sends one out, and which way. Left out, from beside their view, to where it looks. */
    aim?: () => {
        from: THREE.Vector3;
        to: THREE.Vector3;
    } | null;
    /** Whether a shape of the world is solid to things sent out. Left out, every mesh that can be seen is. */
    solid?: (mesh: THREE.Mesh) => boolean;
    /** Be told when a thing sticks to a shape of the world: the world's own rule decides what that means. */
    onStruck?: (what: {
        object: THREE.Object3D;
        point: THREE.Vector3;
        by: string;
        name: string;
    }) => void;
    /** Be told when this visitor's state changes, or what their item shows. */
    onChange?: () => void;
    /** Whether they are in a headset now: there, a thing goes where the hand points, and no ring is drawn. */
    presenting?: () => boolean;
    /** The world's own colour, for what is drawn of how the visitor is, and whether things may move for them. */
    theme?: () => {
        accent?: string;
        motion?: boolean;
    };
    /** Whether they are aiming along their item's sight now: then its own mark is what they aim by, and no ring is drawn. */
    sighting?: () => boolean;
    /**
     * The world is drawn by something else (another engine), which is the one that knows its shapes. Then nothing
     * here looks for what a thing ran into: each frame `snapshot()` says where each thing went, whatever draws the
     * world tests that, and says what it met with `met()` and where the floor is with `floored()`, a frame later.
     * Everything else is exactly as it is for a world drawn here: one flight, one set of rules.
     */
    deferred?: boolean;
    /**
     * The colours someone chose for what they hold: the visitor's own for their own key (or null, outside a room),
     * anyone else's as they said them. Left out, everything is the colour its maker gave it.
     */
    tintsOf?: (pubkey: string | null) => Record<string, string>;
}
export interface Play {
    /** This visitor took an item in hand, with what is drawn for it; or put it away, with nulls. */
    held(item: Item | null, model: THREE.Object3D | null): Promise<void>;
    /**
     * The item's first press, and its second: what they do is its own to say. With `toward`, whatever the first
     * press sends out goes that way: where a visitor tapped or clicked.
     */
    use(toward?: THREE.Vector3): void;
    second(): void;
    /** Whether what they hold does anything on a press, and what its presses are called. */
    readonly does: {
        use: string;
        second: string;
    } | null;
    /** What their item shows of itself: its counter. */
    readonly words: string;
    /** How they are, by the rules of this place. */
    readonly health: {
        value: number;
        full: number;
    };
    /** A member said something of an item in play. */
    heard(from: string, said: string): void;
    /** A member left: what was theirs goes with them. */
    left(pubkey: string): void;
    update(dt: number): void;
    /** For tests: what is in the air, stuck and lying, and what has happened. */
    info(): PlayInfo;
    /** Everything there is to draw this frame, as plain numbers: for a world drawn by another engine (`deferred`). */
    snapshot(): PlaySnapshot;
    /** A thing met a shape of the world, part of the way along a step `snapshot()` asked to have tested. */
    met(key: string, step: number, fraction: number, point: [number, number, number], ref?: string): void;
    /** Where the floor is under a thing that has let go. */
    floored(key: string, y: number): void;
    dispose(): void;
}
export interface PlayInfo {
    flying: number;
    stuck: number;
    falling: number;
    /** Where each thing is, and what it is stuck to: "world", a person's key, or "" in the air. */
    things: {
        by: string;
        id: number;
        state: string;
        on: string;
        onto: string;
        at: [number, number, number];
    }[];
    sent: number;
    /** How many of this visitor's things reached someone who said so. */
    landed: number;
    /** How many of other people's things reached this visitor. */
    taken: number;
    health: {
        value: number;
        full: number;
    };
    words: string;
    script: "none" | "running" | "stopped";
    /** Why the script last stopped, where it did: "silent", "asked", "no box", "failed". */
    stoppedBecause: string;
    /** Whether the mark that says "you hit someone" is showing. */
    marked: boolean;
    bars: Record<string, {
        value: number;
        full: number;
    }>;
}
/** What there is to draw, with nothing of any renderer in it. Distances are metres; a turn is x, y, z, w. */
export interface PlaySnapshot {
    things: {
        key: string;
        /** Which model: the hash its file is named by, and its box. */
        model: string;
        size: [number, number, number];
        /** The colours whoever sent it chose. */
        tints: Record<string, string>;
        state: "flying" | "stuck" | "falling" | "lying";
        /** What it is stuck to: "world", a person's key, or "". And what the engine said it met, where it said. */
        on: string;
        ref: string;
        at: [number, number, number];
        turn: [number, number, number, number];
        scale: number;
        /**
         * A step to test against the world's shapes: from `a` to `b`. Null where there is nothing to test. A thing
         * falls as it flies, so a step that took a while is a curve: `via` is then the places it passed between the
         * two, evenly spaced in time. Test from `a` through each to `b`, in order, and say how far along the whole
         * step the first meeting was (a meeting half way along the second of four pieces is 0.375).
         */
        test: {
            step: number;
            a: [number, number, number];
            b: [number, number, number];
            via?: [number, number, number][];
        } | null;
        /** It has let go and is falling: where is the floor under it? */
        down: boolean;
    }[];
    /** A streak of light behind a thing: points along its middle, each with how bright it is there, from 0 to 1. */
    trails: {
        key: string;
        color: string;
        width: number;
        points: [number, number, number, number][];
    }[];
    own: {
        /** The ring that says where a thing will go, and the mark that says one reached someone. */
        cross: boolean;
        mark: boolean;
        /** How they are, and how much of the bar to show, from 0 to 1. */
        health: {
            value: number;
            full: number;
            growing: number;
            down: boolean;
            shown: number;
        };
        /** How red the edge of the view is, from 0 to 1, and whether the view is breaking up. */
        red: number;
        glitch: boolean;
        /** What their item shows of itself. */
        words: string;
    };
    /** Animations of an item's own that began since the last snapshot: whose ("" for the visitor's own), and which. */
    clips: {
        who: string;
        name: string;
    }[];
}
export { allowScript, mayHold, scriptAllowed };
export declare const paintHealth: (g: CanvasRenderingContext2D, w: number, h: number, o: {
    value: number;
    full: number;
    accent: string;
    growing?: number;
    down?: boolean;
    heart?: boolean;
}) => void;
export declare function createPlay(o: PlayOptions): Play;
