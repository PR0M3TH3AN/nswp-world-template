import { type Pose } from "@nswp/core";
export interface Member {
    /** Session public key. In the spike everyone is a guest. */
    pubkey: string;
    guest: true;
    name: string;
    color: number;
}
export interface JoinOptions {
    /** Room name. People who share a world URL and a name share a room. Default "lobby". */
    name?: string;
    /** The world this room is in. Default: this page, without query or fragment. */
    world?: string;
    relays?: string[];
    maxMembers?: number;
    iceServers?: RTCIceServer[];
}
export type RoomStatus = "connecting" | "open" | "no-relays" | "closed";
interface Events {
    member: (member: Member) => void;
    leave: (member: Member) => void;
    pose: (member: Member, pose: Pose) => void;
    audio: (member: Member, stream: MediaStream) => void;
    status: (status: RoomStatus) => void;
}
export declare class RoomSession {
    readonly self: Member;
    readonly name: string;
    readonly topic: string;
    status: RoomStatus;
    private readonly key;
    private readonly relays;
    private readonly maxMembers;
    private readonly iceServers;
    private readonly sockets;
    private readonly peers;
    private readonly seen;
    private readonly listeners;
    private mic;
    private timers;
    private closed;
    constructor(opts?: JoinOptions);
    on<K extends keyof Events>(event: K, fn: Events[K]): () => void;
    private emit;
    get members(): Member[];
    /** How many relays are currently connected. */
    get relayCount(): number;
    start(): void;
    private onPageHide;
    private setStatus;
    private connectRelay;
    private publish;
    private announce;
    private onEvent;
    private createPeer;
    private wirePoseChannel;
    private gathered;
    private audioTransceiver;
    private offerTo;
    private answerTo;
    private drop;
    private sweep;
    /** Send your pose to everyone. Call 10–20 times a second, from a timer rather than the render loop. */
    sendPose(pose: Pose): void;
    /** Start or stop sending a microphone track to everyone. */
    setMicrophone(track: MediaStreamTrack | null): Promise<void>;
    leave(): void;
}
export declare const room: {
    /**
     * Join a peer-to-peer room. Other members will see your IP address, so
     * call this only after the user has agreed.
     */
    join(opts?: JoinOptions): Promise<RoomSession>;
};
export {};
