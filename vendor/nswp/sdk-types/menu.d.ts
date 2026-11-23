/**
 * The visitor's menu, as a part of the kit a client can carry by itself (docs/plans/the-clients-menu.md, "The kit
 * in two parts"). `nswp-sdk/menu`.
 *
 *   import { mountMenu, portHere } from "nswp-sdk/menu";
 *   const menu = mountMenu(portHere(controls));   // a world with no client above it: its own controls, direct
 *
 * The menu is given a world's port and nothing else of the world. A world's own build loads this as a file of its
 * own, so that a world whose client draws the menu need never fetch it.
 *
 *   import { mountMenu, portBelow } from "nswp-sdk/menu";
 *   const below = portBelow(frame, { controls });  // a client above a framed world: its own controls, and the
 *   below.attach(mountMenu(below.port));           // world's tabs laid in among them, by words between the pages
 *
 * The world's end of that is not here: `nswp-sdk/menu-above` is small, and is what a world loads in the menu's place.
 */
export { mountMenu, type Hud as Menu } from "./ui/hud.js";
export { portHere, type WorldPort } from "./ui/port.js";
export { mergeView, portBelow, signInRows, type MenuBelow, type MenuBelowOptions, type SavedAbout } from "./ui/port-below.js";
export { addDeskControls } from "./desk.js";
export { addSoundControls, createSounds, type SoundControlsOptions, type Sounds } from "./sound.js";
export { helpWords } from "./ui/help.js";
export { askDeskMoving, chatSwitch, deskMovingSwitch, modelsSwitch, picturesSwitch, VISITOR_SWITCHES } from "./visitor-switches.js";
export { arriveWith, changeSettings, currentSettings, type TravelSettings } from "./settings.js";
export { fullscreenAction, watchEscape } from "./ui/fullscreen.js";
