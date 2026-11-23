/** This page's own save: the device's, as a download. */
export declare function download(blob: Blob, name: string): void;
/**
 * Hand a file to the visitor: their device's own save. True where it went up to the client to be saved there,
 * under a name of the client's own; false where this page saved it as a download, under `name`.
 */
export declare function saveFile(blob: Blob, name: string): boolean;
