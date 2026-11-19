import { type GoOptions } from "../index.js";
import type { Controls, UiAction, UiSection } from "./model.js";
/** The words for who a visitor is here, for a world that draws this itself. */
export declare function identityWords(): {
    signedIn: boolean;
    name: string;
    label: string;
    short: string;
};
/** Where signing in happens: the host of the visitor's own client. Null when they came through none. */
export declare function identityHost(): string | null;
/** What the section says: where they will be taken, and that the world never sees it. */
export declare const identitySection: () => UiSection;
/**
 * The control. `leaving` is the visitor's state as they go (in a room, with a
 * microphone on, moving the intense way, in a headset session), so they come
 * back as they left.
 */
export declare function identityAction(controls: Controls, leaving?: () => GoOptions): UiAction;
