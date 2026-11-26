/** Run this when the browser says a session may start with no press at all: now, if it already has. */
export declare function whenSessionGranted(fn: () => void): void;
export interface HeadsetOffer {
    remove(): void;
    /** The press that was taken didn't start a session. The next one is tried. */
    failed(): void;
}
/**
 * Put the offer up. `enter` is called on a press anywhere but on the way to stay, and must start the session in
 * that same turn (a browser allows it only then). `stay` is called when they would rather look round on the
 * screen: with the link, or Escape. Whoever put it up takes it down (`remove`), once a session has started or
 * they have chosen to stay.
 */
export declare function offerHeadset(title: string, enter: () => void, stay: () => void, opts?: {
    asked?: boolean;
    back?: boolean;
    open?: boolean;
    waiting?: Promise<void>;
}): HeadsetOffer;
