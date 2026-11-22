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
import { cleanSettings } from "@nswp/core";
var arrived2 = {};
var parts = /* @__PURE__ */ new Map();
function arriveWith(settings) {
  arrived2 = cleanSettings(settings);
}
function arrivedSettings() {
  return arrived2;
}
function reportSettings(part, now) {
  parts.set(part, now);
  return () => {
    if (parts.get(part) === now) parts.delete(part);
  };
}
function currentSettings() {
  let out = { ...arrived2 };
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
  setMenuPlace,
  onClientScreen,
  clientSignsInAt,
  clientPanelOpen,
  onClientSignIn,
  askClientForSignIn,
  prefersFullscreen,
  holdFullscreen,
  resumeFullscreen,
  fullscreenWaiting,
  fullscreenAction,
  onBrowserLeftFullscreen,
  escapeHeld,
  escapeDoes,
  leaveFullscreen,
  fullscreenButton
};
