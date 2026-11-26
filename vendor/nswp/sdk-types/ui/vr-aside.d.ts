/**
 * Out of VR for a moment, and back in one press (docs/backlog/bitlogin-from-a-headset.md, everything-in-vr.md). The
 * owner, 2026-11-25: "just make it as rare and a seemless as possible", and "the only thing that should force us out
 * of VR is the initial phone pairing and the browsers immurrsive VR site to site limitation".
 *
 * A headset draws nothing but the world, so BitLogin's own screens (its panel, its window, its page for signing in
 * from a phone) can't be seen in one. Where a press needs one, `outOfVr` ends the session itself and opens it, in
 * that same press; then "Back into VR" is up over the page, pressable once BitLogin's screen has gone, and one press
 * goes back in where they were (place, facing, what is in hand: ending a session moves nothing).
 *
 * Kept small and replaceable: only the few reasons in `VR_ASIDE` come here, and a test of the kit's own source holds
 * it to them (packages/sdk/test/vr-aside.test.ts). Once BitLogin's screens are drawn in VR for a visitor who chose
 * that, the wallet's, Files', buying's and an Allow's go away from here. The kit's own; not in any entry.
 */
import type { Controls } from "./model.js";
/** Why a press goes out of VR: the few things only BitLogin's own screens can do. */
export declare const VR_ASIDE: readonly ["sign-in", "secure", "wallet", "files", "buy", "allow"];
export type VrAsideWhy = (typeof VR_ASIDE)[number];
/**
 * What the press opened. `shown`: whether BitLogin's screen is up (false: the browser refused a window). `gone`: when
 * it has gone again (closed, or answered), and "Back into VR" may be pressed.
 */
export interface Opened {
    shown: boolean;
    gone: Promise<void>;
}
/** What a page with a headset session lends `outOfVr` (three.ts, `addViewControls`). */
export interface VrAsideHost {
    presenting(): boolean;
    /** End the session. Nothing about where they stand or what they hold changes. */
    end(): Promise<void>;
    /** Put up "Back into VR", pressable once `waiting` is done. */
    back(waiting: Promise<void>): void;
    /** Put up one press that opens BitLogin, where the browser refused to from inside VR; then "Back into VR". */
    openFromHere(open: () => Opened): void;
}
/** Said by `addViewControls` for the controls of a page that can be in a headset. */
export declare function hostVrAside(controls: Controls, host: VrAsideHost): void;
/** The one line before the first time, on this device. */
export declare const VR_ASIDE_WORDS = "This opens BitLogin outside VR for a moment. Press Back into VR when you're done.";
/**
 * Open BitLogin's screen for `why`, from the visitor's press. Out of a headset it just opens. In one, the session is
 * ended, the screen opened in the same press, and "Back into VR" put up; where a window was refused, one press on
 * the flat page opens it.
 */
export declare function outOfVr(controls: Controls, open: () => Opened, why: VrAsideWhy): Opened;
/** A window of BitLogin's: gone once it is closed. Watched, since a closed window says nothing. */
export declare function whenWindowGone(win: Window | null): Promise<void>;
/**
 * BitLogin's screen opened by the signer or the client, which could be the client's panel or a window: gone when
 * the client says its panel has closed, or, for a window, when this page has the focus back.
 */
export declare function whenScreenGone(panel: boolean): Promise<void>;
