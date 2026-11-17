// Builds the site into dist/: plain static files you can host anywhere.
import { buildSite, validate } from "./lib.mjs";

const state = await buildSite();
const { errors, warnings } = validate(state);
for (const w of warnings) console.warn(`! ${w}`);
for (const e of errors) console.error(`✘ ${e}`);
if (errors.length) process.exit(1);
console.log("built dist/");
if (!state.signed.world) console.log("  Not announced yet, so no manifest was written. When you're ready: npm run keygen, then npm run sign.");
