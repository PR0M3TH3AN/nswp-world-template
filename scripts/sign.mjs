// Signs this world's announcement and its home layout with your publisher key.
//
//   npm run keygen   make a key (once). It is kept outside this folder.
//   npm run sign     sign world.json and home.json into signed/
//
// Signed events are public and belong in the repository. The key never does.
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { doorPictureOwed, finalizeEvent, getPublicKey } from "../vendor/nswp/nswp-core.js";
import { keyPath, readConfig, root, templates, validate } from "./lib.mjs";

const files = readConfig();
const path = keyPath(files.config);

if (process.argv.includes("--keygen")) {
  if (existsSync(path)) {
    console.error(`A key already exists at ${path}. It was left alone.`);
    process.exit(1);
  }
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  writeFileSync(path, `${randomBytes(32).toString("hex")}\n`, { mode: 0o600 });
  chmodSync(path, 0o600);
  console.log(`Made a publisher key at ${path}`);
  console.log("Back it up somewhere safe. Whoever holds it can speak for this world, and it can't be recovered.");
}

if (!existsSync(path)) {
  console.error(`No key at ${path}. Run \`npm run keygen\` first, or set NSWP_KEY_FILE.`);
  process.exit(1);
}
const hex = readFileSync(path, "utf8").trim();
if (!/^[0-9a-f]{64}$/.test(hex)) {
  console.error(`${path} must hold a 64-character hex key.`);
  process.exit(1);
}
const key = Uint8Array.from(hex.match(/../g).map((b) => parseInt(b, 16)));
console.log(`Publisher: ${getPublicKey(key)}`);
if (process.argv.includes("--keygen")) process.exit(0);

const { errors, warnings } = validate(files);
for (const w of warnings) console.warn(`! ${w}`);
for (const e of errors) console.error(`✘ ${e}`);
if (errors.length) process.exit(1);
if (new URL(files.config.world.url).hostname === "example.com") {
  console.error("✘ world.json still has the placeholder address. Set `url` to where this world will live before signing.");
  process.exit(1);
}
// A world must have the picture its doors show (NSWP-04): its hash is part of what is signed here.
if (doorPictureOwed(files.config.world)) {
  console.error("✘ This world has no 360° picture yet, and a world must have one: it is what a door to your world shows. Take it with `npm run preview` (it needs Google Chrome), then sign.");
  process.exit(1);
}
const t = templates(files);
mkdirSync(join(root, "signed"), { recursive: true });
for (const name of ["world", "layout"]) {
  writeFileSync(join(root, "signed", `${name}.event.json`), `${JSON.stringify(finalizeEvent(t[name], key), null, 2)}\n`);
  console.log(`✔ signed/${name}.event.json`);
}
console.log("Next: npm run build, deploy dist/, then npm run announce.");
