/**
 * What a visitor had in their hand as they left a world (protocol/17-items.md): which item, in which colours,
 * and the mark of its own logic if that was running for them.
 */
export interface HeldThrough {
    /** The item's address: `37303:<its maker>:<its name>`. */
    item: string;
    /** The colours they chose for it, by slot. */
    tints?: Record<string, string>;
    /** The SHA-256 of the item's script, if it was running: they had been told about it, and let it. */
    script?: string;
}
/** What goes with a visitor. Every part is optional: what isn't said is the next world's to decide. */
export interface TravelSettings {
    /** Their volumes, each from 0 to 1, and whether everything is off. */
    sound?: {
        off?: boolean;
        effects?: number;
        music?: number;
        voices?: number;
        hum?: boolean;
    };
    /** The size of text and controls, 1 being normal. */
    text?: number;
    /** Whether things move when they open and close. */
    motion?: boolean;
    /** Which wrist carries the console in a headset. */
    wrist?: "left" | "right" | "off";
    /** How far one turn goes in a headset, in degrees, turning a notch at a time. */
    turn?: 30 | 45 | 90;
    /** Which hand's stick moves them in a headset. */
    hand?: "left" | "right";
    /** Whether the view narrows while they move smoothly in a headset. */
    narrow?: boolean;
    /** Whether the view fades to black and back when the kit jumps them in a headset: a step, being stepped aside. */
    fade?: boolean;
    /** They prefer the world filling their screen: it is filled at their first press in each world. */
    full?: boolean;
    /** They prefer the intense way of moving at a desk: the mouse looks round and keys walk. */
    intense?: boolean;
    /**
     * How they prefer to move in a headset: `casual` (point at the floor to step there, turn a notch at a time) or
     * `intense` (one stick walks and the other turns, smoothly). Both are said, so a world can tell someone who chose
     * casual from someone never asked.
     */
    headset?: "casual" | "intense";
    /** How fast the view turns under a mouse or a finger, 1 being normal: from 0.25 to 3. */
    look?: number;
    /** How wide they see at a desk, top to bottom, in degrees: from 50 to 110. Left out, each world's own. */
    fov?: number;
    /**
     * Whether they see other people's pictures. A picture is fetched from wherever its owner keeps it, which tells
     * that place the visitor's address, so this is theirs to turn off. Left out, pictures are shown.
     */
    pictures?: boolean;
    /**
     * Whether they see people's own models (protocol/05-looks.md, "A model of your own"). Left out, they do, where a
     * world draws them. Turned off, everyone is drawn as their simple look.
     */
    models?: boolean;
    /**
     * Whether they see what other people write in a room, and may write there themselves. Left out, they do.
     * Turned off, nothing anyone writes is shown to them, and nobody is told.
     */
    chat?: boolean;
    /**
     * Whether anything people carry is fetched, drawn or run for them (protocol/17-items.md). Left out, it is, in
     * a world that has items. Turned off, it is off in the next world too: it is how they mute every item.
     */
    items?: boolean;
    /**
     * That other people's files (what their items are made of) are fetched only from the file hosts on the
     * visitor's own list (protocol/17-items.md, "Where a file is fetched from"). Only `false` travels: any world can
     * write a link, so turning loading from anywhere on can't come by one. It is turned on only by the visitor's own
     * press, in the place they are in. A `true` is dropped as it is read.
     */
    filesAnywhere?: false;
    /**
     * Which tabs of the menu they keep on their bar, by name, in the order they pinned them: `PINS_MOST` at most.
     * An empty list is a choice too: they took them all off. A name a world has no tab for is simply not shown
     * there. Only they pin: a world never does it for them.
     */
    pins?: string[];
    /**
     * What was in their hand, so that it is in their hand in the next world too; or `""`, when they put it away
     * themselves. A link can say this falsely, so a world acts on it only as far as is safe whoever wrote the
     * link: the thing is taken in hand only if it is in the visitor's own bag, as they signed it, and its logic
     * runs unasked only if it is the very script the link names. Anything else is as if nothing had been said.
     */
    holding?: HeldThrough | "";
}
/** The most tabs of the menu a visitor may keep on their bar. */
export declare const PINS_MOST = 4;
/** The slowest and fastest the view may be set to turn, and the narrowest and widest it may be set to see. */
export declare const LOOK_RANGE: readonly [0.25, 3];
export declare const FOV_RANGE: readonly [50, 110];
/** The longest a set of settings may be on a link, in characters. */
export declare const SETTINGS_LINK_LIMIT = 900;
/** Settings as they were said, with everything unknown or out of range left out. Never throws. */
export declare function cleanSettings(input: unknown): TravelSettings;
/** Whether there is anything in them. */
export declare const hasSettings: (s: TravelSettings | undefined) => s is TravelSettings;
/** Settings as they go on a link: "" when there are none, or they would be too long to send. */
export declare function encodeSettings(settings: TravelSettings | undefined): string;
/** Settings read off a link. Anything unreadable is no settings at all. */
export declare function decodeSettings(text: unknown): TravelSettings;
