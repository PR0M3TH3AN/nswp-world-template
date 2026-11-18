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
    /**
     * The visitor is in this world's open room as they leave, and would stay
     * among people where they are going (`joined=1`). It is this world's word,
     * and a link anyone can write: the visitor's own client decides what to do
     * with it (protocol/02-doors.md, "Staying joined").
     */
    joined?: boolean;
    /** Their microphone is on as they leave (`mic=1`). Said only with `joined`. */
    mic?: boolean;
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
    /** The link says they were in the open room where they came from (`joined=1`). A claim, not a fact. */
    joined?: boolean;
    /** The link says their microphone was on (`mic=1`). Kept only with `joined`. */
    mic?: boolean;
}
/** Whether a fragment says the visitor came from a headset session, with or without a destination: a way home carries it too. */
export declare function fragmentSaysImmersive(hash: string): boolean;
/**
 * Whether an Airlock was opened as a way with no destination: home, or to
 * the visitor's doors. It is one when the fragment holds nothing but the two
 * flags such a way may carry. Null for anything else, which is a crossing or
 * a mistake.
 */
export declare function wayWithoutDestination(hash: string): {
    immersive: boolean;
    doors: boolean;
    joined?: true;
    mic?: true;
} | null;
/** `<airlock>` opened as the way home, or with `doors` as the way to the visitor's doors (protocol/02-doors.md). */
export declare function buildWayUrl(airlock: string, opts?: AirlockUrlOptions & {
    doors?: boolean;
}): string;
/** A capability a world's manifest may name: it can be the place its owner starts (protocol/07-homes.md). */
export declare const HOME_CAPABILITY = "home";
/** Parse an Airlock fragment. Returns null when there is no destination. */
export declare function parseAirlockFragment(hash: string): AirlockRequest | null;
