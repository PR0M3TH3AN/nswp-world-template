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
import { type MenuSettings, type TravelSettings } from "@nswp/core";
export type { MenuSettings, TravelSettings } from "@nswp/core";
/** Say what the visitor arrived with (`arrival.read()` does). A client's own page says it for itself. */
export declare function arriveWith(settings: unknown): void;
/** What they arrived with: for a part of the kit to begin from. */
export declare function arrivedSettings(): MenuSettings;
/**
 * Say what the visitor has now, for one part of what travels. `now` is asked
 * whenever they leave. Returns how to stop being asked.
 *
 * `take` is the other way: it is given whatever the visitor's own client says has changed while they are here
 * (`changeSettings`), and sets this part's share of it as the visitor's own hand on its control would.
 */
export declare function reportSettings(part: string, now: () => TravelSettings, take?: (changed: MenuSettings) => void): () => void;
/**
 * The visitor's own client says what they have now, while they are in this world: the client draws their menu, and
 * they changed something in it (protocol/02-doors.md, "The client has the menu"). Each part of the kit that holds
 * one of these settings takes it at once. A part that hasn't started yet begins from it when it does.
 *
 * What a client says is cleaned as a link's settings are: it can turn nothing on that a link couldn't, and
 * "load people's files from anywhere" least of all. That switch is the world's own row, at the visitor's own press.
 */
export declare function changeSettings(settings: unknown): MenuSettings;
/**
 * What goes on with them: what they arrived with, and over it whatever each
 * part says they have now. So a setting that nothing here could show or
 * change (their hands in a headset, on a visit made at a desk) still goes on
 * to the next world untouched.
 */
export declare function currentSettings(): TravelSettings;
/** For tests: forget everything. */
export declare function resetSettings(): void;
