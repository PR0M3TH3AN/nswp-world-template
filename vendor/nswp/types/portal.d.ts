import { type AddressPointer } from "./nip19.js";
import { type Result } from "./result.js";
import { type TravelSettings } from "./settings.js";
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
    /**
     * People the visitor blocked in this world during this visit, by the
     * identity key behind each name (`blocked=<key>,<key>`). It is this
     * world's word and a link anyone can write, so the visitor's own client
     * shows it and asks before a block goes anywhere else
     * (protocol/02-doors.md, "Blocks that travel").
     */
    blocked?: string[];
    /**
     * The visitor is moving the intense way and would go on doing so
     * (`moving=intense`): at a desk, the mouse looks and keys walk; in a
     * headset, they walk and turn smoothly. Left out, they move the casual
     * way. A preference and nothing more (protocol/02-doors.md, "How a visitor
     * moves").
     */
    moving?: "intense";
    /**
     * What the visitor is using a flat screen with as they leave (`form=touch`
     * or `form=desk`): their fingers, or a mouse and keys. The place they
     * arrive starts them the same way, where their device can do both. A
     * headset session is `immersive`, and this says what they fall back to out
     * of it. A preference and nothing more (protocol/11-the-visitors-console.md,
     * "The same form on the other side"). Not sent on the way home: a
     * visitor's own client knows their device.
     */
    form?: Form;
    /**
     * The visitor's settings as they leave (`set=<settings>`): their volumes,
     * the size of their text, whether things move, their hands in a headset,
     * whether their screen was filled. The place they arrive starts from them,
     * so nothing has to be set again. Preferences and nothing more
     * (protocol/11-the-visitors-console.md, "Settings that travel"). Sent on
     * the way home too: what they changed in a world comes home with them.
     */
    settings?: TravelSettings;
    /**
     * The visitor asked, from inside a world, to say who they are (`who=1`):
     * to sign in, switch to another profile, or go on as a guest. Or to change
     * how they look (`who=look`). Their own client shows them its own way of
     * doing that before it takes them on. A request and nothing more: a link
     * anyone can write never signs anyone in, never sends anyone by name, and
     * never changes a look (protocol/10-identity.md, "Signing in from inside a
     * world"; protocol/05-looks.md). Only with a destination, never on the way
     * home.
     */
    who?: boolean | "look";
}
/** How a visitor is using a flat screen: with their fingers, or with a mouse and keys. */
export type Form = "touch" | "desk";
export declare const isForm: (v: unknown) => v is Form;
/** Keys from a list that are keys, once each, up to a limit. */
export declare function cleanKeys(input: unknown, limit: number): string[];
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
    /** The link says they blocked these people where they came from. A claim: shown and asked about, never applied unseen. */
    blocked?: string[];
    /** The link says they were moving the intense way (`moving=intense`). */
    moving?: "intense";
    /** The link says what they were using a flat screen with (`form=touch` or `form=desk`). */
    form?: Form;
    /** The link says what their settings were (`set=`). Preferences, with everything unknown already left out. */
    settings?: TravelSettings;
    /**
     * The link says the visitor asked for something of their own first: to say who they are (`who=1`), or to change
     * how they look (`who=look`). A request: it shows them their own client's place for it, and decides nothing.
     */
    who?: "identity" | "look";
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
    blocked?: string[];
    moving?: "intense";
    settings?: TravelSettings;
} | null;
/** `<airlock>` opened as the way home, or with `doors` as the way to the visitor's doors (protocol/02-doors.md). */
export declare function buildWayUrl(airlock: string, opts?: AirlockUrlOptions & {
    doors?: boolean;
}): string;
/** A capability a world's manifest may name: it can be the place its owner starts (protocol/07-homes.md). */
export declare const HOME_CAPABILITY = "home";
/** Parse an Airlock fragment. Returns null when there is no destination. */
export declare function parseAirlockFragment(hash: string): AirlockRequest | null;
