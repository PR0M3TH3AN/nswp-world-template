import type { Messages } from "./messages.js";
import type { Panels } from "./panels.js";
import type { Profiles } from "./profiles.js";
import type { Controls } from "./ui/model.js";
/** What sends and reads private messages for the visitor (three.ts gives a world's; a visitor's own client gives its own). */
export interface MessagingHand {
    messages: Messages;
    /** The visitor's key here, or null: a guest has no messages. */
    pubkey(): string | null;
    /** Whether the visitor has let this place send and read their private messages. */
    allowed(): boolean;
    /** From a press: have the visitor asked. Returns what to say meanwhile; `then` is run once they have allowed it. */
    ask(then: () => void): string;
}
export interface MessagingOptions {
    hand: MessagingHand;
    profiles: Profiles;
    panels?: Panels | null;
    presenting?: () => boolean;
    /** How often new messages are looked for while this place has been let, in milliseconds. 0 for never. */
    everyMs?: number;
}
export interface Messaging {
    refresh(): void;
    /** Put the conversation with someone up, asking the visitor first where this place hasn't been let. */
    write(pubkey: string): void;
}
export declare function addMessagingControls(controls: Controls, opts: MessagingOptions): Messaging;
