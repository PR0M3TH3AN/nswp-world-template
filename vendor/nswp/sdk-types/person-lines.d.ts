/**
 * What someone has done in this world, as a few lines for their card: where they stand on its boards, and which
 * of its achievements they show (protocol/15-scores.md, protocol/16-achievements.md).
 *
 *   const about = worldPersonLines({ scores, achievements });
 *   about.lines(theirKey);   // ["Lantern Run: 41.2 s, 2nd of 14 here", "Shows 2 of 4 achievements here: First light, All twelve"]
 *
 * It says only what this world's own boards and achievements hold, which were asked of relays by world and never
 * by person. So a card is filled in without a relay ever being asked about the person on it.
 *
 * Everything it says is a claim, and the card it goes on says whose.
 */
import type { Achievements } from "./achievements.js";
import type { Scores } from "./scores.js";
/** A few lines about a person, for their card, and word of when they may have changed. */
export interface PersonLines {
    lines(pubkey: string): string[];
    onChange(fn: () => void): () => void;
}
/** "1st", "2nd", "3rd", "4th", "11th", "22nd". */
export declare function ordinal(n: number): string;
/** A few names in a row, and how many more there are: "First light, All twelve and 2 more". */
export declare function someOf(names: readonly string[], most?: number): string;
export declare function worldPersonLines(o: {
    scores?: Scores | null;
    achievements?: Achievements | null;
}): PersonLines;
