import {
  createPortalWindow,
  textSprite
} from "./shared-JZA42PYF.js";
import "./shared-PMZZ7JZF.js";
import "./shared-WXBVZMXQ.js";

// packages/sdk/src/home.ts
import * as THREE3 from "three";
import { checkDestination, checkPictureBytes, encodeNaddr, LAYOUT_LIMITS, portalTarget, WORLD_KIND } from "@nswp/core";

// packages/sdk/src/blocks.ts
import * as THREE from "three";
var BLOCK = 791837;
var FACES = [
  { corners: [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]], shade: 1 },
  // top
  { corners: [[-1, -1, 1], [-1, -1, -1], [1, -1, -1], [1, -1, 1]], shade: 0.45 },
  // bottom
  { corners: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], shade: 0.8 },
  // front (+Z)
  { corners: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]], shade: 0.62 },
  // back
  { corners: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]], shade: 0.7 },
  // right
  { corners: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], shade: 0.55 }
  // left
];
var EDGES = [
  [[-1, -1, -1], [1, -1, -1]],
  [[1, -1, -1], [1, -1, 1]],
  [[1, -1, 1], [-1, -1, 1]],
  [[-1, -1, 1], [-1, -1, -1]],
  [[-1, 1, -1], [1, 1, -1]],
  [[1, 1, -1], [1, 1, 1]],
  [[1, 1, 1], [-1, 1, 1]],
  [[-1, 1, 1], [-1, 1, -1]],
  [[-1, -1, -1], [-1, 1, -1]],
  [[1, -1, -1], [1, 1, -1]],
  [[1, -1, 1], [1, 1, 1]],
  [[-1, -1, 1], [-1, 1, 1]]
];
function createBlocks(accent) {
  const positions = [];
  const colors = [];
  const lines = [];
  const frame = new THREE.Matrix4();
  const v = new THREE.Vector3();
  const c = new THREE.Color();
  let count = 0;
  return {
    get count() {
      return count;
    },
    at(position, degrees = 0) {
      frame.makeRotationY(THREE.MathUtils.degToRad(degrees)).setPosition(...position);
    },
    box(size, at, opts = {}) {
      count++;
      const put = (corner, into) => {
        v.set(at[0] + corner[0] * size[0] / 2, at[1] + corner[1] * size[1] / 2, at[2] + corner[2] * size[2] / 2).applyMatrix4(frame);
        into.push(v.x, v.y, v.z);
      };
      for (const face of FACES) {
        c.set(opts.color ?? BLOCK);
        if (!opts.lit) c.multiplyScalar(face.shade);
        for (const i of [0, 1, 2, 0, 2, 3]) {
          put(face.corners[i], positions);
          colors.push(c.r, c.g, c.b);
        }
      }
      if (!opts.bare) for (const [a, b] of EDGES) {
        put(a, lines);
        put(b, lines);
      }
    },
    build() {
      const group = new THREE.Group();
      group.name = "blocks";
      const solid = new THREE.BufferGeometry();
      solid.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      solid.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      solid.computeVertexNormals();
      const edges = new THREE.BufferGeometry();
      edges.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
      group.add(
        new THREE.Mesh(solid, new THREE.MeshBasicMaterial({ vertexColors: true })),
        new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.9 }))
      );
      return group;
    }
  };
}

// packages/sdk/src/environment.ts
import * as THREE2 from "three";
var GROUND = 263947;
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = s + 1831565813 >>> 0;
    let x = Math.imul(s ^ s >>> 15, 1 | s);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}
function createEnvironment(accent, opts = {}) {
  const group = new THREE2.Group();
  group.name = "environment";
  const glow = new THREE2.Color(accent);
  const ground = new THREE2.Color(opts.ground ?? GROUND);
  const clear = opts.clear ?? 14;
  const floor = new THREE2.Mesh(
    new THREE2.PlaneGeometry(600, 600),
    new THREE2.ShaderMaterial({
      uniforms: { uGlow: { value: glow }, uGround: { value: ground }, uTime: { value: 0 } },
      vertexShader: "varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: `uniform vec3 uGlow; uniform vec3 uGround; uniform float uTime; varying vec3 vWorld;
        float grid(vec2 p, float size){
          vec2 q = p / size;
          vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
          return 1.0 - min(min(g.x, g.y), 1.0);
        }
        void main(){
          vec2 p = vWorld.xz;
          float far = length(p - cameraPosition.xz);
          float fine = grid(p, 1.0) * exp(-far * 0.085);
          float wide = grid(p, 8.0) * exp(-far * 0.022);
          // A slow ring of light that travels out across the floor.
          float ring = smoothstep(2.6, 0.0, abs(far - mod(uTime * 5.0, 90.0))) * exp(-far * 0.03);
          float light = fine * 0.3 + wide * 0.85 + ring * (0.12 + fine * 0.5);
          // Mixed, not added, so the lines show on a pale ground as well as a dark one.
          vec3 c = mix(uGround, uGlow, clamp(light, 0.0, 1.0));
          // Towards the horizon the floor itself takes on the glow.
          c = mix(c, uGlow, 0.07 * smoothstep(40.0, 260.0, far));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = -2;
  group.add(floor);
  const horizon = new THREE2.Mesh(
    new THREE2.CylinderGeometry(280, 280, 90, 64, 1, true),
    new THREE2.ShaderMaterial({
      side: THREE2.BackSide,
      transparent: true,
      depthWrite: false,
      fog: false,
      uniforms: { uGlow: { value: glow } },
      vertexShader: "varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 uGlow; varying float vY;
        void main(){
          float low = pow(1.0 - vY, 5.0);
          gl_FragColor = vec4(uGlow * (0.55 * low + 0.9 * pow(1.0 - vY, 26.0)), low);
          #include <colorspace_fragment>
        }`
    })
  );
  horizon.position.y = 45;
  horizon.renderOrder = -3;
  group.add(horizon);
  if (opts.skyline !== false) {
    const rand = seeded(20261117);
    const unit = new THREE2.BoxGeometry(1, 1, 1);
    const edge = new THREE2.EdgesGeometry(unit).getAttribute("position").array;
    const COUNT = 84;
    const fills = new THREE2.InstancedMesh(unit, new THREE2.MeshBasicMaterial({ color: ground.clone().multiplyScalar(1.5).lerp(glow, 8e-3) }), COUNT);
    const lines = new Float32Array(COUNT * edge.length);
    const m = new THREE2.Matrix4();
    const v = new THREE2.Vector3();
    const snap = (n) => Math.round(n / 2) * 2;
    for (let i = 0; i < COUNT; i++) {
      const angle = rand() * Math.PI * 2;
      const out = clear + 34 + rand() * rand() * 170;
      const w = 2 + Math.floor(rand() * 3) * 2;
      const d = 2 + Math.floor(rand() * 3) * 2;
      const h = 2 + Math.floor(rand() * rand() * (out > 110 ? 16 : 6)) * 2;
      m.compose(new THREE2.Vector3(snap(Math.sin(angle) * out), h / 2, snap(Math.cos(angle) * out)), new THREE2.Quaternion(), new THREE2.Vector3(w, h, d));
      fills.setMatrixAt(i, m);
      for (let k = 0; k < edge.length; k += 3) {
        v.set(edge[k], edge[k + 1], edge[k + 2]).applyMatrix4(m);
        lines.set([v.x, v.y, v.z], i * edge.length + k);
      }
    }
    fills.instanceMatrix.needsUpdate = true;
    const outline = new THREE2.BufferGeometry();
    outline.setAttribute("position", new THREE2.BufferAttribute(lines, 3));
    group.add(fills, new THREE2.LineSegments(outline, new THREE2.LineBasicMaterial({ color: glow, transparent: true, opacity: 0.4 })));
  }
  const uniforms = floor.material.uniforms;
  return {
    group,
    update(t) {
      uniforms.uTime.value = t;
    }
  };
}

// packages/sdk/src/home.ts
function addressLine(dest) {
  if (!dest.url) return "A world on Nostr";
  const chk = checkDestination(dest.url);
  return chk.ok ? chk.value.registrableDomain ?? chk.value.hostname : "invalid address";
}
var PORTAL_WIDTH = 1.5;
var PORTAL_HEIGHT = 2.1;
var SPRING = PORTAL_HEIGHT - PORTAL_WIDTH / 2;
var archMask = null;
function archMaskTexture() {
  if (archMask) return archMask;
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 700;
  const g = canvas.getContext("2d");
  const k = canvas.height / PORTAL_HEIGHT;
  const inset = 0.045 * k;
  g.beginPath();
  g.moveTo(inset, canvas.height);
  g.lineTo(inset, canvas.height - SPRING * k);
  g.arc(canvas.width / 2, canvas.height - SPRING * k, canvas.width / 2 - inset, Math.PI, 0);
  g.lineTo(canvas.width - inset, canvas.height);
  g.closePath();
  g.fillStyle = "#ffffff";
  g.fill();
  archMask = new THREE3.CanvasTexture(canvas);
  return archMask;
}
function createPortalGate(destination, opts = {}) {
  const color = new THREE3.Color(opts.color ?? 5032432);
  const textColor = opts.textColor ?? "#f2f3f6";
  const group = new THREE3.Group();
  const surface = new THREE3.ShaderMaterial({
    side: THREE3.DoubleSide,
    uniforms: { uTime: { value: 0 }, uColor: { value: color }, uAim: { value: 0 }, uSize: { value: new THREE3.Vector2(PORTAL_WIDTH, PORTAL_HEIGHT) }, uSpring: { value: SPRING } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform float uTime; uniform vec3 uColor; uniform float uAim; uniform vec2 uSize; uniform float uSpring; varying vec2 vUv;
      void main(){
        vec2 p = vec2((vUv.x - 0.5) * uSize.x, vUv.y * uSize.y);
        float half_ = uSize.x * 0.5;
        float d = p.y < uSpring ? half_ - abs(p.x) : half_ - length(p - vec2(0.0, uSpring));
        if (d < 0.0) discard;
        float horizon = uSize.y * 0.34;
        vec3 dusk = uColor * 0.10 + vec3(0.015, 0.015, 0.04);
        vec3 sky = mix(uColor * 0.62 + vec3(0.06), dusk, smoothstep(horizon, uSize.y, p.y));
        vec2 sun = vec2(0.12 * sin(uTime * 0.25), horizon + 0.42);
        float glow = exp(-5.0 * length(p - sun));
        sky += (uColor * 0.7 + vec3(0.35)) * glow;
        vec3 ground = uColor * 0.07 + vec3(0.02);
        float path = 1.0 - smoothstep(0.0, 0.03, abs(p.x) - (0.06 + (horizon - p.y) * 0.5));
        ground += uColor * 0.22 * path;
        vec3 view = (p.y > horizon ? sky : ground) * (1.0 + uAim * 0.35);
        float frame = 1.0 - smoothstep(0.04, 0.05, d);
        gl_FragColor = vec4(mix(view, mix(vec3(0.95, 0.955, 0.965), uColor, uAim), frame), 1.0);
      }`
  });
  const plane = new THREE3.PlaneGeometry(PORTAL_WIDTH, PORTAL_HEIGHT);
  const target = new THREE3.Mesh(plane, surface);
  target.name = "portal";
  target.position.y = PORTAL_HEIGHT / 2;
  const sill = new THREE3.Mesh(new THREE3.BoxGeometry(PORTAL_WIDTH + 0.1, 0.06, 0.24), new THREE3.MeshBasicMaterial({ color: 15922166 }));
  sill.position.y = 0.03;
  group.add(target, sill);
  let sign = null;
  const setLabel = (label) => {
    if (sign) {
      group.remove(sign);
      sign.material.map?.dispose();
      sign.material.dispose();
    }
    sign = textSprite(`${label}
${addressLine(destination)}`, textColor, 2.2);
    sign.position.set(0, PORTAL_HEIGHT + 0.45, 0);
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
      const through = createPortalWindow(plane, pano, { mask: archMaskTexture() });
      through.position.z = 4e-3;
      target.add(through);
      return through;
    },
    update(t, dt) {
      surface.uniforms.uTime.value = t;
      const glow = surface.uniforms.uAim;
      glow.value += (gate.aimed - glow.value) * Math.min(1, dt * 12);
    }
  };
  return gate;
}
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
    const texture = new THREE3.Texture(image);
    texture.colorSpace = THREE3.SRGBColorSpace;
    texture.needsUpdate = true;
    const fit = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight);
    picture.scale.set(image.naturalWidth * fit / maxW, image.naturalHeight * fit / maxH, 1);
    picture.material = new THREE3.MeshBasicMaterial({ map: texture });
  } catch {
  }
}
function buildRoom(layout, blocks, group) {
  const accent = new THREE3.Color(layout.room.accent);
  const wall = new THREE3.Color(layout.room.color).multiplyScalar(1.7).lerp(accent, 0.012);
  blocks.at([0, 0, 0]);
  if (layout.room.template === "open") {
    const edge = new THREE3.Mesh(new THREE3.RingGeometry(11.94, 12, 96), new THREE3.MeshBasicMaterial({ color: accent }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = 0.012;
    group.add(edge);
    return;
  }
  const W = 16;
  const D = 14;
  const H = 4.5;
  const mid = -D / 2 + 5;
  blocks.box([W + 0.4, H, 0.2], [0, H / 2, mid - D / 2 - 0.1], { color: wall });
  blocks.box([0.2, H, D], [-W / 2 - 0.1, H / 2, mid], { color: wall });
  blocks.box([0.2, H, D], [W / 2 + 0.1, H / 2, mid], { color: wall });
  const strip = new THREE3.Mesh(new THREE3.BoxGeometry(W, 0.05, 0.04), new THREE3.MeshBasicMaterial({ color: accent }));
  strip.position.set(0, 0.03, mid - D / 2 + 0.03);
  group.add(strip);
}
function buildItem(p, layout, blocks, opts, portals) {
  const accent = new THREE3.Color(layout.room.accent);
  const textColor = opts.textColor ?? "#f2f3f6";
  const g = new THREE3.Group();
  blocks.at(p.position, p.rotation);
  if (p.source === "published") {
    const box = new THREE3.LineSegments(new THREE3.EdgesGeometry(new THREE3.BoxGeometry(0.5, 0.5, 0.5)), new THREE3.LineBasicMaterial({ color: accent }));
    box.position.y = 0.25;
    g.add(box);
    return g;
  }
  const soft = new THREE3.Color(BLOCK).lerp(accent, 0.28);
  switch (p.type) {
    case "frame": {
      const W = 1.2;
      const H = 0.9;
      blocks.box([W + 0.1, H + 0.1, 0.05], [0, 0, 0]);
      const picture = new THREE3.Mesh(new THREE3.PlaneGeometry(W, H), new THREE3.MeshBasicMaterial({ color: 1186854 }));
      picture.position.z = 0.03;
      g.add(picture);
      void hangPicture(p.args[0], p.args[1], picture, W, H);
      return g;
    }
    case "portal": {
      const target = portalTarget(p.args[0]);
      if (!target) return null;
      const destination = "url" in target ? { url: target.url } : { naddr: encodeNaddr({ kind: WORLD_KIND, pubkey: target.pubkey, identifier: target.d, relays: (opts.relays ?? []).slice(0, 2) }) };
      const gate = createPortalGate(destination, { label: p.args[1] || ("url" in target ? "Portal" : target.d), color: accent, textColor });
      g.add(gate.group);
      portals.push(gate);
      return g;
    }
    case "note": {
      g.add(textSprite(wrapText(p.args[0], 30), textColor, 2.2));
      return g;
    }
    case "plant": {
      blocks.box([0.4, 0.3, 0.4], [0, 0.15, 0]);
      blocks.box([0.5, 0.5, 0.5], [0, 0.6, 0], { color: soft });
      blocks.box([0.3, 0.3, 0.3], [0.2, 0.95, 0.1], { color: soft });
      blocks.box([0.3, 0.3, 0.3], [-0.15, 1, -0.1], { color: soft });
      blocks.box([0.2, 0.2, 0.2], [0.05, 1.25, 0], { color: accent, lit: true });
      return null;
    }
    case "lamp": {
      blocks.box([0.3, 0.1, 0.3], [0, 0.05, 0]);
      blocks.box([0.1, 1.4, 0.1], [0, 0.8, 0]);
      blocks.box([0.3, 0.3, 0.3], [0, 1.65, 0], { color: accent, lit: true });
      const pool = new THREE3.Mesh(new THREE3.CircleGeometry(2.4, 40), new THREE3.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.1, depthWrite: false }));
      pool.rotation.x = -Math.PI / 2;
      pool.position.y = 0.014;
      g.add(pool);
      return g;
    }
    case "bench": {
      blocks.box([1.4, 0.1, 0.5], [0, 0.45, 0], { color: soft });
      blocks.box([1.4, 0.4, 0.1], [0, 0.7, -0.2]);
      blocks.box([0.1, 0.4, 0.4], [-0.6, 0.2, 0]);
      blocks.box([0.1, 0.4, 0.4], [0.6, 0.2, 0]);
      return null;
    }
    case "table": {
      blocks.box([1.2, 0.1, 0.7], [0, 0.7, 0], { color: soft });
      for (const [x, z] of [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]]) blocks.box([0.1, 0.65, 0.1], [x, 0.325, z]);
      return null;
    }
    case "plinth": {
      blocks.box([0.6, 1, 0.6], [0, 0.5, 0]);
      return null;
    }
    default:
      return null;
  }
}
function createHome(layout, opts = {}) {
  const group = new THREE3.Group();
  group.name = `home:${layout.d}`;
  if (opts.lights !== false) {
    group.add(new THREE3.HemisphereLight(16777215, new THREE3.Color(layout.room.color), 0.9));
    const key = new THREE3.DirectionalLight(16777215, 0.8);
    key.position.set(3, 9, 5);
    group.add(key);
  }
  const environment = opts.environment === false ? null : createEnvironment(layout.room.accent, { ground: layout.room.color });
  if (environment) group.add(environment.group);
  const blocks = createBlocks(layout.room.accent);
  buildRoom(layout, blocks, group);
  const portals = [];
  let markers = 0;
  for (const p of layout.items) {
    const object = buildItem(p, layout, blocks, opts, portals);
    if (p.source === "published") markers++;
    if (!object) continue;
    object.position.set(...p.position);
    object.rotation.y = THREE3.MathUtils.degToRad(p.rotation);
    group.add(object);
  }
  if (blocks.count > 0) group.add(blocks.build());
  return {
    group,
    portals,
    markers,
    update(t, dt) {
      environment?.update(t);
      for (const gate of portals) gate.update(t, dt);
    }
  };
}
export {
  BLOCK,
  GROUND,
  PORTAL_HEIGHT,
  PORTAL_WIDTH,
  createBlocks,
  createEnvironment,
  createHome,
  createPortalGate
};
