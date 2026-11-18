// Takes a picture of the world as a visitor would see it, without opening a
// browser. For anyone who can't look at the screen: an AI assistant, or a
// check before committing.
//
//   npm run look                       from the main entrance
//   npm run look -- --at 2,-3          standing at x=2, z=-3
//   npm run look -- --at 2,-3 --yaw 90 and turned 90° to the left
//   npm run look -- --around           four pictures, one each way
//
// Writes look.png (or look-0.png … look-270.png) in this folder. Needs Google
// Chrome installed. The picture comes from Chrome's software renderer, so it
// is slower and a little rougher than a real screen: trust it for what is
// where and how bright it is, not for fine detail.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { withWorld } from "./chrome.mjs";
import { buildSite, root } from "./lib.mjs";

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
};
const at = arg("--at")?.split(",").map(Number);
if (at && (at.length !== 2 || at.some(Number.isNaN))) {
  console.error("--at takes two numbers: x,z in metres. For example: --at 2,-3");
  process.exit(1);
}
const yaw = Number(arg("--yaw") ?? 0);
const around = process.argv.includes("--around");

await buildSite();
const shots = await withWorld(async (page) => {
  // Only the scene: the page's buttons would cover part of it.
  await page.addStyleTag({ content: ".title, .hud { display: none !important; }" });
  if (at) await page.evaluate(([x, z]) => window.__nswpTest.teleport(x, z), at);
  const out = [];
  for (const turn of around ? [0, 90, 180, 270] : [null]) {
    if (turn !== null || arg("--yaw") !== undefined) await page.evaluate((d) => window.__nswpTest.face(d), (turn ?? 0) + yaw);
    await page.waitForTimeout(400);
    out.push({ name: turn === null ? "look.png" : `look-${turn}.png`, png: await page.screenshot({ type: "png" }) });
  }
  return out;
});
for (const s of shots) {
  writeFileSync(join(root, s.name), s.png);
  console.log(`✔ ${s.name}`);
}
