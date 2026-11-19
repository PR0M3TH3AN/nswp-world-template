/**
 * Local copies: for someone trying their sites on their own machine before
 * they are deployed.
 *
 * A world is built for its real address, and every door, announcement and
 * pass names that address. On a developer's machine the same build is served
 * from somewhere else (`http://localhost:4301/`), and a door followed there
 * would otherwise lead out to the deployed site. So a development server may
 * publish a map, real address to local copy, and a page reads it and follows
 * it at the last moment: when it sends the visitor's browser somewhere.
 *
 * Nothing else changes. What a door says, what an Airlock checks and shows,
 * and what an announcement is signed over are all still the real address.
 * And a deployed site never asks for a map at all: only a page that is itself
 * on a local address does. So the same build that was tried locally goes live
 * with every link leading to the real place.
 *
 * "Local" is about the host, not about http or https. A development server
 * may serve its copies over https with a certificate made on that machine, so
 * that a phone or a headset on the same network is given what a browser
 * gives only to a secure page: its cryptography, a microphone, a headset
 * session. What makes a page local is that its host is `localhost` or an
 * address only this machine or this network can reach. No real site is ever
 * at one.
 */
/** Where a development server publishes its map. */
export declare const LOCAL_MAP_PATH = "/.well-known/nswp-local.json";
/** How long a door waits for a map that hasn't come, in milliseconds. */
export declare const LOCAL_MAP_WAIT = 2000;
/** The most entries a map may have. */
export declare const LOCAL_MAP_LIMIT = 64;
export type LocalMap = ReadonlyMap<string, string>;
/**
 * Whether a host is one only this machine or this network can reach:
 * localhost, a loopback address, or a private or link-local IPv4 address.
 */
export declare function isLocalHost(hostname: string): boolean;
/**
 * A map as a server gave it, with everything doubtful left out: each real
 * address must be an https origin, and each local copy an http or https
 * origin on a host that is local. So a map can only ever lead to this machine
 * or this network, never out to some third place.
 */
export declare function cleanLocalMap(input: unknown): LocalMap;
/** The same address at its local copy, if the map has one for its origin. Anything else comes back as it was. */
export declare function mapToLocal(url: string, map: LocalMap): string;
/** The other way: a local copy's address as the real one. */
export declare function mapFromLocal(url: string, map: LocalMap): string;
/** Whether this page is one that may follow a map: on a local host, over http or https. */
export declare function onLocalHost(): boolean;
/**
 * This page's map: empty anywhere but on a local host, and empty there too
 * unless its server publishes one. Asked for once, as early as anything calls
 * this, so that it is there by the time a door is taken.
 */
export declare function localMap(): Promise<LocalMap>;
/** Where to really send the browser for `url`: its local copy on a development server, itself everywhere else. */
export declare function toLocal(url: string): Promise<string>;
/** What a local copy's address stands for: the real one. Everywhere else, the address itself. */
export declare function fromLocal(url: string): Promise<string>;
/** For tests: forget what was loaded, or say what the map is. */
export declare function setLocalMap(map: LocalMap | undefined): void;
