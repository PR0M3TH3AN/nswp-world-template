import {
  RoomSession,
  arriveAs,
  currentForm,
  resumeFullscreen,
  room,
  startingForm
} from "./shared-VSKXDUXV.js";
import {
  arriveWith,
  arrivedSettings,
  currentSettings,
  reportSettings
} from "./shared-Q3D4OUDA.js";
import "./shared-QLSLERQ3.js";

// packages/sdk/src/index.ts
import {
  arrivalParam,
  buildAirlockUrl,
  buildArrivalUrl,
  buildWayUrl,
  checkDestination,
  decodeArrival,
  localMap,
  stripArrivalParam,
  toLocal,
  verifyRoomPass
} from "@nswp/core";

// packages/sdk/src/bring.ts
import { readBrought } from "@nswp/core";
var PARAM = "nswp-bring";
var KEPT = "nswp:brought";
function tab() {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}
function somethingBrought() {
  try {
    return new URLSearchParams(location.hash.replace(/^#/, "")).has(PARAM) || !!tab()?.getItem(KEPT);
  } catch {
    return false;
  }
}
function takeBrought(now = Math.floor(Date.now() / 1e3)) {
  const store = tab();
  let text = null;
  let fresh = false;
  try {
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    text = params.get(PARAM);
    if (text !== null) {
      fresh = true;
      params.delete(PARAM);
      const rest = params.toString();
      history.replaceState(history.state, "", `${location.pathname}${location.search}${rest ? `#${rest}` : ""}`);
    }
  } catch {
  }
  text ??= store?.getItem(KEPT) ?? null;
  if (text === null) return null;
  const brought = readBrought(text, location.origin, now);
  if (!brought) {
    store?.removeItem(KEPT);
    return null;
  }
  try {
    store?.setItem(KEPT, text);
  } catch {
  }
  return { ...brought, immersive: fresh && brought.immersive, fresh };
}
function watchBrought() {
  addEventListener("hashchange", () => {
    try {
      if (!new URLSearchParams(location.hash.replace(/^#/, "")).has(PARAM)) return;
    } catch {
      return;
    }
    takeBrought();
    location.reload();
  });
}
function dropBrought() {
  tab()?.removeItem(KEPT);
}

// packages/sdk/src/index.ts
var RETURN_KEY = "nswp:return-airlock";
var LOOK_KEY = "nswp:look";
var PASS_KEY = "nswp:pass";
var HOME_KEY = "nswp:at-home";
var defaultAirlock;
var cached;
function configure(opts) {
  if (opts.defaultAirlock !== void 0) {
    const chk = checkDestination(opts.defaultAirlock);
    if (!chk.ok) throw new Error(`nswp-sdk: defaultAirlock must be an https URL (${chk.error.code})`);
    defaultAirlock = chk.value.url;
  }
}
function session() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
var arrival = {
  /**
   * Read the arrival context once, then remove it from the URL so it doesn't
   * linger in history or reach third-party scripts. Call this before loading
   * any third-party code. Later calls return the same result.
   */
  read() {
    if (cached) return cached;
    void localMap();
    const raw = arrivalParam(location.hash);
    if (!raw) {
      cached = { context: null, warnings: [] };
      arriveAs(void 0);
      return cached;
    }
    history.replaceState(history.state, "", `${location.pathname}${location.search}${stripArrivalParam(location.hash)}`);
    const r = decodeArrival(raw);
    cached = r.ok ? { context: r.value, warnings: r.warnings } : { context: null, warnings: [...r.errors, ...r.warnings] };
    arriveAs(cached.context?.form);
    arriveWith(cached.context?.settings);
    resumeFullscreen();
    try {
      if (cached.context?.home) session()?.setItem(HOME_KEY, "1");
      else if (cached.context) session()?.removeItem(HOME_KEY);
    } catch {
    }
    if (cached.context?.airlock) {
      try {
        session()?.setItem(RETURN_KEY, cached.context.airlock);
      } catch {
      }
    }
    if (cached.context) {
      try {
        if (cached.context.look) session()?.setItem(LOOK_KEY, cached.context.look);
        else session()?.removeItem(LOOK_KEY);
        const { pass, sessionKey } = cached.context;
        if (pass && sessionKey && verifyRoomPass(pass, { origin: location.origin }).ok) session()?.setItem(PASS_KEY, JSON.stringify({ pass, sessionKey }));
        else session()?.removeItem(PASS_KEY);
      } catch {
      }
    }
    return cached;
  },
  /**
   * The look this visitor arrived wearing, in its inline form (spec §4.2), or
   * undefined if they came plain. Hand it to a room so others see them as
   * they chose to be seen. Kept for this tab's session only.
   */
  look() {
    try {
      return session()?.getItem(LOOK_KEY) ?? void 0;
    } catch {
      return void 0;
    }
  },
  /**
   * Who this visitor chose to be here, if they came by name
   * (protocol/10-identity.md): their public key, the name on their pass, and
   * the pass and session key to hand to a room. Checked against this site and
   * the clock each time; undefined for a guest, and once the pass has run out.
   * The world never sees their own key, only this throwaway one.
   */
  identity() {
    try {
      const kept = JSON.parse(session()?.getItem(PASS_KEY) ?? "null");
      if (!kept?.pass || typeof kept.sessionKey !== "string") return void 0;
      const checked = verifyRoomPass(kept.pass, { origin: location.origin });
      if (!checked.ok) {
        session()?.removeItem(PASS_KEY);
        return void 0;
      }
      return { pubkey: checked.value.pubkey, name: checked.value.name, pass: kept.pass, sessionKey: kept.sessionKey };
    } catch {
      return void 0;
    }
  },
  /** The Airlock this visitor came from, for this tab's session only. */
  /**
   * Whether this world is where the visitor starts: their own client brought
   * them home (NSWP-07). Remembered for the tab, so a refresh at home is
   * still at home. From here the way home leads nowhere new.
   */
  atHome() {
    try {
      return session()?.getItem(HOME_KEY) === "1";
    } catch {
      return false;
    }
  },
  returnAirlock() {
    try {
      return session()?.getItem(RETURN_KEY) ?? void 0;
    } catch {
      return void 0;
    }
  }
};
var carried = (opts, immersive) => ({
  immersive,
  ...opts.joined ? { joined: true, ...opts.mic ? { mic: true } : {} } : {},
  ...opts.blocked?.length ? { blocked: opts.blocked } : {},
  ...opts.moving === "intense" ? { moving: "intense" } : {},
  form: opts.form ?? currentForm(),
  // Their settings as they are now, so the next place needn't be set up again.
  settings: currentSettings()
});
var portal = {
  /** Which Airlock `go()` would use right now, or null for the built-in screen. */
  airlockFor(opts = {}) {
    return opts.airlock ?? arrival.returnAirlock() ?? defaultAirlock ?? null;
  },
  async go(dest, opts = {}) {
    if (!dest.naddr && !dest.url) throw new Error("nswp-sdk: portal destination needs an naddr or a url");
    if (dest.url) {
      const chk = checkDestination(dest.url);
      if (!chk.ok) throw new Error(`nswp-sdk: refusing portal destination (${chk.error.code})`);
    }
    const immersive = opts.immersive ?? !!opts.xrSession;
    if (opts.xrSession) {
      try {
        await opts.xrSession.end();
      } catch {
      }
    }
    if (typeof window.nswp?.navigate === "function") {
      window.nswp.navigate(dest);
      return;
    }
    const airlock = portal.airlockFor(opts);
    if (airlock) {
      location.assign(await toLocal(buildAirlockUrl(airlock, dest, carried(opts, immersive))));
      return;
    }
    showFallback(dest);
  },
  /**
   * Take the visitor back to their own client's start place (spec §6.3): the
   * Airlock they came through, opened with no destination. Returns false, and
   * does nothing, when there is no Airlock to go back to.
   */
  async home(opts = {}) {
    const airlock = portal.airlockFor(opts);
    if (!airlock) return false;
    const immersive = opts.immersive ?? !!opts.xrSession;
    if (opts.xrSession) {
      try {
        await opts.xrSession.end();
      } catch {
      }
    }
    location.assign(await toLocal(buildWayUrl(airlock, carried(opts, immersive))));
    return true;
  },
  /**
   * Take the visitor to their doors: their client's own place for them. For
   * most visitors that is where home is too. It is a different place for one
   * whose home is a world of their own, and a world that can be a home
   * offers this wherever it offers the way home (protocol/07-homes.md).
   */
  async doors(opts = {}) {
    const airlock = portal.airlockFor(opts);
    if (!airlock) return false;
    const immersive = opts.immersive ?? !!opts.xrSession;
    if (opts.xrSession) {
      try {
        await opts.xrSession.end();
      } catch {
      }
    }
    location.assign(await toLocal(buildWayUrl(airlock, { ...carried(opts, immersive), doors: true })));
    return true;
  }
};
function showFallback(dest) {
  const chk = dest.url ? checkDestination(dest.url) : null;
  const host = document.createElement("div");
  host.setAttribute("role", "dialog");
  host.setAttribute("aria-modal", "true");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(0,0,0,.72);font:16px/1.4 system-ui,sans-serif;color:#fff";
  const card = document.createElement("div");
  card.style.cssText = "background:#16181d;border:1px solid #333;border-radius:12px;padding:24px;max-width:min(92vw,480px)";
  const h = document.createElement("p");
  h.textContent = "This portal leads to:";
  h.style.margin = "0 0 8px";
  const where = document.createElement("p");
  where.style.cssText = "margin:0 0 16px;font-size:1.6em;word-break:break-all";
  if (chk?.ok) {
    const pre = document.createElement("span");
    pre.textContent = chk.value.hostPrefix;
    pre.style.opacity = "0.6";
    const dom = document.createElement("strong");
    dom.textContent = chk.value.registrableDomain ?? chk.value.hostname;
    where.append(pre, dom);
  } else where.textContent = "A world this page can't look up without an Airlock.";
  const row = document.createElement("div");
  row.style.cssText = "display:flex;gap:12px;justify-content:flex-end";
  const cancel = document.createElement("button");
  cancel.textContent = "Stay here";
  const go = document.createElement("button");
  go.textContent = "Continue";
  for (const b of [cancel, go]) b.style.cssText = "font:inherit;padding:10px 18px;border-radius:8px;border:1px solid #555;background:#23262d;color:#fff;cursor:pointer";
  go.style.background = "#2f6df6";
  go.disabled = !chk?.ok;
  cancel.onclick = () => host.remove();
  go.onclick = () => {
    if (chk?.ok) void toLocal(buildArrivalUrl(chk.value.url, dest.entryPoint ? { entry: dest.entryPoint } : {})).then((to) => location.assign(to));
  };
  row.append(cancel, go);
  card.append(h, where, row);
  host.append(card);
  document.body.append(host);
  go.focus();
}
export {
  RoomSession,
  arrival,
  arriveWith,
  arrivedSettings,
  configure,
  currentForm,
  currentSettings,
  dropBrought,
  portal,
  reportSettings,
  room,
  somethingBrought,
  startingForm,
  takeBrought,
  watchBrought
};
