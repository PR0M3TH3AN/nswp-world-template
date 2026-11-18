// packages/sdk/src/speech.ts
function toPcm16(samples, fromRate, toRate = 16e3) {
  if (!(fromRate > 0) || !(toRate > 0)) return new Int16Array(0);
  const step = fromRate / toRate;
  const out = new Int16Array(step <= 1 ? samples.length : Math.floor(samples.length / step));
  for (let i = 0; i < out.length; i++) {
    let sum = 0;
    let n = 0;
    const from = step <= 1 ? i : Math.floor(i * step);
    const to = step <= 1 ? i + 1 : Math.min(samples.length, Math.floor((i + 1) * step));
    for (let j = from; j < to; j++) {
      sum += samples[j];
      n++;
    }
    const v = Math.max(-1, Math.min(1, n ? sum / n : 0));
    out[i] = Math.round(v * 32767);
  }
  return out;
}
function cleanSpoken(text) {
  return text.normalize("NFC").replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g, " ").replace(/\s+/g, " ").trim().slice(0, 2e3);
}
var MIC_REFUSED = "The microphone isn't allowed here.";
async function recordVoice(maxSeconds = 90) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const reader = ctx.createScriptProcessor(4096, 1, 1);
  const quiet = ctx.createGain();
  quiet.gain.value = 0;
  const chunks = [];
  let length = 0;
  const most = maxSeconds * ctx.sampleRate;
  reader.onaudioprocess = (e) => {
    if (length >= most) return;
    const data = new Float32Array(e.inputBuffer.getChannelData(0));
    chunks.push(data);
    length += data.length;
  };
  source.connect(reader);
  reader.connect(quiet);
  quiet.connect(ctx.destination);
  const end = () => {
    reader.onaudioprocess = null;
    source.disconnect();
    reader.disconnect();
    for (const track of stream.getTracks()) track.stop();
    void ctx.close();
  };
  return {
    async stop() {
      const rate = ctx.sampleRate;
      end();
      const all = new Float32Array(length);
      let at = 0;
      for (const c of chunks) {
        all.set(c.subarray(0, Math.min(c.length, length - at)), at);
        at += c.length;
      }
      return toPcm16(all, rate);
    },
    cancel: end
  };
}
function computerVoice(name, transcribe) {
  return {
    name,
    private: true,
    hear(o) {
      let recording = null;
      let over = false;
      const started = recordVoice().then(
        (r) => {
          if (over) r.cancel();
          else recording = r;
        },
        () => {
          over = true;
          o.onEnd(MIC_REFUSED);
        }
      );
      return {
        stop() {
          if (over) return;
          over = true;
          void started.then(async () => {
            if (!recording) return;
            try {
              const text = cleanSpoken(await transcribe(await recording.stop(), o.lang));
              if (text) o.onText(text);
              o.onEnd(text ? null : "Nothing was heard.");
            } catch (e) {
              o.onEnd(e instanceof Error && e.message ? e.message : "Your computer couldn't make that out.");
            }
          });
        },
        cancel() {
          if (over) return;
          over = true;
          void started.then(() => recording?.cancel());
          o.onEnd(null);
        }
      };
    }
  };
}
var SORRY = {
  "not-allowed": MIC_REFUSED,
  "service-not-allowed": "This browser won't turn speech into text here.",
  network: "This browser couldn't reach the service it uses to turn speech into text.",
  "no-speech": "Nothing was heard.",
  "audio-capture": "No microphone was found.",
  "language-not-supported": "This browser can't turn that language into text."
};
async function browserVoice(lang, scope = globalThis) {
  const w = scope;
  const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Recognition) return null;
  let local = false;
  try {
    local = await Recognition.available?.({ langs: [lang], processLocally: true }) === "available";
  } catch {
  }
  return {
    name: local ? "this browser, on this device" : "this browser",
    private: local,
    hear(o) {
      const rec = new Recognition();
      rec.lang = o.lang;
      rec.continuous = true;
      rec.interimResults = false;
      if (local) rec.processLocally = true;
      let text = "";
      let why = null;
      let dropped = false;
      rec.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += `${e.results[i][0].transcript} `;
      };
      rec.onerror = (e) => {
        if (e.error !== "aborted") why = SORRY[e.error] ?? "This browser couldn't turn that into text.";
      };
      rec.onend = () => {
        const said = dropped ? "" : cleanSpoken(text);
        if (said) o.onText(said);
        o.onEnd(dropped ? null : why ?? (said ? null : "Nothing was heard."));
      };
      try {
        rec.start();
      } catch {
        o.onEnd("This browser couldn't start listening.");
      }
      return {
        stop: () => rec.stop(),
        cancel() {
          dropped = true;
          rec.abort();
        }
      };
    }
  };
}
var AGREED = "nswp:speech-may-leave";
function createVoice(o = {}) {
  const lang = o.lang ?? (typeof navigator === "undefined" ? "en" : navigator.language || "en");
  const sources = [];
  const heard = /* @__PURE__ */ new Set();
  let state = "idle";
  let hearing = null;
  let askedAt = 0;
  let storage = null;
  try {
    storage = o.storage === void 0 ? localStorage : o.storage;
  } catch {
  }
  const tell = () => heard.forEach((fn) => fn());
  const set = (next) => {
    state = next;
    tell();
  };
  const pick = () => sources.find((s) => s.private) ?? sources[0] ?? null;
  const add = (source) => {
    sources.push(source);
    tell();
    return () => {
      const at = sources.indexOf(source);
      if (at >= 0) sources.splice(at, 1);
      tell();
    };
  };
  void (o.browser ?? browserVoice(lang)).then((b) => b && add(b));
  return {
    add,
    get source() {
      return pick();
    },
    get state() {
      return state;
    },
    toggle({ onText, say }) {
      if (state === "listening") {
        set("working");
        say("Working out what you said\u2026");
        return hearing?.stop();
      }
      if (state === "working") return;
      const source = pick();
      if (!source) return say("Nothing here can turn speech into text.");
      if (!source.private) {
        let agreed = false;
        try {
          agreed = storage?.getItem(AGREED) === "yes";
        } catch {
        }
        if (!agreed && !(state === "asking" && Date.now() - askedAt < 2e4)) {
          askedAt = Date.now();
          set("asking");
          return say("Your browser turns speech into text itself, and may send your voice to its maker to do it. Press again to go ahead.");
        }
        try {
          storage?.setItem(AGREED, "yes");
        } catch {
        }
      }
      set("listening");
      say(`Listening, with ${source.name}. Press again when you have finished.`);
      hearing = source.hear({
        lang,
        onText,
        onEnd(why) {
          hearing = null;
          set("idle");
          say(why ?? "");
        }
      });
    },
    cancel() {
      const was = hearing;
      hearing = null;
      was?.cancel();
      if (state !== "idle") set("idle");
    },
    subscribe(fn) {
      heard.add(fn);
      return () => heard.delete(fn);
    }
  };
}

// packages/sdk/src/keys.ts
var chars = (row) => [...row].map((c) => ({ id: c, label: c, kind: "char", w: 1 }));
var key = (id, label, kind, w) => ({ id, label, kind, w });
function keyRows(layer, o = {}) {
  const bottom = [key("layer", layer === "letters" ? "123" : "ABC", "layer", 1.5), ...chars(","), key("space", "space", "space", 4.5), ...chars("."), key("enter", o.multiline ? "new line" : "done", "enter", 2)];
  const actions = [key("cancel", "Cancel", "cancel", 3), ...o.mic ? [key("mic", "Speak", "mic", 2.4)] : [], ...o.system ? [key("system", "Headset's keyboard", "system", 4)] : [], key("done", "Done", "done", 3)];
  if (layer === "letters") return [chars("qwertyuiop"), chars("asdfghjkl"), [key("shift", "shift", "shift", 1.5), ...chars("zxcvbnm"), key("back", "delete", "back", 1.5)], bottom, actions];
  return [chars("1234567890"), chars("-/:;()!?@"), [...chars(`'"_&#+=*`), key("back", "delete", "back", 2)], bottom, actions];
}
function placeKeys(layer, o = {}, rows = keyRows(layer, o)) {
  const gap = 0.012;
  const height = 1 / rows.length;
  return rows.flatMap((row, r) => {
    const total = row.reduce((sum, k) => sum + k.w, 0);
    const spread = r === rows.length - 1;
    const unit = spread ? 1 / total : 1 / 10;
    let x = spread ? 0 : (1 - total * unit) / 2;
    return row.map((k) => {
      const placed = { ...k, x: x + gap / 2, y: r * height + gap / 2, width: k.w * unit - gap, height: height - gap };
      x += k.w * unit;
      return placed;
    });
  });
}
function keyAt(keys, x, y) {
  return keys.find((k) => x >= k.x && x <= k.x + k.width && y >= k.y && y <= k.y + k.height) ?? null;
}
var TextEntry = class {
  value;
  shift;
  layer = "letters";
  multiline;
  maxLength;
  constructor(o = {}) {
    this.multiline = o.multiline ?? false;
    this.maxLength = o.maxLength ?? 2e3;
    this.value = [...o.value ?? ""].slice(0, this.maxLength).join("");
    this.shift = this.startsSentence() ? "once" : "off";
  }
  /** Whether the next letter begins a sentence, and so is a capital unless the visitor says otherwise. */
  startsSentence() {
    return /(^|[.!?]\s|\n)$/.test(this.value);
  }
  /** Add text as it is: from a real keyboard, or pasted. */
  type(text) {
    const clean = this.multiline ? text.replace(/\r/g, "") : text.replace(/[\r\n]+/g, " ");
    this.value = [...this.value + clean].slice(0, this.maxLength).join("");
    if (this.shift !== "lock") this.shift = this.startsSentence() ? "once" : "off";
  }
  erase() {
    this.value = [...this.value].slice(0, -1).join("");
    if (this.shift !== "lock") this.shift = this.startsSentence() ? "once" : "off";
  }
  /** What a key shows now: a letter as a capital while shift is on. */
  label(k) {
    return k.kind === "char" && this.shift !== "off" ? k.label.toUpperCase() : k.label;
  }
  /** Press a key by its id. Returns what happened: still typing, finished, given up, or asked for the headset's own keyboard. */
  press(id, keys = keyRows(this.layer, { multiline: this.multiline, system: true }).flat()) {
    const k = keys.find((x) => x.id === id);
    if (!k) return "typing";
    switch (k.kind) {
      case "char": {
        const was = this.shift;
        this.type(was === "off" ? k.id : k.id.toUpperCase());
        if (was === "once") this.shift = this.startsSentence() ? "once" : "off";
        return "typing";
      }
      case "space":
        this.type(" ");
        return "typing";
      case "back":
        this.erase();
        return "typing";
      case "shift":
        this.shift = this.shift === "off" ? "once" : this.shift === "once" ? "lock" : "off";
        return "typing";
      case "layer":
        this.layer = this.layer === "letters" ? "symbols" : "letters";
        return "typing";
      case "enter":
        if (!this.multiline) return "done";
        this.type("\n");
        return "typing";
      case "done":
        return "done";
      case "cancel":
        return "cancel";
      case "system":
        return "system";
      case "mic":
        return "mic";
      default:
        return "typing";
    }
  }
};

// packages/sdk/src/term-keys.ts
var ESC = "\x1B";
function ctrlCode(ch) {
  if (/^[a-zA-Z]$/.test(ch)) return String.fromCharCode(ch.toUpperCase().charCodeAt(0) - 64);
  const others = { "@": 0, " ": 0, "[": 27, "\\": 28, "]": 29, "^": 30, _: 31, "?": 127 };
  return ch in others ? String.fromCharCode(others[ch]) : ch;
}
var NAMED = {
  Enter: "\r",
  Backspace: "\x7F",
  Tab: "	",
  Escape: ESC,
  ArrowUp: `${ESC}[A`,
  ArrowDown: `${ESC}[B`,
  ArrowRight: `${ESC}[C`,
  ArrowLeft: `${ESC}[D`,
  Home: `${ESC}[H`,
  End: `${ESC}[F`,
  Insert: `${ESC}[2~`,
  Delete: `${ESC}[3~`,
  PageUp: `${ESC}[5~`,
  PageDown: `${ESC}[6~`,
  F1: `${ESC}OP`,
  F2: `${ESC}OQ`,
  F3: `${ESC}OR`,
  F4: `${ESC}OS`
};
function keyBytes(e) {
  if (e.metaKey) return null;
  if (e.ctrlKey && e.shiftKey && /^[cv]$/i.test(e.key)) return null;
  if (e.ctrlKey && !e.altKey && /^v$/i.test(e.key)) return null;
  if (e.key === "Tab" && e.shiftKey) return `${ESC}[Z`;
  const named = NAMED[e.key];
  if (named !== void 0) return e.altKey ? ESC + named : named;
  if ([...e.key].length !== 1) return null;
  const ch = e.ctrlKey ? ctrlCode(e.key) : e.key;
  return e.altKey ? ESC + ch : ch;
}
function forApplication(bytes, applicationCursor) {
  return applicationCursor ? bytes.replace(/^\x1b\[([ABCDHF])$/, `${ESC}O$1`) : bytes;
}
function pasteBytes(text, bracketed) {
  const clean = text.replace(/\r?\n/g, "\r");
  return bracketed ? `${ESC}[200~${clean.replace(/\x1b\[20[01]~/g, "")}${ESC}[201~` : clean;
}
var chars2 = (row) => [...row].map((c) => ({ id: c, label: c, kind: "char", w: 1 }));
var key2 = (id, label, kind, w) => ({ id, label, kind, w });
function liveRows(layer, o = {}) {
  const top = [key2("esc", "esc", "esc", 1.4), key2("tab", "tab", "tab", 1.4), key2("ctrl", "ctrl", "ctrl", 1.4), key2("left", "\u2190", "left", 1), key2("down", "\u2193", "down", 1), key2("up", "\u2191", "up", 1), key2("right", "\u2192", "right", 1), ...chars2("/-").map((k, i) => ({ ...k, w: i ? 0.8 : 1 }))];
  const next = layer === "letters" ? "123" : layer === "symbols" ? "#+=" : "abc";
  const bottom = [key2("layer", next, "layer", 1.5), ...chars2(","), key2("space", "space", "space", 4.5), ...chars2("."), key2("enter", "enter", "enter", 2)];
  const away = o.mic ? [key2("mic", "Speak", "mic", 3), key2("close", "Put the keyboard away", "close", 7)] : [key2("close", "Put the keyboard away", "close", 10)];
  if (layer === "letters") return [top, ...keyRows("letters").slice(0, 3), bottom, away];
  if (layer === "symbols") return [top, chars2("1234567890"), chars2(`:;()$&@"'_`), [...chars2("|~<>{}[]\\"), key2("back", "del", "back", 1)], bottom, away];
  const pages = [key2("pgup", "page up", "pgup", 2.5), key2("pgdn", "page down", "pgdn", 2.5), key2("home", "home", "home", 1.5), key2("end", "end", "end", 1.5), key2("back", "delete", "back", 2)];
  return [top, chars2("!?`#+=*%^"), pages, bottom, away];
}
function placeLiveKeys(layer, o = {}) {
  return placeKeys("letters", {}, liveRows(layer, o));
}
var LiveKeys = class {
  shift = "off";
  /** Ctrl is pressed first, then the letter: there is one pointer, not ten fingers. */
  ctrl = false;
  layer = "letters";
  /** Whether a key should be drawn lit. */
  lit(k) {
    return k.kind === "shift" && this.shift !== "off" || k.kind === "ctrl" && this.ctrl;
  }
  label(k) {
    return k.kind === "char" && this.shift !== "off" ? k.label.toUpperCase() : k.label;
  }
  press(id, keys = liveRows(this.layer).flat()) {
    const k = keys.find((x) => x.id === id);
    if (!k) return null;
    const send = (bytes) => {
      const out = this.ctrl ? ctrlCode(bytes) : bytes;
      this.ctrl = false;
      return { send: out };
    };
    switch (k.kind) {
      case "char": {
        const ch = this.shift === "off" ? k.id : k.id.toUpperCase();
        if (this.shift === "once") this.shift = "off";
        return send(ch);
      }
      case "space":
        return send(" ");
      case "enter":
        return send("\r");
      case "back":
        return send("\x7F");
      case "tab":
        return send("	");
      case "esc":
        return send(ESC);
      case "up":
        return send(`${ESC}[A`);
      case "down":
        return send(`${ESC}[B`);
      case "right":
        return send(`${ESC}[C`);
      case "left":
        return send(`${ESC}[D`);
      case "pgup":
        return send(`${ESC}[5~`);
      case "pgdn":
        return send(`${ESC}[6~`);
      case "home":
        return send(`${ESC}[H`);
      case "end":
        return send(`${ESC}[F`);
      case "shift":
        this.shift = this.shift === "off" ? "once" : this.shift === "once" ? "lock" : "off";
        return null;
      case "ctrl":
        this.ctrl = !this.ctrl;
        return null;
      case "layer":
        this.layer = this.layer === "letters" ? "symbols" : this.layer === "symbols" ? "more" : "letters";
        return null;
      case "close":
        return { close: true };
      case "mic":
        return { mic: true };
      default:
        return null;
    }
  }
};

// packages/sdk/src/stay.ts
var finite = (n) => typeof n === "number" && Number.isFinite(n);
function cleanStood(input, now, maxAgeSec = 12 * 3600) {
  if (!input || typeof input !== "object") return null;
  const s = input;
  if (!finite(s.x) || !finite(s.z) || !finite(s.yaw) || !finite(s.at)) return null;
  if (Math.abs(s.x) > 1e4 || Math.abs(s.z) > 1e4) return null;
  if (s.at > now + 60 || now - s.at > maxAgeSec) return null;
  return { x: s.x, z: s.z, yaw: (s.yaw % 360 + 360) % 360, headset: s.headset === true, at: s.at };
}
function wasRefreshed() {
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    return nav?.type === "reload";
  } catch {
    return false;
  }
}
function createStay(o = {}) {
  const now = o.now ?? (() => Math.floor(Date.now() / 1e3));
  let storage = null;
  try {
    storage = o.storage === void 0 ? sessionStorage : o.storage;
  } catch {
  }
  const key3 = `nswp:stood:${o.name ?? (typeof location === "undefined" ? "" : location.pathname)}`;
  let before = null;
  if (o.refreshed ?? wasRefreshed()) {
    try {
      before = cleanStood(JSON.parse(storage?.getItem(key3) ?? "null"), now());
    } catch {
    }
  }
  return {
    before,
    keep(s) {
      const stood = cleanStood({ ...s, at: now() }, now());
      if (!stood) return;
      try {
        storage?.setItem(key3, JSON.stringify(stood));
      } catch {
      }
    },
    clear() {
      try {
        storage?.removeItem(key3);
      } catch {
      }
    }
  };
}

export {
  placeKeys,
  keyAt,
  TextEntry,
  toPcm16,
  recordVoice,
  computerVoice,
  browserVoice,
  createVoice,
  keyBytes,
  forApplication,
  pasteBytes,
  placeLiveKeys,
  LiveKeys,
  wasRefreshed,
  createStay
};
