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
import { type FigureStyle } from "./figure.js";
import { type JoinOptions, type Member, type RoomSession } from "./room.js";
export { turnVisitor } from "./turn.js";
export { createConsole, type XrConsole } from "./console.js";
import type { Controls } from "./ui/model.js";
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
}
export interface Presence {
    readonly session: RoomSession | null;
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
    /** How this visitor looks to the others: for a selfie, or a mirror. */
    selfLook(): Member["look"] | string;
    /** Show for a few seconds where one member is: a column of light over their head. */
    pointOut(pubkey: string): void;
    /** Everyone else in the room, as they are being drawn. */
    people(): Member[];
    /** Call once per frame with the seconds since the last one. */
    update(dt: number): void;
    /** What this visitor currently sees of each member (for tests and debugging). */
    info(): AvatarInfo[];
}
/** A text panel that always faces the viewer. `width` is in metres. */
export declare function textSprite(text: string, color: string, width: number): THREE.Sprite;
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
export declare function addRoomControls(controls: Controls, presence: Presence, opts?: {
    search?: string;
    onState?: (state: Record<string, unknown> | null) => void;
}): {
    refresh(): void;
};
/**
 * The controls every world's view needs: enter or leave VR, and turn around.
 * Returns whether this device can enter VR at all.
 *
 * It also hides the flat HUD while a headset session runs. The page can't be
 * seen from inside one, and the console takes over.
 */
export declare function addViewControls(controls: Controls, d: {
    renderer: THREE.WebGLRenderer;
    rig: THREE.Object3D;
    camera: THREE.Camera;
    hud?: {
        setHidden(hidden: boolean): void;
    };
    onState?: (state: string) => void;
}): Promise<boolean>;
export { createFigure, type Figure, type FigureFacts, type FigureStyle } from "./figure.js";
export { addCameraControls, canRecord, recordClip, saveFile, takePicture, takeSelfie, type Camera, type CameraOptions, type Capture, type Clip } from "./camera.js";
