/**
 * The visitor's library: the pictures and video of their own that this
 * browser keeps, and a board to choose from inside a headset.
 *
 * A page can't show the files on a visitor's device: the browser keeps its
 * file picker to itself, and draws it as a flat window. What a page can hold
 * is what the visitor has already given it. So everything they hang, and
 * every picture they take here, goes into the library, and from then on it
 * is one select away in any headset.
 *
 * Nothing in it is sent anywhere. It is kept for this site, in this browser.
 */
import * as THREE from "three";
import { type LibraryItem } from "./panel-store.js";
/** Do one thing to the kept files. Returns undefined where this browser keeps nothing. */
export declare function fileStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined>;
export interface Library {
    readonly group: THREE.Group;
    /** Everything kept, newest first. */
    list(): LibraryItem[];
    /** Keep a picture or a video. Null if it is neither, is too large, or the library is full. */
    add(file: Blob, name?: string): Promise<LibraryItem | null>;
    remove(id: string): Promise<void>;
    /** Whether the board is up. */
    showing: boolean;
    pick(raycaster: THREE.Raycaster): string | null;
    aim(hit: string | null): void;
    press(hit: string): void;
    pointOf(hit: string): THREE.Vector3 | null;
    info(): {
        showing: boolean;
        page: number;
        pages: number;
        removing: boolean;
        cells: string[];
    };
    update(): void;
    dispose(): void;
}
export interface LibraryOptions {
    scene: THREE.Scene;
    camera: THREE.Camera;
    accent?: THREE.ColorRepresentation;
    textColor?: string;
    /** Keep the list under this name. Left out, the library lasts for the visit. */
    keep?: string;
    /** The visitor chose one from the board. */
    onChoose: (item: LibraryItem) => void;
    onChange?: () => void;
}
export declare function createLibrary(o: LibraryOptions): Library;
