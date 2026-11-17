/**
 * A deliberately small NIP-01 relay client: one REQ per relay, collect until
 * EOSE or timeout, verify every signature locally (spec §5.6). Works in
 * browsers and Node 22+ (global WebSocket).
 */
import { type NostrEvent } from "./event.js";
export interface Filter {
    ids?: string[];
    authors?: string[];
    kinds?: number[];
    since?: number;
    until?: number;
    limit?: number;
    [tag: `#${string}`]: string[] | undefined;
}
export declare const DEFAULT_RELAYS: string[];
export interface QueryResult {
    events: NostrEvent[];
    /** Per relay: "eose", "timeout", or an error message. */
    relays: Record<string, string>;
}
export declare function queryRelays(relays: string[], filter: Filter, timeoutMs?: number): Promise<QueryResult>;
/** For addressable events: keep only the newest event per (pubkey, kind, d). */
export declare function latestAddressable(events: NostrEvent[]): NostrEvent[];
export interface PublishResult {
    relays: Record<string, string>;
}
export declare function publishEvent(relays: string[], event: NostrEvent, timeoutMs?: number): Promise<PublishResult>;
