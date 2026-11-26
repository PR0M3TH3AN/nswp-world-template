import {
  arrivedSettings,
  reportSettings
} from "./shared-2KCGFQ3G.js";

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
  /** For the visitor's own music: play, pause, the song after and before, a little way on and back, and how it goes. */
  play: "M7 4.5v15l12-7.5Z",
  pause: "M8 5v14M16 5v14",
  next: "M6 5.5v13l10-6.5ZM19 5v14",
  previous: "M18 5.5v13L8 12ZM5 5v14",
  rewind: "M11 7v10l-7-5ZM20 7v10l-7-5Z",
  forward: "M13 7v10l7-5ZM4 7v10l7-5Z",
  shuffle: "M3 7h4l8 10h5M3 17h4l2.5-3.1M12.5 10.100 15 7h5M17 4l3 3-3 3M17 14l3 3-3 3",
  repeat: "M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4",
  music: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  pin: "M9 4h6l-1 6 3 3H7l3-3-1-6ZM12 13v7",
  step: "M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.800-6 10-6 10ZM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  size: "M4 18 9 6l5 12M5.700 14h6.600M15 18l3.500-8 3.500 8M16 15.700h5",
  /** Filling the screen: four corners drawn out. */
  full: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  motion: "M3 12h4l3-7 4 14 3-7h4",
  check: "M5 12.500 10 17.500 19 7",
  camera: "M4 8h3l1.5-2h7L17 8h3v11H4ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  selfie: "M4 5h16v14H4ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7.5 19a4.5 4.5 0 0 1 9 0",
  record: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  /** A panel: a frame with a bar along its top. */
  panel: "M4 5h16v14H4ZM4 9h16M15 7h.01M17.5 7h.01",
  note: "M6 3h9l4 4v14H6ZM14 3v5h5M9 13h7M9 17h5",
  /** A loudspeaker, sounding and crossed out. */
  sound: "M4 9.500v5h3.500L13 19V5L7.500 9.500ZM16.500 9a4.500 4.500 0 0 1 0 6M19 6.500a8 8 0 0 1 0 11",
  soundOff: "M4 9.500v5h3.500L13 19V5L7.500 9.500ZM16.500 9.500l4.500 5M21 9.500l-4.500 5",
  you: "M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM5 20.5a7 7 0 0 1 14 0",
  close: "M6 6l12 12M18 6 6 18",
  key: "M14.5 9.5a3.5 3.5 0 1 0-3.4 3.5L4 20v-3h3v-3h3l1.6-1.6M16 8h.01",
  chat: "M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 10h8M8 13h5",
  people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M16 11a2.5 2.5 0 1 0 0-5M21 20a5 5 0 0 0-4-4.9",
  // What a door says its world offers (door-offers.ts), where no drawing above already says it.
  bag: "M6 8h12l1.2 12H4.8L6 8ZM9 8V6.5a3 3 0 0 1 6 0V8",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4",
  tip: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  // An envelope: a world that is by invitation (the eighth thing a door shows).
  invite: "M4 6h16v12H4ZM4 7l8 6 8-6",
  coin: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM14.6 9.6c-.5-1-1.4-1.6-2.6-1.6-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2 2.6.8 2.6 2-1.1 2-2.6 2c-1.2 0-2.1-.6-2.6-1.6M12 6.5V8M12 16v1.5"
};

// packages/sdk/src/picture.ts
import { cleanPicture } from "@nswp/core";
var PICTURES_KEY = "nswp:pictures";
var PICTURE_LIMITS = { bytes: 3e6, size: 128, waitMs: 9e3 };
var shown = null;
var watchers = /* @__PURE__ */ new Set();
function showsPictures() {
  if (shown !== null) return shown;
  const came = arrivedSettings().pictures;
  let kept = null;
  try {
    kept = localStorage.getItem(PICTURES_KEY);
  } catch {
  }
  shown = came ?? kept !== "0";
  if (came !== void 0) keep(shown);
  reportSettings("pictures", () => ({ pictures: showsPictures() }), (now) => void (now.pictures !== void 0 && now.pictures !== shown && setShowsPictures(now.pictures)));
  return shown;
}
var keep = (on) => {
  try {
    if (on) localStorage.removeItem(PICTURES_KEY);
    else localStorage.setItem(PICTURES_KEY, "0");
  } catch {
  }
};
function setShowsPictures(on) {
  showsPictures();
  shown = on;
  keep(on);
  for (const w of watchers) w();
}
function onPicturesChange(cb) {
  watchers.add(cb);
  return () => void watchers.delete(cb);
}
function badge(image, width, height) {
  const size = PICTURE_LIMITS.size;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d");
  g.beginPath();
  g.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  g.closePath();
  g.clip();
  const side = Math.min(width, height);
  g.drawImage(image, (width - side) / 2, (height - side) / 2, side, side, 0, 0, size, size);
  return canvas;
}
async function byFetch(url) {
  const res = await fetch(url, { mode: "cors", credentials: "omit", referrerPolicy: "no-referrer", redirect: "follow", signal: AbortSignal.timeout(PICTURE_LIMITS.waitMs) });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "";
  if (!/^image\/(png|jpeg|webp|gif|avif)\b/i.test(type)) return null;
  if (Number(res.headers.get("content-length") ?? 0) > PICTURE_LIMITS.bytes) return null;
  const blob = await res.blob();
  if (blob.size > PICTURE_LIMITS.bytes) return null;
  const bitmap = await createImageBitmap(blob);
  try {
    return badge(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}
function byImage(url) {
  return new Promise((done) => {
    const img = new Image();
    const timer = setTimeout(() => done(null), PICTURE_LIMITS.waitMs);
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.onload = () => {
      clearTimeout(timer);
      try {
        done(img.naturalWidth > 0 && img.naturalWidth <= 8192 && img.naturalHeight <= 8192 ? badge(img, img.naturalWidth, img.naturalHeight) : null);
      } catch {
        done(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      done(null);
    };
    img.src = url;
  });
}
var loaded = /* @__PURE__ */ new Map();
function loadPicture(address) {
  const url = cleanPicture(address);
  if (!url || !showsPictures() || typeof document === "undefined") return Promise.resolve(null);
  let asked = loaded.get(url);
  if (!asked) {
    asked = byFetch(url).catch(() => null).then((got) => got ?? byImage(url)).catch(() => null);
    loaded.set(url, asked);
  }
  return asked;
}

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

// packages/sdk/src/ui/mark.ts
var MARK = {
  /** The tile: its size, the round of its top corners and of its bottom ones, and its edge. */
  tile: { w: 44, h: 48, top: 22, bottom: 8, edge: 1 },
  /** The arch: its size, where it stands in the tile, the round of its top (a half circle) and of its foot. */
  arch: { w: 18, h: 24, x: 13, y: 11, top: 9, bottom: 2 },
  /** The line it stands on: how far it reaches past the arch on each side, how thick, and how far below its foot. */
  sill: { over: 3, h: 2, below: 3 },
  /** How far the arch's glow reaches. */
  glow: 14,
  /** The arch's fill: the accent at the top, and at the foot. */
  fill: { top: 0.95, foot: 0.25 },
  /** The glow's strength, the tile's glass, and its edge when it isn't lit. */
  glowAlpha: 0.55,
  glass: 0.7,
  edgeAlpha: 0.34
};
var sillBox = () => {
  const { arch, sill } = MARK;
  return [arch.x - sill.over, arch.y + arch.h + sill.below - sill.h, arch.w + sill.over * 2, sill.h];
};
var roundedPath = (c, x, y, w, h, top, bottom) => {
  c.beginPath();
  c.moveTo(x + top, y);
  c.lineTo(x + w - top, y);
  c.arcTo(x + w, y, x + w, y + top, top);
  c.lineTo(x + w, y + h - bottom);
  c.arcTo(x + w, y + h, x + w - bottom, y + h, bottom);
  c.lineTo(x + bottom, y + h);
  c.arcTo(x, y + h, x, y + h - bottom, bottom);
  c.lineTo(x, y + top);
  c.arcTo(x, y, x + top, y, top);
  c.closePath();
};
function paintMark(c, o) {
  const s = o.scale;
  const { tile, arch } = MARK;
  const accent = rgb(o.accent);
  if (o.tile !== false) {
    roundedPath(c, o.x, o.y, tile.w * s, tile.h * s, tile.top * s, tile.bottom * s);
    c.fillStyle = `rgba(${rgb(o.glass)}, ${o.glassAlpha ?? MARK.glass})`;
    c.fill();
    c.lineWidth = Math.max(1, tile.edge * s);
    c.strokeStyle = o.lit ? `rgb(${accent})` : `rgba(${accent}, ${MARK.edgeAlpha})`;
    c.stroke();
  }
  const ax = o.x + arch.x * s;
  const ay = o.y + arch.y * s;
  const fill = c.createLinearGradient(0, ay, 0, ay + arch.h * s);
  fill.addColorStop(0, `rgba(${accent}, ${MARK.fill.top})`);
  fill.addColorStop(1, `rgba(${accent}, ${MARK.fill.foot})`);
  c.save();
  c.shadowColor = `rgba(${accent}, ${MARK.glowAlpha})`;
  c.shadowBlur = MARK.glow * s;
  roundedPath(c, ax, ay, arch.w * s, arch.h * s, arch.top * s, arch.bottom * s);
  c.fillStyle = fill;
  c.fill();
  c.restore();
  const [lx, ly, lw, lh] = sillBox();
  roundedPath(c, o.x + lx * s, o.y + ly * s, lw * s, lh * s, lh / 2 * s, lh / 2 * s);
  c.fillStyle = o.ink;
  c.fill();
}
var colourOr = (value, fallback) => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : fallback;
function markSvg(o = {}) {
  const accent = colourOr(o.accent, DEFAULT_THEME.accent);
  const ink = colourOr(o.ink, DEFAULT_THEME.ink);
  const glass = colourOr(o.glass, DEFAULT_THEME.glass);
  const { tile, arch, sill } = MARK;
  const tiled = o.tile !== false;
  const pad = MARK.glow;
  const box = tiled ? { x: 0, y: 0, w: tile.w, h: tile.h } : { x: arch.x - sill.over, y: arch.y, w: arch.w + sill.over * 2, h: arch.h + sill.below };
  const vx = box.x - (tiled ? 0 : pad);
  const vy = box.y - (tiled ? 0 : pad);
  const vw = box.w + (tiled ? 0 : pad * 2);
  const vh = box.h + (tiled ? 0 : pad * 2);
  const rounded = (x, y, w, h, top, bottom) => `M${x + top} ${y}H${x + w - top}A${top} ${top} 0 0 1 ${x + w} ${y + top}V${y + h - bottom}A${bottom} ${bottom} 0 0 1 ${x + w - bottom} ${y + h}H${x + bottom}A${bottom} ${bottom} 0 0 1 ${x} ${y + h - bottom}V${y + top}A${top} ${top} 0 0 1 ${x + top} ${y}Z`;
  const [lx, ly, lw, lh] = sillBox();
  const half = tile.edge / 2;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw}" height="${vh}">`,
    `<defs><linearGradient id="nswp-mark-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity="${MARK.fill.top}"/><stop offset="1" stop-color="${accent}" stop-opacity="${MARK.fill.foot}"/></linearGradient>`,
    `<filter id="nswp-mark-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${MARK.glow / 2}"/></filter></defs>`,
    tiled ? `<path d="${rounded(half, half, tile.w - tile.edge, tile.h - tile.edge, tile.top - half, tile.bottom - half)}" fill="${glass}" stroke="${accent}" stroke-opacity="${MARK.edgeAlpha}" stroke-width="${tile.edge}"/>` : "",
    `<path d="${rounded(arch.x, arch.y, arch.w, arch.h, arch.top, arch.bottom)}" fill="${accent}" opacity="${MARK.glowAlpha}" filter="url(#nswp-mark-glow)"/>`,
    `<path d="${rounded(arch.x, arch.y, arch.w, arch.h, arch.top, arch.bottom)}" fill="url(#nswp-mark-fill)"/>`,
    `<path d="${rounded(lx, ly, lw, lh, lh / 2, lh / 2)}" fill="${ink}"/>`,
    `</svg>`
  ].join("");
}

// packages/sdk/src/ui/sign-in-here.ts
var offers = /* @__PURE__ */ new WeakMap();
function offerSignIn(controls, offer) {
  offers.set(controls, offer);
}
function signInHere(controls, section) {
  const offer = () => offers.get(controls);
  return {
    id: `sign-in-${section}`,
    section,
    icon: "key",
    tone: "primary",
    label: () => offer()?.guest() ? "Secure this account" : offer()?.label() ?? "Sign in",
    short: () => offer()?.guest() ? "Secure" : "Sign in",
    hidden: () => !offer()?.wanted(),
    act: () => offer()?.guest() ? offer()?.secure() : offer()?.press()
  };
}
function signInFirst(controls, line) {
  const offer = offers.get(controls);
  if (offer?.guest()) {
    controls.say("Secure this account first.");
    offer.secure();
    return;
  }
  controls.say(line);
  if (offer?.wanted()) offer.press();
}
function guestHere(controls) {
  return !!offers.get(controls)?.guest();
}

// packages/sdk/src/ui/chat.ts
import { CHAT_LIMITS, cleanChat } from "@nswp/core";
var CHAT_KEY = "nswp:chat";
var shown2 = null;
var watchers2 = /* @__PURE__ */ new Set();
function showsChat() {
  if (shown2 !== null) return shown2;
  const came = arrivedSettings().chat;
  let kept = null;
  try {
    kept = localStorage.getItem(CHAT_KEY);
  } catch {
  }
  shown2 = came ?? kept !== "0";
  if (came !== void 0) keep2(shown2);
  reportSettings("chat", () => ({ chat: showsChat() }), (now) => void (now.chat !== void 0 && now.chat !== shown2 && setShowsChat(now.chat)));
  return shown2;
}
var keep2 = (on) => {
  try {
    if (on) localStorage.removeItem(CHAT_KEY);
    else localStorage.setItem(CHAT_KEY, "0");
  } catch {
  }
};
function setShowsChat(on) {
  showsChat();
  shown2 = on;
  keep2(on);
  for (const w of watchers2) w();
}
function onChatChange(cb) {
  watchers2.add(cb);
  return () => void watchers2.delete(cb);
}
function createUiChat(changed) {
  let send = null;
  let title = "Room chat";
  let lines = [];
  let unread = 0;
  let version = 0;
  let count = 0;
  const bump = () => {
    version++;
    changed();
  };
  onChatChange(() => {
    if (!showsChat()) {
      lines = [];
      unread = 0;
    }
    bump();
  });
  return {
    attach(fn, opts = {}) {
      send = fn;
      title = opts.title ?? "Room chat";
      lines = [];
      unread = 0;
      bump();
    },
    detach() {
      if (!send && !lines.length) return;
      send = null;
      lines = [];
      unread = 0;
      bump();
    },
    add(line) {
      if (!send || !showsChat()) return;
      const text = cleanChat(line.text);
      if (!text) return;
      lines.push({ key: `${line.id ?? "n"}-${++count}`, who: line.note ? "" : cleanChat(line.who ?? "").slice(0, 48), text, mine: !!line.mine, note: !!line.note, color: line.color ?? "", at: Date.now() });
      if (lines.length > CHAT_LIMITS.kept) lines = lines.slice(-CHAT_LIMITS.kept);
      if (!line.mine && !line.note) unread++;
      bump();
    },
    send(text) {
      if (!send || !showsChat()) return "There is nobody to write to: join the room first.";
      if (!cleanChat(text)) return null;
      return send(text) ?? null;
    },
    seen() {
      if (!unread) return;
      unread = 0;
      bump();
    },
    view() {
      return { ready: !!send && showsChat(), title, lines, unread, limit: CHAT_LIMITS.chars, version };
    }
  };
}
function wrapWords(text, measure, width, rows) {
  const out = [];
  let row = "";
  const push = (word) => {
    let rest = [...word];
    while (rest.length) {
      let n = rest.length;
      while (n > 1 && measure(rest.slice(0, n).join("")) > width) n--;
      const piece = rest.slice(0, n).join("");
      rest = rest.slice(n);
      if (rest.length) out.push(piece);
      else row = piece;
    }
  };
  for (const word of text.split(" ").filter(Boolean)) {
    const tried = row ? `${row} ${word}` : word;
    if (measure(tried) <= width) row = tried;
    else {
      if (row) out.push(row);
      row = "";
      if (measure(word) <= width) row = word;
      else push(word);
    }
  }
  if (row) out.push(row);
  if (out.length <= rows) return out;
  const kept = out.slice(0, rows);
  let last = [...kept[rows - 1]];
  while (last.length > 1 && measure(`${last.join("")}\u2026`) > width) last.pop();
  kept[rows - 1] = `${last.join("").trimEnd()}\u2026`;
  return kept;
}

// packages/sdk/src/ui/feed.ts
import { CHAT_LIMITS as CHAT_LIMITS2, cleanChat as cleanChat2, cleanLine } from "@nswp/core";
var FEED_LIMITS = { shown: 420, kept: 30 };
function createUiFeed(changed, now = () => Date.now()) {
  let opts = null;
  let posts = [];
  let loading = false;
  let said = "";
  let version = 0;
  let count = 0;
  let asked = 0;
  const bump = () => {
    version++;
    changed();
  };
  const sort = () => {
    posts.sort((a, b) => b.at - a.at);
    const kept = posts.filter((p, i) => p.state !== "out" || i < FEED_LIMITS.kept);
    posts = kept;
  };
  return {
    attach(next) {
      opts = next;
      posts = [];
      loading = false;
      said = "";
      asked = 0;
      bump();
    },
    detach() {
      if (!opts) return;
      opts = null;
      posts = [];
      loading = false;
      said = "";
      bump();
    },
    opened() {
      const mine = opts;
      if (!mine?.load || loading || asked && now() - asked < 6e4) return;
      asked = now();
      loading = true;
      bump();
      void mine.load().catch(() => null).then((got) => {
        if (opts !== mine) return;
        loading = false;
        if (!got) said = "Your earlier posts couldn't be fetched just now.";
        else {
          const seen = new Set(posts.map((p) => p.key));
          for (const p of got) {
            const text = cleanLine(p.text, FEED_LIMITS.shown);
            if (!text || seen.has(p.id) || !Number.isFinite(p.at)) continue;
            seen.add(p.id);
            posts.push({ key: p.id, text, at: p.at, state: "out", id: p.id });
          }
          sort();
        }
        bump();
      });
    },
    send(text) {
      const mine = opts;
      if (!mine) return "There is nothing to post with: sign in first.";
      const words = cleanChat2(text);
      if (!words) return null;
      const post = { key: `new-${++count}`, text: words, at: Math.floor(now() / 1e3), state: "sending" };
      posts.unshift(post);
      said = "";
      bump();
      void mine.send(words).catch(() => ({ ok: false, said: "That wasn't sent." })).then((how) => {
        if (opts !== mine) return;
        post.state = how.ok ? "out" : "failed";
        if (how.ok && how.id) post.id = how.id;
        said = how.said;
        bump();
      });
      return null;
    },
    remove(key) {
      const mine = opts;
      const post = posts.find((p) => p.key === key);
      if (!mine?.remove || !post?.id || post.state !== "out") return "That post can't be deleted from here.";
      const id = post.id;
      post.state = "removing";
      said = "";
      bump();
      void mine.remove(id).catch(() => ({ ok: false, said: "That wasn't deleted." })).then((how) => {
        if (opts !== mine) return;
        if (how.ok) posts = posts.filter((p) => p !== post);
        else post.state = "out";
        said = how.said;
        bump();
      });
      return null;
    },
    view() {
      const who = typeof opts?.who === "function" ? opts.who() : opts?.who ?? "";
      const back = opts?.remove ? "and deleting it later only asks relays to drop it: copies may remain" : "and it can't be taken back";
      const lead = `Public, like a tweet: anyone can read what you send out here, as ${who}, ${back}.${opts?.marked ? ` Each post is marked as sent from ${opts.marked}.` : ""}`;
      return { ready: !!opts, title: "My public feed", who, posts, loading, said, lead, limit: CHAT_LIMITS2.chars, removable: !!opts?.remove, version };
    }
  };
}
function ago(at, nowSec) {
  const s = Math.max(0, nowSec - at);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const days = Math.floor(s / 86400);
  if (days < 30) return days === 1 ? "1 day ago" : `${days} days ago`;
  return new Date(at * 1e3).toISOString().slice(0, 10);
}

// packages/sdk/src/offer-icons.ts
var OFFER_ICONS = {
  headset: "vr",
  people: "people",
  voice: "mic",
  items: "bag",
  saves: "save",
  records: "trophy",
  "by-invitation": "invite",
  paid: "coin"
};
var OFFER_LINE_ICONS = {
  ...OFFER_ICONS,
  tips: "tip",
  doors: "door",
  looks: "look",
  "by-name": "key",
  home: "home"
};

// packages/sdk/src/door-controls.ts
function vouchedWords(door) {
  if (door.vouched === "verified") return "Verified for this site";
  if (door.vouched === "listed") return door.listedBy ? `Listed by ${door.listedBy}, not verified` : "Listed, not verified";
  return "";
}
function addDoorControls(controls, opts) {
  const section = opts.section ?? "travel";
  let shown3 = [];
  let chosenId = null;
  const find = () => chosenId ? opts.doors().find((d) => d.id === chosenId) ?? null : null;
  const card = (door) => ({
    title: door.title,
    tag: vouchedWords(door),
    proven: door.vouched === "verified",
    sub: door.url,
    copy: "",
    text: door.offers ? "" : "Its maker hasn't said anything about it themselves, so nothing is said here about what it offers.",
    picture: "",
    // No face: a door isn't a person. A renderer draws the first letter of its name in the colour of a door.
    color: "",
    now: []
  });
  const refresh = () => {
    for (const id of shown3) controls.remove(id);
    shown3 = [];
    const door = find();
    if (chosenId && !door) chosenId = null;
    const add = (...actions) => {
      for (const a of actions) shown3.push(a.id);
      controls.add(...actions.map((a) => ({ section, ...a })));
    };
    if (!door) {
      opts.doors().forEach(
        (d, i) => add({ id: `door-detail:${i}`, icon: "door", label: d.title, short: "Door", act: () => choose(d.id) })
      );
      return;
    }
    add(
      { id: "door-travel", icon: "door", label: "Travel here", tone: "primary", act: () => opts.travel(door) },
      ...opts.also?.(door) ?? [],
      { id: "door-back", icon: "list", label: "Back to every door", act: () => choose(null) },
      ...(door.offers ?? []).map(
        (o) => ({ id: `door-offer:${o.id}`, kind: "line", icon: OFFER_LINE_ICONS[o.id], label: o.words, on: () => o.on, act: () => {
        } })
      )
    );
  };
  const choose = (id) => {
    chosenId = id;
    refresh();
  };
  const given = {
    id: section,
    ...opts.label ? { label: opts.label } : {},
    card: () => {
      const door = find();
      return door ? card(door) : null;
    }
  };
  controls.addSection(given);
  refresh();
  return { refresh, choose, chosen: find };
}

// packages/sdk/src/ui/model.ts
import { cleanMenuWorld, cleanSettings, PINS_MOST } from "@nswp/core";

// packages/sdk/src/ui/letters.ts
import { cleanMessage, MESSAGE_LIMITS } from "@nswp/core";
function createUiLetters(changed, now = () => Date.now()) {
  let opts = null;
  let waiting = [];
  let said = "";
  let version = 0;
  let count = 0;
  const bump = () => {
    version++;
    changed();
  };
  return {
    attach(next) {
      opts = next;
      waiting = [];
      said = "";
      bump();
    },
    detach() {
      if (!opts) return;
      opts = null;
      waiting = [];
      said = "";
      bump();
    },
    touch: bump,
    seen() {
      opts?.seen?.();
    },
    send(text) {
      const mine = opts;
      if (!mine) return "There is nobody to write to: choose someone first.";
      const words = cleanMessage(text);
      if (!words) return null;
      const line = { key: `new-${++count}`, mine: true, who: "You", text: words, at: Math.floor(now() / 1e3), state: "sending" };
      waiting.push(line);
      said = "";
      bump();
      void mine.send(words).catch(() => ({ ok: false, said: "That wasn't sent." })).then((how) => {
        if (opts !== mine) return;
        if (how.ok) waiting = waiting.filter((l) => l !== line);
        else line.state = "failed";
        said = how.said;
        bump();
      });
      return null;
    },
    view() {
      const name = typeof opts?.with === "function" ? opts.with() : opts?.with ?? "";
      const lines = opts ? [...opts.lines().map((l) => ({ ...l, state: "out" })), ...waiting].sort((a, b) => a.at - b.at) : [];
      return {
        ready: !!opts,
        title: name ? `${name}, privately` : "Private messages",
        with: name,
        lines,
        said,
        lead: name ? `Private: only you and ${name} can read what is written here. A relay is told who it is for, and nothing more.` : "",
        limit: MESSAGE_LIMITS.chars,
        version
      };
    }
  };
}

// packages/sdk/src/ui/model.ts
var KIT_QUESTION_TABS = ["how-you-move-desk", "how-you-move"];
var PRESENCES = ["full", "quiet", "hidden"];
var CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
function cleanKeys(now, k) {
  const out = { ...now };
  if (k && (k.menu === null || typeof k.menu === "string" && k.menu.length === 1)) out.menu = k.menu === null ? null : k.menu.toLowerCase();
  if (k && typeof k.hotbar === "boolean") out.hotbar = k.hotbar;
  if (k && (k.chat === null || typeof k.chat === "string" && k.chat.length === 1)) out.chat = k.chat === null ? null : k.chat.toLowerCase();
  return out;
}
var read = (t) => typeof t === "function" ? t() : t ?? "";
var STANDARD = [
  { id: "travel", label: "Travel", icon: "door" },
  // Who the visitor is here. It has something in it only for one who came through a client (ui/identity.ts).
  { id: "you", label: "You", icon: "you" },
  // How other people see them. A visitor's own client fills this in, in its own place: a look is changed there and
  // nowhere else (ui/identity.ts, protocol/05-looks.md). In a world it is empty, and isn't shown.
  { id: "figure", label: "Your look", icon: "look" },
  { id: "room", label: "Room", icon: "room" },
  { id: "people", label: "People", icon: "people" },
  // Who the visitor follows (following.ts). Empty, and not shown, for a guest.
  { id: "following", label: "Following", icon: "list" },
  // Their private messages (messaging.ts). Empty, and not shown, for a guest.
  { id: "messages", label: "Messages", icon: "chat" },
  // A world's boards, where it keeps score (scoring.ts). Added by the world; empty, and not shown, otherwise.
  { id: "scores", label: "Scores", icon: "list" },
  // What a world marks, and which of it the visitor has earned (achieving.ts). Added by the world, like Scores.
  { id: "achievements", label: "Achievements", icon: "check" },
  // The items a visitor has, and the one in their hand (bagging.ts). Empty, and not shown, for a guest.
  { id: "bag", label: "Bag", icon: "save" },
  { id: "camera", label: "Camera", icon: "camera" },
  { id: "panels", label: "Panels", icon: "panel" },
  { id: "view", label: "View", icon: "vr" },
  { id: "moving", label: "Moving", icon: "step" },
  { id: "sound", label: "Sound", icon: "sound" },
  // How the controls themselves look. Called "Display", since "your look" is how other people see you.
  { id: "look", label: "Display", icon: "look", note: "How these controls look to you: their colour, the size of their text, whether things move. They go with you from world to world." },
  { id: "help", label: "Help", icon: "help" }
];
var KEEPERS = { id: "guests", label: "Who comes in", icon: "people" };
var STANDARD_TABS = STANDARD.flatMap((s) => s.id === "people" ? [s.id, KEEPERS.id] : [s.id]);
var STANDARD_ORDER = ["back", "home", "go-home", "doors", "list", "vr", "room-join", "room-mic", "room-chat", "jump"];
var rank = (id) => {
  const i = STANDARD_ORDER.indexOf(id);
  return i === -1 ? STANDARD_ORDER.length : i;
};
var inOrder = (list) => list.map((a, i) => [a, i]).sort((x, y) => rank(x[0].id) - rank(y[0].id) || x[1] - y[1]).map((x) => x[0]);
var PINS_KEY = "nswp:ui:pins";
function loadPins() {
  try {
    const kept = globalThis.localStorage?.getItem(PINS_KEY);
    return kept === null || kept === void 0 ? null : cleanSettings({ pins: JSON.parse(kept) }).pins ?? null;
  } catch {
    return null;
  }
}
function savePins(pins) {
  try {
    globalThis.localStorage?.setItem(PINS_KEY, JSON.stringify(pins));
  } catch {
  }
}
var LOADING_WORDS = 80;
var SAY_STAYS = { least: 4200, most: 1e4, easy: 60, each: 70 };
var sayStays = (text) => Math.min(SAY_STAYS.most, SAY_STAYS.least + Math.max(0, [...text].length - SAY_STAYS.easy) * SAY_STAYS.each);
function cleanLoading(state) {
  if (!state || typeof state !== "object") return null;
  const raw = typeof state.words === "string" ? state.words : "";
  const words = [...raw.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim()].slice(0, LOADING_WORDS).join("").trim();
  const f = state.fraction;
  const fraction = typeof f === "number" && Number.isFinite(f) ? Math.min(1, Math.max(0, f)) : null;
  return { fraction, words };
}
function createControls(opts) {
  const sections = STANDARD.map((s) => ({ ...s }));
  for (const s of opts.sections ?? []) addSection(s);
  const actions = [];
  const listeners = /* @__PURE__ */ new Set();
  const sayers = /* @__PURE__ */ new Set();
  const signals = /* @__PURE__ */ new Set();
  let visitor = loadVisitorTheme();
  const came = arrivedSettings();
  const brought = { ...came.text !== void 0 ? { scale: came.text } : {}, ...came.motion !== void 0 ? { motion: came.motion } : {}, ...came.wrist !== void 0 ? { wrist: came.wrist } : {} };
  if (Object.keys(brought).length) {
    visitor = { ...visitor, ...brought };
    saveVisitorTheme(visitor);
  }
  reportSettings(
    "look",
    () => ({ ...visitor.scale !== void 0 ? { text: visitor.scale } : {}, ...visitor.motion !== void 0 ? { motion: visitor.motion } : {}, ...visitor.wrist !== void 0 ? { wrist: visitor.wrist } : {} }),
    // Their client's menu changed one (settings.ts, `changeSettings`): as their own hand on it here would.
    (now) => {
      const patch = { ...now.text !== void 0 ? { scale: now.text } : {}, ...now.motion !== void 0 ? { motion: now.motion } : {}, ...now.wrist !== void 0 ? { wrist: now.wrist } : {} };
      if (!Object.keys(patch).length) return;
      visitor = { ...visitor, ...patch };
      saveVisitorTheme(visitor);
      theme = resolveTheme(opts.theme, visitor);
      changed();
    }
  );
  let pins = loadPins();
  if (came.pins !== void 0) {
    pins = [...came.pins];
    savePins(pins);
  }
  reportSettings(
    "pins",
    () => pins ? { pins } : {},
    (now) => {
      if (now.pins === void 0) return;
      pins = [...now.pins];
      savePins(pins);
      changed();
    }
  );
  let theme = resolveTheme(opts.theme, visitor);
  let target = "";
  let detail = [];
  let loading = null;
  let presence = PRESENCES.includes(opts.presence) ? opts.presence : "full";
  let corner = CORNERS.includes(opts.corner) ? opts.corner : "top-left";
  let keys = cleanKeys({ menu: "m", hotbar: true, chat: "t" }, opts.keys);
  let claimed = false;
  const changed = () => {
    for (const fn of listeners) fn();
  };
  const chat = createUiChat(changed);
  const feed = createUiFeed(changed);
  const letters = createUiLetters(changed);
  const toldOfTabs = /* @__PURE__ */ new Set();
  const tellOfTab = (id) => {
    if (toldOfTabs.has(id) || KIT_QUESTION_TABS.includes(id)) return;
    toldOfTabs.add(id);
    if (cleanMenuWorld({ sections: [{ id, label: "a tab", rows: [] }] }, { own: true })?.sections.length) return;
    console.warn(`NSWP: the tab "${id}" is in this world's own menu, but will not be in a client's (BitPortal's): a tab's id is a lowercase word of letters, digits and hyphens, beginning with a letter, twelve at most. Its rows go with it.`);
  };
  function addSection(s) {
    tellOfTab(s.id);
    const i = sections.findIndex((x) => x.id === s.id);
    if (i === -1) sections.push({ ...s });
    else sections[i] = { ...sections[i], ...s };
  }
  const controls = {
    get theme() {
      return theme;
    },
    add(...more) {
      for (const a of more) {
        const i = actions.findIndex((x) => x.id === a.id);
        if (i === -1) actions.push(a);
        else actions[i] = a;
      }
      changed();
    },
    has: (id) => actions.some((x) => x.id === id),
    remove(id) {
      const i = actions.findIndex((x) => x.id === id);
      if (i !== -1) actions.splice(i, 1);
      changed();
    },
    addSection(s) {
      addSection(s);
      changed();
    },
    get presence() {
      return presence;
    },
    setPresence(next) {
      if (!PRESENCES.includes(next) || next === presence) return;
      presence = next;
      changed();
    },
    setCorner(next) {
      if (!CORNERS.includes(next) || next === corner) return;
      corner = next;
      changed();
    },
    setKeys(next) {
      keys = cleanKeys(keys, next);
      changed();
    },
    claimInput(next) {
      if (claimed === next) return;
      claimed = next;
      changed();
    },
    setLoading(state) {
      const next = cleanLoading(state);
      if (JSON.stringify(next) === JSON.stringify(loading)) return;
      loading = next;
      changed();
    },
    setTarget(text, more = []) {
      const next = text ? more.filter((line) => typeof line === "string" && line.trim()).slice(0, 4) : [];
      if (text === target && next.join("\n") === detail.join("\n")) return;
      target = text;
      detail = next;
      changed();
    },
    say(text) {
      for (const fn of sayers) fn(text);
    },
    run(id, typed, file) {
      const a = actions.find((x) => x.id === id);
      if (!a || a.hidden?.() || a.kind === "line") return false;
      for (const fn of signals) fn("press");
      void Promise.resolve().then(() => a.kind === "file" ? a.act(void 0, file) : a.act(a.kind === "field" || a.kind === "slider" ? typed : void 0)).catch(() => {
      }).finally(changed);
      return true;
    },
    setTheme(patch, keep4 = false) {
      if (keep4) {
        visitor = { ...visitor, ...patch };
        saveVisitorTheme(visitor);
      }
      theme = resolveTheme({ ...opts.theme, ...keep4 ? {} : patch }, visitor);
      changed();
    },
    get pins() {
      return pins ?? [];
    },
    setPinned(section, pinned) {
      const now = pins ?? [];
      if (pinned === now.includes(section)) return true;
      if (pinned && (now.length >= PINS_MOST || cleanSettings({ pins: [section] }).pins?.length !== 1)) return false;
      pins = pinned ? [...now, section] : now.filter((id) => id !== section);
      savePins(pins);
      changed();
      return true;
    },
    view() {
      const showing = inOrder(actions.filter((a) => !a.hidden?.()));
      const pressable = showing.filter((a) => a.kind !== "line" && a.kind !== "slider");
      const bar = [...pressable.filter((a) => a.hotbar && a.lead), ...pressable.filter((a) => a.hotbar && !a.lead)].slice(0, 6);
      const item = (a) => {
        const slot = bar.indexOf(a);
        return { id: a.id, label: read(a.label), icon: (typeof a.icon === "function" ? a.icon() : a.icon) ?? null, on: a.on ? a.on() : null, tone: a.tone ?? "normal", key: slot === -1 ? "" : String(slot + 1), short: read(a.short) || read(a.label), kind: a.kind ?? "button", ...a.kind === "copy" ? { copy: read(a.copy) } : {}, ...a.kind === "file" ? { accept: a.accept ?? [] } : {}, ...a.kind === "slider" && a.slider ? { slider: a.slider } : {}, color: read(a.color), ...a.picture ? { picture: a.picture } : {}, mark: (typeof a.mark === "function" ? a.mark() : a.mark) ?? null, faint: a.faint?.() === true };
      };
      const known = new Set(sections.map((s) => s.id));
      const extra = [...new Set(showing.map((a) => a.section ?? "travel").filter((id) => !known.has(id)))].map((id) => ({ id, label: id }));
      const shown3 = [...sections, ...extra].map((s) => ({ id: s.id, label: s.label, icon: s.icon ?? null, note: read(s.note), card: s.card?.() ?? null, items: showing.filter((a) => (a.section ?? "travel") === s.id).map(item), pinned: (pins ?? []).includes(s.id) })).filter((s) => s.items.length > 0 || s.note || s.card);
      return {
        title: opts.title,
        address: opts.address ?? "",
        target,
        detail,
        loading,
        sections: shown3,
        hotbar: bar.map(item),
        // Only tabs this place has: a tab pinned in another world that isn't here is kept, and not shown.
        pins: (pins ?? []).flatMap((id, i) => {
          const tab = shown3.find((x) => x.id === id);
          const n = bar.length + i + 1;
          return tab ? [{ id, label: tab.label, icon: tab.icon, key: n <= 9 ? String(n) : "" }] : [];
        }),
        pinsFull: (pins ?? []).length >= PINS_MOST,
        theme,
        presence,
        corner,
        keys: claimed ? { menu: null, hotbar: false, chat: null } : keys,
        chat: chat.view(),
        feed: feed.view(),
        letters: letters.view()
      };
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    signal(name) {
      for (const fn of signals) {
        try {
          fn(name);
        } catch {
        }
      }
    },
    onSignal(fn) {
      signals.add(fn);
      return () => signals.delete(fn);
    },
    onSay(fn) {
      sayers.add(fn);
      return () => sayers.delete(fn);
    },
    chat,
    feed,
    letters
  };
  const keep3 = (patch) => controls.setTheme(patch, true);
  controls.add(
    ...UI_PRESETS.map(
      (p) => ({ id: `look-${p.id}`, section: "look", kind: "swatch", color: p.accent, label: p.label, on: () => theme.accent === p.accent, act: () => keep3({ accent: p.accent }) })
    ),
    { id: "look-size", section: "look", icon: "size", label: () => theme.scale > 1 ? "Text: larger" : "Text: normal", on: () => theme.scale > 1, act: () => keep3({ scale: theme.scale > 1 ? 1 : 1.25 }) },
    { id: "look-motion", section: "look", icon: "motion", label: () => theme.motion ? "Motion: on" : "Motion: off", on: () => theme.motion, act: () => keep3({ motion: !theme.motion }) },
    {
      id: "look-wrist",
      section: "look",
      icon: "menu",
      label: () => theme.wrist === "off" ? "Wrist console: off" : `Wrist console: ${theme.wrist} hand`,
      on: () => theme.wrist !== "off",
      act: () => keep3({ wrist: theme.wrist === "left" ? "right" : theme.wrist === "right" ? "off" : "left" })
    },
    { id: "look-reset", section: "look", icon: "turn", label: "Back to this world's look", hidden: () => Object.keys(visitor).length === 0, act: () => {
      visitor = {};
      saveVisitorTheme({});
      theme = resolveTheme(opts.theme, visitor);
    } }
  );
  return controls;
}

// packages/sdk/src/ui/summon.ts
var SUMMON_KEY = "Backquote";
var SUMMON_HOLD = 600;
var SUMMON_SLOP = 18;
function createHoldWatch(o) {
  const hold = o.hold ?? SUMMON_HOLD;
  const slop = o.slop ?? SUMMON_SLOP;
  let from = null;
  let timer = null;
  const cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    from = null;
  };
  return {
    touches(points) {
      if (points.length !== 2) return cancel();
      if (!from) {
        from = points.map((p) => ({ x: p.x, y: p.y }));
        timer = setTimeout(() => {
          cancel();
          o.onHeld();
        }, hold);
        return;
      }
      if (points.some((p, i) => Math.hypot(p.x - from[i].x, p.y - from[i].y) > slop)) cancel();
    },
    cancel
  };
}
function createHeldButton(hold = SUMMON_HOLD) {
  let held = 0;
  let fired = false;
  return (down, dt) => {
    if (!down) {
      held = 0;
      fired = false;
      return false;
    }
    held += Math.max(0, dt) * 1e3;
    if (fired || held < hold) return false;
    fired = true;
    return true;
  };
}

// packages/sdk/src/ui/sheet-look.ts
var SHEET_LOOK = {
  /** The menu's words: 13 px, 1.35 lines apart. An icon is 1.55 times the words, drawn with lines 1.6 wide (of 24). */
  text: { size: 13, line: 1.35, icon: 1.55, iconLine: 1.6, family: 'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", sans-serif', mono: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace' },
  /** Glass: its fill and its edge. */
  glass: { fill: 0.7, edge: 0.34 },
  /**
   * The sheet. At a desk (`desk`, at least that wide and high) it is `wide` across, in two columns; else `narrow`,
   * in one. It is at most `tall` high, or that share of the screen. Its top edge is lit by a line, glowing.
   */
  sheet: { wide: 780, narrow: 480, desk: { width: 900, height: 560 }, side: 20, deskSide: 40, tall: { desk: 780, deskShare: 74, narrow: 640, narrowShare: 70 }, corners: [22, 22, 12, 12], top: { line: 2, glow: 16 } },
  /** The strip of tabs: its room, and each tab. A tab brought into sight is kept `clear` of the arrows at the ends. */
  tabs: { pad: [12, 12, 0], gap: 4, clear: 46, more: { width: 40, inset: 9, fade: 45 }, tab: { pad: [9, 13, 8], gap: 7, corners: 14, under: 2, ink: 0.72, on: 0.1 } },
  /** The list of rows under the strip: its gap, its room, and the line over it. */
  rows: { gap: 6, pad: 12, line: 0.22 },
  /** A row to press. */
  row: { height: 46, pad: [8, 12], corners: 10, gap: 12, edge: 0.12, fill: 0.03, hoverFill: 0.13, hoverEdge: 0.7, onEdge: 0.8, primaryFill: 0.16, primaryEdge: 0.75, state: 0.86, stateInk: 0.6 },
  /** A line to read. */
  line: { pad: [4, 12], gap: 12, dim: 0.55, iconDim: 0.55, iconAt: 1 },
  /** A row typed into: a box and its button, and a line under them. */
  field: { pad: [8, 12], gap: [6, 8], box: 40, boxPad: [6, 10], boxCorners: 8, boxEdge: 0.25, boxGlass: 0.6, buttonPad: [6, 14], to: 0.86, toInk: 0.6 },
  /** A song's bar: its words, the bar, and where it is. */
  slide: { pad: [8, 12], gap: [4, 12], bar: 28, time: 0.86, timeInk: 0.7, onEdge: 0.5 },
  /** A row that takes a file, and the line under it. */
  takes: { gap: 4, to: 0.86, toInk: 0.6 },
  /** Choices of colour: small doorways in a row. */
  swatches: { gap: [6, 4], pad: [4, 2, 8] },
  swatch: { width: 66, gap: 6, text: 0.86, ink: 0.8, arch: [38, 44], corners: [19, 5], sill: [46, 2], sillAt: -3, sillInk: 0.25 },
  /** Things with pictures, side by side: each at least `min` wide at a desk, `narrowMin` on a phone. */
  tiles: { min: 112, narrowMin: 104, gap: 8, pad: [2, 0, 4] },
  tile: { pad: [8, 6, 9], gap: 4, corners: [14, 8], text: 0.9, line: 1.2, ink: 0.85, glow: 0.13, letter: 1.9, mark: { size: 24, inset: 6, corners: 8, icon: 15, glass: 0.85, edge: 0.55 } },
  /** A card at the head of a tab: who, or what, it is about. */
  card: { pad: 12, corners: [16, 8], face: 56, gap: [3, 12], edge: 0.45, fill: 0.07, title: 1.15, tag: 0.76, keyline: 0.9, quote: 7, thing: 200 },
  /** A world's own part of a tab, under its name. */
  from: { top: 6, padX: 12, text: 0.82, ink: 0.55 },
  /** A tab's note. */
  note: { pad: [4, 12, 0, 12], inset: 12, text: 0.95, edge: 0.6, ink: 0.78 },
  /** The strip a said line has in the sheet, above its foot: one line high and `pad` more, then `after`. */
  says: { pad: 18, after: 8 },
  /** The foot: keep this tab on the bar, and Close. */
  foot: { pad: [0, 12, 12], gap: 10, pin: { pad: [7, 12], corners: 10, text: 0.93, icon: 16, gap: 7, edge: 0.22, ink: 0.82 }, close: { height: 38, padX: 14, corners: 10, edge: 0.22 } },
  /** The bar of things at hand: its keys, each a small doorway on a sill. */
  bar: { corners: [20, 10], pad: [12, 14, 8], gap: 10, more: 30, theirs: 0.2 },
  key: { width: 62, gap: 7, arch: [52, 54], corners: [26, 7], sill: [60, 2], sillAt: -4, name: 0.84, line: 1.2, ink: 0.82, fill: 0.08, edge: 0.42, sillInk: 0.28, hoverFill: 0.2, onFill: 0.26 }
};
var alpha = (a) => String(a).replace(/^0\./, ".");
var lengths = (p) => p.map((n) => n ? `${n}px` : "0").join(" ");

export {
  ICONS,
  PICTURES_KEY,
  PICTURE_LIMITS,
  showsPictures,
  setShowsPictures,
  onPicturesChange,
  loadPicture,
  DEFAULT_THEME,
  UI_PRESETS,
  cleanTheme,
  resolveTheme,
  rgb,
  SHEET_LOOK,
  alpha,
  lengths,
  MARK,
  paintMark,
  markSvg,
  offerSignIn,
  signInHere,
  signInFirst,
  guestHere,
  CHAT_KEY,
  showsChat,
  setShowsChat,
  onChatChange,
  wrapWords,
  FEED_LIMITS,
  ago,
  OFFER_ICONS,
  vouchedWords,
  addDoorControls,
  sayStays,
  createControls,
  SUMMON_KEY,
  SUMMON_HOLD,
  SUMMON_SLOP,
  createHoldWatch,
  createHeldButton
};
