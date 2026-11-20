import type { Profiles } from "./profiles.js";
import type { Scores } from "./scores.js";
import type { Controls } from "./ui/model.js";
export interface ScoringOptions {
    scores: Scores;
    /** Names for the people on a board. Without it they are shown by the short form of their key. */
    profiles?: Profiles | null;
    /** Someone on the board was chosen: show who they are (in Following, say). */
    choose?: (pubkey: string) => void;
    /** Whether the visitor is signed in here. */
    signedIn(): boolean;
}
export interface Scoring {
    refresh(): void;
}
export declare function addScoreControls(controls: Controls, opts: ScoringOptions): Scoring;
