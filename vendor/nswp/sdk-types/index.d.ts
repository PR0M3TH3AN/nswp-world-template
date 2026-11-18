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
    returnAirlock(): string | undefined;
};
export interface GoOptions {
    /** End this immersive session before leaving (recommended in XR). */
    xrSession?: XRSession | null;
    /** Override the Airlock choice (tests, dedicated browsers). */
    airlock?: string;
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
};
declare global {
    interface Window {
        /** A future dedicated browser may provide native navigation (spec §6.6). */
        nswp?: {
            navigate?: (dest: PortalDestination) => void;
        };
    }
}
