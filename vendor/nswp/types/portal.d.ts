import { type AddressPointer } from "./nip19.js";
import { type Result } from "./result.js";
export interface PortalDestination {
    naddr?: string;
    url?: string;
    entryPoint?: string;
}
export interface Portal {
    schema: string;
    label: string;
    destination: PortalDestination;
    transition?: {
        preferredStyle?: string;
    };
}
export declare function parsePortal(input: unknown): Result<Portal>;
export interface AirlockUrlOptions {
    /**
     * The visitor is in a headset session as they leave. The Airlock passes it
     * on, so the destination can offer the way back into one at once
     * (protocol/02-doors.md, "How many actions a crossing takes").
     */
    immersive?: boolean;
}
/** `<airlock>#to=<naddr or url>&entry=<id>` (spec §6.2: destinations travel in the fragment). */
export declare function buildAirlockUrl(airlock: string, dest: PortalDestination, opts?: AirlockUrlOptions): string;
export interface AirlockRequest {
    /** The raw `to` value. */
    to: string;
    naddr?: AddressPointer & {
        raw: string;
    };
    url?: string;
    entryPoint?: string;
    /** The visitor left a headset session to come here (`xr=1`). */
    immersive?: boolean;
}
/** Whether a fragment says the visitor came from a headset session, with or without a destination: a way home carries it too. */
export declare function fragmentSaysImmersive(hash: string): boolean;
/** Parse an Airlock fragment. Returns null when there is no destination. */
export declare function parseAirlockFragment(hash: string): AirlockRequest | null;
