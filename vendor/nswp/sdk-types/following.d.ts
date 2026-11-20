import type { Keyboard } from "./keyboard.js";
import type { People } from "./people.js";
import type { PersonLines } from "./person-lines.js";
import { type Profiles } from "./profiles.js";
import type { Controls, UiAction } from "./ui/model.js";
/** What follows and unfollows someone for the visitor (three.ts gives a world's; a visitor's own client gives its own). */
export interface FollowingHand {
    people: People;
    /** The visitor's key here, or null: nobody is followed for a guest. */
    pubkey(): string | null;
    /** Whether the visitor has let this place change who they follow. */
    allowed(): boolean;
    /** From a press: have the visitor asked. Returns what to say meanwhile; `then` is run once they have allowed it. */
    ask(then: () => void): string;
}
export interface FollowingOptions {
    follows: FollowingHand;
    /** The usual relays, where people's profiles are looked for. */
    relays?: string[];
    profiles?: Profiles;
    /** A keyboard to type a key on inside a headset. Without one, a key is taken from what was copied. */
    keyboard?: () => Keyboard | null;
    presenting?: () => boolean;
    /** More to offer about someone chosen in the list: writing to them, say. */
    more?: (who: {
        pubkey: string;
        name: string;
    }) => UiAction[];
    /** Read what the visitor copied. For tests; left out, the browser's own. */
    copied?: () => Promise<string>;
    /** A few lines about someone, for their card: what they have done here, say (person-lines.ts). */
    about?: PersonLines | null;
}
export interface Following {
    /** Draw it again: who is signed in, or what they allowed, changed. */
    refresh(): void;
    /** Put someone at the head of the tab, as choosing them in the list does. */
    choose(pubkey: string): void;
    /** Follow or unfollow someone, asking the visitor first where this place hasn't been let. Says what happened. */
    press(pubkey: string, name: string, adding: boolean): void;
    profiles: Profiles;
}
/** A key in what someone typed or pasted: an npub, 64 hex characters, with or without "nostr:" before it. Null for anything else. */
export declare function keyIn(text: unknown): string | null;
export declare function addFollowingControls(controls: Controls, opts: FollowingOptions): Following;
