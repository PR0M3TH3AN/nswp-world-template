/**
 * nswp-sdk/three — shared presence for Three.js worlds (spec §9.4, §9.8).
 *
 *   const presence = createPresence({ scene, camera, rig, renderer, controllers });
 *   attachRoomControls(presence, { roomButton, micButton, inviteButton, status });
 *   // each frame:
 *   presence.update(dt);
 *
 * It draws other members as avatars (head, body, hands), plays their voices
 * from where they stand, sends your own pose, and keeps personal space.
 *
 * This is the Phase 4b spike: guests only. Joining a room shows your IP
 * address to the other members, so join only after the visitor has agreed.
 */
import * as THREE from "three";
import { type NostrEvent } from "@nswp/core";
import { type FigureStyle } from "./figure.js";
import { type JoinOptions, type Member, type RoomSession } from "./room.js";
export { turnVisitor } from "./turn.js";
export { createConsole, type XrConsole } from "./console.js";
import type { Controls } from "./ui/model.js";
import { type Items } from "./items.js";
import { type Play, type PlayOptions } from "./play.js";
import type { ItemBoxOptions } from "./item-box.js";
import { type Following, type FollowingHand } from "./following.js";
import type { PersonLines } from "./person-lines.js";
import { type Messaging, type MessagingHand } from "./messaging.js";
import type { GoOptions } from "./index.js";
import type { Panels } from "./panels.js";
import type { Sounds } from "./sound.js";
export interface PresenceOptions {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    /** The object that moves the visitor around; the camera is inside it. */
    rig: THREE.Object3D;
    renderer: THREE.WebGLRenderer;
    /** XR controller target-ray spaces, as from `renderer.xr.getController(i)`. */
    controllers: THREE.Object3D[];
    /** CSS colour for name labels. */
    labelColor?: string;
    /**
     * What fetches and checks items (items.ts), for a world that lets visitors carry things in
     * (protocol/17-items.md). Left out, nothing anyone holds is drawn.
     */
    items?: Items | null;
    /** What this world does with items: "none", "allowed" or "play". Asked each time. Left out, none. */
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
    join(name: string | null): Promise<void>;
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
    setHolding(item: string): Promise<{
        ok: boolean;
        said: string;
    }>;
    /**
     * Items in play (play.ts): what the item in hand does on a press, the things sent out, and how this visitor is.
     * Null in a world that draws no items.
     */
    readonly play: Play | null;
    /** Which hand holds the item in a headset: the index of its controller, or -1 at a desk or with nothing held. */
    readonly holdingHand: number;
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
export interface CaptureOptions {
    /** Width of the panorama in pixels; the height is half of it. Default 2048, at most 4096. */
    width?: number;
    /** Objects to leave out, such as text that is specific to one visitor. */
    hide?: THREE.Object3D[];
    /** WebP quality from 0 to 1. Default 0.82. */
    quality?: number;
}
/**
 * Capture a world's preview (spec §5.8): a 360° still, twice as wide as tall,
 * taken from `position` (use the default entry point, at eye height). The
 * centre of the image is the view along -Z from there.
 *
 * Returns a WebP file. Publish it by hash; the announcement's `preview` tag
 * carries the address, the type `pano`, the SHA-256 and the dimensions.
 */
export declare function capturePanorama(renderer: THREE.WebGLRenderer, scene: THREE.Scene, position: THREE.Vector3, opts?: CaptureOptions): Promise<Blob>;
/** Prepare a loaded panorama image for use in a portal window. */
export declare function panoramaTexture(image: TexImageSource): THREE.Texture;
export interface PortalWindowOptions {
    /** An alpha texture that cuts the window's shape (an arch, say) out of the geometry. */
    mask?: THREE.Texture;
    /**
     * How far back, at most, the view is taken from, in metres (default 1.5).
     * A true window seen from across a room shows only a sliver of what is
     * behind it, which for a preview is usually nothing recognisable. So the
     * view is worked out as if the viewer stood no further away than this:
     * from a distance they see a wide view, and close up it behaves like a real
     * window. `Infinity` gives a true window at every distance.
     */
    reach?: number;
}
/**
 * A window into a panorama: the mesh shows the part of the destination that
 * lies behind it from where the viewer stands, so the view shifts as they
 * move, like looking through a doorway. The mesh's local -Z is "into" the
 * destination and lines up with the centre of the panorama.
 */
export declare function createPortalWindow(geometry: THREE.BufferGeometry, pano: THREE.Texture, opts?: PortalWindowOptions): THREE.Mesh;
/**
 * A room's controls, added to a world's controls (ui/model.ts): join or leave,
 * the microphone, and a private room to invite someone to. The HUD and the
 * headset console both draw them from there, so neither has room logic of its own.
 *
 * Joining shows a visitor's IP address to the others in the room. The Room
 * section says so before they join, on a flat screen and in a headset.
 */
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
}): {
    refresh(): void;
    travelling(): Travelling;
    following: Following;
    messaging: Messaging;
};
export declare function addViewControls(controls: Controls, d: {
    renderer: THREE.WebGLRenderer;
    rig: THREE.Object3D;
    camera: THREE.Camera;
    hud?: {
        setHidden(hidden: boolean): void;
    };
    onState?: (state: string) => void;
    /**
     * The visitor left a headset session to come here (`arrival.read().context?.immersive`,
     * or however a client knows). They are offered the way back in before anything else.
     */
    arrived?: {
        title: string;
    };
    /** The offer above has gone up, or been answered. */
    onOffer?: (showing: boolean) => void;
    /**
     * The visitor's state as they leave to say who they are (in a room, their microphone on, moving the intense
     * way), so they come back as they left. The headset session is added here.
     */
    leaving?: (to: {
        title: string;
        address: string;
    }) => GoOptions | Promise<GoOptions>;
    /** False for a world that sets its camera's width itself, and so applies the visitor's own (`watchFov`, `visitorFov`). */
    fov?: boolean;
}): Promise<boolean>;
export { createFigure, type Figure, type FigureFacts, type FigureStyle } from "./figure.js";
export { createXrInput, type GrabOptions, type XrInput, type XrInputInfo, type XrInputOptions } from "./input.js";
export { CASUAL_COMFORT, DEFAULT_COMFORT, INTENSE_COMFORT, isIntense, readPad, type Comfort, type PadState } from "./actions.js";
export { addPanelControls, createPanels, type Panel, type PanelContent, type PanelInfo, type Panels, type PanelsOptions } from "./panels.js";
export { LIBRARY_LIMITS, PANEL_LIMITS, PANEL_LOOKS, type LibraryItem, type PanelLook, type PanelPlace, type PanelRecord, type PanelSource } from "./panel-store.js";
export { createStay, wasRefreshed, type Stay, type Stood } from "./stay.js";
export { watchFresh, type Fresh, type FreshOptions } from "./fresh.js";
export { freshAction } from "./ui/fresh.js";
export { createStepPace, createStroll, dotsBetween, DOUBLE_TAP, DRAG_LOOK, FACE_RATE, KEY_TURN, PATH_MOST, reachOf, RUN, TAP_REACH, TOP_SPEED, WALK_SPEED, type StepPace, type Stroll } from "./stroll.js";
export { createFloorMarks, type FloorMarks } from "./floor-mark.js";
export { DOOR_REACH } from "./gate-size.js";
export { addJump, createJump, JUMP_GRAVITY, JUMP_HEIGHT, JUMP_SPEED, type AddJumpOptions, type Jump } from "./jump.js";
export { viewScale } from "./sign.js";
export { arrivedSettings, arriveWith, currentSettings, reportSettings, type TravelSettings } from "./settings.js";
export { fullscreenWaiting, prefersFullscreen, resumeFullscreen } from "./ui/fullscreen.js";
export { loadPicture, onPicturesChange, PICTURE_LIMITS, setShowsPictures, showsPictures } from "./picture.js";
export { addDeskControls, FOV_STEPS, LOOK_STEPS, lookScale, onDeskChange, setLookScale, setVisitorFov, visitorFov, watchFov } from "./desk.js";
export { byName, figureAction, hereAs, identityAction, identityHost, identitySection, identityWords, onHereAs, seekPass, signerAction, signerNamed, worldPeople, worldSaves, worldSigner, youCard, type Leaving } from "./ui/identity.js";
export { createSaves, type Saved, type SaveResult, type Saves, type SavesOptions } from "./saves.js";
export { foundRelays, publishBacked, queryBacked, relayBackup } from "./relay-book.js";
export { createScores, type ScoreHand, type Scores, type ScoresOptions } from "./scores.js";
export { addScoreControls, type Scoring, type ScoringOptions } from "./scoring.js";
export { createItems, fitToSize, ITEM_BUDGET, onItemsChange, setShowsItems, showsItems, withinBudget, type Items, type ItemsOptions } from "./items.js";
export { createBag, type Bag, type BagHand, type BagOptions, type BagResult } from "./bag.js";
export { addBagControls, itemIn, type Bagging, type BaggingOptions } from "./bagging.js";
export { allowScript, createPlay, scriptAllowed, type Play, type PlayInfo, type PlayOptions, type PlayPerson } from "./play.js";
export { runInBox, type BoxAsk, type BoxRun, type ItemBoxOptions } from "./item-box.js";
export { addItemControls, type ItemControls, type ItemControlsOptions } from "./item-controls.js";
export { createDoorRatings, type DoorRatings, type DoorRatingsOptions } from "./door-ratings.js";
export { ordinal, someOf, worldPersonLines, type PersonLines } from "./person-lines.js";
export { createAchievements, type AchievementHand, type Achievements, type AchievementsOptions } from "./achievements.js";
export { addAchievementControls, type Achieving, type AchievingOptions } from "./achieving.js";
export { createMessages, type Conversation, type MessageHand, type Messages, type MessagesOptions, type MessagesState } from "./messages.js";
export { addMessagingControls, type Messaging, type MessagingHand, type MessagingOptions } from "./messaging.js";
export { addFollowingControls, keyIn, type Following, type FollowingHand, type FollowingOptions } from "./following.js";
export { createProfiles, readProfile, type Profile, type Profiles } from "./profiles.js";
export { createPeople, type FollowHand, type FollowResult, type FollowWhy, type People, type PeopleOptions } from "./people.js";
export { askWell, learnFrom, relaysWell, sendWell, type SentWell } from "./relay-book.js";
export { createWorldSigner, type SignerState, type WorldSigner } from "./signer.js";
export { currentForm, deviceForms, formFor, startingForm, usedForm, type DeviceForms, type Form } from "./form.js";
export { createFps, heldKey, lookAfter, strideOf, LOOK_SPEED, PITCH_LIMIT, SPRINT, type Fps, type FpsOptions, type Held } from "./fps.js";
export { addSoundControls, createSounds, CUES, type Cue, type Jukebox, type Song, type SoundLevels, type Sounds, type SoundsOptions, type SoundTheme } from "./sound.js";
export { browserVoice, computerVoice, createVoice, recordVoice, toPcm16, type Hearing, type Voice, type VoiceSource, type VoiceState } from "./speech.js";
export { createKeyboard, type AskOptions, type Keyboard, type KeyboardOptions } from "./keyboard.js";
export { createLibrary, type Library, type LibraryOptions } from "./library.js";
export { CHAMBER_ORDER, createChamber, createCrossing, type ArriveOptions, type Chamber, type Crossing, type CrossingOptions, type CrossingState } from "./chamber.js";
export { addCameraControls, canRecord, recordClip, saveFile, takePicture, takeSelfie, type Camera, type CameraOptions, type Capture, type Clip } from "./camera.js";
