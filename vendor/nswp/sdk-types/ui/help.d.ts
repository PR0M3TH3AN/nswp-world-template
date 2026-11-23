/**
 * The Help tab's own words: how to look round, move, and bring the controls up. The same wherever the menu is drawn,
 * but for whose controls they are.
 *
 * - A world that draws its own menu puts its own sentence about itself first, and then these.
 * - A client that draws the menu above a world has these as its own help. What the world says of itself is a note
 *   after them, under the world's name (protocol/02-doors.md, "The client has the menu").
 */
export declare function helpWords(whose: "world" | "client"): string;
