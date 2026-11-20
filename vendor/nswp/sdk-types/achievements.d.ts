/**
 * A world's achievements (protocol/16-achievements.md): which ones the visitor has earned, showing them when
 * they say to, and how many other people hold each.
 *
 *   const achievements = createAchievements({ world, worldUrl, list, hand });
 *   achievements.earn("all-twelve");        // they just did it: kept on the device
 *   await achievements.show();              // from their press: each is signed by them, and sent to relays
 *
 * Optional, like everything about achievements: a world that names none has none of this.
 *
 * What a visitor earned is kept on the device, whoever they are. It becomes public only when they show it, which
 * they do by pressing: an achievement shown says that this person was in this world, and what they did there.
 */
import { publishEvent, queryRelays, type Achievement, type AchievementHolders, type NostrEvent } from "@nswp/core";
export interface AchievementHand {
    /** Who is signed in here, or null for a guest. */
    pubkey(): string | null;
    /** Have it signed that they hold one. Null if it couldn't be. */
    sign(world: string, id: string, title: string): Promise<NostrEvent | null>;
}
export interface AchievementsOptions {
    /** This world's own coordinate: `37300:<publisher>:<d>`. */
    world: string;
    /** This world's address. An achievement counts only if it was asked for here. */
    worldUrl: string;
    list: Achievement[];
    hand: AchievementHand;
    /** The people the visitor has reason to know: named among who holds each. */
    counted?: () => Iterable<string>;
    relays?: string[];
    storage?: Pick<Storage, "getItem" | "setItem"> | null;
    now?: () => number;
    query?: typeof queryRelays;
    publish?: typeof publishEvent;
}
export interface Achievements {
    readonly list: Achievement[];
    /** The ones they have earned, as kept on this device. */
    earned(): string[];
    /** The ones they have shown from this device. */
    shown(): string[];
    /** They just earned one. True if it is new to them: it is kept. Nothing is sent. */
    earn(id: string): boolean;
    /** Show everything they have earned and not yet shown: each signed by them, sent to relays. From their press. */
    show(): Promise<{
        ok: boolean;
        said: string;
    }>;
    /** Who holds each, from relays: asked again only after a minute, unless `fresh`. Null where no relay answered. */
    holders(fresh?: boolean): Promise<Map<string, AchievementHolders> | null>;
    onChange(fn: () => void): () => void;
    /** Be told when they earn one that is new to them. */
    onEarn(fn: (achievement: Achievement) => void): () => void;
}
export declare function createAchievements(opts: AchievementsOptions): Achievements;
