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
import { type RoomSession } from "./room.js";
export { createWorldMenu, menuItemFor, turnVisitor, type MenuItem, type WorldMenu, type WorldMenuOptions } from "./menu.js";
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
    /** Call once per frame with the seconds since the last one. */
    update(dt: number): void;
    /** What this visitor currently sees of each member (for tests and debugging). */
    info(): AvatarInfo[];
}
/** A text panel that always faces the viewer. `width` is in metres. */
export declare function textSprite(text: string, color: string, width: number): THREE.Sprite;
export declare function createPresence(d: PresenceOptions): Presence;
export interface RoomControls {
    roomButton: HTMLButtonElement;
    micButton: HTMLButtonElement;
    inviteButton: HTMLButtonElement;
    /** Where room status is written. Give it `role="status"`. */
    status: HTMLElement;
    /** `?mic=tone` uses a test tone instead of asking for the microphone. */
    search?: string;
    /** Called with a small summary whenever the room changes (for tests). */
    onState?: (state: Record<string, unknown> | null) => void;
}
/**
 * Wires a page's Join / microphone / invite buttons to a presence. Nothing
 * connects until Join is pressed, because joining shows the visitor's IP
 * address to the other members. Voice has to be switched on from the page,
 * before entering VR.
 *
 * Wrap the returned `refresh` into the presence's `onChange`.
 */
export declare function attachRoomControls(presence: Presence, c: RoomControls): {
    refresh(): void;
};
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
