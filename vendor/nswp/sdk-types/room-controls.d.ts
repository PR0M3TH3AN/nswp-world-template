import { type NostrEvent } from "@nswp/core";
import type { Controls } from "./ui/model.js";
import { type Following, type FollowingHand } from "./following.js";
import type { PersonLines } from "./person-lines.js";
import { type Messaging, type MessagingHand } from "./messaging.js";
import type { Panels } from "./panels.js";
import type { Sounds } from "./sound.js";
import type { Presence } from "./presence.js";
export interface Travelling {
    /** They are in this place's open room. A private room doesn't travel: the next place's open room is other people. */
    joined: boolean;
    /** Their microphone is on. */
    mic: boolean;
    /** Named people they blocked here during this visit, for their own client to ask about. */
    blocked: string[];
}
/** What signs a post for the visitor when they send one out from their public feed. */
export interface RoomNotes {
    /** Whether a note can be signed now. While it can't, posting isn't offered. */
    ready(): boolean;
    /** Sign a note. Null, or a rejection, if it won't be signed. What comes back is checked before it is sent anywhere. */
    sign(note: {
        kind: number;
        content: string;
        tags: string[][];
    }): Promise<NostrEvent | null>;
    /** Be told when `ready()` may have changed. */
    onChange?(fn: () => void): unknown;
    /** A signer is there and the visitor hasn't unlocked it for this place: posting is offered, and leads there first. */
    locked?(): boolean;
    /** Start unlocking it, from a press. False if nothing could be opened. */
    unlock?(): boolean;
    /** Whether that is a panel in the visitor's client rather than a window (signer.ts, `panel`). */
    panel?(): boolean;
    /**
     * Put a note of a careful kind to the visitor themselves, at their sign-in address (signer.ts, `propose`): what
     * deleting a post takes. Left out where nothing can ask them, and then no post offers to be deleted.
     */
    propose?(note: {
        kind: number;
        content: string;
        tags: string[][];
    }): Promise<NostrEvent | null>;
    /** Where that happens, as an address to name, or null. */
    host?(): string | null;
    /** A signer was named and didn't answer: then what to say about it. Null when that isn't so. */
    unanswered?(): string | null;
    /** Whose key signs, once it can: their feed is that key's posts. Left out, the feed shows only what is sent from here. */
    pubkey?(): string | null;
    /** What to call them over their feed: their name, or null for the short form of their key. */
    who?(): string | null;
    /**
     * The site each post is marked with by whatever signs it, as a host to name, or null for none. A client whose
     * sign-in marks what it signs says so here, and the visitor is told where they write.
     */
    marked?(): string | null;
}
/** What follows and unfollows someone for the visitor: from a person's card in a room, and in Following (protocol/14-people-and-messages.md). */
export type RoomFollows = FollowingHand;
export declare function addRoomControls(controls: Controls, presence: Presence, opts?: {
    search?: string;
    onState?: (state: Record<string, unknown> | null) => void;
    /**
     * The visitor arrived joined: their own client says they were among people where they came from
     * (`arrival.read().context`, its `joined` and `mic`). The open room is joined without asking again.
     */
    arrived?: {
        joined?: boolean;
        mic?: boolean;
        blocked?: string[];
    } | null;
    /**
     * The visitor's panels. With them, a screen someone shares in the room can be watched: it opens on a panel
     * of the watcher's own, which they move, size and put away like any other. Without them nobody here can watch.
     */
    panels?: Panels | null;
    /**
     * The place's sounds. With them, a visitor can share the music they are playing with people near them, and
     * choose to hear what others share: both off until they turn them on.
     */
    sounds?: Sounds | null;
    /** False where this world wants no shared music: a concert, a library. Its visitors' own music still plays for them. */
    sharedMusic?: boolean;
    /**
     * The usual relays: where the visitor's own relay list is looked for, and where a post goes when they have
     * published none (or too thin a one). Left out, the kit's own list. A post goes to the relays the visitor
     * says they write to (NIP-65), and their earlier posts are read from the same.
     */
    noteRelays?: string[];
    /**
     * What signs a post when the visitor sends one out. Left out, the page's own signer: the hidden one
     * their client named, unlocked in that client's window (`worldSigner()`), which is what a world has. A
     * visitor's own client, in a room of its own where they are already signed in, gives its own.
     */
    notes?: RoomNotes;
    /**
     * What follows and unfollows someone when the visitor asks (protocol/14-people-and-messages.md). Left out,
     * the page's own signer, once the visitor has let this world do so. A visitor's own client gives its own.
     */
    follows?: RoomFollows;
    /**
     * What sends and reads the visitor's private messages (protocol/14-people-and-messages.md). Left out, the
     * page's own signer, once the visitor has let this world do so. A visitor's own client gives its own.
     */
    messages?: MessagingHand;
    /**
     * A few lines about someone, for their card in People and in Following: where they stand on this world's
     * boards, which of its achievements they show (person-lines.ts). Left out, a card says nothing of that.
     */
    about?: PersonLines | null;
    /** Whether the visitor is in a headset: a window that opens can't be seen from in there. */
    presenting?: () => boolean;
    /**
     * What sends a tip when the visitor asks (docs/plans/paying-for-things.md, 7.5): a person, by their key, or
     * with no `to` this place itself. Left out, the page's own signer, which puts it to the visitor at their
     * sign-in address. A visitor's own client gives its own. Resolves whether it went, and never why not. Null
     * where nothing here can send one: then no tip is offered at all.
     */
    tip?: ((o: {
        to?: string;
        sats: number;
    }) => Promise<boolean>) | null;
    /**
     * Whether this place takes tips. Left out, it is read from the place's own `/.well-known/nswp.json`, which
     * names an address for them (`tip`) if it does: the same file the visitor's sign-in address reads the address
     * from. The address itself is never passed here. False for a place that should offer no such row.
     */
    tipsWorld?: boolean;
}): {
    refresh(): void;
    travelling(): Travelling;
    following: Following;
    messaging: Messaging;
};
/**
 * The controls every world's view needs: enter or leave VR, and turn around.
 * Returns whether this device can enter VR at all.
 *
 * It also hides the flat HUD while a headset session runs. The page can't be
 * seen from inside one, and the console takes over.
 */
/**
 * The one thing asked of someone who has just arrived from a headset session:
 * a large way back in, over everything, that one press answers either way.
 * A browser won't let a page start a headset session unasked, so this is the
 * least that can be asked (protocol/02-doors.md).
 */
