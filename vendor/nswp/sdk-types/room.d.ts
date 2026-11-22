import { type NostrEvent, type Pose, type Look } from "@nswp/core";
export interface Member {
    /** Session public key: a throwaway, new each visit. */
    pubkey: string;
    /** True until their pass has checked out (protocol/10-identity.md). */
    guest: boolean;
    /** The identity key behind them, once their pass has checked out. Never taken on their say-so. */
    identity?: string;
    /** A proven member's own name, or the short form of their key. A guest is "Guest" and four digits. */
    name: string;
    /** Where a proven member's picture is, as their pass says. Never there for a guest. */
    picture?: string;
    /** What a proven member wrote about themselves, as their pass says. Their own words. Never there for a guest. */
    about?: string;
    color: number;
    /** How they look (spec §4.2). What their session key generates, until they say otherwise. */
    look: Look;
    /** They have said they are recording what they see (spec §9). */
    recording: boolean;
    /** The item they say they are holding, by its coordinate (protocol/17-items.md). Left out when they hold nothing. */
    holding?: string;
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
    relays?: string[];
    maxMembers?: number;
    iceServers?: RTCIceServer[];
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
 * How long a member has to show a pass in a room that shows only named people. A pass is said as the channel
 * opens and three more times, a second and a half apart, so a member who has one has shown it well before this.
 */
export declare const NAMED_WAIT_MS = 7000;
export declare class RoomSession {
    readonly self: Member;
    readonly name: string;
    readonly topic: string;
    status: RoomStatus;
    private readonly key;
    private readonly relays;
    /** Keys this visitor won't be in a room with: session keys, and the identity keys behind names. */
    private readonly blocked;
    /** Identity keys the world's owner keeps out. Never the visitor's own: never kept or carried on. */
    private ownerBlocked;
    /** Session keys let go this visit for the world's rules (the owner's list, or no pass where one is needed): not answered again. */
    private readonly turnedAway;
    /** Whether this room shows only people whose pass checks out: so where it is by invitation, too. */
    readonly namedOnly: boolean;
    /** Where the world is by invitation, who may be in its rooms; null where it isn't. */
    private invited;
    /** In a room that shows only named people: the members shown, by session key, and what arrived for each before. */
    private readonly announced;
    private readonly waiting;
    private readonly maxMembers;
    private readonly iceServers;
    private readonly sockets;
    private readonly peers;
    private readonly seen;
    private readonly listeners;
    private readonly look;
    /** The world's origin: the only place a pass shown here may have been made for. */
    private readonly origin;
    /** This visitor's own pass, as it is said to the others, and when it stops. */
    private pass;
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
