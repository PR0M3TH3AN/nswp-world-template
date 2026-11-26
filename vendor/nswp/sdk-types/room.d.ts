import { type NostrEvent, type Pose, type Look, type LookModel } from "@nswp/core";
export interface Member {
    /** Session public key: a throwaway, new each visit. */
    pubkey: string;
    /** True until their pass has checked out (protocol/10-identity.md). */
    guest: boolean;
    /** The identity key behind them, once their pass has checked out. Never taken on their say-so. */
    identity?: string;
    /**
     * Their pass is a guest account's (`VerifiedPass.guest`): a key their sign-in address made for them, not yet
     * secured, the same in every world of its family. They are proven by it (`guest` is false), and named by it
     * (`guestName` of that key, where the pass gives no name). Left out for anyone else.
     */
    guestAccount?: true;
    /** A proven member's own name, or the short form of their key. A guest is "Guest" and four digits. */
    name: string;
    /** Where a proven member's picture is, as their pass says. Never there for a guest. */
    picture?: string;
    /** What a proven member wrote about themselves, as their pass says. Their own words. Never there for a guest. */
    about?: string;
    color: number;
    /** How they look (spec §4.2). What their session key generates, until they say otherwise. */
    look: Look;
    /**
     * The model of their own they wear (protocol/05-looks.md, "A model of your own"), from the look note they handed
     * the room: only once their pass has checked out, and only if that note is really signed by the key the pass
     * names. Left out for a guest, and for someone who wears none.
     */
    model?: LookModel;
    /** They have said they are recording what they see (spec §9). */
    recording: boolean;
    /** The item they say they are holding, by its coordinate (protocol/17-items.md). Left out when they hold nothing. */
    holding?: string;
    /**
     * They joined after this visitor did: their joining hello was signed after this visitor joined. Such a person is
     * the one arriving, and steps aside themselves if they find themselves inside this visitor (protocol/01-worlds.md,
     * "Places to arrive"): this visitor is never moved for them.
     */
    joinedAfterYou?: boolean;
    /** They are offering their screen to the room. It is sent only to members who ask to watch. */
    sharing?: boolean;
    /** They are offering their music to people near them. It is sent only to members who ask to hear it. */
    music?: boolean;
}
export interface JoinOptions {
    /** Room name. People who share a world URL and a name share a room. Default "lobby". */
    name?: string;
    /** The world this room is in. Default: this page, without query or fragment. */
    world?: string;
    /** The relays its handshake goes through. Default `ROOM_RELAYS`, eight; a world that names its own uses those. */
    relays?: string[];
    maxMembers?: number;
    iceServers?: RTCIceServer[];
    /**
     * Where to ask for TURN servers (a relay for connections, for two people who can't reach each other directly):
     * an address that answers `{ iceServers, ttl }`, as bitblocks-ice does (services/ice/). Asked once as the room is
     * joined, waited for at most 3 seconds, and asked again before what it gave runs out. Default `ICE_FROM`; null asks
     * nowhere. Where it doesn't answer, the room has STUN alone, as before.
     */
    iceFrom?: string | null;
    /**
     * Your look, in its inline form (spec §4.2), to be drawn as by the others.
     * It is sent to each member directly, once connected, never to a relay.
     * Left out, you are drawn as your session key generates: new every visit.
     */
    look?: string;
    /**
     * Who you are, if you chose to go by name: the pass your own client signed
     * and the session key it names, usually from `arrival.identity()`. It is
     * checked here, and shown to each member directly, never to a relay.
     */
    identity?: {
        pass: NostrEvent;
        sessionKey: string;
    };
    /**
     * Your look note (kind 37301), signed by your own key, where it names a model of your own: handed to each member
     * directly, never to a relay, so nobody has to ask one for it (NSWP-06, the `avatar` message). Only sent when you
     * came by name, and only if it is signed by the key your pass names. At most `LOOK_NOTE_LIMIT` bytes.
     */
    avatar?: NostrEvent | null;
    /**
     * Keys this visitor has blocked: the identity keys of people who came by
     * name, or session keys from this visit. Nobody on it is connected to.
     */
    blocked?: Iterable<string>;
    /**
     * Identity keys the world's owner keeps out (protocol/10-identity.md, "A world's own lists"): someone whose pass
     * names one is not shown, heard or answered here. Kept apart from `blocked`, which is the visitor's own: this is
     * never kept, never reported and never carried on to another world.
     */
    ownerBlocked?: Iterable<string>;
    /**
     * This world's rooms show only people whose pass checks out (its manifest's `named_only`): a member is shown and
     * heard only once their pass has checked out, and one who shows none within a few seconds is let go.
     */
    namedOnly?: boolean;
    /**
     * Where the world is by invitation: the identity keys that may be in its rooms (the people its owner invited,
     * and the keepers). A member is shown and heard only once their pass names one of them, as for `namedOnly`, and
     * anyone else is let go. Left out or null, the world isn't by invitation.
     */
    invited?: Iterable<string> | null;
    /**
     * False where the world takes no guests (its announcement's `"guests": false`, protocol/10-identity.md, "A
     * guest"): someone whose pass is a guest account's is let go, as someone not invited is. Left out, guests may come.
     */
    takesGuests?: boolean;
}
export type RoomStatus = "connecting" | "open" | "no-relays" | "closed";
interface Events {
    member: (member: Member) => void;
    leave: (member: Member) => void;
    pose: (member: Member, pose: Pose) => void;
    /** A member said how they look. Arrives shortly after `member`. */
    look: (member: Member, look: Look) => void;
    /** A member's pass checked out, or ran out: `member.guest`, `identity` and `name` have changed. */
    identity: (member: Member) => void;
    /** A member started or stopped recording what they see. */
    recording: (member: Member, on: boolean) => void;
    /** A member took an item in hand, or put it away: its coordinate, or "". */
    holding: (member: Member, item: string) => void;
    /** A member said something of an item in play (protocol/17-items.md): a thing sent out, a hit, a sound, their state. */
    play: (member: Member, said: string) => void;
    audio: (member: Member, stream: MediaStream) => void;
    /** A member started or stopped offering their screen. */
    screen: (member: Member, on: boolean) => void;
    /** A member started or stopped offering their music. */
    tune: (member: Member, on: boolean) => void;
    /** The line a member's music arrives on. It carries sound only while they share and this visitor listens. */
    music: (member: Member, stream: MediaStream) => void;
    /** The line a member's screen arrives on. It carries pictures only while they share and this visitor watches. */
    video: (member: Member, stream: MediaStream) => void;
    /**
     * Someone wrote a few words to the room (protocol/06-rooms.md, "Words"): another member, or this visitor
     * themselves (`member` is then `self`). The words are tidied and safe to show as text. Nothing keeps them.
     */
    said: (member: Member, line: SaidLine) => void;
    status: (status: RoomStatus) => void;
    /**
     * Someone is here, and finding each other worked, but no connection to them opened: it was tried twice (the second
     * time afresh), and each try failed or never opened. Their session key; nothing else of them is known before a
     * connection. Said again each time a later try fails, while they are still here, so a page can tell they are; the
     * room goes on trying at each hello. Gone from these once they connect (`member`).
     */
    unreached: (pubkey: string) => void;
}
/** A few words someone wrote to the room. */
export interface SaidLine {
    /** Tells this line from any other of theirs. */
    id: string;
    text: string;
    /** When it was read here, in milliseconds. A line carries no time of its own. */
    at: number;
}
/**
 * The kit's own place to ask for TURN servers (`JoinOptions.iceFrom`): the owner's bitblocks-ice (services/ice/),
 * deployed 2026-11-25. It answers pages of bitblocks.network only; any other page gets a refusal at once, and its
 * rooms go on with STUN alone, as before. A world with a TURN service of its own names it in `iceFrom`.
 */
export declare const ICE_FROM: string | null;
/**
 * How long a member has to show a pass in a room that shows only named people. A pass is said as the channel
 * opens and three more times, a second and a half apart, so a member who has one has shown it well before this.
 */
export declare const NAMED_WAIT_MS = 7000;
/**
 * How a member is drawn (protocol/10-identity.md, "The mark"). A proven
 * member wears their identity key's mark whatever their look says. A look
 * whose seed is a key is a claim to it, and without a pass the claim isn't
 * honoured: the mark is the session key's.
 */
/**
 * How often a new look note is taken from one member, at most, in milliseconds. A note doesn't change during a
 * visit as a rule; a member who sends new ones faster is heard this often and no more.
 */
export declare const AVATAR_EVERY_MS = 3000;
export declare class RoomSession {
    readonly self: Member;
    /** The room's name. For the default room it changes as a full lobby sends this visitor on: "lobby", "lobby-2", … */
    name: string;
    /** Where its handshake happens (`roomTopic`): changes with the name. */
    topic: string;
    status: RoomStatus;
    private readonly key;
    /** The relays this room's handshake goes through: the world's own, or `ROOM_RELAYS`. */
    readonly relays: string[];
    /** Keys this visitor won't be in a room with: session keys, and the identity keys behind names. */
    private readonly blocked;
    /** Identity keys the world's owner keeps out. Never the visitor's own: never kept or carried on. */
    private ownerBlocked;
    /** Session keys let go this visit for the world's rules (the owner's list, or no pass where one is needed): not answered again. */
    private readonly turnedAway;
    /** Whether this room shows only people whose pass checks out: so where it is by invitation, too. */
    readonly namedOnly: boolean;
    /** Whether guest accounts may be in this room (`JoinOptions.takesGuests`). */
    private readonly takesGuests;
    /** Where the world is by invitation, who may be in its rooms; null where it isn't. */
    private invited;
    /** In a room that shows only named people: the members shown, by session key, and what arrived for each before. */
    private readonly announced;
    private readonly waiting;
    private readonly maxMembers;
    private iceServers;
    /** Where TURN servers are asked for (`JoinOptions.iceFrom`), or null. */
    private readonly iceFrom;
    private iceTimer;
    private readonly sockets;
    private readonly peers;
    private readonly seen;
    private readonly listeners;
    private readonly look;
    /** The world's origin: the only place a pass shown here may have been made for. */
    private readonly origin;
    /** The world's address, which the room's topic is made from. */
    private readonly world;
    /** Which lobby this is, where it is the world's default room ("lobby" is 1); null for a room by name. */
    private lobby;
    /** Whose hello this visitor has heard in this lobby: a "full" is taken only from one of them. */
    private readonly heardHello;
    /** Who said "full" before their hello was heard: taken if their hello comes while it still may be. */
    private readonly fullBefore;
    /** When each member's joining hello was signed, in seconds: who joined before whom, for a full lobby. */
    private readonly joinedAtOf;
    /** This visitor's own pass, as it is said to the others, and when it stops. */
    private pass;
    /** This visitor's own look note, as it is handed to each member: only where it is their pass's key's. */
    private avatar;
    /** The item this visitor says they are holding, by its coordinate, or "". */
    private held;
    /** The colours this visitor chose for what they hold, as they are said ("tint:…"), or "". */
    private tints;
    private passUntil;
    private recordingTimer;
    /** This visitor's shared screen, while they share one. */
    private screen;
    private screenTimer;
    /** This visitor's music, while they share it. */
    private tune;
    private tuneTimer;
    /** Whose music this visitor is listening to. */
    private readonly heard;
    private hearTimer;
    /** Whose screens this visitor is watching. */
    private readonly watched;
    private watchTimer;
    private mic;
    /** This visitor's own words, counted as everyone's are. */
    private readonly words;
    private timers;
    private closed;
    /** When this visitor joined, in unix seconds, and who has joined since (by a joining hello signed after it). */
    private joinedAt;
    private readonly newer;
    /** How many tries at connecting to each member there have been since they were last connected (`Peer.attempt`). */
    private readonly attempts;
    constructor(opts?: JoinOptions);
    /** Who may be in this world's rooms, as its gate last read the owner's allow list. Anyone here not on it is let go at once. */
    setInvited(keys: Iterable<string> | null): void;
    /**
     * The keys the world's owner keeps out, as the world's gate last read them. Anyone here whose pass names one is
     * let go at once: to them, this visitor has left. Nobody is told, and nothing is kept.
     */
    setOwnerBlocked(keys: Iterable<string>): void;
    /** Let someone go for the world's rules, and answer them no more this visit. */
    private turnAway;
    /**
     * Stop being in a room with someone. The connection to them is closed and
     * no new one is made, by their session key and, if they came by name, by
     * the key behind the name: so it holds when they come back. It is this
     * visitor's decision alone and nobody else is told; to the blocked person,
     * this visitor has left. Returns what was blocked, or null if they aren't
     * here.
     */
    block(pubkey: string): {
        session: string;
        identity?: string;
        name: string;
    } | null;
    /** Let someone back: they are connected to again the next time either side announces itself. */
    unblock(key: string): void;
    isBlocked(key: string): boolean;
    on<K extends keyof Events>(event: K, fn: Events[K]): () => void;
    private emit;
    get members(): Member[];
    /** How many relays are currently connected. */
    get relayCount(): number;
    start(): void;
    private onPageHide;
    private setStatus;
    private connectRelay;
    private publish;
    private announce;
    private onEvent;
    private createPeer;
    private wirePoseChannel;
    /** Draw a member again if what is known about them changes how they look. */
    private redraw;
    /**
     * A member has shown a pass. It counts only if it checks out for this site
     * and names the session key they are speaking with, which they have already
     * proved they hold: the handshake was signed with it.
     */
    private checkPass;
    /** A pass that has run out leaves a guest behind. */
    private expire;
    /**
     * Tell one member how you look and, if you came by name, who you are. The
     * channel drops what it can't deliver at once, so each is said a few times
     * over the first seconds.
     */
    private introduce;
    private gathered;
    private audioTransceiver;
    /** The second sound line: music. Voice is the first. */
    private musicTransceiver;
    private videoTransceiver;
    private offerTo;
    private answerTo;
    private markRecording;
    private markSharing;
    /** Send this visitor's screen to a member who is watching it, and stop when they aren't or there is none. */
    private feed;
    private markTune;
    /** Send this visitor's music to a member who is listening to it, and stop when they aren't or there is none. */
    private feedTune;
    /**
     * Offer music to the room, or stop. Like a screen, offering sends nothing
     * by itself: it goes only to members who ask to hear it, and they ask only
     * while they are near and have said they want to hear shared music at all.
     */
    setMusic(track: MediaStreamTrack | null): Promise<void>;
    /** How many members this visitor's music is going to now. */
    get musicListeners(): number;
    /** Ask to be sent a member's music, or to stop being sent it. Asked again every couple of seconds while listening. */
    listen(pubkey: string, on: boolean): void;
    isListening(pubkey: string): boolean;
    private tellAll;
    /**
     * Offer a screen to the room, or stop. Offering sends nothing by itself:
     * each member is told it is there, and it goes only to those who ask to
     * watch. Stopping takes it from everyone at once.
     */
    setScreen(track: MediaStreamTrack | null): Promise<void>;
    /** Whether this visitor is offering their screen. */
    get sharing(): boolean;
    /** How many members this visitor's screen is going to now. */
    get screenViewers(): number;
    /**
     * Ask to be sent a member's screen, or to stop being sent it. Nothing
     * arrives unless they are sharing. It is asked again every couple of
     * seconds while watching, so a member who stops being asked stops sending.
     */
    watch(pubkey: string, on: boolean): void;
    isWatching(pubkey: string): boolean;
    /**
     * Say that you are recording what you see, or have stopped. The others are
     * shown a light on your figure while it is true. An honest client says so
     * whenever it records other people; nothing can make a dishonest one.
     */
    /**
     * Say what this visitor is holding, or "" for nothing (protocol/17-items.md). The others are told its
     * coordinate and nothing else: each fetches and checks the item for themselves, or draws nothing.
     */
    setHolding(item: string): void;
    /**
     * Say something of an item in play to everyone: a thing sent out, a hit, a sound, this visitor's state
     * (`buildShot`, `buildHit`, `buildDid`, `buildState` in the core). Anything that isn't one of those is not sent.
     */
    tellPlay(said: string): void;
    setRecording(on: boolean): void;
    private drop;
    /**
     * A try at connecting to someone that failed, or never opened. A first try is made again at once, afresh, by the
     * one who makes the offer; the other answers the new offer as it comes. A later one is given up, and said
     * (`unreached`): the room tries again at the next hello.
     */
    private notOpened;
    /**
     * Whether this visitor is the one who tells a newcomer that this full room is full: the member with the lowest
     * session key of those it is connected to, so a newcomer hears it once, not from everyone here.
     */
    /** Whether a "full" may still send this visitor on: in a lobby before the last, and only just joined it. */
    private mayMoveOn;
    private answersForFull;
    /**
     * A newcomer (`from`, who signed their joining hello at `at`) finds this room full. Who stays is who joined first,
     * then the lower key: where someone here joined after them, only a moment ago, it is that one who is told to go
     * on, and the newcomer takes their place. Otherwise the newcomer is told.
     */
    private tellFull;
    /**
     * Told that this lobby is full: say goodbye to anyone here, and go to lobby `n` on the same relays, as someone
     * just joining it. The sockets stay open; only what they listen for changes.
     */
    private moveOn;
    /**
     * Ask for TURN servers (`iceFrom`), and use them beside the room's own STUN: for connections made from now on, and,
     * when they are asked for again before they run out, for those already made (`setConfiguration`). Where none come,
     * what the room had is kept, and nothing more is asked. Asked again at four fifths of what they are good for.
     *
     * @internal Called by `room.join`; not for a world.
     */
    askForIce(): Promise<void>;
    private sweep;
    /** Send your pose to everyone. Call 10–20 times a second, from a timer rather than the render loop. */
    /**
     * Write a few words to the room. They go straight to each member, as poses do: no relay sees them and nothing
     * keeps them. They are sent a few times over, because the channel doesn't try again, and each reader takes the
     * first. Returns "said" (and `said` fires here too, with `self`), "nothing" if there was nothing to say, or
     * "slow" if this visitor has said too much in a short while: nothing is sent then.
     */
    say(text: string): "said" | "nothing" | "slow";
    sendPose(pose: Pose): void;
    /** Start or stop sending a microphone track to everyone. */
    setMicrophone(track: MediaStreamTrack | null): Promise<void>;
    leave(): void;
}
export declare const room: {
    /**
     * Join a peer-to-peer room. Other members will see your IP address, so
     * call this only after the user has agreed.
     */
    join(opts?: JoinOptions): Promise<RoomSession>;
};
export {};
