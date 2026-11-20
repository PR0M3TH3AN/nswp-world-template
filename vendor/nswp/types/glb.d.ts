/**
 * Reading a model file before anything draws it (protocol/17-items.md, "Holding one").
 *
 * An item's model is somebody else's file. Before it is handed to whatever draws the world, it is read here, as
 * bytes and nothing more, and counted: how many triangles, meshes and materials it has, how large its pictures
 * are, and whether it asks for anything from anywhere else. This is the same count for every engine, made before
 * any engine's own reader sees the file: so a model too heavy for one world is too heavy for all of them, and a
 * file can never send a visitor's browser to fetch something from an address its maker chose.
 *
 * It reads only a binary glTF (GLB) that holds everything it needs inside itself. It decodes no geometry and no
 * picture: sizes are read from each picture's own first few bytes.
 */
/**
 * Which of an item's colours a material is, if it is one a holder may choose: it is named `tint:<slot>`, or
 * `tint_<slot>` (some tools, Godot among them, won't write a colon in a name). "" for any other material.
 */
export declare function tintSlot(name: unknown): string;
/** The most a carried model may be. One budget, whatever draws it. */
export declare const MODEL_BUDGET: {
    /** The most a model file may weigh, in bytes. */
    readonly bytes: 2000000;
    /** The most triangles, meshes and materials a model may have. */
    readonly triangles: 20000;
    readonly meshes: 40;
    readonly materials: 16;
    /** The longest side of any picture a model's surfaces may use, in pixels. */
    readonly texture: 1024;
};
export interface GlbCount {
    triangles: number;
    meshes: number;
    materials: number;
    /** The longest side of its largest picture, or 0 where it has none. */
    texture: number;
    animations: string[];
    /** The names of its materials, in order: a renderer colours the ones named `tint:<slot>`. */
    materialNames: string[];
}
export type GlbRead = {
    ok: true;
    count: GlbCount;
} | {
    ok: false;
    why: "not-glb" | "too-big" | "outside" | "needs-more" | "over-budget" | "unreadable";
};
/**
 * How large a model is as it stands, and the colours its maker left for a holder to choose: for someone
 * describing an item made in any tool (`nswp make-item`). The box is what its meshes fill, with every node's
 * place and turn taken into account, in metres: width, height, depth. A tint is a material named `tint:<slot>`
 * or `tint_<slot>` (`tintSlot`), and its colour is the one the material has. Null for a file `readGlb` would refuse.
 */
export declare function measureGlb(bytes: Uint8Array): {
    size: [number, number, number];
    tints: {
        slot: string;
        color: string;
    }[];
    count: GlbCount;
} | null;
/**
 * Read a model file and count it. It is refused where it isn't a binary glTF, is over the budget, needs something
 * a plain reader doesn't have (`needs-more`), or names anything outside itself (`outside`): a buffer or a picture
 * at an address. Nothing is fetched and nothing is drawn.
 */
export declare function readGlb(bytes: Uint8Array, budget?: typeof MODEL_BUDGET): GlbRead;
