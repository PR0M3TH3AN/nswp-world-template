import type { Controls, UiAction } from "./model.js";
/**
 * A "Sign in" press wherever a tab says to sign in (the owner, 2026-11-25: "can we have a "sign in" button anywhere
 * in the menus that we say something like "sign into bitlogin to use this feature""). It does what You's sign-in row
 * does, in one press: the client's sign-in under a client that has one, the visitor's own sign-in window otherwise.
 * It isn't there once they are signed in, or where nobody can be (no sign-in address was named).
 *
 * You's row (`signerAction`, ui/identity.ts) says how to sign in for the controls it is added to; this asks it.
 * So this module holds nothing of the signer's, and the controls kit can carry it without the rest.
 */
export interface SignInOffer {
    /** Whether a "Sign in" press is wanted just now. The one place this is decided. */
    wanted(): boolean;
    /** What it says: "Sign in", or that the sign-in address is being asked again, or didn't answer. */
    label(): string;
    /** Start signing in, exactly as You's row does. */
    press(): void;
}
/** Said by You's sign-in row as it is made: how these controls sign in. */
export declare function offerSignIn(controls: Controls, offer: SignInOffer): void;
/**
 * The "Sign in" row for the tab `section`, with the id `sign-in-<section>`. A world's own tab that says to sign in
 * adds it too: `controls.add(signInHere(controls, "my-tab"))`, before the tab's other rows, so it is at the top.
 */
export declare function signInHere(controls: Controls, section: string): UiAction;
/**
 * A press that needs the visitor signed in, made while they aren't (Follow, Write, Show, Post): says why, and starts
 * signing in there and then, as the front room's "Sign in to buy" does, so no line sends them elsewhere to do it.
 * Where nobody can sign in here, it only says why. The kit's own; not part of the package's entries.
 */
export declare function signInFirst(controls: Controls, line: string): void;
