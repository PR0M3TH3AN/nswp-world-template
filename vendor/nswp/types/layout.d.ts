import { type EventTemplate } from "./event.js";
import { type Result } from "./result.js";
/** Experimental kinds. Not allocated by the NIPs process (spec §4.5, §10.4). */
export declare const HOME_LAYOUT_KIND = 37302;
export declare const ITEM_KIND = 37303;
/** Room templates and built-in items every renderer ships (spec §4.5). Who defines this list is Q23. */
export declare const ROOM_TEMPLATES: readonly ["hall", "open"];
export declare const BUILTIN_ITEMS: readonly ["frame", "portal", "note", "plant", "lamp", "bench", "table", "plinth"];
export declare const LAYOUT_ACCESS: readonly ["open", "invite", "list", "follows", "ticket"];
export declare const LAYOUT_LIMITS: {
    readonly placements: 64;
    readonly publishedItems: 16;
    /** Furthest a placement may be from the home's origin, in metres. */
    readonly reach: 50;
    readonly noteChars: 280;
    /** A picture in a frame (spec §10.1). */
    readonly pictureBytes: number;
};
export type RoomTemplate = (typeof ROOM_TEMPLATES)[number];
export type BuiltinItem = (typeof BUILTIN_ITEMS)[number];
export interface Placement {
    /** `builtin`: `type` is a catalogue name. `published`: `type` is an item's coordinate. */
    source: "builtin" | "published";
    type: string;
    /** Metres from the home's origin: x to the right, y up, z towards the visitor. */
    position: [number, number, number];
    /** Degrees about the vertical. */
    rotation: number;
    /** What this type needs: a frame's picture and hash, a portal's destination, a note's text. */
    args: string[];
}
export interface LayoutRoom {
    template: RoomTemplate;
    /** Two hex colours: the room, and its accent. */
    color: string;
    accent: string;
}
export interface LayoutInput {
    d: string;
    title?: string;
    room?: Partial<LayoutRoom>;
    items?: {
        type: string;
        position: [number, number, number];
        rotation?: number;
        args?: string[];
    }[];
    access?: string;
    contentWarning?: string;
    createdAt?: number;
}
export interface Layout {
    d: string;
    title?: string;
    room: LayoutRoom;
    items: Placement[];
    access?: string;
    contentWarning?: string;
    createdAt: number;
    pubkey?: string;
}
/** Build an unsigned layout event (spec §4.5). */
export declare function buildLayoutEvent(l: LayoutInput): EventTemplate;
/** What a portal placement points at: a world's coordinate, or an https address. */
export declare function portalTarget(arg: string | undefined): {
    coordinate: string;
    pubkey: string;
    d: string;
} | {
    url: string;
} | null;
/** Validate a layout event and return its structured form. */
export declare function parseLayoutEvent(input: unknown): Result<Layout>;
/** Check a fetched picture before showing it in a frame: size ceiling and hash (spec §10.1). */
export declare function checkPictureBytes(expectedSha256: string, bytes: Uint8Array): boolean;
