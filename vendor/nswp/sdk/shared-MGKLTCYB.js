// packages/sdk/src/form.ts
var matches = (query) => {
  try {
    return typeof matchMedia === "function" && matchMedia(query).matches;
  } catch {
    return false;
  }
};
function deviceForms() {
  const touch = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0 || matches("(any-pointer: coarse)");
  const mouse = matches("(any-pointer: fine)");
  return { touch, mouse, main: matches("(pointer: fine)") ? "desk" : "touch" };
}
function formFor(said, device) {
  if (said === "touch" && device.touch) return "touch";
  if (said === "desk" && device.mouse) return "desk";
  return device.main;
}
var arrived;
var used;
var watching = false;
function arriveAs(form) {
  arrived = form;
  watch();
}
function startingForm() {
  return formFor(arrived, deviceForms());
}
function currentForm() {
  watch();
  return used ?? startingForm();
}
function usedForm() {
  watch();
  return used;
}
function watch() {
  if (watching || typeof addEventListener !== "function") return;
  watching = true;
  addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "touch") used = "touch";
      else if (e.pointerType === "mouse") used = "desk";
    },
    { capture: true, passive: true }
  );
}

// packages/sdk/src/settings.ts
import { cleanMenuSettings, cleanSettings } from "@nswp/core";
var arrived2 = {};
var parts = /* @__PURE__ */ new Map();
var takers = /* @__PURE__ */ new Map();
function arriveWith(settings) {
  arrived2 = cleanSettings(settings);
}
function arrivedSettings() {
  return arrived2;
}
function reportSettings(part, now, take) {
  parts.set(part, now);
  if (take) takers.set(part, take);
  else takers.delete(part);
  return () => {
    if (parts.get(part) !== now) return;
    parts.delete(part);
    takers.delete(part);
  };
}
function currentSettings() {
  let out = cleanSettings(arrived2);
  for (const now of parts.values()) {
    let said = {};
    try {
      said = cleanSettings(now());
    } catch {
    }
    out = { ...out, ...said, ...said.sound || out.sound ? { sound: { ...out.sound, ...said.sound } } : {} };
  }
  return cleanSettings(out);
}

// packages/sdk/src/client-frame.ts
var framed = () => {
  try {
    return typeof window !== "undefined" && window.parent !== window;
  } catch {
    return false;
  }
};
var copiedRefused = (copy, inFrame = framed()) => inFrame ? `What you copied can't be read in a world shown inside another page. Open this world by its own address, ${copy.charAt(0).toLowerCase()}${copy.slice(1)}, and press again.` : `What you copied couldn't be read here. ${copy}, allow this site to read what you copy, and press again.`;
var mayShareScreen = (inFrame = framed()) => {
  if (!inFrame) return true;
  try {
    const policy = document;
    const says = policy.permissionsPolicy?.allowsFeature ?? policy.featurePolicy?.allowsFeature;
    return typeof says === "function" ? says.call(policy.permissionsPolicy ?? policy.featurePolicy, "display-capture") === true : null;
  } catch {
    return null;
  }
};
var framedBy = () => {
  try {
    const above = framed() ? location.ancestorOrigins?.[0] : void 0;
    return above ? new URL(above).host : "";
  } catch {
    return "";
  }
};
var screenNotHere = (by = framedBy()) => {
  const named = `Sharing your screen isn't available in a world shown inside ${by}.`;
  return [by && named.length <= 120 ? named : "Sharing your screen isn't available in a world shown inside another page.", "Open this world by its own address."];
};
var holds = false;
var filled = false;
var menuSpoken = 0;
var saidHereAt = null;
var menuHearer = null;
var menuUnheard = [];
var met = false;
var watchers = /* @__PURE__ */ new Set();
var signInAt = null;
var panelOpen = false;
var panelFailed = false;
var panelWatchers = /* @__PURE__ */ new Set();
var menuPlace = null;
function setMenuPlace(fn) {
  menuPlace = fn;
}
var clientHoldsScreen = () => holds;
var clientScreenFilled = () => holds && filled;
function onClientScreen(fn) {
  watchers.add(fn);
  return () => void watchers.delete(fn);
}
var say = (words) => {
  try {
    window.parent.postMessage({ nswp: words.nswp, ...words }, "*");
  } catch {
  }
};
function askClientForScreen(fill) {
  if (framed()) say({ nswp: "screen", fill });
}
var clientSignsInAt = () => signInAt;
var clientPanelOpen = () => panelOpen;
function onClientSignIn(fn) {
  panelWatchers.add(fn);
  return () => void panelWatchers.delete(fn);
}
function askClientForSignIn(mode = "ask") {
  if (!framed() || !signInAt) return false;
  let menu = null;
  try {
    menu = menuPlace?.() ?? null;
  } catch {
  }
  say({ nswp: "sign-in", mode, ...menu ? { menu } : {} });
  return true;
}
var secureOrigin = (address) => {
  if (typeof address !== "string" || address.length > 200) return null;
  try {
    const u = new URL(address);
    return u.protocol === "https:" && u.origin === address.replace(/\/$/, "") ? u.origin : null;
  } catch {
    return null;
  }
};
function meetClient() {
  if (met || !framed()) return;
  met = true;
  addEventListener("message", (e) => {
    if (e.source !== window.parent) return;
    const said = e.data;
    if (!said || typeof said !== "object") return;
    if (said.nswp === "menu") {
      if (menuHearer) menuHearer(said);
      else if (menuSpoken && menuUnheard.length < 32) menuUnheard.push(said);
      return;
    }
    if (said.nswp === "sign-in" && typeof said.open === "boolean") {
      const failed = !said.open && said.failed === true;
      if (failed) {
        panelFailed = true;
        signInAt = null;
      }
      if (panelOpen === said.open && !failed) return;
      panelOpen = said.open;
      for (const fn of panelWatchers) fn(panelOpen, failed, !said.open && said.allowed === true);
      if (failed) for (const fn of watchers) fn();
      return;
    }
    if (said.nswp !== "screen" || typeof said.holds !== "boolean") return;
    const was = `${holds}${filled}${signInAt}`;
    holds = said.holds;
    filled = said.filled === true;
    if (said.signIn !== void 0 && !panelFailed) signInAt = secureOrigin(said.signIn);
    if (was !== `${holds}${filled}${signInAt}`) for (const fn of watchers) fn();
  });
  let at = "/";
  try {
    at = `${location.pathname}${location.search}`.slice(0, 300);
  } catch {
  }
  const hello = () => {
    saidHereAt = performance.now();
    say({ nswp: "here", at, ...menuSpoken ? { menu: menuSpoken } : {} });
  };
  if (typeof queueMicrotask === "function") queueMicrotask(hello);
  else hello();
}
meetClient();
var saver = null;
var making = () => saver?.making?.();
var handUp = (file) => saver?.handUp(file) ?? false;
var savesWait = () => saver?.waits() ?? false;

// packages/sdk/src/ui/fullscreen.ts
var resumed = false;
var waiting = false;
var FULL_KEY = "nswp:full";
var prefers = false;
var keepFull = (on) => {
  prefers = on;
  try {
    if (on) localStorage.setItem(FULL_KEY, "1");
    else localStorage.removeItem(FULL_KEY);
  } catch {
  }
};
var prefersFullscreen = () => prefers;
var held = false;
var holdFullscreen = (on) => {
  held = on;
};
function resumeFullscreen(presenting = () => false) {
  if (resumed || typeof document === "undefined") return;
  resumed = true;
  const came = arrivedSettings().full;
  let kept = false;
  try {
    kept = localStorage.getItem(FULL_KEY) === "1";
  } catch {
  }
  if (came === void 0) prefers = kept;
  else keepFull(came);
  reportSettings("screen", () => ({ full: prefers }));
  meetClient();
  const mayAsk = framed();
  waiting = prefers && (document.fullscreenEnabled && !document.fullscreenElement || mayAsk);
  if (!waiting) return;
  const presses = ["keydown", "pointerdown", "pointerup", "touchend"];
  const stop = () => {
    waiting = false;
    for (const type of presses) removeEventListener(type, onPress, true);
    document.removeEventListener("fullscreenchange", onChange);
    forget();
  };
  const onChange = () => {
    if (document.fullscreenElement || clientScreenFilled()) stop();
  };
  const forget = onClientScreen(onChange);
  const onPress = (e) => {
    if (e.code === "Escape" || held || presenting() || document.fullscreenElement) return;
    if (clientHoldsScreen()) return void (clientScreenFilled() ? stop() : askClientForScreen(true));
    if (!document.fullscreenEnabled) return;
    void document.documentElement.requestFullscreen().then(stop, () => {
    });
  };
  for (const type of presses) addEventListener(type, onPress, true);
  document.addEventListener("fullscreenchange", onChange);
  onChange();
}
var isFilled = () => clientHoldsScreen() ? clientScreenFilled() : !!document.fullscreenElement;
var canFill = () => clientHoldsScreen() || document.fullscreenEnabled;
var fullscreenWaiting = () => waiting && canFill() && !isFilled();
function fullscreenAction(controls, presenting) {
  resumeFullscreen(presenting);
  presentingNow = presenting;
  watchEscape();
  setTimeout(() => {
    if (waiting && !held && !presenting() && canFill() && !isFilled()) controls.say("Press any key, or click, to fill the screen again.");
  }, 600);
  onClientScreen(() => controls.setTarget(""));
  return {
    id: "fullscreen",
    section: "view",
    icon: "full",
    on: () => prefers,
    // Not every browser lets a page fill the screen (a phone's often won't), and a headset already does.
    hidden: () => !canFill() || presenting(),
    // It says what they prefer, in every world, and whether the screen is filled just now.
    label: () => !prefers ? "Fullscreen: off" : isFilled() ? "Fullscreen: on, in every world" : "Fullscreen: on, in every world. Press to fill the screen again",
    act: async () => {
      const fill = !isFilled();
      if (!fill) keepFull(false);
      if (clientHoldsScreen()) {
        if (fill) keepFull(true);
        askClientForScreen(fill);
        return void controls.setTarget("");
      }
      try {
        if (fill) {
          await document.documentElement.requestFullscreen();
          keepFull(true);
        } else await leaveFullscreen();
      } catch {
        controls.say("This browser wouldn't go fullscreen.");
      }
      controls.setTarget("");
    }
  };
}
var keyboard = () => typeof navigator === "undefined" ? void 0 : navigator.keyboard;
var holding = false;
var leaving = false;
var watching2 = false;
var leftByBrowser = /* @__PURE__ */ new Set();
function onBrowserLeftFullscreen(fn) {
  leftByBrowser.add(fn);
  return () => void leftByBrowser.delete(fn);
}
function watchEscape() {
  if (watching2 || typeof document === "undefined") return;
  watching2 = true;
  let wasFilled = !!document.fullscreenElement;
  const onChange = () => {
    const filled2 = !!document.fullscreenElement;
    if (filled2) {
      holding = false;
      try {
        const asked = keyboard()?.lock?.(["Escape"]);
        if (asked) void asked.then(() => holding = !!document.fullscreenElement, () => holding = false);
      } catch {
      }
    } else {
      holding = false;
      try {
        keyboard()?.unlock?.();
      } catch {
      }
      if (wasFilled && !leaving) for (const fn of [...leftByBrowser]) fn();
      leaving = false;
    }
    wasFilled = filled2;
  };
  document.addEventListener("fullscreenchange", onChange);
}
var escapeHeld = () => holding && typeof document !== "undefined" && !!document.fullscreenElement;
function escapeDoes(state) {
  if (state.menuOpen) return state.held ? "leave-fullscreen" : "close-menu";
  return state.held ? "open-menu" : "nothing";
}
async function leaveFullscreen() {
  if (typeof document === "undefined" || !document.fullscreenElement) return;
  leaving = true;
  try {
    await document.exitFullscreen();
  } catch {
    leaving = false;
  }
}
var presentingNow = () => false;
var fullscreenButton = {
  shown() {
    if (typeof document === "undefined" || presentingNow()) return false;
    return canFill() && !isFilled() && currentForm() === "desk";
  },
  label: "Full screen",
  async press(controls) {
    if (clientHoldsScreen()) {
      keepFull(true);
      askClientForScreen(true);
      return;
    }
    try {
      await document.documentElement.requestFullscreen();
      keepFull(true);
    } catch {
      controls?.say("This browser wouldn't go fullscreen.");
    }
  }
};

// packages/sdk/src/relay-book.ts
import { DISCOVERY, DISCOVERY_RELAYS, learnRelays, pickDiscovered, pickRelays, publishEvent, queryRelays, RELAY_DISCOVERY_KIND, WRAP_KIND } from "@nswp/core";
var KEY = "nswp:relays";
var notes = null;
var read = () => {
  if (notes) return notes;
  try {
    const kept = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "{}");
    notes = kept && typeof kept === "object" && !Array.isArray(kept) ? kept : {};
  } catch {
    notes = {};
  }
  return notes;
};
function learnFrom(results, now = Date.now()) {
  notes = learnRelays(read(), results, now);
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(notes));
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
  if (took === 0 && maySendBackUp(tried, o) && event.kind !== WRAP_KIND) {
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
var mayAskBackUp = (relays, o) => backup && relays.length > 0 && (!!o.query || typeof document !== "undefined");
var maySendBackUp = (relays, o) => backup && relays.length > 0 && (o.publish ? !!o.query : !o.query && typeof document !== "undefined");
async function queryBacked(relays, filter, timeoutMs = 4e3, o = {}) {
  const query = o.query ?? queryRelays;
  const now = o.now ?? (() => Date.now());
  const got = await query(relays, filter, timeoutMs);
  learnFrom(got.relays, now());
  if (!mayAskBackUp(relays, o) || Object.values(got.relays).some((said) => said === "eose")) return got;
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
  if (!maySendBackUp(relays, o) || event.kind === WRAP_KIND || Object.values(sent.relays).some((said) => said === "ok")) return sent;
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

export {
  deviceForms,
  formFor,
  arriveAs,
  startingForm,
  currentForm,
  usedForm,
  arriveWith,
  arrivedSettings,
  reportSettings,
  currentSettings,
  copiedRefused,
  mayShareScreen,
  screenNotHere,
  setMenuPlace,
  onClientScreen,
  clientSignsInAt,
  clientPanelOpen,
  onClientSignIn,
  askClientForSignIn,
  making,
  handUp,
  savesWait,
  prefersFullscreen,
  holdFullscreen,
  resumeFullscreen,
  fullscreenWaiting,
  fullscreenAction,
  onBrowserLeftFullscreen,
  escapeHeld,
  escapeDoes,
  leaveFullscreen,
  fullscreenButton,
  learnFrom,
  relaysWell,
  sendWell,
  askWell,
  relayBackup,
  foundRelays,
  queryBacked,
  publishBacked
};
