// Checks that this world still follows the protocol's rules. Run it after any
// change, by hand or by an AI assistant:  npm run check
//
// It fails (exit code 1) on anything marked ✘. A line marked ! is worth reading
// but doesn't fail the check.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseManifest, parseWorldEvent, verifyOrigin } from "../vendor/nswp/nswp-core.js";
import { dist, readConfig, readSigned, root, templates, upToDate, validate } from "./lib.mjs";

let failed = 0;
const ok = (msg) => console.log(`✔ ${msg}`);
const warn = (msg) => console.log(`! ${msg}`);
const bad = (msg) => {
  failed++;
  console.log(`✘ ${msg}`);
};
const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

const PLUMBING = join(root, "src", "plumbing");
const LOCK = join(root, "vendor", "plumbing.json");
const plumbingHashes = () => Object.fromEntries(walk(PLUMBING).map((f) => [relative(PLUMBING, f), sha256(f)]).sort());
if (process.argv.includes("--lock-plumbing")) {
  // For maintainers of the template: record the plumbing as shipped.
  writeFileSync(LOCK, `${JSON.stringify(plumbingHashes(), null, 2)}\n`);
  console.log("recorded src/plumbing/ in vendor/plumbing.json");
  process.exit(0);
}

// 1. The two files the owner writes.
const files = readConfig();
const v = validate(files);
for (const e of v.errors) bad(e);
for (const w of v.warnings) warn(w);
if (v.errors.length === 0) ok("world.json and home.json are valid");
const placeholder = new URL(files.config.world.url).hostname === "example.com";
if (placeholder) warn("world.json still has the placeholder address (example.com). Set `url` before you announce this world.");

// 2. Nothing in your own code breaks the three rules.
const RULES = [
  {
    what: "leaves this site without a portal. Use ctx.addPortal(), so the visitor's Airlock shows them where they are going",
    test: /\blocation\s*\.\s*(assign|replace)\s*\(|\blocation(\s*\.\s*href)?\s*=(?!=)|\bwindow\s*\.\s*open\s*\(|<a\s[^>]*href\s*=\s*["']https?:/i,
  },
  {
    what: "asks for a password, a key or a signer. A world never needs one, and a place that asks looks like a phishing page",
    test: /type\s*=\s*["']password["']|\bnsec1|\bwindow\s*\.\s*nostr\b|autocomplete\s*=\s*["'](current|new)-password/i,
  },
  {
    what: "loads code from another site. Keep every script in this folder, so nothing foreign can read how a visitor arrived",
    test: /<script[^>]+src\s*=\s*["'](https?:)?\/\/|\bimport\s*\(\s*["'`]https?:|\bfrom\s+["']https?:|\bimportScripts\s*\(/i,
  },
];
let ruleHits = 0;
for (const file of walk(join(root, "src"))) {
  if (file.startsWith(PLUMBING)) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (rule.test.test(line)) {
        ruleHits++;
        bad(`${relative(root, file)}:${i + 1} ${rule.what}.`);
      }
    }
  });
}
if (ruleHits === 0) ok("your code keeps to portals, asks for no credentials and loads no outside scripts");

// 3. The page still starts through the plumbing.
const main = readFileSync(join(root, "src", "main.ts"), "utf8");
if (/from\s+["']\.\/plumbing\/boot(\.js)?["']/.test(main) && /startWorld\s*\(/.test(main)) ok("src/main.ts starts the world through the plumbing");
else bad("src/main.ts no longer calls startWorld() from ./plumbing/boot. That is what reads and scrubs the arrival context.");
if (!/id\s*=\s*["']stage["']/.test(readFileSync(join(root, "src", "index.html"), "utf8"))) bad('src/index.html has no element with id="stage" for the world to be drawn in.');
if (existsSync(LOCK)) {
  const shipped = JSON.parse(readFileSync(LOCK, "utf8"));
  const now = plumbingHashes();
  const changed = [...new Set([...Object.keys(shipped), ...Object.keys(now)])].filter((f) => shipped[f] !== now[f]);
  if (changed.length) warn(`src/plumbing/ differs from the template (${changed.join(", ")}). That's allowed. The rules in AGENTS.md are then yours to keep by hand.`);
  else ok("src/plumbing/ is as the template shipped it");
}

// 4. The vendored protocol library is untouched.
try {
  execFileSync(process.execPath, [join(root, "scripts", "vendor.mjs"), "--check"], { stdio: "pipe" });
  ok("vendor/nswp/ matches its integrity record");
} catch (e) {
  bad(`vendor/nswp/ has been changed by hand. Restore it; fixes belong in the NSWP repository.\n${e.stderr?.toString().trim() ?? ""}`);
}

// 5. The announcement, the manifest, and whether they agree.
let signed = {};
try {
  signed = readSigned();
} catch (e) {
  bad(e.message);
}
if (!signed.world) {
  warn("This world isn't signed yet, so it can't be verified. When you're ready: npm run keygen, then npm run sign.");
} else {
  const t = templates(files);
  if (!upToDate(signed.world, t.world)) bad("world.json has changed since it was signed. Run `npm run sign` again.");
  if (signed.layout && !upToDate(signed.layout, t.layout)) bad("home.json has changed since it was signed. Run `npm run sign` again.");
  if (signed.layout && signed.layout.pubkey !== signed.world.pubkey) bad("The announcement and the home layout were signed by different keys.");
  const manifestPath = join(dist, ".well-known", "nswp.json");
  if (!existsSync(manifestPath)) bad("dist/.well-known/nswp.json is missing. Run `npm run build`.");
  else {
    const manifest = parseManifest(JSON.parse(readFileSync(manifestPath, "utf8")), { byteLength: statSync(manifestPath).size });
    const world = parseWorldEvent(signed.world);
    if (!manifest.ok) bad(`The manifest is invalid: ${manifest.errors.map((e) => e.message).join(" ")}`);
    else if (!world.ok) bad(`The signed announcement is invalid: ${world.errors.map((e) => e.message).join(" ")}`);
    else {
      const result = verifyOrigin(world.value, manifest.value, new URL("/.well-known/nswp.json", world.value.url).href);
      if (result.verified) ok(`the manifest vouches for the announcement: this world will show as verified at ${new URL(world.value.url).host}`);
      else for (const c of result.checks.filter((c) => !c.ok)) bad(`Not verified: ${c.message}`);
    }
  }
}

// 6. The preview, if there is one.
for (const p of files.config.world.previews ?? []) {
  const file = join(root, "previews", `${p.sha256}.webp`);
  if (!existsSync(file)) bad(`world.json names a preview that isn't in previews/ (${p.sha256.slice(0, 12)}…). Run \`npm run preview\`.`);
  else if (sha256(file) !== p.sha256) bad(`previews/${p.sha256.slice(0, 12)}….webp doesn't match its name. Run \`npm run preview\`.`);
  else ok("the preview picture matches the hash in world.json");
}

console.log(failed ? `\n${failed} problem${failed === 1 ? "" : "s"} to fix.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
