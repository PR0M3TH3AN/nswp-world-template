/**
 * The name, picture and few words people gave themselves (Nostr kind 0), for showing the people a visitor
 * follows by name and not by a string of letters.
 *
 *   const profiles = createProfiles();
 *   await profiles.fetch(keys);          // asks relays for the ones not known lately
 *   profiles.get(key)?.name;
 *
 * Kept on the device once fetched, so a list shows names at once. Asking a relay about a key tells that relay
 * which keys this browser looked at, the same as reading Nostr anywhere: so nothing here is asked until the
 * visitor opens the thing that shows it. A name is its owner's own choice and proves nothing; the key is what
 * tells two people apart.
 */
import { queryRelays, type NostrEvent } from "@nswp/core";
export interface Profile {
    name: string;
    /** Where their picture is, or "". */
    picture: string;
    /** What they wrote about themselves, as plain text, or "". Their own words, not a fact. */
    about: string;
    /** When they wrote it, in seconds. A newer one replaces an older one, never the other way. */
    at: number;
    /** When this device last asked, in milliseconds. */
    asked: number;
}
export interface ProfilesOptions {
    relays?: string[];
    storage?: Pick<Storage, "getItem" | "setItem"> | null;
    now?: () => number;
    query?: typeof queryRelays;
}
export interface Profiles {
    get(pubkey: string): Profile | null;
    /** Ask relays for these people's profiles, where they aren't known or were last asked for long ago. */
    fetch(pubkeys: readonly string[]): Promise<void>;
    onChange(fn: () => void): () => void;
}
/** What a profile note says of its writer, tidied: any of it may be "". */
export declare function readProfile(event: Pick<NostrEvent, "content" | "created_at">): Pick<Profile, "name" | "picture" | "about" | "at">;
export declare function createProfiles(opts?: ProfilesOptions): Profiles;
