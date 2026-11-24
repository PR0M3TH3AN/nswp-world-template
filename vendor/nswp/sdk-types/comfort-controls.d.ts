/**
 * How a visitor moves in a headset: what they chose, kept in this browser and carried from world to world, and the
 * rows in Moving that change it. Casual or intense, the turn, which hand moves them, narrowing, the fade; and the
 * one question, asked the first time they are in a headset with no choice said or kept.
 *
 * It draws nothing and touches no headset, so that every world has the same rows and the same choices whatever it
 * is made with: a Three.js world's hands (input.ts) and the engine script (engine-hands.ts) both keep it here.
 * Moved out of input.ts word for word, with the two things it asked of the renderer (whether a session is running,
 * and to be told when one starts) handed in.
 */
import { type Comfort } from "./actions.js";
import type { Controls } from "./ui/model.js";
/** The words of the question asked once, the first time a visitor is in a headset with no choice said or kept. */
export declare const MOVE_QUESTION: {
    readonly casual: "Casual: point to step, turn in notches";
    readonly intense: "Intense: walk and turn smoothly with the sticks";
};
export interface ComfortOptions {
    /** The world's controls: the rows in Moving are added to them, and the one question. Left out, there are no rows. */
    controls?: Controls;
    /** They were moving the intense way in a headset where they came from (their own client says so). */
    arrivedIntense?: boolean;
    /** Whether a headset session is running now. */
    presenting(): boolean;
    /** Be told when a headset session starts. Returns how to stop. */
    onSessionStart?(fn: () => void): () => void;
}
export interface ComfortKeeper {
    /** How they move, as it is now. */
    readonly comfort: Comfort;
    /** Change it. `keep` remembers it as their own choice, for this site and the next. */
    setComfort(patch: Partial<Comfort>, keep?: boolean): void;
    dispose(): void;
}
export declare function keepComfort(o: ComfortOptions): ComfortKeeper;
