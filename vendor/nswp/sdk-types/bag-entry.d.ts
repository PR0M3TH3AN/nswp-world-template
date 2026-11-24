/**
 * `nswp-sdk/bag`: the visitor's Bag for a page with no renderer, such as a client's page that draws the visitor's
 * menu above a world (protocol/02-doors.md, "The client has the menu").
 *
 *   import { addBagControls, createBag, createItemStore, mayHold, scriptAllowed } from "nswp-sdk/bag";
 *   const bag = createBag({ ... });
 *   const items = createItemStore();
 *   addBagControls(controls, { bag, items, me, rule, holding, hold, ... });
 *
 * `createItemStore` is what looks a thing up: its description from relays, really signed by its maker, and its
 * files checked against their hashes. It draws nothing, so it is enough for the Bag here by itself.
 *
 * Nothing here loads Three.js (a test checks that nothing this entry reaches names it). So the Bag's things are
 * shown by their first letters unless the page passes `previews` of its own making. A world, which has the
 * renderer, takes `addBagControls` from `nswp-sdk/three` and gets each thing drawn as itself.
 */
export { createBag, type Bag, type BagHand, type BagOptions, type BagResult } from "./bag.js";
export { addBagControls, itemIn, type Bagging, type BaggingOptions } from "./bagging.js";
export { allowScript, mayHold, scriptAllowed } from "./hold.js";
export { createItemStore, type ItemStore, type ItemStoreOptions } from "./item-store.js";
export type { ItemPreviews } from "./item-preview.js";
