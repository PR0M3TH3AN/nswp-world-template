// Takes the newest NSWP kit into this world, from the template it was made from.
//
//   npm run update              take it in
//   npm run update -- --check   say whether a newer one is out, and change nothing
//
// A world carries its own copy of the kit: nothing loads it from anywhere else
// while the world runs. So a world's copy grows old, and this is how it is
// made new again. What comes in is a change to files in this folder, which you
// can read before you build and upload it. Nothing here builds, uploads or
// announces anything.
//
// What is replaced is what the template owns, and you were never meant to edit:
//
//   vendor/                          the NSWP library, SDK and command-line tool
//   src/plumbing/                    what reads the arrival, draws the controls and runs the doors
//   scripts/                         these tools
//   .github/workflows/update-kit.yml the job that runs this for you
//
// What is yours is never touched: world.json, home.json, src/main.ts,
// src/scenes/, pictures/, sounds/, your README. package.json is yours too: only
// the versions of the tools the template needs are brought up to the template's.
//
// It needs git, and this folder to be a git repository. To take the kit from
// somewhere other than the template's own repository (a fork you trust), set
// NSWP_TEMPLATE to its address.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const UPSTREAM = process.env.NSWP_TEMPLATE || "https://github.com/PR0M3TH3AN/nswp-world-template.git";
const BRANCH = process.env.NSWP_TEMPLATE_BRANCH || "main";
/** What the template owns. Everything else in the folder is the world's own. */
export const OWNED = ["vendor", "src/plumbing", "scripts", ".github/workflows/update-kit.yml"];
const checkOnly = process.argv.includes("--check");

const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const tryGit = (...args) => {
  try {
    return git(...args);
  } catch {
    return null;
  }
};
const stop = (message) => {
  console.error(message);
  process.exit(1);
};

/** The kit's version, read out of the library's own file. A kit from before it said so has none. */
export const kitIn = (text) => /KIT_VERSION\s*=\s*"(\d+\.\d+\.\d+)"/.exec(text ?? "")?.[1] ?? null;
const said = (version) => version ?? "one from before kits said their version (0.20.0 or older)";

/** What changed in the tools the template needs, as [name, from, to]. Only ever towards what the template has. */
export function toolChanges(mine, theirs) {
  const out = [];
  for (const group of ["devDependencies", "optionalDependencies"]) {
    for (const [name, version] of Object.entries(theirs[group] ?? {})) {
      const have = mine[group]?.[name];
      if (have !== version) out.push([group, name, have ?? null, version]);
    }
  }
  return out;
}
/** Commands the template has that this world's package.json doesn't yet. A command the owner has is never changed. */
export function newCommands(mine, theirs) {
  return Object.entries(theirs.scripts ?? {}).filter(([name]) => !(name in (mine.scripts ?? {})));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (tryGit("rev-parse", "--is-inside-work-tree") !== "true") stop("This folder isn't a git repository, so there is nothing to compare a newer kit with.\nRun: git init && git add -A && git commit -m \"My world\"   and try again.");

  // The newest template, fetched and not merged: nothing of this world's changes until the files are copied below.
  try {
    git("fetch", "--quiet", "--depth", "1", UPSTREAM, BRANCH);
  } catch (err) {
    stop(`Couldn't reach the template at ${UPSTREAM}.\n${String(err.stderr ?? err.message ?? err).trim().split("\n").pop()}`);
  }
  const theirs = git("rev-parse", "FETCH_HEAD");
  const mineKit = kitIn(existsSync(join(root, "vendor/nswp/nswp-core.js")) ? readFileSync(join(root, "vendor/nswp/nswp-core.js"), "utf8") : "");
  const theirKit = kitIn(tryGit("show", "FETCH_HEAD:vendor/nswp/nswp-core.js"));
  // The same files already? Then there is nothing to take, whatever the versions say.
  const differs = OWNED.some((path) => (tryGit("rev-parse", `FETCH_HEAD:${path}`) ?? "none") !== (tryGit("rev-parse", `HEAD:${path}`) ?? "none"));

  if (!differs) {
    console.log(`Up to date: this world has kit ${said(mineKit)}, and so does the template.`);
    process.exit(0);
  }
  if (checkOnly) {
    console.log(`A newer kit is out.\n  This world: ${said(mineKit)}\n  The template: ${said(theirKit)}\nRun  npm run update  to take it in. Your world's own files are left alone.`);
    process.exit(0);
  }

  // Nothing of the owner's is ever overwritten unseen: what would be replaced must be as it was last committed.
  const dirty = git("status", "--porcelain", "--", ...OWNED);
  if (dirty) stop(`These would be replaced, and have changes that aren't committed:\n${dirty}\nCommit them or put them back (git checkout -- <path>), then run this again.`);

  for (const path of OWNED) {
    tryGit("rm", "-r", "-q", "--ignore-unmatch", "--", path);
    if (tryGit("cat-file", "-e", `FETCH_HEAD:${path}`) !== null) git("checkout", "FETCH_HEAD", "--", path);
  }

  // The tools the template needs, at the versions it needs them. Everything else in package.json is the world's.
  const pkgPath = join(root, "package.json");
  const mine = JSON.parse(readFileSync(pkgPath, "utf8"));
  const upstream = JSON.parse(git("show", "FETCH_HEAD:package.json"));
  const tools = toolChanges(mine, upstream);
  const commands = newCommands(mine, upstream);
  for (const [group, name, , version] of tools) (mine[group] ??= {})[name] = version;
  for (const [name, command] of commands) (mine.scripts ??= {})[name] = command;
  if (tools.length || commands.length) writeFileSync(pkgPath, `${JSON.stringify(mine, null, 2)}\n`);

  const notes = [
    `This takes in the NSWP kit from the template (${UPSTREAM}, ${theirs.slice(0, 7)}).`,
    "",
    `- The kit: ${said(mineKit)} → ${said(theirKit)}`,
    "- Replaced: `vendor/`, `src/plumbing/`, `scripts/` and the update job. Nothing of the world's own was touched.",
    ...tools.map(([, name, from, to]) => `- A tool the template needs: \`${name}\` ${from ?? "(new)"} → ${to}`),
    ...commands.map(([name]) => `- A new command: \`npm run ${name}\``),
    "",
    "What changed in each version is in the protocol's changelog: https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/CHANGELOG.md",
    "",
    "Before merging: `npm install`, `npm run check`, and look at the world. Then build and upload as usual. Nothing was built, uploaded or announced by this.",
  ].join("\n");
  if (process.env.NSWP_UPDATE_NOTES) writeFileSync(process.env.NSWP_UPDATE_NOTES, `${notes}\n`);
  console.log(`${notes}\n`);
  console.log(tools.length ? "Next: npm install, then npm run check." : "Next: npm run check.");
}
