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
  pin: "M9 4h6l-1 6 3 3H7l3-3-1-6ZM12 13v7",
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
  key: "M14.5 9.5a3.5 3.5 0 1 0-3.4 3.5L4 20v-3h3v-3h3l1.6-1.6M16 8h.01",
  chat: "M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 10h8M8 13h5",
  people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M16 11a2.5 2.5 0 1 0 0-5M21 20a5 5 0 0 0-4-4.9"
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

// packages/sdk/src/relay-book.ts
import { DISCOVERY, DISCOVERY_RELAYS, learnRelays, pickDiscovered, pickRelays, publishEvent, queryRelays, RELAY_DISCOVERY_KIND, WRAP_KIND } from "@nswp/core";
var KEY2 = "nswp:relays";
var notes = null;
var read = () => {
  if (notes) return notes;
  try {
    const kept = JSON.parse(globalThis.localStorage?.getItem(KEY2) ?? "{}");
    notes = kept && typeof kept === "object" && !Array.isArray(kept) ? kept : {};
  } catch {
    notes = {};
  }
  return notes;
};
function learnFrom(results, now = Date.now()) {
  notes = learnRelays(read(), results, now);
  try {
    globalThis.localStorage?.setItem(KEY2, JSON.stringify(notes));
  } catch {
  }
}
function relaysWell(o, now = Date.now()) {
  return pickRelays({ ...o, notes: read(), now });
}
async function sendWell(event, o) {
  const publish = o.publish ?? publishEvent;
  const now = o.now ?? (() => Date.now());
  const first = relaysWell(o, now());
  const sent = await publish(first.relays, event).catch(() => ({ relays: Object.fromEntries(first.relays.map((r) => [r, "error: not sent"])) }));
  learnFrom(sent.relays, now());
  let took = Object.values(sent.relays).filter((said) => said === "ok").length;
  const tried = [...first.relays];
  if (took === 0) {
    const rest = o.usual.filter((r) => !tried.includes(r));
    if (rest.length) {
      const again = await publish(rest, event).catch(() => ({ relays: Object.fromEntries(rest.map((r) => [r, "error: not sent"])) }));
      learnFrom(again.relays, now());
      took = Object.values(again.relays).filter((said) => said === "ok").length;
      tried.push(...rest);
    }
  }
  if (took === 0 && mayBackUp(tried, !!o.publish) && event.kind !== WRAP_KIND) {
    const more = (await foundRelays({ not: tried, now, ...o.query ? { query: o.query } : {} })).open;
    for (let round = 0; round < BACKUP_ROUNDS && took === 0; round++) {
      const batch = more.slice(round * BACKUP_AT_ONCE, (round + 1) * BACKUP_AT_ONCE);
      if (!batch.length) break;
      const last = await publish(batch, event).catch(() => ({ relays: Object.fromEntries(batch.map((r) => [r, "error: not sent"])) }));
      learnFrom(last.relays, now());
      took = Object.values(last.relays).filter((said) => said === "ok").length;
      tried.push(...batch);
    }
  }
  return { took, relays: tried, own: first.own };
}
async function askWell(filter, o) {
  const now = o.now ?? (() => Date.now());
  const asked = relaysWell(o, now()).relays;
  return queryBacked(asked, filter, o.timeoutMs ?? 4e3, { ...o.query ? { query: o.query } : {}, now });
}
var FOUND_KEY = "nswp:relays:found";
var FOUND_FOR_MS = 24 * 3600 * 1e3;
var backup = true;
var found = null;
var finding = null;
function relayBackup(on) {
  if (on !== void 0) backup = on;
  return backup;
}
function foundRelays(o = {}) {
  const now = o.now ?? (() => Date.now());
  const without = (all) => ({ open: all.open.filter((r) => !(o.not ?? []).includes(r)), closed: all.closed });
  if (!found) {
    try {
      const kept = JSON.parse(globalThis.localStorage?.getItem(FOUND_KEY) ?? "null");
      const list = (v) => Array.isArray(v) ? v.filter((r) => typeof r === "string" && /^wss:\/\//.test(r)).slice(0, 400) : [];
      if (kept && typeof kept.at === "number") found = { at: kept.at, open: list(kept.open), closed: list(kept.closed) };
    } catch {
    }
  }
  if (found && now() - found.at < FOUND_FOR_MS) return Promise.resolve(without(found));
  finding ??= (async () => {
    const since = Math.floor(now() / 1e3) - DISCOVERY.freshSec;
    const got = await (o.query ?? queryRelays)([...DISCOVERY_RELAYS], { kinds: [RELAY_DISCOVERY_KIND], since, limit: 500 }, 5e3).catch(() => null);
    const picked = pickDiscovered(got?.events ?? [], { now: Math.floor(now() / 1e3), most: 24 });
    if (picked.open.length || picked.closed.length) {
      found = { at: now(), ...picked };
      try {
        globalThis.localStorage?.setItem(FOUND_KEY, JSON.stringify(found));
      } catch {
      }
    }
    return picked;
  })().finally(() => {
    finding = null;
  });
  return finding.then(without);
}
var BACKUP_AT_ONCE = 4;
var BACKUP_ROUNDS = 3;
var mayBackUp = (relays, injected) => backup && relays.length > 0 && (injected || typeof document !== "undefined");
async function queryBacked(relays, filter, timeoutMs = 4e3, o = {}) {
  const query = o.query ?? queryRelays;
  const now = o.now ?? (() => Date.now());
  const got = await query(relays, filter, timeoutMs);
  learnFrom(got.relays, now());
  if (!mayBackUp(relays, !!o.query) || Object.values(got.relays).some((said) => said === "eose")) return got;
  const more = (await foundRelays({ not: relays, ...o })).open.slice(0, BACKUP_AT_ONCE);
  if (!more.length) return got;
  const again = await query(more, filter, timeoutMs).catch(() => null);
  if (!again) return got;
  learnFrom(again.relays, now());
  const byId = new Map([...got.events, ...again.events].map((e) => [e.id, e]));
  return { events: [...byId.values()], relays: { ...got.relays, ...again.relays } };
}
async function publishBacked(relays, event, o = {}) {
  const publish = o.publish ?? publishEvent;
  const now = o.now ?? (() => Date.now());
  const sent = await publish(relays, event);
  learnFrom(sent.relays, now());
  if (!mayBackUp(relays, !!o.publish) || event.kind === WRAP_KIND || Object.values(sent.relays).some((said) => said === "ok")) return sent;
  const more = (await foundRelays({ not: relays, ...o.query ? { query: o.query } : {}, now })).open;
  const all = { ...sent.relays };
  for (let round = 0; round < BACKUP_ROUNDS; round++) {
    const batch = more.slice(round * BACKUP_AT_ONCE, (round + 1) * BACKUP_AT_ONCE);
    if (!batch.length) break;
    const again = await publish(batch, event).catch(() => null);
    if (!again) continue;
    learnFrom(again.relays, now());
    Object.assign(all, again.relays);
    if (Object.values(again.relays).some((said) => said === "ok")) break;
  }
  return { relays: all };
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
            posts.push({ key: p.id, text, at: p.at, state: "out" });
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
        said = how.said;
        bump();
      });
      return null;
    },
    view() {
      const who = typeof opts?.who === "function" ? opts.who() : opts?.who ?? "";
      const lead = `Public, like a tweet: anyone can read what you send out here, as ${who}, and it can't be taken back.${opts?.marked ? ` Each post is marked as sent from ${opts.marked}.` : ""}`;
      return { ready: !!opts, title: "My public feed", who, posts, loading, said, lead, limit: CHAT_LIMITS2.chars, version };
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
  PICTURES_KEY,
  PICTURE_LIMITS,
  showsPictures,
  setShowsPictures,
  onPicturesChange,
  loadPicture,
  DEFAULT_THEME,
  UI_PRESETS,
  cleanTheme,
  loadVisitorTheme,
  saveVisitorTheme,
  resolveTheme,
  rgb,
  learnFrom,
  relaysWell,
  sendWell,
  askWell,
  relayBackup,
  foundRelays,
  queryBacked,
  publishBacked,
  CHAT_KEY,
  showsChat,
  setShowsChat,
  onChatChange,
  createUiChat,
  wrapWords,
  FEED_LIMITS,
  createUiFeed,
  ago,
  SUMMON_KEY,
  SUMMON_HOLD,
  SUMMON_SLOP,
  createHoldWatch,
  createHeldButton
};
