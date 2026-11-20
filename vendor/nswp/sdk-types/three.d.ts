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
export { turnVisitor } from "./turn.js";
export { createConsole, type XrConsole } from "./console.js";
import type { Controls } from "./ui/model.js";
import type { GoOptions } from "./index.js";
export { createPresence, speechSprite, textSprite, type AvatarInfo, type Presence, type PresenceOptions } from "./presence.js";
export { addRoomControls, type RoomFollows, type RoomNotes, type Travelling } from "./room-controls.js";
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
export { allowScript, createPlay, mayHold, paintHealth, scriptAllowed, type Play, type PlayInfo, type PlayOptions, type PlayPerson, type PlaySnapshot } from "./play.js";
export { runInBox, type BoxAsk, type BoxRun, type ItemBoxOptions } from "./item-box.js";
export { addItemControls, TAP_MS, type ItemControls, type ItemControlsOptions } from "./item-controls.js";
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
