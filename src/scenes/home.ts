/**
 * The starting scene: the home described in home.json. A room, some furniture,
 * and portals to other places. Rearrange it by editing home.json; no code needed.
 */
import { createHome } from "nswp-sdk/home";
import type { SceneContext, SceneHandle } from "../plumbing/types.js";

export async function buildScene(ctx: SceneContext): Promise<SceneHandle> {
  // Floor, walls, lights and everything placed in home.json.
  const home = createHome(ctx.layout, { relays: ctx.config.relays });
  ctx.scene.add(home.group);
  // The home's portals are its doors. Handing them over lets visitors go through.
  ctx.usePortals(home.portals);

  return {
    // Called every frame: `t` is seconds since the world started, `dt` seconds since the last frame.
    update(t, dt) {
      home.update(t, dt);
    },
  };
}
