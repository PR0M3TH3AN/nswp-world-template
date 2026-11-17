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
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { buildSite, dist, root } from "./lib.mjs";

let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error("This needs the optional package playwright-core. Run: npm install playwright-core");
  process.exit(1);
}
const { config } = await buildSite();
if (new URL(config.world.url).hostname === "example.com") {
  console.error("✘ world.json still has the placeholder address. The preview's address is built from `url`, so set that first.");
  process.exit(1);
}

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp" };
const server = await new Promise((resolve) => {
  const s = createServer((req, res) => {
    let file = join(dist, normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)));
    if (!file.startsWith(dist)) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  s.listen(0, "127.0.0.1", () => resolve(s));
});

let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
} catch (e) {
  server.close();
  console.error(`Couldn't start Google Chrome. Is it installed?\n${e.message.split("\n")[0]}`);
  process.exit(1);
}
let shot;
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => window.__nswpTest?.state?.ready === true, null, { timeout: 30000 });
  await page.waitForTimeout(2500); // let pictures and portal names arrive
  shot = await page.evaluate(() => window.__nswpTest.capturePreview(2048));
  if (errors.length) throw new Error(errors.join("; "));
} finally {
  await browser.close();
  server.close();
}

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
