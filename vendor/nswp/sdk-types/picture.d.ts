/** Where the preference is kept, for this site. */
export declare const PICTURES_KEY = "nswp:pictures";
/** How much of a picture is ever downloaded, and how large the badge it is redrawn as is, in pixels. */
export declare const PICTURE_LIMITS: {
    readonly bytes: 3000000;
    readonly size: 128;
    readonly waitMs: 9000;
};
/** Whether this visitor sees other people's pictures. On, unless they turned it off here or where they came from. */
export declare function showsPictures(): boolean;
export declare function setShowsPictures(on: boolean): void;
/** Hear of the preference changing. Returns how to stop. */
export declare function onPicturesChange(cb: () => void): () => void;
/**
 * Someone's picture as a small round badge, or null if there is none to
 * show: the address isn't one that can be fetched, the place that holds it
 * didn't answer or won't let a page read it, it isn't a picture, or this
 * visitor has pictures turned off. Asked for once for each address.
 */
export declare function loadPicture(address: unknown): Promise<HTMLCanvasElement | null>;
/** For tests: forget what was loaded and what was chosen. */
export declare function resetPictures(): void;
