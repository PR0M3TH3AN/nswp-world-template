/**
 * The standard doorway's opening, in metres. In a file of its own so that
 * anything can read it without bringing a renderer along: the Three.js kit
 * models the doorway from these, and so does every other engine's.
 */
export declare const PORTAL_WIDTH = 1.5;
export declare const PORTAL_HEIGHT = 2.1;
/** Where the doorway's straight sides end and its round top begins. */
export declare const PORTAL_SPRING: number;
/** How far above the floor the middle of a doorway's sign hangs. */
export declare const PORTAL_SIGN_HEIGHT: number;
/**
 * How near a visitor must be to choose a door from where they stand, in metres: ten feet. Further off, a door is
 * not lit when pointed at and a press on it does not go through, so nobody crosses a world by a stray click on a
 * door at the far end of it. Walking into a doorway always goes through.
 */
export declare const DOOR_REACH = 3.05;
