import {
  arrivedSettings,
  reportSettings
} from "./shared-Q3D4OUDA.js";

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
  /** A loudspeaker, sounding and crossed out. */
  sound: "M4 9.500v5h3.500L13 19V5L7.500 9.500ZM16.500 9a4.500 4.500 0 0 1 0 6M19 6.500a8 8 0 0 1 0 11",
  soundOff: "M4 9.500v5h3.500L13 19V5L7.500 9.500ZM16.500 9.500l4.500 5M21 9.500l-4.500 5",
  you: "M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM5 20.5a7 7 0 0 1 14 0",
  close: "M6 6l12 12M18 6 6 18",
  chat: "M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 10h8M8 13h5",
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
  reportSettings("pictures", () => ({ pictures: showsPictures() }));
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
  reportSettings("chat", () => ({ chat: showsChat() }));
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

export {
  ICONS,
  DEFAULT_THEME,
  UI_PRESETS,
  cleanTheme,
  loadVisitorTheme,
  saveVisitorTheme,
  resolveTheme,
  rgb,
  PICTURES_KEY,
  PICTURE_LIMITS,
  showsPictures,
  setShowsPictures,
  onPicturesChange,
  loadPicture,
  CHAT_KEY,
  showsChat,
  setShowsChat,
  onChatChange,
  createUiChat,
  wrapWords,
  SUMMON_KEY,
  SUMMON_HOLD,
  SUMMON_SLOP,
  createHoldWatch,
  createHeldButton
};
