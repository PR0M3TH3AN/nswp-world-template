// Takes this world's preview: a 360° picture from the main entrance, which a
// door or portal elsewhere can show before anyone comes here (spec §5.8).
//
//   npm run preview
//
// It opens the built world in headless Chrome, asks it to photograph itself,
// saves the file under its SHA-256 in previews/, and records it in world.json.
// Needs Google Chrome installed. Sign again afterwards: the picture's hash is
// part of the announcement.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { withWorld } from "./chrome.mjs";
import { buildSite, root } from "./lib.mjs";

const { config } = await buildSite();
if (new URL(config.world.url).hostname === "example.com") {
  console.error("✘ world.json still has the placeholder address. The preview's address is built from `url`, so set that first.");
  process.exit(1);
}
const shot = await withWorld((page) => page.evaluate(() => window.__nswpTest.capturePreview(2048)));

const bytes = Buffer.from(shot.base64, "base64");
const sha256 = createHash("sha256").update(bytes).digest("hex");
const dir = join(root, "previews");
mkdirSync(dir, { recursive: true });
for (const f of readdirSync(dir)) if (f.endsWith(".webp")) rmSync(join(dir, f));
writeFileSync(join(dir, `${sha256}.webp`), bytes);
const path = join(root, "world.json");
const file = JSON.parse(readFileSync(path, "utf8"));
file.world.previews = [{ url: new URL(`previews/${sha256}.webp`, file.world.url).href, type: "pano", sha256, width: shot.width, height: shot.height }];
writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`);
console.log(`✔ previews/${sha256}.webp (${shot.width}×${shot.height}, ${bytes.length} bytes)`);
console.log("world.json now names it. Next: npm run sign, npm run build, deploy, npm run announce.");
