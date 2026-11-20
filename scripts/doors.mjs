// Fetches the 360° pictures your doors show: what a visitor sees through a
// portal before they go (spec §5.8).
//
//   npm run doors                      every portal in home.json
//   npm run doors -- 37300:<key>:<name>   and any others your own code adds
//   npm run doors -- --from <folder>   take pictures from a folder first, by their hash
//
// A world says what it looks like in its announcement: a picture's address
// and its SHA-256. This asks your relays for each door's announcement,
// fetches the picture, checks it against that hash, and keeps it in doors/
// under the hash, with doors/index.json saying which door shows which. It
// notes there, too, what kind of place each world says it is (a game, an
// experience...), which the door's sign says under its name.
//
// The pictures are then served from your own site. So a visitor's browser
// asks nobody else for them, and no world a door leads to learns that someone
// stood near its door. Run this again when a door changes, or a world you
// link to has a new look.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkPreviewBytes, parseWorldEvent, portalTarget, queryRelays, verifyEvent, WORLD_KIND } from "../vendor/nswp/nswp-core.js";
import { readConfig, root } from "./lib.mjs";

const args = process.argv.slice(2);
const fromAt = args.indexOf("--from");
const from = fromAt >= 0 ? args[fromAt + 1] : null;
const named = args.filter((a, i) => !a.startsWith("--") && i !== fromAt + 1);
const { config, written } = readConfig();
const dir = join(root, "doors");
const indexPath = join(dir, "index.json");
/** The most a picture may weigh (the protocol's ceiling for a 360° preview). */
const MOST = 2 * 1024 * 1024;

// Every door: the portals in home.json, and any coordinate named on the command line.
const wanted = new Map();
for (const coordinate of [...(written.items ?? []).filter((item) => item.type === "portal").map((item) => String(item.args?.[0] ?? "")), ...named]) {
  const target = portalTarget(coordinate);
  if (target && "pubkey" in target) wanted.set(`${WORLD_KIND}:${target.pubkey}:${target.d}`, target);
  else if (coordinate) console.log(`  -  ${coordinate.slice(0, 60)} isn't a world's coordinate (37300:<key>:<name>), so it has no picture to fetch.`);
}
if (wanted.size === 0) {
  console.log("No doors to fetch pictures for. Add a portal to home.json, or name a world: npm run doors -- 37300:<key>:<name>");
  process.exit(0);
}

console.log(`Asking ${config.relays.length} relays about ${wanted.size} ${wanted.size === 1 ? "door" : "doors"}.`);
const targets = [...wanted.values()];
const found = await queryRelays(config.relays, { kinds: [WORLD_KIND], authors: [...new Set(targets.map((t) => t.pubkey))], "#d": [...new Set(targets.map((t) => t.d))] }, 8000).catch(() => ({ events: [] }));
const newest = new Map();
for (const event of found.events) {
  if (!verifyEvent(event)) continue;
  const world = parseWorldEvent(event);
  if (!world.ok) continue;
  const key = `${WORLD_KIND}:${event.pubkey}:${world.value.d}`;
  if (wanted.has(key) && (newest.get(key)?.at ?? -1) < event.created_at) newest.set(key, { at: event.created_at, world: world.value });
}

const kept = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : {};
const index = {};
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
let fetched = 0;
for (const key of wanted.keys()) {
  const world = newest.get(key)?.world;
  const short = `${key.slice(0, 14)}…${key.slice(key.lastIndexOf(":"))}`;
  if (!world) {
    // No relay answered about it: what was kept before stays.
    if (kept[key]) index[key] = kept[key];
    console.log(`  ?  ${short}: no relay had its announcement.${kept[key] ? " Keeping the picture from before." : ""}`);
    continue;
  }
  // What kind of place it says it is goes on the door's sign, picture or no picture. And where it is: a door that
  // shows what people thought of the place needs its address, to leave out a rating the place asked for itself.
  // And what it does with the things visitors carry (NSWP-17): a door to a place where items are part of play
  // says so on its sign, before anyone goes in.
  const said = { ...(world.category ? { category: world.category } : {}), ...(world.url ? { url: world.url } : {}), ...(world.items ? { items: world.items } : {}) };
  const noted = Object.keys(said).length > 0;
  const preview = world.previews.find((p) => p.type === "pano");
  if (!preview) {
    if (noted) index[key] = { title: world.title, ...said };
    console.log(`  -  ${world.title}: it has announced no 360° picture. Its door keeps its field of light.`);
    continue;
  }
  const file = join(dir, `${preview.sha256}.webp`);
  let bytes = existsSync(file) ? readFileSync(file) : null;
  if (bytes && sha256(bytes) !== preview.sha256) bytes = null;
  if (!bytes && from && existsSync(join(from, `${preview.sha256}.webp`))) bytes = readFileSync(join(from, `${preview.sha256}.webp`));
  if (!bytes) {
    try {
      if (!preview.url.startsWith("https://")) throw new Error("its address isn't https");
      const res = await fetch(preview.url, { signal: AbortSignal.timeout(20000), redirect: "error", credentials: "omit" });
      if (!res.ok) throw new Error(`its site said ${res.status}`);
      if (Number(res.headers.get("content-length") ?? 0) > MOST) throw new Error("it is larger than a picture may be");
      bytes = Buffer.from(await res.arrayBuffer());
      fetched++;
    } catch (e) {
      console.log(`  ✘  ${world.title}: the picture couldn't be fetched (${e.message}).${kept[key] ? " Keeping the one from before." : ""}`);
      if (kept[key]) index[key] = kept[key];
      else if (noted) index[key] = { title: world.title, ...said };
      continue;
    }
  }
  // The same check a browser makes before showing one: its size, what kind of file it is, and its hash.
  const checked = checkPreviewBytes(preview, new Uint8Array(bytes));
  if (!checked.ok) {
    console.log(`  ✘  ${world.title}: the picture isn't what its announcement promised (${checked.message}). Not kept.`);
    if (noted) index[key] = { title: world.title, ...said };
    continue;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, bytes);
  index[key] = { sha256: preview.sha256, title: world.title, ...said };
  console.log(`  ✔  ${world.title}: ${(bytes.length / 1024).toFixed(0)} KB`);
}

mkdirSync(dir, { recursive: true });
// Pictures no door shows any more are put away.
const used = new Set(Object.values(index).map((entry) => entry.sha256).filter(Boolean));
for (const f of readdirSync(dir)) if (/^[0-9a-f]{64}\.webp$/.test(f) && !used.has(f.slice(0, 64))) rmSync(join(dir, f));
writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`\n${Object.values(index).filter((entry) => entry.sha256).length} of ${wanted.size} doors have a picture${fetched ? `, ${fetched} fetched just now` : ""}. They are in doors/, and the next build ships them.`);
