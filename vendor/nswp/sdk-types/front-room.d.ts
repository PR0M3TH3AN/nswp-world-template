/**
 * The front room of a paid world: the gate, and the one control that asks a visitor to buy
 * (docs/plans/paying-for-things.md, sections 6, 6.1, 7.1 and 7.2; protocol/10-identity.md, "The front room").
 *
 *   const gate = worldGate();                        // nswp-sdk/three: this page's own signer and manifest
 *   addGateControls(controls, gate, { presenting: () => renderer.xr.isPresenting });
 *   const canStand = (x, z) => gate.open || !pastTheGate(x, z);
 *
 * A world puts the gate where it likes, and everything before it is free. This is the `soft` kind: the world and
 * every honest client keep to it, and it promises nothing against someone who means to get round it (a world is a
 * website, and its files are public). What it holds to:
 *
 * - **It opens on a receipt and on nothing else.** Never on the word "bought", a flag in an address, or a bare
 *   payment. The receipt is checked here (`readReceipt`) whoever else checked it: really signed, by a service the
 *   kit believes, for one of this world's own listings, this visitor's, and not run out.
 * - **It fails closed, and says why in plain words.** While anything is unknown it is shut.
 * - **What it is entered by is the world's own site's word:** its manifest's `access`, each listing sold by a key
 *   the manifest lets announce the world. Nobody prices a world that isn't theirs.
 * - **It shows what is for sale before anyone is asked:** the listing's name, its price, and how long it lasts,
 *   read from the seller's own signed note. Nothing under the least price is shown.
 * - **It never takes money.** The control calls `signer.buy`, and the visitor's own sign-in address does the rest
 *   on its own page.
 * - **A timed pass that runs out closes the gate where it stands,** after a notice and a couple of minutes, with
 *   no page loaded again under anyone.
 *
 * Nothing here draws anything: a world shows the gate its own way and reads `open`. The control is added to the
 * visitor's console, so it is the same on a flat screen and in a headset.
 */
import { type Filter, type QueryResult, type Receipt } from "@nswp/core";
import type { WorldSigner } from "./signer.js";
import type { Controls } from "./ui/model.js";
/**
 * The gate's own times, in seconds. `grace`: how long someone inside has after their time runs out (the owner's
 * decision: a notice and a couple of minutes). `look`: how often what is held is asked about again, and the least
 * time between two askings of the selling service. `goodFor`: how long a receipt last found good stays good while
 * that service can't be reached (the owner's decision: someone who paid isn't locked out by a short outage).
 */
export declare const GATE_TIMES: {
    readonly grace: 120;
    readonly look: 300;
    readonly goodFor: 86400;
};
/** "free": this world names nothing for sale. "checking": not known yet, and shut. "ending": open, for the last couple of minutes of a pass that has run out. */
export type GateState = "free" | "checking" | "shut" | "open" | "ending";
/** Why a gate is shut, or "" where it isn't. Stable words for a test or a world's own drawing to go by. */
export type GateReason = "" | "no-manifest" | "not-own" | "no-signer" | "signed-out" | "nothing-held" | "run-out" | "taken-back" | "unchecked";
/** One thing a visitor can buy to get in, as its listing reads. */
export interface GateOffer {
    readonly listing: string;
    /** The seller's own name for it. */
    readonly name: string;
    readonly sats: number;
    /** How long it lasts, in seconds, or null for something bought for good. */
    readonly term: number | null;
    /** Its price and how long it lasts, in words: "500 sats, for 30 days". */
    readonly words: string;
}
/** What the gate needs of the page's signer: no more than it uses. */
export type GateSigner = Pick<WorldSigner, "state" | "pubkey" | "host" | "have" | "buy" | "onChange" | "whenAnswered">;
export interface PaidGateOptions {
    /** The page's own signer, or null where the visitor came with none (`worldGate` gives it). Asked each time. */
    signer: () => GateSigner | null;
    /**
     * What this world is entered by, said outright. Left out, the world's own manifest is read for it, which is
     * the usual way. Either way each listing must be sold by a key the manifest lets announce this world. An empty
     * list is a free world: nothing is read, asked or shown.
     */
    listings?: readonly string[];
    /** This world's address. Left out, the page's own. */
    url?: string;
    /** The usual relays, asked for a listing beside the ones the manifest names. Left out, the kit's own list. */
    relays?: string[];
    /** For tests: what reads the world's own manifest. Left out, the file at this site's well-known address. */
    manifest?: () => Promise<unknown>;
    /** For tests: what asks relays. */
    query?: (relays: string[], filter: Filter, timeoutMs?: number) => Promise<QueryResult>;
    /**
     * For tests: what asks the service that signed a receipt whether it has taken it back since. Left out, that
     * service is asked at its own address. "unknown" where it couldn't be asked.
     */
    status?: (receipt: Receipt) => Promise<"stands" | "taken-back" | "unknown">;
    /** For tests: the time, in milliseconds. */
    now?: () => number;
}
export interface PaidGate {
    readonly state: GateState;
    /** Whether a visitor may go past it now. The one thing a world needs to read. */
    readonly open: boolean;
    /** Why it is shut, as a stable word. */
    readonly reason: GateReason;
    /** Why it is shut, or what is about to happen, in plain words for the visitor. "" where there is nothing to say. */
    readonly why: string;
    /** What can be bought to get in: each listing that was read and holds up. */
    readonly offers: readonly GateOffer[];
    /** Whether what is for sale has been looked for yet: each listing read, or found not to hold up. */
    readonly read: boolean;
    /** When the pass that holds it open stops, in seconds, or null: it doesn't, or nothing is held. */
    readonly until: number | null;
    /** Whether the visitor is signed in here: buying needs it. */
    readonly signedIn: boolean;
    /** The visitor's sign-in address, as a host to name in words. */
    readonly host: string;
    /** A purchase is with the visitor now, at their sign-in address. */
    readonly buying: boolean;
    /**
     * Ask the visitor to buy one of the offers (the first, left out). Call it from a press. Their sign-in address
     * asks them on its own page. Resolves true only once a receipt that holds up has opened the gate.
     */
    buy(listing?: string): Promise<boolean>;
    /** Look again now: at what is held, and for any listing that couldn't be read. */
    check(): Promise<void>;
    /** Be told when anything above may have changed. Returns how to stop. */
    onChange(fn: () => void): () => void;
    /** Everything above, for a test to read. */
    info(): Record<string, unknown>;
    dispose(): void;
}
/** A gate for this world. With nothing for sale it is "free" at once and does nothing more. */
export declare function createPaidGate(opts: PaidGateOptions): PaidGate;
/**
 * The gate's control, in the visitor's console: one row for each thing that can be bought, saying its name, its
 * price and how long it lasts, and calling `signer.buy` at the visitor's press. It is there only while the gate is
 * shut (or about to be), and comes after the things every place has, so the way home keeps the first key.
 *
 * Someone who isn't signed in is offered sign-in by the same row, the way the kit already does it. In a headset,
 * where a sign-in address's own page can't be seen, it says to step out, as a tip does.
 */
export declare function addGateControls(controls: Controls, gate: PaidGate, opts?: {
    /** Whether the visitor is in a headset: a page that asks them can't be seen from in there. */
    presenting?: () => boolean;
    /** Which tab the rows go in. Left out, Travel: the gate is a door. */
    section?: string;
    /** What starts signing in, from a press. Left out, the kit's own sign-in row. False if nothing could be started. */
    signIn?: () => boolean;
}): {
    refresh(): void;
    press(listing?: string): void;
};
