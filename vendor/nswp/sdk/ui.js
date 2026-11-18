import {
  DEFAULT_THEME,
  ICONS,
  UI_PRESETS,
  cleanTheme,
  loadVisitorTheme,
  resolveTheme,
  rgb,
  saveVisitorTheme
} from "./shared-WXBVZMXQ.js";

// packages/sdk/src/ui/model.ts
var read = (t) => typeof t === "function" ? t() : t ?? "";
var STANDARD = [
  { id: "travel", label: "Travel", icon: "door" },
  { id: "room", label: "Room", icon: "room" },
  { id: "view", label: "View", icon: "vr" },
  { id: "look", label: "Look", icon: "look", note: "How these controls look to you. Kept in this browser, for this site." },
  { id: "help", label: "Help", icon: "help" }
];
function createControls(opts) {
  const sections = STANDARD.map((s) => ({ ...s }));
  for (const s of opts.sections ?? []) addSection(s);
  const actions = [];
  const listeners = /* @__PURE__ */ new Set();
  const sayers = /* @__PURE__ */ new Set();
  let visitor = loadVisitorTheme();
  let theme = resolveTheme(opts.theme, visitor);
  let target = "";
  const changed = () => {
    for (const fn of listeners) fn();
  };
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
    remove(id) {
      const i = actions.findIndex((x) => x.id === id);
      if (i !== -1) actions.splice(i, 1);
      changed();
    },
    addSection(s) {
      addSection(s);
      changed();
    },
    setTarget(text) {
      if (text === target) return;
      target = text;
      changed();
    },
    say(text) {
      for (const fn of sayers) fn(text);
    },
    run(id) {
      const a = actions.find((x) => x.id === id);
      if (!a || a.hidden?.()) return false;
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
      const showing = actions.filter((a) => !a.hidden?.());
      const bar = showing.filter((a) => a.hotbar).slice(0, 6);
      const item = (a) => {
        const slot = bar.indexOf(a);
        return { id: a.id, label: read(a.label), icon: (typeof a.icon === "function" ? a.icon() : a.icon) ?? null, on: a.on ? a.on() : null, tone: a.tone ?? "normal", key: slot === -1 ? "" : String(slot + 1), short: read(a.short) || read(a.label), kind: a.kind ?? "button", color: a.color ?? "" };
      };
      const known = new Set(sections.map((s) => s.id));
      const extra = [...new Set(showing.map((a) => a.section ?? "travel").filter((id) => !known.has(id)))].map((id) => ({ id, label: id }));
      return {
        title: opts.title,
        address: opts.address ?? "",
        target,
        sections: [...sections, ...extra].map((s) => ({ id: s.id, label: s.label, icon: s.icon ?? null, note: read(s.note), items: showing.filter((a) => (a.section ?? "travel") === s.id).map(item) })).filter((s) => s.items.length > 0 || s.note),
        hotbar: bar.map(item),
        theme
      };
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    onSay(fn) {
      sayers.add(fn);
      return () => sayers.delete(fn);
    }
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
:host { position: fixed; inset: 0; z-index: 20; pointer-events: none; display: block;
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
.note { margin: 0; padding: 4px 12px 0 12px; color: rgba(var(--ink), .78); border-left: 2px solid rgba(var(--accent), .6); margin-left: 12px; font-size: .95em; }
.note:empty { display: none; }
.foot { display: flex; justify-content: flex-end; padding: 0 12px 12px; }
.close { min-height: 38px; padding: 0 14px; border-radius: 10px; border: 1px solid rgba(var(--ink), .22); }
.close:hover { border-color: rgb(var(--ink)); }

/* ---- one moment of motion: things arrive. Nothing loops. */
@keyframes say-in { from { opacity: 0; transform: translateX(-8px); } }
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
}
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
  const target = el("div", { class: "target glass", "aria-live": "polite" });
  const hotbar = el("nav", { class: "hotbar glass", "aria-label": "Controls" });
  const says = el("div", { class: "says", role: "status" });
  const tabs = el("div", { class: "tabs", role: "tablist" });
  const rows = el("div", { class: "rows" });
  const note = el("p", { class: "note" });
  const close = el("button", { class: "close", type: "button" }, "Close");
  const sheet = el("section", { class: "sheet glass", role: "dialog", "aria-label": "Menu", hidden: "" }, tabs, rows, note, el("div", { class: "foot" }, close));
  root.append(style, el("i", { class: "corner a", "aria-hidden": "true" }), el("i", { class: "corner b", "aria-hidden": "true" }), id, menu, says, sheet, el("div", { class: "low" }, target, hotbar));
  (opts.parent ?? document.body).append(host);
  let open = false;
  let section = "";
  let drawn = "";
  const press = (item) => controls.run(item.id);
  const draw = () => {
    const view = controls.view();
    const t = view.theme;
    host.style.setProperty("--accent", rgb(t.accent));
    host.style.setProperty("--ink", rgb(t.ink));
    host.style.setProperty("--glass", rgb(t.glass));
    host.style.setProperty("--warn", rgb(t.warn));
    host.style.setProperty("--s", String(t.scale));
    host.classList.toggle("moving", t.motion);
    title.textContent = view.title;
    address.textContent = view.address;
    if (target.textContent !== view.target) target.textContent = view.target;
    if (!view.sections.some((s) => s.id === section)) section = view.sections[0]?.id ?? "";
    const now = JSON.stringify([view.hotbar, view.sections, section, open]);
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
    rows.hidden = !current?.items.length;
    note.textContent = current?.note ?? "";
    sheet.hidden = !open;
    menu.setAttribute("aria-expanded", String(open));
  };
  const setOpen = (next) => {
    if (open === next) return;
    open = next;
    draw();
    if (open) tabs.querySelector('[aria-selected="true"]')?.focus();
    else menu.focus();
  };
  menu.addEventListener("click", () => setOpen(!open));
  close.addEventListener("click", () => setOpen(false));
  const onKey = (e) => {
    if (host.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    const at = e.composedPath()[0];
    if (at && (at.tagName === "INPUT" || at.tagName === "TEXTAREA" || at.isContentEditable)) return;
    if (e.key === "Escape" && open) return setOpen(false);
    if (e.key === "m" || e.key === "M") return setOpen(!open);
    const item = controls.view().hotbar.find((i) => i.key === e.key);
    if (item) press(item);
  };
  addEventListener("keydown", onKey);
  const stopSay = controls.onSay((text) => {
    const line = el("div", { class: "say glass" }, text);
    says.append(line);
    while (says.childElementCount > 3) says.firstElementChild?.remove();
    setTimeout(() => line.classList.add("going"), 3600);
    setTimeout(() => line.remove(), 4200);
  });
  const stop = controls.subscribe(draw);
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
    cover() {
      if (host.hidden) return { top: 0, bottom: 0 };
      const low = hotbar.getBoundingClientRect();
      const high = id.getBoundingClientRect();
      return { top: Math.round(high.bottom), bottom: Math.round(innerHeight - Math.min(low.top, target.getBoundingClientRect().top)) };
    },
    setHidden(hidden) {
      host.hidden = hidden;
      if (hidden) setOpen(false);
    },
    remove() {
      clearInterval(tick);
      stop();
      stopSay();
      removeEventListener("keydown", onKey);
      host.remove();
    }
  };
}
export {
  DEFAULT_THEME,
  ICONS,
  UI_PRESETS,
  cleanTheme,
  createControls,
  mountHud,
  resolveTheme
};
