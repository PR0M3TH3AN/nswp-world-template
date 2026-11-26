import {
  CHAT_KEY,
  DEFAULT_THEME,
  FEED_LIMITS,
  ICONS,
  MARK,
  PICTURES_KEY,
  PICTURE_LIMITS,
  SUMMON_HOLD,
  SUMMON_KEY,
  SUMMON_SLOP,
  UI_PRESETS,
  addDoorControls,
  ago,
  cleanTheme,
  createControls,
  createHeldButton,
  createHoldWatch,
  loadPicture,
  markSvg,
  onChatChange,
  onPicturesChange,
  resolveTheme,
  rgb,
  sayStays,
  setShowsChat,
  setShowsPictures,
  showsChat,
  showsPictures,
  signInHere,
  vouchedWords
} from "./shared-KQGT7QY5.js";
import {
  askWell,
  escapeDoes,
  escapeHeld,
  foundRelays,
  fullscreenButton,
  learnFrom,
  leaveFullscreen,
  onBrowserLeftFullscreen,
  onClientSignIn,
  publishBacked,
  queryBacked,
  relayBackup,
  relaysWell,
  sendWell,
  setMenuPlace,
  startingForm
} from "./shared-2KCGFQ3G.js";
import "./shared-QLSLERQ3.js";

// packages/sdk/src/ui/hud.ts
import { MENU_LIMITS, MENU_SHOW_KEEP_MS, menuFileKind } from "@nswp/core";

// packages/sdk/src/ui/port.ts
function portHere(controls) {
  return {
    view: () => controls.view(),
    subscribe: (fn) => controls.subscribe(fn),
    run: (id, typed, file) => controls.run(id, typed, file),
    say: (text) => controls.say(text),
    onSay: (fn) => controls.onSay(fn),
    signal: (name) => controls.signal(name),
    onSignal: (fn) => controls.onSignal(fn),
    setPinned: (tab, pinned) => controls.setPinned(tab, pinned),
    get presence() {
      return controls.presence;
    },
    get theme() {
      return controls.theme;
    },
    get chat() {
      return controls.chat;
    },
    get feed() {
      return controls.feed;
    },
    get letters() {
      return controls.letters;
    }
  };
}

// packages/sdk/src/ui/sheet-box.ts
var sheets = /* @__PURE__ */ new WeakMap();
function keepSheet(menu, now) {
  sheets.set(menu, now);
}

// packages/sdk/src/ui/hud.ts
var T = MARK.tile;
var A = MARK.arch;
var L = MARK.sill;
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
.mark { width: ${A.w}px; height: ${A.h}px; border-radius: ${A.top}px ${A.top}px ${A.bottom}px ${A.bottom}px; flex: none; position: relative;
  background: linear-gradient(rgba(var(--accent), ${MARK.fill.top}), rgba(var(--accent), ${MARK.fill.foot})); box-shadow: 0 0 ${MARK.glow}px rgba(var(--accent), ${MARK.glowAlpha}); }
.mark::after { content: ""; position: absolute; left: -${L.over}px; right: -${L.over}px; bottom: -${L.below}px; height: ${L.h}px; background: rgb(var(--ink)); border-radius: ${L.h / 2}px; }
.id b { display: block; font-weight: 650; font-size: 1.12em; letter-spacing: .005em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.id .mono { display: block; font-size: .86em; color: rgba(var(--ink), .68); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ---- the menu button: top right */
.menu { position: absolute; top: max(12px, env(safe-area-inset-top)); right: max(12px, env(safe-area-inset-right));
  pointer-events: auto; display: grid; place-items: center; width: ${T.w}px; height: ${T.h}px; padding: 0; border-radius: ${T.top}px ${T.top}px ${T.bottom}px ${T.bottom}px; }
.menu .mark { margin-bottom: ${T.h - A.h - 2 * A.y}px; }
.menu:hover, .menu[aria-expanded="true"] { border-color: rgb(var(--accent)); }
/* The hint: on hover with a mouse, and nowhere else. Below the tile, or above it in a bottom corner; its own corner's side. */
.hint { display: none; position: absolute; top: calc(100% + 6px); right: 0; white-space: nowrap; pointer-events: none;
  padding: 4px 8px; border-radius: 7px; font-size: .82em; font-weight: 600; letter-spacing: .01em;
  background: rgba(var(--glass), .94); color: rgb(var(--ink)); border: 1px solid rgba(var(--ink), .14); }
@media (hover: hover) and (pointer: fine) { :is(.menu, .quiet):hover .hint { display: block; } }
:host([data-corner^="bottom"]) .quiet .hint { top: auto; bottom: calc(100% + 6px); }
:host([data-corner$="left"]) .quiet .hint { right: auto; left: 0; }
/* Fill the screen: small, top centre, on a desk while it isn't filled. */
.full { position: absolute; top: max(12px, env(safe-area-inset-top)); left: 50%; translate: -50% 0; pointer-events: auto;
  display: flex; align-items: center; gap: 6px; min-height: 32px; padding: 0 12px 0 9px; border-radius: 10px; font-size: .9em; }
.full svg { width: 16px; height: 16px; }
.full:hover, .full:focus-visible { border-color: rgb(var(--accent)); color: rgb(var(--accent)); }
.full[hidden] { display: none; }
kbd { font: inherit; font-size: .82em; min-width: 1.6em; padding: 1px 5px; text-align: center; border-radius: 5px;
  border: 1px solid rgba(var(--ink), .3); color: rgba(var(--ink), .75); }

/* ---- the bottom: what you point at, then the hotbar */
.low { position: absolute; left: 0; right: 0; bottom: max(10px, env(safe-area-inset-bottom)); display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 0 12px; }
.target { max-width: min(92vw, 640px); padding: 6px 14px; border-radius: 999px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.target:empty { visibility: hidden; }
/* Still loading, though they are in (controls.setLoading): the world's words, how far, and a line that fills. Above
   what is pointed at, and pressing nothing. */
.loading { position: relative; overflow: hidden; max-width: min(92vw, 520px); padding: 6px 16px 8px; border-radius: 999px;
  display: flex; gap: 10px; align-items: baseline; white-space: nowrap; font-size: .92em; }
.loading[hidden] { display: none; }
.loading .what { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.loading .much { flex: none; color: rgb(var(--accent)); font-variant-numeric: tabular-nums; }
.loading .fill { position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; transform-origin: left; transform: scaleX(var(--f, 0));
  background: rgb(var(--accent)); box-shadow: 0 0 8px rgb(var(--accent)); }
/* How far isn't known: a short light runs along the line. */
.loading.unknown .fill { width: 30%; transform: none; animation: loading-run 1.6s ease-in-out infinite; }
:host(:not(.moving)) .loading.unknown .fill { animation: none; width: 100%; opacity: .5; }
@keyframes loading-run { from { translate: -100% 0; } to { translate: 340% 0; } }
/* What is pointed at, with a few lines about it: a small card, always this size, never in the way of the thing itself. */
.target.card { max-width: min(92vw, 460px); padding: 10px 16px; border-radius: 14px; white-space: normal; text-align: left; display: grid; gap: 3px; }
.target.card b { font-weight: 650; }
.target.card span { opacity: 0.86; font-size: 0.93em; line-height: 1.35; }
.target.card span:last-child { opacity: 1; color: rgb(var(--accent)); }
/* The bar: as wide as its keys, and no wider than the screen. Wider than that (tabs pinned to it on a phone), the
   keys slide along it, with an arrow at each end like the menu's tabs. The arrows stand beside the keys, never over
   them, and while it is too wide both places are kept, so the keys don't jump as one comes and goes. */
.bar { pointer-events: auto; position: relative; display: flex; align-items: stretch; max-width: 100%; border-radius: 20px 20px 10px 10px; }
.bar[hidden] { display: none; }
.hotbar { display: flex; align-items: flex-start; justify-content: flex-start; gap: 10px; padding: 12px 14px 8px; min-width: 0;
  overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; }
.hotbar::-webkit-scrollbar { display: none; }
.bar .more { display: none; flex: none; width: 30px; place-items: center; font-size: 1.55em; line-height: 1;
  color: rgb(var(--accent)); text-shadow: 0 0 10px rgb(var(--accent)); }
.bar.over .more { display: grid; }
.bar .more.left { border-radius: 20px 0 0 10px; }
.bar .more.right { border-radius: 0 20px 10px 0; }
/* Nothing more that way: its place is kept, empty, and it takes no press. */
.bar .more.spent { visibility: hidden; pointer-events: none; }
.bar .more:hover { color: rgb(var(--ink)); }
.key { position: relative; flex: none; width: 62px; display: grid; justify-items: center; gap: 7px; text-align: center; }
/* Between the place's own keys and the tabs the visitor pinned: a line, so it is plain which are theirs. */
.hotbar .theirs { flex: none; align-self: stretch; width: 1px; margin: 2px 2px 8px; background: rgba(var(--ink), .2); }
.key.pin .arch { border-style: dashed; }
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
.say { padding: 8px 12px; border-radius: 4px 12px 12px 4px; border-left: 2px solid rgb(var(--accent)); }
/* Only a line newly said comes in. One that is moved with the others (below) is simply there. */
.say.coming { animation: say-in .22s ease-out both; }
.say.going { opacity: 0; transition: opacity .5s; }
/* While the menu is up they are in a strip of the sheet's own, between its rows and its foot: the sheet lies over
   where they otherwise stand on all but the widest screens, and a press in the menu is what most of them answer.
   A said line never lies over anything that can be pressed: not a row, not a tab, not the foot's buttons. So the
   strip is always there while the menu is up, one line high when nothing is said or what is said fits, and nothing
   in the sheet moves as a line comes or goes. One line shows at a time, the newest.
   Words too long for one line are shown whole, on up to four: what a visitor most needs to read is often long (that
   others can see they are recording, that pressing Buy again charges nothing). The strip grows for them and the
   sheet is kept the size it was (fitSays, below), so the room comes from the bottom of the rows' own scrolling
   area: no row moves, and the last of them are out of sight while the words show. A press on a line puts it away. */
.sheet > .says { position: static; display: block; flex: none; max-width: none; min-height: calc(1.35em + 18px); margin: 0 12px 8px; }
.sheet > .says.one { height: calc(1.35em + 18px); overflow: hidden; }
.sheet > .says .say { line-height: 1.35; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden; pointer-events: auto; cursor: pointer; }
.sheet > .says .say:not(:last-child) { display: none; }

/* ---- what the room writes: at the right-hand side. Put away, the newest lines pass by; open, a list and a place to write. */
.chat { position: absolute; right: max(12px, env(safe-area-inset-right)); top: calc(max(12px, env(safe-area-inset-top)) + 54px);
  bottom: calc(max(10px, env(safe-area-inset-bottom)) + 128px * var(--s)); width: min(340px, calc(100vw - 24px));
  display: flex; flex-direction: column; justify-content: flex-end; pointer-events: none; }
.chat[data-state="closed"] { display: none; }
.chat [hidden] { display: none !important; }
.chat .frame { display: flex; flex-direction: column; min-height: 0; max-height: 100%; }
.chat[data-state="open"] .frame { pointer-events: auto; border-radius: 14px 6px 6px 14px; border-right: 2px solid rgb(var(--accent)); overflow: hidden; }
.chat[data-state="peek"] .frame { background: none; border: 0; -webkit-backdrop-filter: none; backdrop-filter: none; }
.chat header { display: flex; align-items: center; gap: 8px; padding: 9px 8px 8px 14px; border-bottom: 1px solid rgba(var(--accent), .22); }
.chat header b { flex: 1; font-weight: 650; }
.chat .whose { margin: 0; padding: 8px 14px 0; font-size: .86em; color: rgba(var(--ink), .6); }
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
/* Three sides may be up at once: the strip slides under a finger sooner than run under the button that puts the panel away. */
.chat header .tabs2 { flex: 1; display: flex; gap: 4px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.chat header .tabs2::-webkit-scrollbar { display: none; }
.chat header .tabs2 .tab { flex: 0 0 auto; white-space: nowrap; }
.chat header .tab { width: auto; height: 30px; padding: 0 10px; font-weight: 650; white-space: nowrap; border-bottom: 2px solid transparent; border-radius: 8px 8px 0 0; }
.chat header .tab[aria-selected="true"] { color: rgb(var(--ink)); border-bottom-color: rgb(var(--accent)); }
.chat .lead, .chat .said { margin: 0; padding: 8px 14px 0; font-size: .9em; color: rgba(var(--ink), .7); }
.chat .said { padding: 0 12px 8px; }
.chat .said:empty { display: none; }
/* The feed reads the other way up from the chat: where to write is at the top, and the newest post under it. */
.chat[data-tab="feed"] form { order: 1; border-top: 0; flex-wrap: wrap; }
.chat[data-tab="feed"] form input { flex: 1 1 100%; min-height: 38px; }
.chat[data-tab="feed"] form button { margin-left: auto; min-height: 34px; font-weight: 650; }
.chat[data-tab="feed"] :is(.hint, .said) { order: 2; }
.chat[data-tab="feed"] :is(ol, .empty) { order: 3; border-top: 1px solid rgba(var(--accent), .22); }
.chat[data-tab="feed"] ol { align-content: start; gap: 0; padding: 0 14px; }
.chat li.post { padding: 10px 0; border-bottom: 1px solid rgba(var(--ink), .12); overflow-wrap: anywhere; }
.chat li.post:last-child { border-bottom: 0; }
.chat li.letter { white-space: pre-wrap; overflow-wrap: anywhere; }
.chat li.letter.sending { opacity: .6; }
.chat li.letter.failed small { color: rgb(var(--warn)); opacity: 1; }
.chat li.letter small, .chat li.post small { display: block; margin-top: 3px; font-size: .86em; color: rgba(var(--ink), .55); }
.chat li.post.failed small { color: rgb(var(--warn)); }
.chat li.post.sending, .chat li.post.removing { opacity: .7; }
.chat li.post .post-remove { font: inherit; color: rgba(var(--ink), .8); text-decoration: underline; text-underline-offset: 3px; padding: 6px 2px; margin: -6px 0; pointer-events: auto; }
.chat li.post .post-remove:hover { color: rgb(var(--warn)); }
.chat[data-state="peek"] :is(header, form, .hint, .empty, .lead, .said) { display: none; }
.chat[data-state="peek"] ol { padding: 0; overflow: hidden; justify-items: end; }
.chat[data-state="peek"] li { padding: 7px 12px; border-radius: 12px 4px 4px 12px; border-right: 2px solid rgb(var(--accent)); max-width: 100%;
  background: rgba(var(--glass), .7); -webkit-backdrop-filter: blur(12px) saturate(1.25); backdrop-filter: blur(12px) saturate(1.25); animation: chat-in .22s ease-out both; }
.chat[data-state="peek"].going { opacity: 0; transition: opacity .6s; }
:host([data-presence="hidden"]) .chat { display: none; }
:host(:not([data-bar])) .chat { bottom: max(72px, env(safe-area-inset-bottom)); }

/* ---- the sheet: everything else, by section */
.sheet { position: absolute; left: 50%; bottom: calc(max(10px, env(safe-area-inset-bottom)) + 122px * var(--s)); transform: translateX(-50%);
  width: min(480px, calc(100vw - 20px)); max-height: min(70vh, 640px); display: flex; flex-direction: column; pointer-events: auto;
  border-radius: 22px 22px 12px 12px; overflow: hidden; }
.sheet[hidden] { display: none; }
/* One size on every tab: what a short tab leaves is here, above the foot. A tab that isn't up is measured in a box nobody sees. */
.sheet > .room { flex: 1 1 0; min-height: 0; }
/* It stands beside the sheet and not in it, as wide as the sheet is, so that tabs can be measured while the sheet is down. */
.measure { position: absolute; left: 0; top: 0; width: min(480px, calc(100vw - 20px)); border: 1px solid transparent; visibility: hidden; pointer-events: none; }
.measure > .rows { overflow: visible; }
/* Everything outside the sheet while it is up: a press there closes the menu, and is nothing else. */
.outside { position: absolute; inset: 0; pointer-events: auto; background: none; }
.outside[hidden] { display: none; }
/* Where there is room, at a desk, the menu is larger: more of a list at once, and rows side by side. */
@media (min-width: 900px) and (min-height: 560px) {
  .sheet { width: min(780px, calc(100vw - 40px)); max-height: min(74vh, 780px); }
  .measure { width: min(780px, calc(100vw - 40px)); }
  .rows { grid-template-columns: 1fr 1fr; align-content: start; }
  .rows > .person, .rows > .swatches, .rows > .tiles, .rows > .row.primary { grid-column: 1 / -1; }
  .rows > .person.thing { grid-template-columns: 200px 1fr; grid-template-areas: "face about" "face acts"; grid-template-rows: auto 1fr; }
  .rows > .tiles { grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); }
}
.sheet::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2px; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(var(--accent)), transparent); box-shadow: 0 0 16px rgb(var(--accent)); }
.tabs { position: relative; display: flex; gap: 4px; padding: 12px 12px 0; overflow-x: auto; scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
/* There are more sections than fit: an arrow at the side they are on, over a fade, and it takes them there. */
.tabbar { position: relative; }
.tabbar .more { position: absolute; top: 2px; bottom: 0; width: 40px; display: grid; align-items: center; z-index: 1; font-size: 1.55em; line-height: 1;
  color: rgb(var(--accent)); text-shadow: 0 0 10px rgb(var(--accent)); }
.tabbar .more.left { left: 0; justify-items: start; padding-left: 9px; border-radius: 22px 0 0 0; background: linear-gradient(90deg, rgb(var(--glass)) 45%, rgba(var(--glass), 0)); }
.tabbar .more.right { right: 0; justify-items: end; padding-right: 9px; border-radius: 0 22px 0 0; background: linear-gradient(270deg, rgb(var(--glass)) 45%, rgba(var(--glass), 0)); }
.tabbar .more[hidden] { display: none; }
.tabbar .more:hover { color: rgb(var(--ink)); }
.tab { display: flex; align-items: center; gap: 7px; padding: 9px 13px 8px; border-radius: 14px 14px 0 0; color: rgba(var(--ink), .72); border-bottom: 2px solid transparent; white-space: nowrap; }
.tab:hover { color: rgb(var(--ink)); }
.tab[aria-selected="true"] { color: rgb(var(--accent)); background: rgba(var(--accent), .1); border-bottom-color: rgb(var(--accent)); }
/* Each row keeps its own height whatever room the list is given: when long words take room from the list's foot,
   the rows are scrolled out of sight there, and none is squeezed (a squeezed row moves every row under it). */
.rows { display: grid; gap: 6px; grid-auto-rows: max-content; padding: 12px; overflow-y: auto; border-top: 1px solid rgba(var(--accent), .22);
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
/* Things with pictures of themselves, side by side: what is in a bag. Each is a small plinth the thing stands on. */
.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; padding: 2px 0 4px; }
.tile { display: grid; grid-template-rows: auto auto; justify-items: center; gap: 4px; padding: 8px 6px 9px; border-radius: 14px 14px 8px 8px; text-align: center;
  border: 1px solid rgba(var(--ink), .12); background: radial-gradient(120% 90% at 50% 100%, rgba(var(--accent), .13), rgba(var(--ink), .03) 70%);
  font-size: .9em; line-height: 1.2; color: rgba(var(--ink), .85); transition: background .12s, border-color .12s, transform .12s; }
.tile .shown { width: 100%; aspect-ratio: 1; display: grid; place-items: center; font-weight: 700; font-size: 1.9em; color: rgba(var(--ink), .35); }
.tile canvas { width: 100%; height: 100%; display: block; }
.tile:hover { border-color: rgba(var(--accent), .7); transform: translateY(-2px); }
.tile[aria-pressed="true"] { border-color: rgb(var(--accent)); color: rgb(var(--ink)); box-shadow: 0 0 0 1px rgb(var(--accent)), 0 0 18px rgba(var(--accent), .35); }
.tile span { overflow-wrap: anywhere; }
/* A tile's mark, in its corner: the bag's says the thing is in your bag. Drawn in the accent, on the glass. */
.tile { position: relative; }
.tile .corner-mark { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 8px;
  background: rgba(var(--glass), .85); border: 1px solid rgba(var(--accent), .55); color: rgb(var(--accent)); }
.tile .corner-mark svg { width: 15px; height: 15px; }
/* Faint: not theirs yet. Greyed, and still pressable: it brightens under the pointer, as any tile does. */
.tile.faint { color: rgba(var(--ink), .55); background: rgba(var(--ink), .03); border-style: dashed; }
.tile.faint .shown { filter: grayscale(1); opacity: .5; }
.tile.faint:hover { color: rgba(var(--ink), .85); }
.tile.faint:hover .shown { opacity: .8; }
.row { display: flex; align-items: center; gap: 12px; min-height: 46px; padding: 8px 12px; border-radius: 10px; text-align: left;
  border: 1px solid rgba(var(--ink), .12); background: rgba(var(--ink), .03); transition: background .12s, border-color .12s; }
.row:hover { background: rgba(var(--accent), .13); border-color: rgba(var(--accent), .7); }
/* A line is read and not pressed: no edge, no hover, nothing that looks like a button. Lit is the accent; dark is dim. */
.line { grid-column: 1 / -1; display: flex; align-items: flex-start; gap: 12px; margin: 0; padding: 4px 12px; line-height: 1.35; color: rgba(var(--ink), .55); }
.line svg { flex: none; margin-top: 1px; opacity: .55; }
.line.on { color: rgb(var(--ink)); }
.line.on svg { opacity: 1; color: rgb(var(--accent)); }
/* The chat's pane and nothing else, for a world whose client has the menu. */
:host(.chat-only) :is(.corner, .id, .menu, .quiet, .as, .full, .says, .sheet, .low) { display: none !important; }
.row .grow { flex: 1; min-width: 0; }
/* A row typed into: a box and its button, and under them where what is typed goes. */
.field { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr auto; gap: 6px 8px; margin: 0; padding: 8px 12px; border-radius: 10px;
  border: 1px solid rgba(var(--ink), .12); background: rgba(var(--ink), .03); }
.field input { min-width: 0; min-height: 40px; padding: 6px 10px; border-radius: 8px; font: inherit; color: inherit;
  border: 1px solid rgba(var(--ink), .25); background: rgba(var(--glass), .6); }
.field input:focus-visible { outline: 2px solid rgb(var(--ink)); outline-offset: 2px; }
.field button { min-height: 40px; padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(var(--accent), .7); background: rgba(var(--accent), .13); }
.field .to { grid-column: 1 / -1; margin: 0; font-size: .86em; color: rgba(var(--ink), .6); }
/* A bar that is moved along: what it is of, the bar, and where it is in words. */
.slide { grid-column: 1 / -1; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 4px 12px; margin: 0; padding: 8px 12px;
  border-radius: 10px; border: 1px solid rgba(var(--ink), .12); background: rgba(var(--ink), .03); }
.slide.on { border-color: rgba(var(--accent), .5); }
.slide.on svg { color: rgb(var(--accent)); }
.slide .name { min-width: 0; grid-column: 2 / -1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.slide input { grid-column: 1 / 3; width: 100%; min-height: 28px; margin: 0; accent-color: rgb(var(--accent)); }
.slide input:focus-visible { outline: 2px solid rgb(var(--ink)); outline-offset: 2px; }
.slide .time { font-size: .86em; color: rgba(var(--ink), .7); white-space: nowrap; }
/* A row that takes a file: its button, and under it where the file goes. */
.takes { grid-column: 1 / -1; display: grid; gap: 4px; }
.takes .to { margin: 0; padding: 0 12px; font-size: .86em; color: rgba(var(--ink), .6); }
.row .state { font-size: .86em; color: rgba(var(--ink), .6); }
.row[aria-pressed="true"] { border-color: rgba(var(--accent), .8); }
.row[aria-pressed="true"] .state { color: rgb(var(--accent)); }
.row.warn { color: rgb(var(--warn)); }
.row.primary { background: rgba(var(--accent), .16); border-color: rgba(var(--accent), .75); }
/* Who a section is about: a face, a name, how they are known, and what they say of themselves, set apart as theirs. */
/* A person: the card at the head of a section. Its own name, so it is never taken for the card about what is pointed at. */
.person { display: grid; grid-template-columns: auto 1fr; gap: 3px 12px; align-items: center; padding: 12px; border-radius: 16px 16px 8px 8px;
  border: 1px solid rgba(var(--accent), .45); background: rgba(var(--accent), .07); }
.person .face { grid-row: span 2; width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; overflow: hidden;
  background: var(--c, rgba(var(--ink), .2)); color: rgb(var(--glass)); font-weight: 700; font-size: 1.5em; }
.person .face canvas { width: 100%; height: 100%; display: block; }
/* A card about a thing: the thing itself, large, on a lit plinth, where a person's card has a face. */
.person.thing { grid-template-columns: minmax(112px, 30%) 1fr; grid-template-areas: "face about" "acts acts"; align-items: start; gap: 10px 14px; }
.person.thing .about { grid-area: about; display: grid; gap: 5px; min-width: 0; align-content: start; }
.person.thing .about blockquote { margin: 3px 0 0; }
/* What to do with the thing: side by side where they fit, and one under another where they don't. */
.person.thing .acts { grid-area: acts; display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; align-content: start; min-width: 0; }
.person.thing .acts > .row { flex: 1 1 210px; min-width: 0; }
.person.thing .acts > .swatches { flex: 1 1 100%; }
.person.thing .face { grid-area: face; width: 100%; height: auto; aspect-ratio: 1; border-radius: 14px;
  background: radial-gradient(90% 70% at 50% 92%, rgba(var(--accent), .3), transparent 70%), rgba(var(--ink), .05); color: rgba(var(--ink), .4); }
.person h3 { margin: 0; font-size: 1.15em; font-weight: 650; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; overflow-wrap: anywhere; }
.person .tag { font-size: .76em; font-weight: 500; padding: 1px 8px; border-radius: 999px; border: 1px solid rgba(var(--ink), .3); color: rgba(var(--ink), .75); white-space: nowrap; }
.person .tag.proven { border-color: rgba(var(--accent), .8); color: rgb(var(--accent)); }
.person .keyline { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; color: rgba(var(--ink), .7); font-size: .9em; }
.person .keyline button { padding: 2px 10px; border-radius: 7px; border: 1px solid rgba(var(--ink), .25); color: rgb(var(--ink)); }
.person .keyline button:hover { border-color: rgb(var(--accent)); color: rgb(var(--accent)); }
.person blockquote { grid-column: 1 / -1; margin: 7px 0 0; padding: 1px 0 1px 10px; border-left: 2px solid rgba(var(--accent), .6); overflow-wrap: anywhere; }
.person .now { grid-column: 1 / -1; margin: 5px 0 0; font-size: .9em; color: rgb(var(--accent)); }

/* A world's part of a tab its client draws: the world's name over its rows, and before its words. */
.from { grid-column: 1 / -1; margin: 6px 0 0; padding: 0 12px; font-size: .82em; font-weight: 650; letter-spacing: .04em; text-transform: uppercase; color: rgba(var(--ink), .55); }
.note.said { border-left-color: rgba(var(--ink), .3); }
.note.said b { color: rgba(var(--ink), .9); margin-right: .45em; }
.note { margin: 0; padding: 4px 12px 0 12px; color: rgba(var(--ink), .78); border-left: 2px solid rgba(var(--accent), .6); margin-left: 12px; font-size: .95em; }
.note:empty { display: none; }
.foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 0 12px 12px; }
/* Keeping this tab on the bar: a quiet button, opposite Close. */
.pin-it { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; border-radius: 10px; border: 1px solid rgba(var(--ink), .22); color: rgba(var(--ink), .82); font-size: .93em; }
.pin-it svg { width: 16px; height: 16px; }
/* Its own display would otherwise show it while hidden; and with it away, Close stays where it was, at the right. */
.pin-it[hidden] { display: none; }
.foot .close { margin-left: auto; }
.pin-it:hover:not(:disabled), .pin-it:focus-visible { border-color: rgb(var(--accent)); color: rgb(var(--accent)); }
.pin-it[aria-pressed="true"] { border-color: rgba(var(--accent), .8); color: rgb(var(--accent)); background: rgba(var(--accent), .12); }
.pin-it:disabled { opacity: .5; cursor: default; }
.close { min-height: 38px; padding: 0 14px; border-radius: 10px; border: 1px solid rgba(var(--ink), .22); }
.close:hover { border-color: rgb(var(--ink)); }

/* ---- quiet: one mark in a corner, and everything else behind it */
.quiet { position: absolute; pointer-events: auto; display: none; width: ${T.w}px; height: ${T.h}px; place-items: center; border-radius: ${T.top}px ${T.top}px ${T.bottom}px ${T.bottom}px; }
.quiet .mark { margin-bottom: ${T.h - A.h - 2 * A.y}px; }
.quiet:hover, .quiet[aria-expanded="true"] { border-color: rgb(var(--accent)); }
:host([data-presence="quiet"]) .quiet { display: grid; }
/* Quiet where the visitor plays by touch keeps the bar: there is no keyboard to keep for play, and nothing else to press for what it carries. */
:host([data-presence="quiet"][data-bar]) .bar { display: flex; }
:host([data-presence="quiet"]) :is(.id, .menu, .bar, .target, .corner),
:host([data-presence="hidden"]) :is(.id, .menu, .bar, .target, .corner, .says, .loading) { display: none; }
:host([data-corner="top-left"]) .quiet { top: max(12px, env(safe-area-inset-top)); left: max(12px, env(safe-area-inset-left)); }
:host([data-corner="top-right"]) .quiet { top: max(12px, env(safe-area-inset-top)); right: max(12px, env(safe-area-inset-right)); }
:host([data-corner="bottom-left"]) .quiet { bottom: max(12px, env(safe-area-inset-bottom)); left: max(12px, env(safe-area-inset-left)); }
:host([data-corner="bottom-right"]) .quiet { bottom: max(12px, env(safe-area-inset-bottom)); right: max(12px, env(safe-area-inset-right)); }
/* With no hotbar under it, the sheet opens in the middle of the bottom edge, clear of the corners. */
:host(:not([data-bar])) .sheet { bottom: max(72px, env(safe-area-inset-bottom)); }
:host(:not([data-bar])) .says { bottom: max(72px, env(safe-area-inset-bottom)); }
/* Keys the world has switched off aren't advertised. */
:host(.no-hotbar-keys) :is(.key .num, .row kbd) { display: none; }

/* Who they are signed in as, said once when it becomes so: top centre, in one place, and gone again. It is never
   pressed and never in the way: it can't be clicked, and what is under it can. */
.as { position: absolute; top: max(12px, env(safe-area-inset-top)); left: 50%; translate: -50% 0; display: flex; align-items: center; gap: 10px;
  padding: 6px 18px 6px 6px; border-radius: 999px; max-width: min(72vw, 380px); opacity: 0; visibility: hidden; pointer-events: none; }
.as.plain { padding-left: 18px; }
.as .face { flex: none; width: calc(36px * var(--s)); height: calc(36px * var(--s)); border-radius: 50%; display: grid; place-items: center; overflow: hidden;
  background: rgba(var(--accent), .16); color: rgb(var(--accent)); font-weight: 650; box-shadow: 0 0 0 2px rgba(var(--accent), .75); }
.as.plain .face { display: none; }
.as .face canvas { width: 100%; height: 100%; display: block; }
.as .who { min-width: 0; }
.as small { display: block; font-size: .8em; line-height: 1.15; color: rgba(var(--ink), .72); white-space: nowrap; }
.as b { display: block; font-weight: 650; font-size: 1.06em; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.as.shown { opacity: 1; visibility: visible; }
/* It comes into focus where it stands and goes out the same way: nothing slides across the view. */
:host(.moving) .as { transform: scale(.9); filter: blur(8px); transition: opacity .4s ease, transform .5s cubic-bezier(.2, .8, .2, 1), filter .4s ease, visibility 0s linear .5s; }
:host(.moving) .as.shown { transform: none; filter: none; transition: opacity .4s ease, transform .5s cubic-bezier(.2, .8, .2, 1), filter .4s ease, visibility 0s; }
:host(.moving) .as.shown .face { animation: as-ring 1.2s ease-out .15s both; }
:host(.moving) .as.shown b { animation: as-name .5s ease-out .12s both; }
@keyframes as-ring { from { box-shadow: 0 0 0 2px rgba(var(--accent), .95), 0 0 0 0 rgba(var(--accent), .55); } to { box-shadow: 0 0 0 2px rgba(var(--accent), .75), 0 0 0 14px rgba(var(--accent), 0); } }
@keyframes as-name { from { opacity: 0; letter-spacing: .08em; } }
/* On a narrow screen the place's name and the menu take the top row: it stands just under them. */
@media (max-width: 760px) { .as { top: calc(max(12px, env(safe-area-inset-top)) + 60px * var(--s)); } }

/* ---- one moment of motion: things arrive. Nothing loops. */
@keyframes say-in { from { opacity: 0; transform: translateX(-8px); } }
@keyframes chat-in { from { opacity: 0; transform: translateX(8px); } }
@keyframes rise { from { opacity: 0; transform: translateY(8px); } }
/* The menu's motion (the owner, 2026-11-24: "menu opens and closes as fine lines that fill in"; rows come in). Its
   outline first, as fine lines drawn out from the top, then the glass and what it holds; closed, the lines draw back.
   Nothing that can be pressed moves: motion is in how things are seen, never where they are, and all of it can be
   pressed from the first frame. A fraction of a second, and off with less motion (the rule below). */
@keyframes trace { from { clip-path: inset(0 50% 100% 50%); } 45% { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes trace-settle { to { opacity: 0; } }
@keyframes untrace { from { clip-path: inset(0 0 0 0); opacity: .9; } 55% { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 50% 100% 50%); opacity: 0; } }
@keyframes fill-in { from { background-color: transparent; } }
@keyframes hold-in { from { opacity: 0; } }
:host(.moving.arriving) .key { animation: rise .32s cubic-bezier(.2, .8, .2, 1) both; animation-delay: calc(var(--i) * 45ms + 120ms); }
:host(.moving.arriving) .id, :host(.moving.arriving) .menu { animation: rise .32s cubic-bezier(.2, .8, .2, 1) both; }
:host(.moving) .sheet:not([hidden]) { animation: fill-in .16s ease-out .08s both; }
:host(.moving) .sheet:not([hidden]) > :not(.room) { animation: hold-in .16s ease-out .08s both; }
:host(.moving) .sheet:not([hidden])::after { content: ""; position: absolute; inset: 0; border: 1px solid rgba(var(--accent), .9); border-radius: inherit; pointer-events: none;
  animation: trace .14s ease-out both, trace-settle .3s ease-out .14s both; }
/* Rows come in, when a tab is chosen or the menu comes up: by how they are seen, a few at a time, never where they are. */
:host(.moving) .rows.arriving > * { animation: hold-in .16s ease-out both; animation-delay: calc(min(var(--n, 0), 8) * 18ms); }
/* The lines left where the sheet was as it goes, drawing back: pressed through, and gone in a moment. */
.trace { position: fixed; pointer-events: none; display: none; border: 1px solid rgba(var(--accent), .9); border-radius: 22px 22px 12px 12px; }
:host(.moving) .trace.leaving { display: block; animation: untrace .16s ease-in both; }
:host(:not(.moving)) * { transition: none !important; animation: none !important; }

/* ---- a phone: the same things, closer together */
@media (max-width: 640px) {
  .id { max-width: calc(100vw - 86px); padding: 6px 10px 6px 8px; }
  .key .num { display: none; }
  .hotbar { gap: 4px; padding: 10px 8px 6px; }
  .bar .more { width: 26px; }
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
function mountMenu(port, opts = {}) {
  const controls = port;
  const host = document.createElement("nswp-hud");
  const chatOnly = opts.only === "chat";
  if (chatOnly) host.classList.add("chat-only");
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
  const barShown = (presence) => presence === "full" || presence === "quiet" && startingForm() === "touch";
  const hint = () => el("span", { class: "hint", "aria-hidden": "true" }, "Menu, M");
  const menu = el("button", { class: "menu glass", type: "button", "aria-label": "Menu", "aria-haspopup": "dialog", "aria-expanded": "false" }, el("span", { class: "mark", "aria-hidden": "true" }), hint());
  const quiet = el("button", { class: "quiet glass", type: "button", "aria-label": "Menu", "aria-haspopup": "dialog", "aria-expanded": "false" }, el("span", { class: "mark", "aria-hidden": "true" }), hint());
  const target = el("div", { class: "target glass", "aria-live": "polite" });
  const loadingWhat = el("span", { class: "what", "aria-live": "polite" });
  const loadingMuch = el("span", { class: "much" });
  const loadingFill = el("i", { class: "fill", "aria-hidden": "true" });
  const loadingLine = el("div", { class: "loading glass", hidden: "" }, loadingWhat, loadingMuch, loadingFill);
  const hotbar = el("nav", { class: "hotbar", "aria-label": "Controls" });
  const barBack = el("button", { class: "more left spent", type: "button", "aria-label": "Earlier keys", tabindex: "-1" }, "\u2039");
  const barOn = el("button", { class: "more right spent", type: "button", "aria-label": "More keys", tabindex: "-1" }, "\u203A");
  const bar = el("div", { class: "bar glass" }, barBack, hotbar, barOn);
  const says = el("div", { class: "says", role: "status" });
  const asFace = el("span", { class: "face", "aria-hidden": "true" });
  const asLead = el("small");
  const asName = el("b");
  const asWho = el("div", { class: "as glass", role: "status" }, asFace, el("span", { class: "who" }, asLead, asName));
  const full = el("button", { class: "full glass", type: "button", hidden: "" }, icon("full"), el("span", {}, fullscreenButton.label));
  const tabs = el("div", { class: "tabs", role: "tablist" });
  const tabsBack = el("button", { class: "more left", type: "button", "aria-label": "Earlier sections", hidden: "" }, "\u2039");
  const tabsOn = el("button", { class: "more right", type: "button", "aria-label": "More sections", hidden: "" }, "\u203A");
  const tabbar = el("div", { class: "tabbar" }, tabsBack, tabs, tabsOn);
  let tabsShowing = "";
  let cardShown = "";
  const tendTabs = () => {
    const most = tabs.scrollWidth - tabs.clientWidth;
    tabsBack.hidden = tabs.scrollLeft <= 6;
    tabsOn.hidden = most <= 6 || tabs.scrollLeft >= most - 6;
  };
  const slideTabs = (by) => tabs.scrollBy({ left: by * Math.max(120, tabs.clientWidth * 0.6), behavior: controls.theme.motion ? "smooth" : "auto" });
  tabsBack.addEventListener("click", () => slideTabs(-1));
  tabsOn.addEventListener("click", () => slideTabs(1));
  tabs.addEventListener("scroll", tendTabs, { passive: true });
  const tabsWatch = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => tendTabs());
  tabsWatch?.observe(tabs);
  tabbar.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || tabs.scrollWidth <= tabs.clientWidth) return;
      e.preventDefault();
      tabs.scrollLeft += e.deltaY;
    },
    { passive: false }
  );
  const arrowsTake = () => bar.classList.contains("over") ? barBack.offsetWidth + barOn.offsetWidth : 0;
  const tendBar = () => {
    const over = hotbar.scrollWidth > hotbar.clientWidth + arrowsTake() + 1;
    if (bar.classList.contains("over") !== over) bar.classList.toggle("over", over);
    const most = hotbar.scrollWidth - hotbar.clientWidth;
    barBack.classList.toggle("spent", !over || hotbar.scrollLeft <= 6);
    barOn.classList.toggle("spent", !over || most <= 6 || hotbar.scrollLeft >= most - 6);
  };
  let sliding = 0;
  const stopSliding = () => {
    if (sliding) cancelAnimationFrame(sliding);
    sliding = 0;
  };
  const slideBar = (by) => {
    stopSliding();
    const from = hotbar.scrollLeft;
    const to = Math.max(0, Math.min(hotbar.scrollWidth - hotbar.clientWidth, from + by * Math.max(110, hotbar.clientWidth * 0.6)));
    if (!controls.theme.motion || typeof requestAnimationFrame !== "function") {
      hotbar.scrollLeft = to;
      return void tendBar();
    }
    const began = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - began) / 240);
      hotbar.scrollLeft = from + (to - from) * (1 - (1 - k) ** 3);
      sliding = k < 1 ? requestAnimationFrame(step) : 0;
      if (!sliding) tendBar();
    };
    sliding = requestAnimationFrame(step);
  };
  for (const type of ["pointerdown", "wheel", "touchstart"]) hotbar.addEventListener(type, stopSliding, { passive: true });
  barBack.addEventListener("click", () => slideBar(-1));
  barOn.addEventListener("click", () => slideBar(1));
  hotbar.addEventListener("scroll", tendBar, { passive: true });
  const barWatch = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => tendBar());
  barWatch?.observe(hotbar);
  bar.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || hotbar.scrollWidth <= hotbar.clientWidth) return;
      e.preventDefault();
      hotbar.scrollLeft += e.deltaY;
    },
    { passive: false }
  );
  let barLed = "";
  let barDrawn = "";
  const rows = el("div", { class: "rows" });
  const note = el("p", { class: "note" });
  const said = el("p", { class: "note said", hidden: "" });
  const close = el("button", { class: "close", type: "button" }, "Close");
  const pinWords = el("span");
  const pinIt = el("button", { class: "pin-it", type: "button", "aria-pressed": "false" }, icon("pin"), pinWords);
  const foot = el("div", { class: "foot" }, pinIt, close);
  const room = el("div", { class: "room", "aria-hidden": "true" });
  const measure = el("div", { class: "measure", "aria-hidden": "true", inert: "" });
  const sheet = el("section", { class: "sheet glass", role: "dialog", "aria-label": "Menu", hidden: "" }, tabbar, rows, note, said, room, foot);
  const chatTitle = el("b");
  const chatWhose = el("p", { class: "whose", hidden: "" });
  const tabRoom = el("button", { type: "button", class: "tab", role: "tab" }, "Room chat");
  const tabFeed = el("button", { type: "button", class: "tab", role: "tab" }, "My public feed");
  const tabLetters = el("button", { type: "button", class: "tab", role: "tab" }, "Private messages");
  const chatTabs = el("div", { class: "tabs2", role: "tablist" }, tabRoom, tabLetters, tabFeed);
  const feedLead = el("p", { class: "lead" });
  const feedSaid = el("p", { class: "said", role: "status" });
  const chatClose = el("button", { type: "button", "aria-label": "Put this away" }, icon("close"));
  const chatLines = el("ol", { "aria-live": "polite" });
  const ROOM_EMPTY = "Nobody has written anything yet. What is written here goes to the people in this room, and is kept nowhere.";
  const chatEmpty = el("p", { class: "empty" }, ROOM_EMPTY);
  const chatField = el("input", { type: "text", autocomplete: "off", enterkeyhint: "send", "aria-label": "Write to the room", placeholder: "Write to the room" });
  const chatHint = el("p", { class: "hint", role: "status" });
  const chatSend = el("button", { type: "submit" }, "Send");
  const chatForm = el("form", {}, chatField, chatSend);
  const chat = el("section", { class: "chat", "aria-label": "Room chat", "data-state": "closed", "data-tab": "room" }, el("div", { class: "frame glass" }, chatWhose, el("header", {}, chatTitle, chatTabs, chatClose), feedLead, chatEmpty, chatLines, chatHint, feedSaid, chatForm));
  const outside = el("div", { class: "outside", "aria-hidden": "true", hidden: "" });
  const trace = el("div", { class: "trace", "aria-hidden": "true" });
  let rowsFor = "";
  let rowsOpen = false;
  let arrivingTimer = null;
  root.append(style, outside, trace, el("i", { class: "corner a", "aria-hidden": "true" }), el("i", { class: "corner b", "aria-hidden": "true" }), id, menu, quiet, asWho, full, says, chat, sheet, measure, el("div", { class: "low" }, loadingLine, target, bar));
  (opts.parent ?? document.body).append(host);
  let open = false;
  let section = "";
  let chose = false;
  let drawn = "";
  const marks = /* @__PURE__ */ new WeakMap();
  let marked = 0;
  const markOf = (picture) => {
    if (!picture || typeof picture !== "object") return 0;
    let n = marks.get(picture);
    if (!n) marks.set(picture, n = ++marked);
    return n;
  };
  const kindsWords = (accept) => accept.length === 1 ? accept[0] === "image" ? "pictures" : "video" : "pictures and video";
  const fileRow = (item) => {
    const accept = item.accept ?? [];
    const picker = el("input", { type: "file", accept: accept.map((k) => `${k}/*`).join(","), hidden: "" });
    picker.addEventListener("cancel", () => picker.remove());
    picker.addEventListener("change", () => {
      const file = picker.files?.[0];
      picker.remove();
      if (!file) return;
      const kind = menuFileKind(file.type);
      if (!kind || !accept.includes(kind)) return controls.say(`Only ${kindsWords(accept)} can go here.`);
      if (file.size > MENU_LIMITS.file) return controls.say("That file is too large to hand over: 64 MB at most.");
      if (file.size < 1) return controls.say("That file is empty.");
      controls.run(item.id, void 0, file);
    });
    root.append(picker);
    picker.click();
    return true;
  };
  const press = (item) => item.kind === "file" ? fileRow(item) : controls.run(item.id);
  const copyRow = (item) => {
    const text = item.copy ?? "";
    void (text && navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject(new Error("nothing to copy with"))).then(
      () => controls.say("Copied."),
      () => controls.say(text ? `It couldn't be copied here. It is: ${text}`.slice(0, 200) : "There is nothing to copy.")
    );
    press(item);
  };
  const fields = /* @__PURE__ */ new Map();
  const typingNow = () => {
    let at = document.activeElement;
    while (at?.shadowRoot?.activeElement) at = at.shadowRoot.activeElement;
    return [...fields.values()].find((f) => f.input === at);
  };
  let measuringOnly = false;
  const drawField = (item, whose) => {
    if (measuringOnly) return el("form", { class: "field" }, el("input", { type: "text" }), el("button", { type: "submit" }, item.label), el("p", { class: "to" }, whose ? `What you type here goes to ${whose}.` : ""));
    let f = fields.get(item.id);
    if (!f) {
      const input = el("input", { type: "text", maxlength: String(MENU_LIMITS.field), autocomplete: "off", autocapitalize: "off", autocorrect: "off", spellcheck: "false", enterkeyhint: "done" });
      const button = el("button", { type: "submit" });
      const to = el("p", { class: "to" });
      const form = el("form", { class: "field" }, input, button, to);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value;
        if (!text.trim()) return;
        input.value = "";
        controls.run(item.id, text);
      });
      f = { form, input, button, to };
      fields.set(item.id, f);
    }
    f.input.setAttribute("aria-label", item.label);
    f.button.textContent = item.label;
    f.to.textContent = whose ? `What you type here goes to ${whose}.` : "";
    return f.form;
  };
  const clearFields = () => {
    for (const f of fields.values()) f.input.value = "";
    fields.clear();
    sliders.clear();
    if (looking) clearInterval(looking);
    looking = null;
  };
  const sliders = /* @__PURE__ */ new Map();
  let looking = null;
  const showSlider = (s) => {
    const max = s.item.slider?.max() ?? 0;
    s.range.max = String(Math.max(1, Math.floor(max)));
    s.range.disabled = !(max > 0);
    if (s.held) return;
    s.range.value = String(Math.floor(s.item.slider?.value() ?? 0));
    s.time.textContent = s.item.slider?.text?.() ?? "";
  };
  const drawSlider = (item) => {
    if (measuringOnly) return el("label", { class: item.on === true ? "slide on" : "slide" }, icon(item.icon), el("span", { class: "name" }, item.label), el("input", { type: "range", min: "0", step: "1", value: "0" }), el("span", { class: "time mono" }, "0:00 of 0:00"));
    let s = sliders.get(item.id);
    if (!s) {
      const range = el("input", { type: "range", min: "0", step: "1", value: "0" });
      const name = el("span", { class: "name" });
      const time = el("span", { class: "time mono" });
      const box = el("label", { class: "slide" }, icon(item.icon), name, range, time);
      const made = { box, name, range, time, item, held: false };
      s = made;
      const letGo = () => made.held = false;
      range.addEventListener("pointerdown", () => made.held = true);
      range.addEventListener("input", () => made.held = true);
      range.addEventListener("change", () => {
        letGo();
        controls.run(made.item.id, range.value);
        setTimeout(() => showSlider(made), 150);
      });
      range.addEventListener("pointerup", () => setTimeout(letGo, 0));
      range.addEventListener("blur", letGo);
      sliders.set(item.id, s);
    }
    s.item = item;
    s.name.textContent = item.label;
    s.range.setAttribute("aria-label", item.label);
    s.box.classList.toggle("on", item.on === true);
    showSlider(s);
    looking ??= setInterval(() => {
      let seen = false;
      for (const each of sliders.values()) {
        if (!each.box.isConnected) continue;
        seen = true;
        showSlider(each);
      }
      if (!seen && looking) {
        clearInterval(looking);
        looking = null;
      }
    }, 500);
    return s.box;
  };
  const openPin = (id2) => {
    controls.signal("press");
    if (open && section === id2) setOpen(false);
    else setOpen(true, id2);
  };
  const drawCard = (card, acts = [], onlyMeasured = false) => {
    const face = el("span", { class: "face", "aria-hidden": "true" }, [...card.title][0]?.toUpperCase() ?? "");
    if (card.color) face.style.setProperty("--c", card.color);
    onlyMeasured ||= measuringOnly;
    const paint = onlyMeasured ? void 0 : card.draw;
    if (paint) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const g = canvas.getContext("2d");
      let had = false;
      const tick2 = () => {
        if (had && (!canvas.isConnected || sheet.hidden)) return;
        const now2 = paint();
        if (now2 && g) {
          g.clearRect(0, 0, 256, 256);
          g.drawImage(now2, 0, 0, 256, 256);
          if (!had) face.replaceChildren(canvas);
          had = true;
        }
        if (canvas.isConnected || !had) requestAnimationFrame(tick2);
      };
      let tries = 0;
      const begin = () => {
        if (!face.isConnected && ++tries < 3) return void requestAnimationFrame(begin);
        tick2();
      };
      requestAnimationFrame(begin);
    }
    if (card.face && !card.draw && !onlyMeasured) {
      const from = card.face;
      const copy = document.createElement("canvas");
      copy.width = Math.max(1, Math.min(256, Math.round(from.width ?? 128)));
      copy.height = Math.max(1, Math.min(256, Math.round(from.height ?? 128)));
      try {
        copy.getContext("2d")?.drawImage(card.face, 0, 0, copy.width, copy.height);
        face.replaceChildren(copy);
      } catch {
      }
    }
    if (card.picture && !onlyMeasured) {
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
        () => controls.say("The key is copied, in full."),
        () => controls.say(`The key: ${card.copy}`)
      );
    });
    const head = el("h3", {}, card.title, card.tag && el("span", { class: card.proven ? "tag proven" : "tag" }, card.tag));
    const key = el("div", { class: "keyline" }, el("span", { class: card.copy ? "mono" : "" }, card.sub), copyKey);
    const words = card.text && el("blockquote", {}, card.text);
    const now = card.now.length > 0 && el("p", { class: "now" }, card.now.join(", "));
    if (card.draw) {
      return el(
        "div",
        { class: "person thing", role: "group", "aria-label": `About ${card.title}` },
        face,
        el("div", { class: "about" }, head, key, words, now),
        acts.length > 0 && el("div", { class: "acts" }, ...acts)
      );
    }
    return el("div", { class: "person", role: "group", "aria-label": `About ${card.title}` }, face, head, key, words, now);
  };
  let chatState = "closed";
  let dockTab = "room";
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
    const f = view.feed;
    const l = view.letters;
    const readyOf = (tab) => tab === "feed" ? f.ready : tab === "letters" ? l.ready : c.ready;
    if (chatState === "open" && !readyOf(dockTab)) {
      const other = ["room", "letters", "feed"].find(readyOf);
      if (other) dockTab = other;
      else setChatState("closed");
    }
    if (chatState === "peek" && !c.ready) setChatState("closed");
    const newest = c.lines[c.lines.length - 1]?.key ?? "";
    if (c.ready && newest && newest !== chatNewest && chatState !== "open" && !c.lines[c.lines.length - 1].mine) setChatState("peek");
    chatNewest = newest;
    const showing = chatState === "open" ? dockTab : "room";
    if (chatOnly) {
      chatWhose.hidden = false;
      chatWhose.textContent = controls.view().title;
    }
    const now = JSON.stringify([chatState, showing, c.version, c.ready, f.version, f.ready, l.version, l.ready, showing === "feed" ? [Math.floor(Date.now() / 6e4), f.lead] : showing === "letters" ? [Math.floor(Date.now() / 6e4), l.title] : 0]);
    if (now === chatDrawn) return;
    chatDrawn = now;
    chat.dataset.state = chatState;
    chat.dataset.tab = showing;
    chat.setAttribute("aria-label", showing === "feed" ? f.title : showing === "letters" ? l.title : "Room chat");
    const both = [c.ready, f.ready, l.ready].filter(Boolean).length > 1;
    chatTabs.hidden = !both;
    chatTitle.hidden = both;
    chatTitle.textContent = showing === "feed" ? f.title : showing === "letters" ? l.title : c.title;
    tabRoom.hidden = !c.ready;
    tabFeed.hidden = !f.ready;
    tabLetters.hidden = !l.ready;
    tabLetters.textContent = l.title;
    tabLetters.setAttribute("aria-selected", String(showing === "letters"));
    tabRoom.textContent = c.unread && showing !== "room" ? `Room chat: ${c.unread} new` : "Room chat";
    tabRoom.setAttribute("aria-selected", String(showing === "room"));
    tabFeed.setAttribute("aria-selected", String(showing === "feed"));
    feedLead.hidden = showing === "room";
    feedSaid.hidden = showing === "room";
    chatField.maxLength = showing === "feed" ? f.limit : showing === "letters" ? l.limit : c.limit;
    const words = showing === "feed" ? "Write a post" : showing === "letters" ? `Write to ${l.with}, privately` : "Write to the room";
    chatField.placeholder = words;
    chatField.setAttribute("aria-label", words);
    chatSend.textContent = showing === "feed" ? "Send out a post" : "Send";
    if (showing === "feed") {
      feedLead.textContent = f.lead;
      feedSaid.textContent = f.said;
      const nowSec = Math.floor(Date.now() / 1e3);
      chatLines.replaceChildren(
        ...f.posts.map((p) => {
          const when = el("small", {}, p.state === "sending" ? "Sending\u2026" : p.state === "failed" ? "Not sent" : p.state === "removing" ? "Deleting\u2026" : ago(p.at, nowSec));
          if (f.removable && p.id && p.state === "out") {
            const remove = el("button", { type: "button", class: "post-remove" }, "Delete");
            remove.addEventListener("click", () => {
              const trouble = controls.feed.remove(p.key);
              if (trouble) controls.say(trouble);
            });
            when.append(" \xB7 ", remove);
          }
          return el("li", { class: `post ${p.state}` }, p.text, when);
        })
      );
      chatEmpty.textContent = f.loading ? "Fetching your posts\u2026" : "Nothing here yet. What you send out appears here, and on Nostr for anyone to read.";
      chatEmpty.hidden = f.posts.length > 0;
      chatLines.hidden = f.posts.length === 0;
      return;
    }
    if (showing === "letters") {
      feedLead.textContent = l.lead;
      feedSaid.textContent = l.said;
      const nowSec = Math.floor(Date.now() / 1e3);
      const wasAtEnd = chatLines.scrollHeight - chatLines.scrollTop - chatLines.clientHeight < 40;
      chatLines.replaceChildren(
        ...l.lines.map(
          (line) => el("li", { class: `letter ${line.mine ? "mine" : ""} ${line.state}` }, el("b", {}, line.mine ? "You" : line.who), " ", line.text, el("small", {}, line.state === "sending" ? "Sending\u2026" : line.state === "failed" ? "Not sent" : ago(line.at, nowSec)))
        )
      );
      chatEmpty.textContent = `Nothing yet. What you write here is for ${l.with} alone.`;
      chatEmpty.hidden = l.lines.length > 0;
      chatLines.hidden = l.lines.length === 0;
      if (wasAtEnd || l.lines[l.lines.length - 1]?.mine) chatLines.scrollTop = chatLines.scrollHeight;
      controls.letters.seen();
      return;
    }
    const lines = chatState === "peek" ? c.lines.slice(-PEEK_LINES) : c.lines;
    const atEnd = chatLines.scrollHeight - chatLines.scrollTop - chatLines.clientHeight < 40;
    chatLines.replaceChildren(
      ...lines.map((line) => {
        const li = el("li", { class: line.note ? "aside" : line.mine ? "mine" : "" }, !line.note && el("b", {}, line.mine ? "You" : line.who), line.note ? "" : " ", line.text);
        if (line.color && !line.mine) li.style.setProperty("--who", line.color);
        return li;
      })
    );
    chatEmpty.textContent = ROOM_EMPTY;
    chatEmpty.hidden = lines.length > 0;
    chatLines.hidden = lines.length === 0;
    if (chatState === "open" && (atEnd || lines[lines.length - 1]?.mine)) chatLines.scrollTop = chatLines.scrollHeight;
    if (chatState === "open") controls.chat.seen();
  };
  const setChatOpen = (next, tab) => {
    if (next) {
      const c = controls.chat.view();
      const f = controls.feed.view();
      const l = controls.letters.view();
      const want = tab ?? (chatState === "open" ? dockTab : c.ready ? "room" : l.ready ? "letters" : "feed");
      if (!(want === "feed" ? f.ready : want === "letters" ? l.ready : c.ready) || host.hidden || controls.view().presence === "hidden") return;
      const was = chatState === "open";
      if (was && want === dockTab) return;
      dockTab = want;
      if (want === "feed") controls.feed.opened();
      chatHint.textContent = "";
      if (!was) {
        if (open) setOpen(false);
        chatCameFrom = focused();
        setChatState("open");
      }
      draw();
      chatLines.scrollTop = want === "feed" ? 0 : chatLines.scrollHeight;
      chatField.focus({ preventScroll: true });
      controls.signal(want === "feed" ? "feedOpen" : "chatOpen");
      return;
    }
    if (chatState !== "open") return;
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
  tabRoom.addEventListener("click", () => setChatOpen(true, "room"));
  tabFeed.addEventListener("click", () => setChatOpen(true, "feed"));
  tabLetters.addEventListener("click", () => setChatOpen(true, "letters"));
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatField.value;
    if (!text.trim()) return setChatOpen(false);
    const trouble = dockTab === "feed" ? controls.feed.send(text) : dockTab === "letters" ? controls.letters.send(text) : controls.chat.send(text);
    chatHint.textContent = trouble ?? "";
    if (!trouble) chatField.value = "";
    if (!trouble && dockTab === "feed") chatLines.scrollTop = 0;
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
  let asKey = null;
  let asPicture = "";
  let asTimer;
  const AS_SHOWN_MS = 5200;
  const sayWho = (card) => {
    const key = card ? card.copy || card.title : "";
    const first = asKey === null;
    const changed = key !== asKey;
    asKey = key;
    if (card) {
      asLead.textContent = "Signed in as";
      asName.textContent = card.title;
      if (changed || card.picture !== asPicture) {
        asPicture = card.picture;
        asFace.replaceChildren([...card.title][0]?.toUpperCase() ?? "");
        const want = card.picture;
        if (want) {
          void loadPicture(want).then((drawn2) => {
            if (!drawn2 || asPicture !== want) return;
            const copy = document.createElement("canvas");
            copy.width = drawn2.width;
            copy.height = drawn2.height;
            copy.getContext("2d")?.drawImage(drawn2, 0, 0);
            asFace.replaceChildren(copy);
          });
        }
      }
    }
    if (!changed || first && !card) return;
    if (!card) {
      asPicture = "";
      asLead.textContent = "Signed out";
      asName.textContent = "You are a guest here";
    }
    if (host.hidden) {
      const words = card ? `Signed in as ${card.title}.` : "Signed out. You are a guest here.";
      return queueMicrotask(() => controls.say(words));
    }
    asWho.classList.toggle("plain", !card);
    asWho.classList.add("shown");
    clearTimeout(asTimer);
    asTimer = setTimeout(() => asWho.classList.remove("shown"), AS_SHOWN_MS);
  };
  const measured = /* @__PURE__ */ new Map();
  let heldFor = "";
  let heldTall = 0;
  const tallOf = (r, n, w) => r.scrollHeight + (r.offsetHeight - r.clientHeight) + n.getBoundingClientRect().height + w.getBoundingClientRect().height;
  const placeOf = (wide) => `${wide}|${host.style.getPropertyValue("--s")}|`;
  const keyOf = (at, s) => `${at}${s.id}|${JSON.stringify([s.note ?? "", s.said ?? null, s.card ? [s.card.title, s.card.sub, s.card.text, s.card.now, !!s.card.draw, s.card.acts ?? []] : null, s.items.map((i) => [i.id, i.kind, i.label, i.short, i.on, i.from ?? "", i.tone])])}`;
  const measureTab = (s, layOut) => {
    let made;
    measuringOnly = true;
    try {
      made = layOut(s);
    } finally {
      measuringOnly = false;
    }
    const r = el("div", { class: "rows" }, ...made);
    r.hidden = !s.items.length && !s.card;
    const n = el("p", { class: "note" }, s.note ?? "");
    const w = el("p", { class: "note said" }, ...s.said ? [el("b", {}, s.said.from), s.said.note] : []);
    w.hidden = !s.said;
    measure.replaceChildren(r, n, w);
    return tallOf(r, n, w);
  };
  let lastView = null;
  let lastLayOut = null;
  let aheadWaiting = false;
  let lastInput = -Infinity;
  let downs = 0;
  const AHEAD_ROOM_MS = 5;
  const AHEAD_QUIET_MS = 500;
  const onInput = (e) => {
    if (e.type === "pointermove" && !e.buttons) return;
    lastInput = performance.now();
    if (e.type === "keydown" && !e.repeat) downs++;
    if (e.type === "keyup") downs = Math.max(0, downs - 1);
  };
  const INPUTS = ["keydown", "keyup", "pointerdown", "pointerup", "pointermove", "wheel"];
  for (const type of INPUTS) addEventListener(type, onInput, { capture: true, passive: true });
  const onBlurKeys = () => void (downs = 0);
  addEventListener("blur", onBlurKeys);
  const doing = () => downs > 0 || document.pointerLockElement !== null || performance.now() - lastInput < AHEAD_QUIET_MS;
  const idle = (fn) => {
    const ask = globalThis.requestIdleCallback;
    if (typeof ask === "function") ask((d) => fn(() => d.timeRemaining()));
    else setTimeout(() => fn(() => AHEAD_ROOM_MS + 1), 250);
  };
  const measureAhead = () => {
    if (aheadWaiting) return;
    aheadWaiting = true;
    idle((left) => {
      aheadWaiting = false;
      if (!lastView || !lastLayOut || !sheet.hidden || host.hidden) return;
      measure.style.width = "";
      const at = placeOf(Math.round(measure.getBoundingClientRect().width));
      const next = lastView.sections.find((s) => !measured.has(keyOf(at, s)));
      if (!next) return;
      if (doing() || left() < AHEAD_ROOM_MS) return void setTimeout(measureAhead, doing() ? AHEAD_QUIET_MS : 50);
      measured.set(keyOf(at, next), measureTab(next, lastLayOut));
      measure.replaceChildren();
      if (lastView.sections.some((s) => !measured.has(keyOf(at, s)))) measureAhead();
    });
  };
  const TOP_GAP = 10;
  const SHEET_LEAST = 240;
  const tucked = /* @__PURE__ */ new Set();
  const untuck = () => {
    for (const thing of tucked) thing.style.visibility = "";
    tucked.clear();
  };
  const roomFor = (across) => {
    untuck();
    sheet.style.maxHeight = "";
    const ruled = parseFloat(getComputedStyle(sheet).maxHeight);
    const all = host.getBoundingClientRect();
    const foot2 = all.bottom - parseFloat(getComputedStyle(sheet).bottom);
    const left = all.left + all.width / 2 - across / 2;
    const over = [];
    let lowest = -Infinity;
    for (const thing of [id, menu, quiet, asWho, full]) {
      const r = thing.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0) || r.right + TOP_GAP <= left || r.left - TOP_GAP >= left + across || r.top >= foot2) continue;
      over.push(thing);
      lowest = Math.max(lowest, r.bottom);
    }
    if (!over.length) return ruled;
    const room2 = foot2 - lowest - TOP_GAP;
    if (room2 >= SHEET_LEAST) return Math.min(ruled, room2);
    for (const thing of over) {
      thing.style.visibility = "hidden";
      tucked.add(thing);
    }
    return Math.min(ruled, Math.max(SHEET_LEAST, foot2 - all.top - TOP_GAP));
  };
  const sizeSheet = (view, layOut) => {
    lastView = view;
    lastLayOut = layOut;
    sheet.style.height = "";
    says.classList.remove("one");
    if (sheet.hidden) {
      untuck();
      sheet.style.maxHeight = "";
      heldFor = "";
      heldTall = 0;
      measureAhead();
      return;
    }
    const inSheet = says.parentElement === sheet;
    if (inSheet) says.classList.add("one");
    const across = sheet.getBoundingClientRect().width;
    const tallest = roomFor(across);
    sheet.style.maxHeight = "none";
    const wide = Math.round(across);
    measure.style.width = `${across}px`;
    const here = tallOf(rows, note, said);
    const around = sheet.getBoundingClientRect().height - here;
    const at = placeOf(wide);
    let most = here;
    const still = /* @__PURE__ */ new Set();
    for (const s of view.sections) {
      const key = keyOf(at, s);
      still.add(key);
      if (s.id === section) {
        measured.set(key, here);
        continue;
      }
      let tall = measured.get(key);
      if (tall === void 0) {
        tall = measureTab(s, layOut);
        measured.set(key, tall);
      }
      most = Math.max(most, tall);
    }
    measure.replaceChildren();
    for (const key of [...measured.keys()]) if (!still.has(key)) measured.delete(key);
    sheet.style.maxHeight = `${tallest}px`;
    if (heldFor !== at) {
      heldFor = at;
      heldTall = 0;
    }
    heldTall = Math.max(heldTall, Math.ceil(around + most));
    sheet.style.height = `${heldTall}px`;
    if (inSheet) says.classList.remove("one");
  };
  let resized = null;
  const onWindowSize = () => {
    if (sheet.hidden) return void measureAhead();
    sheet.style.height = "";
    sheet.style.maxHeight = "";
    untuck();
    heldFor = "";
    heldTall = 0;
    if (resized) clearTimeout(resized);
    resized = setTimeout(() => {
      resized = null;
      if (open && !sheet.hidden && lastView && lastLayOut) sizeSheet(lastView, lastLayOut);
    }, 120);
  };
  addEventListener("resize", onWindowSize);
  const fitSays = () => {
    if (!sheet.hidden && heldTall > 0) return;
    sheet.style.height = "";
    if (says.parentElement !== sheet || sheet.hidden) return void says.classList.remove("one");
    says.classList.add("one");
    const size = sheet.getBoundingClientRect().height;
    const one = says.getBoundingClientRect().height;
    says.classList.remove("one");
    if (says.getBoundingClientRect().height > one + 0.5) sheet.style.height = `${size}px`;
  };
  const PRESS_MS = 1200;
  const DRAG_MS = 8e3;
  let pressedAt = -Infinity;
  let waitFor = PRESS_MS;
  let owed = false;
  const pressing = () => performance.now() - pressedAt < waitFor;
  const pressBegan = (e) => {
    const at = e.composedPath()[0];
    waitFor = at instanceof HTMLInputElement && at.type === "range" ? DRAG_MS : PRESS_MS;
    pressedAt = performance.now();
  };
  const pressOver = () => {
    if (pressedAt === -Infinity) return;
    pressedAt = -Infinity;
    if (!owed) return;
    owed = false;
    setTimeout(draw, 0);
  };
  const onSpace = (e) => void (e.key === " " && (e.type === "keyup" ? pressOver() : e.repeat || pressBegan(e)));
  root.addEventListener("pointerdown", pressBegan, true);
  root.addEventListener("keydown", onSpace, true);
  root.addEventListener("keyup", onSpace, true);
  const PRESS_ENDS = ["pointerup", "pointercancel", "blur"];
  for (const type of PRESS_ENDS) addEventListener(type, pressOver, true);
  document.addEventListener("visibilitychange", pressOver);
  const draw = () => {
    if (pressing()) return void (owed = true);
    owed = false;
    const view = controls.view();
    const t = view.theme;
    host.style.setProperty("--accent", rgb(t.accent));
    host.style.setProperty("--ink", rgb(t.ink));
    host.style.setProperty("--glass", rgb(t.glass));
    host.style.setProperty("--warn", rgb(t.warn));
    host.style.setProperty("--s", String(t.scale));
    host.classList.toggle("moving", t.motion);
    host.dataset.presence = view.presence;
    host.toggleAttribute("data-bar", barShown(view.presence));
    host.dataset.corner = view.corner;
    host.classList.toggle("no-menu-key", view.keys.menu === null);
    host.classList.toggle("no-hotbar-keys", !view.keys.hotbar);
    const hintWords = view.keys.menu ? `Menu, ${view.keys.menu.toUpperCase()}` : "Menu";
    for (const b of [menu, quiet]) {
      const words = b.querySelector(".hint");
      if (words && words.textContent !== hintWords) words.textContent = hintWords;
    }
    title.textContent = view.title;
    address.textContent = view.address;
    sayWho(view.sections.find((section2) => section2.id === "you")?.card ?? null);
    full.hidden = !fullscreenButton.shown() || view.presence === "hidden" || asWho.classList.contains("shown");
    const loads = view.loading;
    loadingLine.hidden = !loads || open;
    if (loads) {
      loadingWhat.textContent = loads.words || "Still loading";
      loadingMuch.textContent = loads.fraction === null ? "" : `${Math.floor(loads.fraction * 100)}%`;
      loadingLine.classList.toggle("unknown", loads.fraction === null);
      loadingFill.style.setProperty("--f", String(loads.fraction ?? 0));
    }
    const shown = [view.target, ...view.detail].join("\n");
    if (target.dataset.shown !== shown) {
      target.dataset.shown = shown;
      target.classList.toggle("card", view.detail.length > 0);
      if (view.detail.length) target.replaceChildren(el("b", {}, view.target), ...view.detail.map((line) => el("span", {}, line)));
      else target.textContent = view.target;
    }
    drawChat(view);
    if (wanted) {
      if (!open || performance.now() > wanted.until) wanted = null;
      else if (view.sections.some((s) => s.id === wanted.id)) {
        section = wanted.id;
        chose = true;
        wanted = null;
      }
    }
    if (!view.sections.some((s) => s.id === section)) section = view.sections[0]?.id ?? "";
    const inSight = open ? view.sections.find((s) => s.id === section) : void 0;
    const pictured = inSight ? [inSight.card?.face ? markOf(inSight.card.face) : 0, ...inSight.items.map((i) => i.picture ? markOf(i.picture()) : 0)] : [];
    const now = JSON.stringify([view.hotbar, view.pins, view.pinsFull, view.sections, section, open, view.presence, pictured]);
    if (now === drawn) return;
    drawn = now;
    const here = view.sections.find((s) => s.id === section);
    pinIt.hidden = !here || !barShown(view.presence);
    pinIt.setAttribute("aria-pressed", String(!!here?.pinned));
    pinIt.disabled = !here?.pinned && view.pinsFull;
    pinWords.textContent = here?.pinned ? "On your bar. Take it off" : view.pinsFull ? "Your bar is full" : "Keep this tab on your bar";
    pinIt.title = here?.pinned ? "" : view.pinsFull ? "Take a tab off your bar to keep another on it." : "It stays on your bar in every world that has this tab.";
    const barNow = JSON.stringify([view.hotbar, view.pins, open ? section : ""]);
    if (barNow !== barDrawn) {
      barDrawn = barNow;
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
        }),
        ...view.pins.length && view.hotbar.length ? [el("i", { class: "theirs", "aria-hidden": "true" })] : [],
        ...view.pins.map((pin, i) => {
          const b = el(
            "button",
            { class: "key pin normal", type: "button", "aria-label": `${pin.label}: a tab you keep on your bar`, "aria-pressed": String(open && section === pin.id) },
            el("span", { class: "arch" }, icon(pin.icon ?? "menu")),
            el("span", { class: "sill" }),
            el("span", { class: "name" }, pin.label),
            el("kbd", { class: "num mono" }, pin.key)
          );
          b.style.setProperty("--i", String(view.hotbar.length + i));
          b.addEventListener("click", () => openPin(pin.id));
          return b;
        })
      );
      bar.hidden = view.hotbar.length === 0 && view.pins.length === 0;
      const led = view.hotbar[0]?.id ?? "";
      if (led !== barLed && led) {
        stopSliding();
        hotbar.scrollLeft = 0;
      }
      barLed = led;
      barWatch?.disconnect();
      barWatch?.observe(hotbar);
      for (const k of hotbar.children) barWatch?.observe(k);
      requestAnimationFrame(tendBar);
    }
    tabs.replaceChildren(
      ...view.sections.map((s) => {
        const b = el("button", { class: "tab", type: "button", role: "tab", "aria-selected": String(s.id === section), tabindex: s.id === section ? "0" : "-1" }, icon(s.icon), s.label);
        b.addEventListener("click", () => {
          wanted = null;
          section = s.id;
          chose = true;
          draw();
          tabs.querySelector('[aria-selected="true"]')?.focus();
        });
        return b;
      })
    );
    const showing = open ? section : "";
    const bring = showing !== tabsShowing;
    tabsShowing = showing;
    requestAnimationFrame(() => {
      const chosen = tabs.querySelector('[aria-selected="true"]');
      if (bring && open && chosen) {
        const clear = 46;
        const left = chosen.offsetLeft - clear;
        const right = chosen.offsetLeft + chosen.offsetWidth + clear - tabs.clientWidth;
        if (tabs.scrollLeft > left) tabs.scrollLeft = Math.max(0, left);
        else if (tabs.scrollLeft < right) tabs.scrollLeft = right;
      }
      tendTabs();
    });
    const current = view.sections.find((s) => s.id === section);
    const drawSwatch = (item) => {
      const b = el("button", { class: "swatch", type: "button", "aria-label": item.label, "aria-pressed": String(item.on === true) }, el("i"), el("u"), item.label);
      b.style.setProperty("--c", item.color);
      b.addEventListener("click", () => press(item));
      return b;
    };
    const drawTile = (item) => {
      const shown2 = el("span", { class: "shown", "aria-hidden": "true" }, [...item.short][0]?.toUpperCase() ?? "");
      const picture = measuringOnly ? null : item.picture?.();
      if (picture) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 192;
        canvas.getContext("2d")?.drawImage(picture, 0, 0, 192, 192);
        shown2.replaceChildren(canvas);
      }
      const b = el(
        "button",
        { class: item.faint ? "tile faint" : "tile", type: "button", "aria-label": item.label, "aria-pressed": String(item.on === true) },
        shown2,
        el("span", {}, item.label),
        ...item.mark ? [el("i", { class: "corner-mark", "aria-hidden": "true" }, icon(item.mark))] : []
      );
      b.addEventListener("click", () => press(item));
      return b;
    };
    const drawRow = (item) => {
      const b = el(
        "button",
        { class: `row ${item.tone}`, type: "button", ...item.on === null ? {} : { "aria-pressed": String(item.on) } },
        icon(item.icon),
        el("span", { class: "grow" }, item.label),
        item.on !== null && el("span", { class: "state" }, item.on ? "On" : "Off"),
        item.key ? el("kbd", { class: "mono" }, item.key) : null
      );
      b.addEventListener("click", () => item.kind === "copy" ? copyRow(item) : press(item));
      return b;
    };
    const drawFile = (item, whose) => el("div", { class: "takes" }, drawRow(item), whose ? el("p", { class: "to" }, `The file you choose goes to ${whose}.`) : null);
    const drawLine = (item) => el("p", { class: `line ${item.on ? "on" : "off"}` }, icon(item.icon), el("span", {}, item.label));
    const lay = (items) => {
      const laid2 = [];
      let run = null;
      let whose = "";
      for (const item of items) {
        if ((item.from ?? "") !== whose) {
          whose = item.from ?? "";
          run = null;
          if (whose) laid2.push(el("p", { class: "from" }, whose));
        }
        if (item.kind === "button" || item.kind === "line" || item.kind === "copy" || item.kind === "field" || item.kind === "file" || item.kind === "save" || item.kind === "slider") {
          run = null;
          laid2.push(item.kind === "line" ? drawLine(item) : item.kind === "field" ? drawField(item, view.title) : item.kind === "file" ? drawFile(item, view.title) : item.kind === "slider" ? drawSlider(item) : drawRow(item));
          continue;
        }
        if (run?.kind !== item.kind) {
          run = { kind: item.kind, box: el("div", { class: item.kind === "tile" ? "tiles" : "swatches" }) };
          laid2.push(run.box);
        }
        run.box.append(item.kind === "tile" ? drawTile(item) : drawSwatch(item));
      }
      return laid2;
    };
    const inCard = new Set(current?.card?.draw ? current.card.acts ?? [] : []);
    const laid = lay((current?.items ?? []).filter((item) => !inCard.has(item.id)));
    const beside = lay((current?.items ?? []).filter((item) => inCard.has(item.id)));
    const about = current?.card ? `${section}:${current.card.title}` : "";
    const fresh = about !== cardShown;
    cardShown = about;
    const typingIn = typingNow();
    const at = typingIn ? [typingIn.input.selectionStart, typingIn.input.selectionEnd] : null;
    rows.replaceChildren(current?.card ? drawCard(current.card, beside) : "", ...laid);
    if (open && (section !== rowsFor || !rowsOpen) && controls.theme.motion) {
      [...rows.children].forEach((row, n) => row.style.setProperty("--n", String(n)));
      rows.classList.remove("arriving");
      void rows.offsetWidth;
      rows.classList.add("arriving");
      if (arrivingTimer) clearTimeout(arrivingTimer);
      arrivingTimer = setTimeout(() => rows.classList.remove("arriving"), 400);
    }
    rowsFor = open ? section : "";
    rowsOpen = open;
    if (typingIn?.form.isConnected) {
      typingIn.input.focus();
      if (at && at[0] !== null && at[1] !== null) typingIn.input.setSelectionRange(at[0], at[1]);
    }
    const still = new Set(view.sections.flatMap((s) => s.items.filter((i) => i.kind === "field").map((i) => i.id)));
    for (const id2 of [...fields.keys()]) if (!still.has(id2)) fields.delete(id2);
    const bars = new Set(view.sections.flatMap((s) => s.items.filter((i) => i.kind === "slider").map((i) => i.id)));
    for (const id2 of [...sliders.keys()]) if (!bars.has(id2)) sliders.delete(id2);
    if (fresh && about) rows.scrollTop = 0;
    rows.hidden = !current?.items.length && !current?.card;
    note.textContent = current?.note ?? "";
    said.hidden = !current?.said;
    said.replaceChildren(...current?.said ? [el("b", {}, current.said.from), current.said.note] : []);
    sheet.hidden = !open;
    outside.hidden = !open;
    if (open ? says.parentElement !== sheet : says.parentElement === sheet) {
      for (const line of says.children) line.classList.remove("coming");
      if (open) sheet.insertBefore(says, foot);
      else root.insertBefore(says, chat);
    }
    sizeSheet(view, (s) => {
      const within = new Set(s.card?.draw ? s.card.acts ?? [] : []);
      return [s.card ? drawCard(s.card, lay(s.items.filter((i) => within.has(i.id))), true) : "", ...lay(s.items.filter((i) => !within.has(i.id)))];
    });
    menu.setAttribute("aria-expanded", String(open));
    quiet.setAttribute("aria-expanded", String(open));
  };
  const focused = () => {
    let at = document.activeElement;
    while (at?.shadowRoot?.activeElement) at = at.shadowRoot.activeElement;
    return at;
  };
  const keysElsewhere = () => {
    const at = focused();
    return !!at && at !== document.body && at !== document.documentElement && at !== host && at.getRootNode() !== root;
  };
  let cameFrom = null;
  let wanted = null;
  const setOpen = (next, at) => {
    if (chatOnly) return;
    if (!next) wanted = null;
    if (next && at) {
      if (controls.view().sections.some((s) => s.id === at)) {
        wanted = null;
        section = at;
        chose = true;
        if (open) return void draw();
      } else {
        wanted = { id: at, until: performance.now() + MENU_SHOW_KEEP_MS };
        if (open) return;
      }
    }
    if (open === next) return;
    if (next) {
      if (chatState === "open") setChatOpen(false);
      cameFrom = focused();
      if (!chose) section = "";
    }
    if (!next && open && controls.theme.motion && !sheet.hidden) {
      const was = sheet.getBoundingClientRect();
      Object.assign(trace.style, { left: `${was.left}px`, top: `${was.top}px`, width: `${was.width}px`, height: `${was.height}px` });
      trace.classList.remove("leaving");
      void trace.offsetWidth;
      trace.classList.add("leaving");
      setTimeout(() => trace.classList.remove("leaving"), 260);
    }
    open = next;
    if (!open) clearFields();
    controls.signal(open ? "menuOpen" : "menuClose");
    const givenAway = !open && keysElsewhere();
    draw();
    if (open) return void tabs.querySelector('[aria-selected="true"]')?.focus();
    const back = cameFrom;
    cameFrom = null;
    if (givenAway) return;
    if (back?.isConnected && back !== document.body && getComputedStyle(back).display !== "none") back.focus({ preventScroll: true });
    else focused()?.blur();
  };
  outside.addEventListener("click", () => setOpen(false));
  setMenuPlace(() => {
    if (!open || sheet.hidden) return null;
    const r = sheet.getBoundingClientRect();
    return r.width > 0 ? { left: Math.round(r.left), width: Math.round(r.width), bottom: Math.round(innerHeight - r.bottom) } : null;
  });
  let asideFor = null;
  onClientSignIn((up, failed) => {
    if (failed) controls.say("The sign-in panel didn't come up. Press that again, and a window opens instead.");
    if (up) {
      asideFor = open ? section : null;
      if (open) setOpen(false);
    } else if (asideFor !== null) {
      const back = asideFor;
      asideFor = null;
      setOpen(true, back);
    }
  });
  menu.addEventListener("click", () => setOpen(!open));
  quiet.addEventListener("click", () => setOpen(!open));
  close.addEventListener("click", () => setOpen(false));
  pinIt.addEventListener("click", () => {
    const here = controls.view().sections.find((s) => s.id === section);
    if (!here) return;
    if (!controls.setPinned(here.id, !here.pinned)) return controls.say("Your bar is full. Take a tab off it to keep another on it.");
    controls.say(here.pinned ? `${here.label} is off your bar.` : `${here.label} is on your bar, here and in every world that has it.`);
  });
  const pressKey = (key) => {
    if (host.hidden || chatOnly) return;
    if (key === "summon") return setOpen(!open);
    if (key === "escape") {
      const does = escapeDoes({ menuOpen: open, held: escapeHeld() });
      if (does === "close-menu") return setOpen(false);
      if (does === "open-menu") return setOpen(true);
      if (does === "leave-fullscreen") return void leaveFullscreen();
      return;
    }
    const view = controls.view();
    if (key === "menu") return void (view.keys.menu && view.presence !== "hidden" && setOpen(!open));
    if (!/^[1-9]$/.test(key) || !view.keys.hotbar || view.presence !== "full") return;
    const item = view.hotbar.find((i) => i.key === key);
    if (item) return void press(item);
    const pin = view.pins.find((p) => p.key && p.key === key);
    if (pin) openPin(pin.id);
  };
  const onKey = (e) => {
    if (host.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    const at = e.composedPath()[0];
    if (at && (at.tagName === "INPUT" || at.tagName === "TEXTAREA" || at.isContentEditable)) return;
    if (e.key === "Escape" && !chatOnly) {
      const does = escapeDoes({ menuOpen: open, held: escapeHeld() });
      if (does !== "nothing") e.preventDefault();
      if (does === "close-menu") return setOpen(false);
      if (does === "open-menu") return setOpen(true);
      if (does === "leave-fullscreen") return void leaveFullscreen();
    }
    const view = controls.view();
    if (!chatOnly && view.keys.menu && e.key.toLowerCase() === view.keys.menu && view.presence !== "hidden") return setOpen(!open);
    if (view.keys.chat && view.chat.ready && view.presence !== "hidden" && !open && !e.repeat && (e.key.toLowerCase() === view.keys.chat || e.key === "Enter" && at?.tagName !== "BUTTON" && at?.tagName !== "A")) {
      e.preventDefault();
      return setChatOpen(true);
    }
    if (chatOnly || !view.keys.hotbar || view.presence !== "full") return;
    const item = view.hotbar.find((i) => i.key === e.key);
    if (item) return press(item);
    const pin = view.pins.find((p) => p.key && p.key === e.key);
    if (pin) openPin(pin.id);
  };
  addEventListener("keydown", onKey);
  full.addEventListener("click", () => {
    void fullscreenButton.press(controls).then(draw);
  });
  const stopLeft = onBrowserLeftFullscreen(() => {
    if (!open && !host.hidden) setOpen(true);
    draw();
  });
  document.addEventListener("fullscreenchange", draw);
  const onTabKey = (e) => {
    if (!open || host.hidden || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    const at = e.composedPath()[0];
    const onStrip = !!at && typeof at.tagName === "string" && tabs.contains(at);
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step && e.key !== "Home" && e.key !== "End") return;
    if (at && !onStrip && (at.tagName === "INPUT" || at.tagName === "TEXTAREA" || at.tagName === "SELECT" || at.isContentEditable)) return;
    const ids = controls.view().sections.map((x) => x.id);
    if (ids.length < 2) return;
    const now = Math.max(0, ids.indexOf(section));
    const to = step ? (now + step + ids.length) % ids.length : e.key === "Home" ? 0 : ids.length - 1;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (to === now) return;
    wanted = null;
    section = ids[to];
    chose = true;
    draw();
    tabs.querySelector('[aria-selected="true"]')?.focus();
  };
  addEventListener("keydown", onTabKey, true);
  const onSummonKey = (e) => {
    if (chatOnly || e.code !== SUMMON_KEY || host.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    const at = e.composedPath()[0];
    if (at && (at.tagName === "INPUT" || at.tagName === "TEXTAREA" || at.isContentEditable)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!e.repeat) setOpen(!open);
  };
  const swallow = (e) => {
    if (!chatOnly && e.code === SUMMON_KEY && !host.hidden && !e.ctrlKey && !e.metaKey && !e.altKey) e.stopImmediatePropagation();
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
    const line = el("div", { class: "say glass coming" }, text);
    line.addEventListener("animationend", () => line.classList.remove("coming"), { once: true });
    line.title = text;
    const away = () => {
      line.remove();
      fitSays();
    };
    line.addEventListener("click", (e) => {
      e.stopPropagation();
      away();
    });
    says.append(line);
    while (says.childElementCount > 3) says.firstElementChild?.remove();
    fitSays();
    const stays = sayStays(text);
    setTimeout(() => line.classList.add("going"), stays - 600);
    setTimeout(away, stays);
  });
  const stop = controls.subscribe(draw);
  const onPageFocus = () => {
    if (chatState === "open" && !host.hidden && (document.activeElement === document.body || document.activeElement === null)) chatField.focus({ preventScroll: true });
  };
  addEventListener("focus", onPageFocus);
  const stopAsking = controls.onSignal((name) => {
    if (name.startsWith("show:") && !host.hidden) setOpen(true, name.slice(5));
    if (name === "toggle:chat" && !host.hidden) setChatOpen(!(chatState === "open" && dockTab === "room"), "room");
    if (name === "toggle:feed" && !host.hidden) setChatOpen(!(chatState === "open" && dockTab === "feed"), "feed");
    if (name === "open:letters" && !host.hidden) setChatOpen(true, "letters");
  });
  const tick = setInterval(draw, 400);
  host.classList.add("arriving");
  setTimeout(() => host.classList.remove("arriving"), 1200);
  draw();
  const hud = {
    element: host,
    get open() {
      return open;
    },
    setOpen,
    get chatOpen() {
      return chatState === "open";
    },
    get chatTab() {
      return dockTab;
    },
    setChatOpen,
    bounds() {
      if (host.hidden) return [];
      return [id, menu, quiet, bar, target, loadingLine, sheet, ...chatState === "open" ? [chat] : []].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0).map((r) => ({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }));
    },
    cover() {
      if (host.hidden || !barShown(controls.presence)) return { top: 0, bottom: 0, left: 0, right: 0 };
      const low = bar.getBoundingClientRect();
      const high = id.getBoundingClientRect();
      return { top: Math.round(high.bottom), bottom: Math.round(innerHeight - low.top), left: 0, right: 0 };
    },
    pressKey,
    setHidden(hidden) {
      host.hidden = hidden;
      if (hidden) {
        setOpen(false);
        setChatOpen(false);
      }
    },
    remove() {
      clearInterval(tick);
      if (looking) clearInterval(looking);
      clearTimeout(asTimer);
      tabsWatch?.disconnect();
      barWatch?.disconnect();
      stopSliding();
      clearTimeout(peekTimer);
      clearTimeout(goingTimer);
      vv?.removeEventListener("resize", onViewport);
      vv?.removeEventListener("scroll", onViewport);
      stop();
      stopAsking();
      removeEventListener("focus", onPageFocus);
      removeEventListener("resize", onWindowSize);
      for (const type of INPUTS) removeEventListener(type, onInput, { capture: true });
      removeEventListener("blur", onBlurKeys);
      if (resized) clearTimeout(resized);
      for (const type of PRESS_ENDS) removeEventListener(type, pressOver, true);
      document.removeEventListener("visibilitychange", pressOver);
      stopSay();
      removeEventListener("keydown", onKey);
      stopLeft();
      document.removeEventListener("fullscreenchange", draw);
      removeEventListener("keydown", onSummonKey, listening);
      removeEventListener("keydown", onTabKey, true);
      removeEventListener("keyup", swallow, listening);
      for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"]) removeEventListener(type, onTouch, watching);
      hold.cancel();
      host.remove();
    }
  };
  keepSheet(hud, () => {
    if (host.hidden || !open) return { box: null, moving: false };
    const r = sheet.getBoundingClientRect();
    const moving = typeof sheet.getAnimations === "function" && sheet.getAnimations().some((a) => a.playState === "running");
    return { box: r.width > 0 && r.height > 0 ? { x: r.x, y: r.y, width: r.width, height: r.height } : null, moving };
  });
  return hud;
}
function mountHud(controls, opts = {}) {
  return mountMenu(portHere(controls), opts);
}
export {
  CHAT_KEY,
  DEFAULT_THEME,
  FEED_LIMITS,
  ICONS,
  PICTURES_KEY,
  PICTURE_LIMITS,
  SUMMON_HOLD,
  SUMMON_KEY,
  SUMMON_SLOP,
  UI_PRESETS,
  addDoorControls,
  ago,
  askWell,
  cleanTheme,
  createControls,
  createHeldButton,
  createHoldWatch,
  foundRelays,
  learnFrom,
  loadPicture,
  markSvg,
  mountHud,
  mountMenu,
  onChatChange,
  onPicturesChange,
  portHere,
  publishBacked,
  queryBacked,
  relayBackup,
  relaysWell,
  resolveTheme,
  sendWell,
  setShowsChat,
  setShowsPictures,
  showsChat,
  showsPictures,
  signInHere,
  vouchedWords
};
