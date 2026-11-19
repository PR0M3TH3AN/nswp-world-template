/**
 * Settings that travel with a visitor from world to world.
 *
 * Each part of the kit that holds something a visitor sets (their volumes,
 * the size of their text, their hands in a headset, whether their screen is
 * filled) does two things here. When it starts, it asks what they arrived
 * with and begins from that, in place of what this site remembered. And it
 * says what they have now, so that it can go on with them through the next
 * door. Nothing else has to know: `arrival.read()` says what they arrived
 * with, and `portal.go()` and `portal.home()` send what they have.
 *
 * What may travel, and why it is only ever a preference, is in the core
 * (`settings.ts`) and in protocol/11-the-visitors-console.md.
 */
import { type TravelSettings } from "@nswp/core";
export type { TravelSettings } from "@nswp/core";
/** Say what the visitor arrived with (`arrival.read()` does). A client's own page says it for itself. */
export declare function arriveWith(settings: unknown): void;
/** What they arrived with: for a part of the kit to begin from. */
export declare function arrivedSettings(): TravelSettings;
/**
 * Say what the visitor has now, for one part of what travels. `now` is asked
 * whenever they leave. Returns how to stop being asked.
 */
export declare function reportSettings(part: string, now: () => TravelSettings): () => void;
/**
 * What goes on with them: what they arrived with, and over it whatever each
 * part says they have now. So a setting that nothing here could show or
 * change (their hands in a headset, on a visit made at a desk) still goes on
 * to the next world untouched.
 */
export declare function currentSettings(): TravelSettings;
/** For tests: forget everything. */
export declare function resetSettings(): void;
