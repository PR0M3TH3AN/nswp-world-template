/**
 * An example of a scene that isn't a home: a small game. Lights drift around a
 * field at night, and walking into one collects it.
 *
 * It shows the three things most scenes need: building things with Three.js,
 * doing something every frame, and offering a way out through a portal.
 * To try it, change the one line in src/scene.ts.
 */
import * as THREE from "three";
import { addBench, addCrystal, addGyro, addLamp, createAlloy, createEnvironment, createHalo, MeshBuilder, metalTone } from "nswp-sdk/home";
import { textSprite } from "nswp-sdk/three";
import type { SceneContext, SceneHandle } from "../plumbing/types.js";

const COUNT = 12;

export async function buildScene(ctx: SceneContext): Promise<SceneHandle> {
  const { scene, camera } = ctx;
  const accent = new THREE.Color(0xffc94d);
  scene.background = new THREE.Color(0x04070b);
  scene.add(new THREE.HemisphereLight(0xbfd0ff, 0x1b2a24, 1.6));

  // The ground, the sky and the skyline: the same a home stands in, in this game's own colour.
  const environment = createEnvironment(accent);
  scene.add(environment.group);

  // The field's furniture. Everything that stays still goes into one builder
  // and becomes one mesh, however much there is: that is what keeps a detailed
  // place fast on a headset. `add…` pieces come with the kit; `builder.box`,
  // `.lathe` and `.line` make shapes of your own (AGENTS.md lists them).
  const builder = new MeshBuilder();
  builder.tone = metalTone(0x04070b);
  const soft = builder.tone.clone().lerp(accent, 0.03);
  for (const [x, z] of [[-3, -1], [3, -1], [-3, -8], [3, -8]] as const) {
    addLamp(builder.at([x, 0, z]));
    const halo = createHalo(accent, 1.5);
    halo.position.set(x, 1.64, z);
    scene.add(halo);
  }
  addBench(builder.at([-5, 0, 2], 60), soft);
  addBench(builder.at([5, 0, 2], -60), soft);
  addCrystal(builder, 1.1, 4, [-8, 0, -12], 30);
  addCrystal(builder, 0.8, 7, [9, 0, -6], 200);
  addCrystal(builder, 0.6, 2, [1, 0, -15], 90);
  const metal = createAlloy(accent, { gloss: 0.55 });
  scene.add(builder.build(metal));

  // The lights to collect: a point of light inside three turning hoops. One
  // shape, drawn twelve times. Each one remembers where it drifts around.
  const lantern = new MeshBuilder().at();
  lantern.tone = new THREE.Color(0x1b2733);
  addGyro(lantern, 0.5);
  const shape = lantern.geometry();
  const shine = createAlloy(accent, { gloss: 1, sheen: 0.5 });
  const lights = Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2;
    const reach = 5 + (i % 4) * 2.2;
    const mesh = new THREE.Group();
    mesh.add(new THREE.Mesh(shape, shine), createHalo(accent, 1.1));
    scene.add(mesh);
    return { mesh, home: new THREE.Vector3(Math.sin(angle) * reach, 1.2, -Math.cos(angle) * reach - 4), phase: i * 1.7, found: false };
  });

  // The score, on a sign near where visitors arrive.
  let sign = textSprite(`Collect the lights\n0 of ${COUNT}`, "#f2f3f6", 2.2);
  const showScore = (n: number) => {
    scene.remove(sign);
    sign = textSprite(n === COUNT ? "All of them.\nThe portal behind you leads on." : `Collect the lights\n${n} of ${COUNT}`, "#f2f3f6", 2.2);
    sign.position.set(0, 2.6, -1.5);
    scene.add(sign);
  };
  showScore(0);

  // The way out. Anything that leaves this site is a portal, so the visitor's
  // Airlock can show them where they're going before they go.
  ctx.addPortal({ url: "https://gallery.bitblocks.network/" }, { label: "The Gallery", position: [0, 0, 9], rotation: 180, color: accent });

  // A game has an interface of its own (here, the score), and the keyboard is
  // for playing. So the world's controls go quiet: one mark in the corner,
  // which still opens everything, and no number keys.
  ctx.controls.setPresence("quiet");
  ctx.controls.setCorner("top-right");
  ctx.controls.setKeys({ hotbar: false });

  const head = new THREE.Vector3();
  let found = 0;
  return {
    // Where a visitor may stand: anywhere on the field, and no further.
    canStand: (x, z) => Math.hypot(x, z + 4) < 19,
    update(t) {
      environment.update(t);
      metal.tick(t);
      shine.tick(t);
      camera.getWorldPosition(head);
      for (const light of lights) {
        if (light.found) continue;
        light.mesh.rotation.set(t * 0.4 + light.phase, t * 0.7 + light.phase, 0);
        light.mesh.position.set(light.home.x + Math.sin(t * 0.5 + light.phase) * 1.2, light.home.y + Math.sin(t * 0.9 + light.phase) * 0.25, light.home.z + Math.cos(t * 0.4 + light.phase) * 1.2);
        // Close enough, measured along the ground so height doesn't matter.
        if (Math.hypot(light.mesh.position.x - head.x, light.mesh.position.z - head.z) < 0.7) {
          light.found = true;
          light.mesh.visible = false;
          showScore(++found);
        }
      }
    },
    // The score is about one visitor, so it stays out of this world's preview picture.
    get hideFromPreview() {
      return [sign];
    },
  };
}
