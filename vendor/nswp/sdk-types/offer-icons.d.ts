/**
 * Which of the kit's line drawings stands for each thing a door shows
 * (door-offers.ts). In a file with no renderer, so the script other engines
 * take from the kit hands out the same drawings.
 */
import type { DOOR_OFFERS } from "@nswp/core";
import type { IconName } from "./ui/icons.js";
export declare const OFFER_ICONS: Record<(typeof DOOR_OFFERS)[number], IconName>;
