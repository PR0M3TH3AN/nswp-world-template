/**
 * What the hands mean in a headset, for a world made with another engine.
 *
 * An engine reads its own controllers. What a stick, a trigger and a button mean is not the engine's to decide: it
 * is the kit's (actions.ts, `Locomotion`), the same in every world, by the visitor's own settings (casual or
 * intense, the turn, which hand moves them, narrowing, the fade). So an engine hands what it read to `hands()` each
 * frame of a headset session, and does what comes back: turn by so much, walk so far, show where a step would
 * land, step, darken the edge. Nothing here draws or touches a headset.
 *
 *   // each frame of a session:
 *   const intent = JSON.parse(NSWP.hands(JSON.stringify({ dt, pads: [{ index: 0, hand: "left", stick: [x, y], trigger, squeeze, primary, secondary, press }, ...] })));
 *   // intent.turn (degrees, positive to the left), intent.walk ([right, ahead] in metres, as the head faces),
 *   // intent.aiming / intent.stepFrom (which hands are choosing where to step, and which let go),
 *   // intent.menu, intent.summon, intent.jump, intent.narrow (0 to 1), intent.fade, intent.mayStep, intent.stepping
 *
 * A stick is `[x, y]`, x to the right and y forward, each -1 to 1, as it was read: the dead middle is taken out
 * here. `stepped`, in the next call, says how many metres a step that was just made covered, so that the next is
 * paced as in every world: no sooner than someone running would have covered the same ground.
 */
import { BACK_STEP, type Intent } from "./actions.js";
import type { Controls } from "./ui/model.js";
/**
 * Keep how the visitor moves in a headset, with the rows in Moving that change it, for this world's controls. Called
 * once, as the engine script makes its menu. Without it `hands()` still answers, by what was kept and carried.
 */
export declare function meetHands(controls: Controls | undefined, arrivedIntense?: boolean): void;
/** The engine draws the console, and a headset session is running: ask how they would like to move, if never asked. */
export declare function askHowTheyMove(): void;
/** The engine said whether a headset session is running (`NSWP.headset`). */
export declare function handsPresenting(on: boolean): void;
/** What `hands()` answers with: the kit's `Intent`, and what an engine needs beside it to do the same as every world. */
export interface HandsAnswer extends Intent {
    /** Whether a jump the kit makes (a step, a step back) fades to black and back for this visitor. */
    fade: boolean;
    /** Whether a step may be taken now: false while the last one is still being paid for. The ring is dim until then. */
    mayStep: boolean;
    /** Whether they move the intense way: walking and turning smoothly. */
    intense: boolean;
    /**
     * Whether they move in steps. Then what `walk` says is one step, landing at once (a step back): a jump, faded for
     * someone who fades. Otherwise `walk` is how far to walk this frame, and is never faded.
     */
    stepping: boolean;
}
/**
 * What the hands mean this frame, as JSON, from JSON: `dt` (seconds since the last frame), `pads` (each controller
 * as the engine read it), and `stepped` (metres, where a step was just made). See the head of this file.
 */
export declare function hands(input: string): string;
/** For tests: forget everything, and tell the time by this. */
export declare function resetHands(now?: () => number): void;
export { BACK_STEP };
