import { type GoOptions } from "../index.js";
import { type WorldSigner } from "../signer.js";
import type { Controls, UiAction, UiSection } from "./model.js";
/** The words for who a visitor is here, for a world that draws this itself. */
export declare function identityWords(): {
    signedIn: boolean;
    name: string;
    label: string;
    short: string;
};
/** Where signing in happens: the host of the visitor's own client. Null when they came through none. */
export declare function identityHost(): string | null;
/** What the section says: where they will be taken, and that the world never sees it. */
export declare const identitySection: () => UiSection;
/** The visitor's state as they go, so they come back as they left. A world may bring its crossing's room up first. */
export type Leaving = (to: {
    title: string;
    address: string;
}) => GoOptions | Promise<GoOptions>;
/**
 * The control. `leaving` is the visitor's state as they go (in a room, with a
 * microphone on, moving the intense way, in a headset session), so they come
 * back as they left.
 */
export declare function identityAction(controls: Controls, leaving?: Leaving): UiAction;
/** What to say when a signer that was named didn't answer: what happened, and the one thing likely to help. */
export declare function unansweredWords(signer: WorldSigner): string;
/** This page's one signer, from the visitor's own client (signer.ts). "none" when they came through no client. */
export declare function worldSigner(): WorldSigner;
/**
 * The control that unlocks the visitor's signer for this world, and locks it
 * again (protocol/10-identity.md, "Signing from a world"). Unlocking opens a
 * window of their own client, where they say yes. Nothing is typed here.
 */
export declare function signerAction(controls: Controls, opts?: {
    presenting?: () => boolean;
}): UiAction;
/**
 * The way to change how they look. Their look is kept by their own client and
 * is the same in every world, so it is changed there: this leaves for it and
 * comes back, as signing in does.
 */
export declare function figureAction(controls: Controls, leaving?: Leaving): UiAction;
