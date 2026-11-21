// packages/sdk/src/settings.ts
import { cleanSettings } from "@nswp/core";
var arrived = {};
var parts = /* @__PURE__ */ new Map();
function arriveWith(settings) {
  arrived = cleanSettings(settings);
}
function arrivedSettings() {
  return arrived;
}
function reportSettings(part, now) {
  parts.set(part, now);
  return () => {
    if (parts.get(part) === now) parts.delete(part);
  };
}
function currentSettings() {
  let out = { ...arrived };
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
var holds = false;
var filled = false;
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
  say({ nswp: "here", at });
}
meetClient();

export {
  arriveWith,
  arrivedSettings,
  reportSettings,
  currentSettings,
  framed,
  setMenuPlace,
  clientHoldsScreen,
  clientScreenFilled,
  onClientScreen,
  askClientForScreen,
  clientSignsInAt,
  clientPanelOpen,
  onClientSignIn,
  askClientForSignIn,
  meetClient
};
