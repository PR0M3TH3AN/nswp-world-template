// Publishes this world's signed announcement and home layout to Nostr relays.
//
//   npm run announce            show what would be sent, and send nothing
//   npm run announce -- --yes   send it
//
// Publishing is public and can't be taken back, so it never happens by default.
import { publishEvent } from "../vendor/nswp/nswp-core.js";
import { readConfig, readSigned, templates, upToDate } from "./lib.mjs";

const files = readConfig();
const signed = readSigned();
if (!signed.world || !signed.layout) {
  console.error("Nothing to announce yet. Run `npm run sign` first.");
  process.exit(1);
}
const t = templates(files);
for (const name of ["world", "layout"]) {
  if (!upToDate(signed[name], t[name])) {
    console.error(`✘ ${name === "world" ? "world.json" : "home.json"} has changed since it was signed. Run \`npm run sign\` again.`);
    process.exit(1);
  }
}
const relays = files.config.relays;
console.log(`World:  ${files.config.world.title} at ${files.config.world.url}`);
console.log(`Signed by: ${signed.world.pubkey}`);
console.log(`Relays: ${relays.join(", ")}`);
if (!process.argv.includes("--yes")) {
  console.log("\nNothing was sent. To publish both events to these relays: npm run announce -- --yes");
  process.exit(0);
}
let failed = 0;
for (const [name, event] of Object.entries(signed)) {
  const result = await publishEvent(relays, event);
  for (const [relay, status] of Object.entries(result.relays)) {
    const ok = status === "ok";
    console.log(`  ${ok ? "✔" : "✘"} ${name} → ${relay}${ok ? "" : ` (${status})`}`);
    if (!ok) failed++;
  }
}
process.exit(failed === relays.length * 2 ? 1 : 0);
