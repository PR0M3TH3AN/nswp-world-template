/**
 * Which of the kit's line drawings stands for each thing a door shows
 * (door-offers.ts). In a file with no renderer, so the script other engines
 * take from the kit hands out the same drawings.
 */
import type { DOOR_OFFERS, OfferId } from "@nswp/core";
import type { IconName } from "./ui/icons.js";
export declare const OFFER_ICONS: Record<(typeof DOOR_OFFERS)[number], IconName>;
/** The same, for every line a world may say it offers: a door's details list them all (door-controls.ts). */
export declare const OFFER_LINE_ICONS: Record<OfferId, IconName>;
