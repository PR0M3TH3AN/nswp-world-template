// packages/sdk/src/ui/icons.ts
var ICONS = {
  home: "M4 11.5 12 4l8 7.5M6 10v10h12V10M10 20v-5h4v5",
  turn: "M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5",
  room: "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20a6 6 0 0 1 12 0M16.5 11.5a2.5 2.5 0 1 0 0-5M17.5 14.6A5 5 0 0 1 21.5 20",
  leave: "M10 4H5v16h5M14 8l4 4-4 4M18 12H9",
  mic: "M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6",
  micOff: "M9 9v2a3 3 0 0 0 4.6 2.5M15 10.5V6a3 3 0 0 0-5.7-1.3M6 11a6 6 0 0 0 9.6 4.8M18 11a6 6 0 0 1-.4 2.2M12 17v4M9 21h6M4 4l16 16",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  vr: "M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3.5l-2-2.5h-3L8.5 17H5a2 2 0 0 1-2-2V9ZM8 12h.01M16 12h.01",
  exit: "M18 6 6 18M6 6l12 12",
  look: "M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11ZM9 14a3 3 0 0 0 3 3",
  help: "M9.2 9a3 3 0 1 1 4.6 2.5c-1 .7-1.8 1.4-1.8 2.7M12 18h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
  menu: "M4 7h16M4 12h16M4 17h10",
  /** An arched doorway: this project's mark for a way through. */
  door: "M7 21V10a5 5 0 0 1 10 0v11M5 21h14M14.5 14h.01",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.700l1-1",
  save: "M7 4h10v17l-5-3.5L7 21V4Z",
  step: "M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.800-6 10-6 10ZM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  size: "M4 18 9 6l5 12M5.700 14h6.600M15 18l3.500-8 3.500 8M16 15.700h5",
  motion: "M3 12h4l3-7 4 14 3-7h4",
  check: "M5 12.500 10 17.500 19 7",
  camera: "M4 8h3l1.5-2h7L17 8h3v11H4ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  selfie: "M4 5h16v14H4ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7.5 19a4.5 4.5 0 0 1 9 0",
  record: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  /** A panel: a frame with a bar along its top. */
  panel: "M4 5h16v14H4ZM4 9h16M15 7h.01M17.5 7h.01",
  note: "M6 3h9l4 4v14H6ZM14 3v5h5M9 13h7M9 17h5",
  people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M16 11a2.5 2.5 0 1 0 0-5M21 20a5 5 0 0 0-4-4.9"
};

// packages/sdk/src/ui/theme.ts
var DEFAULT_THEME = { accent: "#ffb65c", ink: "#eef5fb", glass: "#0a1018", warn: "#ff7566", motion: true, scale: 1, wrist: "left" };
var UI_PRESETS = [
  { id: "lantern", label: "Lantern", accent: "#ffb65c" },
  { id: "ion", label: "Ion", accent: "#62d9ff" },
  { id: "verdant", label: "Verdant", accent: "#4fd08b" },
  { id: "rose", label: "Rose", accent: "#ff8fb1" },
  { id: "paper", label: "Paper", accent: "#f2f3f6" }
];
var KEY = "nswp:ui";
var HEX = /^#[0-9a-f]{6}$/i;
function cleanTheme(input) {
  const out = {};
  if (!input || typeof input !== "object") return out;
  const t = input;
  for (const k of ["accent", "ink", "glass", "warn"]) if (typeof t[k] === "string" && HEX.test(t[k])) out[k] = t[k].toLowerCase();
  if (typeof t.motion === "boolean") out.motion = t.motion;
  if (typeof t.scale === "number" && Number.isFinite(t.scale)) out.scale = Math.min(1.5, Math.max(0.85, t.scale));
  if (t.wrist === "left" || t.wrist === "right" || t.wrist === "off") out.wrist = t.wrist;
  return out;
}
function loadVisitorTheme() {
  try {
    return cleanTheme(JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "{}"));
  } catch {
    return {};
  }
}
function saveVisitorTheme(theme) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(cleanTheme(theme)));
  } catch {
  }
}
function prefersStill() {
  try {
    return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  } catch {
    return false;
  }
}
function resolveTheme(world = {}, visitor = loadVisitorTheme()) {
  return { ...DEFAULT_THEME, ...prefersStill() ? { motion: false } : {}, ...cleanTheme(world), ...cleanTheme(visitor) };
}
function rgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return `${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}`;
}

export {
  ICONS,
  DEFAULT_THEME,
  UI_PRESETS,
  cleanTheme,
  loadVisitorTheme,
  saveVisitorTheme,
  resolveTheme,
  rgb
};
