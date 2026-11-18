// Opens the built world in headless Google Chrome, for the scripts that need
// to see it: `npm run preview` and `npm run look`.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { dist } from "./lib.mjs";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

/** Serve dist/ on a free local port. */
function serveDist() {
  return new Promise((resolve) => {
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
}

/**
 * Run `use(page)` against the built world once its scene is up, and return
 * what it returns. Exits with a plain message if Chrome can't be started.
 */
export async function withWorld(use, { width = 1280, height = 720 } = {}) {
  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    console.error("This needs the optional package playwright-core. Run: npm install playwright-core");
    process.exit(1);
  }
  const server = await serveDist();
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  } catch (e) {
    server.close();
    console.error(`Couldn't start Google Chrome. Is it installed?\n${e.message.split("\n")[0]}`);
    process.exit(1);
  }
  try {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => window.__nswpTest?.state?.ready === true, null, { timeout: 30000 });
    await page.waitForTimeout(2500); // let pictures and portal names arrive
    const result = await use(page);
    if (errors.length) throw new Error(`The page reported an error: ${errors.join("; ")}`);
    return result;
  } finally {
    await browser.close();
    server.close();
  }
}
