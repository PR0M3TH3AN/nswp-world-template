export interface PreviewShot {
    base64: string;
    width: number;
    height: number;
    bytes: number;
}
/** The six views an engine takes, as JSON, in the order it hands them back: each one's `forward` and `up`. 90° wide, square. */
export declare function previewViews(): string;
/**
 * Ask the engine for the world's 360° picture. It is told `{ type: "preview", size }` (how many pixels square
 * each view should be) and answers with `previewFaces`. Resolves to the finished picture, or rejects if the engine
 * doesn't answer: one that doesn't take pictures never will.
 */
export declare function capturePreview(width?: number): Promise<PreviewShot>;
/**
 * The engine's six views, as JSON: `faces`, six PNG files as base64, in the order of `previewViews()`. Each is
 * what a camera 90° wide sees looking along that view's `forward` with its `up` upward, taken with nothing in it
 * that is about one visitor, and without fog or glow (they differ from view to view and leave seams).
 * Returns "true" if a picture was being waited for.
 */
export declare function previewFaces(faces: string): string;
