/**
 * The home's end of the Bridge (browser/bridge.md): ask one computer for a
 * terminal, on its owner's say-so.
 *
 * A throwaway session key is made for the one connection. The owner's signer
 * signs a grant for it. The request goes to the Bridge as an encrypted note
 * through relays, and the terminal itself runs over a direct connection.
 * Nothing here holds the owner's key, and nothing a relay carries can be read.
 */
import { type EventTemplate, type NostrEvent } from "@nswp/core";
export type BridgeStatus = 
/** The owner's signer is being asked for a grant. */
{
    at: "signing";
}
/** The request is out. `code` is what the computer will show if it asks. */
 | {
    at: "finding";
    code: string;
}
/** Someone at the computer is being asked. */
 | {
    at: "asking";
    code: string;
} | {
    at: "connecting";
}
/** `speech` says whether that computer will turn what is said into text. */
 | {
    at: "open";
    name: string;
    speech: boolean;
}
/** The program ended. */
 | {
    at: "ended";
    code: number;
}
/** It never opened, or stopped. `why` can be shown as it is. */
 | {
    at: "closed";
    why: string;
};
export interface BridgeLinkOptions {
    /** The Bridge's public key, as 64 hex characters. */
    bridge: string;
    relays: string[];
    /** The owner's signer, in their home. It is asked for one thing: the grant. */
    sign?(template: EventTemplate): Promise<NostrEvent>;
    /** The owner's public key, so a grant signed by anyone else is never sent. */
    owner?: string;
    /**
     * Or, in a world the owner is building: the world grant their home signed
     * for this world, and the throwaway key it names. There is no signer in a
     * world, and this is used as it is for every connection until it expires.
     */
    held?: {
        grant: NostrEvent;
        sessionKey: Uint8Array;
    };
    cols: number;
    rows: number;
    onStatus(status: BridgeStatus): void;
    /** What the terminal wrote. */
    onData(bytes: Uint8Array): void;
    iceServers?: RTCIceServer[];
    /** How long to wait for the computer to answer at all. */
    answerMs?: number;
}
export interface BridgeLink {
    readonly status: BridgeStatus;
    /** Keys typed. Nothing is sent until the terminal is open. */
    send(bytes: string | Uint8Array): void;
    resize(cols: number, rows: number): void;
    /**
     * Send what a microphone heard (16-bit samples, 16,000 a second, one
     * channel) to the computer, and get the words back. It goes over this
     * connection and nowhere else. Rejects, with words for the visitor, where
     * the computer doesn't listen or couldn't make it out.
     */
    transcribe(pcm: Int16Array, lang: string): Promise<string>;
    close(): void;
}
export declare function openBridgeLink(o: BridgeLinkOptions): BridgeLink;
