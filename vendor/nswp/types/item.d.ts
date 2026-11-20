import { type EventTemplate, type NostrEvent } from "./event.js";
export declare const ITEM_LIMITS: {
    readonly title: 60;
    readonly summary: 280;
    /** No side of an item is longer than this, in metres. A file that is larger is scaled down to fit. */
    readonly metres: 4;
    /** How many shapes its hit box may be made of, and how many moments may have an animation. */
    readonly colliders: 8;
    readonly clips: 8;
    /** The longest an address may be. */
    readonly url: 300;
    /** How many sounds of its own it may name, and how many things it may send out. */
    readonly sounds: 12;
    readonly sends: 4;
    /** The most letters on one of its buttons. */
    readonly label: 16;
};
/**
 * A thing an item may send out: a dart, a ball. It is a shape of its own, and it says, by name, which of the
 * item's sounds go with what happens to it. What it does to a person it reaches is said apart, in `effects`.
 */
export interface ItemSend {
    name: string;
    model: ItemFile;
    /** Its box in metres. */
    size: [number, number, number];
    /** Which of the item's sounds is heard when it lands and sticks, when it drops off, and when it reaches a person. */
    lands?: string;
    drops?: string;
    strikes?: string;
    /** Which is heard by whoever sent it, when it reaches a person: the tick that goes with a hit mark. */
    tells?: string;
}
/**
 * What one of an item's things asks of a person it reaches. It is words, never code: "take 1 from their health".
 * The person's own device does it, by the rules of the world they are in, and may do nothing.
 */
export interface ItemEffect {
    /** Which of the things it sends out. */
    of: string;
    state: "health";
    /** How much is taken. A whole number from 1 to 5. */
    take: number;
}
/** What its two presses are called, for the buttons a visitor is shown: "Fire", "Reload". */
export interface ItemDoes {
    use?: string;
    second?: string;
}
/**
 * What an item can be, as its description says. A closed list: a world knows what each means, and ignores one it
 * doesn't. What happens when someone holds, sits on or touches it is the world's rule.
 */
export declare const ITEM_BEHAVIORS: readonly ["holdable", "sittable", "touchable", "readable", "wearable"];
export type ItemBehavior = (typeof ITEM_BEHAVIORS)[number];
/** Where an item may go: placed in a room, or on one of a person's attachment points. */
export declare const ITEM_FITS: readonly ["place", "head", "back", "hand-left", "hand-right", "side"];
export type ItemFit = (typeof ITEM_FITS)[number];
/** The moments an item may have an animation for. */
export declare const ITEM_MOMENTS: readonly ["idle", "touch", "held", "move", "use"];
export type ItemMoment = (typeof ITEM_MOMENTS)[number];
export type ItemCollider = {
    shape: "box";
    centre: [number, number, number];
    size: [number, number, number];
} | {
    shape: "sphere";
    centre: [number, number, number];
    radius: number;
} | {
    shape: "capsule";
    centre: [number, number, number];
    radius: number;
    height: number;
};
/** A file an item names: where it is, and the SHA-256 its bytes must have. */
export interface ItemFile {
    url: string;
    sha256: string;
}
export interface ItemInput {
    /** Its name among its maker's items: lower-case letters, digits and hyphens. */
    d: string;
    title: string;
    summary?: string;
    /** The model: a GLB file, which every engine here reads. */
    model: ItemFile;
    thumb?: ItemFile;
    /** Its box in metres: width, height, depth. */
    size: [number, number, number];
    colliders?: ItemCollider[];
    /** Which animation in the file goes with which moment. */
    clips?: Partial<Record<ItemMoment, string>>;
    behaviors?: ItemBehavior[];
    fits?: ItemFit[];
    /** Who may use it: anyone, or only someone its maker has granted it to. */
    use?: "anyone" | "granted";
    /**
     * What it does of its own: a script, run only on the device of whoever carries it, shut away from everything
     * but its own item (protocol/17-items.md, "An item's own logic"). Named here, and run by nothing yet.
     */
    script?: ItemFile;
    /** Its own sounds, by name. Each is a small file, fetched and checked like its model. */
    sounds?: Record<string, ItemFile>;
    sends?: ItemSend[];
    effects?: ItemEffect[];
    does?: ItemDoes;
    license?: string;
}
export interface Item extends Required<Pick<ItemInput, "d" | "title" | "model" | "size">> {
    /** Who made it. */
    maker: string;
    /** Its coordinate: `37303:<maker>:<d>`. */
    id: string;
    summary: string;
    thumb: ItemFile | null;
    colliders: ItemCollider[];
    clips: Partial<Record<ItemMoment, string>>;
    behaviors: ItemBehavior[];
    fits: ItemFit[];
    use: "anyone" | "granted";
    script: ItemFile | null;
    sounds: Record<string, ItemFile>;
    sends: ItemSend[];
    effects: ItemEffect[];
    does: ItemDoes;
    license: string;
    /** When its maker last described it, in seconds. */
    at: number;
}
/**
 * An item's description, ready to be signed by its maker. Null if anything in it couldn't be used: a name that
 * isn't one, no title, a file that isn't an `https` address with a hash, or a size out of bounds.
 */
export declare function buildItem(o: ItemInput & {
    now: number;
}): EventTemplate | null;
/**
 * Read an item's description. Null for anything that isn't one, or names no usable model. What it doesn't
 * understand, it leaves out: an unknown behaviour, a shape that isn't one, a place it can't go. The signature is
 * the caller's to check (`verifyEvent`), and every file is checked against its hash by whoever fetches it.
 */
export declare function parseItem(event: NostrEvent | null | undefined): Item | null;
