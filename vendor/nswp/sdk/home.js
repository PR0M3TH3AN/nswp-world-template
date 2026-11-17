import {
  createPortalWindow,
  textSprite
} from "./shared-4IRBIL65.js";
import "./shared-PMZZ7JZF.js";

// packages/sdk/src/home.ts
import * as THREE from "three";
import { checkDestination, checkPictureBytes, encodeNaddr, LAYOUT_LIMITS, portalTarget, WORLD_KIND } from "@nswp/core";
function addressLine(dest) {
  if (!dest.url) return "A world on Nostr";
  const chk = checkDestination(dest.url);
  return chk.ok ? chk.value.registrableDomain ?? chk.value.hostname : "invalid address";
}
function createPortalGate(destination, opts = {}) {
  const color = new THREE.Color(opts.color ?? 5032432);
  const textColor = opts.textColor ?? "#f2f3f6";
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 16, 96), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2 }));
  const surface = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uColor: { value: color }, uAim: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform float uTime; uniform vec3 uColor; uniform float uAim; varying vec2 vUv;
      void main(){ vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
        float swirl = 0.5 + 0.5 * sin(a * 3.0 + r * 9.0 - uTime * 2.0);
        vec3 c = mix(vec3(0.02,0.02,0.05), uColor, swirl * (1.0 - r) + uAim * 0.35);
        gl_FragColor = vec4(c, smoothstep(1.0, 0.92, r)); }`
  });
  const target = new THREE.Mesh(new THREE.CircleGeometry(0.95, 64), surface);
  target.name = "portal";
  group.add(ring, target);
  let sign = null;
  const setLabel = (label) => {
    if (sign) {
      group.remove(sign);
      sign.material.map?.dispose();
      sign.material.dispose();
    }
    sign = textSprite(`${label}
${addressLine(destination)}`, textColor, 2.2);
    sign.position.set(0, 1.5, 0);
    group.add(sign);
  };
  setLabel(opts.label ?? "Portal");
  const gate = {
    group,
    target,
    destination,
    aimed: 0,
    setLabel,
    showThrough(pano) {
      const through = createPortalWindow(new THREE.CircleGeometry(0.95, 64), pano);
      through.position.z = 0.01;
      group.add(through);
    },
    update(t, dt) {
      surface.uniforms.uTime.value = t;
      ring.rotation.z = t * 0.2;
      const glow = surface.uniforms.uAim;
      glow.value += (gate.aimed - glow.value) * Math.min(1, dt * 12);
    }
  };
  return gate;
}
var mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
function wrapText(text, perLine) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > perLine) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines.slice(0, 8).join("\n");
}
async function hangPicture(url, sha256, picture, maxW, maxH) {
  try {
    const res = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" });
    if (!res.ok || Number(res.headers.get("content-length") ?? "0") > LAYOUT_LIMITS.pictureBytes) return;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (!checkPictureBytes(sha256, bytes)) return;
    const image = new Image();
    image.src = URL.createObjectURL(new Blob([bytes]));
    await image.decode();
    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    const fit = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight);
    picture.scale.set(image.naturalWidth * fit / maxW, image.naturalHeight * fit / maxH, 1);
    picture.material = new THREE.MeshBasicMaterial({ map: texture });
  } catch {
  }
}
function buildRoom(layout, group) {
  const base = new THREE.Color(layout.room.color);
  const accent = new THREE.Color(layout.room.accent);
  const floorColor = base.clone().lerp(new THREE.Color(16777215), 0.06);
  if (layout.room.template === "open") {
    const floor2 = new THREE.Mesh(new THREE.CircleGeometry(24, 72), mat(floorColor, { roughness: 1 }));
    floor2.rotation.x = -Math.PI / 2;
    const edge = new THREE.Mesh(new THREE.RingGeometry(11.9, 12, 96), new THREE.MeshBasicMaterial({ color: accent }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = 0.01;
    group.add(floor2, edge);
    return;
  }
  const W = 16;
  const D = 14;
  const H = 4.5;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(floorColor, { roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -D / 2 + 5;
  const wallMat = mat(base.clone().lerp(new THREE.Color(16777215), 0.1).lerp(accent, 0.05));
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.2), wallMat);
  back.position.set(0, H / 2, floor.position.z - D / 2);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, H, D), wallMat);
  left.position.set(-W / 2, H / 2, floor.position.z);
  const right = left.clone();
  right.position.x = W / 2;
  const strip = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, 0.04), new THREE.MeshBasicMaterial({ color: accent }));
  strip.position.set(0, 0.03, back.position.z + 0.13);
  group.add(floor, back, left, right, strip);
}
function buildItem(p, accent, opts, portals, lamps) {
  const g = new THREE.Group();
  const textColor = opts.textColor ?? "#f2f3f6";
  if (p.source === "published") {
    const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.5, 0.5, 0.5)), new THREE.LineBasicMaterial({ color: accent }));
    box.position.y = 0.25;
    g.add(box);
    return g;
  }
  switch (p.type) {
    case "frame": {
      const W = 1.2;
      const H = 0.9;
      const border = new THREE.Mesh(new THREE.BoxGeometry(W + 0.1, H + 0.1, 0.04), mat(15922166));
      const picture = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat(2764343));
      picture.position.z = 0.025;
      g.add(border, picture);
      void hangPicture(p.args[0], p.args[1], picture, W, H);
      return g;
    }
    case "portal": {
      const target = portalTarget(p.args[0]);
      if (!target) return null;
      const destination = "url" in target ? { url: target.url } : { naddr: encodeNaddr({ kind: WORLD_KIND, pubkey: target.pubkey, identifier: target.d, relays: (opts.relays ?? []).slice(0, 2) }) };
      const gate = createPortalGate(destination, { label: p.args[1] || ("url" in target ? "Portal" : target.d), color: accent, textColor });
      gate.group.position.y = 1.2;
      g.add(gate.group);
      portals.push(gate);
      return g;
    }
    case "note": {
      const sign = textSprite(wrapText(p.args[0], 30), textColor, 2.2);
      g.add(sign);
      return g;
    }
    case "plant": {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.34, 20), mat(9072474));
      pot.position.y = 0.17;
      g.add(pot);
      const leaf = mat(4165466, { flatShading: true });
      for (const [x, y, z, s] of [[0, 0.7, 0, 0.36], [0.18, 0.5, 0.08, 0.24], [-0.16, 0.55, -0.1, 0.26]]) {
        const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), leaf);
        blob.position.set(x, y, z);
        g.add(blob);
      }
      return g;
    }
    case "lamp": {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 1.5, 12), mat(9146784, { metalness: 0.4 }));
      pole.position.y = 0.75;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), new THREE.MeshStandardMaterial({ color: 16777215, emissive: accent, emissiveIntensity: 2 }));
      bulb.position.y = 1.6;
      g.add(pole, bulb);
      if (lamps.n++ < 4) {
        const light = new THREE.PointLight(accent, 6, 9, 1.6);
        light.position.y = 1.6;
        g.add(light);
      }
      return g;
    }
    case "bench": {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.45), mat(13217930));
      seat.position.y = 0.45;
      g.add(seat);
      for (const x of [-0.6, 0.6]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.4), mat(3817290));
        leg.position.set(x, 0.21, 0);
        g.add(leg);
      }
      return g;
    }
    case "table": {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.7), mat(13217930));
      top.position.y = 0.74;
      g.add(top);
      for (const [x, z] of [[-0.52, -0.28], [0.52, -0.28], [-0.52, 0.28], [0.52, 0.28]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.71, 0.06), mat(3817290));
        leg.position.set(x, 0.355, z);
        g.add(leg);
      }
      return g;
    }
    case "plinth": {
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.6), mat(14737885, { roughness: 0.6 }));
      block.position.y = 0.5;
      g.add(block);
      return g;
    }
    default:
      return null;
  }
}
function createHome(layout, opts = {}) {
  const group = new THREE.Group();
  group.name = `home:${layout.d}`;
  const accent = new THREE.Color(layout.room.accent);
  if (opts.lights !== false) {
    group.add(new THREE.HemisphereLight(16777215, new THREE.Color(layout.room.color), 0.9));
    const key = new THREE.DirectionalLight(16777215, 0.8);
    key.position.set(3, 9, 5);
    group.add(key);
  }
  buildRoom(layout, group);
  const portals = [];
  const lamps = { n: 0 };
  let markers = 0;
  for (const p of layout.items) {
    const object = buildItem(p, accent, opts, portals, lamps);
    if (!object) continue;
    if (p.source === "published") markers++;
    object.position.set(...p.position);
    object.rotation.y = THREE.MathUtils.degToRad(p.rotation);
    group.add(object);
  }
  return {
    group,
    portals,
    markers,
    update(t, dt) {
      for (const gate of portals) gate.update(t, dt);
    }
  };
}
export {
  createHome,
  createPortalGate
};
