/**
 * Other people in a room, for a world drawn with Three.js: their figures, their names and pictures, what they
 * write, what they hold, and their voices from where they stand (spec §9.4, §9.8). It sends the visitor's own
 * pose, and keeps personal space.
 *
 * Everything here that isn't drawing is the same for a world made with another engine: `drawn()` gives such a
 * world each person as plain shapes and pictures to draw for itself (engine-people.ts), from this one copy.
 */
import * as THREE from "three";
import { type EntryPlace } from "@nswp/core";
import { type Figure, type FigureStyle } from "./figure.js";
import { type JoinOptions, type Member, type RoomSession } from "./room.js";
import { type Items } from "./items.js";
import { type Play, type PlayOptions } from "./play.js";
import type { ItemBoxOptions } from "./item-box.js";
export interface PresenceOptions {
    /**
     * Where the visitor arrived, for stepping them aside if they join and find themselves inside someone (protocol/
     * 01-worlds.md, "Places to arrive"): the places of the entry point they came by (`entryPlaces`), where they may
     * stand, and whether they are stepping or turning now. Asked when they join. Only the one arriving is ever moved,
     * once, soon after they join, and never while they are stepping or turning; in a headset it is the same instant cut
     * a step is, never a slide. Left out, they are stepped a little way round their spot as before (`spawnOffset`).
     */
    arrival?: () => {
        places: readonly EntryPlace[];
        canStand?: (x: number, z: number) => boolean;
        moving?: () => boolean;
    } | null;
    /**
     * The world's own rules for its rooms (protocol/10-identity.md, "A world's own lists"), as its gate last read
     * them: the identity keys its owner keeps out, and whether its rooms show only named people. Asked each time a
     * room is joined, and again when `rulesChanged()` is called. Left out, the page's own gate's (`pageRules` in
     * ui/identity.ts), taken again whenever that gate reads a change; with no gate, a room is as it always was.
     */
    worldRules?: () => {
        blocked: readonly string[];
        namedOnly: boolean;
        invited?: readonly string[] | null;
    };
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    /** The object that moves the visitor around; the camera is inside it. */
    rig: THREE.Object3D;
    /**
     * What says whether the visitor is in a headset: a Three.js renderer, or for a world drawn by something else,
     * anything that answers the same two questions.
     */
    renderer: {
        xr: {
            readonly isPresenting: boolean;
            getSession(): XRSession | null;
        };
    };
    /** XR controller target-ray spaces, as from `renderer.xr.getController(i)`. */
    controllers: THREE.Object3D[];
    /** CSS colour for name labels. */
    labelColor?: string;
    /**
     * What fetches and checks items (items.ts), for a world that lets visitors carry things in
     * (protocol/17-items.md). Left out, nothing anyone holds is drawn.
     */
    items?: Items | null;
    /**
     * What this world does with items: "none", "allowed" or "play". Asked each time. Left out, allowed, as a world
     * that says nothing is. With no `items` to fetch them with, it is always none: nothing could be drawn.
     */
    itemsRule?: () => string;
    /**
     * Whether an item's own logic runs in this world, in its locked box (item-box.ts), and where the box's page is
     * served. Left out, items are shapes here and do nothing of their own.
     */
    itemScripts?: boolean | ItemBoxOptions;
    /** The world's sounds: an item's own sounds are played through them, at the visitor's own volume. */
    sounds?: PlayOptions["sounds"];
    /** Whether a shape of this world is solid to things items send out. Left out, every mesh that can be seen is. */
    solid?: PlayOptions["solid"];
    /** Be told when something an item sent out sticks to a shape of this world: what that means is the world's rule. */
    onStruck?: PlayOptions["onStruck"];
    /** The world's own colour and whether things may move for the visitor, for what is drawn of how they are. */
    theme?: PlayOptions["theme"];
    /**
     * True for a world drawn by another engine: things in play are kept as places and directions, and that engine
     * draws them and says what each ran into (`play.snapshot()`, `play.met()`).
     */
    deferredPlay?: boolean;
    /**
     * Whether the item in hand is up at the visitor's eye, where something other than this draws it there. Left
     * out, this brings it up itself (`setSighting`).
     */
    sighting?: () => boolean;
    /**
     * The visitor's own look, in its inline form (spec §4.2), for the others in a
     * room to draw them by: usually `arrival.look()`. A function is asked each
     * time a room is joined. Left out, they are drawn as their session key generates.
     */
    look?: string | (() => string | undefined);
    /**
     * Who the visitor is, if they came by name (protocol/10-identity.md):
     * usually `() => arrival.identity()`. Asked each time a room is joined.
     * Left out, they are a guest.
     */
    identity?: JoinOptions["identity"] | (() => JoinOptions["identity"] | undefined);
    /** Draw other people in this world's own way (spec §4.2, "What a world may change"). */
    figureStyle?: FigureStyle;
    /** Called whenever membership, status or the microphone changes. */
    onChange?: () => void;
    /** False where this world draws what people write in a way of its own: no line is drawn over anyone's head. */
    bubbles?: boolean;
}
export interface AvatarInfo {
    pubkey: string;
    name: string;
    visible: boolean;
    opacity: number;
    head: number[] | null;
    hands: [boolean, boolean];
    audioLevel: number;
    /** How they are being drawn. */
    look: Member["look"];
    /** True until their pass has checked out. */
    guest: boolean;
    /** The identity key behind them, if proven. */
    identity: string | null;
    /** What is written over their head now, or "". */
    saying: string;
    /** This visitor has stopped hearing them. */
    muted: boolean;
    /** They are offering their music to people nearby. */
    music: boolean;
    /** Their music is being asked for and played here. */
    hearing: boolean;
    /** How loud their music is being played here, after distance and ducking, from 0 to 1. */
    musicVolume: number;
    /** How loud their music is arriving, before any of that. */
    musicLevel: number;
}
export interface Presence {
    readonly session: RoomSession | null;
    /** Whether the visitor is in a headset now. */
    readonly presenting: boolean;
    /** The private room's name, or null in a world's open room. */
    readonly roomName: string | null;
    readonly micOn: boolean;
    /**
     * Join the room. Refused, with plain words in the error, where the world's rules would keep this visitor out of
     * it: a guest in a world whose rooms show only named people, or someone the world's owner keeps out.
     */
    join(name: string | null): Promise<void>;
    /** The world's rules for its rooms have changed (its gate read a newer list): the room here takes them at once. */
    rulesChanged(): void;
    leave(): void;
    setMicrophone(track: MediaStreamTrack | null): Promise<void>;
    /** A quiet test tone to use in place of a microphone. */
    testTone(): MediaStreamTrack;
    /** Tell the others you are recording what you see, or have stopped. They are shown a light on your figure. */
    setRecording(on: boolean): void;
    /** The item this visitor is holding, by its coordinate, or "". */
    readonly holding: string;
    /**
     * Take an item in hand, or put it away with "" (protocol/17-items.md). It is drawn for the visitor and said to
     * the room. Refused, with a few words why, where the world has no items, the item can't be held, or it has to
     * be granted.
     */
    setHolding(item: string, tints?: Record<string, string>): Promise<{
        ok: boolean;
        said: string;
    }>;
    /**
     * Choose the colours of what is in hand (protocol/17-items.md, "A holder's own colours"): for each of the item's
     * tints, a colour. It is recoloured at once, and the room is told. A tint left out is as its maker made it.
     */
    setTints(tints: Record<string, string>): void;
    /** The colours chosen for what is in hand now. */
    readonly tints: Record<string, string>;
    /**
     * Items in play (play.ts): what the item in hand does on a press, the things sent out, and how this visitor is.
     * Null in a world that draws no items.
     */
    readonly play: Play | null;
    /** Which hand holds the item in a headset: the index of its controller, or -1 at a desk or with nothing held. */
    readonly holdingHand: number;
    /**
     * How what they hold sways as they walk, across and up, as shares of how far off it is drawn: for another
     * engine to add to where it draws the thing. Nought and nought while they stand, aim along it, or want no motion.
     */
    readonly heldBob: [number, number];
    /**
     * Aim along the sight of what is in hand, at a desk, or stop: it is brought up to the eye, and they see as much
     * narrower as the item asks (never narrower than a little under half). Nothing happens for an item with no sight.
     */
    setSighting(on: boolean): void;
    readonly sighting: boolean;
    /** Stop, or let again, what one person's items do from reaching this visitor. Nobody is told. For a place that only allows items. */
    muteItems(pubkey: string, on: boolean): void;
    isItemsMuted(pubkey: string): boolean;
    /** What this world does with items: "none", "allowed" or "play". */
    readonly itemsRule: string;
    /** How this visitor looks to the others: for a selfie, or a mirror. */
    selfLook(): Member["look"] | string;
    /** Show for a few seconds where one member is: a column of light over their head. */
    pointOut(pubkey: string): void;
    /**
     * Whose picture a ray is on, by their session key, or null. A picture over someone's head is a button: a world
     * asks this wherever it asks what a pointer is on. The ray's `camera` must be set, as for any sprite.
     */
    personAt(raycaster: THREE.Raycaster): string | null;
    /**
     * Where someone is from the visitor's own head: how far in metres, and how far to one side (-1 is hard left, 1
     * hard right). For a sound they made. Null for someone not drawn yet.
     */
    whereIs(pubkey: string): {
        distance: number;
        pan: number;
    } | null;
    /** Press whoever's picture the ray is on, as choosing them from the People list does. True if someone was. */
    pressAt(raycaster: THREE.Raycaster): boolean;
    /** What pressing a picture does. The room's controls set it. */
    onPerson(cb: (pubkey: string) => void): void;
    /** Everyone else in the room, as they are being drawn. */
    people(): Member[];
    /** How loud other people's voices are for this visitor, from 0 to 1. Theirs to set, and nobody else's. */
    setVolume(volume: number): void;
    /**
     * Stop drawing the others, or draw them again: for the moments a visitor is shut in the crossing's room, where
     * someone standing in the same spot would otherwise be in it with them. They are still there, and still heard.
     */
    setHidden(hidden: boolean): void;
    /** Whether this visitor is offering their music to people nearby. */
    readonly musicOn: boolean;
    /** How many members their music is going to now. */
    readonly musicListeners: number;
    /**
     * Offer music to people nearby, or stop (null). It is sent only to members who are near and have turned on
     * hearing shared music. It ends when the visitor leaves the room.
     */
    shareMusic(track: MediaStreamTrack | null): Promise<void>;
    /** Whether to hear music people nearby share, and how loud. Off until the visitor turns it on. */
    setHearShared(on: boolean, volume: number): void;
    /** Stop hearing one member's music, or hear it again, whether or not they are sharing any now. Their voice is not affected. */
    muteMusic(pubkey: string, on: boolean): void;
    isMusicMuted(pubkey: string): boolean;
    /** Whether this visitor is offering their screen to the room. */
    readonly screenOn: boolean;
    /** How many members their screen is going to now. */
    readonly screenViewers: number;
    /**
     * Offer a screen to the room, or stop (null). It is sent only to members who ask to watch. It ends when the
     * visitor leaves the room, or stops it from the browser's own bar.
     */
    shareScreen(track: MediaStreamTrack | null): Promise<void>;
    /** Ask to be sent a member's screen, or stop. */
    watch(pubkey: string, on: boolean): void;
    isWatching(pubkey: string): boolean;
    /** The line a member's screen arrives on, or null before they are connected. It is empty unless watched. */
    screenOf(pubkey: string): MediaStream | null;
    /**
     * Stop hearing one member's voice, or hear it again. They are still seen, and still see and hear this
     * visitor. Their music, if they share any, is a separate choice (`muteMusic`). Nobody is told. It lasts while
     * they are here.
     */
    mute(pubkey: string, on: boolean): void;
    isMuted(pubkey: string): boolean;
    /**
     * Stop being in a room with one member: the connection to them is closed and not made again. To them, this
     * visitor has left. Someone who came by name stays blocked on this site when they come back; a guest is a new
     * key each visit, so that block lasts this visit. Returns their name, or null if they aren't here.
     */
    block(pubkey: string): string | null;
    /** Let someone back, by the key `blocked()` lists them under. */
    unblock(key: string): void;
    /** Everyone this visitor has blocked: named people, kept on this site, and guests blocked this visit. */
    blocked(): {
        key: string;
        name: string;
        kept: boolean;
    }[];
    /**
     * People the visitor has blocked everywhere: their own client's list, as it arrived with them. Nobody on it
     * is connected to during this visit. It isn't kept here, and isn't undone here: it is their client's.
     */
    blockAlso(keys: string[]): void;
    /** How many people are blocked by the visitor's own client's list. */
    readonly blockedElsewhere: number;
    /**
     * The named people blocked here during this visit, by identity key: what a world reports to the visitor's
     * client as they leave, so the client can ask whether to block them everywhere.
     */
    newlyBlocked(): string[];
    /** Call once per frame with the seconds since the last one. */
    update(dt: number): void;
    /** What this visitor currently sees of each member (for tests and debugging). */
    info(): AvatarInfo[];
    /**
     * Everyone who is being drawn, as what they are drawn with: for a world that draws people with something other
     * than Three.js (engine-people.ts). Their figures, names, pictures and words are made here whatever draws them,
     * so they look the same in every world, and nothing about who is where is worked out twice.
     */
    drawn(): PersonDrawn[];
}
/** One person as they are being drawn now. Every part is where it is in the world: read it, and change nothing. */
export interface PersonDrawn {
    pubkey: string;
    name: string;
    /** Between 0 and 1: less as they come very close, so that nobody fills another's view. */
    opacity: number;
    /** Their head, body and hands. A change of look, or a pass that checked out, makes a new one. */
    figure: Figure;
    /** Their name, over their head. */
    label: THREE.Sprite;
    /** Their own picture, over their name. */
    picture: THREE.Sprite | null;
    /** What they last wrote, for a few seconds. */
    bubble: THREE.Sprite | null;
    /** Lit while they say they are recording. */
    light: THREE.Sprite | null;
    /** A column of light while they are being pointed out. */
    beam: THREE.Sprite | null;
    /** The item they say they hold, by its coordinate, or "": the colours they chose for it, and where it is. */
    holding: string;
    tints: Record<string, string>;
    held: THREE.Object3D | null;
}
/** A text panel that always faces the viewer. `width` is in metres. */
export declare function textSprite(text: string, color: string, width: number): THREE.Sprite;
/**
 * A few written words in a speech bubble, facing the viewer: light paper, dark ink, a small tail underneath. It is
 * as wide as its words need, up to `width` metres, and stands on its own bottom edge. The words are drawn as text
 * and as nothing else.
 */
export declare function speechSprite(text: string, width?: number): THREE.Sprite;
export declare function createPresence(d: PresenceOptions): Presence;
