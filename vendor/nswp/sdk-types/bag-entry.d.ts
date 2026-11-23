/**
 * `nswp-sdk/bag`: the visitor's Bag for a page with no renderer, such as a client's page that draws the visitor's
 * menu above a world (protocol/02-doors.md, "The client has the menu").
 *
 *   import { addBagControls, createBag, mayHold, scriptAllowed } from "nswp-sdk/bag";
 *   const bag = createBag({ ... });
 *   addBagControls(controls, { bag, items, me, rule, holding, hold, ... });
 *
 * Nothing here loads Three.js (a test checks that nothing this entry reaches names it). So the Bag's things are
 * shown by their first letters unless the page passes `previews` of its own making. A world, which has the
 * renderer, takes `addBagControls` from `nswp-sdk/three` and gets each thing drawn as itself.
 */
export { createBag, type Bag, type BagHand, type BagOptions, type BagResult } from "./bag.js";
export { addBagControls, itemIn, type Bagging, type BaggingOptions } from "./bagging.js";
export { allowScript, mayHold, scriptAllowed } from "./hold.js";
export type { ItemPreviews } from "./item-preview.js";
