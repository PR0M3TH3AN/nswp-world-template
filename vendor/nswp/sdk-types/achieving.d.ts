import type { Achievements } from "./achievements.js";
import type { Controls } from "./ui/model.js";
export interface AchievingOptions {
    achievements: Achievements;
    /** Whether the visitor is signed in here. */
    signedIn(): boolean;
}
export interface Achieving {
    refresh(): void;
}
export declare function addAchievementControls(controls: Controls, opts: AchievingOptions): Achieving;
