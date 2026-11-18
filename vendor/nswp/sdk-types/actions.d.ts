/**
 * What a visitor means by what their hands are doing.
 *
 * A world shouldn't know whether someone holds Quest, Pico, Index or Vive
 * controllers. WebXR already gives every tracked controller the same layout
 * (the "xr-standard" gamepad mapping), so this file reads that layout into a
 * few plain facts, and turns those facts into intent: turn, walk, step, open
 * the menu. Nothing here touches a headset or draws anything, so it is tested
 * like arithmetic.
 *
 * None of it is required to get around. Everything a visitor must be able to
 * do is done by pointing and selecting (protocol/09-what-a-world-owes.md).
 * Sticks, grips and buttons are a faster way for people who have them.
 */
export interface PadButton {
    pressed: boolean;
    touched?: boolean;
    value: number;
}
/** The part of a Gamepad this reads. */
export interface PadLike {
    mapping?: string;
    axes: readonly number[];
    buttons: readonly (PadButton | undefined)[];
}
export interface PadState {
    /** Where the thumb is: x to the right, y forward, each -1 to 1, with a dead middle. */
    stick: [number, number];
    /** What the thumb is on. A touchpad counts only while it is pressed, so a resting thumb does nothing. */
    from: "thumbstick" | "touchpad" | "none";
    /** The trigger under the first finger, 0 to 1. */
    trigger: number;
    /** The grip under the other fingers, 0 to 1. */
    squeeze: number;
    /** The lower button under the thumb: A or X. */
    primary: boolean;
    /** The upper one: B or Y. */
    secondary: boolean;
}
export declare const NO_PAD: PadState;
/** A stick near its middle reads as still, and the rest of its travel is stretched to fill the range. */
export declare function deadzone(x: number, y: number, inner?: number): [number, number];
/**
 * Read a controller. The "xr-standard" layout puts the trigger at button 0,
 * the grip at 1, a touchpad's click at 2, a thumbstick's click at 3, then the
 * thumb's two buttons; and a touchpad's position in axes 0 and 1, a
 * thumbstick's in 2 and 3. A controller that lacks a part reports nothing
 * there, so reading by position works on all of them.
 */
export declare function readPad(pad: PadLike | null | undefined): PadState;
/** How a visitor likes to move. Theirs to choose, kept in this browser for this site. */
export interface Comfort {
    /** Pushing a stick forward: step to where you point when you let go, or walk smoothly. */
    move: "steps" | "smooth";
    /** Pushing a stick sideways: turn by a fixed amount at once, or turn smoothly. */
    turn: "steps" | "smooth";
    /** How far one turn goes, in degrees. */
    turnStep: 30 | 45 | 90;
    /** Darken the edge of the view while moving smoothly. It is what stops most people feeling ill. */
    narrow: boolean;
    /** Which hand's stick moves you. The other turns you. */
    moveHand: "left" | "right";
}
/**
 * The defaults are the comfortable ones: nothing slides. Smooth movement is
 * there for people who know they want it.
 */
export declare const DEFAULT_COMFORT: Comfort;
/** Keep only values that are what they claim to be: this is read back from storage. */
export declare function cleanComfort(input: unknown): Partial<Comfort>;
export declare function loadComfort(): Comfort;
export declare function saveComfort(comfort: Comfort): void;
export type Handedness = "left" | "right" | "none";
export interface HeldPad {
    /** Which of the two input slots it is in. */
    index: number;
    hand: Handedness;
    pad: PadState;
}
export interface Intent {
    /** Turn by this many degrees now. Positive is to the left, as angles go. */
    turn: number;
    /** Walk this far now, in metres: x to the visitor's right, z ahead of them. */
    walk: [number, number];
    /** Slots whose stick was pushed forward and has been let go: step to where each points. */
    stepFrom: number[];
    /** Slots whose stick is held forward now: they are choosing where to step. */
    aiming: number[];
    /** The menu button went down. */
    menu: boolean;
    /** 0 to 1: how much of the view's edge to darken. */
    narrow: number;
}
/** Metres a second, walking smoothly. A brisk walk: faster reads as sliding. */
export declare const WALK_SPEED = 1.8;
/** Degrees a second, turning smoothly. */
export declare const TURN_SPEED = 110;
/** One stick pulled back, in step mode: a step backwards of this many metres. */
export declare const BACK_STEP = 1;
/** What each stick is for. With two, one moves and one turns; one alone does both. */
export declare function stickRoles(pads: HeldPad[], moveHand: Comfort["moveHand"]): Map<number, "move" | "turn" | "both">;
/**
 * Turns what the hands are doing into what the visitor means, a frame at a
 * time. It remembers only what it must: which sticks are pushed, so a held
 * stick turns once and a pushed-forward stick steps once.
 */
export declare class Locomotion {
    private readonly turned;
    private readonly forward;
    private readonly backward;
    private menuDown;
    frame(dt: number, pads: HeldPad[], comfort: Comfort): Intent;
}
