/**
 * nswp-sdk/ui — the controls kit: one list of what a visitor can do, drawn as
 * a HUD on a flat screen. The headset console that draws the same list is
 * `createConsole` in `nswp-sdk/three`.
 */
export { createControls, type Controls, type ControlsOptions, type UiAction, type UiSection, type UiView, type UiItemView, type UiSectionView, type Presence, type Corner, type UiKeys } from "./ui/model.js";
export { mountHud, type Hud } from "./ui/hud.js";
export { DEFAULT_THEME, UI_PRESETS, cleanTheme, resolveTheme, type UiTheme } from "./ui/theme.js";
export { ICONS, type IconName } from "./ui/icons.js";
