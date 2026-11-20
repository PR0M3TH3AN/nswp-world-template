export type CrossingState = "none" | "arriving" | "opening" | "leaving" | "shut" | "failed";
export interface EngineCrossing {
    readonly state: CrossingState;
    /** How much of the world has arrived, 0 to 1. Less than 0, or not a number, for "some, nobody knows how much". */
    loading(fraction: number): void;
    /** The world is ready: the doors open, and the room goes. */
    ready(): void;
    /** The world couldn't start. The doors stay shut and the sign says why, in the page's own words. */
    failed(words: string): void;
    /** Bring the room up round the visitor and shut the doors, naming where the door says it leads. Resolves when it is shut. */
    leave(to: {
        title: string;
        address: string;
    }): Promise<void>;
    /** The world's own name and colour, once it says them: the sign and the light are redrawn with them. */
    dress(look: {
        title?: string;
        accent?: string;
    }): void;
    /** Be told when its state changes. */
    onChange(fn: (state: CrossingState) => void): void;
}
/**
 * The room, standing from this moment with its doors shut: call it as the page comes up. `title` is what the sign
 * says until the world names itself; `still` leaves out everything that slides.
 */
export declare function createEngineCrossing(o: {
    title: string;
    address: string;
    accent?: string;
    still?: boolean;
    arriving?: boolean;
}): EngineCrossing;
