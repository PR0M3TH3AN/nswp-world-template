/**
 * An example of a scene that isn't a home: a small game. Lights drift around a
 * field at night, and walking into one collects it.
 *
 * It shows the three things most scenes need: building things with Three.js,
 * doing something every frame, and offering a way out through a portal.
 * To try it, change the one line in src/scene.ts.
 */
import * as THREE from "three";
import { textSprite } from "nswp-sdk/three";
import type { SceneContext, SceneHandle } from "../plumbing/types.js";

const COUNT = 12;

export async function buildScene(ctx: SceneContext): Promise<SceneHandle> {
  const { scene, camera } = ctx;
  scene.background = new THREE.Color(0x06080f);
  scene.fog = new THREE.Fog(0x06080f, 8, 34);
  scene.add(new THREE.HemisphereLight(0xbfd0ff, 0x1b2a24, 1.6));

  const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0x1d3329, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  // Rings on the ground, so there is something to judge distance by.
  const rings = new THREE.PolarGridHelper(18, 12, 9, 96, 0x35584a, 0x284438);
  rings.position.set(0, 0.01, -4);
  scene.add(rings);

  // The lights to collect. Each one remembers where it drifts around.
  const lights = Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2;
    const reach = 5 + (i % 4) * 2.2;
    const color = new THREE.Color().setHSL(0.12 + (i % 5) * 0.03, 0.95, 0.62);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.4 }));
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
  ctx.addPortal({ url: "https://nswp-world-a.vercel.app/" }, { label: "The Gallery", position: [0, 0, 9], rotation: 180, color: 0xffc94d });

  const head = new THREE.Vector3();
  let found = 0;
  return {
    update(t) {
      camera.getWorldPosition(head);
      for (const light of lights) {
        if (light.found) continue;
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
