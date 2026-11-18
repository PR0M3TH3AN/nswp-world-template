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
import { type Arrival, type Issue, type NostrEvent, type PortalDestination } from "@nswp/core";
export type { Arrival, PortalDestination } from "@nswp/core";
export { room, RoomSession, type JoinOptions, type Member, type RoomStatus } from "./room.js";
export type { Pose, Transform } from "@nswp/core";
export { dropBrought, somethingBrought, takeBrought, watchBrought, type Brought } from "./bring.js";
export declare function configure(opts: {
    defaultAirlock?: string;
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
     * Who this visitor chose to be here, if they came by name
     * (protocol/10-identity.md): their public key, the name on their pass, and
     * the pass and session key to hand to a room. Checked against this site and
     * the clock each time; undefined for a guest, and once the pass has run out.
     * The world never sees their own key, only this throwaway one.
     */
    identity(): {
        pubkey: string;
        name: string;
        pass: NostrEvent;
        sessionKey: string;
    } | undefined;
    /** The Airlock this visitor came from, for this tab's session only. */
    /**
     * Whether this world is where the visitor starts: their own client brought
     * them home (NSWP-07). Remembered for the tab, so a refresh at home is
     * still at home. From here the way home leads nowhere new.
     */
    atHome(): boolean;
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
     * Take the visitor to their doors: their client's own place for them. For
     * most visitors that is where home is too. It is a different place for one
     * whose home is a world of their own, and a world that can be a home
     * offers this wherever it offers the way home (protocol/07-homes.md).
     */
    doors(opts?: GoOptions): Promise<boolean>;
};
declare global {
    interface Window {
        /** A future dedicated browser may provide native navigation (spec §6.6). */
        nswp?: {
            navigate?: (dest: PortalDestination) => void;
        };
    }
}
