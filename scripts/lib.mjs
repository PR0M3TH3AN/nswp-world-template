// Shared by the scripts: reading the world's files, and building the site.
import { build as esbuild, context } from "esbuild";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildLayoutEvent, buildWorldEvent, decodeNpub, parseLayoutEvent, parseWorldEvent, verifyEvent } from "../vendor/nswp/nswp-core.js";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const dist = join(root, "dist");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const PICTURES = join(root, "pictures");
const MAX_PICTURE_BYTES = 1024 * 1024; // the protocol's ceiling for a picture in a frame

/**
 * A frame in home.json may name a file in pictures/ instead of an address and
 * a hash. This fills both in, so the owner never works out a hash by hand.
 */
function resolvePictures(config, home) {
  const files = [];
  const problems = [];
  const items = (Array.isArray(home.items) ? home.items : []).map((item) => {
    const name = item?.type === "frame" ? item.args?.[0] : undefined;
    if (typeof name !== "string" || /^https?:/i.test(name)) return item;
    const file = join(PICTURES, name);
    if (basename(name) !== name || !existsSync(file)) {
      problems.push(`home.json: a frame names "${name}", but there is no such file in pictures/.`);
      return item;
    }
    const bytes = readFileSync(file);
    if (bytes.length > MAX_PICTURE_BYTES) {
      problems.push(`pictures/${name} is ${(bytes.length / 1024 / 1024).toFixed(1)} MB. A picture in a frame can be 1 MB at most; save a smaller copy.`);
      return item;
    }
    files.push(name);
    return { ...item, args: [new URL(`pictures/${encodeURIComponent(name)}`, config.world.url).href, createHash("sha256").update(bytes).digest("hex")] };
  });
  return { home: { ...home, items }, files, problems };
}

/**
 * world.json and home.json, as written by the world's owner. `written` is
 * home.json untouched; `home` has its pictures' addresses and hashes filled in.
 */
export function readConfig() {
  const config = readJson(join(root, "world.json"));
  const written = readJson(join(root, "home.json"));
  const { home, files, problems } = resolvePictures(config, written);
  return { config, home, written, pictures: { files, problems } };
}

/** Where this world's publisher key is kept. Never inside the repository. */
export function keyPath(config) {
  return process.env.NSWP_KEY_FILE ?? join(homedir(), ".config", "nswp", `${config.world.d}.key`);
}

/** The unsigned events that world.json and home.json describe right now. */
export function templates({ config, home }) {
  return { world: buildWorldEvent(config.world), layout: buildLayoutEvent(home) };
}

/** The signed events in signed/, if `npm run sign` has been run. Each is checked. */
export function readSigned() {
  const out = {};
  for (const name of ["world", "layout"]) {
    const path = join(root, "signed", `${name}.event.json`);
    if (!existsSync(path)) continue;
    const event = readJson(path);
    if (!verifyEvent(event)) throw new Error(`signed/${name}.event.json has a bad signature; run \`npm run sign\` again`);
    out[name] = event;
  }
  return out;
}

/** True when a signed event still says what the file it was made from says. */
export function upToDate(signed, template) {
  return JSON.stringify(signed.tags) === JSON.stringify(template.tags) && signed.content === template.content;
}

/** Problems in world.json and home.json, as { errors, warnings } of plain sentences. */
export function validate({ config, home, pictures }) {
  const errors = [...(pictures?.problems ?? [])];
  const warnings = [];
  const t = templates({ config, home });
  const world = parseWorldEvent(t.world);
  const layout = parseLayoutEvent(t.layout);
  for (const [name, r] of [["world.json", world], ["home.json", layout]]) {
    if (!r.ok) errors.push(...r.errors.map((e) => `${name}: ${e.message}`));
    warnings.push(...r.warnings.map((w) => `${name}: ${w.message}`));
  }
  if (!config.entryPoints?.["main-entrance"]) errors.push('world.json: entryPoints needs a "main-entrance".');
  // Who the world is for is the builder's to say, and a site that keeps adult worlds out reads it.
  if (config.world?.audience === undefined) warnings.push('world.json: say who this world is for with "audience": "kids", "general" (not made for kids) or "adult" (NSFW). Without it, sites that are careful may not list it.');
  else if (!["kids", "general", "adult"].includes(config.world.audience)) errors.push('world.json: "audience" is "kids", "general" or "adult".');
  if (config.owner !== undefined && ownerKey(config) === null) errors.push('world.json: "owner" isn\'t a public key. It is your own, the way your sign-in shows it: npub1… and 63 characters long. Never a secret key.');
  return { errors, warnings, world: world.ok ? world.value : null, layout: layout.ok ? layout.value : null };
}

/** Everything the build needs: the owner's two files, and the signed events if there are any. */
export function readState() {
  return { ...readConfig(), signed: readSigned() };
}

/**
 * The owner's own public key, when world.json names one: the identity they sign in with, as an npub or hex. It
 * is a different key from the one this folder signs with, which lives in a file and never leaves this computer.
 * Null when it is there and isn't a key; undefined when it isn't there.
 */
export function ownerKey(config) {
  if (config.owner === undefined || config.owner === "") return undefined;
  if (typeof config.owner !== "string" || /^nsec/i.test(config.owner.trim())) return null;
  try {
    return decodeNpub(config.owner);
  } catch {
    return null;
  }
}

/** The manifest this site serves at /.well-known/nswp.json (spec §7). */
export function manifestFor(config, publisher) {
  const w = config.world;
  const owner = ownerKey(config);
  return {
    schema: "nswp/manifest/0.3",
    listing: "allow",
    // Who may announce this world: the key this folder signs with, and the owner's own key if they named it. The
    // second is what lets them show the world is theirs, for making it their home.
    publishers: { [publisher]: { worlds: [w.d] }, ...(owner && owner !== publisher ? { [owner]: { worlds: [w.d] } } : {}) },
    worlds: {
      [w.d]: {
        entry: { url: w.url, modes: w.modes ?? [] },
        entry_points: Object.keys(config.entryPoints),
        capabilities: w.capabilities ?? [],
        ...(w.capabilities?.includes("rooms") ? { rooms: { transports: ["mesh"], max_mesh: 8 } } : {}),
        airlock: config.airlock,
      },
    },
    relays: config.relays,
  };
}

const vendor = (file) => join(root, "vendor", "nswp", file);
const ALIASES = {
  "@nswp/core": vendor("nswp-core.js"),
  "nswp-sdk": vendor("sdk/index.js"),
  "nswp-sdk/three": vendor("sdk/three.js"),
  "nswp-sdk/home": vendor("sdk/home.js"),
  "nswp-sdk/ui": vendor("sdk/ui.js"),
  "nswp-sdk/terminal": vendor("sdk/terminal.js"),
};
const nswpPlugin = {
  name: "nswp",
  setup(b) {
    // The protocol library and SDK come from vendor/.
    b.onResolve({ filter: /^(@nswp\/core|nswp-sdk(\/(three|home|ui|terminal))?)$/ }, (args) => ({ path: ALIASES[args.path] }));
    // "virtual:site" is what the page reads at start: the layout to draw, and
    // who publishes this world. It is made from home.json and signed/ at build
    // time, so editing either one rebuilds the page.
    b.onResolve({ filter: /^virtual:site$/ }, () => ({ path: "site", namespace: "nswp-site" }));
    b.onLoad({ filter: /.*/, namespace: "nswp-site" }, () => {
      const state = readState();
      return {
        warnings: state.pictures.problems.map((text) => ({ text })),
        contents: JSON.stringify({ layout: templates(state).layout, publisher: state.signed.world?.pubkey ?? null }),
        loader: "json",
        watchFiles: [join(root, "home.json"), join(root, "world.json"), join(root, "src", "index.html"), join(root, "signed", "world.event.json"), ...state.pictures.files.map((f) => join(PICTURES, f))],
        watchDirs: existsSync(PICTURES) ? [PICTURES] : [],
      };
    });
  },
};

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Everything in dist/ that isn't the script bundle. */
function writeStatic({ config, signed, pictures }) {
  const w = config.world;
  const html = readFileSync(join(root, "src", "index.html"), "utf8").replaceAll("%TITLE%", escapeHtml(w.title)).replaceAll("%SUMMARY%", escapeHtml(w.summary ?? ""));
  writeFileSync(join(dist, "index.html"), html);
  if (existsSync(join(root, "previews"))) {
    mkdirSync(join(dist, "previews"), { recursive: true });
    for (const f of readdirSync(join(root, "previews"))) if (/^[0-9a-f]{64}\.webp$/.test(f)) cpSync(join(root, "previews", f), join(dist, "previews", f));
  }
  if (pictures.files.length) {
    mkdirSync(join(dist, "pictures"), { recursive: true });
    for (const f of pictures.files) cpSync(join(PICTURES, f), join(dist, "pictures", f));
  }
  if (signed.world) {
    mkdirSync(join(dist, ".well-known"), { recursive: true });
    writeFileSync(join(dist, ".well-known", "nswp.json"), `${JSON.stringify(manifestFor(config, signed.world.pubkey), null, 2)}\n`);
  }
  // Response headers, in the two forms static hosts read. Other hosts: see the README.
  const csp = ["default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "connect-src 'self' https: wss:", "base-uri 'none'", "form-action 'none'"].join("; ");
  const all = [
    ["Content-Security-Policy", csp],
    ["Referrer-Policy", "no-referrer"],
    ["X-Content-Type-Options", "nosniff"],
    ["Permissions-Policy", "xr-spatial-tracking=(self), microphone=(self)"],
  ];
  const open = [["Access-Control-Allow-Origin", "*"]];
  const rules = [
    ["/*", "/(.*)", all],
    ["/.well-known/nswp.json", "/.well-known/nswp.json", [...open, ["Content-Type", "application/json; charset=utf-8"], ["Cache-Control", "public, max-age=300"]]],
    ["/previews/*", "/previews/(.*)", [...open, ["Cache-Control", "public, max-age=31536000, immutable"]]],
    // Open, so another renderer drawing this home can fetch a picture and check its hash.
    ["/pictures/*", "/pictures/(.*)", open],
  ];
  writeFileSync(join(dist, "vercel.json"), `${JSON.stringify({ headers: rules.map(([, source, h]) => ({ source, headers: h.map(([key, value]) => ({ key, value })) })) }, null, 2)}\n`);
  writeFileSync(join(dist, "_headers"), `${rules.map(([path, , h]) => `${path}\n${h.map(([k, v]) => `  ${k}: ${v}`).join("\n")}`).join("\n\n")}\n`);
}

function options(dev) {
  return {
    entryPoints: { app: join(root, "src", "main.ts") },
    bundle: true,
    splitting: true,
    format: "esm",
    target: "es2022",
    minify: !dev,
    sourcemap: dev,
    outdir: dist,
    chunkNames: "chunks/[name]-[hash]",
    legalComments: "linked",
    logLevel: "warning",
    plugins: [nswpPlugin],
  };
}

/** Build the site into dist/. */
export async function buildSite() {
  const state = readState();
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  await esbuild(options(false));
  writeStatic(state);
  return state;
}

/** Build, then keep rebuilding as files change, and serve dist/ on localhost. */
export async function serveSite(port) {
  const state = readState();
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  const ctx = await context({
    ...options(true),
    plugins: [
      nswpPlugin,
      {
        name: "static",
        setup(b) {
          b.onEnd((result) => {
            if (result.errors.length === 0) writeStatic(readState());
          });
        },
      },
    ],
  });
  await ctx.watch();
  const server = await ctx.serve({ servedir: dist, port, host: "127.0.0.1" });
  return { ...state, port: server.port ?? port, stop: () => ctx.dispose() };
}
