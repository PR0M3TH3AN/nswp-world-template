/**
 * People's own models, fetched and checked before anything draws one (protocol/05-looks.md, "A model of your own").
 *
 * A model is a stranger's file. So it is fetched by its hash only from the file hosts on the viewer's own list
 * (`fetchByHash`, file-hosts.ts), taken only if its bytes have that hash, read and counted by `readGlb` against
 * `LOOK_BUDGET` (or a world's lower one), and only then handed to Three.js: with VRM's required extensions taken
 * off its list, since the kit has already read what it uses of them. Nothing in it runs. One copy per hash, for
 * everyone wearing the same file.
 *
 * What is drawn is fitted: its top at the height its wearer chose, its feet on the floor, its middle under its
 * wearer, facing -z like every figure the kit draws.
 */
import { queryRelays, type NostrEvent, type GlbCount, type LookModel, type ModelBudget } from "@nswp/core";
import * as THREE from "three";
import { type FileHostsOptions } from "./file-hosts.js";
/** What a world lets a look's model be, from its manifest's `avatar`: never more than `LOOK_BUDGET`. */
export declare function lookBudget(world?: {
    maxFileSizeMb?: number;
    maxTriangles?: number;
} | null): ModelBudget;
export interface LookModelsOptions extends FileHostsOptions {
    /** Fetch an address's bytes. For tests; left out, the browser's own. */
    fetchBytes?: (url: string) => Promise<Uint8Array | null>;
    /** Whose own file hosts are used: the signed-in viewer's key, or null for a guest. Left out, whoever arrived. */
    viewer?: () => string | null;
}
/** Why a model isn't drawn, for tests and for a person's card. */
export type LookRefusal = "elsewhere" | "missing" | "refused" | "unreadable";
export interface LookModels {
    /** A model's bytes, checked, read and counted against `budget`. Null where any of that fails. */
    bytes(model: LookModel, budget?: ModelBudget): Promise<{
        bytes: Uint8Array;
        count: GlbCount;
    } | null>;
    /** The model as Three.js draws it: fitted to its height, feet at 0, facing -z. A new copy each time. Null where it fails. */
    object(model: LookModel, budget?: ModelBudget): Promise<THREE.Object3D | null>;
    /** Why the last try at this model came to nothing, or null if it came, or hasn't been tried. */
    why(model: Pick<LookModel, "sha256">): LookRefusal | null;
}
export declare function createLookModels(opts?: LookModelsOptions): LookModels;
/**
 * This visitor's own look note, to hand to the room (`JoinOptions.avatar`): the one their arrival named, read from
 * relays, really signed by the key their pass names, and small enough to hand on. Null for a guest, for someone who
 * came plain, and where none is found.
 */
export declare function ownLookNote(opts?: {
    relays?: string[];
    query?: typeof queryRelays;
    now?: () => number;
    naddr?: string | null;
    author?: string | null;
}): Promise<NostrEvent | null>;
export { forgetModelsSwitch, onModelsChange, setShowsModels, showsModels } from "./models-switch.js";
/** What a world says of people's own models: its manifest's `avatar`, as far as choosing who is drawn needs it. */
export interface WorldLooks {
    formats: readonly string[];
    dress?: "own";
}
/** Whether a world draws people's own models at all: it names a format, and doesn't dress everyone itself. */
export declare function worldDrawsModels(world: WorldLooks | null | undefined): boolean;
/**
 * Who is drawn as their own model, and why each of the others isn't (protocol/05-looks.md, "A model of your own").
 * In this order: someone who wears none (`none`); a world that draws none, dresses everyone itself, or doesn't draw
 * that format (`world`); a viewer who turned models off (`off`); a viewer who chose that person's simple look
 * (`person`); and beyond the nearest `most`, everyone else (`crowd`). Whoever is left is drawn (`draw`), if their
 * file then passes. The nearest come first; two as near as each other keep the order they were given in.
 */
export declare function chooseLooks<K>(people: readonly {
    key: K;
    format?: string | null;
    metres: number;
    simple?: boolean;
}[], world: WorldLooks | null | undefined, shows: boolean, most?: number): Map<K, "draw" | "none" | "world" | "off" | "person" | "crowd">;
