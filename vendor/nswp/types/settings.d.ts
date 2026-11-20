/**
 * Settings that travel: the few things a visitor sets once and expects to
 * find the same in the next world.
 *
 * Each world is a different website, and a website can only remember what a
 * visitor chose on that site. So someone who turned the music down, made the
 * text larger or filled their screen had to do it again in every world. These
 * settings go with them instead, through each door, the same way that how
 * they move does: the world they leave says what they are, their own client
 * passes that on, and the world they arrive in starts from it
 * (protocol/11-the-visitors-console.md, "Settings that travel").
 *
 * They are what the visitor has chosen, not what happened to be so when they
 * left: someone who prefers a filled screen and pressed Escape for a moment
 * in one world still prefers a filled screen in the next. Only their own
 * hand on the control for a thing changes what is said about it.
 *
 * They are preferences and nothing more. A link that says them falsely has
 * turned a volume down or made some text larger, and the visitor changes it
 * back. So nothing here is anything that needs asking about: a microphone,
 * who is blocked and hearing other people's music are not settings, and
 * travel under rules of their own or not at all.
 */
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
    /** They prefer the world filling their screen: it is filled at their first press in each world. */
    full?: boolean;
    /** They prefer the intense way of moving at a desk: the mouse looks round and keys walk. */
    intense?: boolean;
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
     * Whether they see what other people write in a room, and may write there themselves. Left out, they do.
     * Turned off, nothing anyone writes is shown to them, and nobody is told.
     */
    chat?: boolean;
    /**
     * Which tabs of the menu they keep on their bar, by name, in the order they pinned them: `PINS_MOST` at most.
     * An empty list is a choice too: they took them all off. A name a world has no tab for is simply not shown
     * there. Only they pin: a world never does it for them.
     */
    pins?: string[];
}
/** The most tabs of the menu a visitor may keep on their bar. */
export declare const PINS_MOST = 4;
/** The slowest and fastest the view may be set to turn, and the narrowest and widest it may be set to see. */
export declare const LOOK_RANGE: readonly [0.25, 3];
export declare const FOV_RANGE: readonly [50, 110];
/** The longest a set of settings may be on a link, in characters. */
export declare const SETTINGS_LINK_LIMIT = 400;
/** Settings as they were said, with everything unknown or out of range left out. Never throws. */
export declare function cleanSettings(input: unknown): TravelSettings;
/** Whether there is anything in them. */
export declare const hasSettings: (s: TravelSettings | undefined) => s is TravelSettings;
/** Settings as they go on a link: "" when there are none, or they would be too long to send. */
export declare function encodeSettings(settings: TravelSettings | undefined): string;
/** Settings read off a link. Anything unreadable is no settings at all. */
export declare function decodeSettings(text: unknown): TravelSettings;
