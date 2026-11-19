import {
  CHAT_KEY,
  DEFAULT_THEME,
  ICONS,
  PICTURES_KEY,
  PICTURE_LIMITS,
  SUMMON_HOLD,
  SUMMON_KEY,
  SUMMON_SLOP,
  UI_PRESETS,
  cleanTheme,
  createHeldButton,
  createHoldWatch,
  createUiChat,
  loadPicture,
  loadVisitorTheme,
  onChatChange,
  onPicturesChange,
  resolveTheme,
  rgb,
  saveVisitorTheme,
  setShowsChat,
  setShowsPictures,
  showsChat,
  showsPictures
} from "./shared-Q23R6KOF.js";
import {
  arrivedSettings,
  reportSettings
} from "./shared-Q3D4OUDA.js";
import "./shared-QLSLERQ3.js";

// packages/sdk/src/ui/model.ts
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
  { id: "camera", label: "Camera", icon: "camera" },
  { id: "panels", label: "Panels", icon: "panel" },
  { id: "view", label: "View", icon: "vr" },
  { id: "moving", label: "Moving", icon: "step" },
  { id: "sound", label: "Sound", icon: "sound" },
  // How the controls themselves look. Called "Display", since "your look" is how other people see you.
  { id: "look", label: "Display", icon: "look", note: "How these controls look to you: their colour, the size of their text, whether things move. They go with you from world to world." },
  { id: "help", label: "Help", icon: "help" }
];
var STANDARD_ORDER = ["back", "home", "go-home", "doors", "list", "vr", "room-join", "room-mic", "room-chat", "jump"];
var rank = (id) => {
  const i = STANDARD_ORDER.indexOf(id);
  return i === -1 ? STANDARD_ORDER.length : i;
};
var inOrder = (list) => list.map((a, i) => [a, i]).sort((x, y) => rank(x[0].id) - rank(y[0].id) || x[1] - y[1]).map((x) => x[0]);
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
  reportSettings("look", () => ({ ...visitor.scale !== void 0 ? { text: visitor.scale } : {}, ...visitor.motion !== void 0 ? { motion: visitor.motion } : {}, ...visitor.wrist !== void 0 ? { wrist: visitor.wrist } : {} }));
  let theme = resolveTheme(opts.theme, visitor);
  let target = "";
  let detail = [];
  let presence = PRESENCES.includes(opts.presence) ? opts.presence : "full";
  let corner = CORNERS.includes(opts.corner) ? opts.corner : "top-left";
  let keys = cleanKeys({ menu: "m", hotbar: true, chat: "t" }, opts.keys);
  let claimed = false;
  const changed = () => {
    for (const fn of listeners) fn();
  };
  const chat = createUiChat(changed);
  function addSection(s) {
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
    run(id) {
      const a = actions.find((x) => x.id === id);
      if (!a || a.hidden?.()) return false;
      for (const fn of signals) fn("press");
      void Promise.resolve().then(() => a.act()).catch(() => {
      }).finally(changed);
      return true;
    },
    setTheme(patch, keep2 = false) {
      if (keep2) {
        visitor = { ...visitor, ...patch };
        saveVisitorTheme(visitor);
      }
      theme = resolveTheme({ ...opts.theme, ...keep2 ? {} : patch }, visitor);
      changed();
    },
    view() {
      const showing = inOrder(actions.filter((a) => !a.hidden?.()));
      const bar = showing.filter((a) => a.hotbar).slice(0, 6);
      const item = (a) => {
        const slot = bar.indexOf(a);
        return { id: a.id, label: read(a.label), icon: (typeof a.icon === "function" ? a.icon() : a.icon) ?? null, on: a.on ? a.on() : null, tone: a.tone ?? "normal", key: slot === -1 ? "" : String(slot + 1), short: read(a.short) || read(a.label), kind: a.kind ?? "button", color: read(a.color) };
      };
      const known = new Set(sections.map((s) => s.id));
      const extra = [...new Set(showing.map((a) => a.section ?? "travel").filter((id) => !known.has(id)))].map((id) => ({ id, label: id }));
      return {
        title: opts.title,
        address: opts.address ?? "",
        target,
        detail,
        sections: [...sections, ...extra].map((s) => ({ id: s.id, label: s.label, icon: s.icon ?? null, note: read(s.note), card: s.card?.() ?? null, items: showing.filter((a) => (a.section ?? "travel") === s.id).map(item) })).filter((s) => s.items.length > 0 || s.note || s.card),
        hotbar: bar.map(item),
        theme,
        presence,
        corner,
        keys: claimed ? { menu: null, hotbar: false, chat: null } : keys,
        chat: chat.view()
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
    chat
  };
  const keep = (patch) => controls.setTheme(patch, true);
  controls.add(
    ...UI_PRESETS.map(
      (p) => ({ id: `look-${p.id}`, section: "look", kind: "swatch", color: p.accent, label: p.label, on: () => theme.accent === p.accent, act: () => keep({ accent: p.accent }) })
    ),
    { id: "look-size", section: "look", icon: "size", label: () => theme.scale > 1 ? "Text: larger" : "Text: normal", on: () => theme.scale > 1, act: () => keep({ scale: theme.scale > 1 ? 1 : 1.25 }) },
    { id: "look-motion", section: "look", icon: "motion", label: () => theme.motion ? "Motion: on" : "Motion: off", on: () => theme.motion, act: () => keep({ motion: !theme.motion }) },
    {
      id: "look-wrist",
      section: "look",
      icon: "menu",
      label: () => theme.wrist === "off" ? "Wrist console: off" : `Wrist console: ${theme.wrist} hand`,
      on: () => theme.wrist !== "off",
      act: () => keep({ wrist: theme.wrist === "left" ? "right" : theme.wrist === "right" ? "off" : "left" })
    },
    { id: "look-reset", section: "look", icon: "turn", label: "Back to this world's look", hidden: () => Object.keys(visitor).length === 0, act: () => {
      visitor = {};
      saveVisitorTheme({});
      theme = resolveTheme(opts.theme, visitor);
    } }
  );
  return controls;
}

// packages/sdk/src/ui/hud.ts
var CSS = `
:host { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; display: block;
  --s: 1; --accent: 255, 182, 92; --ink: 238, 245, 251; --glass: 10, 16, 24; --warn: 255, 117, 102;
  font: 500 calc(13px * var(--s)) / 1.35 ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: rgb(var(--ink)); -webkit-font-smoothing: antialiased; }
:host([hidden]) { display: none; }
* { box-sizing: border-box; }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; margin: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
button:focus-visible { outline: 2px solid rgb(var(--ink)); outline-offset: 3px; }
svg { width: 1.55em; height: 1.55em; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; flex: none; }
.glass { background: rgba(var(--glass), .7); border: 1px solid rgba(var(--accent), .34);
  -webkit-backdrop-filter: blur(12px) saturate(1.25); backdrop-filter: blur(12px) saturate(1.25); }
.mono { font-family: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace; font-weight: 400; }

/* ---- the corners of the view, marked lightly: this is a HUD, laid over a place */
.corner { position: absolute; width: 22px; height: 22px; border: 0 solid rgba(var(--accent), .5); }
.corner.a { left: 6px; bottom: 6px; border-left-width: 1px; border-bottom-width: 1px; border-bottom-left-radius: 6px; }
.corner.b { right: 6px; bottom: 6px; border-right-width: 1px; border-bottom-width: 1px; border-bottom-right-radius: 6px; }
@media (max-width: 640px) { .corner { display: none; } }

/* ---- who and where: top left */
.id { position: absolute; top: max(12px, env(safe-area-inset-top)); left: max(12px, env(safe-area-inset-left));
  display: flex; align-items: center; gap: 10px; max-width: min(60vw, 420px); padding: 8px 14px 8px 10px; border-radius: 6px 14px 14px 6px;
  border-left: 2px solid rgb(var(--accent)); }
/* The mark: a lit doorway. The arch is this kit's one shape, borrowed from the doors it leads to. */
.mark { width: 18px; height: 24px; border-radius: 9px 9px 2px 2px; flex: none; position: relative;
  background: linear-gradient(rgba(var(--accent), .95), rgba(var(--accent), .25)); box-shadow: 0 0 14px rgba(var(--accent), .55); }
.mark::after { content: ""; position: absolute; left: -3px; right: -3px; bottom: -3px; height: 2px; background: rgb(var(--ink)); border-radius: 1px; }
.id b { display: block; font-weight: 650; font-size: 1.12em; letter-spacing: .005em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.id .mono { display: block; font-size: .86em; color: rgba(var(--ink), .68); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ---- the menu button: top right */
.menu { position: absolute; top: max(12px, env(safe-area-inset-top)); right: max(12px, env(safe-area-inset-right));
  pointer-events: auto; display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 12px 0 10px; border-radius: 12px; }
.menu:hover, .menu[aria-expanded="true"] { border-color: rgb(var(--accent)); color: rgb(var(--accent)); }
kbd { font: inherit; font-size: .82em; min-width: 1.6em; padding: 1px 5px; text-align: center; border-radius: 5px;
  border: 1px solid rgba(var(--ink), .3); color: rgba(var(--ink), .75); }

/* ---- the bottom: what you point at, then the hotbar */
.low { position: absolute; left: 0; right: 0; bottom: max(10px, env(safe-area-inset-bottom)); display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 0 12px; }
.target { max-width: min(92vw, 640px); padding: 6px 14px; border-radius: 999px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.target:empty { visibility: hidden; }
/* What is pointed at, with a few lines about it: a small card, always this size, never in the way of the thing itself. */
.target.card { max-width: min(92vw, 460px); padding: 10px 16px; border-radius: 14px; white-space: normal; text-align: left; display: grid; gap: 3px; }
.target.card b { font-weight: 650; }
.target.card span { opacity: 0.86; font-size: 0.93em; line-height: 1.35; }
.target.card span:last-child { opacity: 1; color: rgb(var(--accent)); }
.hotbar { pointer-events: auto; display: flex; align-items: flex-start; justify-content: center; gap: 10px; padding: 12px 14px 8px; border-radius: 20px 20px 10px 10px; }
.key { position: relative; width: 62px; display: grid; justify-items: center; gap: 7px; text-align: center; }
/* A key is a small doorway: an arch, standing on a sill that lights when it is on. */
.key .arch { width: 52px; height: 54px; display: grid; place-items: center; border-radius: 26px 26px 7px 7px;
  background: rgba(var(--accent), .08); border: 1px solid rgba(var(--accent), .42); transition: background .15s, border-color .15s, transform .15s; }
.key .sill { width: 60px; height: 2px; margin-top: -4px; border-radius: 1px; background: rgba(var(--ink), .28); transition: background .2s, box-shadow .2s; }
.key .name { font-size: .84em; line-height: 1.2; color: rgba(var(--ink), .82); max-width: 100%; overflow-wrap: anywhere; }
.key .num { position: absolute; top: -6px; right: -2px; }
.key:hover .arch, .key:focus-visible .arch { background: rgba(var(--accent), .2); border-color: rgb(var(--accent)); transform: translateY(-2px); }
.key:hover .sill, .key[aria-pressed="true"] .sill { background: rgb(var(--accent)); box-shadow: 0 0 12px rgba(var(--accent), .8); }
.key[aria-pressed="true"] .arch { background: rgba(var(--accent), .26); color: rgb(var(--accent)); border-color: rgb(var(--accent)); }
.key.primary .arch { background: rgb(var(--accent)); color: rgb(var(--glass)); border-color: rgb(var(--accent)); box-shadow: 0 0 18px rgba(var(--accent), .45); }
.key.warn .arch { border-color: rgba(var(--warn), .7); color: rgb(var(--warn)); background: rgba(var(--warn), .08); }
.key:disabled { opacity: .5; cursor: default; }

/* ---- a few words for a moment: bottom left */
.says { position: absolute; left: max(12px, env(safe-area-inset-left)); bottom: calc(max(10px, env(safe-area-inset-bottom)) + 128px * var(--s)); display: grid; gap: 6px; max-width: min(80vw, 360px); }
.say { padding: 8px 12px; border-radius: 4px 12px 12px 4px; border-left: 2px solid rgb(var(--accent)); animation: say-in .22s ease-out both; }
.say.going { opacity: 0; transition: opacity .5s; }

/* ---- what the room writes: at the right-hand side. Put away, the newest lines pass by; open, a list and a place to write. */
.chat { position: absolute; right: max(12px, env(safe-area-inset-right)); top: calc(max(12px, env(safe-area-inset-top)) + 54px);
  bottom: calc(max(10px, env(safe-area-inset-bottom)) + 128px * var(--s)); width: min(340px, calc(100vw - 24px));
  display: flex; flex-direction: column; justify-content: flex-end; pointer-events: none; }
.chat[data-state="closed"] { display: none; }
.chat .frame { display: flex; flex-direction: column; min-height: 0; max-height: 100%; }
.chat[data-state="open"] .frame { pointer-events: auto; border-radius: 14px 6px 6px 14px; border-right: 2px solid rgb(var(--accent)); overflow: hidden; }
.chat[data-state="peek"] .frame { background: none; border: 0; -webkit-backdrop-filter: none; backdrop-filter: none; }
.chat header { display: flex; align-items: center; gap: 8px; padding: 9px 8px 8px 14px; border-bottom: 1px solid rgba(var(--accent), .22); }
.chat header b { flex: 1; font-weight: 650; }
.chat header button { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; color: rgba(var(--ink), .7); }
.chat header button:hover { color: rgb(var(--ink)); background: rgba(var(--ink), .1); }
.chat header svg { width: 1.2em; height: 1.2em; }
.chat ol { list-style: none; margin: 0; padding: 10px 14px; display: grid; gap: 7px; align-content: end; overflow-y: auto; min-height: 0;
  scrollbar-width: thin; scrollbar-color: rgba(var(--accent), .5) transparent; overflow-wrap: anywhere; }
.chat li b { font-weight: 650; margin-right: .45em; color: var(--who, rgb(var(--accent))); }
.chat li.mine b { color: rgba(var(--ink), .62); }
.chat li.aside { color: rgba(var(--ink), .6); font-size: .93em; }
.chat .empty { margin: 0; padding: 14px; color: rgba(var(--ink), .7); }
.chat form { display: flex; gap: 6px; padding: 8px; border-top: 1px solid rgba(var(--accent), .22); }
.chat input { flex: 1; min-width: 0; font: inherit; font-size: max(16px, 1em); color: rgb(var(--ink)); background: rgba(var(--ink), .07);
  border: 1px solid rgba(var(--ink), .22); border-radius: 9px; padding: 8px 10px; outline: none; }
.chat input::placeholder { color: rgba(var(--ink), .5); }
.chat input:focus { border-color: rgb(var(--accent)); }
.chat form button { padding: 0 13px; border-radius: 9px; background: rgba(var(--accent), .18); border: 1px solid rgba(var(--accent), .7); }
.chat form button:hover { background: rgb(var(--accent)); color: rgb(var(--glass)); }
.chat .hint { margin: 0; padding: 0 12px 8px; font-size: .9em; color: rgb(var(--warn)); }
.chat .hint:empty { display: none; }
.chat[data-state="peek"] :is(header, form, .hint, .empty) { display: none; }
.chat[data-state="peek"] ol { padding: 0; overflow: hidden; justify-items: end; }
.chat[data-state="peek"] li { padding: 7px 12px; border-radius: 12px 4px 4px 12px; border-right: 2px solid rgb(var(--accent)); max-width: 100%;
  background: rgba(var(--glass), .7); -webkit-backdrop-filter: blur(12px) saturate(1.25); backdrop-filter: blur(12px) saturate(1.25); animation: chat-in .22s ease-out both; }
.chat[data-state="peek"].going { opacity: 0; transition: opacity .6s; }
:host([data-presence="hidden"]) .chat { display: none; }
:host(:not([data-presence="full"])) .chat { bottom: max(72px, env(safe-area-inset-bottom)); }

/* ---- the sheet: everything else, by section */
.sheet { position: absolute; left: 50%; bottom: calc(max(10px, env(safe-area-inset-bottom)) + 122px * var(--s)); transform: translateX(-50%);
  width: min(480px, calc(100vw - 20px)); max-height: min(62vh, 560px); display: flex; flex-direction: column; pointer-events: auto;
  border-radius: 22px 22px 12px 12px; overflow: hidden; }
.sheet[hidden] { display: none; }
.sheet::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2px; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(var(--accent)), transparent); box-shadow: 0 0 16px rgb(var(--accent)); }
.tabs { display: flex; gap: 4px; padding: 12px 12px 0; overflow-x: auto; scrollbar-width: none; }
.tab { display: flex; align-items: center; gap: 7px; padding: 9px 13px 8px; border-radius: 14px 14px 0 0; color: rgba(var(--ink), .72); border-bottom: 2px solid transparent; white-space: nowrap; }
.tab:hover { color: rgb(var(--ink)); }
.tab[aria-selected="true"] { color: rgb(var(--accent)); background: rgba(var(--accent), .1); border-bottom-color: rgb(var(--accent)); }
.rows { display: grid; gap: 6px; padding: 12px; overflow-y: auto; border-top: 1px solid rgba(var(--accent), .22);
  scrollbar-width: thin; scrollbar-color: rgba(var(--accent), .5) transparent; }
/* A choice of colour is a row of small doorways, each lit in its own. */
.swatches { display: flex; flex-wrap: wrap; gap: 6px 4px; padding: 4px 2px 8px; }
.swatch { width: 66px; display: grid; justify-items: center; gap: 6px; font-size: .86em; color: rgba(var(--ink), .8); }
.swatch i { width: 38px; height: 44px; border-radius: 19px 19px 5px 5px; background: linear-gradient(var(--c), color-mix(in srgb, var(--c) 30%, transparent)); border: 1px solid var(--c); transition: transform .15s, box-shadow .15s; }
.swatch u { width: 46px; height: 2px; margin-top: -3px; border-radius: 1px; background: rgba(var(--ink), .25); }
.swatch:hover i { transform: translateY(-2px); }
.swatch[aria-pressed="true"] i { box-shadow: 0 0 16px var(--c); }
.swatch[aria-pressed="true"] u { background: var(--c); box-shadow: 0 0 10px var(--c); }
.swatch[aria-pressed="true"] { color: rgb(var(--ink)); }
.row { display: flex; align-items: center; gap: 12px; min-height: 46px; padding: 8px 12px; border-radius: 10px; text-align: left;
  border: 1px solid rgba(var(--ink), .12); background: rgba(var(--ink), .03); transition: background .12s, border-color .12s; }
.row:hover { background: rgba(var(--accent), .13); border-color: rgba(var(--accent), .7); }
.row .grow { flex: 1; min-width: 0; }
.row .state { font-size: .86em; color: rgba(var(--ink), .6); }
.row[aria-pressed="true"] { border-color: rgba(var(--accent), .8); }
.row[aria-pressed="true"] .state { color: rgb(var(--accent)); }
.row.warn { color: rgb(var(--warn)); }
.row.primary { background: rgba(var(--accent), .16); border-color: rgba(var(--accent), .75); }
/* Who a section is about: a face, a name, how they are known, and what they say of themselves, set apart as theirs. */
.card { display: grid; grid-template-columns: auto 1fr; gap: 3px 12px; align-items: center; padding: 12px; border-radius: 16px 16px 8px 8px;
  border: 1px solid rgba(var(--accent), .45); background: rgba(var(--accent), .07); }
.card .face { grid-row: span 2; width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; overflow: hidden;
  background: var(--c, rgba(var(--ink), .2)); color: rgb(var(--glass)); font-weight: 700; font-size: 1.5em; }
.card .face canvas { width: 100%; height: 100%; display: block; }
.card h3 { margin: 0; font-size: 1.15em; font-weight: 650; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; overflow-wrap: anywhere; }
.card .tag { font-size: .76em; font-weight: 500; padding: 1px 8px; border-radius: 999px; border: 1px solid rgba(var(--ink), .3); color: rgba(var(--ink), .75); white-space: nowrap; }
.card .tag.proven { border-color: rgba(var(--accent), .8); color: rgb(var(--accent)); }
.card .keyline { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; color: rgba(var(--ink), .7); font-size: .9em; }
.card .keyline button { padding: 2px 10px; border-radius: 7px; border: 1px solid rgba(var(--ink), .25); color: rgb(var(--ink)); }
.card .keyline button:hover { border-color: rgb(var(--accent)); color: rgb(var(--accent)); }
.card blockquote { grid-column: 1 / -1; margin: 7px 0 0; padding: 1px 0 1px 10px; border-left: 2px solid rgba(var(--accent), .6); overflow-wrap: anywhere; }
.card .now { grid-column: 1 / -1; margin: 5px 0 0; font-size: .9em; color: rgb(var(--accent)); }

.note { margin: 0; padding: 4px 12px 0 12px; color: rgba(var(--ink), .78); border-left: 2px solid rgba(var(--accent), .6); margin-left: 12px; font-size: .95em; }
.note:empty { display: none; }
.foot { display: flex; justify-content: flex-end; padding: 0 12px 12px; }
.close { min-height: 38px; padding: 0 14px; border-radius: 10px; border: 1px solid rgba(var(--ink), .22); }
.close:hover { border-color: rgb(var(--ink)); }

/* ---- quiet: one mark in a corner, and everything else behind it */
.quiet { position: absolute; pointer-events: auto; display: none; width: 44px; height: 48px; place-items: center; border-radius: 22px 22px 8px 8px; }
.quiet .mark { margin-bottom: 2px; }
.quiet:hover, .quiet[aria-expanded="true"] { border-color: rgb(var(--accent)); }
:host([data-presence="quiet"]) .quiet { display: grid; }
:host([data-presence="quiet"]) :is(.id, .menu, .hotbar, .target, .corner),
:host([data-presence="hidden"]) :is(.id, .menu, .hotbar, .target, .corner, .says) { display: none; }
:host([data-corner="top-left"]) .quiet { top: max(12px, env(safe-area-inset-top)); left: max(12px, env(safe-area-inset-left)); }
:host([data-corner="top-right"]) .quiet { top: max(12px, env(safe-area-inset-top)); right: max(12px, env(safe-area-inset-right)); }
:host([data-corner="bottom-left"]) .quiet { bottom: max(12px, env(safe-area-inset-bottom)); left: max(12px, env(safe-area-inset-left)); }
:host([data-corner="bottom-right"]) .quiet { bottom: max(12px, env(safe-area-inset-bottom)); right: max(12px, env(safe-area-inset-right)); }
/* With no hotbar under it, the sheet opens in the middle of the bottom edge, clear of the corners. */
:host(:not([data-presence="full"])) .sheet { bottom: max(72px, env(safe-area-inset-bottom)); }
:host(:not([data-presence="full"])) .says { bottom: max(72px, env(safe-area-inset-bottom)); }
/* Keys the world has switched off aren't advertised. */
:host(.no-menu-key) .menu kbd, :host(.no-hotbar-keys) :is(.key .num, .row kbd) { display: none; }

/* ---- one moment of motion: things arrive. Nothing loops. */
@keyframes say-in { from { opacity: 0; transform: translateX(-8px); } }
@keyframes chat-in { from { opacity: 0; transform: translateX(8px); } }
@keyframes rise { from { opacity: 0; transform: translateY(8px); } }
@keyframes unfold { from { clip-path: inset(100% 0 0 0 round 22px); opacity: .4; } to { clip-path: inset(0 0 0 0 round 22px); opacity: 1; } }
:host(.moving.arriving) .key { animation: rise .32s cubic-bezier(.2, .8, .2, 1) both; animation-delay: calc(var(--i) * 45ms + 120ms); }
:host(.moving.arriving) .id, :host(.moving.arriving) .menu { animation: rise .32s cubic-bezier(.2, .8, .2, 1) both; }
:host(.moving) .sheet:not([hidden]) { animation: unfold .24s cubic-bezier(.2, .8, .2, 1) both; }
:host(:not(.moving)) * { transition: none !important; animation: none !important; }

/* ---- a phone: the same things, closer together */
@media (max-width: 640px) {
  .id { max-width: calc(100vw - 86px); padding: 6px 10px 6px 8px; }
  .menu span, .menu kbd, .key .num { display: none; }
  .menu { padding: 0 10px; }
  .hotbar { gap: 4px; padding: 10px 8px 6px; }
  .key { width: 54px; }
  .key .arch { width: 46px; height: 46px; border-radius: 23px 23px 6px 6px; }
  .key .sill { width: 50px; }
  .key .name { font-size: .76em; }
  .sheet { bottom: calc(max(10px, env(safe-area-inset-bottom)) + 108px * var(--s)); }
  .says { bottom: calc(max(10px, env(safe-area-inset-bottom)) + 116px * var(--s)); }
  /* The chat is across the bottom, over the hotbar's shoulder, and no taller than half the screen. */
  .chat { left: 8px; right: 8px; width: auto; top: auto; max-height: 46vh; bottom: calc(max(10px, env(safe-area-inset-bottom)) + 108px * var(--s)); }
  .chat[data-state="peek"] { max-height: 30vh; }
}
/* A keyboard on the glass covers the bottom of the page: the place to write stands on top of it. */
:host(.keys-up) .chat[data-state="open"] { top: auto; bottom: calc(var(--kb, 0px) + 8px); max-height: calc(100vh - var(--kb, 0px) - 24px); }
@media (hover: none) { kbd { display: none; } }
`;
function icon(name) {
  if (!name) return null;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", ICONS[name]);
  svg.append(path);
  return svg;
}
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  for (const c of children) if (c) e.append(c);
  return e;
}
function mountHud(controls, opts = {}) {
  const host = document.createElement("nswp-hud");
  const root = host.attachShadow({ mode: "open" });
  let style = "";
  try {
    const sheet2 = new CSSStyleSheet();
    sheet2.replaceSync(CSS);
    root.adoptedStyleSheets = [sheet2];
  } catch {
    style = document.createElement("style");
    style.textContent = CSS;
  }
  const title = el("b");
  const address = el("span", { class: "mono" });
  const id = el("div", { class: "id glass" }, el("span", { class: "mark", "aria-hidden": "true" }), el("div", {}, title, address));
  const menu = el("button", { class: "menu glass", type: "button", "aria-haspopup": "dialog", "aria-expanded": "false" }, icon("menu"), el("span", {}, "Menu"), el("kbd", {}, "M"));
  const quiet = el("button", { class: "quiet glass", type: "button", "aria-label": "Menu", "aria-haspopup": "dialog", "aria-expanded": "false" }, el("span", { class: "mark", "aria-hidden": "true" }));
  const target = el("div", { class: "target glass", "aria-live": "polite" });
  const hotbar = el("nav", { class: "hotbar glass", "aria-label": "Controls" });
  const says = el("div", { class: "says", role: "status" });
  const tabs = el("div", { class: "tabs", role: "tablist" });
  const rows = el("div", { class: "rows" });
  const note = el("p", { class: "note" });
  const close = el("button", { class: "close", type: "button" }, "Close");
  const sheet = el("section", { class: "sheet glass", role: "dialog", "aria-label": "Menu", hidden: "" }, tabs, rows, note, el("div", { class: "foot" }, close));
  const chatTitle = el("b");
  const chatClose = el("button", { type: "button", "aria-label": "Put the chat away" }, icon("close"));
  const chatLines = el("ol", { "aria-live": "polite" });
  const chatEmpty = el("p", { class: "empty" }, "Nobody has written anything yet. What is written here goes to the people in this room, and is kept nowhere.");
  const chatField = el("input", { type: "text", autocomplete: "off", enterkeyhint: "send", "aria-label": "Write to the room", placeholder: "Write to the room" });
  const chatHint = el("p", { class: "hint", role: "status" });
  const chatForm = el("form", {}, chatField, el("button", { type: "submit" }, "Send"));
  const chat = el("section", { class: "chat", "aria-label": "Room chat", "data-state": "closed" }, el("div", { class: "frame glass" }, el("header", {}, chatTitle, chatClose), chatEmpty, chatLines, chatHint, chatForm));
  root.append(style, el("i", { class: "corner a", "aria-hidden": "true" }), el("i", { class: "corner b", "aria-hidden": "true" }), id, menu, quiet, says, chat, sheet, el("div", { class: "low" }, target, hotbar));
  (opts.parent ?? document.body).append(host);
  let open = false;
  let section = "";
  let chose = false;
  let drawn = "";
  const press = (item) => controls.run(item.id);
  const drawCard = (card) => {
    const face = el("span", { class: "face", "aria-hidden": "true" }, [...card.title][0]?.toUpperCase() ?? "");
    if (card.color) face.style.setProperty("--c", card.color);
    if (card.picture) {
      void loadPicture(card.picture).then((drawn2) => {
        if (!drawn2 || !face.isConnected) return;
        const copy = document.createElement("canvas");
        copy.width = drawn2.width;
        copy.height = drawn2.height;
        copy.getContext("2d")?.drawImage(drawn2, 0, 0);
        face.replaceChildren(copy);
      });
    }
    const copyKey = card.copy ? el("button", { type: "button" }, "Copy key") : null;
    copyKey?.addEventListener("click", () => {
      void (navigator.clipboard?.writeText(card.copy) ?? Promise.reject(new Error("no clipboard"))).then(
        () => controls.say("Their key is copied, in full."),
        () => controls.say(`Their key: ${card.copy}`)
      );
    });
    return el(
      "div",
      { class: "card", role: "group", "aria-label": `About ${card.title}` },
      face,
      el("h3", {}, card.title, card.tag && el("span", { class: card.proven ? "tag proven" : "tag" }, card.tag)),
      el("div", { class: "keyline" }, el("span", { class: card.copy ? "mono" : "" }, card.sub), copyKey),
      card.text && el("blockquote", {}, card.text),
      card.now.length > 0 && el("p", { class: "now" }, card.now.join(", "))
    );
  };
  let chatState = "closed";
  let chatDrawn = "";
  let chatNewest = "";
  let peekTimer;
  let goingTimer;
  const PEEK_LINES = 4;
  const PEEK_MS = 9e3;
  const setChatState = (next) => {
    clearTimeout(peekTimer);
    clearTimeout(goingTimer);
    chat.classList.remove("going");
    chatState = next;
    if (next === "peek") {
      goingTimer = setTimeout(() => chat.classList.add("going"), PEEK_MS - 700);
      peekTimer = setTimeout(() => {
        if (chatState === "peek") setChatState("closed");
        draw();
      }, PEEK_MS);
    }
  };
  const drawChat = (view) => {
    const c = view.chat;
    if (!c.ready && chatState !== "closed") setChatState("closed");
    const newest = c.lines[c.lines.length - 1]?.key ?? "";
    if (c.ready && newest && newest !== chatNewest && chatState !== "open" && !c.lines[c.lines.length - 1].mine) setChatState("peek");
    chatNewest = newest;
    const now = JSON.stringify([chatState, c.version, c.ready]);
    if (now === chatDrawn) return;
    chatDrawn = now;
    chat.dataset.state = chatState;
    chatTitle.textContent = c.title;
    chatField.maxLength = c.limit;
    const lines = chatState === "peek" ? c.lines.slice(-PEEK_LINES) : c.lines;
    const atEnd = chatLines.scrollHeight - chatLines.scrollTop - chatLines.clientHeight < 40;
    chatLines.replaceChildren(
      ...lines.map((line) => {
        const li = el("li", { class: line.note ? "aside" : line.mine ? "mine" : "" }, !line.note && el("b", {}, line.mine ? "You" : line.who), line.note ? "" : " ", line.text);
        if (line.color && !line.mine) li.style.setProperty("--who", line.color);
        return li;
      })
    );
    chatEmpty.hidden = lines.length > 0;
    chatLines.hidden = lines.length === 0;
    if (chatState === "open" && (atEnd || lines[lines.length - 1]?.mine)) chatLines.scrollTop = chatLines.scrollHeight;
    if (chatState === "open") controls.chat.seen();
  };
  const setChatOpen = (next) => {
    if (next === (chatState === "open")) return;
    if (next) {
      if (!controls.chat.view().ready || host.hidden || controls.view().presence === "hidden") return;
      if (open) setOpen(false);
      chatCameFrom = focused();
      setChatState("open");
      chatHint.textContent = "";
      draw();
      chatLines.scrollTop = chatLines.scrollHeight;
      chatField.focus({ preventScroll: true });
      controls.signal("chatOpen");
      return;
    }
    setChatState("closed");
    draw();
    controls.signal("chatClose");
    const back = chatCameFrom;
    chatCameFrom = null;
    if (back?.isConnected && back !== document.body && !chat.contains(back) && getComputedStyle(back).display !== "none") back.focus({ preventScroll: true });
    else focused()?.blur();
  };
  let chatCameFrom = null;
  chatClose.addEventListener("click", () => setChatOpen(false));
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatField.value;
    if (!text.trim()) return setChatOpen(false);
    const trouble = controls.chat.send(text);
    chatHint.textContent = trouble ?? "";
    if (!trouble) chatField.value = "";
    chatField.focus({ preventScroll: true });
  });
  chatField.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      setChatOpen(false);
    }
  });
  chatField.addEventListener("keypress", (e) => e.stopPropagation());
  const vv = typeof visualViewport === "undefined" ? null : visualViewport;
  const onViewport = () => {
    if (!vv) return;
    const covered = Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop));
    host.classList.toggle("keys-up", covered > 80 && chatState === "open");
    host.style.setProperty("--kb", `${covered}px`);
  };
  vv?.addEventListener("resize", onViewport);
  vv?.addEventListener("scroll", onViewport);
  const draw = () => {
    const view = controls.view();
    const t = view.theme;
    host.style.setProperty("--accent", rgb(t.accent));
    host.style.setProperty("--ink", rgb(t.ink));
    host.style.setProperty("--glass", rgb(t.glass));
    host.style.setProperty("--warn", rgb(t.warn));
    host.style.setProperty("--s", String(t.scale));
    host.classList.toggle("moving", t.motion);
    host.dataset.presence = view.presence;
    host.dataset.corner = view.corner;
    host.classList.toggle("no-menu-key", view.keys.menu === null);
    host.classList.toggle("no-hotbar-keys", !view.keys.hotbar);
    const key = menu.querySelector("kbd");
    if (key && view.keys.menu) key.textContent = view.keys.menu.toUpperCase();
    title.textContent = view.title;
    address.textContent = view.address;
    const shown = [view.target, ...view.detail].join("\n");
    if (target.dataset.shown !== shown) {
      target.dataset.shown = shown;
      target.classList.toggle("card", view.detail.length > 0);
      if (view.detail.length) target.replaceChildren(el("b", {}, view.target), ...view.detail.map((line) => el("span", {}, line)));
      else target.textContent = view.target;
    }
    drawChat(view);
    if (!view.sections.some((s) => s.id === section)) section = view.sections[0]?.id ?? "";
    const now = JSON.stringify([view.hotbar, view.sections, section, open, view.presence]);
    if (now === drawn) return;
    drawn = now;
    hotbar.replaceChildren(
      ...view.hotbar.map((item, i) => {
        const b = el(
          "button",
          { class: `key ${item.tone}`, type: "button", "aria-label": item.label, ...item.on === null ? {} : { "aria-pressed": String(item.on) } },
          el("span", { class: "arch" }, icon(item.icon ?? "door")),
          el("span", { class: "sill" }),
          el("span", { class: "name" }, item.short),
          el("kbd", { class: "num mono" }, item.key)
        );
        b.style.setProperty("--i", String(i));
        b.addEventListener("click", () => press(item));
        return b;
      })
    );
    hotbar.hidden = view.hotbar.length === 0;
    tabs.replaceChildren(
      ...view.sections.map((s) => {
        const b = el("button", { class: "tab", type: "button", role: "tab", "aria-selected": String(s.id === section) }, icon(s.icon), s.label);
        b.addEventListener("click", () => {
          section = s.id;
          chose = true;
          draw();
          tabs.querySelector('[aria-selected="true"]')?.focus();
        });
        return b;
      })
    );
    const current = view.sections.find((s) => s.id === section);
    const drawSwatch = (item) => {
      const b = el("button", { class: "swatch", type: "button", "aria-label": item.label, "aria-pressed": String(item.on === true) }, el("i"), el("u"), item.label);
      b.style.setProperty("--c", item.color);
      b.addEventListener("click", () => press(item));
      return b;
    };
    const swatches = (current?.items ?? []).filter((i) => i.kind === "swatch");
    rows.replaceChildren(
      current?.card ? drawCard(current.card) : "",
      swatches.length ? el("div", { class: "swatches" }, ...swatches.map(drawSwatch)) : "",
      ...(current?.items ?? []).filter((i) => i.kind !== "swatch").map((item) => {
        const b = el(
          "button",
          { class: `row ${item.tone}`, type: "button", ...item.on === null ? {} : { "aria-pressed": String(item.on) } },
          icon(item.icon),
          el("span", { class: "grow" }, item.label),
          item.on !== null && el("span", { class: "state" }, item.on ? "On" : "Off"),
          item.key ? el("kbd", { class: "mono" }, item.key) : null
        );
        b.addEventListener("click", () => press(item));
        return b;
      })
    );
    rows.hidden = !current?.items.length && !current?.card;
    note.textContent = current?.note ?? "";
    sheet.hidden = !open;
    menu.setAttribute("aria-expanded", String(open));
    quiet.setAttribute("aria-expanded", String(open));
  };
  const focused = () => {
    let at = document.activeElement;
    while (at?.shadowRoot?.activeElement) at = at.shadowRoot.activeElement;
    return at;
  };
  let cameFrom = null;
  const setOpen = (next, at) => {
    if (next && at) {
      section = at;
      chose = true;
      if (open) return void draw();
    }
    if (open === next) return;
    if (next) {
      if (chatState === "open") setChatOpen(false);
      cameFrom = focused();
      if (!chose) section = "";
    }
    open = next;
    controls.signal(open ? "menuOpen" : "menuClose");
    draw();
    if (open) return void tabs.querySelector('[aria-selected="true"]')?.focus();
    const back = cameFrom;
    cameFrom = null;
    if (back?.isConnected && back !== document.body && getComputedStyle(back).display !== "none") back.focus({ preventScroll: true });
    else focused()?.blur();
  };
  menu.addEventListener("click", () => setOpen(!open));
  quiet.addEventListener("click", () => setOpen(!open));
  close.addEventListener("click", () => setOpen(false));
  const onKey = (e) => {
    if (host.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    const at = e.composedPath()[0];
    if (at && (at.tagName === "INPUT" || at.tagName === "TEXTAREA" || at.isContentEditable)) return;
    if (e.key === "Escape" && open) return setOpen(false);
    const view = controls.view();
    if (view.keys.menu && e.key.toLowerCase() === view.keys.menu && view.presence !== "hidden") return setOpen(!open);
    if (view.keys.chat && view.chat.ready && view.presence !== "hidden" && !open && !e.repeat && (e.key.toLowerCase() === view.keys.chat || e.key === "Enter" && at?.tagName !== "BUTTON" && at?.tagName !== "A")) {
      e.preventDefault();
      return setChatOpen(true);
    }
    if (!view.keys.hotbar || view.presence !== "full") return;
    const item = view.hotbar.find((i) => i.key === e.key);
    if (item) press(item);
  };
  addEventListener("keydown", onKey);
  const onSummonKey = (e) => {
    if (e.code !== SUMMON_KEY || host.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    const at = e.composedPath()[0];
    if (at && (at.tagName === "INPUT" || at.tagName === "TEXTAREA" || at.isContentEditable)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!e.repeat) setOpen(!open);
  };
  const swallow = (e) => {
    if (e.code === SUMMON_KEY && !host.hidden && !e.ctrlKey && !e.metaKey && !e.altKey) e.stopImmediatePropagation();
  };
  const hold = createHoldWatch({
    onHeld: () => {
      if (!host.hidden) setOpen(!open);
    }
  });
  const onTouch = (e) => hold.touches([...e.touches].map((t) => ({ x: t.clientX, y: t.clientY })));
  const listening = { capture: true };
  const watching = { capture: true, passive: true };
  addEventListener("keydown", onSummonKey, listening);
  addEventListener("keyup", swallow, listening);
  for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"]) addEventListener(type, onTouch, watching);
  const stopSay = controls.onSay((text) => {
    const line = el("div", { class: "say glass" }, text);
    says.append(line);
    while (says.childElementCount > 3) says.firstElementChild?.remove();
    setTimeout(() => line.classList.add("going"), 3600);
    setTimeout(() => line.remove(), 4200);
  });
  const stop = controls.subscribe(draw);
  const stopAsking = controls.onSignal((name) => {
    if (name.startsWith("show:") && !host.hidden) setOpen(true, name.slice(5));
    if (name === "toggle:chat" && !host.hidden) setChatOpen(chatState !== "open");
  });
  const tick = setInterval(draw, 400);
  host.classList.add("arriving");
  setTimeout(() => host.classList.remove("arriving"), 1200);
  draw();
  return {
    element: host,
    get open() {
      return open;
    },
    setOpen,
    get chatOpen() {
      return chatState === "open";
    },
    setChatOpen,
    bounds() {
      if (host.hidden) return [];
      return [id, menu, quiet, hotbar, target, sheet, ...chatState === "open" ? [chat] : []].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0).map((r) => ({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }));
    },
    cover() {
      if (host.hidden || controls.presence !== "full") return { top: 0, bottom: 0 };
      const low = hotbar.getBoundingClientRect();
      const high = id.getBoundingClientRect();
      return { top: Math.round(high.bottom), bottom: Math.round(innerHeight - Math.min(low.top, target.getBoundingClientRect().top)) };
    },
    setHidden(hidden) {
      host.hidden = hidden;
      if (hidden) {
        setOpen(false);
        setChatOpen(false);
      }
    },
    remove() {
      clearInterval(tick);
      clearTimeout(peekTimer);
      clearTimeout(goingTimer);
      vv?.removeEventListener("resize", onViewport);
      vv?.removeEventListener("scroll", onViewport);
      stop();
      stopAsking();
      stopSay();
      removeEventListener("keydown", onKey);
      removeEventListener("keydown", onSummonKey, listening);
      removeEventListener("keyup", swallow, listening);
      for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"]) removeEventListener(type, onTouch, watching);
      hold.cancel();
      host.remove();
    }
  };
}
export {
  CHAT_KEY,
  DEFAULT_THEME,
  ICONS,
  PICTURES_KEY,
  PICTURE_LIMITS,
  SUMMON_HOLD,
  SUMMON_KEY,
  SUMMON_SLOP,
  UI_PRESETS,
  cleanTheme,
  createControls,
  createHeldButton,
  createHoldWatch,
  loadPicture,
  mountHud,
  onChatChange,
  onPicturesChange,
  resolveTheme,
  setShowsChat,
  setShowsPictures,
  showsChat,
  showsPictures
};
