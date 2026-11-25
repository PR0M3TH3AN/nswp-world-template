import { type NostrEvent } from "./event.js";
/** Experimental, ephemeral-range kinds; not allocated by the NIPs process. */
export declare const ROOM_PASS_KIND = 27300;
export declare const ROOM_SIGNAL_KIND = 27301;
export declare const ROOM_LIMITS: {
    readonly defaultMaxMembers: 8;
    /** Handshake messages older or newer than this are ignored. */
    readonly signalMaxAgeSec: 60;
    readonly maxSdpChars: 20000;
    readonly maxNameChars: 48;
    /**
     * How many lobbies a world's default room may run to: "lobby", "lobby-2", … "lobby-32". A newcomer told a lobby
     * is full goes on to the next (protocol/06-rooms.md, "Lobbies that fill"). With 8 to a lobby, 256 people.
     */
    readonly lobbies: 32;
};
/**
 * Where a room's handshake happens on relays. It is a hash, so knowing a
 * world's address is not enough to find a room with an unguessable name.
 */
export declare function roomTopic(worldUrl: string, roomName: string): string;
/**
 * The name of a world's `n`th lobby, counting from 1: "lobby", then "lobby-2", "lobby-3" and on, to
 * `ROOM_LIMITS.lobbies`. Null for anything else. Only the default room fills this way; a room by name is one room.
 */
export declare function lobbyName(n: number): string | null;
/** Of two members, the one with the lower session pubkey makes the offer. */
export declare function shouldInitiate(self: string, other: string): boolean;
export declare function guestName(pubkey: string): string;
/** A stable colour per session key, as a 24-bit RGB number. */
export declare function guestColor(pubkey: string): number;
/**
 * Spreads arrivals around a spawn point so people don't appear inside each other.
 * @deprecated A guess that checks nothing: use `entryPlaces` and `pickEntryPlace` (entry-places.ts). Kept so nothing outside the kit breaks.
 */
export declare function spawnOffset(pubkey: string, radius?: number): {
    x: number;
    z: number;
};
export type SignalMessage = {
    t: "hello";
    v: 1;
    first?: true;
} | {
    t: "welcome";
} | {
    t: "offer";
    sdp: string;
} | {
    t: "answer";
    sdp: string;
} | {
    t: "bye";
}
/** Said by a member of a full room to someone joining it: go on to the next lobby (or, in a room by name, it is full). */
 | {
    t: "full";
};
/** A public "I'm here" on the room's topic. Carries nothing but the session key. */
/**
 * A hello to the room. `first` marks the one sent on joining, not the one repeated every 20 seconds: whoever hears
 * it knows this member joined after them (protocol/06-rooms.md; for "Places to arrive", protocol/01-worlds.md).
 */
export declare function buildHello(topic: string, sessionKey: Uint8Array, createdAt?: number, opts?: {
    first?: boolean;
}): NostrEvent;
/** A message for one member, encrypted to their session key (NIP-44). */
export declare function buildSignal(topic: string, sessionKey: Uint8Array, to: string, message: Exclude<SignalMessage, {
    t: "hello";
}>, createdAt?: number): NostrEvent;
export interface OpenedSignal {
    from: string;
    message: SignalMessage;
    id: string;
}
/**
 * Check and decrypt a handshake event. Returns null for anything that isn't a
 * valid, fresh message for this member in this room: wrong topic, bad
 * signature, stale, addressed to someone else, or our own.
 */
export declare function openSignal(event: unknown, sessionKey: Uint8Array, topic: string, now?: number): OpenedSignal | null;
export interface Transform {
    position: [number, number, number];
    quaternion: [number, number, number, number];
}
export interface Pose {
    head: Transform;
    left?: Transform;
    right?: Transform;
}
export declare const POSE_BYTES: number;
export declare function packPose(pose: Pose): ArrayBuffer;
/** Returns null for anything malformed: wrong size, non-finite or absurd values. */
export declare function unpackPose(data: ArrayBuffer): Pose | null;
