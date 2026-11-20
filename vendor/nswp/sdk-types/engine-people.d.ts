import { type Travelling } from "./room-controls.js";
/**
 * Begin. Call once, after `menu`. `options` is JSON: `sharedMusic` false for a place that wants none of its
 * visitors' music shared. The room's part of the menu is added: Join, the
 * microphone, chat, who is here. Nobody is joined to anything until they ask, having been told what it shows
 * of them, as in every world. Returns `{ ok }`.
 */
export declare function people(options?: string): string;
/** How the visitor is leaving, for the link that takes them on: joined, their microphone, whom they blocked here. */
export declare function travellingNow(): Partial<Travelling>;
/**
 * What to draw a figure with, as JSON, by the name a person in a frame gave (`figure`): `head`, `body` and `hand`
 * (the one shape for both), each a list of triangles' corners, and what the kit's metal needs to draw them:
 * `accent`, the colour of its lights, `gloss` and `sheen`. "" for a name no longer in use.
 *
 * A head faces -Z with its origin between the eyes. Each frame says where the head, the body and each hand are.
 */
export declare function figure(name: unknown): string;
/** A board's picture, as a PNG in base64, by the key a frame gave. "" for a key no longer in use. */
export declare function board(key: unknown): string;
/** What this visitor sees of each person, as JSON: for tests. */
export declare function peopleInfo(): string;
