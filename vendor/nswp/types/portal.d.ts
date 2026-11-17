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
/** `<airlock>#to=<naddr or url>&entry=<id>` (spec §6.2: destinations travel in the fragment). */
export declare function buildAirlockUrl(airlock: string, dest: PortalDestination): string;
export interface AirlockRequest {
    /** The raw `to` value. */
    to: string;
    naddr?: AddressPointer & {
        raw: string;
    };
    url?: string;
    entryPoint?: string;
}
/** Parse an Airlock fragment. Returns null when there is no destination. */
export declare function parseAirlockFragment(hash: string): AirlockRequest | null;
