/**
 * Who the visitor is here, and the way to change it: sign in, switch to
 * another profile, or go on as a guest.
 *
 * A world never shows a sign-in and never holds a key
 * (protocol/09-what-a-world-owes.md). So this control does one thing: it
 * leaves for the visitor's own client, which asks them in its own way and
 * brings them back through its Airlock, with a pass if they chose to come by
 * name (protocol/10-identity.md, "Signing in from inside a world"). What it
 * says is what the world was told on arrival, and nothing else.
 *
 * It is there only for a visitor who came through a client: with no Airlock
 * to go back to, there is nobody to ask.
 */
import { type NostrEvent } from "@nswp/core";
import { arrival, type GoOptions } from "../index.js";
import { type PaidGate, type PaidGateOptions } from "../front-room.js";
import { type People } from "../people.js";
import { type Saves } from "../saves.js";
import { type WorldSigner } from "../signer.js";
import type { Controls, UiAction, UiCard, UiSection } from "./model.js";
/**
 * Whether signing in here means unlocking a signer: the visitor's client named one
 * (protocol/10-identity.md, "One sign-in"). Then there is one sign-in in this world and it is that one. A
 * client's own pages are not a world it sent someone to: there they are signed in already, its own way.
 */
export declare function signerNamed(): boolean;
/**
 * Who the visitor is here, now. With no signer named, what their pass says. With one, their pass counts only
 * while that signer is unlocked for this world and holds the pass's own key: signed out, they are a guest,
 * whatever they arrived with. So nothing here says "you are here as" someone who isn't signed in.
 */
export declare function hereAs(): ReturnType<typeof arrival.identity>;
/** Be told when who the visitor is here may have changed: a pass arrived from their signer. Returns how to stop. */
export declare function onHereAs(fn: () => void): () => void;
/**
 * A pass from the signer (protocol/10-identity.md, "A pass from the signer"). Signed in here with no pass for
 * that key (their client sent none, or one for someone else, or it ran out), the signer is asked for one: for a
 * session key made here, for this site. What comes back is checked and kept as an arrival's pass is. A signer
 * that makes none never answers, and the visitor stays a guest.
 */
export declare function seekPass(): Promise<void>;
/**
 * The same question for a room about to be joined, with a moment's wait for a signer that hasn't spoken yet:
 * one that remembers this world says so just after the page loads, and a room joined before that would be
 * joined as a guest. Signed in with no pass for that key, the signer is asked for one, and waited on briefly.
 */
export declare function byName(identity: {
    pass: NostrEvent;
    sessionKey: string;
} | undefined): Promise<{
    pass: NostrEvent;
    sessionKey: string;
} | undefined>;
/** The words for who a visitor is here, for a world that draws this itself. */
export declare function identityWords(): {
    signedIn: boolean;
    name: string;
    label: string;
    short: string;
};
/** Who they are signed in as, as a card at the head of You: their picture, their name, their key. Null for a guest. */
export declare function youCard(): UiCard | null;
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
 * This world's saves (saves.ts, protocol/12-saves.md): on this device for anyone, and with their account for a
 * visitor who is signed in here. One for the page, using the page's one signer.
 */
export declare function worldSaves(): Saves;
/**
 * A gate for a paid world (front-room.ts; protocol/10-identity.md, "The front room"), using the page's one signer
 * and the world's own manifest. A world puts it where it likes and reads `open`.
 */
export declare function worldGate(opts?: Omit<PaidGateOptions, "signer">): PaidGate;
/**
 * The world's own rules for its rooms, as this page's gate last read them from the world's own manifest and its
 * owner's lists (protocol/10-identity.md, "A world's own lists"): who the owner keeps out, whether only named
 * people are shown, and, where the world is by invitation, who may be in them. Nothing, false and null where the
 * page has no gate. A room joined here takes them (presence.ts).
 */
export declare function pageRules(): {
    blocked: readonly string[];
    namedOnly: boolean;
    invited: readonly string[] | null;
    takesGuests: boolean;
    guestItems: boolean;
};
/** Be told when those rules may have changed. Returns how to stop. */
export declare function onPageRules(fn: () => void): () => void;
/**
 * Who this world's visitor follows, and following for them (people.ts, protocol/14-people-and-messages.md): for a
 * visitor who is signed in here and has let this world do so. One for the page, using the page's one signer.
 * Nothing is asked of a relay about them until this is used.
 */
export declare function worldPeople(): People;
/**
 * The control that unlocks the visitor's signer for this world, and locks it
 * again (protocol/10-identity.md, "Signing from a world"). Unlocking opens a
 * window of their own client, where they say yes. Nothing is typed here.
 */
export declare function signerAction(controls: Controls, opts?: {
    presenting?: () => boolean;
}): UiAction;
/** What a guest account is told as it is signed in (BitLogin's docs/guest-accounts.md, G8). */
export declare const GUEST_WORDS = "You're a guest. Every world in BitPortal knows it's the same guest. This account lives in this browser only: secure it, under You, to keep it.";
/**
 * Their account at the sign-in address, without leaving the world: its own pages (other accounts, the lock, the
 * password, recovery, what it keeps), in the panel the visitor's client draws over the world (client-frame.ts).
 * Only where there is such a panel, for this world's own signer's address: a world never shows any of it itself.
 */
export declare function accountAction(controls: Controls, opts?: {
    presenting?: () => boolean;
}): UiAction;
/**
 * Their own files, without leaving the world: the file browser of their sign-in address (folders, public and
 * private files, the servers they keep them on), in the panel their client draws over the world. The world sees
 * none of it: it is the sign-in address's page, and a world is handed a file only when the visitor picks one for
 * it (`signer.pickFile`). Only where there is such a panel.
 */
export declare function filesAction(controls: Controls, opts?: {
    presenting?: () => boolean;
}): UiAction;
/**
 * What they have bought, without leaving the world: the receipts their sign-in address keeps for them, in the
 * panel their client draws over the world. The world sees none of it: a world is told only of its own things
 * (`signer.have`). Only where there is such a panel.
 */
export declare function libraryAction(controls: Controls, opts?: {
    presenting?: () => boolean;
}): UiAction;
/**
 * The way to change how they look. Their look is kept by their own client and
 * is the same in every world, so it is changed there: this leaves for it and
 * comes back, as signing in does.
 */
export declare function figureAction(controls: Controls, leaving?: Leaving): UiAction;
