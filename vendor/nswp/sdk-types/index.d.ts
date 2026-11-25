/**
 * nswp-sdk — the world-side library (spec §6.6).
 *
 *   import { arrival, portal } from "nswp-sdk";
 *   const ctx = arrival.read();          // reads, validates and scrubs #nswp=
 *   portal.go({ naddr, url, entryPoint }); // sends the user through an Airlock
 *
 * Which Airlock (spec §6.3): the return address from the arrival context,
 * else the world's configured default, else a built-in confirmation screen.
 */
import { type Arrival, type Issue, type NostrEvent, type AirlockUrlOptions, type PortalDestination } from "@nswp/core";
import { type Form } from "./form.js";
export { arrivedSettings, arriveWith, currentSettings, reportSettings, type TravelSettings } from "./settings.js";
export { addressesFor, fetchByHash, fetchByHashSaying, fileHosts, filesAnywhere, forgetFileHosts, keptElsewhere, learnFileHosts, onFileHostsChange, setFilesAnywhere, type FetchByHashOptions, type Fetched, type FileHostsOptions } from "./file-hosts.js";
export type { Arrival, PortalDestination } from "@nswp/core";
export { currentForm, startingForm, type Form } from "./form.js";
export { room, RoomSession, type JoinOptions, type Member, type RoomStatus } from "./room.js";
export type { Pose, Transform } from "@nswp/core";
export { guestName } from "@nswp/core";
export { dropBrought, somethingBrought, takeBrought, watchBrought, type Brought } from "./bring.js";
export declare function configure(opts: {
    defaultAirlock?: string;
    /**
     * Where the signer is that this world offers someone who opened its address themselves, with no client to
     * say where theirs is: an https address with `signer/` and `connect/` under it. Null or "" for none. A
     * visitor a client brought is never given this one: their client's word stands, whatever it was.
     */
    defaultSigner?: string | null;
}): void;
export declare const arrival: {
    /**
     * Read the arrival context once, then remove it from the URL so it doesn't
     * linger in history or reach third-party scripts. Call this before loading
     * any third-party code. Later calls return the same result.
     */
    read(): {
        context: Arrival | null;
        warnings: Issue[];
    };
    /**
     * The look this visitor arrived wearing, in its inline form (spec §4.2), or
     * undefined if they came plain. Hand it to a room so others see them as
     * they chose to be seen. Kept for this tab's session only.
     */
    look(): string | undefined;
    /**
     * Their look note (kind 37301), as the arrival named it (an `naddr`), where they came as themselves with one: it
     * may name a model of their own (protocol/05-looks.md). Undefined if they came plain or have none. Kept for this
     * tab's session only. It counts only if its author is the key their pass names: `ownLookNote` checks that.
     */
    avatar(): string | undefined;
    /**
     * Who this visitor chose to be here, if they came by name
     * (protocol/10-identity.md): their public key, the name on their pass, and
     * the pass and session key to hand to a room. Checked against this site and
     * the clock each time; undefined for a guest, and once the pass has run out.
     * The world never sees their own key, only this throwaway one.
     */
    identity(): {
        pubkey: string;
        name: string;
        picture?: string;
        about?: string;
        pass: NostrEvent;
        sessionKey: string;
    } | undefined;
    /**
     * Keep a pass made for this site after arriving: the one the visitor's signer made when they signed in here
     * (protocol/10-identity.md, "A pass from the signer"). It is checked as an arrival's is, and kept the same way,
     * for this tab. False if it doesn't check out.
     */
    keepIdentity(pass: NostrEvent, sessionKey: string): boolean;
    /** The Airlock this visitor came from, for this tab's session only. */
    /**
     * Whether this world is where the visitor starts: their own client brought
     * them home (NSWP-07). Remembered for the tab, so a refresh at home is
     * still at home. From here the way home leads nowhere new.
     */
    atHome(): boolean;
    /**
     * Where the visitor's signer is. Their client's word first. A client that
     * brought them and named none keeps its own beside its Airlock
     * (protocol/10-identity.md, "Signing from a world"): undefined. And for
     * someone no client brought, who opened this world's address themselves,
     * the one this world offers (`configure({ defaultSigner })`), so that
     * signing in is the same however they came ("One sign-in").
     */
    signer(): string | undefined;
    returnAirlock(): string | undefined;
};
export interface GoOptions {
    /** End this immersive session before leaving (recommended in XR). */
    xrSession?: XRSession | null;
    /** Override the Airlock choice (tests, dedicated browsers). */
    airlock?: string;
    /**
     * The visitor is in a headset session as they leave. Their Airlock passes
     * it on, so the next place can offer the way back in at once. Left out, it
     * is taken from whether `xrSession` was given.
     */
    immersive?: boolean;
    /**
     * The visitor is in this world's open room as they leave (`addRoomControls(...).travelling()`). Their Airlock
     * may pass it on, so they stay among people where they arrive (protocol/02-doors.md, "Staying joined").
     */
    joined?: boolean;
    /** Their microphone is on. Passed only with `joined`, and only kept by a client they have told it may be. */
    mic?: boolean;
    /**
     * Named people the visitor blocked here during this visit, by identity key (`travelling().blocked`). Their own
     * client asks whether to block them everywhere (protocol/02-doors.md, "Blocks that travel").
     */
    blocked?: string[];
    /**
     * What the visitor is using a flat screen with: their fingers or a mouse and keys. Left out, it is what they
     * last used here, which is nearly always right. It goes with them through a door, never on the way home.
     */
    form?: Form;
    /** The visitor is moving the intense way here (`fps.enabled` at a desk, `input.intense` in a headset), and would go on doing so where they arrive. */
    moving?: "intense" | "casual";
}
export declare const portal: {
    /** Which Airlock `go()` would use right now, or null for the built-in screen. */
    airlockFor(opts?: GoOptions): string | null;
    go(dest: PortalDestination, opts?: GoOptions): Promise<void>;
    /**
     * Take the visitor back to their own client's start place (spec §6.3): the
     * Airlock they came through, opened with no destination. Returns false, and
     * does nothing, when there is no Airlock to go back to.
     */
    home(opts?: GoOptions): Promise<boolean>;
    /**
     * This world's own door: the announcement its manifest lists for this page,
     * and its address. It is what sends a visitor back here through their own
     * client, which checks it like any other door. With no manifest, or none
     * that names this page, the door is the address alone.
     */
    here(): Promise<PortalDestination>;
    /**
     * The visitor asked to say who they are: to sign in, switch to another
     * profile, or go on as a guest. A world never asks that itself
     * (protocol/09-what-a-world-owes.md), so this leaves for their own client
     * with a door back here and the request (`who=1`). Their client asks them
     * in its own way and brings them back, by name if they chose that
     * (protocol/10-identity.md, "Signing in from inside a world"). Returns
     * false, and does nothing, when they came through no client.
     */
    signIn(opts?: GoOptions): Promise<boolean>;
    /**
     * The visitor asked to change how they look. A look is theirs, kept by
     * their own client, and a world never edits one or sends one back: a look
     * a world could write would be a mark it could follow them by
     * (protocol/05-looks.md). So, like signing in, this leaves for their own
     * client with a door back here (`who=look`). Returns false, and does
     * nothing, when they came through no client.
     */
    changeLook(opts?: GoOptions): Promise<boolean>;
    /** To the visitor's own client for something that is theirs, and back here. */
    ask(what: "identity" | "look", opts?: GoOptions): Promise<boolean>;
    /**
     * Take the visitor to their doors: their client's own place for them. For
     * most visitors that is where home is too. It is a different place for one
     * whose home is a world of their own, and a world that can be a home
     * offers this wherever it offers the way home (protocol/07-homes.md).
     */
    doors(opts?: GoOptions): Promise<boolean>;
};
declare global {
    interface Window {
        /**
         * A browser made for this may take a door itself (browser/spec.md, section 4). It is found by asking, never
         * by which browser it is. `navigate` is handed the destination and what the visitor carries; `can` says whether
         * it offers something by name. There is no identity on it, and nothing that pays: a browser holds no key
         * (browser/spec.md, section 2a).
         */
        nswp?: {
            navigate?: (dest: PortalDestination, carried?: AirlockUrlOptions) => void;
            can?: (name: string) => boolean;
        };
    }
}
