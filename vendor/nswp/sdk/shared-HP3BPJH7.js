import {
  arrival,
  bytesToHex,
  currentForm,
  fullscreenAction,
  portal,
  room,
  sha256,
  startingForm
} from "./shared-IBSHD2WC.js";
import {
  FEED_LIMITS,
  ICONS,
  ago,
  askWell,
  createHeldButton,
  foundRelays,
  learnFrom,
  loadPicture,
  onChatChange,
  onPicturesChange,
  relayBackup,
  rgb,
  sendWell,
  setShowsChat,
  setShowsPictures,
  showsChat,
  showsPictures,
  wrapWords
} from "./shared-F6F6TMXL.js";
import {
  arrivedSettings,
  reportSettings
} from "./shared-Q3D4OUDA.js";
import {
  LiveKeys,
  TextEntry,
  createVoice,
  keyAt,
  placeKeys,
  placeLiveKeys,
  wasRefreshed
} from "./shared-WWPRVQWW.js";

// packages/sdk/src/three.ts
import * as THREE16 from "three";
import { bubbleSeconds, CHAT_LIMITS, cleanItemsRule as cleanItemsRule2, itemCoordinate as itemCoordinate4, decodeLook, DEFAULT_RELAYS as DEFAULT_RELAYS10, encodeNpub as encodeNpub3, readRelayList as readRelayList7, RELAY_LIST_KIND as RELAY_LIST_KIND7, shortNpub as shortNpub6, spawnOffset, verifyEvent as verifyEvent7 } from "@nswp/core";

// packages/sdk/src/figure.ts
import * as THREE3 from "three";
import { generatedLook, markGrid } from "@nswp/core";

// packages/sdk/src/alloy.ts
import * as THREE from "three";
var SKY_GLSL = `
vec3 skyGlow(vec3 d, vec3 accent, vec3 ground){
  float h = clamp(d.y, -1.0, 1.0);
  float band = pow(1.0 - abs(h), 9.0);
  float line = pow(1.0 - abs(h), 60.0);
  vec3 up = mix(ground * 0.55, ground * 0.2, smoothstep(0.0, 0.7, h));
  vec3 base = h > 0.0 ? up : ground;
  return base + accent * (band * 0.4 + line * 0.9);
}`;
function createAlloy(accent, opts = {}) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uAccent: { value: new THREE.Color(accent) },
      uGround: { value: new THREE.Color(opts.ground ?? 263947) },
      uTime: { value: 0 },
      uAim: { value: 0 },
      uGloss: { value: opts.gloss ?? 0.5 },
      uSpeed: { value: opts.speed ?? 1 },
      uSheen: { value: opts.sheen ?? 0 },
      uReach: { value: opts.reach ?? 3 },
      uOpacity: { value: 1 }
    },
    vertexShader: `
      attribute vec3 tone; attribute float glow; attribute float flow;
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vTone; varying float vGlow; varying float vFlow;
      void main(){
        mat4 m = modelMatrix;
        #ifdef USE_INSTANCING
          m = modelMatrix * instanceMatrix;
        #endif
        vec4 w = m * vec4(position, 1.0);
        vWorld = w.xyz;
        vNormal = normalize(mat3(m) * normal);
        vTone = tone; vGlow = glow; vFlow = flow;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `
      uniform vec3 uAccent; uniform vec3 uGround; uniform float uTime; uniform float uAim; uniform float uGloss; uniform float uSpeed; uniform float uSheen; uniform float uReach; uniform float uOpacity;
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vTone; varying float vGlow; varying float vFlow;
      ${SKY_GLSL}
      void main(){
        vec3 N = normalize(vNormal);
        vec3 V = normalize(cameraPosition - vWorld);
        float facing = max(dot(N, V), 0.0);
        // Form: a light from above and in front, and more from the sky than from the floor.
        float key = max(dot(N, normalize(vec3(0.35, 0.8, 0.5))), 0.0);
        float dome = 0.5 + 0.5 * N.y;
        vec3 c = vTone * (0.3 + 0.6 * dome + 0.75 * key);
        // The place reflected in it, strongest at a glancing angle, as on real metal.
        float fresnel = pow(1.0 - facing, 4.0);
        vec3 mirror = skyGlow(reflect(-V, N), uAccent, uGround);
        c += mirror * (0.1 + 0.75 * fresnel) * uGloss;
        // A rim of the place's light where the surface turns away.
        c += uAccent * pow(1.0 - facing, 3.0) * 0.16;
        // Colours that shift with the angle, for things meant to be looked at.
        if (uSheen > 0.0) {
          vec3 shift = 0.5 + 0.5 * cos(6.2831 * (facing * 1.2 + vec3(0.0, 0.33, 0.67)) + vWorld.y * 1.5);
          c = mix(c, c + shift * uAccent * 0.8 + shift * 0.1, uSheen * (0.3 + 0.7 * fresnel));
        }
        // Lights: the place's colour, with a brighter pulse travelling along them.
        if (vGlow > 0.001) {
          float run = fract(vFlow / uReach - uTime * 0.22 * uSpeed);
          float pulse = smoothstep(0.8, 1.0, run) + smoothstep(0.1, 0.0, run) * 0.6;
          vec3 light = mix(uAccent, vec3(1.0), 0.06 + 0.5 * pulse + 0.3 * uAim);
          c = mix(c, light * (0.8 + 0.6 * pulse + 0.5 * uAim), vGlow);
        }
        // Distance takes it into the ground's colour.
        float far = length(cameraPosition - vWorld);
        c = mix(c, uGround, smoothstep(55.0, 290.0, far) * (1.0 - vGlow * 0.5));
        gl_FragColor = vec4(c, uOpacity);
        #include <colorspace_fragment>
      }`
  });
  Object.defineProperty(material, "opacity", {
    get: () => material.uniforms.uOpacity.value,
    set: (value) => {
      if (material.uniforms?.uOpacity) material.uniforms.uOpacity.value = value;
    }
  });
  material.tick = (t) => {
    material.uniforms.uTime.value = t;
  };
  material.aim = (amount) => {
    material.uniforms.uAim.value = amount;
  };
  return material;
}

// packages/sdk/src/mesh.ts
import * as THREE2 from "three";
var va = new THREE2.Vector3();
var vb = new THREE2.Vector3();
var vc = new THREE2.Vector3();
var vd = new THREE2.Vector3();
var e1 = new THREE2.Vector3();
var e2 = new THREE2.Vector3();
var nn = new THREE2.Vector3();
var hint = new THREE2.Vector3();
var col = new THREE2.Color();
var MeshBuilder = class {
  positions = [];
  normals = [];
  tones = [];
  glows = [];
  flows = [];
  matrix = new THREE2.Matrix4();
  rotation = new THREE2.Matrix3();
  /** The colour faces take when they don't say. */
  tone = new THREE2.Color(791837);
  /** The colour of this piece's lights, for a material that reads plain vertex colours (see `geometry`). */
  light = new THREE2.Color(16777215);
  colors = [];
  get triangles() {
    return this.positions.length / 9;
  }
  /** Place and turn everything added from now on: a position, and degrees about the vertical. */
  at(position = [0, 0, 0], degrees = 0, scale = 1) {
    this.matrix.makeRotationY(THREE2.MathUtils.degToRad(degrees)).scale(vc.set(scale, scale, scale)).setPosition(position[0], position[1], position[2]);
    this.rotation.setFromMatrix4(this.matrix);
    return this;
  }
  /** Place everything added from now on by any matrix: for a piece that leans or lies on its side. */
  place(matrix) {
    this.matrix.copy(matrix);
    this.rotation.setFromMatrix4(this.matrix);
    return this;
  }
  /** A flat four-sided face. Pass `out`, roughly which way it faces, and the corners may be given in either order. */
  quad(a, b, c, d, paint = {}, out) {
    const f = paint.flow;
    const fl = Array.isArray(f) ? f : [f ?? 0, f ?? 0, f ?? 0, f ?? 0];
    va.set(...a);
    vb.set(...b);
    vc.set(...c);
    vd.set(...d);
    nn.crossVectors(e1.subVectors(vb, va), e2.subVectors(vd, va));
    if (nn.lengthSq() < 1e-12) nn.crossVectors(e1.subVectors(vc, vb), e2.subVectors(vd, vb));
    let order = [va, vb, vc, va, vc, vd];
    let fo = [fl[0], fl[1], fl[2], fl[0], fl[2], fl[3]];
    if (out && nn.dot(hint.set(...out)) < 0) {
      nn.negate();
      order = [va, vd, vc, va, vc, vb];
      fo = [fl[0], fl[3], fl[2], fl[0], fl[2], fl[1]];
    }
    nn.applyMatrix3(this.rotation).normalize();
    col.set(paint.color ?? this.tone).multiplyScalar(paint.shade ?? 1);
    for (let i = 0; i < 6; i++) {
      const v = e1.copy(order[i]).applyMatrix4(this.matrix);
      this.positions.push(v.x, v.y, v.z);
      this.normals.push(nn.x, nn.y, nn.z);
      this.tones.push(col.r, col.g, col.b);
      this.glows.push(paint.glow ?? 0);
      const g = paint.glow ?? 0;
      this.colors.push(col.r + (this.light.r - col.r) * g, col.g + (this.light.g - col.g) * g, col.b + (this.light.b - col.b) * g);
      this.flows.push(fo[i]);
    }
  }
  tri(a, b, c, paint = {}, out) {
    this.quad(a, b, c, c, paint, out);
  }
  /** A face with a panel pressed into it. Corners in order round the face; `out` is which way it faces. */
  panel(corners, out, o, paint = {}) {
    const [a, b, c, d] = corners.map((p) => new THREE2.Vector3(...p));
    const n = new THREE2.Vector3(...out).normalize();
    const mid = new THREE2.Vector3().add(a).add(b).add(c).add(d).multiplyScalar(0.25);
    const inner = [a, b, c, d].map((p, i, all2) => {
      const next = all2[(i + 1) % 4];
      const prev = all2[(i + 3) % 4];
      return p.clone().add(next.clone().sub(p).setLength(o.margin)).add(prev.clone().sub(p).setLength(o.margin));
    });
    const deep = inner.map((p) => p.clone().addScaledVector(n, -o.depth));
    const arr = (v) => [v.x, v.y, v.z];
    const all = [a, b, c, d];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      this.quad(arr(all[i]), arr(all[j]), arr(inner[j]), arr(inner[i]), paint, out);
      const wallMid = inner[i].clone().add(inner[j]).multiplyScalar(0.5);
      const inward = mid.clone().sub(wallMid);
      this.quad(arr(inner[i]), arr(inner[j]), arr(deep[j]), arr(deep[i]), { ...paint, glow: o.glow ?? 0, shade: (paint.shade ?? 1) * (o.glow ? 1 : 0.6) }, arr(inward));
    }
    this.quad(arr(deep[0]), arr(deep[1]), arr(deep[2]), arr(deep[3]), { ...paint, shade: (paint.shade ?? 1) * 0.55 }, out);
  }
  /** A box with its edges bevelled, and panels pressed into the faces named: "x+ x- y+ y- z+ z-", or "sides". */
  box(size, at, o = {}) {
    const [hx, hy, hz] = [size[0] / 2, size[1] / 2, size[2] / 2];
    const b = Math.min(o.bevel ?? 0, hx * 0.9, hy * 0.9, hz * 0.9);
    const h = [hx, hy, hz];
    const want = (o.panel?.faces ?? "sides").replace("sides", "x+ x- z+ z-").split(/\s+/);
    const point = (axis, s) => {
      const p = [0, 0, 0];
      for (let k = 0; k < 3; k++) p[k] = at[k] + s[k] * (k === axis ? h[k] : h[k] - b);
      return p;
    };
    const signs = [-1, 1];
    for (let axis = 0; axis < 3; axis++) {
      const [u, v] = [(axis + 1) % 3, (axis + 2) % 3];
      for (const s of signs) {
        const corner = (su, sv) => {
          const q = [0, 0, 0];
          q[axis] = s;
          q[u] = su;
          q[v] = sv;
          return point(axis, q);
        };
        const out = [0, 0, 0];
        out[axis] = s;
        const face = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
        const name = `${"xyz"[axis]}${s > 0 ? "+" : "-"}`;
        if (o.panel && want.includes(name) && Math.min(h[u], h[v]) - b > o.panel.margin * 1.2) this.panel(face, out, o.panel, o);
        else this.quad(...face, o, out);
      }
    }
    if (b <= 0) return;
    for (let axis = 0; axis < 3; axis++) {
      const [u, v] = [(axis + 1) % 3, (axis + 2) % 3];
      for (const su of signs)
        for (const sv of signs) {
          const s = (along) => {
            const q = [0, 0, 0];
            q[axis] = along;
            q[u] = su;
            q[v] = sv;
            return q;
          };
          const out = [0, 0, 0];
          out[u] = su;
          out[v] = sv;
          this.quad(point(u, s(-1)), point(u, s(1)), point(v, s(1)), point(v, s(-1)), { ...o, shade: (o.shade ?? 1) * 1.25 }, out);
        }
    }
    for (const sx of signs) for (const sy of signs) for (const sz of signs) this.tri(point(0, [sx, sy, sz]), point(1, [sx, sy, sz]), point(2, [sx, sy, sz]), { ...o, shade: (o.shade ?? 1) * 1.25 }, [sx, sy, sz]);
  }
  /**
   * Sweep a profile along a path. The profile is a closed outline drawn
   * anticlockwise in each frame's own x and y; `paint(i)` colours the side that
   * runs from point i to the next. Open ends are capped.
   */
  sweep(profile, frames, paint = () => ({}), o = {}) {
    const at = (k, i) => {
      const f = frames[k];
      const [u, v] = profile[i % profile.length];
      return [f.p[0] + f.x[0] * u + f.y[0] * v, f.p[1] + f.x[1] * u + f.y[1] * v, f.p[2] + f.x[2] * u + f.y[2] * v];
    };
    const last = o.loop ? frames.length : frames.length - 1;
    for (let k = 0; k < last; k++) {
      const k2 = (k + 1) % frames.length;
      const [t1, t2] = [frames[k].t ?? k, frames[k2].t ?? k + 1];
      for (let i = 0; i < profile.length; i++) {
        const p = paint(i);
        this.quad(at(k, i), at(k, i + 1), at(k2, i + 1), at(k2, i), { ...p, flow: p.flow ?? [t1, t1, t2, t2] });
      }
    }
    if (o.loop || o.caps === false) return;
    for (const [k, dir] of [[0, -1], [frames.length - 1, 1]]) {
      const f = frames[k];
      const tangent = new THREE2.Vector3(...f.x).cross(new THREE2.Vector3(...f.y)).multiplyScalar(dir);
      for (let i = 1; i < profile.length - 1; i++) this.tri(at(k, 0), at(k, i), at(k, i + 1), paint(-1), [tangent.x, tangent.y, tangent.z]);
    }
  }
  /**
   * Turn a profile on a lathe about the vertical through `at`. The profile is
   * [radius, height] pairs from the bottom up. `sides` is how many faces round:
   * 4 makes a square column, 6 a hexagon, 24 a round one. `twist` turns it as it rises.
   * `paint(row, side)` colours each face: `row` counts up the profile, `side` round it.
   */
  lathe(profile, at, sides, paint = () => ({}), o = {}) {
    const top = profile[profile.length - 1][1];
    const ring = (row, s) => {
      const [r, y] = profile[row];
      const a = s / sides * Math.PI * 2 + (o.turn ?? 0) + (o.twist ?? 0) * (top ? y / top : 0);
      return [at[0] + Math.cos(a) * r, at[1] + y, at[2] + Math.sin(a) * r];
    };
    for (let row = 0; row < profile.length - 1; row++) {
      const [r1, y1] = profile[row];
      const [r2, y2] = profile[row + 1];
      for (let s = 0; s < sides; s++) {
        const a = (s + 0.5) / sides * Math.PI * 2 + (o.turn ?? 0);
        const out = [Math.cos(a) * (y2 - y1), -(r2 - r1), Math.sin(a) * (y2 - y1)];
        if (Math.abs(out[0]) + Math.abs(out[1]) + Math.abs(out[2]) < 1e-9) continue;
        const p = paint(row, s);
        this.quad(ring(row, s), ring(row, s + 1), ring(row + 1, s + 1), ring(row + 1, s), { ...p, flow: p.flow ?? [y1, y1, y2, y2] }, out);
      }
    }
  }
  /** A thin lit line lying just proud of a surface: from a to b, `width` wide, on a face that points `out`. */
  line(a, b, width, out, paint = {}) {
    const n = new THREE2.Vector3(...out).normalize();
    const along = new THREE2.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const side = along.clone().cross(n).setLength(width / 2);
    const lift = n.clone().multiplyScalar(4e-3);
    const A = new THREE2.Vector3(...a).add(lift);
    const B = new THREE2.Vector3(...b).add(lift);
    const len = along.length();
    this.quad(
      [A.x - side.x, A.y - side.y, A.z - side.z],
      [B.x - side.x, B.y - side.y, B.z - side.z],
      [B.x + side.x, B.y + side.y, B.z + side.z],
      [A.x + side.x, A.y + side.y, A.z + side.z],
      { glow: 1, ...paint, flow: paint.flow ?? [0, len, len, 0] },
      out
    );
  }
  /** Everything added, as one geometry. */
  geometry() {
    const g = new THREE2.BufferGeometry();
    g.setAttribute("position", new THREE2.Float32BufferAttribute(this.positions, 3));
    g.setAttribute("normal", new THREE2.Float32BufferAttribute(this.normals, 3));
    g.setAttribute("tone", new THREE2.Float32BufferAttribute(this.tones, 3));
    g.setAttribute("glow", new THREE2.Float32BufferAttribute(this.glows, 1));
    g.setAttribute("flow", new THREE2.Float32BufferAttribute(this.flows, 1));
    g.setAttribute("color", new THREE2.Float32BufferAttribute(this.colors, 3));
    g.computeBoundingSphere();
    return g;
  }
  /** Everything added, as one mesh in this material (see alloy.ts). */
  build(material) {
    return new THREE2.Mesh(this.geometry(), material);
  }
};

// packages/sdk/src/figure.ts
var DARK = new THREE3.Color(659221);
var DEPTH = 0.4;
function nearest(color, palette) {
  let best = palette[0];
  let far = Infinity;
  for (const p of palette) {
    const d = (p.r - color.r) ** 2 + (p.g - color.g) ** 2 + (p.b - color.b) ** 2;
    if (d < far) [best, far] = [p, d];
  }
  return best.clone();
}
function buildHead(b, look, main, accent, omit) {
  let fit2;
  const shade = (row) => ({ color: main, shade: 0.85 + row * 0.1 });
  switch (look.head) {
    case "square":
      b.box([0.24, 0.24, 0.24], [0, 0, 0], { color: main, bevel: 0.03, panel: { margin: 0.045, depth: 0.012, faces: "x+ x- z+ y+" } });
      fit2 = { front: 0.12, top: 0.12, half: 0.085 };
      break;
    case "tall":
      b.lathe([[5e-4, -0.14], [0.09, -0.13], [0.115, -0.02], [0.105, 0.14], [0.06, 0.2], [5e-4, 0.21]], [0, 0, 0], 6, shade);
      fit2 = { front: 0.098, top: 0.21, half: 0.058 };
      break;
    case "wedge":
      b.lathe([[5e-4, -0.12], [0.17, -0.1], [0.18, 0.09], [5e-4, 0.12]], [0, 0, 0], 3, shade, { turn: Math.PI / 2 });
      fit2 = { front: 0.088, top: 0.12, half: 0.11 };
      break;
    case "flat":
      b.lathe([[5e-4, -0.085], [0.15, -0.06], [0.165, 0.03], [0.09, 0.085], [5e-4, 0.09]], [0, 0, 0], 10, shade);
      fit2 = { front: 0.152, top: 0.09, half: 0.09 };
      break;
    case "faceted":
      b.lathe([[5e-4, -0.15], [0.1, -0.07], [0.14, 0.03], [0.08, 0.13], [5e-4, 0.165]], [0, 0, 0], 5, (row) => ({ color: main, shade: 0.8 + row * 0.16 }), { turn: Math.PI / 10 });
      fit2 = { front: 0.108, top: 0.165, half: 0.064 };
      break;
    default:
      b.lathe([[5e-4, -0.135], [0.07, -0.125], [0.118, -0.05], [0.13, 0.02], [0.112, 0.085], [0.06, 0.128], [5e-4, 0.14]], [0, 0, 0], 8, shade, { turn: Math.PI / 8 });
      fit2 = { front: 0.122, top: 0.14, half: 0.075 };
  }
  b.lathe([[0.06, -0.135], [0.075, -0.125]], [0, 0, 0], 8, () => ({ glow: 0.8 }), { turn: Math.PI / 8 });
  const { front, half } = fit2;
  const tallFace = look.face === "tee" || look.face === "wide";
  b.box([half * 2 + 0.03, tallFace ? 0.13 : 0.085, 0.03], [0, tallFace ? 0 : 0.02, -(front - 6e-3)], { color: DARK, bevel: 8e-3 });
  const z = -(front + 95e-4);
  const lit = (w, h, x, y) => b.quad([x - w / 2, y - h / 2, z], [x + w / 2, y - h / 2, z], [x + w / 2, y + h / 2, z], [x - w / 2, y + h / 2, z], { glow: 1 }, [0, 0, -1]);
  switch (look.face) {
    case "split":
      lit(half * 0.72, 0.04, -half * 0.52, 0.02);
      lit(half * 0.72, 0.04, half * 0.52, 0.02);
      break;
    case "dots":
      lit(0.036, 0.036, -half * 0.5, 0.02);
      lit(0.036, 0.036, half * 0.5, 0.02);
      break;
    case "tee":
      lit(half * 1.9, 0.03, 0, 0.035);
      lit(0.03, 0.075, 0, -0.018);
      break;
    case "slit":
      lit(half * 2, 0.014, 0, 0.02);
      break;
    case "wide":
      lit(half * 1.8, 0.085, 0, 0);
      break;
    default:
      lit(half * 1.9, 0.04, 0, 0.02);
  }
  if (omit.has("accessory")) return;
  const t = fit2.top;
  switch (look.accessory) {
    case "antenna":
      b.lathe([[0.012, t - 0.03], [6e-3, t + 0.2]], [fit2.half * 0.8, 0, 0.02], 4, () => ({ color: accent }));
      b.box([0.024, 0.024, 0.024], [fit2.half * 0.8, t + 0.21, 0.02], { glow: 1 });
      break;
    case "halo":
      b.lathe([[0.13, t + 0.08], [0.165, t + 0.08], [0.165, t + 0.098], [0.13, t + 0.098], [0.13, t + 0.08]], [0, 0, 0], 12, () => ({ glow: 1 }));
      break;
    case "hat":
      b.lathe([[0.09, t - 0.012], [0.21, t - 0.012], [0.21, t + 4e-3], [0.1, t + 0.01], [0.1, t + 0.035], [0.09, t + 0.035], [0.085, t + 0.12], [5e-4, t + 0.125]], [0, 0, 0], 10, (row) => row === 4 ? { glow: 0.8 } : { color: accent, shade: row === 2 ? 1.2 : 0.95 });
      break;
    case "crest":
      b.box([0.022, 0.09, 0.22], [0, t + 0.02, 0.01], { color: accent, bevel: 6e-3 });
      b.box([0.012, 0.01, 0.2], [0, t + 0.068, 0.01], { glow: 1 });
      break;
    case "fins":
      for (const side of [-1, 1]) {
        b.box([0.016, 0.13, 0.1], [side * (fit2.half + 0.068), 0.035, 0.02], { color: accent, bevel: 5e-3 });
        b.box([8e-3, 0.11, 0.012], [side * (fit2.half + 0.078), 0.035, 0.066], { glow: 1 });
      }
      break;
  }
}
function buildBody(b, look, main, accent, omit, proven = false) {
  const k = look.build === "slight" ? 0.86 : look.build === "broad" ? 1.2 : 1;
  const cloth = (row, rows, side, sides, turn2 = 0) => {
    const a = (side + 0.5) / sides * Math.PI * 2 + turn2;
    switch (look.pattern) {
      case "halves":
        return Math.cos(a) > 0 ? accent : main;
      case "stripe":
        return Math.abs(Math.cos(a)) < 0.35 ? accent : main;
      case "bands":
        return row % 2 === 1 ? accent : main;
      case "yoke":
        return row >= rows - 3 ? accent : main;
      default:
        return main;
    }
  };
  const turned = (profile, sides, band, turn2 = 0) => b.lathe(profile, [0, 0, 0], sides, (row, side) => row === 0 ? { glow: 0.4 } : row === band ? { glow: 0.75 } : { color: cloth(row, profile.length - 1, side, sides, turn2), shade: 0.9 + row % 2 * 0.18 }, { turn: turn2 });
  let chest;
  switch (look.body) {
    case "coat":
      turned([[0.03, -0.24], [0.165 * k, -0.25], [0.18 * k, 0.1], [0.205 * k, 0.17], [0.205 * k, 0.195], [0.1, 0.25], [5e-4, 0.25]], 4, 3, Math.PI / 4);
      chest = 0.125 * k;
      break;
    case "plate":
      b.lathe([[0.03, -0.2], [0.11 * k, -0.25], [0.08 * k, -0.02]], [0, 0, 0], 8, (row) => row === 0 ? { glow: 0.4 } : { color: main, shade: 0.9 }, { turn: Math.PI / 8 });
      b.box([0.31 * k, 0.26, 0.18], [0, 0.11, 0], { color: look.pattern === "plain" ? main : accent, bevel: 0.035, panel: { margin: 0.05, depth: 0.014, faces: "z+ x+ x-" } });
      b.box([0.33 * k, 0.012, 0.2], [0, -0.022, 0], { glow: 0.75 });
      chest = 0.09;
      break;
    case "robe":
      turned([[0.03, -0.4], [0.2 * k, -0.45], [0.16 * k, -0.2], [0.115 * k, 0.1], [0.135 * k, 0.17], [0.135 * k, 0.195], [0.07, 0.25], [5e-4, 0.25]], 10, 4);
      chest = 0.112 * k;
      break;
    default:
      turned([[0.03, -0.2], [0.17 * k, -0.25], [0.12 * k, 0.12], [0.145 * k, 0.165], [0.145 * k, 0.19], [0.08, 0.25], [5e-4, 0.25]], 6, 3);
      chest = 0.108 * k;
  }
  if (!omit.has("shoulders")) {
    switch (look.shoulders) {
      case "pads":
        for (const side of [-1, 1]) {
          b.box([0.12, 0.06, 0.15], [side * (0.17 * k + 0.03), 0.2, 0], { color: accent, bevel: 0.02 });
          b.box([8e-3, 0.02, 0.13], [side * (0.17 * k + 0.092), 0.2, 0], { glow: 1 });
        }
        break;
      case "mantle":
        b.lathe([[0.09, 0.2], [0.24 * k, 0.165], [0.25 * k, 0.19], [0.1, 0.262]], [0, 0, 0], 8, (row) => row === 1 ? { glow: 0.7 } : { color: accent, shade: row === 2 ? 1.15 : 0.8 }, { turn: Math.PI / 8 });
        break;
      case "collar":
        b.lathe([[0.1, 0.22], [0.15, 0.31], [0.135, 0.318], [0.09, 0.24]], [0, 0, 0], 8, (row) => row === 1 ? { glow: 0.9 } : { color: accent, shade: row === 0 ? 1.1 : 0.7 }, { turn: Math.PI / 8 });
        break;
    }
  }
  if (omit.has("mark")) return;
  const plate = (x, y, z, cell, facing2) => {
    const pitch = cell * 1.14;
    const wide = pitch * 5 + cell * 0.7;
    b.box([wide, wide, 0.02], [x, y, z - facing2 * 8e-3], { color: DARK, bevel: 6e-3 });
    if (proven) {
      const [half, band, zz] = [wide / 2 + cell * 0.55, cell * 0.38, z + facing2 * 25e-4];
      const bar2 = (x0, y0, x1, y1) => b.quad([x + x0, y + y0, zz], [x + x1, y + y0, zz], [x + x1, y + y1, zz], [x + x0, y + y1, zz], { glow: 1 }, [0, 0, facing2]);
      bar2(-half, half - band, half, half);
      bar2(-half, -half, half, -half + band);
      bar2(-half, -half + band, -half + band, half - band);
      bar2(half - band, -half + band, half, half - band);
    }
    markGrid(look.mark).forEach(
      (row, r) => row.forEach((on, c) => {
        if (!on) return;
        const [cx, cy, cz] = [x + (c - 2) * pitch, y + (2 - r) * pitch, z + facing2 * 25e-4];
        b.quad([cx - cell / 2, cy - cell / 2, cz], [cx + cell / 2, cy - cell / 2, cz], [cx + cell / 2, cy + cell / 2, cz], [cx - cell / 2, cy + cell / 2, cz], { glow: 1 }, [0, 0, facing2]);
      })
    );
  };
  plate(0, 0.04, chest + 0.012, 0.026, 1);
  plate(-chest * 0.42, 0.105, -(chest + 4e-3), 95e-4, -1);
}
function createFigure(look, style = {}, facts = {}) {
  const wearing = typeof look === "string" ? generatedLook(look) : look;
  const omit = new Set(style.omit ?? []);
  let [main, accent, light] = [new THREE3.Color(wearing.color), new THREE3.Color(wearing.accent), new THREE3.Color(wearing.light)];
  if (style.palette?.length) {
    const palette = style.palette.map((c) => new THREE3.Color(c));
    [main, accent, light] = [nearest(main, palette), nearest(accent, palette), nearest(light, palette)];
  }
  const depth = style.material ? 1 : DEPTH;
  const [cloth, trim] = [main.clone().multiplyScalar(depth), accent.clone().multiplyScalar(depth)];
  const builder = () => {
    const b = new MeshBuilder().at();
    b.tone = cloth.clone();
    b.light = light.clone();
    return b;
  };
  const headShape = builder();
  buildHead(headShape, wearing, cloth, trim, omit);
  const bodyShape = builder();
  buildBody(bodyShape, wearing, cloth, trim, omit, facts.proven === true);
  const handShape = builder();
  handShape.lathe([[5e-4, -0.06], [0.04, 0], [5e-4, 0.06]], [0, 0, 0], 4, () => ({ glow: 0.75 }));
  const metal = style.material ? style.material(light, wearing) : createAlloy(light, { gloss: wearing.finish === "matte" ? 0.25 : wearing.finish === "gloss" ? 0.85 : 0.7, sheen: wearing.finish === "sheen" ? 0.45 : 0 });
  const geometries = [headShape.geometry(), bodyShape.geometry(), handShape.geometry()];
  const head = new THREE3.Group();
  head.add(new THREE3.Mesh(geometries[0], metal));
  const torso = new THREE3.Mesh(geometries[1], metal);
  torso.position.y = -0.45;
  const hands = [new THREE3.Mesh(geometries[2], metal), new THREE3.Mesh(geometries[2], metal)];
  hands[0].position.set(-0.28, -0.5, -0.12);
  hands[1].position.set(0.28, -0.5, -0.12);
  const group = new THREE3.Group();
  group.add(head, torso, ...hands);
  return {
    group,
    head,
    torso,
    hands,
    metal,
    look: wearing,
    tick(t) {
      metal.tick?.(t);
    },
    dispose() {
      for (const g of geometries) g.dispose();
      metal.dispose();
    }
  };
}

// packages/sdk/src/blocks.ts
import { cleanName, shortNpub } from "@nswp/core";
var BLOCK_LIMIT = 500;
var KEY = "nswp:blocked";
var HEX = /^[0-9a-f]{64}$/;
function cleanBlocked(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const b of input) {
    if (!b || typeof b !== "object") continue;
    const { key, name, at } = b;
    if (typeof key !== "string" || !HEX.test(key) || seen.has(key)) continue;
    seen.add(key);
    const called = typeof name === "string" ? cleanName(name) : "";
    out.push({ key, name: called || shortNpub(key), at: typeof at === "number" && Number.isFinite(at) && at > 0 ? Math.floor(at) : 0 });
    if (out.length >= BLOCK_LIMIT) break;
  }
  return out;
}
function withBlocked(list, who, now = Math.floor(Date.now() / 1e3)) {
  if (!HEX.test(who.key) || list.some((b) => b.key === who.key)) return list;
  return cleanBlocked([{ key: who.key, name: who.name ?? "", at: now }, ...list]);
}
function withoutBlocked(list, key) {
  return list.filter((b) => b.key !== key);
}
var local = () => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};
function loadBlocked(storage = local()) {
  try {
    return cleanBlocked(JSON.parse(storage?.getItem(KEY) ?? "[]"));
  } catch {
    return [];
  }
}
function storeBlocked(list, storage = local()) {
  try {
    if (list.length) storage?.setItem(KEY, JSON.stringify(cleanBlocked(list)));
    else storage?.removeItem(KEY);
  } catch {
  }
}

// packages/sdk/src/sound-store.ts
var CUES = [
  "step",
  // a footstep, walking
  "land",
  // arriving at the end of a jump: a step in a headset, or one taken at once
  "bump",
  // walking into something that can't be walked through
  "grab",
  "drop",
  "hover",
  "press",
  "menuOpen",
  "menuClose",
  "cross",
  // leaving through a door
  "arrive",
  // coming out of one
  "join",
  // someone is in the room who wasn't: the visitor, or another person
  "leave",
  "micOn",
  "micOff",
  "notice",
  // the kit has something to say
  "chat",
  // someone in the room wrote something: heard from where they stand
  "error"
];
var tone = (from, to, at, dur, gain, wave = "sine") => ({
  kind: "tone",
  wave,
  from,
  ...to === void 0 ? {} : { to },
  at,
  dur,
  gain
});
var noise = (band, at, dur, gain) => ({ kind: "noise", band, at, dur, gain });
var RECIPES = {
  step: [noise(850, 0, 0.06, 0.2), tone(120, 70, 0, 0.07, 0.16)],
  land: [tone(190, 62, 0, 0.16, 0.3), noise(480, 0, 0.11, 0.2)],
  bump: [tone(96, 58, 0, 0.12, 0.28, "triangle"), noise(260, 0, 0.05, 0.14)],
  grab: [tone(520, 780, 0, 0.07, 0.16, "triangle")],
  drop: [tone(700, 420, 0, 0.08, 0.16, "triangle")],
  hover: [tone(1400, void 0, 0, 0.025, 0.05)],
  press: [tone(880, 1320, 0, 0.05, 0.15, "triangle")],
  menuOpen: [tone(660, void 0, 0, 0.05, 0.12), tone(990, void 0, 0.05, 0.07, 0.12)],
  menuClose: [tone(990, void 0, 0, 0.05, 0.12), tone(660, void 0, 0.05, 0.07, 0.12)],
  cross: [tone(196, 784, 0, 0.5, 0.22), noise(1400, 0.05, 0.45, 0.07), tone(392, 1568, 0.1, 0.4, 0.08)],
  arrive: [tone(784, 392, 0, 0.42, 0.2), tone(1176, 588, 0.04, 0.38, 0.08), noise(900, 0, 0.2, 0.05)],
  join: [tone(523.25, void 0, 0, 0.09, 0.14), tone(783.99, void 0, 0.09, 0.14, 0.14)],
  leave: [tone(783.99, void 0, 0, 0.09, 0.12), tone(523.25, void 0, 0.09, 0.14, 0.12)],
  micOn: [tone(600, 900, 0, 0.08, 0.14)],
  micOff: [tone(900, 600, 0, 0.08, 0.14)],
  notice: [tone(1046.5, void 0, 0, 0.08, 0.09), tone(1318.5, void 0, 0.08, 0.12, 0.08)],
  // Two soft syllables, low and falling at the end, with a breath in front: somebody said something. It is two
  // octaves under the kit's own notice, which is high, clean and rises, so the two are never taken for each other.
  chat: [noise(1900, 0, 0.03, 0.06), tone(360, 440, 5e-3, 0.07, 0.15, "triangle"), tone(330, 262, 0.1, 0.11, 0.13, "triangle")],
  error: [tone(220, void 0, 0, 0.11, 0.13, "square"), tone(185, void 0, 0.14, 0.14, 0.13, "square")]
};
function cueRecipe(cue) {
  return RECIPES[cue];
}
var SOUND_LIMITS = {
  /** A world's own cue: a file this size at most, this long at most. Longer ones aren't sounds for something that happened. */
  cueBytes: 512 * 1024,
  cueSeconds: 3,
  /** Kinds of file a world may name. */
  extensions: ["ogg", "oga", "opus", "mp3", "m4a", "aac", "wav", "webm", "flac"],
  /** Files for one cue: one is chosen each time, so a sound heard often isn't the same sound every time. */
  variants: 6,
  /** Pieces of music for one place: they play in turn. */
  tracks: 8,
  /** The visitor's own songs: this many, each this size at most. */
  songs: 60,
  songBytes: 40 * 1024 * 1024,
  titleChars: 80
};
function ownSound(address, base) {
  if (typeof address !== "string" || address.length > 2e3) return null;
  let u;
  let b;
  try {
    b = new URL(base);
    u = new URL(address, b);
  } catch {
    return null;
  }
  if (u.origin !== b.origin || u.protocol !== "https:" && u.protocol !== "http:") return null;
  const ext = u.pathname.split(".").pop()?.toLowerCase() ?? "";
  if (!SOUND_LIMITS.extensions.includes(ext)) return null;
  u.hash = "";
  return u.href;
}
function ownSounds(value, base, limit) {
  const out = [];
  for (const v of Array.isArray(value) ? value : [value]) {
    const address = ownSound(v, base);
    if (address && !out.includes(address)) out.push(address);
    if (out.length >= limit) break;
  }
  return out;
}
function cleanTheme(input, base) {
  const out = { cues: {} };
  if (!input || typeof input !== "object") return out;
  const { cues, music, hum } = input;
  if (cues && typeof cues === "object") {
    for (const cue of CUES) {
      const v = cues[cue];
      if (v === null) out.cues[cue] = null;
      else if (v !== void 0) {
        const files2 = ownSounds(v, base, SOUND_LIMITS.variants);
        if (files2.length) out.cues[cue] = files2;
      }
    }
  }
  if (music === null) out.music = null;
  else if (music !== void 0) {
    const tracks = ownSounds(music, base, SOUND_LIMITS.tracks);
    if (tracks.length) out.music = tracks;
  }
  if (hum === null) out.hum = null;
  else if (hum !== void 0) {
    const address = ownSound(hum, base);
    if (address) out.hum = address;
  }
  return out;
}
function cleanKit(input, folder, playsOgg) {
  const out = { cues: {} };
  if (!input || typeof input !== "object") return out;
  const pick = (entry) => {
    if (!entry || typeof entry !== "object") return entry;
    const { ogg, mp3 } = entry;
    return playsOgg ? ogg ?? mp3 : mp3 ?? ogg;
  };
  const many = (value, limit) => ownSounds((Array.isArray(value) ? value : [value]).map(pick), folder, limit);
  const { cues, music, hum } = input;
  if (cues && typeof cues === "object") {
    for (const cue of CUES) {
      const files2 = many(cues[cue], SOUND_LIMITS.variants);
      if (files2.length) out.cues[cue] = files2;
    }
  }
  const tracks = many(music, SOUND_LIMITS.tracks);
  if (tracks.length) out.music = tracks;
  const h = ownSound(pick(hum), folder);
  if (h) out.hum = h;
  return out;
}
function pieceName(address) {
  let name = address;
  try {
    name = decodeURIComponent(new URL(address, "https://x.invalid/").pathname.split("/").pop() ?? "");
  } catch {
    name = address.split(/[/?#]/).filter(Boolean).pop() ?? "";
  }
  name = name.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[\u0000-\u001f]/g, "").trim();
  return name.slice(0, 60) || "a piece with no name";
}
var STEP_LEVEL = 0.45;
var HEARD = { near: 2, far: 25, floor: 0.14, fall: 6 };
function heardFrom(place) {
  const d = Number.isFinite(place.distance) ? Math.max(0, place.distance) : HEARD.far;
  const beyond = Math.max(0, d - HEARD.near);
  const gain = Math.max(HEARD.floor, 1 / (1 + (beyond / HEARD.fall) ** 2));
  const along = Math.min(1, beyond / (HEARD.far - HEARD.near));
  const cutoff = Math.round(7e3 * (1100 / 7e3) ** along);
  const side = Number.isFinite(place.pan) ? Math.max(-1, Math.min(1, place.pan)) : 0;
  return { gain: Math.round(gain * 1e3) / 1e3, cutoff, pan: Math.round(side * 0.8 * 100) / 100, rate: 1 };
}
function stepShape(foot, random = Math.random) {
  const right = Math.abs(Math.trunc(foot)) % 2 === 1;
  const side = right ? 1 : -1;
  return {
    // Between a little over half and all of the step's level: a light tread now and then.
    gain: STEP_LEVEL * (0.6 + 0.4 * random()),
    // One foot falls a touch lower than the other, and each step is up to a semitone and a half either way.
    rate: (1 + side * 0.025) * Math.pow(2, (random() * 2 - 1) * (1.5 / 12)),
    cutoff: 1600 + random() * 3400,
    pan: side * (0.08 + random() * 0.1)
  };
}
function nextVariant(count, last, random = Math.random) {
  if (count <= 1) return 0;
  if (last < 0 || last >= count) return Math.min(count - 1, Math.floor(random() * count));
  const i = Math.floor(random() * (count - 1));
  return i >= last ? i + 1 : i;
}
var DEFAULT_LEVELS = { off: false, effects: 0.7, music: 0.45, voices: 1, hearShared: false, shared: 0.7, hum: true };
var LEVEL_STEPS = [0, 0.35, 0.7, 1];
var LEVEL_WORDS = ["off", "low", "medium", "high"];
var unit = (v, fallback) => typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;
function cleanLevels(input) {
  const i = input && typeof input === "object" ? input : {};
  return {
    off: i.off === true,
    effects: unit(i.effects, DEFAULT_LEVELS.effects),
    music: unit(i.music, DEFAULT_LEVELS.music),
    voices: unit(i.voices, DEFAULT_LEVELS.voices),
    hearShared: i.hearShared === true,
    shared: unit(i.shared, DEFAULT_LEVELS.shared),
    hum: i.hum !== false
  };
}
function levelStep(v) {
  let best = 0;
  LEVEL_STEPS.forEach((s, i) => {
    if (Math.abs(s - v) < Math.abs(LEVEL_STEPS[best] - v)) best = i;
  });
  return best;
}
function nextLevel(v) {
  return LEVEL_STEPS[(levelStep(v) + 1) % LEVEL_STEPS.length];
}
var MUSIC_RANGE = 12;
var MUSIC_SOURCES = 2;
var MUSIC_DUCK = 0.35;
function musicToHear(sharing, hear) {
  if (!hear) return [];
  return sharing.filter((s) => !s.refused && Number.isFinite(s.metres) && s.metres <= MUSIC_RANGE).sort((a, b) => a.metres - b.metres || a.pubkey.localeCompare(b.pubkey)).slice(0, MUSIC_SOURCES).map((s) => s.pubkey);
}
function musicFade(metres) {
  if (!(metres >= 0)) return 0;
  const near = 2;
  if (metres <= near) return 1;
  if (metres >= MUSIC_RANGE) return 0;
  const t = (metres - near) / (MUSIC_RANGE - near);
  return (1 - t) * (1 - t);
}
function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var ROOTS = [98, 110, 116.54, 130.81, 146.83, 155.56];
var SCALES = [
  [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3],
  // major pentatonic: open, bright
  [1, 6 / 5, 4 / 3, 3 / 2, 9 / 5],
  // minor pentatonic: darker
  [1, 9 / 8, 4 / 3, 3 / 2, 16 / 9],
  // suspended: unresolved, still
  [1, 5 / 4, 3 / 2, 15 / 8, 9 / 4]
  // major seventh: warm
];
function ambiencePlan(seed) {
  const r = seeded(`ambience:${seed}`);
  const root = ROOTS[Math.floor(r() * ROOTS.length)];
  const scale = SCALES[Math.floor(r() * SCALES.length)];
  const fifth = scale.includes(3 / 2) ? 3 / 2 : scale[3];
  const drones = [1, fifth, 2, scale[2] * 2].map((m) => ({ hz: root * m, detune: (r() - 0.5) * 14, swell: 11 + r() * 18 }));
  const least = 3.5 + r() * 3;
  return { root, scale, drones, colour: 500 + r() * 900, gap: [least, least + 3 + r() * 4] };
}
function songTitle(fileName) {
  const raw = typeof fileName === "string" ? fileName : "";
  const cleaned = raw.split(/[\\/]/).pop().replace(/\.[a-z0-9]{1,5}$/i, "").normalize("NFC").replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g, " ").replace(/[_\s]+/g, " ").trim();
  return [...cleaned].slice(0, SOUND_LIMITS.titleChars).join("").trim() || "A song";
}
function cleanSongs(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const s of input) {
    if (!s || typeof s !== "object") continue;
    const { id, title, size, at } = s;
    if (typeof id !== "string" || !/^[a-z0-9-]{4,40}$/.test(id) || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, title: songTitle(title), size: typeof size === "number" && size > 0 ? Math.floor(size) : 0, at: typeof at === "number" && at > 0 ? Math.floor(at) : 0 });
    if (out.length >= SOUND_LIMITS.songs) break;
  }
  return out;
}
function songRefusal(file, have) {
  const ext = (file.name ?? "").split(".").pop()?.toLowerCase() ?? "";
  const isSound = (file.type ?? "").startsWith("audio/") || SOUND_LIMITS.extensions.includes(ext);
  if (!isSound) return "That isn't a sound file.";
  if (!file.size) return "That file is empty.";
  if (file.size > SOUND_LIMITS.songBytes) return `That file is over ${Math.round(SOUND_LIMITS.songBytes / 1024 / 1024)} MB, which is more than is kept here.`;
  if (have >= SOUND_LIMITS.songs) return `${SOUND_LIMITS.songs} songs are kept here at most. Take one out first.`;
  return null;
}

// packages/sdk/src/turn.ts
import * as THREE4 from "three";
function turnVisitor(rig, camera, degrees) {
  const head = camera.getWorldPosition(new THREE4.Vector3());
  const a = THREE4.MathUtils.degToRad(degrees);
  const dx = rig.position.x - head.x;
  const dz = rig.position.z - head.z;
  rig.position.x = head.x + dx * Math.cos(a) + dz * Math.sin(a);
  rig.position.z = head.z - dx * Math.sin(a) + dz * Math.cos(a);
  rig.rotation.y += a;
}

// packages/sdk/src/console.ts
import * as THREE5 from "three";
var W = 1024;
var H = 640;
var FLOAT_W = 0.84;
var WRIST_W = 0.36;
var ASPECT = H / W;
function strokeIcon(g, name, x, y, size) {
  if (!name) return;
  g.save();
  g.translate(x, y);
  g.scale(size / 24, size / 24);
  g.lineWidth = 1.7;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.stroke(new Path2D(ICONS[name]));
  g.restore();
}
function fit(g, text, max) {
  if (g.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && g.measureText(`${t}\u2026`).width > max) t = t.slice(0, -1);
  return `${t.trimEnd()}\u2026`;
}
function wrap(g, text, max, lines) {
  const out = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width <= max || !line) line = next;
    else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  if (out.length > lines) {
    out.length = lines;
    out[lines - 1] = fit(g, `${out[lines - 1]} \u2026`, max);
  }
  return out;
}
var SANS = 'system-ui, "Segoe UI", Roboto, sans-serif';
var MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
function holoMaterial(map) {
  return new THREE5.ShaderMaterial({
    transparent: true,
    depthTest: false,
    side: THREE5.DoubleSide,
    uniforms: { map: { value: map }, uOpen: { value: 1 }, uTime: { value: 0 }, uAccent: { value: new THREE5.Color() }, uLines: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform sampler2D map; uniform float uOpen; uniform float uTime; uniform vec3 uAccent; uniform float uLines; varying vec2 vUv;
      void main(){
        if (vUv.y > uOpen) discard;
        vec4 c = texture2D(map, vUv);
        float lines = 1.0 - uLines * 0.05 * (0.5 + 0.5 * sin(vUv.y * 420.0 - uTime * 1.2));
        float lead = (1.0 - step(0.999, uOpen)) * smoothstep(0.03, 0.0, uOpen - vUv.y);
        gl_FragColor = vec4(c.rgb * lines + uAccent * lead, max(c.a, lead * 0.9));
        #include <colorspace_fragment>
      }`
  });
}
function createConsole(controls, opts) {
  const group = new THREE5.Group();
  group.name = "nswp-console";
  group.visible = false;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  const texture = new THREE5.CanvasTexture(canvas);
  texture.colorSpace = THREE5.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = holoMaterial(texture);
  const panel = new THREE5.Mesh(new THREE5.PlaneGeometry(1, ASPECT), material);
  panel.renderOrder = 30;
  panel.visible = false;
  group.add(panel);
  const openerCanvas = document.createElement("canvas");
  openerCanvas.width = 256;
  openerCanvas.height = 300;
  const openerTexture = new THREE5.CanvasTexture(openerCanvas);
  openerTexture.colorSpace = THREE5.SRGBColorSpace;
  const opener = new THREE5.Mesh(new THREE5.PlaneGeometry(0.15, 0.15 * 300 / 256), new THREE5.MeshBasicMaterial({ map: openerTexture, transparent: true, depthTest: false }));
  opener.renderOrder = 30;
  group.add(opener);
  let open = false;
  let mount = "floating";
  let section = "";
  let aimed = null;
  let regions = [];
  let painted = "";
  let unfold = 1;
  let clock = 0;
  let sinceRead = 0;
  let placed = false;
  let settling = false;
  let wristFor = 0;
  let wristAway = 0;
  let noteNow = "";
  const paintOpener = (hot) => {
    const t = controls.theme;
    const c = openerCanvas.getContext("2d");
    const w = openerCanvas.width;
    const h = openerCanvas.height;
    c.clearRect(0, 0, w, h);
    c.beginPath();
    c.moveTo(28, h - 44);
    c.lineTo(28, 128);
    c.arc(w / 2, 128, w / 2 - 28, Math.PI, 0);
    c.lineTo(w - 28, h - 44);
    c.closePath();
    c.fillStyle = hot ? `rgba(${rgb(t.accent)}, 0.34)` : `rgba(${rgb(t.glass)}, 0.82)`;
    c.fill();
    c.lineWidth = 6;
    c.strokeStyle = t.accent;
    c.stroke();
    c.fillStyle = hot ? t.accent : t.ink;
    c.fillRect(14, h - 34, w - 28, 8);
    c.strokeStyle = hot ? t.accent : t.ink;
    strokeIcon(c, "menu", w / 2 - 44, 60, 88);
    c.fillStyle = t.ink;
    c.font = `600 40px ${SANS}`;
    c.textAlign = "center";
    c.fillText("Menu", w / 2, 208);
    openerTexture.needsUpdate = true;
  };
  const faces = /* @__PURE__ */ new Map();
  const faceOf = (address) => {
    if (!faces.has(address)) {
      faces.set(address, null);
      void loadPicture(address).then((drawn2) => {
        if (!drawn2) return;
        faces.set(address, drawn2);
        painted = "";
        if (group.visible) paint();
      });
    }
    return faces.get(address) ?? null;
  };
  const paint = () => {
    const view = controls.view();
    const t = view.theme;
    if (!view.sections.some((s) => s.id === section)) section = view.sections[0]?.id ?? "";
    const signature = JSON.stringify([view.title, view.address, view.sections, section, aimed, t]);
    if (signature === painted) return;
    painted = signature;
    const A = rgb(t.accent);
    const I = rgb(t.ink);
    const k = Math.min(1.2, t.scale);
    regions = [];
    g.clearRect(0, 0, W, H);
    g.beginPath();
    g.roundRect(4, 4, W - 8, H - 8, [56, 56, 18, 18]);
    g.fillStyle = `rgba(${rgb(t.glass)}, 0.86)`;
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = `rgba(${A}, 0.55)`;
    g.stroke();
    const top = g.createLinearGradient(80, 0, W - 80, 0);
    top.addColorStop(0, `rgba(${A}, 0)`);
    top.addColorStop(0.5, `rgba(${A}, 1)`);
    top.addColorStop(1, `rgba(${A}, 0)`);
    g.fillStyle = top;
    g.fillRect(80, 4, W - 160, 4);
    const mark = g.createLinearGradient(0, 30, 0, 96);
    mark.addColorStop(0, `rgba(${A}, 0.95)`);
    mark.addColorStop(1, `rgba(${A}, 0.25)`);
    g.fillStyle = mark;
    g.beginPath();
    g.roundRect(40, 30, 44, 60, [22, 22, 4, 4]);
    g.fill();
    g.fillStyle = t.ink;
    g.fillRect(32, 94, 60, 4);
    g.textAlign = "left";
    g.textBaseline = "alphabetic";
    g.font = `650 ${Math.round(38 * k)}px ${SANS}`;
    g.fillText(fit(g, view.title, W - 300), 112, 62);
    g.font = `400 ${Math.round(24 * k)}px ${MONO}`;
    g.fillStyle = `rgba(${I}, 0.66)`;
    g.fillText(fit(g, view.address, W - 300), 112, 96);
    const button = (r, draw) => {
      regions.push(r);
      draw(aimed === r.id);
    };
    button({ id: "close", x: W - 150, y: 26, w: 116, h: 72, label: "Close" }, (hot) => {
      g.beginPath();
      g.roundRect(W - 150, 26, 116, 72, 16);
      g.fillStyle = hot ? `rgba(${I}, 0.18)` : `rgba(${I}, 0.05)`;
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = `rgba(${I}, ${hot ? 0.9 : 0.3})`;
      g.stroke();
      g.strokeStyle = t.ink;
      strokeIcon(g, "exit", W - 150 + 38, 26 + 16, 40);
    });
    g.fillStyle = `rgba(${A}, 0.22)`;
    g.fillRect(28, 122, W - 56, 2);
    const tabH = Math.min(88, (H - 150) / Math.max(view.sections.length, 1));
    view.sections.forEach((s, i) => {
      const y = 134 + i * tabH;
      const on = s.id === section;
      button({ id: `tab:${s.id}`, x: 24, y, w: 236, h: tabH - 8, label: s.label }, (hot) => {
        if (on || hot) {
          g.beginPath();
          g.roundRect(24, y, 236, tabH - 8, [6, 18, 18, 6]);
          g.fillStyle = `rgba(${A}, ${on ? 0.16 : 0.08})`;
          g.fill();
        }
        if (on) {
          g.fillStyle = t.accent;
          g.fillRect(24, y, 5, tabH - 8);
        }
        g.strokeStyle = g.fillStyle = on ? t.accent : hot ? t.ink : `rgba(${I}, 0.72)`;
        strokeIcon(g, s.icon, 44, y + (tabH - 8) / 2 - 18, 36);
        g.font = `${on ? 650 : 500} ${Math.round(30 * k)}px ${SANS}`;
        g.textBaseline = "middle";
        g.fillText(fit(g, s.label, 150), 96, y + (tabH - 8) / 2 + 2);
        g.textBaseline = "alphabetic";
      });
    });
    const current = view.sections.find((s) => s.id === section);
    const items = current?.items ?? [];
    noteNow = current?.note ?? "";
    g.font = `400 ${Math.round(24 * k)}px ${SANS}`;
    const noteLines = noteNow ? wrap(g, noteNow, W - 330, 3) : [];
    const noteH = noteLines.length ? noteLines.length * 32 + 20 : 0;
    const left = 284;
    const areaW = W - left - 30;
    const card = current?.card ?? null;
    const cardH = card ? card.text ? 162 : 112 : 0;
    if (card) {
      const y = 138;
      g.beginPath();
      g.roundRect(left, y, areaW, cardH - 12, [22, 22, 8, 8]);
      g.fillStyle = `rgba(${A}, 0.08)`;
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = `rgba(${A}, 0.5)`;
      g.stroke();
      const face = card.picture ? faceOf(card.picture) : null;
      const cx = left + 58;
      const cy = y + 50;
      g.save();
      g.beginPath();
      g.arc(cx, cy, 36, 0, Math.PI * 2);
      g.closePath();
      g.fillStyle = card.color || `rgba(${I}, 0.25)`;
      g.fill();
      if (face) {
        g.clip();
        g.drawImage(face, cx - 36, cy - 36, 72, 72);
      } else {
        g.fillStyle = t.glass;
        g.font = `700 ${Math.round(40 * k)}px ${SANS}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText([...card.title][0]?.toUpperCase() ?? "", cx, cy + 2);
        g.textAlign = "left";
        g.textBaseline = "alphabetic";
      }
      g.restore();
      const tx = left + 116;
      g.font = `650 ${Math.round(32 * k)}px ${SANS}`;
      g.fillStyle = t.ink;
      const name = fit(g, card.title, areaW - 300);
      g.fillText(name, tx, y + 43);
      if (card.tag) {
        const nameW = g.measureText(name).width;
        g.font = `500 ${Math.round(21 * k)}px ${SANS}`;
        const tagW = g.measureText(card.tag).width + 26;
        g.beginPath();
        g.roundRect(tx + nameW + 16, y + 17, tagW, 34, 17);
        g.lineWidth = 2;
        g.strokeStyle = card.proven ? `rgba(${A}, 0.9)` : `rgba(${I}, 0.35)`;
        g.stroke();
        g.fillStyle = card.proven ? t.accent : `rgba(${I}, 0.8)`;
        g.fillText(card.tag, tx + nameW + 29, y + 41);
      }
      g.font = `400 ${Math.round(22 * k)}px ${card.copy ? MONO : SANS}`;
      g.fillStyle = `rgba(${I}, 0.7)`;
      g.fillText(fit(g, [card.sub, ...card.now].join("   "), areaW - 140), tx, y + 78);
      if (card.text) {
        g.fillStyle = `rgba(${A}, 0.7)`;
        g.fillRect(left + 20, y + 96, 3, 48);
        g.font = `400 ${Math.round(22 * k)}px ${SANS}`;
        g.fillStyle = `rgba(${I}, 0.9)`;
        wrap(g, card.text, areaW - 60, 2).forEach((line, i) => g.fillText(line, left + 34, y + 114 + i * 26));
      }
    }
    const cols = items.length > 8 ? 3 : 2;
    const rowsN = Math.max(1, Math.ceil(items.length / cols));
    const cellW = (areaW - (cols - 1) * 14) / cols;
    const cellH = Math.min(96, (H - 150 - noteH - cardH - (rowsN - 1) * 12) / rowsN);
    items.forEach((item, i) => {
      const x = left + i % cols * (cellW + 14);
      const y = 138 + cardH + Math.floor(i / cols) * (cellH + 12);
      const tone2 = item.tone === "warn" ? rgb(t.warn) : A;
      button({ id: `act:${item.id}`, x, y, w: cellW, h: cellH, label: item.label }, (hot) => {
        g.beginPath();
        g.roundRect(x, y, cellW, cellH, [18, 18, 6, 6]);
        g.fillStyle = hot ? `rgba(${tone2}, 0.3)` : item.tone === "primary" || item.on ? `rgba(${tone2}, 0.16)` : `rgba(${I}, 0.05)`;
        g.fill();
        g.lineWidth = hot ? 4 : 2;
        g.strokeStyle = hot || item.on ? `rgba(${tone2}, 1)` : `rgba(${tone2}, 0.4)`;
        g.stroke();
        g.fillStyle = item.on ? `rgb(${tone2})` : `rgba(${I}, 0.22)`;
        g.fillRect(x + 14, y + cellH - 7, cellW - 28, 3);
        g.strokeStyle = g.fillStyle = item.tone === "warn" ? t.warn : item.on ? t.accent : t.ink;
        const iconSize = Math.min(40, cellH - 30);
        if (item.kind === "swatch") {
          const ink = g.fillStyle;
          g.fillStyle = item.color;
          g.beginPath();
          g.roundRect(x + 20, y + (cellH - iconSize) / 2 - 4, iconSize * 0.78, iconSize, [iconSize * 0.39, iconSize * 0.39, 4, 4]);
          g.fill();
          g.fillStyle = ink;
        } else strokeIcon(g, item.icon, x + 18, y + (cellH - iconSize) / 2 - 2, iconSize);
        const size = Math.round((cols === 3 ? 23 : 28) * k);
        g.font = `600 ${size}px ${SANS}`;
        g.textBaseline = "middle";
        const words = wrap(g, item.label, cellW - iconSize - 44, cellH > 70 ? 2 : 1);
        words.forEach((line, n) => g.fillText(line, x + iconSize + 30, y + cellH / 2 - 2 + (n - (words.length - 1) / 2) * (size + 3)));
        g.textBaseline = "alphabetic";
      });
    });
    if (noteLines.length) {
      const y = H - noteH - 14;
      g.fillStyle = `rgba(${A}, 0.7)`;
      g.fillRect(left, y, 3, noteH - 8);
      g.font = `400 ${Math.round(24 * k)}px ${SANS}`;
      g.fillStyle = `rgba(${I}, 0.82)`;
      noteLines.forEach((line, i) => g.fillText(line, left + 16, y + 24 + i * 32));
    }
    texture.needsUpdate = true;
    material.uniforms.uAccent.value.set(t.accent);
    material.uniforms.uLines.value = t.motion ? 1 : 0;
  };
  const grips = [0, 1].map((i) => {
    const grip = opts.renderer.xr.getControllerGrip(i);
    const info = { grip, hand: "" };
    grip.addEventListener("connected", ((e) => {
      info.hand = e.data?.handedness ?? "";
    }));
    grip.addEventListener("disconnected", (() => {
      info.hand = "";
    }));
    opts.rig.add(grip);
    return info;
  });
  const head = new THREE5.Vector3();
  const facing2 = new THREE5.Vector3();
  const want = new THREE5.Vector3();
  const hand = new THREE5.Vector3();
  const toHand = new THREE5.Vector3();
  const setOpen = (next, where = "floating") => {
    if (open === next && mount === where) return;
    if (open !== next) controls.signal(next ? "menuOpen" : "menuClose");
    open = next;
    mount = where;
    placed = false;
    aimed = null;
    unfold = controls.theme.motion && next ? 0 : 1;
    panel.visible = next;
    opener.visible = !next;
    if (next) {
      painted = "";
      paint();
    }
  };
  const stop = controls.subscribe(() => {
    painted = "";
    paintOpener(aimed === "open");
  });
  void stop;
  paintOpener(false);
  const con = {
    group,
    get open() {
      return open;
    },
    setOpen: (next) => setOpen(next, "floating"),
    pick(raycaster) {
      if (!group.visible) return null;
      if (!open) return opener.visible && raycaster.intersectObject(opener, false).length ? "open" : null;
      const hit = raycaster.intersectObject(panel, false)[0];
      if (!hit?.uv) return null;
      const x = hit.uv.x * W;
      const y = (1 - hit.uv.y) * H;
      return regions.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h)?.id ?? "pane";
    },
    aim(hit) {
      const next = hit === "pane" ? null : hit;
      if (next === aimed) return;
      aimed = next;
      if (open) paint();
      else paintOpener(aimed === "open");
    },
    press(hit) {
      if (hit === "open") return setOpen(true, "floating");
      if (hit === "close") return setOpen(false, mount);
      if (hit.startsWith("tab:")) {
        section = hit.slice(4);
        paint();
        return;
      }
      if (hit.startsWith("act:")) {
        controls.run(hit.slice(4));
        sinceRead = 1;
      }
    },
    update(dt, camera, presenting) {
      if (!presenting) {
        if (group.visible) {
          group.visible = false;
          setOpen(false);
        }
        return;
      }
      clock += dt;
      camera.getWorldPosition(head);
      camera.getWorldDirection(facing2);
      const t = controls.theme;
      const presence = controls.presence;
      const tracked = t.wrist === "off" || presence === "hidden" ? void 0 : grips.find((x) => x.hand === t.wrist && x.grip.visible);
      if (tracked) {
        tracked.grip.getWorldPosition(hand);
        toHand.copy(hand).sub(head);
        const far = toHand.length();
        const inView = toHand.normalize().dot(facing2);
        if (far < 0.48 && inView > 0.88) {
          wristFor += dt;
          wristAway = 0;
        } else if (far > 0.6 || inView < 0.72) {
          wristAway += dt;
          wristFor = 0;
        }
        if (!open && wristFor > 0.35) setOpen(true, "wrist");
        if (open && mount === "wrist" && wristAway > 0.4) setOpen(false, "wrist");
      } else if (open && mount === "wrist") setOpen(false, "wrist");
      const flat = Math.hypot(facing2.x, facing2.z) || 1;
      if (open && mount === "wrist" && tracked) {
        want.set(hand.x, hand.y + 0.16, hand.z);
        if (!placed) group.position.copy(want);
        else group.position.lerp(want, Math.min(1, dt * 14));
        placed = true;
        panel.scale.setScalar(WRIST_W);
        group.lookAt(head);
      } else {
        const reach = open ? 1.05 : 0.75;
        want.set(head.x + facing2.x / flat * reach, Math.max(0.4, head.y - (open ? 0.18 : 0.52)), head.z + facing2.z / flat * reach);
        if (!placed) {
          group.position.copy(want);
          placed = true;
          settling = false;
        } else if (open) {
          if (Math.hypot(head.x - group.position.x, head.z - group.position.z) > 2.6) setOpen(false);
        } else {
          if (group.position.distanceTo(want) > 0.6) settling = true;
          if (settling) {
            group.position.lerp(want, Math.min(1, dt * 6));
            if (group.position.distanceTo(want) < 0.02) settling = false;
          }
        }
        panel.scale.setScalar(FLOAT_W);
        group.rotation.set(0, Math.atan2(head.x - group.position.x, head.z - group.position.z), 0);
      }
      group.visible = true;
      if (open) {
        unfold = Math.min(1, unfold + dt * 4.5);
        material.uniforms.uOpen.value = unfold;
        material.uniforms.uTime.value = t.motion ? clock : 0;
        if ((sinceRead += dt) > 0.3) {
          sinceRead = 0;
          paint();
        }
      } else {
        opener.visible = presence === "full" || presence === "quiet" && !tracked;
        opener.scale.setScalar((presence === "quiet" ? 0.7 : 1) * (aimed === "open" ? 1.1 : 1));
      }
    },
    describe() {
      const view = controls.view();
      const current = view.sections.find((s) => s.id === section) ?? view.sections[0];
      return {
        showing: group.visible,
        open,
        mount,
        section: open ? current?.id ?? "" : "",
        sections: open ? view.sections.map((s) => s.label) : [],
        buttons: open ? current?.items.map((i) => i.label) ?? [] : opener.visible ? ["Menu"] : [],
        note: open ? current?.note ?? "" : "",
        card: open ? current?.card?.title ?? "" : ""
      };
    },
    pressLabelled(label) {
      if (!open) {
        if (label !== "Menu" || !opener.visible) return false;
        con.press("open");
        return true;
      }
      paint();
      const region = regions.find((r) => r.label === label);
      if (!region) return false;
      con.press(region.id);
      return true;
    }
  };
  return con;
}

// packages/sdk/src/desk.ts
import { FOV_RANGE, LOOK_RANGE } from "@nswp/core";
var DESK_PREFS_KEY = "nswp:desk";
var LOOK_STEPS = [
  { value: 0.5, word: "slow" },
  { value: 0.75, word: "gentle" },
  { value: 1, word: "normal" },
  { value: 1.5, word: "quick" },
  { value: 2, word: "fast" },
  { value: 3, word: "fastest" }
];
var FOV_STEPS = [null, 60, 70, 80, 90, 100, 110];
var clampLook = (v) => typeof v === "number" && Number.isFinite(v) ? Math.round(Math.min(LOOK_RANGE[1], Math.max(LOOK_RANGE[0], v)) * 100) / 100 : 1;
var clampFov = (v) => typeof v === "number" && Number.isFinite(v) ? Math.round(Math.min(FOV_RANGE[1], Math.max(FOV_RANGE[0], v))) : null;
var prefs = null;
var watchers = /* @__PURE__ */ new Set();
var keep = (p) => {
  try {
    localStorage.setItem(DESK_PREFS_KEY, JSON.stringify(p));
  } catch {
  }
};
function load() {
  if (prefs) return prefs;
  let kept2 = {};
  try {
    kept2 = JSON.parse(localStorage.getItem(DESK_PREFS_KEY) ?? "{}") ?? {};
  } catch {
  }
  const came = arrivedSettings();
  prefs = { look: clampLook(came.look ?? kept2.look), fov: came.fov !== void 0 ? clampFov(came.fov) : clampFov(kept2.fov) };
  if (came.look !== void 0 || came.fov !== void 0) keep(prefs);
  reportSettings("desk", () => ({ look: load().look, ...load().fov === null ? {} : { fov: load().fov } }));
  return prefs;
}
var change = (next) => {
  prefs = next;
  keep(next);
  for (const w of watchers) w();
};
var lookScale = () => load().look;
var setLookScale = (v) => change({ ...load(), look: clampLook(v) });
var visitorFov = () => currentForm() === "desk" ? load().fov : null;
var setVisitorFov = (v) => change({ ...load(), fov: v === null ? null : clampFov(v) });
function onDeskChange(cb) {
  watchers.add(cb);
  return () => void watchers.delete(cb);
}
var after = (steps, at) => steps[(at + 1) % steps.length];
function addDeskControls(controls, o) {
  const lookAt = () => {
    const now = lookScale();
    let best = 0;
    LOOK_STEPS.forEach((s, i) => {
      if (Math.abs(s.value - now) < Math.abs(LOOK_STEPS[best].value - now)) best = i;
    });
    return best;
  };
  controls.add(
    {
      id: "look-speed",
      section: "moving",
      icon: "turn",
      hidden: o.presenting,
      label: () => `Look speed: ${LOOK_STEPS[lookAt()].word}`,
      short: "Look speed",
      act: () => {
        setLookScale(after(LOOK_STEPS, lookAt()).value);
        controls.say(`Look speed: ${LOOK_STEPS[lookAt()].word}. It is the same in every world.`);
      }
    },
    {
      id: "fov",
      section: "view",
      icon: "size",
      // A touch screen's view is fitted to its window by the world, and a headset has its own.
      hidden: () => o.presenting() || currentForm() !== "desk",
      label: () => load().fov === null ? "Field of view: this world's own" : `Field of view: ${load().fov}\xB0`,
      short: "View width",
      act: () => {
        const at = FOV_STEPS.indexOf(load().fov);
        setVisitorFov(after(FOV_STEPS, at === -1 ? 0 : at));
        controls.say(load().fov === null ? "Field of view: each world's own." : `Field of view: ${load().fov}\xB0, in every world.`);
      }
    }
  );
  onDeskChange(() => controls.setTarget(""));
}
function watchFov(camera, o = {}) {
  const first = camera.fov;
  const apply = () => {
    if (o.presenting?.()) return;
    const fov = visitorFov() ?? o.own?.() ?? first;
    if (camera.fov === fov) return;
    camera.fov = fov;
    camera.updateProjectionMatrix();
  };
  onDeskChange(apply);
  apply();
  return apply;
}

// packages/sdk/src/fresh.ts
var LEAST_MS = 3e4;
var EVERY_MS = 10 * 6e4;
async function markOf(url) {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return null;
    const mark = res.headers.get("etag") ?? res.headers.get("last-modified");
    return mark ? `${mark}` : null;
  } catch {
    return null;
  }
}
async function pageStamp() {
  const page = `${location.origin}${location.pathname}`;
  const script = document.querySelector('script[type="module"][src], script[src]')?.src ?? "";
  const marks = await Promise.all([markOf(page), script && new URL(script).origin === location.origin ? markOf(script) : null]);
  return marks.every((m) => m !== null) || !script && marks[0] ? marks.join("|") : null;
}
function watchFresh(o = {}) {
  const stamp2 = o.stamp ?? pageStamp;
  const now = o.now ?? (() => Date.now());
  const reload = o.reload ?? (() => location.reload());
  let first;
  let stale = false;
  let told = false;
  let asked = -Infinity;
  let asking = null;
  let stopped = false;
  const check = (returning = false) => {
    if (stopped) return Promise.resolve(stale);
    if (stale) {
      if (returning && !o.busy?.()) reload();
      return Promise.resolve(true);
    }
    if (asking) return asking;
    if (now() - asked < LEAST_MS && first !== void 0) return Promise.resolve(false);
    asked = now();
    asking = stamp2().catch(() => null).then((mark) => {
      asking = null;
      if (stopped) return stale;
      if (first === void 0) {
        first = mark;
        return false;
      }
      if (first === null || mark === null || mark === first) return false;
      stale = true;
      if (returning && !o.busy?.()) reload();
      else if (!told) {
        told = true;
        o.onStale?.();
      }
      return true;
    });
    return asking;
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") void check(true);
  };
  const onShow = (e) => {
    if (e.persisted) void check(true);
  };
  let timer;
  if (!o.manual && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisible);
    addEventListener("pageshow", onShow);
    timer = setInterval(() => {
      if (document.visibilityState === "visible") void check(false);
    }, EVERY_MS);
    void check(false);
  }
  return {
    get stale() {
      return stale;
    },
    check,
    reload,
    stop() {
      stopped = true;
      clearInterval(timer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
        removeEventListener("pageshow", onShow);
      }
    }
  };
}

// packages/sdk/src/ui/fresh.ts
var writing = () => {
  const at = typeof document !== "undefined" ? document.activeElement : null;
  return !!at && (at.tagName === "INPUT" || at.tagName === "TEXTAREA" || at.isContentEditable === true);
};
function freshAction(controls, opts = {}) {
  const fresh = opts.fresh ?? watchFresh({
    busy: () => controls.view().chat.ready || writing() || opts.busy?.() === true,
    onStale: () => {
      controls.say("This place has been updated since you opened it. Reload for the latest: it is on your bar, and under Help.");
      controls.signal("fresh");
    }
  });
  return {
    id: "fresh",
    section: "help",
    icon: "turn",
    hotbar: true,
    tone: "primary",
    label: "This place has been updated. Reload for the latest",
    short: "Reload",
    hidden: () => !fresh.stale,
    act: () => fresh.reload()
  };
}

// packages/sdk/src/items.ts
import { DEFAULT_RELAYS, ITEM_KIND, itemCoordinate, parseItem, queryRelays, SCRIPT_LIMITS, verifyEvent } from "@nswp/core";
import * as THREE6 from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
var ITEM_BUDGET = {
  /** The most a model file may weigh, in bytes. */
  bytes: 2e6,
  /** The most triangles, meshes and materials a model may have. */
  triangles: 2e4,
  meshes: 40,
  materials: 16,
  /** The longest side of any picture a model's surfaces may use, in pixels. */
  texture: 1024,
  /** The most one of an item's sounds may weigh, in bytes. */
  sound: 15e4
};
var ITEMS_KEY = "nswp:items";
var watchers2 = /* @__PURE__ */ new Set();
var shown = null;
var keep2 = (on) => {
  try {
    if (on) globalThis.localStorage?.removeItem(ITEMS_KEY);
    else globalThis.localStorage?.setItem(ITEMS_KEY, "off");
  } catch {
  }
};
function showsItems() {
  if (shown !== null) return shown;
  const came = arrivedSettings().items;
  let kept2 = null;
  try {
    kept2 = globalThis.localStorage?.getItem(ITEMS_KEY) ?? null;
  } catch {
  }
  shown = came ?? kept2 !== "off";
  if (came !== void 0) keep2(shown);
  reportSettings("items", () => ({ items: showsItems() }));
  return shown;
}
function setShowsItems(on) {
  showsItems();
  shown = on;
  keep2(on);
  for (const fn of watchers2) fn();
}
function onItemsChange(fn) {
  watchers2.add(fn);
  return () => void watchers2.delete(fn);
}
async function fetchWithin(url, most) {
  try {
    const res = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer", redirect: "error" });
    if (!res.ok) return null;
    const stated = Number(res.headers.get("content-length") ?? 0);
    if (stated > most) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    return bytes.length <= most ? bytes : null;
  } catch {
    return null;
  }
}
function withinBudget(root) {
  let triangles = 0;
  let meshes = 0;
  const materials = /* @__PURE__ */ new Set();
  let ok = true;
  root.traverse((o) => {
    const mesh = o;
    if (!mesh.isMesh) return;
    meshes++;
    const g = mesh.geometry;
    triangles += Math.floor((g.index ? g.index.count : g.attributes.position?.count ?? 0) / 3);
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      materials.add(m);
      for (const value of Object.values(m)) {
        const image = value?.isTexture ? value.image : null;
        if (image && Math.max(image.width ?? 0, image.height ?? 0) > ITEM_BUDGET.texture) ok = false;
      }
    }
  });
  return ok && meshes > 0 && meshes <= ITEM_BUDGET.meshes && triangles <= ITEM_BUDGET.triangles && materials.size <= ITEM_BUDGET.materials;
}
function fitToSize(root, size) {
  const box = new THREE6.Box3().setFromObject(root);
  const has = box.getSize(new THREE6.Vector3());
  const scale = Math.min(size[0] / (has.x || 1), size[1] / (has.y || 1), size[2] / (has.z || 1));
  const holder = new THREE6.Group();
  root.scale.multiplyScalar(Number.isFinite(scale) && scale > 0 ? scale : 1);
  const fitted = new THREE6.Box3().setFromObject(root);
  const centre = fitted.getCenter(new THREE6.Vector3());
  root.position.x -= centre.x;
  root.position.z -= centre.z;
  root.position.y -= fitted.min.y;
  holder.add(root);
  return holder;
}
function createItems(opts = {}) {
  const query = opts.query ?? queryRelays;
  const now = opts.now ?? (() => Date.now());
  const fetchBytes = opts.fetchBytes ?? ((url) => fetchWithin(url, ITEM_BUDGET.bytes));
  const described = /* @__PURE__ */ new Map();
  const settled = /* @__PURE__ */ new Map();
  const models = /* @__PURE__ */ new Map();
  const clipsOf = /* @__PURE__ */ new Map();
  const files2 = /* @__PURE__ */ new Map();
  const file = (named, most) => {
    let got = files2.get(named.sha256);
    if (!got) {
      got = fetchBytes(named.url).then((bytes) => bytes && bytes.length <= most && bytesToHex(sha256(bytes)) === named.sha256 ? bytes : null).catch(() => null);
      files2.set(named.sha256, got);
    }
    return got;
  };
  const marker = (item) => {
    const [w, h, d] = item.size;
    const box = new THREE6.Mesh(new THREE6.BoxGeometry(w, h, d), new THREE6.MeshBasicMaterial({ color: 10135476, wireframe: true }));
    box.position.y = h / 2;
    const holder = new THREE6.Group();
    holder.add(box);
    return holder;
  };
  const load2 = (item) => {
    const key = `${item.model.sha256}:${item.size.join(",")}`;
    let made = models.get(key);
    if (!made) {
      made = (async () => {
        const bytes = await fetchBytes(item.model.url);
        if (!bytes || bytes.length > ITEM_BUDGET.bytes || bytesToHex(sha256(bytes)) !== item.model.sha256) return null;
        try {
          const read = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
          const extra = [];
          read.scene.traverse((o) => {
            if (o.isLight || o.isCamera) extra.push(o);
          });
          for (const o of extra) o.removeFromParent();
          if (!withinBudget(read.scene)) return null;
          clipsOf.set(key, (read.animations ?? []).slice(0, 8));
          return fitToSize(read.scene, item.size);
        } catch {
          return null;
        }
      })();
      models.set(key, made);
    }
    return made;
  };
  return {
    describe(coordinateIn) {
      const coordinate = itemCoordinate(coordinateIn);
      if (!coordinate) return Promise.resolve(null);
      let found = described.get(coordinate);
      if (!found) {
        const [, maker, ...rest] = coordinate.split(":");
        found = askWell({ kinds: [ITEM_KIND], authors: [maker], "#d": [rest.join(":")], limit: 4 }, { own: [], usual: opts.relays ?? DEFAULT_RELAYS, query, timeoutMs: 4e3, now }).then((got) => {
          const newest = got.events.filter((e) => e.kind === ITEM_KIND && e.pubkey === maker && verifyEvent(e)).sort((a, b) => b.created_at - a.created_at)[0];
          const item = newest ? parseItem(newest) : null;
          return item && item.id === coordinate ? item : null;
        }).catch(() => null).then((item) => {
          settled.set(coordinate, item);
          if (!item) described.delete(coordinate);
          return item;
        });
        described.set(coordinate, found);
      }
      return found;
    },
    known: (coordinate) => settled.get(itemCoordinate(coordinate)) ?? null,
    async model(item) {
      if (!showsItems()) return marker(item);
      const made = await load2(item);
      return made ? made.clone(true) : marker(item);
    },
    marker,
    clips: (item) => clipsOf.get(`${item.model.sha256}:${item.size.join(",")}`) ?? [],
    async sent(item, name) {
      const send = item.sends.find((s) => s.name === name);
      if (!send) return marker({ size: [0.03, 0.03, 0.1] });
      if (!showsItems()) return marker(send);
      const made = await load2(send);
      return made ? made.clone(true) : marker(send);
    },
    async sound(item, name) {
      const named = item.sounds[name];
      return named && showsItems() ? file(named, ITEM_BUDGET.sound) : null;
    },
    async script(item) {
      if (!item.script || !showsItems()) return null;
      const bytes = await file(item.script, SCRIPT_LIMITS.bytes);
      try {
        return bytes ? new TextDecoder("utf-8", { fatal: true }).decode(bytes) : null;
      } catch {
        return null;
      }
    }
  };
}

// packages/sdk/src/play.ts
import {
  buildDid,
  buildHit,
  buildShot,
  buildState,
  cleanItemsRule,
  createRate as createRate2,
  GRAVITY,
  HEALTH,
  meetsPerson,
  parseDid,
  parseHit,
  parseShot,
  parseState,
  PERSON_SHAPE,
  PLAY_LIMITS,
  shotAt,
  struck
} from "@nswp/core";
import * as THREE7 from "three";

// packages/sdk/src/item-box.ts
import { cleanAsk, createRate, ITEM_ASKS } from "@nswp/core";
function runInBox(script, on, opts = {}) {
  if (typeof document === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
    frame.src = opts.url ?? new URL("item-box.html", document.baseURI).href;
    const gates = Object.fromEntries(Object.entries(ITEM_ASKS).map(([name, g]) => [name, createRate(g.burst, g.perSecond)]));
    let running = false;
    let over = false;
    let began = 0;
    let ticking;
    const say = (m) => frame.contentWindow?.postMessage({ nswpItemBox: 1, ...m }, "*");
    const end = (why) => {
      if (over) return;
      over = true;
      const was = running;
      running = false;
      clearInterval(ticking);
      clearTimeout(giveUp);
      removeEventListener("message", heard);
      frame.remove();
      if (was) on.stopped?.(why);
      else resolve(null);
    };
    const run = {
      tell(event, arg) {
        if (running) say({ t: "event", name: event, ...arg === void 0 ? {} : { arg } });
      },
      stop: () => end("asked"),
      get running() {
        return running;
      }
    };
    const heard = (e) => {
      if (e.source !== frame.contentWindow) return;
      const m = e.data;
      if (!m || m.nswpItemBox !== 1) return;
      if (m.t === "ready") say({ t: "run", script });
      else if (m.t === "started" && !running && !over) {
        running = true;
        began = performance.now();
        clearTimeout(giveUp);
        ticking = setInterval(() => run.tell("tick", Math.round(performance.now() - began)), 100);
        resolve(run);
      } else if (m.t === "ask" && running) {
        const ask = cleanAsk(m.name, m.args);
        if (ask && gates[ask.ask].take(performance.now())) on.ask(ask);
      } else if (m.t === "stopped") end(String(m.why ?? "stopped"));
      else if (m.t === "error" && !running) end("failed");
    };
    addEventListener("message", heard);
    const giveUp = setTimeout(() => end("no box"), opts.startMs ?? 5e3);
    frame.addEventListener("error", () => end("no box"));
    document.body.append(frame);
  });
}

// packages/sdk/src/play.ts
var SCRIPT_KEPT = "nswp:item-scripts";
function scriptAllowed(sha2562) {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(SCRIPT_KEPT) ?? "[]").includes(sha2562);
  } catch {
    return false;
  }
}
function allowScript(sha2562) {
  try {
    const kept2 = JSON.parse(globalThis.localStorage?.getItem(SCRIPT_KEPT) ?? "[]").filter((x) => typeof x === "string" && x !== sha2562);
    globalThis.localStorage?.setItem(SCRIPT_KEPT, JSON.stringify([...kept2, sha2562].slice(-64)));
  } catch {
  }
}
function drawn(width, height, paint) {
  if (typeof document === "undefined") {
    const blank = new THREE7.Sprite(new THREE7.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false }));
    blank.userData.nswpNoHit = true;
    return blank;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d");
  if (g) paint(g);
  const map = new THREE7.CanvasTexture(canvas);
  map.colorSpace = THREE7.SRGBColorSpace;
  const sprite = new THREE7.Sprite(new THREE7.SpriteMaterial({ map, transparent: true, depthTest: false, depthWrite: false }));
  sprite.renderOrder = 999;
  sprite.userData.nswpNoHit = true;
  return sprite;
}
var repaint = (sprite, paint) => {
  const map = sprite.material.map;
  if (!map) return;
  const canvas = map.image;
  const g = canvas.getContext("2d");
  if (!g) return;
  g.clearRect(0, 0, canvas.width, canvas.height);
  paint(g, canvas.width, canvas.height);
  map.needsUpdate = true;
};
var bar = (g, w, h, value, full) => {
  const gap = 6;
  const each = (w - gap * (full + 1)) / full;
  g.fillStyle = "rgba(8,10,14,0.72)";
  g.beginPath();
  g.roundRect(0, 0, w, h, h / 3);
  g.fill();
  for (let i = 0; i < full; i++) {
    g.fillStyle = i < value ? value <= full / 3 ? "#ff6b5e" : "#7be495" : "rgba(255,255,255,0.16)";
    g.beginPath();
    g.roundRect(gap + i * (each + gap), gap, each, h - gap * 2, 4);
    g.fill();
  }
};
function createPlay(o) {
  const things = [];
  const pending = /* @__PURE__ */ new Set();
  const rates = /* @__PURE__ */ new Map();
  const bars = /* @__PURE__ */ new Map();
  const mixers = /* @__PURE__ */ new Map();
  const soundsOf = /* @__PURE__ */ new Map();
  const ray = new THREE7.Raycaster();
  const v = new THREE7.Vector3();
  const w = new THREE7.Vector3();
  let clock = 0;
  let lastAt = null;
  let sent = 0;
  let landed = 0;
  let taken = 0;
  let nextId = Math.floor(Math.random() * 1e3);
  const active = () => cleanItemsRule(o.rule()) !== "none" && showsItems();
  const muted = (pubkey) => cleanItemsRule(o.rule()) === "allowed" && !!o.itemsMuted?.(pubkey);
  const hud = new THREE7.Group();
  hud.userData.nswpNoHit = true;
  o.camera.add(hud);
  const cross = drawn(64, 64, (g) => {
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(32, 32, 9, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.fillRect(31, 31, 2, 2);
  });
  cross.position.set(0, 0, -1);
  cross.scale.setScalar(0.035);
  cross.visible = false;
  const mark = drawn(64, 64, (g) => {
    g.strokeStyle = "#ffffff";
    g.lineWidth = 6;
    g.lineCap = "round";
    for (const [a, b, c, e] of [[10, 10, 24, 24], [54, 10, 40, 24], [10, 54, 24, 40], [54, 54, 40, 40]]) {
      g.beginPath();
      g.moveTo(a, b);
      g.lineTo(c, e);
      g.stroke();
    }
  });
  mark.position.set(0, 0, -1);
  mark.scale.setScalar(0.07);
  mark.visible = false;
  let markUntil = 0;
  const own = { value: HEALTH.full, full: HEALTH.full, struckAt: -1e9, downUntil: 0, shownUntil: 0 };
  const ownBar = drawn(256, 40, (g) => bar(g, 256, 40, own.value, own.full));
  ownBar.position.set(0, 0.3, -1);
  ownBar.scale.set(0.26, 0.04, 1);
  ownBar.visible = false;
  hud.add(cross, mark, ownBar);
  const sayState = () => {
    const said = buildState({ name: "health", value: own.value, full: own.full });
    if (said && o.me()) o.tell(said);
    repaint(ownBar, (g, cw, ch) => bar(g, cw, ch, own.value, own.full));
    own.shownUntil = clock + 2.5;
    o.onChange?.();
  };
  const soundOf = (item2, name) => {
    const named = item2.sounds[name];
    if (!named || !o.sounds) return Promise.resolve(null);
    let got = soundsOf.get(named.sha256);
    if (!got) {
      got = o.items.sound(item2, name).then((bytes) => bytes && o.sounds ? o.sounds.decode(bytes) : null);
      soundsOf.set(named.sha256, got);
    }
    return got;
  };
  const hear = (item2, name, at) => {
    if (!name || !o.sounds || !active()) return;
    void soundOf(item2, name).then((sound) => {
      if (!sound || !o.sounds) return;
      if (!at) return o.sounds.playForeign(sound);
      o.camera.getWorldPosition(v);
      const to = w.copy(at).sub(v);
      const distance = to.length();
      const right = new THREE7.Vector3(1, 0, 0).applyQuaternion(o.camera.getWorldQuaternion(new THREE7.Quaternion()));
      const pan = distance < 0.01 ? 0 : THREE7.MathUtils.clamp(to.normalize().dot(right), -1, 1) * Math.min(1, distance / 1.5);
      o.sounds.playForeign(sound, { distance, pan });
    });
  };
  const animate = (item2, model2, name) => {
    if (!model2) return;
    const clip = o.items.clips(item2).find((c) => c.name === name);
    if (!clip) return;
    let mixer = mixers.get(model2);
    if (!mixer) {
      mixer = new THREE7.AnimationMixer(model2);
      mixers.set(model2, mixer);
    }
    const action = mixer.clipAction(clip);
    action.reset();
    action.setLoop(THREE7.LoopOnce, 1);
    action.clampWhenFinished = false;
    action.play();
  };
  let solids = [];
  let solidsAt = -1e9;
  const worldShapes = () => {
    if (clock - solidsAt < 1.5) return solids;
    solidsAt = clock;
    const found = [];
    const walk = (node) => {
      if (node === o.rig || node === o.camera || node.userData.nswpNoHit || !node.visible) return;
      const mesh = node;
      if (mesh.isMesh && mesh.geometry) {
        const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const shape = material && material.side !== THREE7.BackSide && !(material.transparent && material.opacity < 0.35) && material.blending !== THREE7.AdditiveBlending;
        if (shape && (o.solid ? o.solid(mesh) : true)) found.push(mesh);
      }
      for (const child of node.children) walk(child);
    };
    walk(o.scene);
    solids = found;
    return solids;
  };
  const floorUnder = (at) => {
    ray.set(w.set(at.x, at.y + 0.05, at.z), new THREE7.Vector3(0, -1, 0));
    ray.far = 60;
    const hit = ray.intersectObjects(worldShapes(), false)[0];
    return hit ? hit.point.y : o.rig.getWorldPosition(new THREE7.Vector3()).y;
  };
  const drop = (thing) => {
    if (thing.state === "falling" || thing.state === "lying") return;
    o.scene.attach(thing.object);
    thing.state = "falling";
    thing.fall = 0;
    thing.floor = floorUnder(thing.object.getWorldPosition(new THREE7.Vector3()));
  };
  const gone = (thing) => {
    thing.object.removeFromParent();
    const at = things.indexOf(thing);
    if (at >= 0) things.splice(at, 1);
  };
  const launch = async (by, item2, shot) => {
    const send = item2.sends.find((s) => s.name === shot.name);
    if (!send || !active()) return;
    const born = clock;
    pending.add(`${by}:${shot.id}`);
    const inner = await o.items.sent(item2, shot.name);
    if (!active()) return void pending.delete(`${by}:${shot.id}`);
    inner.position.y -= send.size[1] / 2;
    const object = new THREE7.Group();
    object.userData.nswpNoHit = true;
    object.add(inner);
    object.position.fromArray(shot.from);
    o.scene.add(object);
    while (things.length >= PLAY_LIMITS.flown) gone(things[0]);
    const thing = { by, shot, send, item: item2, object, t: 0, state: "flying", on: "", agreeBy: null, agreed: false, until: 0, fall: 0, floor: 0 };
    things.push(thing);
    pending.delete(`${by}:${shot.id}`);
    const late = Math.min(PLAY_LIMITS.life, clock - born);
    while (thing.state === "flying" && things.includes(thing) && thing.t < late) fly(thing, Math.min(0.03, late - thing.t + 1e-6));
  };
  const stick = (thing, at, onto, on) => {
    thing.object.position.copy(at);
    const going2 = new THREE7.Vector3(thing.shot.velocity[0], thing.shot.velocity[1] - GRAVITY * thing.t, thing.shot.velocity[2]);
    if (going2.lengthSq() > 1e-6) thing.object.lookAt(w.copy(at).add(going2));
    if (onto) onto.attach(thing.object);
    thing.state = "stuck";
    thing.on = on;
    thing.until = thing.t + thing.shot.stick;
  };
  const self = () => {
    const head = o.camera.getWorldPosition(new THREE7.Vector3());
    const floor = o.rig.getWorldPosition(new THREE7.Vector3()).y;
    return { feet: new THREE7.Vector3(head.x, floor, head.z), height: THREE7.MathUtils.clamp(head.y - floor + 0.12, 0.6, 2.4) };
  };
  const shapeOf = (p) => ({ feet: new THREE7.Vector3(p.head.x, p.head.y - 1.5, p.head.z), height: 1.62 });
  const reached = (thing, at) => {
    const me = self();
    taken++;
    const effect = thing.item.effects.find((e) => e.of === thing.shot.name && e.state === "health");
    const said = buildHit({ by: thing.by, id: thing.shot.id, at: [at.x - me.feet.x, at.y - me.feet.y, at.z - me.feet.z] });
    if (said) o.tell(said);
    hear(thing.item, thing.send.strikes, null);
    if (effect && clock >= own.downUntil) {
      own.value = struck(own.value, effect.take);
      own.struckAt = clock;
      if (own.value === 0) own.downUntil = clock + HEALTH.downSeconds;
      sayState();
    }
    gone(thing);
  };
  const fly = (thing, dt) => {
    const a = new THREE7.Vector3().fromArray(shotAt(thing.shot, thing.t));
    const b = new THREE7.Vector3().fromArray(shotAt(thing.shot, thing.t + dt));
    const step = b.clone().sub(a);
    const length = step.length();
    let first = 1.0001;
    let done = null;
    if (length > 1e-6) {
      ray.set(a, step.clone().divideScalar(length));
      ray.far = length;
      const hit = ray.intersectObjects(worldShapes(), false)[0];
      if (hit) {
        first = hit.distance / length;
        done = () => {
          stick(thing, hit.point, hit.object, "world");
          hear(thing.item, thing.send.lands, hit.point);
          o.onStruck?.({ object: hit.object, point: hit.point.clone(), by: thing.by, name: thing.shot.name });
        };
      }
    }
    const me = o.me();
    if (me && thing.by !== me && !muted(thing.by)) {
      const mine = self();
      const t = meetsPerson(a.toArray(), b.toArray(), mine.feet.toArray(), mine.height, PERSON_SHAPE.radius);
      if (t !== null && t < first) {
        first = t;
        done = () => reached(thing, a.clone().addScaledVector(step, t));
      }
    }
    for (const p of o.people()) {
      if (p.pubkey === thing.by) continue;
      const shape = shapeOf(p);
      const t = meetsPerson(a.toArray(), b.toArray(), shape.feet.toArray(), shape.height, PERSON_SHAPE.radius);
      if (t !== null && t < first) {
        first = t;
        done = () => {
          stick(thing, a.clone().addScaledVector(step, t), p.body, p.pubkey);
          thing.agreeBy = thing.t + PLAY_LIMITS.agree;
        };
      }
    }
    thing.t += dt;
    if (done) return done();
    thing.object.position.copy(b);
    const going2 = new THREE7.Vector3(thing.shot.velocity[0], thing.shot.velocity[1] - GRAVITY * thing.t, thing.shot.velocity[2]);
    thing.object.lookAt(w.copy(b).add(going2));
    if (thing.t > PLAY_LIMITS.life) gone(thing);
  };
  let item = null;
  let model = null;
  let box = null;
  let scriptState = "none";
  let words = "";
  let wordsSprite = null;
  let holdingNo = 0;
  const showWords = (text) => {
    words = text;
    if (wordsSprite) {
      repaint(wordsSprite, (g, cw, ch) => {
        if (!text) return;
        g.font = "600 44px system-ui, sans-serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        const wide = Math.min(cw - 8, g.measureText(text).width + 36);
        g.fillStyle = "rgba(8,10,14,0.72)";
        g.beginPath();
        g.roundRect((cw - wide) / 2, 6, wide, ch - 12, 18);
        g.fill();
        g.fillStyle = "#ffffff";
        g.fillText(text, cw / 2, ch / 2 + 2, cw - 24);
      });
    }
    o.onChange?.();
  };
  const aim = (lift) => {
    const said = o.aim?.();
    let from;
    let to;
    if (said) ({ from, to } = said);
    else {
      const q = o.camera.getWorldQuaternion(new THREE7.Quaternion());
      const eye = o.camera.getWorldPosition(new THREE7.Vector3());
      from = eye.clone().add(new THREE7.Vector3(0.14, -0.12, -0.35).applyQuaternion(q));
      to = eye.clone().add(new THREE7.Vector3(0, 0, -18).applyQuaternion(q));
    }
    const dir = to.clone().sub(from).normalize();
    if (lift) dir.applyAxisAngle(new THREE7.Vector3().crossVectors(dir, new THREE7.Vector3(0, 1, 0)).normalize(), lift);
    return { from, dir };
  };
  const asked = (ask) => {
    if (!item || !active()) return;
    if (ask.ask === "show") return showWords(ask.text);
    if (ask.ask === "play") {
      if (!item.sounds[ask.name]) return;
      hear(item, ask.name, null);
      const said2 = buildDid({ kind: "sound", name: ask.name });
      if (said2 && o.me()) o.tell(said2);
      return;
    }
    if (ask.ask === "clip") {
      animate(item, model, ask.name);
      const said2 = buildDid({ kind: "clip", name: ask.name });
      if (said2 && o.me()) o.tell(said2);
      return;
    }
    if (ask.ask !== "send" || !item.sends.some((s) => s.name === ask.name)) return;
    const { from, dir } = aim(ask.lift);
    const shot = { id: nextId++, name: ask.name, from: from.toArray(), velocity: dir.multiplyScalar(ask.speed).toArray(), stick: ask.stick };
    const said = buildShot(shot);
    const read = said ? parseShot(said) : null;
    if (!said || !read) return;
    sent++;
    void launch(o.me() ?? "", item, read);
    if (o.me()) o.tell(said);
  };
  const refreshOwn = () => {
    cross.visible = !!item && !!box && !!item.does.use && active() && !isPresenting();
  };
  const isPresenting = () => !!o.presenting?.();
  return {
    async held(next, drawnFor) {
      const no = ++holdingNo;
      if (box) {
        box.tell("away");
        const old = box;
        box = null;
        setTimeout(() => old.stop(), 250);
      }
      if (model) mixers.delete(model);
      wordsSprite?.removeFromParent();
      wordsSprite = null;
      item = next;
      model = drawnFor;
      scriptState = "none";
      words = "";
      refreshOwn();
      o.onChange?.();
      if (!next || !drawnFor || !active()) return;
      if (next.does.use || next.script) {
        wordsSprite = drawn(256, 72, () => {
        });
        wordsSprite.scale.set(0.16, 0.045, 1);
        wordsSprite.position.set(0, next.size[1] + 0.05, 0);
        drawnFor.add(wordsSprite);
      }
      for (const s of next.sends) void o.items.sent(next, s.name);
      for (const name of Object.keys(next.sounds)) void soundOf(next, name);
      if (!next.script || !o.scripts || !scriptAllowed(next.script.sha256)) return;
      const text = await o.items.script(next);
      if (!text || no !== holdingNo) return;
      const run = await runInBox(text, { ask: asked, stopped: () => void (scriptState = "stopped", box = null, showWords("")) }, typeof o.scripts === "object" ? o.scripts : {});
      if (no !== holdingNo) return run?.stop();
      box = run;
      scriptState = run ? "running" : "stopped";
      run?.tell("held");
      o.onChange?.();
    },
    use() {
      if (active()) box?.tell("use");
    },
    second() {
      if (active()) box?.tell("second");
    },
    get does() {
      return item && box && (item.does.use || item.does.second) ? { use: item.does.use ?? "", second: item.does.second ?? "" } : null;
    },
    get words() {
      return words;
    },
    get health() {
      return { value: own.value, full: own.full };
    },
    heard(from, said) {
      if (!active() || muted(from)) return;
      const person = o.people().find((p) => p.pubkey === from);
      if (!person) return;
      const state = parseState(said);
      if (state) {
        let shown2 = bars.get(from);
        if (!shown2) {
          const sprite = drawn(256, 40, () => {
          });
          sprite.scale.set(0.42, 0.065, 1);
          sprite.position.set(0, 0.62, 0);
          shown2 = { value: state.value, full: state.full, sprite, until: 0 };
          bars.set(from, shown2);
        }
        shown2.value = state.value;
        shown2.full = Math.min(state.full, 12);
        shown2.until = clock + (state.value < state.full ? 30 : 2);
        person.over.add(shown2.sprite);
        repaint(shown2.sprite, (g, cw, ch) => bar(g, cw, ch, Math.min(shown2.value, shown2.full), shown2.full));
        return;
      }
      const hit = parseHit(said);
      if (hit) {
        const thing = things.find((t) => t.by === hit.by && t.shot.id === hit.id);
        if (!thing || thing.agreed || thing.state === "falling" || thing.state === "lying") return;
        thing.agreed = true;
        const feet = shapeOf(person).feet;
        const at = new THREE7.Vector3(feet.x + hit.at[0], feet.y + hit.at[1], feet.z + hit.at[2]);
        if (thing.on !== from) stick(thing, at, person.body, from);
        thing.agreeBy = null;
        hear(thing.item, thing.send.strikes, at);
        if (hit.by === o.me()) {
          hear(thing.item, thing.send.tells, null);
          landed++;
          mark.visible = true;
          markUntil = clock + 0.22;
          o.onChange?.();
        }
        return;
      }
      if (!person.holding) return;
      const did = parseDid(said);
      const shot = did ? null : parseShot(said);
      if (!did && !shot) return;
      if (shot) {
        let rate = rates.get(from);
        if (!rate) rates.set(from, rate = createRate2(PLAY_LIMITS.burst, PLAY_LIMITS.perSecond));
        if (!rate.take(clock * 1e3) || pending.has(`${from}:${shot.id}`) || things.some((t) => t.by === from && t.shot.id === shot.id)) return;
        if (person.head.distanceTo(v.fromArray(shot.from)) > 3) return;
      }
      const does = (holding) => {
        if (!holding) return;
        if (did?.kind === "sound") hear(holding, holding.sounds[did.name] ? did.name : void 0, person.head);
        else if (did) animate(holding, person.held, did.name);
        else if (shot) void launch(from, holding, shot);
      };
      const known = o.items.known(person.holding);
      if (known) does(known);
      else {
        if (shot) pending.add(`${from}:${shot.id}`);
        const born = clock;
        void o.items.describe(person.holding).then((found) => {
          if (shot) pending.delete(`${from}:${shot.id}`);
          if (found && (shot ? clock - born < 2 : clock - born < 0.3)) does(found);
        });
      }
    },
    left(pubkey) {
      for (const thing of [...things]) if (thing.by === pubkey || thing.on === pubkey) gone(thing);
      bars.get(pubkey)?.sprite.removeFromParent();
      bars.delete(pubkey);
      rates.delete(pubkey);
    },
    update(frame) {
      const at = typeof performance === "undefined" ? null : performance.now();
      const dt = at === null || lastAt === null ? frame : Math.min(1, Math.max(0, (at - lastAt) / 1e3));
      lastAt = at;
      clock += dt;
      for (const mixer of mixers.values()) mixer.update(dt);
      if (mark.visible && clock > markUntil) mark.visible = false;
      refreshOwn();
      if (own.value < own.full && (own.downUntil && clock >= own.downUntil || !own.downUntil && clock - own.struckAt > HEALTH.restSeconds)) {
        own.value = own.full;
        own.downUntil = 0;
        sayState();
      }
      ownBar.visible = active() && (own.value < own.full || clock < own.shownUntil);
      for (const [who, shown2] of bars) {
        shown2.sprite.visible = active() && clock < shown2.until && !muted(who);
      }
      for (const thing of [...things]) {
        if (thing.state === "flying") {
          let left = Math.min(dt, 0.5);
          while (left > 1e-6 && thing.state === "flying" && things.includes(thing)) {
            const step = Math.min(0.03, left);
            fly(thing, step);
            left -= step;
          }
        } else if (thing.state === "stuck") {
          thing.t += dt;
          if (thing.agreeBy !== null && thing.t > thing.agreeBy) drop(thing);
          else if (thing.t > thing.until) drop(thing);
          else if (thing.on !== "world" && !o.people().some((p) => p.pubkey === thing.on)) gone(thing);
        } else if (thing.state === "falling") {
          thing.fall += GRAVITY * dt;
          thing.object.position.y -= thing.fall * dt;
          thing.object.rotation.x += dt * 5;
          if (thing.object.position.y <= thing.floor + 0.02) {
            thing.object.position.y = thing.floor + 0.02;
            thing.state = "lying";
            thing.until = 0.6;
            hear(thing.item, thing.send.drops, thing.object.position);
          }
        } else {
          thing.until -= dt;
          thing.object.scale.setScalar(Math.max(0.01, thing.until / 0.6));
          if (thing.until <= 0) gone(thing);
        }
      }
    },
    info() {
      const count = (state) => things.filter((t) => t.state === state).length;
      return {
        flying: count("flying"),
        stuck: count("stuck"),
        falling: count("falling") + count("lying"),
        things: things.map((t) => ({ by: t.by, id: t.shot.id, state: t.state, on: t.on, onto: `${t.object.parent?.type ?? ""}:${t.object.parent?.name ?? ""}`, at: t.object.getWorldPosition(new THREE7.Vector3()).toArray().map((n) => Math.round(n * 100) / 100) })),
        sent,
        landed,
        taken,
        health: { value: own.value, full: own.full },
        words,
        script: scriptState,
        marked: mark.visible,
        bars: Object.fromEntries([...bars].map(([who, b]) => [who, { value: b.value, full: b.full }]))
      };
    },
    dispose() {
      box?.stop();
      for (const thing of [...things]) gone(thing);
      for (const b of bars.values()) b.sprite.removeFromParent();
      hud.removeFromParent();
    }
  };
}

// packages/sdk/src/following.ts
import { decodeNpub, encodeNpub, shortNpub as shortNpub2 } from "@nswp/core";

// packages/sdk/src/profiles.ts
import { cleanAbout, cleanName as cleanName2, cleanPicture, DEFAULT_RELAYS as DEFAULT_RELAYS2, isHex64, queryRelays as queryRelays2, verifyEvent as verifyEvent2 } from "@nswp/core";
var KEY2 = "nswp:profiles";
var MOST = 400;
var FRESH_MS = 24 * 3600 * 1e3;
var AT_ONCE = 60;
function readProfile(event) {
  let meta = {};
  try {
    const parsed = JSON.parse(event.content);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) meta = parsed;
  } catch {
  }
  let name = "";
  for (const v of [meta.display_name, meta.displayName, meta.name]) {
    if (!name && typeof v === "string") name = cleanName2(v);
  }
  return { name, picture: cleanPicture(meta.picture), about: cleanAbout(meta.about), at: event.created_at };
}
function createProfiles(opts = {}) {
  const now = opts.now ?? (() => Date.now());
  const query = opts.query ?? queryRelays2;
  const store = (() => {
    if (opts.storage !== void 0) return opts.storage;
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  })();
  const watchers3 = /* @__PURE__ */ new Set();
  let kept2 = null;
  const all = () => {
    if (kept2) return kept2;
    kept2 = {};
    try {
      const read = JSON.parse(store?.getItem(KEY2) ?? "{}");
      if (read && typeof read === "object" && !Array.isArray(read)) {
        for (const [k, v] of Object.entries(read)) {
          if (!isHex64(k) || !v || typeof v !== "object") continue;
          kept2[k] = { name: cleanName2(typeof v.name === "string" ? v.name : ""), picture: cleanPicture(v.picture), about: cleanAbout(v.about), at: typeof v.at === "number" ? v.at : 0, asked: typeof v.asked === "number" ? v.asked : 0 };
        }
      }
    } catch {
    }
    return kept2;
  };
  const save = () => {
    const entries = Object.entries(all());
    if (entries.length > MOST) kept2 = Object.fromEntries(entries.sort((a, b) => b[1].asked - a[1].asked).slice(0, MOST));
    try {
      store?.setItem(KEY2, JSON.stringify(kept2));
    } catch {
    }
  };
  return {
    get: (pubkey) => all()[pubkey] ?? null,
    async fetch(pubkeys) {
      const book = all();
      const wanted = [...new Set(pubkeys)].filter((k) => isHex64(k) && now() - (book[k]?.asked ?? 0) > FRESH_MS).slice(0, AT_ONCE);
      if (wanted.length === 0) return;
      const got = await askWell({ kinds: [0], authors: wanted, limit: wanted.length * 2 }, { own: [], usual: opts.relays ?? DEFAULT_RELAYS2, query, timeoutMs: 4e3, now }).catch(() => null);
      const answered = !!got && Object.values(got.relays).some((said) => said === "eose");
      for (const e of got?.events ?? []) {
        if (e.kind !== 0 || !wanted.includes(e.pubkey) || !verifyEvent2(e)) continue;
        const had = book[e.pubkey];
        if (had && had.at >= e.created_at) continue;
        book[e.pubkey] = { ...readProfile(e), asked: now() };
      }
      if (answered) for (const k of wanted) book[k] = { ...book[k] ?? { name: "", picture: "", about: "", at: 0 }, asked: now() };
      save();
      for (const fn of watchers3) fn();
    },
    onChange(fn) {
      watchers3.add(fn);
      return () => void watchers3.delete(fn);
    }
  };
}

// packages/sdk/src/following.ts
var PAGE = 24;
function keyIn(text) {
  if (typeof text !== "string") return null;
  const found = /npub1[02-9ac-hj-np-z]{58}/.exec(text)?.[0] ?? /\b[0-9a-f]{64}\b/i.exec(text)?.[0];
  if (!found) return null;
  try {
    return decodeNpub(found);
  } catch {
    return null;
  }
}
function addFollowingControls(controls, opts) {
  const f = opts.follows;
  const profiles = opts.profiles ?? createProfiles(opts.relays ? { relays: opts.relays } : {});
  let shown2 = [];
  let chosen = null;
  let pages = 1;
  let wasMe = null;
  let looked = false;
  const nameOf = (pubkey) => profiles.get(pubkey)?.name || shortNpub2(pubkey);
  const say = (text) => controls.say(text);
  const press = (pubkey, name, adding) => {
    const now = async () => {
      const done = await (adding ? f.people.follow(pubkey, name) : f.people.unfollow(pubkey, name));
      say(done.said);
      if (done.ok && adding) void profiles.fetch([pubkey]);
      refresh();
    };
    if (!f.pubkey()) return say("Sign in to follow people: it is under You.");
    if (f.allowed()) return void now();
    say(f.ask(() => void now()));
  };
  const byKey = async () => {
    const me = f.pubkey();
    if (!me) return say("Sign in to follow people: it is under You.");
    let text = "";
    const keyboard = opts.presenting?.() ? opts.keyboard?.() ?? null : null;
    if (keyboard) text = await keyboard.ask({ title: "Their key: npub1\u2026 Paste it, or type it. Done follows them.", maxLength: 80 }).catch(() => null) ?? "";
    else {
      try {
        text = await (opts.copied ? opts.copied() : navigator.clipboard.readText());
      } catch {
        return say("What you copied couldn't be read here. Copy their key (it starts npub1), allow this site to read what you copy, and press again.");
      }
    }
    const key = keyIn(text);
    if (!key) return say(keyboard ? "That isn't a key. A key starts npub1 and is 63 characters long." : "What you copied isn't a key. Copy their key (it starts npub1) and press again.");
    if (key === me) return say("That is your own key.");
    chosen = key;
    await profiles.fetch([key]);
    press(key, nameOf(key), true);
  };
  const refresh = () => {
    for (const id of shown2) controls.remove(id);
    shown2 = [];
    const me = f.pubkey();
    if (me !== wasMe) {
      wasMe = me;
      chosen = null;
      pages = 1;
      looked = false;
    }
    const allowed = !!me && f.allowed();
    const follows = allowed ? f.people.follows() : null;
    const add = (...actions) => {
      for (const a of actions) shown2.push(a.id);
      controls.add(...actions.map((a) => ({ section: "following", ...a })));
    };
    controls.addSection({
      id: "following",
      label: "Following",
      icon: "list",
      note: () => !me ? "Sign in to see who you follow." : !allowed ? "Who you follow is yours, and the same in every Nostr app. This place hasn't been let see to it: say so below, and your sign-in address asks you once." : follows === null ? looked ? "Who you follow couldn't be looked for just now." : "Looking for who you follow." : follows.length === 0 ? "You follow nobody yet. Follow someone from their card in People, or by their key. Who you follow is public." : `You follow ${follows.length === 1 ? "1 person" : `${follows.length} people`}. Select one to see who they are. It is your own Nostr follow list, and it is public.`,
      card: () => {
        if (!chosen || !follows) return null;
        const p = profiles.get(chosen);
        const following = follows.includes(chosen);
        return {
          title: nameOf(chosen),
          tag: following ? "You follow them" : "Not followed",
          proven: false,
          sub: shortNpub2(chosen),
          copy: encodeNpub(chosen),
          text: p?.about ?? "",
          picture: showsPictures() ? p?.picture ?? "" : "",
          color: "",
          // What they have done, as they say: where they stand here, what they show.
          now: opts.about?.lines(chosen) ?? []
        };
      }
    });
    if (!me) return;
    if (!allowed) {
      add({
        id: "following-let",
        icon: "check",
        tone: "primary",
        label: "Show who I follow, and let me change it here",
        act: () => say(f.ask(() => void f.people.load().then(refresh)))
      });
      return;
    }
    if (follows === null) {
      if (!looked) {
        looked = true;
        void f.people.load().then(refresh);
      } else {
        add({
          id: "following-again",
          icon: "turn",
          label: "Look again",
          act: () => {
            looked = false;
            refresh();
          }
        });
      }
      return;
    }
    add({ id: "following-key", icon: "key", label: () => opts.presenting?.() && opts.keyboard?.() ? "Follow someone by their key" : "Follow the key I copied", short: "By key", act: () => void byKey() });
    if (chosen) {
      const them = chosen;
      const following = follows.includes(them);
      add({ id: "following-toggle", icon: "check", on: () => following, label: following ? `Unfollow ${nameOf(them)}` : `Follow ${nameOf(them)}`, act: () => press(them, nameOf(them), !following) });
      add(...opts.more?.({ pubkey: them, name: nameOf(them) }) ?? []);
    }
    const named = follows.filter((k) => profiles.get(k)?.name).sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    const rest = follows.filter((k) => !profiles.get(k)?.name);
    const listed = [...named, ...rest].slice(0, pages * PAGE);
    void profiles.fetch(follows.slice(0, pages * PAGE * 2));
    add(
      ...listed.map((k) => ({
        id: `following-${k.slice(0, 16)}`,
        kind: "swatch",
        color: `#${k.slice(0, 6)}`,
        on: () => chosen === k,
        label: () => nameOf(k),
        act: () => {
          chosen = chosen === k ? null : k;
          refresh();
        }
      }))
    );
    if (follows.length > listed.length) {
      add({
        id: "following-more",
        icon: "list",
        label: `Show more (${listed.length} of ${follows.length})`,
        act: () => {
          pages++;
          refresh();
        }
      });
    }
  };
  let drawing = false;
  const soon2 = () => {
    if (drawing) return;
    drawing = true;
    queueMicrotask(() => {
      drawing = false;
      refresh();
    });
  };
  profiles.onChange(soon2);
  f.people.onChange(soon2);
  opts.about?.onChange(soon2);
  refresh();
  return {
    refresh,
    choose(pubkey) {
      chosen = pubkey;
      void profiles.fetch([pubkey]);
      refresh();
    },
    press,
    profiles
  };
}

// packages/sdk/src/messages.ts
import { DEFAULT_RELAYS as DEFAULT_RELAYS3, isHex64 as isHex642, looksLikeWrap, MESSAGE_RELAYS_KIND, publishEvent, queryRelays as queryRelays3, readMessageRelays, readRelayList, RELAY_LIST_KIND, WRAP_KIND, wrapSeal, writtenWith } from "@nswp/core";
var MOST2 = 300;
var FRESH_MS2 = 45e3;
function createMessages(opts) {
  const { hand } = opts;
  const now = opts.now ?? (() => Date.now());
  const query = opts.query ?? queryRelays3;
  const publish = opts.publish ?? publishEvent;
  const usual = () => opts.relays ?? DEFAULT_RELAYS3;
  const store = (() => {
    if (opts.storage !== void 0) return opts.storage;
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  })();
  const watchers3 = /* @__PURE__ */ new Set();
  const newcomers = /* @__PURE__ */ new Set();
  const changed = () => {
    for (const fn of watchers3) fn();
  };
  let who = null;
  let state = "off";
  let inbox = [];
  let own = { read: [], write: [] };
  let monitors = { open: [], closed: [] };
  const read = /* @__PURE__ */ new Map();
  const tried = /* @__PURE__ */ new Set();
  let looked = 0;
  let looking = null;
  let first = true;
  const seenKey = (me) => `nswp:messages:seen:${me}`;
  let marks = null;
  const seenAt = () => {
    if (marks) return marks;
    marks = {};
    try {
      const kept2 = JSON.parse(who && store?.getItem(seenKey(who)) || "{}");
      if (kept2 && typeof kept2 === "object" && !Array.isArray(kept2)) {
        for (const [k, v] of Object.entries(kept2)) if (isHex642(k) && typeof v === "number") marks[k] = v;
      }
    } catch {
    }
    return marks;
  };
  const reset = (me) => {
    who = me;
    state = me && hand.ready() ? "looking" : "off";
    inbox = [];
    own = { read: [], write: [] };
    read.clear();
    tried.clear();
    marks = null;
    looked = 0;
    first = true;
  };
  const threads = () => {
    const by = /* @__PURE__ */ new Map();
    if (!who) return by;
    for (const m of read.values()) {
      const peer = writtenWith(m, who);
      if (!peer) continue;
      by.set(peer, [...by.get(peer) ?? [], m]);
    }
    for (const list of by.values()) list.sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1));
    return by;
  };
  const unreadIn = (peer, list) => list.filter((m) => m.from === peer && m.at > (seenAt()[peer] ?? 0)).length;
  const knownTo = (peer, list) => !!opts.known?.(peer) || list.some((m) => m.from === who);
  const look = async (me) => {
    const lists = await askWell({ kinds: [RELAY_LIST_KIND, MESSAGE_RELAYS_KIND], authors: [me], limit: 8 }, { own: [], usual: usual(), query, timeoutMs: 3500, now }).catch(() => null);
    if (hand.pubkey() !== me) return;
    const answered = !!lists && Object.values(lists.relays).some((said) => said === "eose");
    const relayList = readRelayList(lists?.events ?? [], me);
    own = { read: relayList?.read ?? [], write: relayList?.write ?? [] };
    const found = readMessageRelays(lists?.events ?? [], me);
    if (found.length) inbox = found;
    if (!inbox.length) {
      if (answered && relayBackup()) monitors = await foundRelays({ query, now }).catch(() => monitors);
      if (hand.pubkey() !== me) return;
      state = answered ? "no-inbox" : "unreachable";
      looked = now();
      return changed();
    }
    const got = await query(inbox, { kinds: [WRAP_KIND], "#p": [me], limit: MOST2 }, 5e3).catch(() => null);
    if (hand.pubkey() !== me) return;
    if (got) learnFrom(got.relays, now());
    const wraps = (got?.events ?? []).filter((e) => !tried.has(e.id) && looksLikeWrap(e, me)).slice(0, MOST2);
    for (const wrap2 of wraps) {
      tried.add(wrap2.id);
      const message = await hand.open(wrap2).catch(() => null);
      if (hand.pubkey() !== me) return;
      if (!message || read.has(message.id)) continue;
      read.set(message.id, message);
      if (!first && message.from !== me) for (const fn of newcomers) fn(message);
    }
    first = false;
    state = got && Object.values(got.relays).some((said) => said === "eose") ? "ready" : read.size ? "ready" : "unreachable";
    looked = now();
    changed();
  };
  const load2 = async (fresh = false) => {
    const me = hand.ready() ? hand.pubkey() : null;
    if (me !== who || !me && state !== "off") {
      reset(me);
      changed();
    }
    if (!me) return;
    if (!fresh && looked && now() - looked < FRESH_MS2) return;
    looking ??= look(me).finally(() => {
      looking = null;
    });
    await looking;
  };
  const offered = () => {
    const first2 = (own.read.length ? own.read : usual()).filter((r) => !monitors.closed.includes(r));
    const rest = monitors.open.filter((r) => !first2.includes(r));
    const out = [...first2, ...rest].slice(0, 3);
    return out.length ? out : (own.read.length ? own.read : usual()).slice(0, 3);
  };
  return {
    state: () => hand.ready() && hand.pubkey() === who && who ? state : "off",
    inbox: () => [...inbox],
    offered,
    load: load2,
    async setUp() {
      const me = hand.pubkey();
      if (!me || !hand.ready()) return { ok: false, said: "Sign in first." };
      const relays = offered();
      const signed = await hand.reach(relays).catch(() => null);
      if (!signed) return { ok: false, said: "It couldn't be signed. Nothing was changed." };
      const sent = await sendWell(signed, { own: own.write, usual: usual(), publish, query, now }).catch(() => null);
      if (!sent || sent.took === 0) return { ok: false, said: "No relay took it. Try again in a moment." };
      inbox = relays;
      state = "ready";
      changed();
      void load2(true);
      return { ok: true, said: `Private messages now reach you at ${relays.map((r) => r.replace(/^wss:\/\//, "")).join(", ")}.` };
    },
    conversations() {
      const out = [];
      for (const [peer, list] of threads()) out.push({ with: peer, last: list[list.length - 1], unread: unreadIn(peer, list), known: knownTo(peer, list) });
      return out.sort((a, b) => b.last.at - a.last.at);
    },
    thread: (peer) => threads().get(peer) ?? [],
    async send(to, text, name = "") {
      const me = hand.pubkey();
      const them = name || "them";
      if (!me || !hand.ready()) return { ok: false, said: "Sign in to write to people." };
      if (!isHex642(to) || to === me) return { ok: false, said: "That isn't someone who can be written to." };
      if (!inbox.length) return { ok: false, said: "Say where your own messages reach you first: without that you couldn't read back what you sent, or be answered." };
      const asked = await askWell({ kinds: [MESSAGE_RELAYS_KIND], authors: [to], limit: 4 }, { own: inbox, usual: usual(), query, timeoutMs: 3500, now }).catch(() => null);
      const theirs = readMessageRelays(asked?.events ?? [], to);
      if (!theirs.length) {
        const answered = !!asked && Object.values(asked.relays).some((said) => said === "eose");
        return { ok: false, said: answered ? `${name || "They"} ${name ? "hasn't" : "haven't"} said where private messages reach them, so one can't be sent. Nothing was sent.` : "No relay could be reached. Nothing was sent." };
      }
      const sealed = await hand.seal(to, text).catch(() => null);
      if (!sealed) return { ok: false, said: "It couldn't be signed. Nothing was sent." };
      const t = now() / 1e3;
      const forThem = wrapSeal(sealed.seals[0], to, { now: t });
      const forMe = wrapSeal(sealed.seals[1], me, { now: t });
      if (!forThem || !forMe) return { ok: false, said: "It couldn't be wrapped. Nothing was sent." };
      const sent = await publish(theirs, forThem).catch(() => null);
      if (sent) learnFrom(sent.relays, now());
      if (!sent || !Object.values(sent.relays).some((said) => said === "ok")) return { ok: false, said: `None of the relays ${them === "them" ? "they use" : `${them} uses`} for messages took it. It wasn't sent.` };
      tried.add(forMe.id);
      void publish(inbox, forMe).then((kept2) => learnFrom(kept2.relays, now())).catch(() => void 0);
      const m = sealed.message;
      read.set(m.id, { id: m.id, from: me, to: [to], text: m.content, at: m.created_at });
      changed();
      return { ok: true, said: "" };
    },
    seen(peer) {
      if (!who) return;
      const newest = (threads().get(peer) ?? []).reduce((at, m) => Math.max(at, m.at), 0);
      if (!newest || (seenAt()[peer] ?? 0) >= newest) return;
      seenAt()[peer] = newest;
      try {
        store?.setItem(seenKey(who), JSON.stringify(seenAt()));
      } catch {
      }
      changed();
    },
    unread() {
      let n = 0;
      for (const [peer, list] of threads()) if (knownTo(peer, list)) n += unreadIn(peer, list);
      return n;
    },
    onChange(fn) {
      watchers3.add(fn);
      return () => void watchers3.delete(fn);
    },
    onNew(fn) {
      newcomers.add(fn);
      return () => void newcomers.delete(fn);
    }
  };
}

// packages/sdk/src/messaging.ts
import { shortNpub as shortNpub3, MESSAGE_LIMITS } from "@nswp/core";
import * as THREE8 from "three";
var W2 = 768;
var H2 = 900;
var LEAD = 130;
var WRITE = 100;
function addMessagingControls(controls, opts) {
  const { hand, profiles } = opts;
  const m = hand.messages;
  let shown2 = [];
  let withWhom = null;
  let requests = false;
  let wasMe = null;
  let fetching = false;
  const nameOf = (pubkey) => profiles.get(pubkey)?.name || shortNpub3(pubkey);
  const say = (text) => controls.say(text);
  const inHeadset = () => !!opts.presenting?.() && !!opts.panels;
  let panel = null;
  const closePanel = () => {
    const was = panel;
    panel = null;
    was?.texture.dispose();
    was?.panel.close();
  };
  const drawPanel = () => {
    if (!panel) return;
    const view = controls.letters.view();
    if (!view.ready) return closePanel();
    const stamp2 = `${view.version}:${Math.floor(Date.now() / 6e4)}:${view.title}`;
    if (stamp2 === panel.drawn) return;
    panel.drawn = stamp2;
    const t = controls.theme;
    const g = panel.canvas.getContext("2d");
    g.fillStyle = t.glass;
    g.fillRect(0, 0, W2, H2);
    g.textBaseline = "middle";
    g.textAlign = "left";
    const measure = (text) => g.measureText(text).width;
    g.fillStyle = t.ink;
    g.globalAlpha = 0.72;
    g.font = "27px system-ui, sans-serif";
    wrapWords(view.lead, measure, W2 - 56, 3).forEach((row, r) => g.fillText(row, 28, 26 + r * 33));
    g.globalAlpha = 1;
    const top = H2 - WRITE;
    g.strokeStyle = t.accent;
    g.lineWidth = 3;
    g.fillStyle = `rgba(${rgb(t.accent)}, 0.16)`;
    g.beginPath();
    g.roundRect(20, top + 8, W2 - 40, WRITE - 24, 22);
    g.fill();
    g.stroke();
    g.font = "600 34px system-ui, sans-serif";
    g.fillStyle = t.ink;
    g.textAlign = "center";
    g.fillText(wrapWords(`Write to ${view.with}`, measure, W2 - 80, 1)[0] ?? "Write", W2 / 2, top + 8 + (WRITE - 24) / 2);
    g.textAlign = "left";
    const ROW = 40;
    const nowSec = Math.floor(Date.now() / 1e3);
    let y = top - 12;
    if (view.said) {
      g.font = "italic 28px system-ui, sans-serif";
      g.fillStyle = t.warn;
      const rows = wrapWords(view.said, measure, W2 - 56, 2);
      y -= rows.length * ROW;
      rows.forEach((row, r) => g.fillText(row, 28, y + ROW * (r + 0.5)));
    }
    if (!view.lines.length) {
      g.font = "italic 30px system-ui, sans-serif";
      g.fillStyle = t.ink;
      g.globalAlpha = 0.7;
      wrapWords(`Nothing yet. What you write here is for ${view.with} alone.`, measure, W2 - 56, 3).forEach((row, r) => g.fillText(row, 28, LEAD + ROW * (r + 0.5)));
      g.globalAlpha = 1;
    }
    for (let i = view.lines.length - 1; i >= 0; i--) {
      const line = view.lines[i];
      g.font = "32px system-ui, sans-serif";
      const rows = line.text.split("\n").flatMap((part) => wrapWords(part, measure, W2 - 56, 6)).slice(0, 8);
      const tall = (rows.length + 1) * ROW + 10;
      if (y - tall < LEAD) break;
      y -= tall;
      g.font = "600 26px system-ui, sans-serif";
      g.fillStyle = line.mine ? t.accent : t.ink;
      g.globalAlpha = line.state === "failed" ? 1 : 0.75;
      if (line.state === "failed") g.fillStyle = t.warn;
      g.fillText(`${line.mine ? "You" : line.who}  \xB7  ${line.state === "sending" ? "Sending\u2026" : line.state === "failed" ? "Not sent" : ago(line.at, nowSec)}`, 28, y + ROW * 0.5);
      g.font = "32px system-ui, sans-serif";
      g.fillStyle = t.ink;
      g.globalAlpha = line.state === "sending" ? 0.6 : 1;
      rows.forEach((row, r) => g.fillText(row, 28, y + ROW * (r + 1.5)));
      g.globalAlpha = 1;
    }
    panel.texture.needsUpdate = true;
    controls.letters.seen();
  };
  const openPanel = () => {
    if (!opts.panels || panel) return;
    const canvas = document.createElement("canvas");
    canvas.width = W2;
    canvas.height = H2;
    const texture = new THREE8.CanvasTexture(canvas);
    texture.colorSpace = THREE8.SRGBColorSpace;
    try {
      const made = opts.panels.open(
        {
          kind: "custom",
          title: controls.letters.view().title,
          texture,
          aspect: W2 / H2,
          onPress: (_x, y) => {
            if (y < (H2 - WRITE) / H2 || !opts.panels) return;
            const view = controls.letters.view();
            void opts.panels.keyboard.ask({ title: `Write to ${view.with}. Only they can read it. Done sends it.`, maxLength: MESSAGE_LIMITS.chars, multiline: true }).then((text) => {
              const trouble = text ? controls.letters.send(text) : null;
              if (trouble) say(trouble);
            });
          },
          onClose: () => {
            if (panel?.texture === texture) panel = null;
            texture.dispose();
          }
        },
        { id: "private-messages", keep: false, place: { width: 0.46 }, pin: [-0.46, -0.04, -0.8] }
      );
      panel = { panel: made, canvas, texture, drawn: "" };
      drawPanel();
    } catch (err) {
      texture.dispose();
      say(err instanceof Error ? err.message.replace(/^nswp-sdk: /, "") : "The conversation couldn't be opened.");
    }
  };
  controls.subscribe(drawPanel);
  const open = (pubkey) => {
    withWhom = pubkey;
    void profiles.fetch([pubkey]);
    controls.letters.attach({
      with: () => nameOf(pubkey),
      lines: () => m.thread(pubkey).map((x) => ({ key: x.id, mine: x.from !== pubkey, who: nameOf(x.from), text: x.text, at: x.at })),
      send: (text) => m.send(pubkey, text, profiles.get(pubkey)?.name ?? ""),
      seen: () => m.seen(pubkey)
    });
    if (inHeadset()) {
      closePanel();
      openPanel();
    } else controls.signal("open:letters");
    refresh();
  };
  const write = (pubkey) => {
    const me = hand.pubkey();
    if (!me) return say("Sign in to write to people: it is under You.");
    if (pubkey === me) return;
    const go = () => void m.load().then(() => open(pubkey));
    if (hand.allowed()) return go();
    say(hand.ask(go));
  };
  const refresh = () => {
    for (const id of shown2) controls.remove(id);
    shown2 = [];
    const me = hand.pubkey();
    if (me !== wasMe) {
      wasMe = me;
      withWhom = null;
      requests = false;
      controls.letters.detach();
      closePanel();
    }
    const allowed = !!me && hand.allowed();
    if (allowed && m.state() === "off" && !fetching) {
      fetching = true;
      void m.load().finally(() => {
        fetching = false;
      });
    }
    const state = allowed ? m.state() === "off" ? "looking" : m.state() : "off";
    const all = allowed ? m.conversations() : [];
    const known = all.filter((c) => c.known);
    const asking = all.filter((c) => !c.known);
    const add = (...actions) => {
      for (const a of actions) shown2.push(a.id);
      controls.add(...actions.map((a) => ({ section: "messages", ...a })));
    };
    controls.addSection({
      id: "messages",
      label: "Messages",
      icon: "chat",
      note: () => !me ? "Sign in to read and send private messages." : !allowed ? "Private messages are between you and one other person. This place hasn't been let send or read yours: say so below, and your sign-in address asks you once." : state === "looking" ? "Looking for your messages." : state === "unreachable" ? "No relay could be reached to look for your messages." : state === "no-inbox" ? "Nobody can write to you privately yet: you haven't said where messages should reach you. Say so below. It is a short public list of relays, and you can change it in any Nostr app." : known.length === 0 && asking.length === 0 ? "No messages yet. Write to someone from Following, or from their card in People." : "Only you and the other person can read a conversation. A relay is told who each message is for, and nothing more."
    });
    if (!me) return;
    if (!allowed) {
      add({ id: "messages-let", icon: "check", tone: "primary", label: "Let me send and read private messages here", act: () => say(hand.ask(() => void m.load().then(refresh))) });
      return;
    }
    if (state === "no-inbox") {
      const hosts = m.offered().map((r) => r.replace(/^wss:\/\//, ""));
      add({
        id: "messages-setup",
        icon: "check",
        tone: "primary",
        label: `Have messages reach me at ${hosts.join(", ")}`,
        act: async () => {
          const done = await m.setUp();
          say(done.said);
          refresh();
        }
      });
      return;
    }
    add({ id: "messages-look", icon: "turn", label: "Look for new messages", short: "Look", act: () => void m.load(true).then(refresh) });
    const row = (c) => ({
      // A row each, in order: the people they would expect, then, under their own heading, anyone else.
      id: `messages-${c.with.slice(0, 16)}`,
      icon: "chat",
      on: () => withWhom === c.with,
      label: () => `${nameOf(c.with)}${c.unread ? `, ${c.unread} new` : ""}`,
      act: () => open(c.with)
    });
    add(...known.slice(0, 40).map(row));
    if (asking.length) {
      add({
        id: "messages-requests",
        icon: "list",
        on: () => requests,
        label: `From people you don't follow: ${asking.length}`,
        act: () => {
          requests = !requests;
          refresh();
        }
      });
      if (requests) add(...asking.slice(0, 40).map(row));
    }
    void profiles.fetch(all.slice(0, 60).map((c) => c.with));
  };
  let drawing = false;
  const soon2 = () => {
    if (drawing) return;
    drawing = true;
    queueMicrotask(() => {
      drawing = false;
      refresh();
      controls.letters.touch();
    });
  };
  m.onChange(soon2);
  profiles.onChange(soon2);
  m.onNew((message) => {
    const from = message.from;
    if (from === withWhom) return;
    if (m.conversations().find((c) => c.with === from)?.known) {
      say(`${nameOf(from)} wrote to you privately. It is in Messages.`);
      controls.signal("message");
    }
  });
  const every = opts.everyMs ?? 6e4;
  if (every > 0 && typeof setInterval === "function") {
    setInterval(() => {
      if (hand.pubkey() && hand.allowed() && (typeof document === "undefined" || document.visibilityState === "visible")) void m.load();
    }, every);
  }
  if (hand.pubkey() && hand.allowed()) void m.load();
  refresh();
  return { refresh, write };
}

// packages/sdk/src/ui/identity.ts
import { encodeNpub as encodeNpub2, getPublicKey, shortNpub as shortNpub4, signerAt as signerAt2 } from "@nswp/core";

// packages/sdk/src/people.ts
import { DEFAULT_RELAYS as DEFAULT_RELAYS4, FOLLOWS_KIND, followsIn, isFollowAsked, isHex64 as isHex643, newestFollows, publishEvent as publishEvent2, queryRelays as queryRelays4, readRelayList as readRelayList2, RELAY_LIST_KIND as RELAY_LIST_KIND2, verifyEvent as verifyEvent3 } from "@nswp/core";
var KEPT_MOST = 4e5;
var FRESH_MS3 = 6e4;
function createPeople(opts) {
  const { hand } = opts;
  const now = opts.now ?? (() => Date.now());
  const query = opts.query ?? queryRelays4;
  const publish = opts.publish ?? publishEvent2;
  const usual = () => opts.relays ?? DEFAULT_RELAYS4;
  const store = (() => {
    if (opts.storage !== void 0) return opts.storage;
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  })();
  const watchers3 = /* @__PURE__ */ new Set();
  const changed = () => {
    for (const fn of watchers3) fn();
  };
  const keyFor = (who) => `nswp:follows:${who}`;
  const readKept = (who) => {
    try {
      const kept2 = JSON.parse(store?.getItem(keyFor(who)) ?? "null");
      return verifyEvent3(kept2) && kept2.kind === FOLLOWS_KIND && kept2.pubkey === who ? kept2 : null;
    } catch {
      return null;
    }
  };
  const keep3 = (list) => {
    try {
      const text = JSON.stringify(list);
      if (text.length <= KEPT_MOST) store?.setItem(keyFor(list.pubkey), text);
      else store?.removeItem(keyFor(list.pubkey));
    } catch {
    }
  };
  let relaysKept = null;
  const ownRelays = (key) => {
    if (relaysKept && relaysKept.key === key && now() - relaysKept.at < 6e5) return relaysKept.found;
    const found = askWell({ kinds: [RELAY_LIST_KIND2], authors: [key], limit: 4 }, { own: [], usual: usual(), query, timeoutMs: 2500, now }).then((got) => readRelayList2(got.events, key)?.write ?? []).catch(() => []);
    relaysKept = { key, at: now(), found };
    return found;
  };
  let known = null;
  let looking = null;
  let offered = null;
  const look = async (who) => {
    const kept2 = readKept(who);
    const own = await ownRelays(who);
    const got = await askWell({ kinds: [FOLLOWS_KIND], authors: [who], limit: 4 }, { own, usual: usual(), query, timeoutMs: 4e3, now }).catch(() => null);
    const answered = !!got && Object.values(got.relays).some((said) => said === "eose");
    const found = newestFollows((got?.events ?? []).filter((e) => verifyEvent3(e)), who);
    const list = found && kept2 ? kept2.created_at > found.created_at ? kept2 : found : found ?? kept2;
    if (kept2 && list === kept2 && answered && (!found || found.id !== kept2.id)) void sendWell(kept2, { own, usual: usual(), publish, query, now }).catch(() => null);
    if (list && list !== kept2) keep3(list);
    if (hand.pubkey() !== who) return;
    known = { who, list, answered, at: now() };
    changed();
  };
  const load2 = async (fresh = false) => {
    const who = hand.pubkey();
    if (!who) {
      if (known) {
        known = null;
        changed();
      }
      return null;
    }
    if (known && known.who !== who) known = null;
    if (!fresh && known && now() - known.at < FRESH_MS3) return followsIn(known.list);
    looking ??= look(who).finally(() => {
      looking = null;
    });
    await looking;
    return known && known.who === who ? followsIn(known.list) : null;
  };
  const change2 = async (pubkey, adding, name) => {
    const who = hand.pubkey();
    const them = name || "them";
    if (!who) return { ok: false, why: "signed-out", said: "Sign in to follow people." };
    if (!isHex643(pubkey) || pubkey === who) return { ok: false, why: "refused", said: "That isn't someone who can be followed." };
    if (!hand.ready()) return { ok: false, why: "not-allowed", said: "This place hasn't been let change who you follow." };
    await load2(true);
    const at = known && known.who === who ? known : null;
    if (!at) return { ok: false, why: "unreachable", said: "Your follow list couldn't be looked for. Nothing was changed." };
    const list = at.list;
    if (!list) {
      if (!at.answered) return { ok: false, why: "unreachable", said: "No relay could be reached to find who you follow, so nothing was changed. Try again in a moment." };
      if (!adding) return { ok: false, why: "already", said: `You don't follow ${them}.` };
      if (!offered || offered.who !== pubkey || now() - offered.at > 12e4) {
        offered = { who: pubkey, at: now() };
        return { ok: false, why: "no-list", said: `No follow list of yours was found. If you follow nobody yet, press again to start one with ${them}.` };
      }
    }
    offered = null;
    const follows = followsIn(list).includes(pubkey);
    if (adding === follows) return { ok: true, why: "already", said: adding ? `You already follow ${them}.` : `You don't follow ${them}.` };
    const asked = adding ? { add: pubkey } : { remove: pubkey };
    const signed = await hand.change(list, asked).catch(() => null);
    if (!signed || !isFollowAsked(signed, { list, ...asked, pubkey: who })) return { ok: false, why: "refused", said: "It couldn't be signed. Who you follow is as it was." };
    keep3(signed);
    known = { who, list: signed, answered: true, at: now() };
    changed();
    const sent = await sendWell(signed, { own: await ownRelays(who), usual: usual(), publish, query, now }).catch(() => null);
    if (!sent || sent.took === 0) return { ok: false, why: "not-sent", said: `Signed, but no relay took it. It is kept on this device and will be sent again.` };
    return { ok: true, said: adding ? `You follow ${them}. Anyone can see who you follow.` : `You no longer follow ${them}.` };
  };
  return {
    follows: () => known && known.who === hand.pubkey() ? followsIn(known.list) : null,
    isFollowing(pubkey) {
      return known && known.who === hand.pubkey() && (known.list || known.answered) ? followsIn(known.list).includes(pubkey) : null;
    },
    load: load2,
    follow: (pubkey, name = "") => change2(pubkey, true, name),
    unfollow: (pubkey, name = "") => change2(pubkey, false, name),
    onChange(fn) {
      watchers3.add(fn);
      return () => void watchers3.delete(fn);
    }
  };
}

// packages/sdk/src/saves.ts
import { cleanSlot, DEFAULT_RELAYS as DEFAULT_RELAYS5, fitsInSave, publishEvent as publishEvent3, queryRelays as queryRelays5, readRelayList as readRelayList3, RELAY_LIST_KIND as RELAY_LIST_KIND3, SAVE_KIND, SAVE_SLOT, verifyEvent as verifyEvent4 } from "@nswp/core";
function createSaves(opts = {}) {
  const now = opts.now ?? (() => Date.now());
  const query = opts.query ?? queryRelays5;
  const publish = opts.publish ?? publishEvent3;
  const usual = () => opts.relays ?? DEFAULT_RELAYS5;
  const signer = () => (typeof opts.signer === "function" ? opts.signer() : opts.signer) ?? null;
  const store = (() => {
    if (opts.storage !== void 0) return opts.storage;
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  })();
  const keyFor = (who, slot) => `nswp:save:${who ?? "guest"}:${slot}`;
  const readLocal = (who, slot) => {
    try {
      const kept2 = JSON.parse(store?.getItem(keyFor(who, slot)) ?? "null");
      return kept2 && typeof kept2.data === "string" && typeof kept2.at === "number" ? { data: kept2.data, at: kept2.at } : null;
    } catch {
      return null;
    }
  };
  const writeLocal = (who, slot, kept2) => {
    try {
      if (!store) return false;
      store.setItem(keyFor(who, slot), JSON.stringify(kept2));
      return true;
    } catch {
      return false;
    }
  };
  let relaysKept = null;
  const ownRelays = (key) => {
    if (relaysKept && relaysKept.key === key && now() - relaysKept.at < 6e5) return relaysKept.found;
    const found = askWell({ kinds: [RELAY_LIST_KIND3], authors: [key], limit: 4 }, { own: [], usual: usual(), query, timeoutMs: 2500, now }).then((got) => readRelayList3(got.events, key)?.write ?? []).catch(() => []);
    relaysKept = { key, at: now(), found };
    return found;
  };
  const fromAccount = async (slot) => {
    const s = signer();
    const who = s?.state === "unlocked" ? s.pubkey : null;
    if (!s || !who) return null;
    const d = await s.find(slot);
    if (!d) return null;
    const got = await askWell({ kinds: [SAVE_KIND], authors: [who], "#d": [d], limit: 4 }, { own: await ownRelays(who), usual: usual(), query, timeoutMs: 3500, now }).catch(() => null);
    const newest = (got?.events ?? []).filter((e) => e.kind === SAVE_KIND && e.pubkey === who && e.tags.some((t) => t[0] === "d" && t[1] === d) && verifyEvent4(e)).sort((a, b) => b.created_at - a.created_at)[0];
    if (!newest) return null;
    const opened = await s.open(newest);
    return opened && opened.slot === slot ? { data: opened.data, at: opened.at } : null;
  };
  const load2 = async (slotIn) => {
    const slot = cleanSlot(slotIn ?? SAVE_SLOT);
    if (!slot) return null;
    const s = signer();
    const who = s?.state === "unlocked" ? s.pubkey : null;
    const here = [readLocal(who, slot), who ? readLocal(null, slot) : null].filter((x) => !!x).sort((a, b) => b.at - a.at)[0] ?? null;
    const there = who ? await fromAccount(slot).catch(() => null) : null;
    const newest = there && (!here || there.at >= here.at) ? { ...there, from: "account" } : here ? { ...here, from: "device" } : null;
    if (newest?.from === "account") writeLocal(who, slot, { data: newest.data, at: newest.at });
    if (who && newest?.from === "device" && !taking.has(slot)) {
      taking.add(slot);
      void toAccount(newest.data, slot, who).catch(() => false).then(() => taking.delete(slot));
    }
    return newest && newest.data !== "" ? newest : null;
  };
  const taking = /* @__PURE__ */ new Set();
  const toAccount = async (data, slot, who) => {
    const s = signer();
    if (!s || s.state !== "unlocked" || s.pubkey !== who) return false;
    const signed = await s.save(slot, data).catch(() => null);
    if (!signed) return false;
    writeLocal(who, slot, { data, at: signed.created_at });
    const sent = await sendWell(signed, { own: await ownRelays(who), usual: usual(), publish, query, now }).catch(() => null);
    return !!sent && sent.took > 0;
  };
  const save = async (data, slotIn) => {
    const slot = cleanSlot(slotIn ?? SAVE_SLOT);
    if (!slot || !fitsInSave(data)) return { kept: "nowhere", said: "That is too much to save, or not a slot's name." };
    const s = signer();
    const who = s?.state === "unlocked" ? s.pubkey : null;
    const at = Math.floor(now() / 1e3);
    const here = writeLocal(who, slot, { data, at });
    if (!s || !who) return here ? { kept: "device", said: "Saved on this device. Sign in to keep it with your account." } : { kept: "nowhere", said: "This browser wouldn't keep it." };
    if (await toAccount(data, slot, who).catch(() => false)) return { kept: "account", said: "Saved to your account." };
    return here ? { kept: "device", said: "Saved on this device. It didn't reach your account this time." } : { kept: "nowhere", said: "That wasn't saved." };
  };
  return { load: load2, save, clear: (slot) => save("", slot) };
}

// packages/sdk/src/signer.ts
import { isAchievementAsked, cleanMessage, cleanMore, cleanOrigin, cleanSlot as cleanSlot2, fitsInSave as fitsInSave2, isFollowAsked as isFollowAsked2, isHex64 as isHex644, isReachAsked, isScoreAsked, isSealAsked, looksLikeWrap as looksLikeWrap2, isWhatWasAsked, looksLikeSave, readSignerReply, signerAddresses, signerAt, signerMessage, toLocal, verifyEvent as verifyEvent5, verifyRoomPass, WORLD_TAG } from "@nswp/core";
var NONE = {
  state: "none",
  pubkey: null,
  name: null,
  picture: null,
  about: null,
  remembered: null,
  host: null,
  more: [],
  offers: null,
  unanswered: false,
  asking: false,
  retry: () => false,
  copy: null,
  unlock: () => false,
  lock() {
  },
  sign: async () => null,
  pass: async () => null,
  save: async () => null,
  find: async () => null,
  open: async () => null,
  want: () => false,
  follow: async () => null,
  seal: async () => null,
  unwrap: async () => null,
  reach: async () => null,
  score: async () => null,
  achieve: async () => null,
  onChange: () => () => {
  },
  whenAnswered: async () => {
  },
  dispose() {
  }
};
function namedAddresses(at) {
  try {
    const signer = new URL(at.signer);
    const win = new URL(at.window);
    if (signer.protocol !== "https:" || win.origin !== signer.origin) return null;
    return { origin: signer.origin, signer: signer.href, window: win.href };
  } catch {
    return null;
  }
}
function createWorldSigner(opts) {
  const real = opts.at ? namedAddresses(opts.at) : signerAt(opts.under) ?? signerAddresses(opts.airlock);
  if (!real || typeof document === "undefined") return NONE;
  const test = new URLSearchParams(opts.search ?? location.search).get("signer") === "test";
  const watchers3 = /* @__PURE__ */ new Set();
  const pending = /* @__PURE__ */ new Map();
  const kept2 = /* @__PURE__ */ new Map();
  const askAbout = (request, read) => new Promise((done) => {
    const timer = setTimeout(() => {
      kept2.delete(request.id);
      done(null);
    }, 8e3);
    kept2.set(request.id, { answer: (reply) => done(reply ? read(reply) : null), timer });
    tell(request);
  });
  let state = "none";
  let pubkey = null;
  let name = null;
  let picture = null;
  let about = null;
  let remembered = null;
  let more = [];
  let offers = null;
  let origin = "";
  let windowAt = "";
  let frame = null;
  let disposed = false;
  const named = !!opts.at || !!signerAt(opts.under);
  let waited = false;
  let asking = false;
  let again = 0;
  let waiting;
  let signerUrl = "";
  const reload = () => {
    if (frame && signerUrl) frame.src = signerUrl;
  };
  const wait = () => {
    waited = false;
    clearTimeout(waiting);
    waiting = setTimeout(() => {
      if (state !== "none" || disposed) return;
      if (again === 0) {
        again = 1;
        reload();
        return wait();
      }
      waited = true;
      asking = false;
      changed();
    }, 1e4);
  };
  wait();
  let answered = false;
  const firstAnswer = /* @__PURE__ */ new Set();
  let n = 0;
  const changed = () => {
    for (const fn of watchers3) fn();
  };
  const tell = (message) => frame?.contentWindow?.postMessage(signerMessage(message), origin);
  const onMessage = (e) => {
    if (!frame || e.source !== frame.contentWindow || e.origin !== origin) return;
    const reply = readSignerReply(e.data);
    if (!reply) return;
    if (reply.t === "ready") {
      asking = false;
      if (state === "none") state = "locked";
      tell({ t: "state", id: `s${++n}` });
      return changed();
    }
    if (reply.t === "state") {
      answered = true;
      asking = false;
      state = reply.unlocked ? "unlocked" : "locked";
      pubkey = reply.unlocked ? reply.pubkey ?? null : null;
      name = reply.unlocked ? reply.name ?? null : null;
      picture = reply.unlocked ? reply.picture ?? null : null;
      about = reply.unlocked ? reply.about ?? null : null;
      remembered = reply.unlocked ? reply.remembered ?? null : null;
      more = reply.unlocked ? cleanMore(reply.more) : [];
      if (reply.offers) offers = reply.offers;
      for (const go of [...firstAnswer]) go();
      return changed();
    }
    const question = kept2.get(reply.id);
    if (question) {
      kept2.delete(reply.id);
      clearTimeout(question.timer);
      return question.answer(reply.t === "refused" ? null : reply);
    }
    const waiting2 = pending.get(reply.id);
    if (!waiting2) return;
    pending.delete(reply.id);
    clearTimeout(waiting2.timer);
    if (reply.t !== "signed") return waiting2.done(null);
    const signed = reply.event;
    if (waiting2.session) {
      const checked = verifyRoomPass(signed, { origin: location.origin, session: waiting2.session });
      return waiting2.done(checked.ok && checked.value.pubkey === pubkey ? signed : null);
    }
    if (!waiting2.asked) return waiting2.done(null);
    const marked = Array.isArray(signed?.tags) && signed.tags.some((t) => t[0] === WORLD_TAG && t[1] === cleanOrigin(location.origin));
    waiting2.done(verifyEvent5(signed) && signed.pubkey === pubkey && marked && isWhatWasAsked(waiting2.asked, signed) ? signed : null);
  };
  void (async () => {
    try {
      const there = opts.at ? async (address) => address : toLocal;
      signerUrl = await there(real.signer);
      windowAt = await there(real.window);
      origin = new URL(signerUrl).origin;
      if (disposed) return;
      frame = document.createElement("iframe");
      frame.title = "Signer";
      frame.setAttribute("aria-hidden", "true");
      frame.tabIndex = -1;
      frame.setAttribute("allow", "");
      frame.referrerPolicy = "no-referrer";
      frame.style.cssText = "position:fixed;left:-10px;top:-10px;width:1px;height:1px;border:0;visibility:hidden;pointer-events:none";
      addEventListener("message", onMessage);
      frame.addEventListener("load", () => {
        for (const after2 of [0, 400, 1200, 3e3]) {
          setTimeout(() => {
            if (!answered && !disposed) tell({ t: "state", id: `s${++n}` });
          }, after2);
        }
      });
      frame.src = signerUrl;
      document.body.append(frame);
    } catch {
    }
  })();
  return {
    get state() {
      return state;
    },
    get pubkey() {
      return pubkey;
    },
    get name() {
      return name;
    },
    get picture() {
      return picture;
    },
    get about() {
      return about;
    },
    get remembered() {
      return remembered;
    },
    get more() {
      return more;
    },
    get offers() {
      return offers;
    },
    get unanswered() {
      return named && waited && state === "none" && !disposed;
    },
    get asking() {
      return asking && state === "none" && !disposed;
    },
    retry() {
      if (!named || state !== "none" || disposed || !frame) return false;
      again++;
      asking = true;
      reload();
      wait();
      changed();
      return true;
    },
    get copy() {
      return origin && origin !== real.origin ? origin : null;
    },
    // The signer's real address, never a development server's copy of it: it is what the visitor should recognise.
    get host() {
      try {
        return new URL(real.origin).host;
      } catch {
        return null;
      }
    },
    unlock() {
      if (state === "none" || !windowAt) return false;
      try {
        const opened = window.open(`${windowAt}${test ? "?signer=test" : ""}`, "nswp-connect", "popup,width=460,height=660");
        return !!opened;
      } catch {
        return false;
      }
    },
    lock() {
      if (state === "unlocked") tell({ t: "lock", id: `l${++n}` });
    },
    sign(note) {
      if (state !== "unlocked" || !frame) return Promise.resolve(null);
      const asked = { kind: note.kind, content: note.content, tags: note.tags ?? [] };
      const id = `q${++n}`;
      return new Promise((done) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          done(null);
        }, 8e3);
        pending.set(id, { asked, done, timer });
        tell({ t: "sign", id, event: asked });
      });
    },
    pass(session) {
      if (state !== "unlocked" || !frame) return Promise.resolve(null);
      const id = `p${++n}`;
      return new Promise((done) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          done(null);
        }, 8e3);
        pending.set(id, { session, done, timer });
        tell({ t: "pass", id, session });
      });
    },
    save(slot, data) {
      if (state !== "unlocked" || !frame || !cleanSlot2(slot) || !fitsInSave2(data)) return Promise.resolve(null);
      return askAbout({ t: "save", id: `s${++n}`, slot, data }, (reply) => reply.t === "signed" && verifyEvent5(reply.event) && looksLikeSave(reply.event, pubkey) ? reply.event : null);
    },
    find(slot) {
      if (state !== "unlocked" || !frame || !cleanSlot2(slot)) return Promise.resolve(null);
      return askAbout({ t: "find", id: `f${++n}`, slot }, (reply) => reply.t === "found" ? reply.d : null);
    },
    open(event) {
      if (state !== "unlocked" || !frame || !verifyEvent5(event) || !looksLikeSave(event, pubkey)) return Promise.resolve(null);
      return askAbout({ t: "open", id: `o${++n}`, event }, (reply) => reply.t === "opened" ? { slot: reply.slot, data: reply.data, at: reply.at } : null);
    },
    want(asked) {
      const wanted = cleanMore([...asked]).filter((name2) => !offers || offers.includes(name2));
      if (state === "none" || !frame || wanted.length === 0) return false;
      tell({ t: "want", id: `w${++n}`, more: wanted });
      return true;
    },
    follow(list, change2) {
      const add = "add" in change2 ? change2.add : void 0;
      const remove = "remove" in change2 ? change2.remove : void 0;
      if (state !== "unlocked" || !frame || !more.includes("follows") || !isHex644(add ?? remove)) return Promise.resolve(null);
      return askAbout({ t: "follow", id: `w${++n}`, list, ...add ? { add } : { remove } }, (reply) => reply.t === "signed" && isFollowAsked2(reply.event, { list, ...add ? { add } : { remove }, pubkey }) ? reply.event : null);
    },
    seal(to, text) {
      const words = cleanMessage(text);
      if (state !== "unlocked" || !frame || !more.includes("messages") || !isHex644(to) || !words) return Promise.resolve(null);
      return askAbout({ t: "seal", id: `m${++n}`, to, text: words }, (reply) => reply.t === "sealed" && isSealAsked(reply, { pubkey, to, text: words }) ? { message: reply.message, seals: reply.seals } : null);
    },
    unwrap(wrap2) {
      if (state !== "unlocked" || !frame || !more.includes("messages") || !looksLikeWrap2(wrap2, pubkey ?? "")) return Promise.resolve(null);
      return askAbout({ t: "unwrap", id: `m${++n}`, event: wrap2 }, (reply) => reply.t === "message" && (reply.message.from === pubkey || reply.message.to.includes(pubkey ?? "")) ? reply.message : null);
    },
    reach(relays) {
      if (state !== "unlocked" || !frame || !more.includes("messages")) return Promise.resolve(null);
      return askAbout({ t: "reach", id: `m${++n}`, relays: [...relays] }, (reply) => reply.t === "signed" && isReachAsked(reply.event, { pubkey, relays }) ? reply.event : null);
    },
    score(world, board, score, said = {}) {
      if (state !== "unlocked" || !frame) return Promise.resolve(null);
      const more2 = { ...said.title ? { title: said.title } : {}, ...said.format === "time" ? { format: "time" } : {} };
      return askAbout({ t: "score", id: `c${++n}`, world, board, score, ...more2 }, (reply) => reply.t === "signed" && isScoreAsked(reply.event, { pubkey, world, board, score, ...more2, origin: location.origin }) ? reply.event : null);
    },
    achieve(world, achievement, title) {
      if (state !== "unlocked" || !frame) return Promise.resolve(null);
      return askAbout({ t: "achieve", id: `a${++n}`, world, achievement, title }, (reply) => reply.t === "signed" && isAchievementAsked(reply.event, { pubkey, world, id: achievement, title, origin: location.origin }) ? reply.event : null);
    },
    onChange(fn) {
      watchers3.add(fn);
      return () => void watchers3.delete(fn);
    },
    whenAnswered(ms) {
      if (answered || disposed) return Promise.resolve();
      return new Promise((done) => {
        const go = () => {
          clearTimeout(timer);
          firstAnswer.delete(go);
          done();
        };
        const timer = setTimeout(go, ms);
        firstAnswer.add(go);
      });
    },
    dispose() {
      disposed = true;
      for (const go of [...firstAnswer]) go();
      clearTimeout(waiting);
      removeEventListener("message", onMessage);
      frame?.remove();
      frame = null;
      for (const w of pending.values()) {
        clearTimeout(w.timer);
        w.done(null);
      }
      pending.clear();
      for (const k of kept2.values()) {
        clearTimeout(k.timer);
        k.answer(null);
      }
      kept2.clear();
      state = "none";
    }
  };
}

// packages/sdk/src/ui/identity.ts
function signerNamed() {
  if (!signerAt2(arrival.signer())) return false;
  try {
    const airlock = portal.airlockFor();
    if (airlock && new URL(airlock).origin === location.origin) return false;
  } catch {
  }
  return true;
}
function hereAs() {
  const who = arrival.identity();
  if (!who || !signerNamed()) return who;
  const signer = worldSigner();
  return signer.state === "unlocked" && signer.pubkey === who.pubkey ? who : void 0;
}
var hereWatchers = /* @__PURE__ */ new Set();
function onHereAs(fn) {
  hereWatchers.add(fn);
  return () => void hereWatchers.delete(fn);
}
var seeking = null;
var seekAfter = 0;
function seekPass() {
  if (seeking) return seeking;
  if (!signerNamed()) return Promise.resolve();
  const signer = worldSigner();
  const key = signer.state === "unlocked" ? signer.pubkey : null;
  if (!key || arrival.identity()?.pubkey === key || Date.now() < seekAfter) return Promise.resolve();
  seekAfter = Date.now() + 6e4;
  const secret = crypto.getRandomValues(new Uint8Array(32));
  const sessionKey = [...secret].map((b) => b.toString(16).padStart(2, "0")).join("");
  seeking = signer.pass(getPublicKey(secret)).then((pass) => {
    if (pass && signer.state === "unlocked" && signer.pubkey === key && arrival.keepIdentity(pass, sessionKey)) {
      for (const fn of [...hereWatchers]) fn();
    } else if (!pass) seekAfter = Infinity;
  }).catch(() => {
  }).finally(() => {
    seeking = null;
  });
  return seeking;
}
var soon = (ms) => new Promise((done) => setTimeout(done, ms));
async function byName(identity) {
  if (!signerNamed()) return identity;
  const signer = worldSigner();
  await signer.whenAnswered(2500);
  if (signer.state !== "unlocked" || !signer.pubkey) return void 0;
  if (identity && signer.pubkey === identity.pass.pubkey) return identity;
  await Promise.race([seekPass(), soon(3e3)]);
  const who = arrival.identity();
  return who && who.pubkey === signer.pubkey ? { pass: who.pass, sessionKey: who.sessionKey } : void 0;
}
function identityWords() {
  const who = hereAs();
  const name = who ? who.name || shortNpub4(who.pubkey) : "";
  return who ? { signedIn: true, name, label: `Here as ${name}. Switch profile, or go as a guest`, short: "You" } : { signedIn: false, name: "", label: "You are a guest here. Sign in", short: "Sign in" };
}
function youCard() {
  const who = hereAs();
  const signer = signerNamed() ? worldSigner() : null;
  if (who) {
    const npub = encodeNpub2(who.pubkey);
    return { title: who.name || shortNpub4(who.pubkey), tag: "Signed in", proven: true, sub: shortNpub4(who.pubkey), copy: npub, text: who.about ?? "", picture: who.picture ?? "", color: "", now: [] };
  }
  if (signer?.state === "unlocked" && signer.pubkey) {
    return { title: signer.name ?? shortNpub4(signer.pubkey), tag: "Signed in to post", proven: false, sub: shortNpub4(signer.pubkey), copy: encodeNpub2(signer.pubkey), text: signer.about ?? "", picture: signer.picture ?? "", color: "", now: [] };
  }
  return null;
}
function identityHost() {
  const airlock = portal.airlockFor();
  try {
    return airlock ? new URL(airlock).host : null;
  } catch {
    return null;
  }
}
var identitySection = () => ({
  id: "you",
  label: "You",
  icon: "you",
  card: youCard,
  note: () => {
    const host = identityHost();
    if (!host) return "";
    if (!signerNamed()) return `Who you are and how you look are kept by ${host}, the place you set out from, and are the same in every world. Changing either takes you there and brings you back here.`;
    const at = worldSigner().host ?? "your sign-in address";
    const look = `How you look is kept by ${host}, the place you set out from: changing it takes you there and brings you back.`;
    const visit = worldSigner().remembered === false ? ` It lasts for this visit: next time, ${at} asks again. Whether it remembers this world is yours to choose in its window.` : "";
    if (worldSigner().state === "unlocked") return `You are signed in here by ${at}.${visit} Signing out here makes you a guest in this world, and nowhere else. ${look}`;
    return `Signing in is done at ${at}, in a window of its own: nothing is typed in this world. Until you sign in here, everyone sees a guest. ${look}`;
  }
});
var going = false;
var leave = async (controls, what, leaving) => {
  if (going) return;
  going = true;
  const host = identityHost() ?? "your own client";
  controls.say(what === "look" ? `Taking you to ${host} to change how you look.` : `Taking you to ${host} to say who you are.`);
  try {
    if (await portal.ask(what, await leaving({ title: what === "look" ? "Your look" : "Who you are", address: host }))) return;
  } catch {
  }
  going = false;
};
function identityAction(controls, leaving = () => ({})) {
  return {
    id: "identity",
    section: "you",
    icon: "you",
    label: () => identityWords().label,
    short: () => identityWords().short,
    // Where a signer was named there is one sign-in, and it is that one (signerAction): this row would be a second.
    hidden: () => portal.airlockFor() === null || signerNamed(),
    act: () => leave(controls, "identity", leaving)
  };
}
function unansweredWords(signer) {
  const host = signer.host ?? "your signer";
  const copy = signer.copy ? ` On this development server its copy is at ${signer.copy}: open that address once in a tab, so your browser accepts its certificate, then reload this page.` : " Press this again to ask once more, or reload the page.";
  return `This world asked ${host} for your sign-in and got no answer. It may be unreachable from here, or your browser may have kept it out.${copy} Nothing is wrong with your sign-in.`;
}
var shared = null;
function worldSigner() {
  if (shared) return shared;
  const signer = shared = createWorldSigner({ under: arrival.signer(), airlock: portal.airlockFor() });
  signer.onChange(() => {
    if (signer.state !== "unlocked") seekAfter = 0;
    void seekPass();
  });
  if (typeof document !== "undefined" && signerNamed()) setInterval(() => void seekPass(), 6e4);
  return signer;
}
var kept = null;
function worldSaves() {
  return kept ??= createSaves({ signer: () => signerNamed() ? worldSigner() : null });
}
var followed = null;
function worldPeople() {
  const signer = () => signerNamed() ? worldSigner() : null;
  return followed ??= createPeople({
    hand: {
      pubkey: () => signer()?.state === "unlocked" ? signer().pubkey : null,
      ready: () => !!signer()?.more.includes("follows"),
      change: (list, change2) => signer()?.follow(list, change2) ?? Promise.resolve(null)
    }
  });
}
function signerAction(controls, opts = {}) {
  const signer = worldSigner();
  let was = signer.state;
  let wasAsking = false;
  const short = () => shortNpub4(signer.pubkey ?? "");
  signer.onChange(() => {
    if (signer.state === "unlocked" && was !== "unlocked") {
      void Promise.race([seekPass(), soon(4e3)]).then(() => {
        if (signer.state !== "unlocked") return;
        const who = hereAs();
        controls.say(
          who ? `You are signed in here as ${who.name || short()}${signer.remembered === false ? ", for this visit" : ""}. People in a room see your name and picture, and you can send out posts. Signing out is under You.` : `You are signed in here as ${signer.name ?? short()}, and can send out posts. In a room you are still a guest: ${signer.host ?? "your sign-in address"} gave no pass with your name on it.`
        );
      });
    }
    if (signer.state === "locked" && was === "unlocked") controls.say("You are signed out here. Everyone sees a guest, and nothing more can be signed as you.");
    if (wasAsking && !signer.asking && signer.unanswered) controls.say(unansweredWords(signer));
    if (wasAsking && !signer.asking && signer.state === "locked") controls.say(`${signer.host ?? "Your sign-in address"} answered. You can sign in now.`);
    wasAsking = signer.asking;
    was = signer.state;
    controls.signal("signer");
  });
  onHereAs(() => controls.signal("signer"));
  return {
    id: "signer",
    section: "you",
    icon: "key",
    // Signed out, it says whose window will open, before anything is pressed: an address to recognise.
    label: () => signer.state === "unlocked" ? `Signed in as ${hereAs()?.name || signer.name || short()}. Sign out here` : signer.asking ? `Asking ${signer.host ?? "your signer"} again\u2026` : signer.unanswered ? `${signer.host ?? "Your signer"} didn't answer. Press to ask again` : `Sign in${signer.host ? `, at ${signer.host}` : ""}`,
    short: () => signer.state === "unlocked" ? "Sign out" : "Sign in",
    on: () => signer.state === "unlocked",
    // Nothing to offer where no signer was named. One that was named and doesn't answer is said so, not hidden:
    // a row that isn't there can't be asked about.
    hidden: () => signer.state === "none" && !signer.unanswered && !signer.asking,
    act: () => {
      if (signer.state === "unlocked") return signer.lock();
      const host = signer.host ?? "your own client";
      if (signer.asking) return;
      if (signer.unanswered) {
        if (signer.retry()) return controls.say(`Asking ${host} again. It has ten seconds to answer.`);
        return controls.say(unansweredWords(signer));
      }
      if (opts.presenting?.()) return controls.say(`A window from ${host} is needed for this, and none can open in a headset. Leave the headset view for a moment, sign in, and come back in.`);
      if (signer.unlock()) controls.say(`A window from ${host} has opened. Say yes there, and you are signed in here.`);
      else controls.say(`Your browser didn't let a window open. Allow pop-ups for this site and press this again. Nothing is typed in this world: ${host} asks.`);
    }
  };
}
function figureAction(controls, leaving = () => ({})) {
  return {
    id: "figure",
    section: "you",
    icon: "look",
    label: "Change how you look",
    short: "Look",
    hidden: () => portal.airlockFor() === null,
    act: () => leave(controls, "look", leaving)
  };
}

// packages/sdk/src/input.ts
import * as THREE9 from "three";

// packages/sdk/src/stroll.ts
var WALK_SPEED = 2.4;
var RUN = 1.75;
var KEY_TURN = 1.9;
var TOP_SPEED = WALK_SPEED * RUN;
var DOUBLE_TAP = 400;
var TAP_REACH = 6;
var PATH_MOST = 12;
var FACE_RATE = 2.8;
var DRAG_LOOK = 5e-3;
function reachOf(fromX, fromZ, toX, toZ, reach = TAP_REACH) {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const far = Math.hypot(dx, dz);
  if (!Number.isFinite(far) || far <= reach || far === 0) return [toX, toZ];
  return [fromX + dx / far * reach, fromZ + dz / far * reach];
}
function dotsBetween(fromX, fromZ, toX, toZ, opts = {}) {
  const gap = opts.gap ?? 0.4;
  const clear = opts.clear ?? 0.45;
  const short = opts.short ?? 0.3;
  const most = opts.most ?? 40;
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const far = Math.hypot(dx, dz);
  const out = [];
  if (!Number.isFinite(far) || far <= clear + short || !(gap > 0)) return out;
  for (let d = far - short; d >= clear && out.length < most; d -= gap) out.push([fromX + dx / far * d, fromZ + dz / far * d]);
  return out;
}
function createStepPace(o = {}) {
  const speed = o.speed && o.speed > 0 ? o.speed : TOP_SPEED;
  const now = o.now ?? (() => performance.now());
  let readyAt = -Infinity;
  return {
    take(metres) {
      const t = now();
      if (t < readyAt) return false;
      const far = Number.isFinite(metres) ? Math.max(0, metres) : 0;
      readyAt = t + far / speed * 1e3;
      return true;
    },
    get ready() {
      return now() >= readyAt;
    },
    get wait() {
      return Math.max(0, (readyAt - now()) / 1e3);
    }
  };
}
function createStroll(o) {
  const speed = o.speed ?? WALK_SPEED;
  const reach = o.reach ?? TAP_REACH;
  const now = o.now ?? (() => performance.now());
  let path = [];
  let running = false;
  let asked = -Infinity;
  let heading = null;
  const aim = (fx, fz, tx, tz) => {
    const dx = tx - fx;
    const dz = tz - fz;
    if (Math.hypot(dx, dz) > 0.3) heading = Math.atan2(-dx, -dz);
  };
  const halt = () => {
    path = [];
    running = false;
    heading = null;
  };
  return {
    to(x, z, run) {
      const t = now();
      const again = t - asked <= DOUBLE_TAP;
      asked = t;
      const wasRunning = path.length > 0 && running;
      if (!Number.isFinite(x) || !Number.isFinite(z)) return halt();
      path = [[x, z]];
      running = run === true || again || wasRunning;
      aim(...o.where(), x, z);
    },
    tap(x, z) {
      const t = now();
      const again = t - asked <= DOUBLE_TAP;
      asked = t;
      if (!Number.isFinite(x) || !Number.isFinite(z)) return;
      const [hx, hz] = o.where();
      if (again || path.length === 0) {
        const wasRunning = path.length > 0 && running;
        path = [reachOf(hx, hz, x, z, reach)];
        running = again || wasRunning;
        aim(hx, hz, path[0][0], path[0][1]);
        return;
      }
      const end = path[path.length - 1];
      const next = reachOf(end[0], end[1], x, z, reach);
      if (path.length < PATH_MOST && Math.hypot(next[0] - end[0], next[1] - end[1]) > 0.3) path.push(next);
    },
    reach(x, z) {
      const from = path.length ? path[path.length - 1] : o.where();
      return reachOf(from[0], from[1], x, z, reach);
    },
    stop: halt,
    update(dt) {
      const next = path[0];
      if (!next) return;
      const [x, z] = o.where();
      const dx = next[0] - x;
      const dz = next[1] - z;
      const far = Math.hypot(dx, dz);
      aim(x, z, next[0], next[1]);
      const step = Math.min(far, speed * (running ? RUN : 1) * Math.min(Math.max(dt, 0), 0.1));
      const arrived = () => {
        path.shift();
        if (path.length === 0) halt();
      };
      if (far < 0.02 || step <= 0) {
        if (far < 0.02) arrived();
        return;
      }
      const sx = dx / far * step;
      const sz = dz / far * step;
      if (!o.canStand(x + sx, z + sz)) {
        halt();
        o.onBlocked?.();
        return;
      }
      o.move(sx, sz);
      if (far - step < 0.02) arrived();
    },
    face(yaw, dt) {
      if (heading === null || !(dt > 0)) return yaw;
      const turn2 = ((heading - yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      const most = FACE_RATE * Math.min(dt, 0.1);
      return yaw + Math.max(-most, Math.min(most, turn2 * Math.min(1, dt * 7)));
    },
    get going() {
      return path.length > 0;
    },
    get running() {
      return running;
    },
    get target() {
      return path.length ? path[path.length - 1] : null;
    },
    get path() {
      return path;
    },
    get heading() {
      return heading;
    }
  };
}

// packages/sdk/src/actions.ts
var NO_PAD = { stick: [0, 0], from: "none", trigger: 0, squeeze: 0, primary: false, secondary: false, press: false };
function deadzone(x, y, inner = 0.2) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return [0, 0];
  const far = Math.hypot(x, y);
  if (far <= inner) return [0, 0];
  const scale = Math.min(1, (far - inner) / (1 - inner)) / far;
  return [x * scale, y * scale];
}
function readPad(pad) {
  if (!pad) return NO_PAD;
  const button = (i) => pad.buttons[i];
  const value = (i) => {
    const b = button(i);
    if (!b) return 0;
    return b.value > 0 ? Math.min(1, b.value) : b.pressed ? 1 : 0;
  };
  const axis = (i) => Number.isFinite(pad.axes[i]) ? pad.axes[i] : 0;
  const hasStick = pad.axes.length >= 4;
  const hasTouchpad = !!button(2);
  let stick = [0, 0];
  let from = "none";
  if (hasStick) {
    stick = deadzone(axis(2), -axis(3));
    from = "thumbstick";
  } else if (pad.axes.length >= 2 && !hasTouchpad) {
    stick = deadzone(axis(0), -axis(1));
    from = "thumbstick";
  }
  if (stick[0] === 0 && stick[1] === 0 && hasTouchpad) {
    const touch = deadzone(axis(0), -axis(1), 0.3);
    if (button(2).pressed && (touch[0] !== 0 || touch[1] !== 0)) {
      stick = touch;
      from = "touchpad";
    } else if (!hasStick) from = "touchpad";
  }
  return { stick, from, trigger: value(0), squeeze: value(1), primary: !!button(4)?.pressed, secondary: !!button(5)?.pressed, press: from === "thumbstick" && !!button(3)?.pressed };
}
var DEFAULT_COMFORT = { move: "steps", turn: "steps", turnStep: 30, narrow: true, moveHand: "left" };
var CASUAL_COMFORT = { move: "steps", turn: "steps", narrow: true };
var INTENSE_COMFORT = { move: "smooth", turn: "smooth", narrow: false };
var isIntense = (comfort) => comfort.move === "smooth" && comfort.turn === "smooth";
function cleanComfort(input) {
  const out = {};
  if (!input || typeof input !== "object") return out;
  const c = input;
  if (c.move === "steps" || c.move === "smooth") out.move = c.move;
  if (c.turn === "steps" || c.turn === "smooth") out.turn = c.turn;
  if (c.turnStep === 30 || c.turnStep === 45 || c.turnStep === 90) out.turnStep = c.turnStep;
  if (typeof c.narrow === "boolean") out.narrow = c.narrow;
  if (c.moveHand === "left" || c.moveHand === "right") out.moveHand = c.moveHand;
  return out;
}
var KEY3 = "nswp:comfort";
function loadComfort() {
  try {
    return { ...DEFAULT_COMFORT, ...cleanComfort(JSON.parse(globalThis.localStorage?.getItem(KEY3) ?? "{}")) };
  } catch {
    return { ...DEFAULT_COMFORT };
  }
}
function saveComfort(comfort) {
  try {
    globalThis.localStorage?.setItem(KEY3, JSON.stringify(cleanComfort(comfort)));
  } catch {
  }
}
var WALK_SPEED2 = 1.8;
var RUN_FACTOR = RUN;
var TURN_SPEED = 110;
var BACK_STEP = 1;
var PUSH = 0.6;
var LET_GO = 0.3;
function stickRoles(pads, moveHand) {
  const sticks = pads.filter((p) => p.pad.from !== "none");
  const roles = /* @__PURE__ */ new Map();
  if (sticks.length === 1) roles.set(sticks[0].index, "both");
  else if (sticks.length >= 2) {
    const mover = sticks.find((p) => p.hand === moveHand) ?? sticks[0];
    for (const p of sticks) roles.set(p.index, p === mover ? "move" : "turn");
  }
  return roles;
}
var Locomotion = class {
  turned = /* @__PURE__ */ new Set();
  forward = /* @__PURE__ */ new Set();
  backward = /* @__PURE__ */ new Set();
  menuDown = false;
  jumpDown = false;
  heldMenu = createHeldButton();
  /** Running, once the moving stick is pressed in, until that stick comes back to rest. */
  running = false;
  frame(dt, pads, comfort) {
    const intent = { turn: 0, walk: [0, 0], stepFrom: [], aiming: [], menu: false, jump: false, summon: false, running: false, narrow: 0 };
    let pushed = false;
    const roles = stickRoles(pads, comfort.moveHand);
    const seen = /* @__PURE__ */ new Set();
    let sliding = false;
    for (const p of pads) {
      seen.add(p.index);
      const role = roles.get(p.index);
      if (!role) continue;
      const [x, y] = p.pad.stick;
      if (role !== "move") {
        if (comfort.turn === "smooth") {
          if (x !== 0) {
            intent.turn -= x * TURN_SPEED * dt;
            sliding = true;
          }
        } else if (Math.abs(x) >= PUSH && Math.abs(x) > Math.abs(y)) {
          if (!this.turned.has(p.index)) {
            this.turned.add(p.index);
            intent.turn += x > 0 ? -comfort.turnStep : comfort.turnStep;
          }
        } else if (Math.abs(x) < LET_GO) this.turned.delete(p.index);
      }
      if (comfort.move === "smooth" && role !== "turn") {
        const strafe = role === "both" ? 0 : x;
        if (strafe !== 0 || y !== 0) {
          pushed = true;
          if (p.pad.press) this.running = true;
          const pace = WALK_SPEED2 * (this.running ? RUN_FACTOR : 1) * dt / Math.max(1, Math.hypot(strafe, y));
          intent.walk[0] += strafe * pace;
          intent.walk[1] += y * pace;
          sliding = true;
        }
      } else if (comfort.move === "steps") {
        if (y >= PUSH && Math.abs(y) >= Math.abs(x)) this.forward.add(p.index);
        else if (y < LET_GO && this.forward.delete(p.index)) intent.stepFrom.push(p.index);
        if (this.forward.has(p.index)) intent.aiming.push(p.index);
        if (y <= -PUSH && Math.abs(y) > Math.abs(x)) {
          if (!this.backward.has(p.index)) {
            this.backward.add(p.index);
            intent.walk[1] -= BACK_STEP;
          }
        } else if (y > -LET_GO) this.backward.delete(p.index);
      }
    }
    for (const set of [this.turned, this.forward, this.backward]) for (const i of set) if (!seen.has(i) || !roles.has(i)) set.delete(i);
    if (!pushed) this.running = false;
    intent.running = this.running;
    const menu = pads.some((p) => p.pad.secondary);
    intent.menu = menu && !this.menuDown;
    this.menuDown = menu;
    intent.summon = this.heldMenu(menu, dt);
    const jump = pads.some((p) => p.pad.primary);
    intent.jump = jump && !this.jumpDown;
    this.jumpDown = jump;
    intent.narrow = sliding && comfort.narrow ? 1 : 0;
    return intent;
  }
};

// packages/sdk/src/input.ts
var unpointable = (root) => root.traverse((o) => void (o.raycast = () => {
}));
function controllerModel(accent) {
  const b = new MeshBuilder().at();
  b.tone = new THREE9.Color(1712684);
  b.light = accent.clone();
  const lean = new THREE9.Matrix4().makeRotationX(THREE9.MathUtils.degToRad(-52)).setPosition(0, -0.012, 0.022);
  b.place(lean);
  b.lathe([[5e-4, -0.07], [0.014, -0.068], [0.018, -0.02], [0.017, 0.03], [0.012, 0.046], [5e-4, 0.048]], [0, 0, 0], 6, (row) => row === 1 ? { glow: 0.5 } : { shade: 0.9 + row % 2 * 0.2 });
  b.place(new THREE9.Matrix4());
  b.box([0.03, 0.022, 0.07], [0, 4e-3, -0.045], { bevel: 6e-3, shade: 1.05 });
  b.box([0.018, 0.012, 4e-3], [0, 4e-3, -0.082], { glow: 1 });
  b.place(new THREE9.Matrix4().makeRotationX(THREE9.MathUtils.degToRad(64)).setPosition(0, 0.012, -0.04));
  b.lathe([[0.046, -4e-3], [0.052, 0], [0.046, 4e-3], [0.041, 0]], [0, 0, 0], 12, (row) => row === 1 ? { glow: 0.7 } : { shade: 0.85 });
  const metal = createAlloy(accent, { gloss: 0.6 });
  const group = new THREE9.Group();
  group.add(b.build(metal));
  const light = () => new THREE9.MeshBasicMaterial({ color: accent.clone().multiplyScalar(0.2) });
  const trigger = new THREE9.Mesh(new THREE9.BoxGeometry(0.012, 0.02, 0.014), light());
  trigger.position.set(0, -0.016, -0.036);
  const squeeze = new THREE9.Mesh(new THREE9.BoxGeometry(8e-3, 0.03, 0.012), light());
  squeeze.position.set(0, -0.034, 0.018);
  squeeze.rotation.x = THREE9.MathUtils.degToRad(-52);
  group.add(trigger, squeeze);
  unpointable(group);
  return { group, metal, trigger, squeeze };
}
var VIGNETTE_VERT = `varying float vFar; void main(){ vFar = length(position.xy); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
var VIGNETTE_FRAG = `uniform float uAmount; varying float vFar; void main(){ gl_FragColor = vec4(0.0, 0.0, 0.0, smoothstep(0.24, 0.42, vFar) * uAmount); }`;
function createXrInput(opts) {
  const { renderer, rig, camera } = opts;
  const accent = new THREE9.Color(opts.accent ?? 16758364);
  const came = arrivedSettings();
  let comfort = { ...loadComfort(), ...came.turn !== void 0 ? { turnStep: came.turn } : {}, ...came.hand !== void 0 ? { moveHand: came.hand } : {}, ...came.narrow !== void 0 ? { narrow: came.narrow } : {} };
  if (came.turn !== void 0 || came.hand !== void 0 || came.narrow !== void 0) saveComfort(comfort);
  reportSettings("hands", () => ({ turn: comfort.turnStep, hand: comfort.moveHand, narrow: comfort.narrow }));
  const loco = new Locomotion();
  const listeners = [];
  const listen = (target, type, fn) => {
    target.addEventListener(type, fn);
    listeners.push([target, type, fn]);
  };
  const slots = [0, 1].map((i) => {
    const ray = renderer.xr.getController(i);
    const grip = renderer.xr.getControllerGrip(i);
    const hand = renderer.xr.getHand(i);
    const slot = { ray, grip, hand, source: null, model: null };
    listen(ray, "connected", ((e) => {
      slot.source = e.data ?? null;
    }));
    listen(ray, "disconnected", (() => {
      slot.source = null;
      release(i);
    }));
    for (const o of [ray, grip, hand]) if (!o.parent) rig.add(o);
    if (opts.models !== false) {
      slot.model = controllerModel(accent);
      slot.model.group.visible = false;
      grip.add(slot.model.group);
    }
    return slot;
  });
  const kindOf = (s) => !s.source ? "none" : s.source.hand ? "hand" : "controller";
  const handOf = (s) => s.source?.handedness === "left" || s.source?.handedness === "right" ? s.source.handedness : "none";
  const jointShape = new THREE9.OctahedronGeometry(1, 1);
  const jointDark = new THREE9.MeshBasicMaterial({ color: 2568767 });
  const jointLit = new THREE9.MeshBasicMaterial({ color: accent });
  const dressHand = (hand) => {
    for (const joint of hand.children) {
      if (joint.userData.nswpJoint) continue;
      joint.userData.nswpJoint = true;
      const name = String(joint.jointName ?? "");
      const tip = name.endsWith("-tip");
      const mesh = new THREE9.Mesh(jointShape, tip ? jointLit : jointDark);
      const radius = joint.jointRadius;
      mesh.scale.setScalar(Math.min(0.02, Math.max(5e-3, (radius ?? 8e-3) * (tip ? 0.9 : 0.75))));
      unpointable(mesh);
      joint.add(mesh);
    }
  };
  const vignette = new THREE9.Mesh(
    new THREE9.RingGeometry(0.12, 3, 48, 4),
    new THREE9.ShaderMaterial({ uniforms: { uAmount: { value: 0 } }, vertexShader: VIGNETTE_VERT, fragmentShader: VIGNETTE_FRAG, transparent: true, depthTest: false, depthWrite: false })
  );
  vignette.position.z = -0.4;
  vignette.renderOrder = 999;
  vignette.frustumCulled = false;
  vignette.visible = false;
  unpointable(vignette);
  camera.add(vignette);
  let narrow = 0;
  let pulses = 0;
  const pulse = (slot, strength = 0.4, ms = 25) => {
    const pad = slots[slot]?.source?.gamepad;
    if (!pad) return;
    try {
      const actuator = pad.hapticActuators?.[0];
      if (actuator?.pulse) void actuator.pulse(Math.min(1, Math.max(0, strength)), ms);
      else if (pad.vibrationActuator?.playEffect) void pad.vibrationActuator.playEffect("dual-rumble", { duration: ms, strongMagnitude: strength, weakMagnitude: strength });
      else return;
      pulses++;
    } catch {
    }
  };
  const headAt = new THREE9.Vector3();
  const ahead = new THREE9.Vector3();
  const canStand = opts.canStand ?? (() => true);
  const walk = (right, forward) => {
    camera.getWorldPosition(headAt);
    camera.getWorldDirection(ahead);
    ahead.y = 0;
    if (ahead.lengthSq() < 1e-6) return;
    ahead.normalize();
    const dx = ahead.x * forward - ahead.z * right;
    const dz = ahead.z * forward + ahead.x * right;
    if (canStand(headAt.x + dx, headAt.z + dz)) rig.position.set(rig.position.x + dx, rig.position.y, rig.position.z + dz);
    else if (canStand(headAt.x + dx, headAt.z)) rig.position.x += dx;
    else if (canStand(headAt.x, headAt.z + dz)) rig.position.z += dz;
  };
  const things = /* @__PURE__ */ new Map();
  const held = /* @__PURE__ */ new Map();
  const returning = [];
  const box = new THREE9.Box3();
  const ball = new THREE9.Sphere();
  const handAt = new THREE9.Vector3();
  const raycaster = new THREE9.Raycaster();
  const turnOnly = new THREE9.Matrix4();
  const HOLD_AT = new THREE9.Vector3(0, 0, -0.06);
  const FAR_REACH = 6;
  const isHeld = (object) => [...held.values()].some((h) => h.thing.object === object);
  const grab = (slot, by) => {
    const s = slots[slot];
    if (held.has(slot) || !s.source) return false;
    (s.grip.visible ? s.grip : s.ray).getWorldPosition(handAt);
    let best = null;
    let bestFar = Infinity;
    for (const thing of things.values()) {
      if (isHeld(thing.object) || !thing.object.visible) continue;
      box.setFromObject(thing.object).getBoundingSphere(ball);
      const far = ball.center.distanceTo(handAt) - ball.radius;
      if (far <= thing.reach && far < bestFar) [best, bestFar] = [thing, far];
    }
    let pulled = false;
    if (!best && by === "squeeze") {
      turnOnly.identity().extractRotation(s.ray.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(s.ray.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(turnOnly);
      let closest = Infinity;
      for (const thing of things.values()) {
        if (!thing.far || !thing.object.visible || isHeld(thing.object)) continue;
        box.setFromObject(thing.object).getBoundingSphere(ball);
        const along = ball.center.clone().sub(raycaster.ray.origin).dot(raycaster.ray.direction);
        if (along <= 0 || along > FAR_REACH) continue;
        const off = raycaster.ray.distanceToPoint(ball.center);
        if (off > ball.radius + 0.04 + along * 0.02) continue;
        if (off / along < closest) [best, closest] = [thing, off / along];
      }
      pulled = !!best && best.pull;
    }
    if (!best) return false;
    const object = best.object;
    const coming = returning.findIndex((r) => r.object === object);
    if (coming >= 0) returning.splice(coming, 1);
    const home = { parent: object.parent, position: object.position.clone(), quaternion: object.quaternion.clone() };
    const hand = s.grip.visible ? s.grip : s.ray;
    hand.attach(object);
    held.set(slot, { thing: best, by, home, ...pulled ? { pull: { from: object.position.clone(), t: 0 } } : {} });
    pulse(slot, 0.6, 35);
    best.onGrab?.(slot);
    return true;
  };
  function release(slot) {
    const h = held.get(slot);
    if (!h) return;
    held.delete(slot);
    const object = h.thing.object;
    const parent = h.home.parent ?? opts.scene;
    parent.attach(object);
    if (h.thing.release === "return") returning.push({ object, from: object.position.clone(), fromQ: object.quaternion.clone(), to: h.home.position, toQ: h.home.quaternion, t: 0 });
    pulse(slot, 0.25, 20);
    h.thing.onRelease?.(slot);
  }
  slots.forEach((s, i) => {
    listen(s.ray, "squeezestart", (() => void grab(i, "squeeze")));
    listen(s.ray, "squeezeend", (() => {
      if (held.get(i)?.by === "squeeze") release(i);
    }));
    listen(s.ray, "selectstart", (() => {
      if (kindOf(s) === "hand") grab(i, "pinch");
    }));
    listen(s.ray, "selectend", (() => {
      if (held.get(i)?.by === "pinch") release(i);
    }));
  });
  const setComfort = (patch, keep3 = false) => {
    comfort = { ...comfort, ...cleanComfort(patch) };
    if (keep3) saveComfort(comfort);
  };
  if (opts.arrivedIntense && !isIntense(comfort)) setComfort(INTENSE_COMFORT, true);
  if (opts.controls) {
    const controls = opts.controls;
    let headset = false;
    void navigator.xr?.isSessionSupported("immersive-vr").then((ok) => {
      headset = ok;
      controls.addSection({ id: "moving", label: "Moving", icon: "step", note });
    }).catch(() => {
    });
    const hidden = () => !headset;
    const note = () => comfort.move === "steps" ? "With a controller: push a stick forward, point at the floor and let go to step there. Flick the other stick to turn. Squeeze the grip to pick things up. Pointing and selecting does everything too." : "With a controller: one stick walks, the other turns. If it makes you feel unwell, go back to stepping: it is the comfortable way.";
    controls.addSection({ id: "moving", label: "Moving", icon: "step", note });
    const change2 = (patch) => {
      setComfort(patch, true);
      controls.addSection({ id: "moving", label: "Moving", icon: "step", note });
    };
    controls.add(
      {
        // One switch for the two ways of moving in a headset. The settings under it are what it sets, and can
        // each be changed afterwards.
        id: "move-style",
        section: "moving",
        icon: "motion",
        hidden,
        on: () => isIntense(comfort),
        label: () => isIntense(comfort) ? "Headset controls: intense" : "Headset controls: casual",
        short: "Style",
        act: () => {
          const intense = !isIntense(comfort);
          change2(intense ? INTENSE_COMFORT : CASUAL_COMFORT);
          controls.say(
            intense ? "Intense: one stick walks, the other turns, smoothly, with the whole view. If it makes you feel unwell, go back to casual." : "Casual: point at the floor to step there, and turn a notch at a time. The comfortable way."
          );
        }
      },
      { id: "move-mode", section: "moving", icon: "step", hidden, on: () => comfort.move === "smooth", label: () => comfort.move === "steps" ? "Moving in steps. Walk smoothly instead" : "Walking smoothly. Move in steps instead", short: "Walk", act: () => change2({ move: comfort.move === "steps" ? "smooth" : "steps" }) },
      {
        id: "turn-mode",
        section: "moving",
        icon: "turn",
        hidden,
        on: () => comfort.turn === "smooth",
        label: () => comfort.turn === "smooth" ? "Turning smoothly. Turn in steps instead" : `Turning ${comfort.turnStep}\xB0 at a time. Change`,
        short: "Turn",
        // In steps of 30, then 45, then 90, then smoothly, and round again.
        act: () => change2(comfort.turn === "smooth" ? { turn: "steps", turnStep: 30 } : comfort.turnStep === 30 ? { turnStep: 45 } : comfort.turnStep === 45 ? { turnStep: 90 } : { turn: "smooth" })
      },
      { id: "move-hand", section: "moving", icon: "motion", hidden, label: () => `The ${comfort.moveHand} stick moves you. Swap hands`, short: "Hands", act: () => change2({ moveHand: comfort.moveHand === "left" ? "right" : "left" }) },
      {
        id: "move-narrow",
        section: "moving",
        icon: "look",
        hidden: () => hidden() || comfort.move === "steps" && comfort.turn === "steps",
        on: () => comfort.narrow,
        label: () => comfort.narrow ? "The view narrows while you move. Turn that off" : "Narrow the view while you move",
        short: "Narrow",
        act: () => change2({ narrow: !comfort.narrow })
      }
    );
  }
  let aiming = [];
  const read = () => slots.flatMap((s, index) => kindOf(s) === "controller" && s.source?.gamepad ? [{ index, hand: handOf(s), pad: readPad(s.source.gamepad) }] : []);
  const update = (dt) => {
    const presenting = renderer.xr.isPresenting;
    if (!presenting) {
      aiming = [];
      narrow = 0;
      vignette.visible = false;
      for (const slot of [...held.keys()]) release(slot);
    } else {
      const pads = read();
      const intent = loco.frame(dt, pads, comfort);
      if (intent.turn !== 0) {
        turnVisitor(rig, camera, intent.turn);
        if (comfort.turn === "steps") {
          for (const p of pads) if (Math.abs(p.pad.stick[0]) > 0.5) pulse(p.index, 0.2, 12);
        }
      }
      const stepped = comfort.move === "steps";
      if ((intent.walk[0] !== 0 || intent.walk[1] !== 0) && (!stepped || !opts.pace || opts.pace.take(Math.hypot(intent.walk[0], intent.walk[1])))) walk(intent.walk[0], intent.walk[1]);
      for (const slot of intent.stepFrom) {
        opts.stepFrom?.(slot);
        pulse(slot, 0.35, 20);
      }
      if (intent.menu) opts.onMenu?.();
      if (intent.jump) opts.onJump?.();
      if (intent.summon) opts.onSummon?.();
      aiming = intent.aiming;
      narrow += (intent.narrow - narrow) * Math.min(1, dt * (intent.narrow > narrow ? 12 : 3));
      vignette.material.uniforms.uAmount.value = narrow * 0.85;
      vignette.visible = narrow > 0.01;
      slots.forEach((s, i) => {
        const kind = kindOf(s);
        if (s.model) {
          s.model.group.visible = kind === "controller";
          const pad = pads.find((p) => p.index === i)?.pad ?? NO_PAD;
          s.model.trigger.material.color.copy(accent).multiplyScalar(0.2 + 0.8 * pad.trigger);
          s.model.squeeze.material.color.copy(accent).multiplyScalar(0.2 + 0.8 * pad.squeeze);
        }
        if (opts.models !== false && kind === "hand") dressHand(s.hand);
        s.hand.visible = opts.models !== false && kind === "hand";
      });
    }
    for (const h of held.values()) {
      if (!h.pull) continue;
      h.pull.t = Math.min(1, h.pull.t + dt / 0.18);
      h.thing.object.position.lerpVectors(h.pull.from, HOLD_AT, 1 - (1 - h.pull.t) ** 3);
      if (h.pull.t === 1) delete h.pull;
    }
    for (let i = returning.length - 1; i >= 0; i--) {
      const r = returning[i];
      r.t = Math.min(1, r.t + dt / 0.35);
      const k = 1 - (1 - r.t) ** 3;
      r.object.position.lerpVectors(r.from, r.to, k);
      r.object.quaternion.slerpQuaternions(r.fromQ, r.toQ, k);
      if (r.t === 1) returning.splice(i, 1);
    }
  };
  return {
    get comfort() {
      return comfort;
    },
    get intense() {
      return isIntense(comfort);
    },
    setComfort,
    update,
    grabbable(object, o = {}) {
      things.set(object, { object, reach: o.reach ?? 0.1, far: o.far ?? true, pull: o.pull ?? true, release: o.release ?? "stay", ...o.onGrab ? { onGrab: o.onGrab } : {}, ...o.onRelease ? { onRelease: o.onRelease } : {} });
      return () => {
        for (const [slot, h] of held) if (h.thing.object === object) release(slot);
        things.delete(object);
      };
    },
    claimed: (slot) => held.get(slot)?.by === "pinch",
    pulse,
    info() {
      const pads = renderer.xr.isPresenting ? read() : [];
      return {
        comfort,
        slots: slots.map((s, i) => ({ hand: handOf(s), kind: kindOf(s), pad: pads.find((p) => p.index === i)?.pad ?? NO_PAD })),
        aiming,
        holding: [0, 1].map((i) => held.get(i)?.thing.object.name || (held.has(i) ? "(unnamed)" : null)),
        narrow: Math.round(narrow * 100) / 100,
        pulses
      };
    },
    dispose() {
      for (const slot of [...held.keys()]) release(slot);
      for (const [target, type, fn] of listeners) target.removeEventListener(type, fn);
      camera.remove(vignette);
      vignette.geometry.dispose();
      vignette.material.dispose();
      for (const s of slots) {
        if (!s.model) continue;
        s.grip.remove(s.model.group);
        s.model.metal.dispose();
      }
      jointShape.dispose();
    }
  };
}

// packages/sdk/src/panels.ts
import * as THREE12 from "three";

// packages/sdk/src/keyboard.ts
import * as THREE10 from "three";

// packages/sdk/src/panel-store.ts
var PANEL_LOOKS = [
  { name: "Solid", opacity: 1, dark: 1 },
  { name: "Dark parts see-through", opacity: 1, dark: 0.4 },
  { name: "Dark parts clear", opacity: 1, dark: 0.08 },
  { name: "All of it faint", opacity: 0.6, dark: 0.35 }
];
function cleanLook(input) {
  const l = input && typeof input === "object" ? input : {};
  return { opacity: finite(l.opacity) ? clamp(l.opacity, 0.15, 1) : 1, dark: finite(l.dark) ? clamp(l.dark, 0, 1) : 1 };
}
function nextLook(now) {
  const at = PANEL_LOOKS.findIndex((l) => Math.abs(l.opacity - now.opacity) < 0.01 && Math.abs(l.dark - now.dark) < 0.01);
  return PANEL_LOOKS[(at + 1) % PANEL_LOOKS.length];
}
var PANEL_LIMITS = {
  count: 24,
  titleChars: 80,
  noteChars: 4e3,
  srcChars: 2048,
  minWidth: 0.3,
  maxWidth: 3,
  /** A panel is never kept further from the middle of a world than this, in metres. */
  reach: 500,
  /** The largest file of the visitor's own that is kept, in bytes. */
  fileBytes: 64 * 1024 * 1024
};
var ID = /^[a-z0-9-]{4,40}$/;
var finite = (n) => typeof n === "number" && Number.isFinite(n);
var clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
function tidy(text, max, lines = false) {
  if (typeof text !== "string") return "";
  const cleaned = text.replace(lines ? /[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g : /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g, " ");
  return [...lines ? cleaned : cleaned.replace(/\s+/g, " ").trim()].slice(0, max).join("");
}
function cleanPlace(input) {
  if (!input || typeof input !== "object") return null;
  const p = input;
  const at = p.position;
  if (!Array.isArray(at) || at.length !== 3 || !at.every(finite) || at.some((n) => Math.abs(n) > PANEL_LIMITS.reach)) return null;
  if (!finite(p.width)) return null;
  return {
    position: [at[0], at[1], at[2]],
    yaw: finite(p.yaw) ? (p.yaw % 360 + 360) % 360 : 0,
    pitch: finite(p.pitch) ? clamp(p.pitch, -60, 60) : 0,
    width: clamp(p.width, PANEL_LIMITS.minWidth, PANEL_LIMITS.maxWidth)
  };
}
function cleanSource(input) {
  if (!input || typeof input !== "object") return null;
  const s = input;
  const title = tidy(s.title, PANEL_LIMITS.titleChars);
  if (s.kind === "note") {
    const text = tidy(s.text, PANEL_LIMITS.noteChars, true);
    return text.trim() || title ? { kind: "note", title, text } : null;
  }
  if (s.kind === "picture" || s.kind === "video") {
    if (typeof s.src !== "string" || s.src.length === 0 || s.src.length > PANEL_LIMITS.srcChars) return null;
    if (!/^(kept:[a-z0-9-]{4,40}|https:\/\/|\/|\.\/|blob:)/.test(s.src)) return null;
    return { kind: s.kind, title, src: s.src };
  }
  return null;
}
function cleanRecords(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const item of input) {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !ID.test(item.id) || out.some((r) => r.id === item.id)) continue;
    const source = cleanSource(item.source);
    const place = cleanPlace(item.place);
    if (!source || !place || "src" in source && source.src.startsWith("blob:")) continue;
    const look = item.look ? cleanLook(item.look) : null;
    const pin = cleanPin(item.pin);
    out.push({ id: item.id, source, place, ...look && (look.opacity < 1 || look.dark < 1) ? { look } : {}, ...pin ? { pin } : {} });
    if (out.length === PANEL_LIMITS.count) break;
  }
  return out;
}
function cleanPin(input) {
  if (!Array.isArray(input) || input.length !== 3 || !input.every(finite)) return null;
  const z = clamp(input[2], -6, -0.25);
  return [clamp(input[0], -4, 4), clamp(input[1], -2.5, 2.5), z];
}
var turn = (from, to) => ((to - from) % 360 + 540) % 360 - 180;
function tagAlong(now, head, dt, o = {}) {
  const ease = Math.min(1, dt * 5);
  const off = turn(now.yaw, head.yaw);
  const turning = Math.abs(off) > (o.turn ?? 38) || now.turning && Math.abs(off) > 3;
  const [dx, dy, dz] = [head.position[0] - now.position[0], head.position[1] - now.position[1], head.position[2] - now.position[2]];
  const far = Math.hypot(dx, dy, dz);
  const moving = far > (o.reach ?? 0.4) || now.moving && far > 0.03;
  return {
    yaw: turning ? ((now.yaw + off * ease) % 360 + 360) % 360 : now.yaw,
    position: moving ? [now.position[0] + dx * ease, now.position[1] + dy * ease, now.position[2] + dz * ease] : now.position,
    turning,
    moving
  };
}
function facing(at, head) {
  const [dx, dy, dz] = [head[0] - at[0], head[1] - at[1], head[2] - at[2]];
  const flat = Math.hypot(dx, dz);
  if (flat < 1e-6) return { yaw: 0, pitch: 0 };
  const deg = 180 / Math.PI;
  return { yaw: (Math.atan2(dx, dz) * deg % 360 + 360) % 360, pitch: clamp(-Math.atan2(dy, flat) * deg, -35, 35) };
}
function inFront(head, yawDegrees, already = 0, distance = 1.3) {
  const step = Math.ceil(already % 7 / 2) * 48 * (already % 2 ? -1 : 1);
  const a = (yawDegrees + step) * Math.PI / 180;
  return [head[0] - Math.sin(a) * distance, clamp(head[1] - 0.05, 0.6, 3), head[2] - Math.cos(a) * distance];
}
function newId(random = Math.random) {
  return `p-${Array.from({ length: 10 }, () => Math.floor(random() * 36).toString(36)).join("")}`;
}
function wrapText(text, width, measure, maxLines = 40) {
  const out = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (measure(next) <= width || !line) line = next;
      else {
        out.push(line);
        line = word;
      }
      while (measure(line) > width && line.length > 1) {
        let cut = line.length - 1;
        while (cut > 1 && measure(line.slice(0, cut)) > width) cut--;
        out.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
    out.push(line);
    if (out.length > maxLines) break;
  }
  if (out.length > maxLines) {
    out.length = maxLines;
    out[maxLines - 1] = `${out[maxLines - 1].replace(/.$/u, "")}\u2026`;
  }
  return out;
}
var LIBRARY_LIMITS = { count: 60, thumbChars: 6e4 };
function cleanLibrary(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const item of input) {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !ID.test(item.id) || out.some((x) => x.id === item.id)) continue;
    if (item.kind !== "picture" && item.kind !== "video") continue;
    const thumb = typeof item.thumb === "string" && item.thumb.length <= LIBRARY_LIMITS.thumbChars && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(item.thumb) ? item.thumb : "";
    out.push({ id: item.id, kind: item.kind, title: tidy(item.title, PANEL_LIMITS.titleChars), bytes: finite(item.bytes) && item.bytes >= 0 ? item.bytes : 0, addedAt: finite(item.addedAt) ? item.addedAt : 0, thumb });
  }
  return out.sort((a, b) => b.addedAt - a.addedAt).slice(0, LIBRARY_LIMITS.count);
}
function libraryPage(items, page, perPage) {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const at = Math.min(pages - 1, Math.max(0, Math.floor(page)));
  return { items: items.slice(at * perPage, (at + 1) * perPage), page: at, pages };
}

// packages/sdk/src/keyboard.ts
var W3 = 1024;
var SHOW = 300;
var KEYS = 520;
var LIVE_STRIP = 92;
var WIDTH = 0.8;
function createKeyboard(o) {
  const accent = `#${new THREE10.Color(o.accent ?? 16758364).getHexString()}`;
  const ink = o.textColor ?? "#eef5fb";
  const canvas = document.createElement("canvas");
  canvas.width = W3;
  canvas.height = SHOW + KEYS;
  const g = canvas.getContext("2d");
  const texture = new THREE10.CanvasTexture(canvas);
  texture.colorSpace = THREE10.SRGBColorSpace;
  texture.anisotropy = 8;
  const board = new THREE10.Mesh(new THREE10.PlaneGeometry(WIDTH, WIDTH * canvas.height / W3), new THREE10.MeshBasicMaterial({ map: texture, toneMapped: false, transparent: true }));
  board.name = "keyboard";
  const group = new THREE10.Group();
  group.name = "keyboard";
  group.add(board);
  group.visible = false;
  o.scene.add(group);
  let entry = new TextEntry();
  let title = "";
  let keys = [];
  let aimed = null;
  let done = null;
  let stale = true;
  let field = null;
  let live = null;
  const voice = o.voice ?? createVoice();
  let notice = "";
  const say = (message) => {
    notice = message;
    stale = true;
  };
  const systemOffered = () => !!o.session?.()?.isSystemKeyboardSupported;
  const lay = () => {
    const mic = !!voice.source;
    keys = live ? placeLiveKeys(live.keys.layer, { mic }) : placeKeys(entry.layer, { multiline: entry.multiline, system: systemOffered(), mic });
    stale = true;
  };
  const paint = () => {
    stale = false;
    g.clearRect(0, 0, W3, canvas.height);
    const top = live ? SHOW - LIVE_STRIP : 0;
    g.fillStyle = "rgba(10, 16, 24, 0.94)";
    g.beginPath();
    g.roundRect(0, top, W3, SHOW - 16 - top, 26);
    g.fill();
    g.textBaseline = "top";
    g.fillStyle = accent;
    g.font = "bold 30px system-ui, sans-serif";
    if (live) g.fillText(notice || (live.keys.ctrl ? `${title}. Ctrl is on for the next key.` : title), 36, top + 22, W3 - 72);
    else {
      g.fillText(notice || title, 36, 24, W3 - 72);
      g.fillStyle = ink;
      g.font = "40px system-ui, sans-serif";
      const lines = wrapText(`${entry.value}\u258F`, W3 - 72, (s) => g.measureText(s).width, 400);
      lines.slice(-4).forEach((line, i) => g.fillText(line, 36, 76 + i * 50));
    }
    for (const k of keys) {
      const [x, y, w, h] = [k.x * W3, SHOW + k.y * KEYS, k.width * W3, k.height * KEYS];
      const shift = live ? live.keys.shift : entry.shift;
      const on = aimed === k.id || k.kind === "shift" && shift !== "off" || k.kind === "ctrl" && !!live?.keys.ctrl || k.kind === "mic" && voice.state !== "idle";
      g.fillStyle = on ? accent : k.kind === "char" || k.kind === "space" ? "#162231" : k.kind === "done" ? "#24384c" : "#0e1722";
      g.beginPath();
      g.roundRect(x, y, w, h, 16);
      g.fill();
      if (k.kind === "shift" && shift === "lock") {
        g.fillStyle = "#04070b";
        g.fillRect(x + w / 2 - 22, y + h - 16, 44, 5);
      }
      g.fillStyle = on ? "#04070b" : ink;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = k.kind === "char" ? "44px system-ui, sans-serif" : "bold 28px system-ui, sans-serif";
      g.fillText(live ? live.keys.label(k) : entry.label(k), x + w / 2, y + h / 2 + 2, w - 12);
      g.textAlign = "left";
    }
    texture.needsUpdate = true;
  };
  const finish = (value) => {
    if (!done) return;
    voice.cancel();
    notice = "";
    const resolve = done;
    done = null;
    group.visible = false;
    aimed = null;
    field?.remove();
    field = null;
    removeEventListener("keydown", onKey, true);
    removeEventListener("paste", onPaste, true);
    resolve(value);
  };
  const onKey = (e) => {
    if (e.target === field) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    let handled = true;
    if (e.key === "Escape") finish(null);
    else if (e.key === "Backspace") entry.erase();
    else if (e.key === "Enter") {
      if (entry.multiline && !e.shiftKey) entry.type("\n");
      else finish(entry.value);
    } else if (e.key.length === 1 || [...e.key].length === 1) entry.type(e.key);
    else handled = e.key.length > 1 && !/^F\d+$/.test(e.key);
    if (handled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    stale = true;
  };
  const onPaste = (e) => {
    if (e.target === field) return;
    const text = e.clipboardData?.getData("text/plain");
    if (!text) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    entry.type(text);
    stale = true;
  };
  const useSystem = () => {
    if (field) return;
    field = document.createElement("textarea");
    Object.assign(field.style, { position: "fixed", left: "0", bottom: "0", width: "1px", height: "1px", opacity: "0" });
    field.maxLength = entry.maxLength;
    field.value = entry.value;
    field.addEventListener("input", () => {
      entry.value = "";
      entry.type(field.value);
      stale = true;
    });
    document.body.append(field);
    field.focus();
  };
  const unheard = voice.subscribe(() => done || live ? lay() : void 0);
  const at = new THREE10.Vector3();
  const facing2 = new THREE10.Vector3();
  const local2 = new THREE10.Vector3();
  const putUp = (under = false) => {
    o.camera.getWorldPosition(at);
    o.camera.getWorldDirection(facing2);
    facing2.y = 0;
    if (facing2.lengthSq() < 1e-6) facing2.set(0, 0, -1);
    facing2.normalize();
    const reach = under ? 0.62 : 0.68;
    group.position.set(at.x + facing2.x * reach, Math.max(under ? 0.42 : 0.5, at.y - (under ? 0.58 : 0.4)), at.z + facing2.z * reach);
    group.rotation.set((under ? -42 : -32) * (Math.PI / 180), Math.atan2(-facing2.x, -facing2.z), 0, "YXZ");
    group.visible = true;
  };
  const closeLive = () => {
    if (!live) return;
    const was = live;
    live = null;
    aimed = null;
    voice.cancel();
    notice = "";
    if (!done) group.visible = false;
    was.o.onClose?.();
  };
  const api = {
    group,
    get open() {
      return !!done || !!live;
    },
    get isLive() {
      return !!live;
    },
    live(l) {
      if (done) finish(null);
      closeLive();
      live = { keys: new LiveKeys(), o: l };
      title = l.title;
      lay();
      putUp(true);
    },
    closeLive,
    ask(a) {
      if (done) finish(null);
      closeLive();
      entry = new TextEntry({ ...a.value !== void 0 ? { value: a.value } : {}, ...a.multiline !== void 0 ? { multiline: a.multiline } : {}, ...a.maxLength !== void 0 ? { maxLength: a.maxLength } : {} });
      title = a.title;
      lay();
      putUp();
      addEventListener("keydown", onKey, true);
      addEventListener("paste", onPaste, true);
      return new Promise((resolve) => {
        done = resolve;
      });
    },
    cancel() {
      finish(null);
      closeLive();
    },
    pick(raycaster) {
      if (!done && !live) return null;
      const hit = raycaster.intersectObject(board, false)[0];
      if (!hit?.uv) return null;
      const y = (1 - hit.uv.y) * canvas.height;
      if (live && y < SHOW - LIVE_STRIP) return null;
      const k = y >= SHOW ? keyAt(keys, hit.uv.x, (y - SHOW) / KEYS) : null;
      return `kb:${k?.id ?? ""}`;
    },
    aim(hit) {
      const id = hit?.startsWith("kb:") ? hit.slice(3) || null : null;
      if (id === aimed) return;
      aimed = id;
      stale = true;
    },
    press(hit) {
      if (!hit.startsWith("kb:") || hit.length === 3) return;
      if (live) {
        const what2 = live.keys.press(hit.slice(3), keys);
        if (what2 && "close" in what2) return closeLive();
        const to = live.o;
        if (what2 && "mic" in what2) voice.toggle({ onText: (text) => to.onKey(`${text} `), say });
        lay();
        if (what2 && "send" in what2) live.o.onKey(what2.send);
        return;
      }
      if (!done) return;
      const what = entry.press(hit.slice(3), keys);
      if (what === "mic") {
        const into = entry;
        voice.toggle({
          onText(text) {
            into.type(into.value && !/\s$/.test(into.value) ? ` ${text}` : text);
            stale = true;
          },
          say
        });
      }
      if (what === "done") return finish(entry.value);
      if (what === "cancel") return finish(null);
      if (what === "system") useSystem();
      lay();
    },
    pointOf(hit) {
      const k = hit.startsWith("kb:") ? keys.find((x) => x.id === hit.slice(3)) : null;
      if (!k || !done && !live) return null;
      const height = WIDTH * canvas.height / W3;
      const v = (SHOW + (k.y + k.height / 2) * KEYS) / canvas.height;
      local2.set((k.x + k.width / 2 - 0.5) * WIDTH, (0.5 - v) * height, 0);
      group.updateMatrixWorld(true);
      return board.localToWorld(local2.clone());
    },
    voice,
    info: () => ({ voice: voice.state, notice, open: !!done || !!live, live: !!live, title, value: live ? "" : entry.value, layer: live ? live.keys.layer : entry.layer, shift: live ? live.keys.shift : entry.shift, ctrl: !!live?.keys.ctrl, keys: keys.map((k) => k.id) }),
    update() {
      if ((done || live) && stale) paint();
    },
    dispose() {
      finish(null);
      closeLive();
      unheard();
      o.scene.remove(group);
      board.geometry.dispose();
      board.material.dispose();
      texture.dispose();
    }
  };
  return api;
}

// packages/sdk/src/library.ts
import * as THREE11 from "three";
var DB = "nswp-panels";
function files() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore("files");
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}
async function fileStore(mode, run) {
  try {
    const db = await files();
    return await new Promise((resolve, reject) => {
      const request = run(db.transaction("files", mode).objectStore("files"));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return void 0;
  }
}
async function thumbnail(file, kind) {
  const draw = (source, w, h) => {
    if (!w || !h) return "";
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = Math.max(1, Math.round(240 * h / w));
    canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.7);
    return data.length <= LIBRARY_LIMITS.thumbChars ? data : "";
  };
  try {
    if (kind === "picture") {
      const bitmap = await createImageBitmap(file);
      const data = draw(bitmap, bitmap.width, bitmap.height);
      bitmap.close();
      return data;
    }
    const url = URL.createObjectURL(file);
    try {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = url;
      await new Promise((resolve, reject) => {
        video.addEventListener("loadeddata", () => resolve(), { once: true });
        video.addEventListener("error", () => reject(new Error("unreadable")), { once: true });
        setTimeout(() => reject(new Error("slow")), 4e3);
      });
      return draw(video, video.videoWidth, video.videoHeight);
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return "";
  }
}
var W4 = 1024;
var H3 = 768;
var COLS = 4;
var ROWS = 2;
var TOP = 96;
var FOOT = 104;
var WIDTH2 = 1.1;
function createLibrary(o) {
  const accent = `#${new THREE11.Color(o.accent ?? 16758364).getHexString()}`;
  const ink = o.textColor ?? "#eef5fb";
  let items = [];
  if (o.keep) {
    try {
      items = cleanLibrary(JSON.parse(localStorage.getItem(`${o.keep}:library`) ?? "[]"));
    } catch {
    }
  }
  const save = () => {
    stale = true;
    o.onChange?.();
    if (!o.keep) return;
    try {
      localStorage.setItem(`${o.keep}:library`, JSON.stringify(items));
    } catch {
    }
  };
  const canvas = document.createElement("canvas");
  canvas.width = W4;
  canvas.height = H3;
  const g = canvas.getContext("2d");
  const texture = new THREE11.CanvasTexture(canvas);
  texture.colorSpace = THREE11.SRGBColorSpace;
  texture.anisotropy = 8;
  const board = new THREE11.Mesh(new THREE11.PlaneGeometry(WIDTH2, WIDTH2 * H3 / W4), new THREE11.MeshBasicMaterial({ map: texture, toneMapped: false }));
  board.name = "library";
  const group = new THREE11.Group();
  group.name = "library";
  group.add(board);
  group.visible = false;
  o.scene.add(group);
  let page = 0;
  let removing = false;
  let aimed = null;
  let stale = true;
  let regions = [];
  const thumbs = /* @__PURE__ */ new Map();
  const thumbOf = (item) => {
    if (!item.thumb) return null;
    let image = thumbs.get(item.id);
    if (!image) {
      image = new Image();
      image.onload = () => stale = true;
      image.src = item.thumb;
      thumbs.set(item.id, image);
    }
    return image.complete && image.naturalWidth ? image : null;
  };
  const paint = () => {
    stale = false;
    regions = [];
    const shown2 = libraryPage(items, page, COLS * ROWS);
    page = shown2.page;
    g.fillStyle = "#0a1018";
    g.fillRect(0, 0, W4, H3);
    g.fillStyle = "#101a26";
    g.fillRect(0, 0, W4, TOP);
    g.fillStyle = ink;
    g.textBaseline = "middle";
    g.textAlign = "left";
    g.font = "bold 40px system-ui, sans-serif";
    g.fillText(removing ? "Select one to remove it" : "Your pictures and video", 36, TOP / 2 + 2, W4 - 200);
    const button = (id, label, x, y, w, h, on = false) => {
      regions.push({ id, x, y, w, h });
      const lit = aimed === id || on;
      g.fillStyle = lit ? accent : "#162231";
      g.beginPath();
      g.roundRect(x, y, w, h, 16);
      g.fill();
      g.fillStyle = lit ? "#04070b" : ink;
      g.textAlign = "center";
      g.font = "bold 30px system-ui, sans-serif";
      g.fillText(label, x + w / 2, y + h / 2 + 2, w - 16);
      g.textAlign = "left";
    };
    button("close", "Close", W4 - 164, 18, 140, TOP - 36);
    if (shown2.items.length === 0) {
      g.fillStyle = ink;
      g.globalAlpha = 0.8;
      g.font = "34px system-ui, sans-serif";
      g.textAlign = "center";
      g.fillText("Nothing here yet.", W4 / 2, H3 / 2 - 40);
      g.fillText("Hang a picture or video on a flat screen,", W4 / 2, H3 / 2 + 10);
      g.fillText("or take a picture with the camera.", W4 / 2, H3 / 2 + 56);
      g.textAlign = "left";
      g.globalAlpha = 1;
    }
    const cellW = (W4 - 48) / COLS;
    const cellH = (H3 - TOP - FOOT - 24) / ROWS;
    shown2.items.forEach((item, i) => {
      const [x, y] = [24 + i % COLS * cellW + 10, TOP + 12 + Math.floor(i / COLS) * cellH + 8];
      const [w, h] = [cellW - 20, cellH - 16];
      const id = `item:${item.id}`;
      regions.push({ id, x, y, w, h });
      g.fillStyle = aimed === id ? accent : "#162231";
      g.beginPath();
      g.roundRect(x, y, w, h, 14);
      g.fill();
      const image = thumbOf(item);
      const [px, py, pw, ph] = [x + 8, y + 8, w - 16, h - 60];
      g.fillStyle = "#05090e";
      g.fillRect(px, py, pw, ph);
      if (image) {
        const scale = Math.min(pw / image.naturalWidth, ph / image.naturalHeight);
        const [dw, dh] = [image.naturalWidth * scale, image.naturalHeight * scale];
        g.drawImage(image, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
      }
      if (item.kind === "video") {
        g.fillStyle = "rgba(4, 7, 11, 0.7)";
        g.beginPath();
        g.arc(px + pw / 2, py + ph / 2, 30, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = ink;
        g.beginPath();
        g.moveTo(px + pw / 2 - 10, py + ph / 2 - 15);
        g.lineTo(px + pw / 2 + 16, py + ph / 2);
        g.lineTo(px + pw / 2 - 10, py + ph / 2 + 15);
        g.fill();
      }
      g.fillStyle = aimed === id ? "#04070b" : ink;
      g.font = "26px system-ui, sans-serif";
      g.fillText(item.title || (item.kind === "video" ? "A video" : "A picture"), x + 12, y + h - 26, w - 24);
    });
    const fy = H3 - FOOT + 14;
    if (shown2.pages > 1) {
      button("prev", "Earlier", 24, fy, 170, FOOT - 28);
      button("next", "Later", 206, fy, 170, FOOT - 28);
      g.fillStyle = ink;
      g.font = "28px system-ui, sans-serif";
      g.fillText(`${shown2.page + 1} of ${shown2.pages}`, 400, fy + (FOOT - 28) / 2 + 2);
    }
    if (items.length) button("removing", removing ? "Stop removing" : "Remove one", W4 - 300, fy, 276, FOOT - 28, removing);
    texture.needsUpdate = true;
  };
  const at = new THREE11.Vector3();
  const facing2 = new THREE11.Vector3();
  const api = {
    group,
    list: () => items,
    async add(file, name = "") {
      const kind = file.type.startsWith("image/") ? "picture" : file.type.startsWith("video/") ? "video" : null;
      if (!kind || file.size > PANEL_LIMITS.fileBytes || items.length >= LIBRARY_LIMITS.count) return null;
      const id = newId();
      if (await fileStore("readwrite", (s) => s.put(file, id)) === void 0) return null;
      const item = { id, kind, title: name.replace(/\.[a-z0-9]+$/i, "").slice(0, PANEL_LIMITS.titleChars), bytes: file.size, addedAt: Math.floor(Date.now() / 1e3), thumb: await thumbnail(file, kind) };
      items = cleanLibrary([item, ...items]);
      save();
      return items.find((x) => x.id === id) ?? null;
    },
    async remove(id) {
      if (!items.some((x) => x.id === id)) return;
      items = items.filter((x) => x.id !== id);
      thumbs.delete(id);
      await fileStore("readwrite", (s) => s.delete(id));
      save();
    },
    get showing() {
      return group.visible;
    },
    set showing(v) {
      if (v === group.visible) return;
      group.visible = v;
      removing = false;
      aimed = null;
      stale = true;
      if (v) {
        o.camera.getWorldPosition(at);
        o.camera.getWorldDirection(facing2);
        facing2.y = 0;
        if (facing2.lengthSq() < 1e-6) facing2.set(0, 0, -1);
        facing2.normalize();
        group.position.set(at.x + facing2.x * 1.15, Math.max(0.8, at.y - 0.05), at.z + facing2.z * 1.15);
        group.rotation.set(0, Math.atan2(-facing2.x, -facing2.z), 0);
      }
      o.onChange?.();
    },
    pick(raycaster) {
      if (!group.visible) return null;
      const hit = raycaster.intersectObject(board, false)[0];
      if (!hit?.uv) return null;
      const [x, y] = [hit.uv.x * W4, (1 - hit.uv.y) * H3];
      const r = regions.find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
      return `lib:${r?.id ?? ""}`;
    },
    aim(hit) {
      const id = hit?.startsWith("lib:") ? hit.slice(4) || null : null;
      if (id === aimed) return;
      aimed = id;
      stale = true;
    },
    press(hit) {
      if (!group.visible || !hit.startsWith("lib:")) return;
      const id = hit.slice(4);
      if (id === "close") api.showing = false;
      else if (id === "prev") page--;
      else if (id === "next") page++;
      else if (id === "removing") removing = !removing;
      else if (id.startsWith("item:")) {
        const item = items.find((x) => x.id === id.slice(5));
        if (item && removing) void api.remove(item.id);
        else if (item) o.onChoose(item);
      }
      stale = true;
    },
    pointOf(hit) {
      const r = hit.startsWith("lib:") ? regions.find((q) => q.id === hit.slice(4)) : null;
      if (!r || !group.visible) return null;
      const height = WIDTH2 * H3 / W4;
      group.updateMatrixWorld(true);
      return board.localToWorld(new THREE11.Vector3(((r.x + r.w / 2) / W4 - 0.5) * WIDTH2, (0.5 - (r.y + r.h / 2) / H3) * height, 0));
    },
    info: () => ({ showing: group.visible, page, pages: libraryPage(items, page, COLS * ROWS).pages, removing, cells: regions.map((r) => r.id) }),
    update() {
      if (group.visible && stale) paint();
    },
    dispose() {
      o.scene.remove(group);
      board.geometry.dispose();
      board.material.dispose();
      texture.dispose();
    }
  };
  return api;
}

// packages/sdk/src/panels.ts
var BAR = 0.085;
var GAP = 0.012;
var BUTTON = 0.062;
var DEG = Math.PI / 180;
function canvasTexture(width, height, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  const texture = new THREE12.CanvasTexture(canvas);
  texture.colorSpace = THREE12.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
function noteTexture(source, ink) {
  const W5 = 1024;
  const pad = 56;
  const measure = document.createElement("canvas").getContext("2d");
  measure.font = "40px system-ui, sans-serif";
  const lines = wrapText(source.text, W5 - pad * 2, (s) => measure.measureText(s).width);
  const H5 = Math.round(Math.min(2048, Math.max(360, pad * 2 + lines.length * 56 + 12)));
  const texture = canvasTexture(W5, H5, (g) => {
    g.fillStyle = "#0a1018";
    g.fillRect(0, 0, W5, H5);
    g.fillStyle = ink;
    g.textBaseline = "top";
    g.font = "40px system-ui, sans-serif";
    lines.forEach((line, i) => g.fillText(line, pad, pad + i * 56));
  });
  return { texture, aspect: W5 / H5 };
}
function glyphTexture(glyph, ink) {
  return canvasTexture(128, 128, (g) => {
    g.fillStyle = "#101a26";
    g.beginPath();
    g.roundRect(4, 4, 120, 120, 26);
    g.fill();
    g.strokeStyle = ink;
    g.fillStyle = ink;
    g.lineWidth = 11;
    g.lineCap = "round";
    g.beginPath();
    if (glyph === "close") {
      g.moveTo(42, 42);
      g.lineTo(86, 86);
      g.moveTo(86, 42);
      g.lineTo(42, 86);
      g.stroke();
    } else if (glyph === "smaller" || glyph === "larger") {
      g.moveTo(38, 64);
      g.lineTo(90, 64);
      if (glyph === "larger") {
        g.moveTo(64, 38);
        g.lineTo(64, 90);
      }
      g.stroke();
    } else if (glyph === "glass") {
      g.lineWidth = 8;
      g.strokeRect(38, 38, 52, 52);
      g.beginPath();
      g.moveTo(38, 90);
      g.lineTo(90, 38);
      g.lineTo(90, 90);
      g.closePath();
      g.fill();
    } else if (glyph === "pin") {
      g.lineWidth = 9;
      g.arc(64, 50, 17, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(64, 62);
      g.lineTo(64, 98);
      g.stroke();
    } else if (glyph === "play") {
      g.moveTo(48, 36);
      g.lineTo(92, 64);
      g.lineTo(48, 92);
      g.closePath();
      g.fill();
    } else {
      g.fillRect(42, 38, 16, 52);
      g.fillRect(70, 38, 16, 52);
    }
  });
}
function barTexture(title, ink) {
  return canvasTexture(1024, Math.round(1024 * BAR), (g, w, h) => {
    g.fillStyle = "#101a26";
    g.fillRect(0, 0, w, h);
    g.fillStyle = ink;
    g.textBaseline = "middle";
    g.font = "bold 42px system-ui, sans-serif";
    g.fillText(title, 96, h / 2 + 2, w - 96 - 440);
  });
}
function createPanels(o) {
  const accent = new THREE12.Color(o.accent ?? 16758364);
  const ink = o.textColor ?? "#eef5fb";
  const root = new THREE12.Group();
  root.name = "panels";
  o.scene.add(root);
  const live = /* @__PURE__ */ new Map();
  const metal = createAlloy(accent, { gloss: 0.5 });
  const glyphs = /* @__PURE__ */ new Map();
  const glyph = (g) => glyphs.get(g) ?? (glyphs.set(g, glyphTexture(g, ink)), glyphs.get(g));
  const frameShape = (() => {
    const b = new MeshBuilder().at();
    b.tone = new THREE12.Color(1186340);
    b.light = accent.clone();
    b.box([1, 1, 0.022], [0, 0, 0], { bevel: 8e-3 });
    return b.geometry();
  })();
  const head = new THREE12.Vector3();
  const at = new THREE12.Vector3();
  const headV3 = () => {
    o.camera.getWorldPosition(head);
    return [head.x, head.y, head.z];
  };
  const save = () => {
    o.onChange?.();
    if (!o.keep) return;
    try {
      localStorage.setItem(
        o.keep,
        JSON.stringify([...live.values()].flatMap((p) => p.record ? [{ id: p.record.id, source: p.record.source, place: p.place(), ...p.seeThrough.opacity < 1 || p.seeThrough.dark < 1 ? { look: p.seeThrough } : {}, ...p.pinAt ? { pin: p.pinAt } : {} }] : []))
      );
    } catch {
    }
  };
  const keyboard = createKeyboard({ scene: o.scene, camera: o.camera, accent, textColor: ink, ...o.session ? { session: o.session } : {} });
  const library = createLibrary({
    scene: o.scene,
    camera: o.camera,
    accent,
    textColor: ink,
    ...o.keep ? { keep: o.keep } : {},
    onChoose: (item) => {
      try {
        open({ kind: item.kind, title: item.title, src: `kept:${item.id}` });
      } catch {
      }
    },
    onChange: () => {
      const have = new Set(library.list().map((x) => `kept:${x.id}`));
      for (const p of [...live.values()]) if (p.source.kind !== "custom" && "src" in p.source && p.source.src.startsWith("kept:") && !have.has(p.source.src)) p.close();
      o.onChange?.();
    }
  });
  const layout = (p) => {
    const h = 1 / p.aspect;
    p.body.scale.set(1, h, 1);
    const top = h / 2 + GAP + BAR / 2;
    if (!p.held) {
      p.bar.position.set(0, top, 0);
      p.bar.quaternion.identity();
      p.bar.scale.set(1, 1, 1);
    }
    const frame = p.group.getObjectByName("frame");
    if (frame) {
      frame.scale.set(1.03, h + BAR + GAP + 0.03, 1);
      frame.position.set(0, (BAR + GAP) / 2, -0.014);
    }
    let x = 0.5 - BUTTON / 2 - 0.012;
    for (const name of ["close", "larger", "smaller", "glass", "pin"]) {
      p.buttons.get(name)?.position.set(x, top, 4e-3);
      x -= BUTTON + 0.014;
    }
    p.buttons.get("play")?.position.set(-0.5 + BUTTON / 2 + 0.012, top, 4e-3);
    p.group.scale.setScalar(p.width);
  };
  const setPlace = (p, place) => {
    if (place.position) p.group.position.set(...place.position);
    if (place.yaw !== void 0 || place.pitch !== void 0) {
      const now = p.place();
      p.group.rotation.set((place.pitch ?? now.pitch) * DEG, (place.yaw ?? now.yaw) * DEG, 0, "YXZ");
    }
    if (place.width !== void 0) {
      p.width = Math.min(PANEL_LIMITS.maxWidth, Math.max(PANEL_LIMITS.minWidth, place.width));
      layout(p);
    }
  };
  const applyLook = (p) => {
    const material = p.body.material;
    const solid = p.seeThrough.opacity >= 1 && p.seeThrough.dark >= 1;
    material.opacity = p.seeThrough.opacity;
    material.transparent = !solid;
    material.depthWrite = solid;
    p.dark.value = p.seeThrough.dark;
    p.body.renderOrder = solid ? 0 : 2;
    const frame = p.group.getObjectByName("frame");
    if (frame) frame.visible = solid;
    material.needsUpdate = true;
  };
  const seeThroughDark = (material, dark) => {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.nswpDark = dark;
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform float nswpDark;").replace("#include <map_fragment>", "#include <map_fragment>\n	diffuseColor.a *= mix(nswpDark, 1.0, smoothstep(0.02, 0.2, dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114))));");
    };
    material.customProgramCacheKey = () => "nswp-panel-body";
  };
  const presenting = () => !!o.session?.();
  let follow = null;
  const anchorAt = new THREE12.Vector3();
  const anchorTurn = new THREE12.Quaternion();
  const offset = new THREE12.Vector3();
  const UP = new THREE12.Vector3(0, 1, 0);
  const anchor = (dt) => {
    o.camera.getWorldPosition(anchorAt);
    if (!presenting()) {
      o.camera.getWorldQuaternion(anchorTurn);
      follow = null;
      return;
    }
    o.camera.getWorldDirection(at);
    const head2 = { position: anchorAt.toArray(), yaw: Math.atan2(-at.x, -at.z) / DEG };
    follow = follow ? tagAlong(follow, head2, dt) : { ...head2, turning: false, moving: false };
    anchorAt.set(...follow.position);
    anchorTurn.setFromAxisAngle(UP, follow.yaw * DEG);
  };
  const pinFrom = (p) => {
    anchor(0);
    offset.copy(p.group.position).sub(anchorAt).applyQuaternion(anchorTurn.clone().invert());
    return cleanPin(offset.toArray());
  };
  const turnToFace = (p) => {
    const f = facing(p.group.position.toArray(), headV3());
    p.group.rotation.set(f.pitch * DEG, f.yaw * DEG, 0, "YXZ");
  };
  const close = (p) => {
    if (!live.delete(p.id)) return;
    p.release?.();
    p.video?.pause();
    if (p.video) p.video.src = "";
    if (p.blobUrl) URL.revokeObjectURL(p.blobUrl);
    root.remove(p.group);
    p.bar.removeFromParent();
    for (const mesh of [p.body, p.bar]) {
      mesh.geometry.dispose();
      const m = mesh.material;
      if (p.source.kind !== "custom" || mesh !== p.body) m.map?.dispose();
      m.dispose();
    }
    for (const b of p.buttons.values()) b.material.dispose();
    save();
    if (p.source.kind === "custom") p.source.onClose?.();
  };
  const flat = (texture, w = 1, h = 1) => new THREE12.Mesh(new THREE12.PlaneGeometry(w, h), new THREE12.MeshBasicMaterial({ map: texture, color: texture ? 16777215 : 659480, toneMapped: false }));
  const open = (content, opts = {}) => {
    const source = content.kind === "custom" ? content : cleanSource(content);
    if (!source) throw new Error("nswp-sdk: a panel needs something to show (a note with words, or a picture or video with an address).");
    if (live.size >= PANEL_LIMITS.count && !(opts.id && live.has(opts.id))) throw new Error(`nswp-sdk: ${PANEL_LIMITS.count} panels are open. Put one away first.`);
    const id = opts.id ?? newId();
    live.get(id)?.close();
    const group = new THREE12.Group();
    group.name = `panel:${id}`;
    const body = flat(null);
    body.name = `${id}:body`;
    const bar2 = flat(barTexture(source.title || (source.kind === "note" ? "Note" : source.kind === "picture" ? "Picture" : source.kind === "video" ? "Video" : ""), ink), 1, BAR);
    bar2.name = `${id}:bar`;
    const frame = new THREE12.Mesh(frameShape, metal);
    frame.name = "frame";
    frame.raycast = () => {
    };
    const buttons = /* @__PURE__ */ new Map();
    const button = (name, g) => {
      const mesh = flat(glyph(g), BUTTON, BUTTON);
      mesh.name = `${id}:${name}`;
      buttons.set(name, mesh);
      group.add(mesh);
    };
    button("close", "close");
    button("larger", "larger");
    button("smaller", "smaller");
    button("glass", "glass");
    button("pin", "pin");
    const dark = { value: 1 };
    seeThroughDark(body.material, dark);
    if (source.kind === "video") button("play", "play");
    group.add(frame, body, bar2);
    root.add(group);
    const p = {
      id,
      group,
      source,
      record: null,
      body,
      bar: bar2,
      buttons,
      video: null,
      aspect: 16 / 9,
      width: source.kind === "note" ? 0.8 : 1.1,
      ready: false,
      held: false,
      seeThrough: cleanLook(opts.look),
      dark,
      pinAt: null,
      get look() {
        return { ...p.seeThrough };
      },
      setLook(look) {
        p.seeThrough = cleanLook({ ...p.seeThrough, ...look });
        applyLook(p);
        save();
      },
      get pin() {
        return p.pinAt ? [...p.pinAt] : null;
      },
      setPinned(on) {
        p.pinAt = on ? pinFrom(p) : null;
        lit(p);
        save();
      },
      place() {
        const e = new THREE12.Euler().setFromQuaternion(group.quaternion, "YXZ");
        const round = (n) => Math.round(n * 1e3) / 1e3;
        return { position: group.position.toArray().map(round), yaw: round((e.y / DEG % 360 + 360) % 360), pitch: round(e.x / DEG), width: round(p.width) };
      },
      moveTo(place) {
        setPlace(p, place);
        save();
      },
      close: () => close(p)
    };
    live.set(id, p);
    const show = (texture, aspect) => {
      const material = body.material;
      material.map = texture;
      material.color.set(16777215);
      material.needsUpdate = true;
      p.aspect = Math.min(4, Math.max(0.25, aspect));
      p.ready = true;
      layout(p);
      applyLook(p);
    };
    if (source.kind === "note") {
      const drawn2 = noteTexture(source, ink);
      show(drawn2.texture, drawn2.aspect);
    } else if (source.kind === "custom") show(source.texture, source.aspect);
    else {
      void (async () => {
        let src = source.src;
        if (src.startsWith("kept:")) {
          const blob = await fileStore("readonly", (s) => s.get(src.slice(5)));
          if (!blob) return void (live.has(id) && p.close());
          if (!live.has(id)) return;
          src = p.blobUrl = URL.createObjectURL(blob);
        }
        if (source.kind === "picture") {
          const image = new Image();
          image.onload = () => {
            if (!live.has(id)) return;
            const texture = new THREE12.Texture(image);
            texture.colorSpace = THREE12.SRGBColorSpace;
            texture.needsUpdate = true;
            show(texture, image.naturalWidth / Math.max(1, image.naturalHeight));
          };
          image.src = src;
        } else {
          const video = document.createElement("video");
          video.playsInline = true;
          video.loop = true;
          video.preload = "metadata";
          p.video = video;
          video.addEventListener("loadedmetadata", () => {
            if (!live.has(id) || !video.videoWidth) return;
            const texture = new THREE12.VideoTexture(video);
            texture.colorSpace = THREE12.SRGBColorSpace;
            show(texture, video.videoWidth / video.videoHeight);
          });
          const mark = () => {
            const m = buttons.get("play")?.material;
            if (m) m.map = glyph(video.paused ? "play" : "pause");
            o.onChange?.();
          };
          video.addEventListener("play", mark);
          video.addEventListener("pause", mark);
          video.src = src;
        }
      })();
    }
    layout(p);
    const given = opts.place ? { ...opts.place } : {};
    if (!given.position) given.position = inFront(headV3(), o.camera.getWorldDirection(at).x === 0 && at.z === 0 ? 0 : Math.atan2(-at.x, -at.z) / DEG, live.size - 1);
    setPlace(p, given);
    if (given.yaw === void 0) turnToFace(p);
    if (o.input) {
      p.release = o.input.grabbable(bar2, {
        reach: 0.12,
        pull: false,
        onGrab: () => {
          p.held = true;
        },
        onRelease: () => {
          p.held = false;
          group.add(bar2);
          layout(p);
          turnToFace(p);
          if (p.pinAt) p.pinAt = pinFrom(p);
          save();
        }
      });
    }
    applyLook(p);
    p.pinAt = opts.pin ? cleanPin(opts.pin) : null;
    lit(p);
    if (opts.keep !== false && source.kind !== "custom" && !("src" in source && source.src.startsWith("blob:"))) p.record = { id, source, place: p.place() };
    save();
    return p;
  };
  const restored = (async () => {
    if (!o.keep) return;
    let kept2 = [];
    try {
      kept2 = cleanRecords(JSON.parse(localStorage.getItem(o.keep) ?? "[]"));
    } catch {
    }
    for (const r of kept2) {
      const place = cleanPlace(r.place);
      if (place) open(r.source, { id: r.id, place, ...r.look ? { look: r.look } : {}, ...r.pin ? { pin: r.pin } : {} });
    }
  })();
  const targets = () => [...live.values()].flatMap((p) => [p.body, ...p.held ? [] : [p.bar], ...p.buttons.values()]);
  let aimed = null;
  let pointed = null;
  let drag = null;
  const find = (hit) => {
    const cut = hit.lastIndexOf(":");
    const p = live.get(hit.slice(0, cut));
    return p ? [p, hit.slice(cut + 1)] : null;
  };
  const tint = (hit, on) => {
    const found = hit ? find(hit) : null;
    const mesh = found?.[0].buttons.get(found[1]);
    if (mesh) mesh.material.color.copy(on || found[1] === "pin" && found[0].pinAt ? accent : new THREE12.Color(16777215));
  };
  const lit = (p) => p.buttons.get("pin").material.color.copy(p.pinAt ? accent : new THREE12.Color(16777215));
  const api = {
    open,
    async openFile(file) {
      const kind = file.type.startsWith("image/") ? "picture" : file.type.startsWith("video/") ? "video" : null;
      if (!kind || file.size > PANEL_LIMITS.fileBytes) return null;
      const item = await library.add(file, file.name ?? "");
      if (item) return open({ kind, title: item.title, src: `kept:${item.id}` });
      return open({ kind, title: (file.name ?? "").replace(/\.[a-z0-9]+$/i, ""), src: URL.createObjectURL(file) }, { keep: false });
    },
    keyboard,
    library,
    pointOf: (hit) => hit.startsWith("kb:") ? keyboard.pointOf(hit) : hit.startsWith("lib:") ? library.pointOf(hit) : null,
    list: () => [...live.values()],
    get visible() {
      return root.visible;
    },
    set visible(v) {
      root.visible = v;
      if (!v) for (const p of live.values()) p.video?.pause();
      o.onChange?.();
    },
    pick(raycaster) {
      const above = keyboard.pick(raycaster) ?? library.pick(raycaster);
      if (above) return above;
      if (!root.visible) return null;
      const hit = raycaster.intersectObjects(targets(), false)[0];
      pointed = hit?.uv ? { name: hit.object.name, x: hit.uv.x, y: 1 - hit.uv.y } : null;
      return hit ? hit.object.name : null;
    },
    aim(hit) {
      keyboard.aim(hit);
      library.aim(hit);
      if (hit === aimed) return;
      tint(aimed, false);
      aimed = hit;
      tint(aimed, true);
    },
    press(hit) {
      if (hit.startsWith("kb:")) return keyboard.press(hit);
      if (hit.startsWith("lib:")) return library.press(hit);
      const found = find(hit);
      if (!found) return;
      const [p, part] = found;
      if (part === "close") return p.close();
      if (part === "larger" || part === "smaller") {
        p.moveTo({ width: p.width * (part === "larger" ? 1.25 : 0.8) });
        return;
      }
      if (part === "glass") return p.setLook(nextLook(p.seeThrough));
      if (part === "pin") return p.setPinned(!p.pinAt);
      if (part === "body" && p.source.kind === "custom") return p.source.onPress?.(pointed?.name === hit ? pointed.x : 0.5, pointed?.name === hit ? pointed.y : 0.5);
      if ((part === "play" || part === "body") && p.video) void (p.video.paused ? p.video.play().catch(() => {
      }) : Promise.resolve(p.video.pause()));
    },
    pointer(phase, raycaster) {
      if (phase === "down") {
        if (keyboard.pick(raycaster) ?? library.pick(raycaster)) return false;
        const hit = root.visible ? raycaster.intersectObjects(targets(), false)[0] : void 0;
        const found = hit ? find(hit.object.name) : null;
        if (!found || found[1] !== "bar") return false;
        drag = { p: found[0], far: hit.distance, moved: false };
        return true;
      }
      if (!drag) return false;
      if (phase === "move") {
        const p = drag.p;
        const down = (1 / p.aspect / 2 + GAP + BAR / 2) * p.width;
        raycaster.ray.at(drag.far, at);
        p.group.position.set(at.x, at.y - down, at.z);
        turnToFace(p);
        drag.moved = true;
        return true;
      }
      const moved = drag.moved;
      if (moved && drag.p.pinAt) drag.p.pinAt = pinFrom(drag.p);
      drag = null;
      if (moved) save();
      return moved;
    },
    update(t, dt = 1 / 60) {
      metal.tick(t);
      keyboard.update(t);
      library.update();
      if ([...live.values()].some((p) => p.pinAt)) {
        anchor(dt);
        for (const p of live.values()) {
          if (!p.pinAt || p.held || drag?.p === p) continue;
          offset.set(...p.pinAt).applyQuaternion(anchorTurn).add(anchorAt);
          p.group.position.copy(offset);
          turnToFace(p);
        }
      }
      for (const p of live.values()) {
        if (!p.held) continue;
        p.bar.getWorldPosition(at);
        const down = (1 / p.aspect / 2 + GAP + BAR / 2) * p.width;
        p.group.position.set(at.x, at.y - down, at.z);
        turnToFace(p);
      }
    },
    restored,
    info: () => [...live.values()].map((p) => ({
      id: p.id,
      kind: p.source.kind,
      title: p.source.title,
      place: p.place(),
      playing: p.video ? !p.video.paused : null,
      held: p.held,
      ready: p.ready,
      look: { ...p.seeThrough },
      pinned: !!p.pinAt
    })),
    dispose() {
      for (const p of live.values()) {
        p.release?.();
        p.video?.pause();
        if (p.blobUrl) URL.revokeObjectURL(p.blobUrl);
      }
      live.clear();
      keyboard.dispose();
      library.dispose();
      o.scene.remove(root);
      frameShape.dispose();
      metal.dispose();
      for (const g of glyphs.values()) g.dispose();
    }
  };
  return api;
}
function askForNote(done) {
  const dialog = document.createElement("dialog");
  dialog.setAttribute("aria-label", "Write a note");
  Object.assign(dialog.style, { width: "min(92vw, 520px)", padding: "20px", border: "1px solid #2a3a4a", borderRadius: "14px", background: "#0a1018", color: "#eef5fb", font: "16px/1.5 system-ui, sans-serif" });
  const field = (el, label) => {
    const wrap2 = document.createElement("label");
    wrap2.textContent = label;
    Object.assign(wrap2.style, { display: "grid", gap: "6px", marginBottom: "14px" });
    Object.assign(el.style, { font: "inherit", padding: "10px", color: "inherit", background: "#101a26", border: "1px solid #2a3a4a", borderRadius: "8px" });
    wrap2.append(el);
    return wrap2;
  };
  const title = document.createElement("input");
  title.maxLength = PANEL_LIMITS.titleChars;
  const text = document.createElement("textarea");
  text.rows = 7;
  text.maxLength = PANEL_LIMITS.noteChars;
  const row = document.createElement("div");
  Object.assign(row.style, { display: "flex", gap: "10px", justifyContent: "flex-end" });
  const button = (label, primary, act) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    Object.assign(b.style, { font: "inherit", fontWeight: primary ? "700" : "500", padding: "10px 18px", borderRadius: "8px", border: "1px solid #2a3a4a", background: primary ? "#eef5fb" : "none", color: primary ? "#04070b" : "inherit", cursor: "pointer" });
    b.addEventListener("click", act);
    return b;
  };
  const finish = (note) => {
    dialog.close();
    dialog.remove();
    done(note);
  };
  row.append(
    button("Cancel", false, () => finish(null)),
    button("Hang it", true, () => finish(text.value.trim() || title.value.trim() ? { title: title.value, text: text.value } : null))
  );
  dialog.addEventListener("cancel", () => finish(null));
  dialog.append(field(title, "A heading, if you want one"), field(text, "The note"), row);
  document.body.append(dialog);
  dialog.showModal();
  text.focus();
}
function addPanelControls(controls, panels, o) {
  const note = () => o.presenting() ? "Take a panel by its bar to move it. Write a note on the keyboard, or hang something from your pictures and video." : `Notes, pictures and video in frames you can hang anywhere. Drag one by its bar.${o.kept ? " They are kept in this browser and are here next visit." : ""} A panel can't show another website.`;
  controls.addSection({ id: "panels", label: "Panels", icon: "panel", note });
  const hang = (source) => {
    try {
      panels.open(source);
    } catch (err) {
      controls.say(err instanceof Error && /Put one away/.test(err.message) ? `${PANEL_LIMITS.count} panels are open. Put one away first.` : "That couldn't be hung.");
    }
  };
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = "image/*,video/*";
  picker.hidden = true;
  document.body.append(picker);
  picker.addEventListener("change", () => {
    const file = picker.files?.[0];
    picker.value = "";
    if (!file) return;
    void panels.openFile(file).then(
      (p) => controls.say(p ? "Hung in front of you." : file.size > PANEL_LIMITS.fileBytes ? "That file is too large to hang: 64 MB at most." : "Only pictures and videos can be hung."),
      () => controls.say(`${PANEL_LIMITS.count} panels are open. Put one away first.`)
    );
  });
  controls.add(
    {
      id: "panel-note",
      section: "panels",
      icon: "note",
      label: "Write a note",
      short: "Note",
      act: () => {
        if (o.presenting()) {
          void panels.keyboard.ask({ title: "A note. Done hangs it in front of you.", multiline: true, maxLength: PANEL_LIMITS.noteChars }).then((text) => {
            if (text?.trim()) hang({ kind: "note", title: "", text });
          });
        } else
          askForNote((n) => {
            if (n) hang({ kind: "note", ...n });
          });
      }
    },
    {
      id: "panel-library",
      section: "panels",
      icon: "panel",
      on: () => panels.library.showing,
      label: () => panels.library.showing ? "Put your pictures and video away" : "Your pictures and video",
      short: "Yours",
      act: () => {
        panels.library.showing = !panels.library.showing;
      }
    },
    // The device's own files: the browser shows those itself, as a flat window, so this is offered outside a headset.
    { id: "panel-file", section: "panels", icon: "panel", label: "Hang a picture or video from this device", short: "Hang", hidden: o.presenting, act: () => picker.click() },
    {
      id: "panel-hide",
      section: "panels",
      icon: "exit",
      hidden: () => panels.list().length === 0,
      on: () => !panels.visible,
      label: () => panels.visible ? "Hide your panels" : "Show your panels",
      short: "Hide",
      act: () => {
        panels.visible = !panels.visible;
      }
    }
  );
}

// packages/sdk/src/floor-mark.ts
import * as THREE13 from "three";
var MOST3 = 140;
var TURNS = 16;
function createFloorMarks(accent, opts = {}) {
  const y = opts.height ?? 0.02;
  const group = new THREE13.Group();
  group.name = "floor-marks";
  const paint = (opacity) => new THREE13.MeshBasicMaterial({ color: accent, transparent: true, opacity, depthTest: false, depthWrite: false });
  const flat = (o) => {
    o.rotation.x = -Math.PI / 2;
    o.renderOrder = 5;
    o.raycast = () => {
    };
    o.visible = false;
    group.add(o);
    return o;
  };
  const ring = flat(new THREE13.Mesh(new THREE13.RingGeometry(0.26, 0.34, 48), paint(0.85)));
  const dot = flat(new THREE13.Mesh(new THREE13.CircleGeometry(0.14, 28), paint(0.95)));
  const halo = flat(new THREE13.Mesh(new THREE13.RingGeometry(0.26, 0.3, 48), paint(0.7)));
  const line = flat(new THREE13.InstancedMesh(new THREE13.CircleGeometry(0.07, 14), paint(0.8), MOST3));
  line.rotation.x = 0;
  line.frustumCulled = false;
  const knots = flat(new THREE13.InstancedMesh(new THREE13.RingGeometry(0.1, 0.15, 24), paint(0.85), TURNS));
  knots.rotation.x = 0;
  knots.frustumCulled = false;
  const place = new THREE13.Matrix4();
  const lie = new THREE13.Quaternion().setFromEuler(new THREE13.Euler(-Math.PI / 2, 0, 0));
  const at = new THREE13.Vector3();
  const one = new THREE13.Vector3(1, 1, 1);
  let shown2 = { ring: null, dot: null, dots: 0, turns: 0 };
  return {
    group,
    update(o) {
      ring.visible = !!o.hover;
      if (o.hover) ring.position.set(o.hover[0], y, o.hover[1]);
      const way = o.path?.length ? o.path : o.to ? [o.to] : [];
      const end = way[way.length - 1] ?? null;
      dot.visible = !!end;
      halo.visible = !!end;
      let dots = 0;
      let turns = 0;
      if (end) {
        dot.position.set(end[0], y, end[1]);
        halo.position.copy(dot.position);
        const pulse = o.t * 0.9 % 1;
        halo.scale.setScalar(1 + pulse * 0.9);
        halo.material.opacity = 0.7 * (1 - pulse);
        let from = o.from;
        way.forEach((spot, leg) => {
          for (const [x, z] of dotsBetween(from[0], from[1], spot[0], spot[1], { most: MOST3 - dots, clear: leg === 0 ? 0.45 : 0.32, short: leg === way.length - 1 ? 0.3 : 0.32 })) {
            place.compose(at.set(x, y, z), lie, one);
            line.setMatrixAt(dots++, place);
          }
          if (leg < way.length - 1 && turns < TURNS) {
            place.compose(at.set(spot[0], y, spot[1]), lie, one);
            knots.setMatrixAt(turns++, place);
          }
          from = spot;
        });
        line.instanceMatrix.needsUpdate = true;
        knots.instanceMatrix.needsUpdate = true;
      }
      line.count = dots;
      line.visible = dots > 0;
      knots.count = turns;
      knots.visible = turns > 0;
      shown2 = { ring: o.hover ? [o.hover[0], o.hover[1]] : null, dot: end ? [end[0], end[1]] : null, dots, turns };
    },
    info: () => shown2,
    dispose() {
      for (const o of [ring, dot, halo, line, knots]) {
        o.geometry.dispose();
        o.material.dispose();
      }
      group.removeFromParent();
    }
  };
}

// packages/sdk/src/gate-size.ts
var PORTAL_WIDTH = 1.5;
var PORTAL_HEIGHT = 2.1;
var PORTAL_SPRING = PORTAL_HEIGHT - PORTAL_WIDTH / 2;
var PORTAL_SIGN_HEIGHT = PORTAL_HEIGHT + 0.72;
var DOOR_REACH = 3.05;

// packages/sdk/src/fps.ts
var LOOK_SPEED = 22e-4;
var PITCH_LIMIT = 85 * Math.PI / 180;
var SPRINT = RUN;
function lookAfter(yaw, pitch, dx, dy, speed = LOOK_SPEED) {
  const clean = (n) => Number.isFinite(n) ? n : 0;
  return { yaw: yaw - clean(dx) * speed, pitch: Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, pitch - clean(dy) * speed)) };
}
function strideOf(held, yaw, speed, dt, sprint = SPRINT) {
  const f = (held.forward ? 1 : 0) - (held.back ? 1 : 0);
  const s = (held.right ? 1 : 0) - (held.left ? 1 : 0);
  if (!f && !s) return [0, 0];
  const pace = speed * (held.sprint ? sprint : 1) * Math.max(0, dt) / Math.hypot(f, s);
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  return [(s * cos - f * sin) * pace, (-s * sin - f * cos) * pace];
}
function heldKey(code) {
  switch (code) {
    case "KeyW":
    case "ArrowUp":
      return "forward";
    case "KeyS":
    case "ArrowDown":
      return "back";
    case "KeyA":
    case "ArrowLeft":
      return "left";
    case "KeyD":
    case "ArrowRight":
      return "right";
    case "ShiftLeft":
    case "ShiftRight":
      return "sprint";
    default:
      return null;
  }
}
var DESK_KEY = "nswp:fps";
var DESK_WORDS = {
  intense: "Desk controls: intense",
  casual: "Desk controls: casual",
  nowIntense: "Intense: the mouse looks round. W, A, S, D walk, Shift runs, Space jumps, F uses what is in front of you, and Escape brings up this menu.",
  nowCasual: "Casual: click where you want to stand, twice to run there, and drag to look round. W, A, S, D walk, Shift runs and Space jumps."
};
var hasMouse = () => startingForm() === "desk";
function startsIntense(arrived, key = DESK_KEY) {
  if (!hasMouse()) return false;
  const prefers = arrivedSettings().intense;
  if (typeof prefers === "boolean") return prefers;
  try {
    return arrived || localStorage.getItem(key) === "1";
  } catch {
    return arrived;
  }
}
function keepIntense(on, key = DESK_KEY) {
  try {
    if (on) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
  }
}
function createFps(o) {
  const key = o.keep ?? DESK_KEY;
  const mouse = hasMouse();
  let enabled = startsIntense(o.arrived === true, key);
  if (mouse) {
    if (typeof arrivedSettings().intense === "boolean" || o.arrived) keepIntense(enabled, key);
    reportSettings("moving", () => ({ intense: enabled }));
  }
  const held = {};
  let pitch = 0;
  let weLetGo = false;
  let closedAt = -1;
  let shown2 = false;
  const looking = () => document.pointerLockElement === o.dom;
  const active = () => enabled && !o.presenting();
  const dot = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  dot.style.cssText = "position:fixed;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#fff;opacity:.75;box-shadow:0 0 0 1px rgba(0,0,0,.55);pointer-events:none;z-index:5;display:none";
  document.body.append(dot);
  const look = () => {
    if (!active() || o.hud?.open || looking()) return;
    try {
      const asked = o.dom.requestPointerLock();
      asked?.catch?.(() => {
      });
    } catch {
    }
  };
  const letGo = () => {
    if (!looking()) return;
    weLetGo = true;
    document.exitPointerLock();
  };
  const free = (e) => !looking() && !o.hud?.open && e.target === o.dom && e.buttons === 0;
  const onMove = (e) => {
    if (!active() || !(looking() || free(e))) return;
    const next = lookAfter(o.rig.rotation.y, pitch, e.movementX, e.movementY, LOOK_SPEED * lookScale());
    o.rig.rotation.y = next.yaw;
    pitch = next.pitch;
    o.camera.rotation.x = pitch;
  };
  const onDown = (e) => {
    if (!active() || e.button !== 0) return;
    if (looking()) o.onUse();
    else look();
  };
  const onLock = () => {
    if (looking()) return;
    for (const k of Object.keys(held)) held[k] = false;
    if (active() && !weLetGo && o.hud && !o.hud.open) o.hud.setOpen(true);
    weLetGo = false;
  };
  const typing = (e) => {
    const t = e.target;
    return !!t && (t.isContentEditable || t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
  };
  const onKey = (e) => {
    if (!active() || typing(e)) return;
    if (e.code === "Escape") {
      if (looking()) {
        letGo();
        o.hud?.setOpen(true);
      } else if (o.hud && !o.hud.open && performance.now() - closedAt > 80) o.hud.setOpen(true);
      return;
    }
    if (o.hud?.open) return;
    if (!looking() && !e.repeat) look();
    const which = heldKey(e.code);
    if (which) {
      held[which] = true;
      if (e.code.startsWith("Arrow")) e.preventDefault();
      return;
    }
    if (e.code === "KeyF" && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) o.onUse();
  };
  const onKeyUp = (e) => {
    const which = heldKey(e.code);
    if (which) held[which] = false;
  };
  const onBlur = () => {
    for (const k of Object.keys(held)) held[k] = false;
  };
  const onFullscreen = () => {
    const keyboard = navigator.keyboard;
    try {
      if (document.fullscreenElement && active()) void keyboard?.lock?.(["Escape"])?.catch?.(() => {
      });
      else keyboard?.unlock?.();
    } catch {
    }
  };
  o.dom.addEventListener("mousedown", onDown);
  document.addEventListener("mousemove", onMove);
  document.addEventListener("pointerlockchange", onLock);
  document.addEventListener("fullscreenchange", onFullscreen);
  addEventListener("keydown", onKey);
  addEventListener("keyup", onKeyUp);
  addEventListener("blur", onBlur);
  const stopSignals = o.controls.onSignal((name) => {
    if (name === "menuOpen") letGo();
    if (name === "menuClose") {
      closedAt = performance.now();
      setTimeout(look, 0);
    }
  });
  const setEnabled = (on) => {
    const next = on && mouse;
    if (next === enabled) return;
    enabled = next;
    keepIntense(enabled, key);
    if (!enabled) {
      letGo();
      pitch = 0;
      o.camera.rotation.x = 0;
      onBlur();
      dot.style.display = "none";
      o.dom.style.cursor = "";
    }
    onFullscreen();
  };
  o.controls.add({
    id: "fps",
    section: "moving",
    icon: "step",
    on: () => enabled,
    // No mouse, no mouse look. And not in a headset, where it has no meaning.
    hidden: () => !mouse || o.presenting(),
    label: () => enabled ? DESK_WORDS.intense : DESK_WORDS.casual,
    act: () => {
      setEnabled(!enabled);
      o.controls.say(enabled ? DESK_WORDS.nowIntense : DESK_WORDS.nowCasual);
    }
  });
  const at = o.camera.position.clone();
  return {
    get enabled() {
      return enabled;
    },
    setEnabled,
    get looking() {
      return looking();
    },
    update(dt) {
      if (!active()) {
        if (looking()) letGo();
        if (shown2) {
          shown2 = false;
          dot.style.display = "none";
          o.dom.style.cursor = "";
        }
        return false;
      }
      const aiming = !o.hud?.open;
      if (aiming !== shown2) {
        shown2 = aiming;
        dot.style.display = aiming ? "block" : "none";
      }
      o.dom.style.cursor = aiming ? "none" : "";
      if (o.hud?.open) return true;
      const [dx, dz] = strideOf(held, o.rig.rotation.y, o.speed ?? 2.4, dt);
      if (!dx && !dz) return true;
      o.camera.getWorldPosition(at);
      if (o.canStand(at.x + dx, at.z + dz)) {
        o.rig.position.x += dx;
        o.rig.position.z += dz;
      } else if (o.canStand(at.x + dx, at.z)) o.rig.position.x += dx;
      else if (o.canStand(at.x, at.z + dz)) o.rig.position.z += dz;
      else o.onBlocked?.();
      return true;
    },
    dispose() {
      letGo();
      dot.remove();
      stopSignals();
      o.controls.remove("fps");
      o.dom.removeEventListener("mousedown", onDown);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerlockchange", onLock);
      document.removeEventListener("fullscreenchange", onFullscreen);
      removeEventListener("keydown", onKey);
      removeEventListener("keyup", onKeyUp);
      removeEventListener("blur", onBlur);
    }
  };
}

// packages/sdk/src/jump.ts
var JUMP_HEIGHT = 0.45;
var JUMP_GRAVITY = 9.8;
var JUMP_SPEED = Math.sqrt(2 * JUMP_GRAVITY * JUMP_HEIGHT);
function createJump(o = {}) {
  let height = 0;
  let since = 0;
  let airborne = false;
  return {
    jump() {
      if (airborne) return false;
      airborne = true;
      since = 0;
      o.onJump?.();
      return true;
    },
    update(dt) {
      if (!airborne) return 0;
      since += Math.min(Math.max(dt, 0), 0.25);
      height = JUMP_SPEED * since - 0.5 * JUMP_GRAVITY * since * since;
      if (height <= 0) {
        height = 0;
        airborne = false;
        o.onLand?.();
      }
      return height;
    },
    get height() {
      return height;
    },
    get airborne() {
      return airborne;
    },
    land() {
      height = 0;
      airborne = false;
    },
    dispose() {
    }
  };
}
function addJump(controls, o) {
  const jump = createJump({ onJump: () => o.sounds?.play("step"), onLand: () => o.sounds?.play("land") });
  const typing = (e) => {
    const t = e.composedPath?.()[0] ?? e.target;
    return !!t && (t.isContentEditable || t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
  };
  const claimed = () => {
    const keys = controls.view().keys;
    return keys.menu === null && !keys.hotbar;
  };
  const ours = (e) => e.code === "Space" && !e.ctrlKey && !e.metaKey && !e.altKey && !typing(e) && !o.hud?.open && !o.presenting() && !o.busy?.() && !claimed();
  const onKey = (e) => {
    if (!ours(e)) return;
    e.preventDefault();
    const active = document.activeElement;
    if (active && active !== document.body && (active.tagName === "BUTTON" || active.shadowRoot)) active.blur();
    if (!e.repeat) jump.jump();
  };
  const onKeyUp = (e) => {
    if (ours(e)) e.preventDefault();
  };
  addEventListener("keydown", onKey);
  addEventListener("keyup", onKeyUp);
  controls.add({
    id: "jump",
    section: "moving",
    icon: "step",
    label: "Jump",
    short: "Jump",
    // With a keyboard it is Space. Without one, it is kept at hand.
    hotbar: !hasMouse(),
    hidden: () => o.presenting(),
    act: () => void jump.jump()
  });
  const dispose = jump.dispose;
  jump.dispose = () => {
    dispose();
    removeEventListener("keydown", onKey);
    removeEventListener("keyup", onKeyUp);
    controls.remove("jump");
  };
  return jump;
}

// packages/sdk/src/sign.ts
function viewScale(metres, opts) {
  const least = opts.least ?? 0.15;
  const most = opts.most ?? 1.5;
  if (!(metres >= 0) || !(opts.at > 0)) return 1;
  return Math.min(most, Math.max(least, metres / opts.at));
}

// packages/sdk/src/scores.ts
import { cleanBoard, cleanScore, DEFAULT_RELAYS as DEFAULT_RELAYS6, publishEvent as publishEvent4, queryRelays as queryRelays6, rankScores, readRelayList as readRelayList4, RELAY_LIST_KIND as RELAY_LIST_KIND4, SCORE_KIND, scoreWords, worldCoordinate } from "@nswp/core";
function createScores(opts) {
  const world = worldCoordinate(opts.world);
  const now = opts.now ?? (() => Date.now());
  const query = opts.query ?? queryRelays6;
  const publish = opts.publish ?? publishEvent4;
  const usual = () => opts.relays ?? DEFAULT_RELAYS6;
  const boards = opts.boards.filter((b) => cleanBoard(b.id));
  const boardOf = (id) => boards.find((b) => b.id === id) ?? null;
  const better = (b, a, than) => than === null || (b.order === "low" ? a < than : a > than);
  const store = (() => {
    if (opts.storage !== void 0) return opts.storage;
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  })();
  const watchers3 = /* @__PURE__ */ new Set();
  const changed = () => {
    for (const fn of watchers3) fn();
  };
  const keyFor = (who) => `nswp:scores:${world}:${who ?? "guest"}`;
  const read = (who) => {
    try {
      const kept2 = JSON.parse(store?.getItem(keyFor(who)) ?? "{}");
      return kept2 && typeof kept2 === "object" && !Array.isArray(kept2) ? kept2 : {};
    } catch {
      return {};
    }
  };
  const write = (who, kept2) => {
    try {
      store?.setItem(keyFor(who), JSON.stringify(kept2));
    } catch {
    }
  };
  const held = /* @__PURE__ */ new Map();
  const of = (who) => {
    const k = keyFor(who);
    if (!held.has(k)) held.set(k, read(who));
    return held.get(k);
  };
  const best = (id) => {
    const b = boardOf(id);
    if (!b) return null;
    const mine = cleanScore(of(opts.hand.pubkey())[id]?.best);
    const guest = opts.hand.pubkey() ? cleanScore(of(null)[id]?.best) : null;
    if (mine === null) return guest;
    return guest !== null && better(b, guest, mine) ? guest : mine;
  };
  let relaysKept = null;
  const ownRelays = (key) => {
    if (relaysKept && relaysKept.key === key && now() - relaysKept.at < 6e5) return relaysKept.found;
    const found = askWell({ kinds: [RELAY_LIST_KIND4], authors: [key], limit: 4 }, { own: [], usual: usual(), query, timeoutMs: 2500, now }).then((got) => readRelayList4(got.events, key)?.write ?? []).catch(() => []);
    relaysKept = { key, at: now(), found };
    return found;
  };
  let events = [];
  let asked = 0;
  let answered = false;
  const fetchAll = async (fresh) => {
    if (!fresh && asked && now() - asked < 6e4) return;
    asked = now();
    const got = await askWell({ kinds: [SCORE_KIND], "#a": [world], limit: 500 }, { own: [], usual: usual(), query, timeoutMs: 4e3, now }).catch(() => null);
    answered = !!got && Object.values(got.relays).some((said) => said === "eose");
    const byId = new Map([...events, ...got?.events ?? []].map((e) => [e.id, e]));
    events = [...byId.values()];
  };
  return {
    boards,
    best,
    posted: (id) => cleanScore(of(opts.hand.pubkey())[id]?.posted),
    record(id, score) {
      const b = boardOf(id);
      const made = cleanScore(score);
      if (!world || !b || made === null || !better(b, made, best(id))) return false;
      const who = opts.hand.pubkey();
      const kept2 = of(who);
      kept2[id] = { ...kept2[id], best: made };
      write(who, kept2);
      changed();
      return true;
    },
    async post(id) {
      const b = boardOf(id);
      const who = opts.hand.pubkey();
      if (!world || !b) return { ok: false, said: "This world has no such board." };
      if (!who) return { ok: false, said: "Sign in here to post a score: it is under You." };
      const mine = best(id);
      if (mine === null) return { ok: false, said: "You have no score here yet." };
      const kept2 = of(who);
      const had = cleanScore(kept2[id]?.posted);
      if (had !== null && !better(b, mine, had)) return { ok: true, said: `Your best, ${scoreWords(b, mine)}, is already on the board.` };
      const signed = await opts.hand.sign(world, id, mine, { title: b.title, format: b.format }).catch(() => null);
      if (!signed) return { ok: false, said: "It couldn't be signed, so nothing was posted. Your best is still kept on this device." };
      const sent = await sendWell(signed, { own: await ownRelays(who), usual: usual(), publish, query, now }).catch(() => null);
      if (!sent || sent.took === 0) return { ok: false, said: "No relay took it. Your best is still kept on this device: try again in a moment." };
      kept2[id] = { best: mine, posted: mine };
      write(who, kept2);
      events = [...events.filter((e) => e.id !== signed.id), signed];
      changed();
      return { ok: true, said: `${scoreWords(b, mine)} is on the board, as yours. Anyone can see it.` };
    },
    async standings(id, fresh = false) {
      const b = boardOf(id);
      if (!world || !b) return null;
      await fetchAll(fresh);
      if (!answered && events.length === 0) return null;
      return rankScores(events, { world, board: id, order: b.order, worldUrl: opts.worldUrl, counted: opts.counted?.() ?? [], me: opts.hand.pubkey() });
    },
    standingOf(id, pubkey) {
      const b = boardOf(id);
      if (!world || !b || events.length === 0) return null;
      const ranked = rankScores(events, { world, board: id, order: b.order, worldUrl: opts.worldUrl, me: pubkey });
      return ranked.mine ? { score: ranked.mine.score, rank: ranked.mine.rank, of: ranked.count } : null;
    },
    words: (id, score) => {
      const b = boardOf(id);
      return b ? scoreWords(b, score) : String(score);
    },
    onChange(fn) {
      watchers3.add(fn);
      return () => void watchers3.delete(fn);
    }
  };
}

// packages/sdk/src/scoring.ts
import { shortNpub as shortNpub5 } from "@nswp/core";
function addScoreControls(controls, opts) {
  const { scores } = opts;
  let shown2 = [];
  const read = /* @__PURE__ */ new Map();
  const looking = /* @__PURE__ */ new Set();
  const nameOf = (pubkey) => opts.profiles?.get(pubkey)?.name || shortNpub5(pubkey);
  const look = (board, fresh = false) => {
    if (looking.has(board)) return;
    looking.add(board);
    void scores.standings(board, fresh).catch(() => null).then((got) => {
      looking.delete(board);
      read.set(board, got);
      const people = [...got?.known ?? [], ...got?.others ?? []].map((s) => s.by);
      if (people.length) void opts.profiles?.fetch(people);
      refresh();
    });
  };
  const refresh = () => {
    for (const id of shown2) controls.remove(id);
    shown2 = [];
    if (scores.boards.length === 0) return;
    const add = (...actions) => {
      for (const a of actions) shown2.push(a.id);
      controls.add(...actions.map((a) => ({ section: "scores", ...a })));
    };
    controls.addSection({
      id: "scores",
      label: "Scores",
      icon: "list",
      note: () => "A score here is what someone says they made: nothing checks it. People you follow are listed first. Posting yours says publicly that you were here, and how you did."
    });
    for (const b of scores.boards) {
      const best = scores.best(b.id);
      const posted = scores.posted(b.id);
      const many = scores.boards.length > 1 ? `${b.title}: ` : "";
      add({
        id: `scores-post-${b.id}`,
        icon: "check",
        tone: best !== null && best !== posted ? "primary" : "normal",
        label: () => best === null ? `${many}No score of yours yet` : !opts.signedIn() ? `${many}Your best: ${scores.words(b.id, best)}. Sign in to post it` : best === posted ? `${many}Your best, ${scores.words(b.id, best)}, is on the board` : `${many}Post my best to the board: ${scores.words(b.id, best)}`,
        short: "Post",
        act: async () => {
          if (best === null) return controls.say("Make a score first: it is kept on this device until you post it.");
          const done = await scores.post(b.id);
          controls.say(done.said);
          if (done.ok) look(b.id, true);
          refresh();
        }
      });
      const got = read.get(b.id);
      if (got === void 0) {
        look(b.id);
        continue;
      }
      add({ id: `scores-look-${b.id}`, icon: "turn", label: got === null ? `${many}The board couldn't be reached. Look again` : `${many}Look again`, short: "Look", act: () => look(b.id, true) });
      if (!got) continue;
      const row = (s) => ({
        // A row each, in order: a board is read from the top down, and who is known is told from who isn't by
        // where they stand in it.
        id: `scores-${b.id}-${s.by.slice(0, 16)}`,
        icon: "you",
        label: () => `${s.rank}. ${nameOf(s.by)}: ${scores.words(b.id, s.score)}`,
        act: () => opts.choose ? opts.choose(s.by) : controls.say(`${nameOf(s.by)}: ${scores.words(b.id, s.score)}, as they say.`)
      });
      add(...got.known.map(row));
      if (got.others.length) {
        add({ id: `scores-others-${b.id}`, icon: "people", label: `${many}${got.known.length ? "Everyone else" : "Everyone"} (${got.count - got.known.length})`, act: () => controls.say("These are people you don't follow. A score is only what its owner says it is.") });
        add(...got.others.map(row));
      }
    }
  };
  let drawing = false;
  const soon2 = () => {
    if (drawing) return;
    drawing = true;
    queueMicrotask(() => {
      drawing = false;
      refresh();
    });
  };
  scores.onChange(soon2);
  opts.profiles?.onChange(soon2);
  refresh();
  return { refresh };
}

// packages/sdk/src/bag.ts
import { BAG_KIND, bagIn, changeBag, DEFAULT_RELAYS as DEFAULT_RELAYS7, itemCoordinate as itemCoordinate2, newestBag, publishEvent as publishEvent5, queryRelays as queryRelays7, readRelayList as readRelayList5, RELAY_LIST_KIND as RELAY_LIST_KIND5, SITE_MARKS, verifyEvent as verifyEvent6 } from "@nswp/core";
var FRESH_MS4 = 6e4;
function createBag(opts) {
  const now = opts.now ?? (() => Date.now());
  const query = opts.query ?? queryRelays7;
  const publish = opts.publish ?? publishEvent5;
  const usual = () => opts.relays ?? DEFAULT_RELAYS7;
  const store = (() => {
    if (opts.storage !== void 0) return opts.storage;
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  })();
  const watchers3 = /* @__PURE__ */ new Set();
  const changed = () => {
    for (const fn of watchers3) fn();
  };
  const keyFor = (who) => `nswp:bag:${who}`;
  const readKept = (who) => {
    try {
      const kept2 = JSON.parse(store?.getItem(keyFor(who)) ?? "null");
      return verifyEvent6(kept2) && kept2.kind === BAG_KIND && kept2.pubkey === who ? kept2 : null;
    } catch {
      return null;
    }
  };
  const keep3 = (bag) => {
    try {
      store?.setItem(keyFor(bag.pubkey), JSON.stringify(bag));
    } catch {
    }
  };
  let relaysKept = null;
  const ownRelays = (key) => {
    if (relaysKept && relaysKept.key === key && now() - relaysKept.at < 6e5) return relaysKept.found;
    const found = askWell({ kinds: [RELAY_LIST_KIND5], authors: [key], limit: 4 }, { own: [], usual: usual(), query, timeoutMs: 2500, now }).then((got) => readRelayList5(got.events, key)?.write ?? []).catch(() => []);
    relaysKept = { key, at: now(), found };
    return found;
  };
  let known = null;
  let looking = null;
  let offered = null;
  const look = async (who) => {
    const kept2 = readKept(who);
    const own = await ownRelays(who);
    const got = await askWell({ kinds: [BAG_KIND], authors: [who], limit: 4 }, { own, usual: usual(), query, timeoutMs: 4e3, now }).catch(() => null);
    const answered = !!got && Object.values(got.relays).some((said) => said === "eose");
    const found = newestBag((got?.events ?? []).filter((e) => verifyEvent6(e)), who);
    const bag = found && kept2 ? kept2.created_at > found.created_at ? kept2 : found : found ?? kept2;
    if (kept2 && bag === kept2 && answered && (!found || found.id !== kept2.id)) void sendWell(kept2, { own, usual: usual(), publish, query, now }).catch(() => null);
    if (bag && bag !== kept2) keep3(bag);
    if (opts.me() !== who) return;
    known = { who, bag, answered, at: now() };
    changed();
  };
  const load2 = async (fresh = false) => {
    const who = opts.me();
    if (!who) {
      if (known) {
        known = null;
        changed();
      }
      return null;
    }
    if (known && known.who !== who) known = null;
    if (!fresh && known && now() - known.at < FRESH_MS4) return bagIn(known.bag);
    looking ??= look(who).finally(() => {
      looking = null;
    });
    await looking;
    return known && known.who === who ? bagIn(known.bag) : null;
  };
  const change2 = async (itemIn2, adding, title) => {
    const who = opts.me();
    const it = title || "It";
    const item = itemCoordinate2(itemIn2);
    if (!who) return { ok: false, why: "signed-out", said: "Sign in to keep a bag." };
    if (!opts.hand) return { ok: false, why: "read-only", said: "Your bag is changed at your home, not from here." };
    if (!item) return { ok: false, why: "refused", said: "That isn't an item." };
    if (!opts.hand.ready()) return { ok: false, why: "not-allowed", said: "This place hasn't been let change your bag." };
    await load2(true);
    const at = known && known.who === who ? known : null;
    if (!at) return { ok: false, why: "unreachable", said: "Your bag couldn't be looked for. Nothing was changed." };
    if (!at.bag) {
      if (!at.answered) return { ok: false, why: "unreachable", said: "No relay could be reached to find your bag, so nothing was changed. Try again in a moment." };
      if (!adding) return { ok: false, why: "already", said: `${it} isn't in your bag.` };
      if (!offered || offered.item !== item || now() - offered.at > 12e4) {
        offered = { item, at: now() };
        return { ok: false, why: "no-bag", said: "No bag of yours was found. If you have none yet, press again to start one." };
      }
    }
    offered = null;
    const has = bagIn(at.bag).includes(item);
    if (adding === has) return { ok: true, why: "already", said: adding ? `${it} is already in your bag.` : `${it} isn't in your bag.` };
    const made = changeBag(at.bag, { ...adding ? { add: item } : { remove: item }, now: now() / 1e3, fromNothing: at.bag === null });
    const signed = made ? await opts.hand.sign(made).catch(() => null) : null;
    const same = signed && verifyEvent6(signed) && signed.pubkey === who && signed.kind === BAG_KIND && JSON.stringify(signed.tags.filter((t) => !SITE_MARKS.includes(t[0] ?? ""))) === JSON.stringify(made.tags);
    if (!signed || !same) return { ok: false, why: "refused", said: "It couldn't be signed. Your bag is as it was." };
    keep3(signed);
    known = { who, bag: signed, answered: true, at: now() };
    changed();
    const sent = await sendWell(signed, { own: await ownRelays(who), usual: usual(), publish, query, now }).catch(() => null);
    if (!sent || sent.took === 0) return { ok: false, why: "not-sent", said: "Signed, but no relay took it. It is kept on this device and will be sent again." };
    return { ok: true, said: adding ? `${it} is in your bag. Anyone can see what is in it.` : `${it} is out of your bag.` };
  };
  return {
    items: () => known && known.who === opts.me() ? bagIn(known.bag) : null,
    load: load2,
    canChange: () => !!opts.hand,
    add: (item, title = "") => change2(item, true, title),
    remove: (item, title = "") => change2(item, false, title),
    onChange(fn) {
      watchers3.add(fn);
      return () => void watchers3.delete(fn);
    }
  };
}

// packages/sdk/src/bagging.ts
import { decodeNaddr, ITEM_KIND as ITEM_KIND2, itemCoordinate as itemCoordinate3 } from "@nswp/core";
var PAGE2 = 24;
function itemIn(text) {
  if (typeof text !== "string") return "";
  const plain = itemCoordinate3(/37303:[0-9a-f]{64}:[a-z0-9][a-z0-9-]{0,63}/.exec(text)?.[0]);
  if (plain) return plain;
  const address = /naddr1[02-9ac-hj-np-z]{20,400}/.exec(text)?.[0];
  if (!address) return "";
  try {
    const to = decodeNaddr(address);
    return to.kind === ITEM_KIND2 ? itemCoordinate3(`${ITEM_KIND2}:${to.pubkey}:${to.identifier}`) : "";
  } catch {
    return "";
  }
}
function addBagControls(controls, opts) {
  const { bag, items } = opts;
  let shown2 = [];
  let chosen = null;
  let pages = 1;
  let wasMe = null;
  let looked = false;
  const say = (text) => controls.say(text);
  const titleOf = (item) => items.known(item)?.title ?? item.split(":")[2] ?? "an item";
  const change2 = (item, adding) => {
    const now = async () => {
      const done = await (adding ? bag.add(item, titleOf(item)) : bag.remove(item, titleOf(item)));
      say(done.said);
      refresh();
    };
    if (!bag.canChange()) return say("Your bag is changed at your home, not from here.");
    if (opts.allowed && !opts.allowed() && opts.ask) return say(opts.ask(() => void now()));
    void now();
  };
  const fromCopy = async () => {
    let text = "";
    const keyboard = opts.presenting?.() ? opts.keyboard?.() ?? null : null;
    if (keyboard) text = await keyboard.ask({ title: "The item's address: naddr1\u2026 Paste it, or type it.", maxLength: 420 }).catch(() => null) ?? "";
    else {
      try {
        text = await (opts.copied ? opts.copied() : navigator.clipboard.readText());
      } catch {
        return say("What you copied couldn't be read here. Copy an item's address, allow this site to read what you copy, and press again.");
      }
    }
    const item = itemIn(text);
    if (!item) return say("That isn't an item's address. Copy one from the place that keeps the item, and press again.");
    const described = await items.describe(item);
    if (!described) return say("No description of that item could be found, so it wasn't put in your bag.");
    chosen = item;
    change2(item, true);
  };
  const refresh = () => {
    for (const id of shown2) controls.remove(id);
    shown2 = [];
    const me = opts.me();
    if (me !== wasMe) {
      wasMe = me;
      chosen = null;
      pages = 1;
      looked = false;
    }
    const has = me ? bag.items() : null;
    const rule = opts.rule();
    const offers = () => has && bag.canChange() ? [...new Set((opts.offered?.() ?? []).map((i) => itemCoordinate3(i)).filter((i) => i && !has.includes(i)))].slice(0, 12) : [];
    const add = (...actions) => {
      for (const a of actions) shown2.push(a.id);
      controls.add(...actions.map((a) => ({ section: "bag", ...a })));
    };
    controls.addSection({
      id: "bag",
      label: "Bag",
      icon: "save",
      note: () => {
        const here = rule === "play" ? "Items are part of play here: what people hold can reach you." : rule === "allowed" ? "Items work here." : "Nothing carried is drawn or works in this place.";
        if (!me) return "Sign in to keep a bag.";
        if (has === null) return looked ? "Your bag couldn't be looked for just now." : "Looking for your bag.";
        if (has.length === 0) return `Your bag is empty. ${bag.canChange() ? offers().length ? "Take one of the things offered here, or put an item in by its address." : "Put an item in by its address: copy it from the place that keeps the item." : "Things are put in it at your home."} ${here}`;
        return `${has.length === 1 ? "1 thing" : `${has.length} things`} in your bag. Anyone can see what is in it. ${here}`;
      },
      card: () => {
        const item = chosen ? items.known(chosen) : null;
        if (!item) return null;
        return { title: item.title, tag: opts.holding() === item.id ? "In your hand" : has?.includes(item.id) ? "In your bag" : "Offered here", proven: false, sub: `Made by ${item.maker.slice(0, 8)}\u2026`, copy: item.id, text: item.summary, picture: "", color: "", now: [] };
      }
    });
    if (!me) return;
    add({
      id: "bag-items",
      icon: "check",
      on: () => showsItems(),
      label: () => showsItems() ? "Items: on" : "Items: off. Nothing of anyone's is fetched, drawn or run",
      short: "Items",
      act: () => {
        setShowsItems(!showsItems());
        if (!showsItems() && opts.holding()) void opts.hold("");
        say(showsItems() ? "Items are drawn, here and in the next world that allows them." : "No item is fetched, drawn or run for you, here or in the next world.");
        refresh();
      }
    });
    if (has === null) {
      if (!looked) {
        looked = true;
        void bag.load().then(refresh);
      } else
        add({
          id: "bag-again",
          icon: "turn",
          label: "Look again",
          act: () => {
            looked = false;
            refresh();
          }
        });
      return;
    }
    add({ id: "bag-look", icon: "turn", label: "Look again", short: "Look", act: () => void bag.load(true).then(refresh) });
    if (bag.canChange()) add({ id: "bag-add", icon: "save", label: () => opts.presenting?.() && opts.keyboard?.() ? "Put in an item by its address" : "Put in the item I copied", short: "Add", act: () => void fromCopy() });
    if (opts.holding()) add({ id: "bag-away", icon: "close", label: `Put ${titleOf(opts.holding())} away`, short: "Away", act: async () => say((await opts.hold("")).said) });
    if (chosen && has.includes(chosen)) {
      const item = chosen;
      if (opts.holding() !== item && rule !== "none" && showsItems()) {
        add({
          id: "bag-hold",
          icon: "check",
          tone: "primary",
          label: `Hold ${titleOf(item)}`,
          act: async () => {
            say((await opts.hold(item)).said);
            refresh();
          }
        });
      }
      if (bag.canChange()) add({ id: "bag-remove", icon: "close", label: `Take ${titleOf(item)} out of my bag`, act: () => change2(item, false) });
    } else if (chosen && offers().includes(chosen)) {
      const item = chosen;
      add({ id: "bag-take", icon: "save", tone: "primary", label: `Put ${titleOf(item)} in my bag`, act: () => change2(item, true) });
    }
    const listed = has.slice(0, pages * PAGE2);
    for (const item of listed) if (!items.known(item)) void items.describe(item).then((found) => found && soon2());
    add(
      ...listed.map(
        (item) => ({
          id: `bag-${item.split(":")[1].slice(0, 8)}-${item.split(":")[2]}`.slice(0, 60),
          icon: "save",
          on: () => chosen === item,
          label: () => `${titleOf(item)}${opts.holding() === item ? ", in your hand" : ""}`,
          act: () => {
            chosen = chosen === item ? null : item;
            refresh();
          }
        })
      )
    );
    const offered = offers();
    for (const item of offered) if (!items.known(item)) void items.describe(item).then((found) => found && soon2());
    add(
      ...offered.map(
        (item) => ({
          id: `bag-offer-${item.split(":")[1].slice(0, 8)}-${item.split(":")[2]}`.slice(0, 60),
          icon: "save",
          on: () => chosen === item,
          label: () => `${titleOf(item)}, offered here`,
          act: () => {
            chosen = chosen === item ? null : item;
            refresh();
          }
        })
      )
    );
    if (has.length > listed.length) {
      add({
        id: "bag-more",
        icon: "list",
        label: `Show more (${listed.length} of ${has.length})`,
        act: () => {
          pages++;
          refresh();
        }
      });
    }
  };
  let drawing = false;
  const soon2 = () => {
    if (drawing) return;
    drawing = true;
    queueMicrotask(() => {
      drawing = false;
      refresh();
    });
  };
  bag.onChange(soon2);
  onItemsChange(soon2);
  refresh();
  return { refresh };
}

// packages/sdk/src/item-controls.ts
function addItemControls(controls, o) {
  let shown2 = "";
  const does = () => o.play()?.does ?? null;
  const refresh = () => {
    const now = does();
    const key = now ? `${now.use}|${now.second}` : "";
    if (key === shown2) return;
    shown2 = key;
    controls.remove("item-use");
    controls.remove("item-second");
    if (!now) return;
    if (now.use) controls.add({ id: "item-use", section: "bag", icon: "check", tone: "primary", hotbar: true, lead: true, label: now.use, short: now.use, act: () => o.play()?.use() });
    if (now.second) controls.add({ id: "item-second", section: "bag", icon: "turn", hotbar: true, lead: true, label: now.second, short: now.second, act: () => o.play()?.second() });
  };
  const typing = (e) => {
    const at = e.target;
    return !!at && (at.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(at.tagName ?? ""));
  };
  const onDown = (e) => {
    if (e.button === 0 && document.pointerLockElement && does()?.use) o.play()?.use();
  };
  const onKey = (e) => {
    if (e.code === "KeyR" && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && !typing(e) && does()?.second) o.play()?.second();
  };
  o.dom?.addEventListener("mousedown", onDown);
  if (typeof addEventListener === "function") addEventListener("keydown", onKey);
  refresh();
  return {
    refresh,
    trigger(hand) {
      if (hand < 0 || hand !== o.holdingHand() || !does()?.use) return false;
      o.play()?.use();
      return true;
    },
    dispose() {
      o.dom?.removeEventListener("mousedown", onDown);
      if (typeof removeEventListener === "function") removeEventListener("keydown", onKey);
      controls.remove("item-use");
      controls.remove("item-second");
    }
  };
}

// packages/sdk/src/door-ratings.ts
import { DEFAULT_RELAYS as DEFAULT_RELAYS8, queryRelays as queryRelays8, RATING_KIND, tallyMark, tallyRatings, worldCoordinate as worldCoordinate2 } from "@nswp/core";
var FRESH_MS5 = 5 * 6e4;
function createDoorRatings(opts) {
  const now = opts.now ?? (() => Date.now());
  const query = opts.query ?? queryRelays8;
  const doors = new Map(opts.doors.map((d) => [worldCoordinate2(d.world), d.url]).filter(([world]) => world));
  const watchers3 = /* @__PURE__ */ new Set();
  let events = [];
  let asked = 0;
  let askedFor = null;
  const tally = (worldIn) => {
    const world = worldCoordinate2(worldIn);
    const me = opts.me();
    const url = doors.get(world);
    if (!me || !url || events.length === 0) return null;
    const got = tallyRatings(events, { world, counted: opts.counted() ?? [], me, worldUrl: url });
    return got.count ? got : null;
  };
  return {
    async load(fresh = false) {
      const me = opts.me();
      if (!me || doors.size === 0) {
        if (events.length || askedFor) {
          events = [];
          askedFor = null;
          asked = 0;
          for (const fn of watchers3) fn();
        }
        return;
      }
      if (!fresh && askedFor === me && now() - asked < FRESH_MS5) return;
      asked = now();
      askedFor = me;
      const got = await askWell({ kinds: [RATING_KIND], "#a": [...doors.keys()], limit: 500 }, { own: [], usual: opts.relays ?? DEFAULT_RELAYS8, query, timeoutMs: 4e3, now }).catch(() => null);
      if (opts.me() !== me) return;
      const byId = new Map((got?.events ?? []).filter((e) => e.kind === RATING_KIND).map((e) => [e.id, e]));
      events = [...byId.values()];
      for (const fn of watchers3) fn();
    },
    tally,
    mark: (world) => tallyMark(tally(world)),
    words(world) {
      const t = tally(world);
      if (!t) return "";
      const others = t.count - (t.mine ? 1 : 0);
      const stars = `${t.average.toFixed(1)} of 5`;
      if (t.mine && others === 0) return `You gave it ${t.mine} of 5`;
      const them = `${others} ${others === 1 ? "person" : "people"} you follow`;
      return `Rated ${stars}, by ${t.mine ? `you and ${them}` : them}`;
    },
    onChange(fn) {
      watchers3.add(fn);
      return () => void watchers3.delete(fn);
    }
  };
}

// packages/sdk/src/person-lines.ts
function ordinal(n) {
  const tens = n % 100;
  const last = n % 10;
  return `${n}${tens >= 11 && tens <= 13 ? "th" : last === 1 ? "st" : last === 2 ? "nd" : last === 3 ? "rd" : "th"}`;
}
function someOf(names, most = 3) {
  const shown2 = names.slice(0, most).join(", ");
  const rest = names.length - most;
  return rest > 0 ? `${shown2} and ${rest} more` : shown2;
}
function worldPersonLines(o) {
  const watchers3 = /* @__PURE__ */ new Set();
  const changed = () => {
    for (const fn of watchers3) fn();
  };
  let asked = 0;
  const read = () => {
    if (asked && Date.now() - asked < 6e4) return;
    asked = Date.now();
    const reads = [];
    for (const b of o.scores?.boards ?? []) reads.push(o.scores.standings(b.id, true).catch(() => null));
    if (o.achievements?.list.length) reads.push(o.achievements.holders(true).catch(() => null));
    void Promise.all(reads).then(changed);
  };
  o.scores?.onChange(changed);
  o.achievements?.onChange(changed);
  return {
    lines(pubkey) {
      read();
      const out = [];
      for (const b of o.scores?.boards ?? []) {
        const at = o.scores.standingOf(b.id, pubkey);
        if (at) out.push(`${b.title}: ${o.scores.words(b.id, at.score)}, ${ordinal(at.rank)} of ${at.of} here`);
      }
      const held = o.achievements?.heldBy(pubkey) ?? [];
      if (held.length) out.push(`Shows ${held.length} of ${o.achievements.list.length} achievements here: ${someOf(held.map((a) => a.title))}`);
      return out;
    },
    onChange(fn) {
      watchers3.add(fn);
      return () => void watchers3.delete(fn);
    }
  };
}

// packages/sdk/src/achievements.ts
import { achievementsIn, cleanAchievementId, DEFAULT_RELAYS as DEFAULT_RELAYS9, publishEvent as publishEvent6, queryRelays as queryRelays9, readRelayList as readRelayList6, RELAY_LIST_KIND as RELAY_LIST_KIND6, ACHIEVEMENT_KIND, worldCoordinate as worldCoordinate3 } from "@nswp/core";
function createAchievements(opts) {
  const world = worldCoordinate3(opts.world);
  const now = opts.now ?? (() => Date.now());
  const query = opts.query ?? queryRelays9;
  const publish = opts.publish ?? publishEvent6;
  const usual = () => opts.relays ?? DEFAULT_RELAYS9;
  const list = opts.list.filter((a) => cleanAchievementId(a.id) && a.title);
  const one = (id) => list.find((a) => a.id === id) ?? null;
  const store = (() => {
    if (opts.storage !== void 0) return opts.storage;
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  })();
  const watchers3 = /* @__PURE__ */ new Set();
  const earners = /* @__PURE__ */ new Set();
  const changed = () => {
    for (const fn of watchers3) fn();
  };
  const keyFor = (who) => `nswp:achievements:${world}:${who ?? "guest"}`;
  const held = /* @__PURE__ */ new Map();
  const of = (who) => {
    const k = keyFor(who);
    if (!held.has(k)) {
      let kept2 = { earned: [], shown: [] };
      try {
        const read = JSON.parse(store?.getItem(k) ?? "{}");
        const ids = (v) => Array.isArray(v) ? v.filter((id) => !!cleanAchievementId(id)) : [];
        kept2 = { earned: ids(read?.earned), shown: ids(read?.shown) };
      } catch {
      }
      held.set(k, kept2);
    }
    return held.get(k);
  };
  const write = (who) => {
    try {
      store?.setItem(keyFor(who), JSON.stringify(of(who)));
    } catch {
    }
  };
  const earned = () => {
    const who = opts.hand.pubkey();
    const all = /* @__PURE__ */ new Set([...of(who).earned, ...who ? of(null).earned : []]);
    return list.filter((a) => all.has(a.id)).map((a) => a.id);
  };
  let relaysKept = null;
  const ownRelays = (key) => {
    if (relaysKept && relaysKept.key === key && now() - relaysKept.at < 6e5) return relaysKept.found;
    const found = askWell({ kinds: [RELAY_LIST_KIND6], authors: [key], limit: 4 }, { own: [], usual: usual(), query, timeoutMs: 2500, now }).then((got) => readRelayList6(got.events, key)?.write ?? []).catch(() => []);
    relaysKept = { key, at: now(), found };
    return found;
  };
  let events = [];
  let asked = 0;
  let answered = false;
  return {
    list,
    earned,
    shown: () => of(opts.hand.pubkey()).shown.filter((id) => !!one(id)),
    earn(id) {
      const a = one(id);
      if (!world || !a || earned().includes(id)) return false;
      const who = opts.hand.pubkey();
      of(who).earned.push(id);
      write(who);
      changed();
      for (const fn of earners) fn(a);
      return true;
    },
    async show() {
      const who = opts.hand.pubkey();
      if (!world) return { ok: false, said: "This world has no achievements." };
      if (!who) return { ok: false, said: "Sign in here to show what you have earned: it is under You." };
      const kept2 = of(who);
      const waiting = earned().filter((id) => !kept2.shown.includes(id));
      if (waiting.length === 0) return { ok: true, said: earned().length ? "Everything you have earned here is already shown." : "You haven't earned anything here yet." };
      const own = await ownRelays(who);
      let done = 0;
      for (const id of waiting) {
        const a = one(id);
        const signed = await opts.hand.sign(world, id, a.title).catch(() => null);
        if (!signed) break;
        const sent = await sendWell(signed, { own, usual: usual(), publish, query, now }).catch(() => null);
        if (!sent || sent.took === 0) break;
        kept2.shown.push(id);
        if (!kept2.earned.includes(id)) kept2.earned.push(id);
        write(who);
        events = [...events.filter((e) => e.id !== signed.id), signed];
        done++;
      }
      changed();
      if (done === 0) return { ok: false, said: "It couldn't be signed or sent, so nothing was shown. What you earned is still kept on this device." };
      const rest = waiting.length - done;
      return { ok: rest === 0, said: `${done === 1 ? "1 achievement is" : `${done} achievements are`} shown as yours. Anyone can see ${done === 1 ? "it" : "them"}.${rest ? ` ${rest} more couldn't be sent: try again in a moment.` : ""}` };
    },
    async holders(fresh = false) {
      if (!world) return null;
      if (fresh || !asked || now() - asked >= 6e4) {
        asked = now();
        const got = await askWell({ kinds: [ACHIEVEMENT_KIND], "#a": [world], limit: 500 }, { own: [], usual: usual(), query, timeoutMs: 4e3, now }).catch(() => null);
        answered = !!got && Object.values(got.relays).some((said) => said === "eose");
        const byId = new Map([...events, ...got?.events ?? []].map((e) => [e.id, e]));
        events = [...byId.values()];
      }
      if (!answered && events.length === 0) return null;
      return achievementsIn(events, { world, worldUrl: opts.worldUrl, counted: opts.counted?.() ?? [], me: opts.hand.pubkey() }).byId;
    },
    heldBy(pubkey) {
      if (!world || events.length === 0) return [];
      const theirs = new Set(achievementsIn(events, { world, worldUrl: opts.worldUrl }).held.filter((h) => h.by === pubkey).map((h) => h.id));
      return list.filter((a) => theirs.has(a.id));
    },
    onChange(fn) {
      watchers3.add(fn);
      return () => void watchers3.delete(fn);
    },
    onEarn(fn) {
      earners.add(fn);
      return () => void earners.delete(fn);
    }
  };
}

// packages/sdk/src/achieving.ts
function addAchievementControls(controls, opts) {
  const a = opts.achievements;
  let shown2 = [];
  let holders;
  let looking = false;
  const look = (fresh = false) => {
    if (looking) return;
    looking = true;
    void a.holders(fresh).catch(() => null).then((got) => {
      looking = false;
      holders = got;
      refresh();
    });
  };
  const refresh = () => {
    for (const id of shown2) controls.remove(id);
    shown2 = [];
    if (a.list.length === 0) return;
    const add = (...actions) => {
      for (const x of actions) shown2.push(x.id);
      controls.add(...actions.map((x) => ({ section: "achievements", ...x })));
    };
    const earned = a.earned();
    const out = a.shown();
    const waiting = earned.filter((id) => !out.includes(id)).length;
    controls.addSection({
      id: "achievements",
      label: "Achievements",
      icon: "check",
      note: () => `You have earned ${earned.length} of ${a.list.length} here. What you earn is kept on this device until you show it. Showing it says publicly that you were here, and what you did. Nothing checks what anyone shows.`
    });
    add({
      id: "achievements-show",
      icon: "check",
      tone: waiting ? "primary" : "normal",
      label: () => earned.length === 0 ? "Nothing earned here yet" : !opts.signedIn() ? `Sign in to show the ${earned.length} you have earned` : waiting === 0 ? `All ${earned.length} you have earned ${earned.length === 1 ? "is" : "are"} shown as yours` : `Show the ${waiting} I have earned, as mine (public)`,
      short: "Show",
      act: async () => {
        if (earned.length === 0) return controls.say("Earn one first: it is kept on this device until you show it.");
        const done = await a.show();
        controls.say(done.said);
        look(true);
        refresh();
      }
    });
    if (holders === void 0) look();
    for (const one of a.list) {
      const mine = earned.includes(one.id);
      const h = holders?.get(one.id);
      const title = one.hidden && !mine ? "Something not yet found" : one.title;
      const about = one.hidden && !mine ? "" : one.about ? `: ${one.about}` : "";
      const others = h ? h.holders - (h.mine ? 1 : 0) : 0;
      const held = others > 0 ? ` Shown by ${others === 1 ? "1 other" : `${others} others`}${h.known.length ? `, ${h.known.length} you follow` : ""}.` : "";
      add({
        id: `achievements-${one.id}`,
        icon: mine ? "check" : "step",
        on: () => mine,
        label: `${title}${about}.${held}`.replace(/\.\./g, "."),
        act: () => controls.say(mine ? `You earned "${one.title}"${out.includes(one.id) ? ", and it is shown as yours" : ". It is kept on this device until you show it"}.` : one.hidden ? "Not found yet." : `Not earned yet: ${one.about ?? one.title}.`)
      });
    }
  };
  let drawing = false;
  const soon2 = () => {
    if (drawing) return;
    drawing = true;
    queueMicrotask(() => {
      drawing = false;
      refresh();
    });
  };
  a.onChange(soon2);
  a.onEarn((one) => {
    controls.say(`Achievement: ${one.title}. It is kept on this device. Show it as yours from Achievements, in the menu.`);
    controls.signal("achievement");
  });
  refresh();
  return { refresh };
}

// packages/sdk/src/sound.ts
var FOREIGN_SOUND = { seconds: 4, peak: 0.7, fades: 25, gone: 45 };
var GAP2 = { step: 0.14, hover: 0.08, bump: 0.5, land: 0.2, notice: 0.25, chat: 0.3 };
var STRIDE = 0.75;
var JUMP = 1.2;
function createSounds(o = {}) {
  const ctx = o.context ?? new AudioContext();
  const base = o.base ?? location.href;
  const theme = cleanTheme(o.theme, base);
  const levelsKey = o.keep?.levels ?? "nswp:sound";
  const songsKey = o.keep?.songs ?? "nswp:jukebox";
  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "null");
    } catch {
      return null;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  };
  const came = arrivedSettings().sound;
  let levels = cleanLevels({ ...read(levelsKey), ...came });
  let songs = cleanSongs(read(songsKey));
  let disposed = false;
  if (came) write(levelsKey, levels);
  const stopReporting = reportSettings("sound", () => ({ sound: { off: levels.off, effects: levels.effects, music: levels.music, voices: levels.voices, hum: levels.hum } }));
  const master = ctx.createGain();
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -14;
  limiter.knee.value = 10;
  limiter.ratio.value = 12;
  limiter.attack.value = 3e-3;
  limiter.release.value = 0.25;
  const meter = ctx.createAnalyser();
  meter.fftSize = 1024;
  master.connect(limiter);
  limiter.connect(meter);
  limiter.connect(ctx.destination);
  const effects = ctx.createGain();
  const placeMusic = ctx.createGain();
  const ownMusic = ctx.createGain();
  for (const g of [effects, placeMusic, ownMusic]) g.connect(master);
  const humGain = ctx.createGain();
  humGain.connect(placeMusic);
  const listeners = /* @__PURE__ */ new Set();
  const changed = () => {
    for (const fn of listeners) {
      try {
        fn(levels);
      } catch (err) {
        console.error("nswp-sdk sound listener failed", err);
      }
    }
  };
  const juke = { audio: null, url: "", current: null, playing: false, tap: null };
  const apply = () => {
    const t = ctx.currentTime;
    master.gain.setTargetAtTime(levels.off ? 0 : 1, t, 0.05);
    effects.gain.setTargetAtTime(levels.effects, t, 0.05);
    placeMusic.gain.setTargetAtTime(levels.music * (juke.playing ? 0.1 : 1), t, 0.4);
    ownMusic.gain.setTargetAtTime(levels.music, t, 0.05);
    humGain.gain.setTargetAtTime(levels.hum ? 1 : 0, t, 0.3);
  };
  apply();
  let noiseBuffer = null;
  const noise2 = () => {
    if (noiseBuffer) return noiseBuffer;
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  };
  const playPart = (p, when, to = effects, rate = 1) => {
    const start = when + p.at;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(p.gain, start + Math.min(6e-3, p.dur / 3));
    gain.gain.exponentialRampToValueAtTime(8e-4, start + p.dur);
    gain.connect(to);
    if (p.kind === "tone") {
      const osc = ctx.createOscillator();
      osc.type = p.wave;
      osc.frequency.setValueAtTime(p.from * rate, start);
      if (p.to !== void 0) osc.frequency.exponentialRampToValueAtTime(p.to * rate, start + p.dur);
      osc.connect(gain);
      osc.start(start);
      osc.stop(start + p.dur + 0.02);
    } else {
      const src = ctx.createBufferSource();
      src.buffer = noise2();
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = p.band * rate;
      band.Q.value = 1.1;
      src.connect(band);
      band.connect(gain);
      src.start(start, Math.random() * 0.5);
      src.stop(start + p.dur + 0.02);
    }
  };
  const CUE_LOUDNESS = 0.14;
  const loudnessOf = (buffer) => {
    let sum = 0;
    let n = 0;
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < data.length; i += 4) {
        sum += data[i] * data[i];
        n++;
      }
    }
    return n ? Math.sqrt(sum / n) : 0;
  };
  const loadCue = async (address) => {
    try {
      const res = await fetch(address);
      if (!res.ok) return null;
      const bytes = await res.arrayBuffer();
      if (bytes.byteLength > SOUND_LIMITS.cueBytes) return null;
      const buffer = await ctx.decodeAudioData(bytes);
      if (buffer.duration > SOUND_LIMITS.cueSeconds || disposed) return null;
      const loud = loudnessOf(buffer);
      return { buffer, gain: loud > CUE_LOUDNESS ? CUE_LOUDNESS / loud : 1 };
    } catch {
      return null;
    }
  };
  const own = /* @__PURE__ */ new Map();
  const fromKit = /* @__PURE__ */ new Map();
  const loadInto = (into, files2) => {
    for (const [cue, addresses] of Object.entries(files2)) {
      for (const address of addresses ?? []) {
        void loadCue(address).then((loaded) => {
          if (loaded) into.set(cue, [...into.get(cue) ?? [], loaded]);
        });
      }
    }
  };
  let kit = { cues: {} };
  const kitReady = o.kit ? (async () => {
    try {
      const folder = new URL(o.kit.endsWith("/") ? o.kit : `${o.kit}/`, base).href;
      const res = await fetch(new URL("sounds.json", folder).href);
      if (!res.ok) return;
      const playsOgg = new Audio().canPlayType('audio/ogg; codecs="opus"') !== "";
      kit = cleanKit(await res.json(), folder, playsOgg);
    } catch {
    }
  })() : Promise.resolve();
  let cuesAsked = false;
  const loadCues = () => {
    if (cuesAsked || disposed) return;
    cuesAsked = true;
    loadInto(own, theme.cues);
    void kitReady.then(() => {
      const rest = Object.fromEntries(Object.entries(kit.cues).filter(([cue]) => theme.cues[cue] === void 0));
      loadInto(fromKit, rest);
    });
  };
  const last = /* @__PURE__ */ new Map();
  const lastVariant = /* @__PURE__ */ new Map();
  let foot = 0;
  const shaped = (shape) => {
    const soft = ctx.createBiquadFilter();
    soft.type = "lowpass";
    soft.frequency.value = shape.cutoff;
    soft.Q.value = 0.5;
    const level = ctx.createGain();
    level.gain.value = shape.gain;
    soft.connect(level);
    if (typeof ctx.createStereoPanner === "function") {
      const side = ctx.createStereoPanner();
      side.pan.value = shape.pan;
      level.connect(side);
      side.connect(effects);
    } else level.connect(effects);
    return soft;
  };
  let foreignPlayed = 0;
  const play = (cue, from) => {
    if (disposed || levels.off || levels.effects <= 0 || ctx.state !== "running") return;
    if (theme.cues[cue] === null) return;
    const now = ctx.currentTime;
    if (now - (last.get(cue) ?? -1) < (GAP2[cue] ?? 0.03)) return;
    last.set(cue, now);
    const shape = cue === "step" ? stepShape(foot++) : from ? heardFrom(from) : null;
    const out = shape ? shaped(shape) : effects;
    const files2 = own.get(cue) ?? fromKit.get(cue);
    if (files2?.length) {
      const which = nextVariant(files2.length, lastVariant.get(cue) ?? -1);
      lastVariant.set(cue, which);
      const src = ctx.createBufferSource();
      src.buffer = files2[which].buffer;
      if (shape) src.playbackRate.value = shape.rate;
      const level = ctx.createGain();
      level.gain.value = files2[which].gain;
      src.connect(level);
      level.connect(out);
      src.start();
      return;
    }
    for (const part of cueRecipe(cue)) playPart(part, now + 5e-3, out, shape?.rate ?? 1);
  };
  let walked = 0;
  const moved = (metres) => {
    if (!(metres > 5e-4)) return;
    if (metres > JUMP) {
      walked = 0;
      return play("land");
    }
    walked += metres;
    if (walked >= STRIDE) {
      walked = 0;
      play("step");
    }
  };
  const loopPlayer = (tracks, into, opts = {}) => {
    const fade = opts.fade ?? 2;
    const out = ctx.createGain();
    out.gain.value = opts.gain ?? 1;
    out.connect(into);
    const deck = () => {
      const audio = new Audio();
      audio.preload = "auto";
      const gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audio).connect(gain);
      gain.connect(out);
      return { audio, gain };
    };
    const decks = [deck(), deck()];
    let active = 0;
    let index = 0;
    let heard = 0;
    let turning = false;
    let stopped = false;
    const curve = (rising) => Float32Array.from({ length: 32 }, (_, k) => (rising ? Math.sin : Math.cos)(k / 31 * Math.PI / 2));
    const turn2 = () => {
      if (turning || stopped) return;
      turning = true;
      const from = decks[active];
      const to = decks[1 - active];
      index = (index + 1) % tracks.length;
      to.audio.src = tracks[index];
      to.audio.currentTime = 0;
      void to.audio.play().then(
        () => {
          const t = ctx.currentTime + 0.02;
          from.gain.gain.cancelScheduledValues(t);
          to.gain.gain.cancelScheduledValues(t);
          from.gain.gain.setValueCurveAtTime(curve(false), t, fade);
          to.gain.gain.setValueCurveAtTime(curve(true), t, fade);
          active = 1 - active;
          heard = index;
          opts.onTurn?.();
          setTimeout(() => {
            from.audio.pause();
            turning = false;
          }, (fade + 0.1) * 1e3);
        },
        () => {
          turning = false;
        }
      );
    };
    for (const d of decks) {
      d.audio.addEventListener("timeupdate", () => {
        if (d !== decks[active] || !Number.isFinite(d.audio.duration)) return;
        if (d.audio.duration - d.audio.currentTime <= fade + 0.35) turn2();
      });
      d.audio.addEventListener("ended", () => {
        if (d === decks[active]) turn2();
      });
      d.audio.addEventListener("error", () => {
        if (stopped || d !== decks[active] || turning) return;
        stopped = true;
        opts.onFail?.();
      });
    }
    const first = decks[0];
    first.audio.src = tracks[0];
    void first.audio.play().then(
      () => first.gain.gain.setTargetAtTime(1, ctx.currentTime, 0.8),
      () => {
      }
    );
    return {
      stop() {
        stopped = true;
        for (const d of decks) {
          d.audio.pause();
          d.audio.removeAttribute("src");
        }
        out.disconnect();
      },
      /** How many times one piece has handed on to the next. For tests. */
      get index() {
        return index;
      },
      /** Where the piece that is heard now is kept. */
      get now() {
        return tracks[heard];
      },
      get count() {
        return tracks.length;
      },
      /** Hand on to the next piece now. */
      next() {
        if (tracks.length < 2 || turning || stopped) return false;
        turn2();
        return true;
      }
    };
  };
  let kind = theme.music === null ? "none" : theme.music ? "world" : "made";
  let stopMusic = null;
  let pieces = null;
  let stopHum = null;
  let humAddress = null;
  let musicAsked = false;
  const startMusic = () => {
    if (musicAsked || disposed) return;
    musicAsked = true;
    loadCues();
    void kitReady.then(() => {
      if (disposed) return;
      humAddress = theme.hum === null ? null : theme.hum ?? kit.hum ?? null;
      if (humAddress) stopHum = loopPlayer([humAddress], humGain, { gain: 0.55 }).stop;
      const tracks = theme.music === null ? null : theme.music ?? kit.music ?? null;
      if (theme.music === void 0 && kit.music) kind = "kit";
      changed();
      if (theme.music === null) return;
      if (tracks) {
        const player2 = loopPlayer(tracks, placeMusic, {
          gain: 0.6,
          onTurn: () => changed(),
          onFail: () => {
            stopMusic?.();
            pieces = null;
            kind = "made";
            stopMusic = madeMusic();
            changed();
          }
        });
        pieces = player2;
        stopMusic = player2.stop;
        changed();
        return;
      }
      stopMusic = madeMusic();
    });
  };
  const madeMusic = () => {
    const plan = ambiencePlan(o.seed ?? location.host);
    const bed = ctx.createGain();
    bed.gain.value = 0.12;
    const colour = ctx.createBiquadFilter();
    colour.type = "lowpass";
    colour.frequency.value = plan.colour;
    colour.connect(bed);
    bed.connect(placeMusic);
    const running = [];
    plan.drones.forEach((d, i) => {
      const osc = ctx.createOscillator();
      osc.type = i < 2 ? "sine" : "triangle";
      osc.frequency.value = d.hz;
      osc.detune.value = d.detune;
      const swell = ctx.createGain();
      swell.gain.value = i < 2 ? 0.3 : 0.14;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 1 / d.swell;
      const depth = ctx.createGain();
      depth.gain.value = swell.gain.value * 0.8;
      lfo.connect(depth);
      depth.connect(swell.gain);
      osc.connect(swell);
      swell.connect(colour);
      osc.start();
      lfo.start();
      running.push(osc, lfo);
    });
    const random = seeded(`notes:${o.seed ?? location.host}`);
    let timer;
    const note = () => {
      if (disposed) return;
      if (ctx.state === "running" && !levels.off && levels.music > 0) {
        const hz = plan.root * plan.scale[Math.floor(random() * plan.scale.length)] * (random() < 0.5 ? 2 : 4);
        const t = ctx.currentTime + 0.05;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = hz;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.11, t + 0.5);
        g.gain.exponentialRampToValueAtTime(8e-4, t + 4.5);
        osc.connect(g);
        g.connect(bed);
        osc.start(t);
        osc.stop(t + 4.6);
      }
      timer = setTimeout(note, (plan.gap[0] + random() * (plan.gap[1] - plan.gap[0])) * 1e3);
    };
    timer = setTimeout(note, 1500);
    return () => {
      clearTimeout(timer);
      for (const n of running) {
        try {
          n.stop();
        } catch {
        }
      }
      bed.disconnect();
    };
  };
  const wake = () => {
    void ctx.resume().then(startMusic, () => {
    });
    if (ctx.state === "running") startMusic();
  };
  const onTouch = () => wake();
  addEventListener("pointerdown", onTouch, true);
  addEventListener("keydown", onTouch, true);
  if (ctx.state === "running") startMusic();
  const keepSongs = () => write(songsKey, songs);
  const stopOwn = () => {
    juke.audio?.pause();
    juke.playing = false;
    apply();
    changed();
  };
  const player = () => {
    if (!juke.audio || !juke.tap) {
      juke.audio = new Audio();
      const source = ctx.createMediaElementSource(juke.audio);
      source.connect(ownMusic);
      juke.tap = ctx.createMediaStreamDestination();
      source.connect(juke.tap);
      juke.audio.addEventListener("ended", () => void jukebox.next());
    }
    return { audio: juke.audio, tap: juke.tap };
  };
  const jukebox = {
    list: () => [...songs],
    async add(file) {
      const refusal = songRefusal({ type: file.type, size: file.size, ...file.name ? { name: file.name } : {} }, songs.length);
      if (refusal) return refusal;
      const id = `song-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const kept2 = await fileStore("readwrite", (s) => s.put(file, `song:${id}`));
      if (kept2 === void 0) return "This browser couldn't keep that file.";
      songs = cleanSongs([...songs, { id, title: songTitle(file.name ?? ""), size: file.size, at: Math.floor(Date.now() / 1e3) }]);
      keepSongs();
      changed();
      return null;
    },
    async remove(id) {
      if (juke.current?.id === id) {
        stopOwn();
        juke.current = null;
      }
      songs = songs.filter((s) => s.id !== id);
      keepSongs();
      await fileStore("readwrite", (s) => s.delete(`song:${id}`));
      changed();
    },
    async play(id) {
      const song = id ? songs.find((s) => s.id === id) : juke.current ?? songs[0];
      if (!song || disposed) return false;
      player();
      if (juke.current?.id !== song.id || !juke.url) {
        const file = await fileStore("readonly", (s) => s.get(`song:${song.id}`));
        if (!file) return false;
        if (juke.url) URL.revokeObjectURL(juke.url);
        juke.url = URL.createObjectURL(file);
        juke.audio.src = juke.url;
        juke.current = song;
      }
      try {
        await ctx.resume();
        await juke.audio.play();
      } catch {
        juke.playing = false;
        apply();
        changed();
        return false;
      }
      juke.playing = true;
      apply();
      changed();
      return true;
    },
    pause: stopOwn,
    async next() {
      if (songs.length === 0) return false;
      const at = songs.findIndex((s) => s.id === juke.current?.id);
      return jukebox.play(songs[(at + 1) % songs.length].id);
    },
    get playing() {
      return juke.playing;
    },
    get current() {
      return juke.current;
    },
    output: () => player().tap.stream.getAudioTracks()[0]
  };
  const samples = new Float32Array(meter.fftSize);
  return {
    play,
    moved,
    bump: () => play("bump"),
    get levels() {
      return levels;
    },
    setLevels(patch) {
      levels = cleanLevels({ ...levels, ...patch });
      write(levelsKey, levels);
      apply();
      changed();
    },
    jukebox,
    onChange(fn) {
      listeners.add(fn);
      fn(levels);
      return () => listeners.delete(fn);
    },
    get music() {
      return kind;
    },
    get piece() {
      return pieces ? { name: pieceName(pieces.now), of: pieces.count } : null;
    },
    nextPiece() {
      return pieces?.next() ?? false;
    },
    get hasHum() {
      return !!humAddress;
    },
    async decode(bytes) {
      try {
        const buffer = await ctx.decodeAudioData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
        if (!(buffer.duration > 0) || buffer.duration > FOREIGN_SOUND.seconds) return null;
        let peak = 0;
        for (let c = 0; c < buffer.numberOfChannels; c++) for (const x of buffer.getChannelData(c)) peak = Math.max(peak, Math.abs(x));
        return { buffer, gain: peak > 0 ? Math.min(1, FOREIGN_SOUND.peak / peak) : 1 };
      } catch {
        return null;
      }
    },
    playForeign(sound, from) {
      if (disposed || levels.off || levels.effects <= 0 || ctx.state !== "running") return;
      const far = from && Number.isFinite(from.distance) ? Math.max(0, from.distance) : 0;
      const reach = far <= FOREIGN_SOUND.fades ? 1 : Math.max(0, 1 - (far - FOREIGN_SOUND.fades) / (FOREIGN_SOUND.gone - FOREIGN_SOUND.fades));
      if (reach <= 0) return;
      const src = ctx.createBufferSource();
      src.buffer = sound.buffer;
      const level = ctx.createGain();
      level.gain.value = sound.gain * reach;
      src.connect(level);
      level.connect(from ? shaped(heardFrom(from)) : effects);
      src.start();
      foreignPlayed++;
    },
    get foreignPlayed() {
      return foreignPlayed;
    },
    loudness() {
      meter.getFloatTimeDomainData(samples);
      return Math.sqrt(samples.reduce((s, x) => s + x * x, 0) / samples.length);
    },
    dispose() {
      stopReporting();
      disposed = true;
      removeEventListener("pointerdown", onTouch, true);
      removeEventListener("keydown", onTouch, true);
      stopMusic?.();
      stopHum?.();
      juke.audio?.pause();
      if (juke.url) URL.revokeObjectURL(juke.url);
      master.disconnect();
    }
  };
}
function addSoundControls(controls, sounds) {
  const word = (v) => LEVEL_WORDS[levelStep(v)];
  let listed = [];
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = "audio/*";
  picker.multiple = true;
  picker.hidden = true;
  document.body.append(picker);
  picker.addEventListener("change", async () => {
    let added = 0;
    let refused = "";
    for (const file of [...picker.files ?? []]) {
      const no = await sounds.jukebox.add(file);
      if (no) refused = no;
      else added++;
    }
    picker.value = "";
    controls.say(added ? `${added === 1 ? "1 song" : `${added} songs`} added. Only you hear your music.${refused ? ` ${refused}` : ""}` : refused || "Nothing was added.");
    refresh();
  });
  const refresh = () => {
    for (const id of listed) controls.remove(id);
    const songs = sounds.jukebox.list();
    listed = songs.map((s) => `song-${s.id}`);
    controls.addSection({
      id: "sound",
      label: "Sound",
      icon: "sound",
      note: () => `${sounds.levels.off ? "All sound is off. " : ""}${sounds.music === "none" ? "This place has no music of its own." : sounds.music === "world" ? "This place plays its own music." : sounds.music === "kit" ? "This place plays the music every world starts with." : "This place's music is made by your browser, from its name."} Your own music is kept in this browser, for this site, and only you hear it.`
    });
    songs.forEach(
      (s, i) => controls.add({
        id: listed[i],
        section: "sound",
        icon: "note",
        on: () => sounds.jukebox.playing && sounds.jukebox.current?.id === s.id,
        label: () => sounds.jukebox.playing && sounds.jukebox.current?.id === s.id ? `Playing: ${s.title}` : s.title,
        act: async () => {
          if (sounds.jukebox.playing && sounds.jukebox.current?.id === s.id) sounds.jukebox.pause();
          else if (!await sounds.jukebox.play(s.id)) controls.say(`${s.title} couldn't be played.`);
        }
      })
    );
  };
  const level = (id, name, key) => ({
    id,
    section: "sound",
    label: () => `${name}: ${word(sounds.levels[key])}`,
    on: () => sounds.levels[key] > 0,
    act: () => sounds.setLevels({ [key]: nextLevel(sounds.levels[key]) })
  });
  controls.addSection({ id: "sound", label: "Sound", icon: "sound" });
  controls.add(
    {
      id: "sound-all",
      section: "sound",
      icon: () => sounds.levels.off ? "soundOff" : "sound",
      on: () => !sounds.levels.off,
      label: () => sounds.levels.off ? "All sound: off" : "All sound: on",
      act: () => sounds.setLevels({ off: !sounds.levels.off })
    },
    level("sound-effects", "Effects", "effects"),
    level("sound-music", "Music", "music"),
    {
      // What the place is playing, by name, so a visitor can say which piece they mean. Pressing goes on to the next.
      id: "sound-piece",
      section: "sound",
      icon: "note",
      hidden: () => sounds.music === "none" || sounds.music === "made" || !sounds.piece,
      label: () => {
        const p = sounds.piece;
        if (!p) return "This place's music";
        return `Playing here: ${p.name}${p.of > 1 ? `. Next of ${p.of}` : ""}`;
      },
      act: () => {
        const p = sounds.piece;
        if (!p) return;
        if (sounds.nextPiece()) controls.say(`Going on from ${p.name} to this place's next piece.`);
        else controls.say(`${p.name} is the only piece this place has. Music: off, above, silences it.`);
      }
    },
    level("sound-voices", "Voices", "voices"),
    {
      id: "sound-hum",
      section: "sound",
      icon: "sound",
      on: () => sounds.levels.hum,
      hidden: () => !sounds.hasHum,
      label: () => sounds.levels.hum ? "The room's hum: on" : "The room's hum: off",
      act: () => sounds.setLevels({ hum: !sounds.levels.hum })
    },
    {
      id: "juke-add",
      section: "sound",
      icon: "save",
      label: "Add music from this device",
      act: () => picker.click()
    },
    {
      id: "juke-play",
      section: "sound",
      icon: "note",
      on: () => sounds.jukebox.playing,
      hidden: () => sounds.jukebox.list().length === 0,
      label: () => sounds.jukebox.playing ? "Pause your music" : "Play your music",
      act: async () => {
        if (sounds.jukebox.playing) return sounds.jukebox.pause();
        if (!await sounds.jukebox.play()) controls.say("Your music couldn't be played.");
      }
    },
    {
      id: "juke-next",
      section: "sound",
      icon: "turn",
      hidden: () => sounds.jukebox.list().length < 2,
      label: "Next song",
      act: () => void sounds.jukebox.next()
    },
    {
      id: "juke-remove",
      section: "sound",
      icon: "exit",
      hidden: () => !sounds.jukebox.current,
      label: () => `Take out ${sounds.jukebox.current?.title ?? "this song"}`,
      act: async () => {
        const song = sounds.jukebox.current;
        if (!song) return;
        await sounds.jukebox.remove(song.id);
        controls.say(`${song.title} was taken out of this browser.`);
        refresh();
      }
    }
  );
  refresh();
  controls.onSignal((name) => {
    if (CUES.includes(name)) sounds.play(name);
  });
  controls.onSay(() => sounds.play("notice"));
  sounds.onChange(() => refresh());
  return { refresh };
}

// packages/sdk/src/chamber.ts
import * as THREE14 from "three";
var R = 1.8;
var H4 = 2.8;
var BAYS = 10;
var DOOR_W = 1.04;
var DOOR_H = 2.2;
var CHAMBER_ORDER = 1e4;
var SHUT_ORDER = CHAMBER_ORDER + 1e6;
function signTexture(lines, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 384;
  const g = canvas.getContext("2d");
  g.fillStyle = "rgba(6,9,14,0.92)";
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.fillStyle = color;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const rows = lines.filter(Boolean).slice(0, 3);
  rows.forEach((line, i) => {
    g.font = i === 0 ? "bold 84px system-ui, sans-serif" : "52px system-ui, sans-serif";
    g.globalAlpha = i === 0 ? 1 : 0.82;
    const y = rows.length === 1 ? 192 : rows.length === 2 ? 138 + i * 118 : 92 + i * 100;
    g.fillText(line, 512, y, 944);
  });
  const texture = new THREE14.CanvasTexture(canvas);
  texture.colorSpace = THREE14.SRGBColorSpace;
  return texture;
}
function createChamber(accent, opts = {}) {
  const light = new THREE14.Color(accent);
  const metal = createAlloy(light, { gloss: 0.5, speed: 0.9 });
  const builder = () => {
    const b = new MeshBuilder().at();
    b.tone = new THREE14.Color(1317668);
    b.light = light.clone();
    return b;
  };
  const reach = R + 0.06;
  const bay = 2 * reach * Math.tan(Math.PI / BAYS) + 0.02;
  const floorShape = builder();
  floorShape.lathe([[R + 0.2, 0.012], [R * 0.78, 0.03], [R * 0.74, 0.03], [R * 0.7, 0.03], [0.34, 0.03], [0.3, 0.03], [5e-4, 0.03]], [0, 0, 0], 30, (row) => row === 1 || row === 4 ? { glow: 0.85 } : { shade: 0.8 });
  const floor = floorShape.build(metal);
  const wallShape = builder();
  for (let i = 1; i < BAYS; i++) {
    const a = i * 2 * Math.PI / BAYS;
    wallShape.at([Math.sin(a) * reach, 0, -Math.cos(a) * reach], -THREE14.MathUtils.radToDeg(a));
    wallShape.box([bay, H4, 0.12], [0, H4 / 2, 0], { bevel: 0.02, shade: i % 2 ? 1 : 0.86, panel: { margin: 0.12, depth: 0.02, faces: "z+ z-" } });
    for (const x of [-bay * 0.26, bay * 0.26]) for (const z of [0.062, -0.062]) wallShape.line([x, 0.3, z], [x, H4 - 0.3, z], 0.03, [0, 0, Math.sign(z)], { flow: i });
  }
  wallShape.at([0, 0, -reach]);
  for (const side of [-1, 1]) wallShape.box([(bay - DOOR_W) / 2, H4, 0.16], [side * (bay + DOOR_W) / 4, H4 / 2, 0], { bevel: 0.02 });
  wallShape.box([DOOR_W, H4 - DOOR_H, 0.16], [0, DOOR_H + (H4 - DOOR_H) / 2, 0], { bevel: 0.02 });
  wallShape.line([-DOOR_W / 2, DOOR_H - 0.012, 0.082], [DOOR_W / 2, DOOR_H - 0.012, 0.082], 0.024, [0, 0, 1]);
  const walls = wallShape.build(metal);
  const lidShape = builder();
  lidShape.lathe([[5e-4, 0], [R * 0.5, 0], [R * 0.56, -0.05], [R * 0.62, 0], [R + 0.2, 0]], [0, 0, 0], 30, (row) => row === 1 || row === 2 ? { glow: 0.9 } : { shade: 0.7 });
  const lid = lidShape.build(metal);
  const leaves = [-1, 1].map((side) => {
    const b = builder();
    b.box([DOOR_W / 2, DOOR_H, 0.05], [-side * DOOR_W / 4, DOOR_H / 2, 0], { bevel: 0.012, panel: { margin: 0.07, depth: 0.012, glow: 0.35, faces: "z+ z-" } });
    b.line([-side * DOOR_W / 2 + side * 0.012, 0.1, 0.027], [-side * DOOR_W / 2 + side * 0.012, DOOR_H - 0.1, 0.027], 0.02, [0, 0, 1]);
    const leaf = b.build(metal);
    leaf.position.set(side * DOOR_W / 2, 0, -reach);
    return leaf;
  });
  const sign = new THREE14.Mesh(new THREE14.PlaneGeometry(DOOR_W * 0.94, DOOR_W * 0.94 * (384 / 1024)), new THREE14.MeshBasicMaterial({ transparent: true }));
  sign.position.set(0, DOOR_H + (H4 - DOOR_H) / 2, -reach + 0.085);
  const rising = new THREE14.Group();
  rising.add(walls, ...leaves, sign);
  const clear = new THREE14.Mesh(new THREE14.BufferGeometry().setAttribute("position", new THREE14.BufferAttribute(new Float32Array(9), 3)), new THREE14.MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false }));
  clear.frustumCulled = false;
  clear.renderOrder = CHAMBER_ORDER;
  clear.onBeforeRender = (renderer) => renderer.clearDepth();
  for (const part of [floor, walls, lid, ...leaves]) part.renderOrder = CHAMBER_ORDER + 1;
  sign.renderOrder = CHAMBER_ORDER + 1.3;
  const depthOnly = (depth, o) => new THREE14.ShaderMaterial({ vertexShader: "void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }", fragmentShader: `void main() { gl_FragDepth = ${depth}; gl_FragColor = vec4(0.0); }`, colorWrite: false, depthTest: true, depthFunc: THREE14.AlwaysDepth, depthWrite: true, side: THREE14.DoubleSide, ...o });
  const nearest2 = depthOnly("0.0", {});
  const farthest = depthOnly("1.0", { transparent: true });
  const real = new THREE14.MeshBasicMaterial({ colorWrite: false, transparent: true, side: THREE14.DoubleSide });
  const shutOut = [];
  for (const part of [floor, walls, lid, ...leaves]) {
    for (const [material, order] of [[nearest2, SHUT_ORDER], [farthest, CHAMBER_ORDER + 1.1], [real, CHAMBER_ORDER + 1.2]]) {
      const pass = new THREE14.Mesh(part.geometry, material);
      pass.renderOrder = order;
      pass.frustumCulled = false;
      part.add(pass);
      shutOut.push(pass);
    }
  }
  const group = new THREE14.Group();
  group.add(clear, floor, rising, lid);
  let door = 0;
  let presence = 1;
  const apply = () => {
    const up = presence * presence * (3 - 2 * presence);
    rising.scale.y = Math.max(1e-3, up);
    rising.visible = presence > 2e-3;
    floor.scale.setScalar(Math.max(1e-3, Math.min(1, presence * 1.6)));
    floor.visible = presence > 2e-3;
    clear.visible = presence > 2e-3;
    lid.position.y = H4 + (1 - up) * 3.5;
    lid.visible = presence > 0.5;
    const open = door * door * (3 - 2 * door);
    for (const leaf of leaves) leaf.scale.x = Math.max(0.02, 1 - open);
  };
  apply();
  return {
    group,
    get door() {
      return door;
    },
    set door(v) {
      door = Math.min(1, Math.max(0, v));
      apply();
    },
    get presence() {
      return presence;
    },
    set presence(v) {
      presence = Math.min(1, Math.max(0, v));
      apply();
    },
    say(lines) {
      const material = sign.material;
      material.map?.dispose();
      material.map = signTexture(lines, opts.textColor ?? "#eef5fb");
      material.needsUpdate = true;
    },
    tick(t) {
      metal.tick(t);
    },
    dispose() {
      group.removeFromParent();
      for (const mesh of [floor, walls, lid, ...leaves, clear]) mesh.geometry.dispose();
      clear.material.dispose();
      for (const material of [nearest2, farthest, real]) material.dispose();
      shutOut.length = 0;
      metal.dispose();
      sign.geometry.dispose();
      sign.material.map?.dispose();
      sign.material.dispose();
    }
  };
}
var RISE = 0.45;
var OPEN = 0.9;
var SINK = 1.1;
var DWELL = 0.7;
function createCrossing(o) {
  let chamber = null;
  let state = "none";
  let since = 0;
  let ready = true;
  let hold;
  let shut = null;
  const moves = () => o.motion?.() ?? true;
  const at = new THREE14.Vector3();
  const facing2 = new THREE14.Vector3();
  const place = () => {
    chamber?.dispose();
    const made = createChamber(o.accent, o.textColor ? { textColor: o.textColor } : {});
    o.camera.getWorldPosition(at);
    o.camera.getWorldDirection(facing2);
    made.group.position.set(at.x, 0, at.z);
    made.group.rotation.y = Math.atan2(-facing2.x, -facing2.z);
    o.scene.add(made.group);
    chamber = made;
    return made;
  };
  const usual = /* @__PURE__ */ new Map();
  const keepInSight = (on) => {
    if (on) {
      for (const root of o.keep ?? []) {
        root.traverse((part) => {
          if (usual.has(part)) return;
          usual.set(part, part.renderOrder);
          part.renderOrder = CHAMBER_ORDER + 2 + part.renderOrder;
        });
      }
    } else {
      for (const [part, order] of usual) part.renderOrder = order;
      usual.clear();
    }
  };
  const enter = (next) => {
    state = next;
    since = 0;
    keepInSight(next !== "none");
  };
  return {
    get state() {
      return state;
    },
    arrive(a) {
      const c = place();
      c.presence = 1;
      c.door = 0;
      c.say([a.title, a.address ?? "", "The doors open when it's ready"]);
      ready = !a.ready;
      void a.ready?.then(
        () => ready = true,
        () => ready = true
      );
      hold = a.hold;
      enter("arriving");
    },
    leave(l) {
      const c = place();
      c.door = 0;
      c.presence = moves() ? 0 : 1;
      c.say([`To ${l.title}`, l.address ?? "", "Your Airlock checks the address next"]);
      enter("leaving");
      return new Promise((resolve) => {
        shut = resolve;
        setTimeout(resolve, 1500);
      });
    },
    allows(x, z) {
      if (!chamber || state !== "arriving" && state !== "shut" && state !== "leaving") return true;
      return Math.hypot(x - chamber.group.position.x, z - chamber.group.position.z) <= R - 0.35;
    },
    update(t, dt) {
      if (!chamber || state === "none") return;
      since += dt;
      chamber.tick(t);
      if (state === "leaving") {
        chamber.presence = moves() ? Math.min(1, since / RISE) : 1;
        if (since >= (moves() ? RISE + 0.2 : 0.2)) {
          enter("shut");
          shut?.();
          shut = null;
        }
      } else if (state === "arriving") {
        if (ready && since >= DWELL && !hold?.()) enter("opening");
      } else if (state === "opening") {
        if (!moves()) {
          chamber.dispose();
          chamber = null;
          return void enter("none");
        }
        chamber.door = Math.min(1, since / OPEN);
        const sinking = (since - OPEN - 0.25) / SINK;
        if (sinking > 0) chamber.presence = 1 - Math.min(1, sinking);
        if (sinking >= 1) {
          chamber.dispose();
          chamber = null;
          enter("none");
        }
      }
    },
    dispose() {
      chamber?.dispose();
      chamber = null;
      state = "none";
      keepInSight(false);
    }
  };
}

// packages/sdk/src/camera.ts
import * as THREE15 from "three";
async function takePicture(renderer, scene, camera, opts = {}) {
  const width = Math.round(opts.width ?? 1920);
  const height = Math.round(opts.height ?? 1080);
  const hidden = (opts.hide ?? []).filter((o) => o.visible);
  const xrWasEnabled = renderer.xr.enabled;
  const previousTarget = renderer.getRenderTarget();
  const target = new THREE15.WebGLRenderTarget(width, height, { samples: 4 });
  target.texture.colorSpace = THREE15.SRGBColorSpace;
  const eye = new THREE15.PerspectiveCamera(camera.fov, width / height, camera.near, camera.far);
  camera.updateWorldMatrix(true, false);
  camera.matrixWorld.decompose(eye.position, eye.quaternion, eye.scale);
  eye.updateMatrixWorld(true);
  try {
    for (const o of hidden) o.visible = false;
    renderer.xr.enabled = false;
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, eye);
    const pixels = new Uint8Array(width * height * 4);
    renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const g = canvas.getContext("2d");
    const image = g.createImageData(width, height);
    for (let y = 0; y < height; y++) image.data.set(pixels.subarray((height - 1 - y) * width * 4, (height - y) * width * 4), y * width * 4);
    g.putImageData(image, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", opts.quality ?? 0.92));
    if (!blob) throw new Error("nswp-sdk: this browser couldn't encode the picture");
    return blob;
  } finally {
    for (const o of hidden) o.visible = true;
    renderer.xr.enabled = xrWasEnabled;
    renderer.setRenderTarget(previousTarget);
    target.dispose();
  }
}
async function takeSelfie(renderer, scene, head, look, opts = {}) {
  head.updateWorldMatrix(true, false);
  const at = new THREE15.Vector3();
  const facing2 = new THREE15.Quaternion();
  head.matrixWorld.decompose(at, facing2, new THREE15.Vector3());
  const ahead = new THREE15.Vector3(0, 0, -1).applyQuaternion(facing2).setY(0);
  if (ahead.lengthSq() < 1e-6) ahead.set(0, 0, -1);
  ahead.normalize();
  const figure = createFigure(look);
  figure.group.position.copy(at);
  figure.group.rotation.y = Math.atan2(-ahead.x, -ahead.z);
  scene.add(figure.group);
  const eye = new THREE15.PerspectiveCamera(58, 1, 0.05, head.far);
  eye.position.copy(at).addScaledVector(ahead, opts.reach ?? 1.7);
  eye.position.y = at.y + 0.08;
  eye.lookAt(at.x, at.y - 0.22, at.z);
  try {
    return await takePicture(renderer, scene, eye, { width: 1600, height: 1200, ...opts });
  } finally {
    scene.remove(figure.group);
    figure.dispose();
  }
}
function canRecord() {
  return typeof MediaRecorder !== "undefined" && typeof HTMLCanvasElement !== "undefined" && "captureStream" in HTMLCanvasElement.prototype;
}
function recordClip(canvas, opts = {}) {
  if (!canRecord()) throw new Error("nswp-sdk: this browser can't record its canvas");
  const type = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  const stream = canvas.captureStream(opts.fps ?? 30);
  const recorder = new MediaRecorder(stream, { ...type ? { mimeType: type } : {}, videoBitsPerSecond: 6e6 });
  const parts = [];
  const started = performance.now();
  recorder.ondataavailable = (e) => {
    if (e.data.size) parts.push(e.data);
  };
  const done = new Promise((resolve) => {
    recorder.onstop = () => {
      for (const track of stream.getTracks()) track.stop();
      resolve(new Blob(parts, { type: recorder.mimeType || type || "video/webm" }));
    };
  });
  recorder.start(500);
  const limit = setTimeout(() => recorder.state !== "inactive" && recorder.stop(), (opts.maxSeconds ?? 30) * 1e3);
  return {
    done,
    seconds: () => (performance.now() - started) / 1e3,
    stop() {
      clearTimeout(limit);
      if (recorder.state !== "inactive") recorder.stop();
      return done;
    }
  };
}
function saveFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3e4);
}
var stamp = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/[T:]/g, "-");
var slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "world";
function addCameraControls(controls, d) {
  const name = slug(d.name ?? "world");
  const presenting = () => d.renderer.xr.isPresenting;
  const kept2 = [];
  let clip = null;
  const plain = `plain-${Math.random().toString(36).slice(2, 12)}`;
  let last = "Pictures and clips are saved to this device. Nothing is sent anywhere.";
  const tell = (text) => {
    last = text;
    controls.say(text);
  };
  let latest = null;
  const keep3 = (capture) => {
    latest = capture;
    d.onCapture?.(capture);
    if (presenting()) {
      kept2.push(capture);
      tell(`Kept. Save ${kept2.length === 1 ? "it" : `all ${kept2.length}`} from the Camera menu when you leave VR.`);
    } else {
      saveFile(capture.blob, capture.name);
      tell(capture.kind === "clip" ? "Clip saved to this device." : "Picture saved to this device.");
    }
  };
  const shoot = async (kind) => {
    try {
      const hide = d.hide?.() ?? [];
      const blob = kind === "selfie" ? await takeSelfie(d.renderer, d.scene, d.camera, d.look?.() ?? plain, { hide }) : await takePicture(d.renderer, d.scene, d.camera, { hide });
      keep3({ kind, blob, name: `${name}-${kind === "selfie" ? "selfie-" : ""}${stamp()}.jpg` });
    } catch {
      tell("That picture couldn't be taken on this device.");
    }
  };
  const finish = (blob) => {
    clip = null;
    d.recording?.(false);
    keep3({ kind: "clip", blob, name: `${name}-clip-${stamp()}.${blob.type.includes("mp4") ? "mp4" : "webm"}` });
  };
  controls.addSection({ id: "camera", label: "Camera", icon: "camera", note: () => clip ? `Recording: ${Math.floor(clip.seconds())} s. Others in the room can see that you are.` : last });
  controls.add(
    { id: "camera-picture", section: "camera", icon: "camera", label: "Take a picture", short: "Picture", act: () => shoot("picture") },
    { id: "camera-selfie", section: "camera", icon: "selfie", label: "Take a selfie", short: "Selfie", act: () => shoot("selfie") },
    {
      id: "camera-clip",
      section: "camera",
      icon: "record",
      label: () => clip ? "Stop recording" : "Record a clip",
      short: () => clip ? "Stop" : "Clip",
      on: () => !!clip,
      tone: "warn",
      // The page's canvas isn't what a headset is shown, so there is nothing to record there.
      hidden: () => !canRecord() || presenting() && !clip,
      act: async () => {
        if (clip) return void clip.stop();
        try {
          clip = recordClip(d.renderer.domElement, { maxSeconds: d.maxSeconds ?? 30 });
          d.recording?.(true);
          tell(`Recording, picture only, for up to ${d.maxSeconds ?? 30} seconds. Others in the room can see that you are.`);
          void clip.done.then(finish);
        } catch {
          clip = null;
          tell("This device can't record a clip.");
        }
      }
    },
    {
      id: "camera-save",
      section: "camera",
      icon: "save",
      label: () => kept2.length === 1 ? "Save 1 picture" : `Save ${kept2.length} pictures`,
      short: "Save",
      tone: "primary",
      hidden: () => kept2.length === 0 || presenting(),
      act: () => {
        for (const c of kept2.splice(0)) saveFile(c.blob, c.name);
        tell("Saved to this device.");
      }
    }
  );
  return {
    waiting: () => [...kept2],
    last: () => latest,
    get recording() {
      return !!clip;
    }
  };
}

// packages/sdk/src/three.ts
var SEND_EVERY_MS = 66;
var FADE_START = 0.9;
var FADE_END = 0.45;
var TOO_CLOSE = 1;
var ARRIVAL_GAP = 1.4;
function textSprite(text, color, width) {
  const lines = text.split("\n");
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 64 + lines.length * 72;
  const g = canvas.getContext("2d");
  g.fillStyle = "rgba(10,12,18,0.72)";
  g.beginPath();
  g.roundRect(0, 0, canvas.width, canvas.height, 32);
  g.fill();
  g.fillStyle = color;
  g.textBaseline = "top";
  lines.forEach((line, i) => {
    g.font = i === 0 ? "bold 56px system-ui, sans-serif" : "44px system-ui, sans-serif";
    g.fillText(line, 40, 32 + i * 72, canvas.width - 80);
  });
  const tex = new THREE16.CanvasTexture(canvas);
  tex.colorSpace = THREE16.SRGBColorSpace;
  const sprite = new THREE16.Sprite(new THREE16.SpriteMaterial({ map: tex, depthWrite: false }));
  sprite.scale.set(width, width * canvas.height / canvas.width, 1);
  return sprite;
}
function speechSprite(text, width = 0.8) {
  const FULL = 768;
  const PAD = 30;
  const LINE = 54;
  const TAIL = 22;
  const canvas = document.createElement("canvas");
  const g = canvas.getContext("2d");
  const font = "500 42px system-ui, sans-serif";
  g.font = font;
  const rows = wrapWords(text, (t) => g.measureText(t).width, FULL - PAD * 2, 5);
  const wide = Math.ceil(Math.max(80, ...rows.map((r) => g.measureText(r).width))) + PAD * 2;
  canvas.width = Math.min(FULL, wide);
  canvas.height = rows.length * LINE + PAD * 1.4 + TAIL;
  const h = canvas.height - TAIL;
  g.fillStyle = "rgba(246,248,251,0.95)";
  g.beginPath();
  g.roundRect(0, 0, canvas.width, h, 26);
  g.moveTo(canvas.width / 2 - 18, h - 1);
  g.lineTo(canvas.width / 2, canvas.height);
  g.lineTo(canvas.width / 2 + 18, h - 1);
  g.fill();
  g.fillStyle = "#141a22";
  g.font = font;
  g.textBaseline = "middle";
  rows.forEach((row, i) => g.fillText(row, PAD, PAD * 0.7 + LINE * (i + 0.5), canvas.width - PAD * 2));
  const tex = new THREE16.CanvasTexture(canvas);
  tex.colorSpace = THREE16.SRGBColorSpace;
  const sprite = new THREE16.Sprite(new THREE16.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }));
  const metres = width / FULL;
  sprite.scale.set(canvas.width * metres, canvas.height * metres, 1);
  sprite.center.set(0.5, 0);
  return sprite;
}
function createPresence(d) {
  const labelColor = d.labelColor ?? "#ffffff";
  const changed = () => d.onChange?.();
  const listener = new THREE16.AudioListener();
  d.camera.add(listener);
  const avatars = /* @__PURE__ */ new Map();
  const pendingStreams = /* @__PURE__ */ new Map();
  let session = null;
  let roomName = null;
  let sendTimer;
  let micTrack = null;
  let offsetApplied = false;
  let plainSeed;
  let dot = null;
  const glow = (color) => {
    if (!dot) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      const g = canvas.getContext("2d");
      const fade = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      fade.addColorStop(0, "rgba(255,255,255,1)");
      fade.addColorStop(0.35, "rgba(255,255,255,0.85)");
      fade.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = fade;
      g.fillRect(0, 0, 64, 64);
      dot = new THREE16.CanvasTexture(canvas);
    }
    return new THREE16.Sprite(new THREE16.SpriteMaterial({ map: dot, color, transparent: true, depthWrite: false }));
  };
  const showRecording = (a, on) => {
    if (on && !a.light) {
      a.light = glow(16726832);
      a.light.scale.setScalar(0.16);
      a.light.position.set(0, 0.46, 0);
    }
    if (a.light) {
      a.light.visible = on;
      a.head.add(a.light);
    }
  };
  const itemsRule = () => cleanItemsRule2(d.itemsRule?.());
  const canBeHeld = (item) => item.behaviors.includes("holdable") || item.fits.includes("hand-right") || item.fits.includes("hand-left");
  let mine = "";
  let mineModel = null;
  let askedScript = "";
  const itemMutes = /* @__PURE__ */ new Set();
  const hand = () => {
    if (!d.renderer.xr.isPresenting || !d.controllers.length) return -1;
    const sources = [...d.renderer.xr.getSession()?.inputSources ?? []];
    const right = sources.findIndex((s) => s.handedness === "right");
    return right >= 0 && right < d.controllers.length ? right : 0;
  };
  let inHand = -2;
  const placeMine = () => {
    const now = hand();
    if (!mineModel) return;
    if (now < 0) {
      const tall = Math.tan(THREE16.MathUtils.degToRad(d.camera.fov / 2)) * 0.8;
      mineModel.position.set(Math.min(0.34, tall * d.camera.aspect * 0.62), -Math.min(0.5, tall * 0.9), -0.8);
    }
    if (now === inHand) return;
    inHand = now;
    if (now >= 0) {
      mineModel.position.set(0, -0.06, 0.02);
      d.controllers[now].add(mineModel);
    } else d.camera.add(mineModel);
  };
  const play = d.items ? createPlay({
    scene: d.scene,
    camera: d.camera,
    rig: d.rig,
    items: d.items,
    sounds: d.sounds ?? null,
    rule: () => itemsRule(),
    ...d.itemScripts ? { scripts: d.itemScripts } : {},
    me: () => session?.self.pubkey ?? null,
    people: () => [...avatars.values()].filter((a) => a.target && a.root.visible).map((a) => ({ pubkey: a.member.pubkey, head: a.head.getWorldPosition(new THREE16.Vector3()), body: a.torso, over: a.head, holding: a.heldItem ?? "", held: a.held ?? null })),
    itemsMuted: (pubkey) => itemMutes.has(pubkey),
    tell: (said) => session?.tellPlay(said),
    presenting: () => d.renderer.xr.isPresenting,
    // In a headset a thing goes where the hand that holds the item points.
    aim: () => {
      const i = hand();
      const c = i >= 0 ? d.controllers[i] : null;
      if (!c) return null;
      const from = c.getWorldPosition(new THREE16.Vector3());
      return { from, to: from.clone().add(new THREE16.Vector3(0, 0, -18).applyQuaternion(c.getWorldQuaternion(new THREE16.Quaternion()))) };
    },
    ...d.solid ? { solid: d.solid } : {},
    ...d.onStruck ? { onStruck: d.onStruck } : {},
    onChange: () => changed()
  }) : null;
  const showHeld = async (a, item) => {
    if (!a) return;
    a.heldItem = item;
    a.held?.removeFromParent();
    delete a.held;
    if (!item || !d.items || itemsRule() === "none" || !showsItems()) return;
    const described = await d.items.describe(item);
    if (!described || a.heldItem !== item || !canBeHeld(described) || described.use === "granted") return;
    const model = await d.items.model(described);
    if (a.heldItem !== item) return;
    model.position.set(0.3, -0.12, -0.22);
    a.torso.add(model);
    a.held = model;
  };
  const dress = (a, look) => {
    const was = a.figure;
    const figure = createFigure(look, d.figureStyle, { proven: !a.member.guest });
    figure.head.position.copy(was?.head.position ?? figure.head.position);
    figure.head.quaternion.copy(was?.head.quaternion ?? figure.head.quaternion);
    figure.head.add(a.label);
    if (a.picture) figure.head.add(a.picture);
    figure.hands.forEach((h, i) => {
      h.visible = was?.hands[i].visible ?? false;
      if (was) {
        h.position.copy(was.hands[i].position);
        h.quaternion.copy(was.hands[i].quaternion);
      }
    });
    if (was) {
      if (a.audio) figure.head.add(a.audio);
      a.root.remove(was.group);
      was.dispose();
    }
    if (a.light) figure.head.add(a.light);
    if (a.held) figure.torso.add(a.held);
    if (a.beam) figure.head.add(a.beam);
    if (a.bubble) figure.head.add(a.bubble);
    a.root.add(figure.group);
    a.figure = figure;
    a.head = figure.head;
    a.torso = figure.torso;
    a.hands = figure.hands;
    a.materials = [figure.metal, a.label.material, ...a.picture ? [a.picture.material] : []].map((material) => {
      const opacity = material === a.label.material || material === a.picture?.material ? 1 : material.opacity;
      material.transparent = true;
      return { material, opacity };
    });
  };
  const dropBubble = (a) => {
    if (!a.bubble) return;
    a.bubble.removeFromParent();
    a.bubble.material.map?.dispose();
    a.bubble.material.dispose();
    delete a.bubble;
    delete a.bubbleText;
  };
  const showBubble = (a, text, seconds) => {
    dropBubble(a);
    if (d.bubbles === false || !showsChat()) return;
    a.bubble = speechSprite(text);
    a.bubbleText = text;
    a.bubbleFrom = performance.now();
    a.bubbleUntil = a.bubbleFrom + seconds * 1e3;
    a.bubble.material.opacity = 0;
    a.head.add(a.bubble);
  };
  onChatChange(() => {
    if (!showsChat()) for (const a of avatars.values()) dropBubble(a);
  });
  const dropPicture = (a) => {
    if (!a.picture) return;
    a.picture.removeFromParent();
    a.picture.material.map?.dispose();
    a.picture.material.dispose();
    delete a.picture;
  };
  const showPicture = (a) => {
    const from = !a.member.guest && showsPictures() ? a.member.picture ?? "" : "";
    if (from === (a.pictureFrom ?? "")) return;
    a.pictureFrom = from;
    dropPicture(a);
    if (!from) return void dress(a, a.member.look);
    void loadPicture(from).then((canvas) => {
      if (!canvas || a.pictureFrom !== from || !avatars.has(a.member.pubkey)) return;
      const map = new THREE16.CanvasTexture(canvas);
      map.colorSpace = THREE16.SRGBColorSpace;
      const sprite = new THREE16.Sprite(new THREE16.SpriteMaterial({ map, depthWrite: false }));
      sprite.scale.set(0.2, 0.2, 1);
      sprite.position.set(0, 0.63, 0);
      sprite.userData.person = a.member.pubkey;
      a.picture = sprite;
      dress(a, a.member.look);
      changed();
    });
  };
  onPicturesChange(() => {
    for (const a of avatars.values()) showPicture(a);
  });
  let onPerson = () => {
  };
  const makeAvatar = (member) => {
    const root = new THREE16.Group();
    root.visible = false;
    root.userData.nswpNoHit = true;
    const label = textSprite(member.name, labelColor, 0.5);
    label.position.set(0, 0.42, 0);
    d.scene.add(root);
    const a = { member, root, label, target: null, placed: false };
    dress(a, member.look);
    showPicture(a);
    return a;
  };
  let hiddenAll = false;
  let tuneTrack = null;
  const tunes = /* @__PURE__ */ new Map();
  const tuneMuted = /* @__PURE__ */ new Set();
  let hearShared = false;
  let sharedVolume = 0.7;
  let voiceVolume = 1;
  let duck = 1;
  let sinceChoosing = 0;
  const playTune = (a, stream) => {
    if (a.tune) return;
    const el = new Audio();
    el.muted = true;
    el.srcObject = stream;
    void el.play().catch(() => {
    });
    const pa = new THREE16.PositionalAudio(listener);
    pa.setMediaStreamSource(stream);
    pa.setRefDistance(MUSIC_RANGE);
    pa.setVolume(0);
    a.head.add(pa);
    const meter = listener.context.createAnalyser();
    meter.fftSize = 512;
    listener.context.createMediaStreamSource(stream).connect(meter);
    a.tune = pa;
    a.tuneElement = el;
    a.tuneMeter = meter;
    a.tuneVolume = 0;
  };
  const stopTune = (a) => {
    a.tune?.disconnect();
    a.tune?.removeFromParent();
    if (a.tuneElement) a.tuneElement.srcObject = null;
    delete a.tune;
    delete a.tuneElement;
    delete a.tuneMeter;
    a.tuneVolume = 0;
  };
  const rms = (meter, buf) => {
    if (!meter) return 0;
    meter.getFloatTimeDomainData(buf);
    return Math.sqrt(buf.reduce((sum, x) => sum + x * x, 0) / buf.length);
  };
  const levelBuf = new Float32Array(512);
  const headAt = new THREE16.Vector3();
  const theirs = new THREE16.Vector3();
  const tendMusic = (dt) => {
    if (!session) return;
    d.camera.getWorldPosition(headAt);
    const away = (a) => a.head.getWorldPosition(theirs).distanceTo(headAt);
    sinceChoosing += dt;
    if (sinceChoosing > 0.4) {
      sinceChoosing = 0;
      const sharing = [...avatars.values()].filter((a) => a.member.music).map((a) => ({ pubkey: a.member.pubkey, metres: away(a), refused: tuneMuted.has(a.member.pubkey) }));
      const want = new Set(musicToHear(sharing, hearShared));
      for (const a of avatars.values()) {
        const on = want.has(a.member.pubkey);
        session.listen(a.member.pubkey, on);
        const stream = tunes.get(a.member.pubkey);
        if (on && stream) playTune(a, stream);
        else if (!on && a.tune) stopTune(a);
      }
    }
    let speaking = false;
    for (const a of avatars.values()) if (a.analyser && !mutedKeys.has(a.member.pubkey) && rms(a.analyser, levelBuf) > 0.02) speaking = true;
    duck += ((speaking ? MUSIC_DUCK : 1) - duck) * Math.min(1, dt * (speaking ? 8 : 1.5));
    for (const a of avatars.values()) {
      if (!a.tune) continue;
      a.tuneVolume = sharedVolume * duck * musicFade(away(a));
      a.tune.setVolume(a.tuneVolume);
    }
  };
  let screenTrack = null;
  const screens = /* @__PURE__ */ new Map();
  const stopScreen = () => {
    if (!screenTrack) return;
    screenTrack.onended = null;
    screenTrack.stop();
    screenTrack = null;
  };
  let keptBlocks = loadBlocked();
  const blockedNow = /* @__PURE__ */ new Map();
  const fromClient = /* @__PURE__ */ new Set();
  const reported = /* @__PURE__ */ new Set();
  const blockedKeys = () => [.../* @__PURE__ */ new Set([...keptBlocks.map((b) => b.key), ...blockedNow.keys(), ...fromClient])];
  const mutedKeys = /* @__PURE__ */ new Set();
  const attachAudio = (avatar, stream) => {
    if (avatar.audio) return;
    const el = new Audio();
    el.muted = true;
    el.srcObject = stream;
    void el.play().catch(() => {
    });
    const pa = new THREE16.PositionalAudio(listener);
    pa.setMediaStreamSource(stream);
    pa.setRefDistance(1.5);
    pa.setRolloffFactor(1.2);
    avatar.head.add(pa);
    const analyser = listener.context.createAnalyser();
    analyser.fftSize = 512;
    listener.context.createMediaStreamSource(stream).connect(analyser);
    pa.setVolume(mutedKeys.has(avatar.member.pubkey) ? 0 : voiceVolume);
    avatar.audio = pa;
    avatar.element = el;
    avatar.analyser = analyser;
  };
  const removeAvatar = (pubkey) => {
    const a = avatars.get(pubkey);
    if (!a) return;
    avatars.delete(pubkey);
    play?.left(pubkey);
    a.audio?.disconnect();
    stopTune(a);
    if (a.element) a.element.srcObject = null;
    d.scene.remove(a.root);
    dropPicture(a);
    dropBubble(a);
    a.figure.dispose();
  };
  const v = new THREE16.Vector3();
  const q = new THREE16.Quaternion();
  const worldTransform = (o) => {
    o.getWorldPosition(v);
    o.getWorldQuaternion(q);
    return { position: [v.x, v.y, v.z], quaternion: [q.x, q.y, q.z, q.w] };
  };
  const ownPose = () => {
    const pose = { head: worldTransform(d.camera) };
    if (d.renderer.xr.isPresenting) {
      if (d.controllers[0]?.visible) pose.left = worldTransform(d.controllers[0]);
      if (d.controllers[1]?.visible) pose.right = worldTransform(d.controllers[1]);
    }
    return pose;
  };
  const stepApart = (self, other, pose) => {
    if (self < other || d.renderer.xr.isPresenting) return;
    d.camera.getWorldPosition(v);
    const dx = v.x - pose.head.position[0];
    const dz = v.z - pose.head.position[2];
    const dist = Math.hypot(dx, dz);
    if (dist >= TOO_CLOSE) return;
    const ux = dist > 0.01 ? dx / dist : 1;
    const uz = dist > 0.01 ? dz / dist : 0;
    d.rig.position.x += ux * (ARRIVAL_GAP - dist);
    d.rig.position.z += uz * (ARRIVAL_GAP - dist);
  };
  const leave2 = () => {
    if (sendTimer) clearInterval(sendTimer);
    sendTimer = void 0;
    session?.leave();
    session = null;
    stopScreen();
    screens.clear();
    tuneTrack = null;
    tunes.clear();
    for (const key of [...avatars.keys()]) removeAvatar(key);
    pendingStreams.clear();
    changed();
  };
  const join = async (name) => {
    leave2();
    roomName = name;
    void listener.context.resume();
    if (listener.context.state !== "running") {
      const wake = () => {
        void listener.context.resume();
        for (const a of avatars.values()) void a.element?.play().catch(() => {
        });
        removeEventListener("pointerdown", wake, true);
        removeEventListener("keydown", wake, true);
      };
      addEventListener("pointerdown", wake, true);
      addEventListener("keydown", wake, true);
    }
    const look = typeof d.look === "function" ? d.look() : d.look;
    const identity = await byName(typeof d.identity === "function" ? d.identity() : d.identity);
    const s = await room.join({ ...name ? { name } : {}, ...look ? { look } : {}, ...identity ? { identity } : {}, blocked: blockedKeys() });
    session = s;
    if (!offsetApplied) {
      const off = spawnOffset(s.self.pubkey);
      d.rig.position.x += off.x;
      d.rig.position.z += off.z;
      offsetApplied = true;
    }
    s.on("status", changed);
    s.on("recording", (m, on) => {
      const a = avatars.get(m.pubkey);
      if (a) showRecording(a, on);
      changed();
    });
    s.on("holding", (m, item) => {
      void showHeld(avatars.get(m.pubkey), item);
      changed();
    });
    if (mine) s.setHolding(mine);
    s.on("play", (m, said) => play?.heard(m.pubkey, said));
    s.on("look", (m, look2) => {
      const a = avatars.get(m.pubkey);
      if (a) dress(a, look2);
      changed();
    });
    s.on("identity", (m) => {
      const a = avatars.get(m.pubkey);
      if (a) {
        const label = textSprite(m.name, labelColor, 0.5);
        label.position.copy(a.label.position);
        a.label.removeFromParent();
        a.label.material.map?.dispose();
        a.label.material.dispose();
        a.label = label;
        dress(a, m.look);
        showPicture(a);
      }
      changed();
    });
    s.on("member", (m) => {
      const a = makeAvatar(m);
      avatars.set(m.pubkey, a);
      const pending = pendingStreams.get(m.pubkey);
      if (pending) attachAudio(a, pending);
      changed();
    });
    s.on("leave", (m) => {
      screens.delete(m.pubkey);
      tunes.delete(m.pubkey);
      removeAvatar(m.pubkey);
      pendingStreams.delete(m.pubkey);
      changed();
    });
    s.on("said", (m, line) => {
      const a = avatars.get(m.pubkey);
      if (a) showBubble(a, line.text, bubbleSeconds(line.text));
    });
    s.on("pose", (m, pose) => {
      const a = avatars.get(m.pubkey);
      if (!a) return;
      if (!a.target) stepApart(s.self.pubkey, m.pubkey, pose);
      a.target = pose;
    });
    s.on("video", (m, stream) => {
      screens.set(m.pubkey, stream);
    });
    s.on("screen", () => changed());
    s.on("music", (m, stream) => {
      tunes.set(m.pubkey, stream);
    });
    s.on("tune", () => changed());
    s.on("audio", (m, stream) => {
      pendingStreams.set(m.pubkey, stream);
      const a = avatars.get(m.pubkey);
      if (a) attachAudio(a, stream);
    });
    if (micTrack) await s.setMicrophone(micTrack);
    sendTimer = setInterval(() => s.sendPose(ownPose()), SEND_EVERY_MS);
    changed();
  };
  const tp = new THREE16.Vector3();
  const tq = new THREE16.Quaternion();
  const euler = new THREE16.Euler();
  const apply = (o, t, k) => {
    o.position.lerp(tp.set(...t.position), k);
    o.quaternion.slerp(tq.set(...t.quaternion), k);
  };
  return {
    get session() {
      return session;
    },
    get presenting() {
      return d.renderer.xr.isPresenting;
    },
    get roomName() {
      return roomName;
    },
    get micOn() {
      return !!micTrack;
    },
    get screenOn() {
      return !!screenTrack;
    },
    get screenViewers() {
      return session?.screenViewers ?? 0;
    },
    async shareScreen(track) {
      if (!session) {
        track?.stop();
        return;
      }
      stopScreen();
      screenTrack = track;
      if (track) {
        track.contentHint = "detail";
        track.onended = () => {
          if (screenTrack !== track) return;
          screenTrack = null;
          void session?.setScreen(null);
          changed();
        };
      }
      await session.setScreen(track);
      changed();
    },
    watch(pubkey, on) {
      session?.watch(pubkey, on);
      changed();
    },
    isWatching(pubkey) {
      return !!session?.isWatching(pubkey);
    },
    screenOf(pubkey) {
      return screens.get(pubkey) ?? null;
    },
    join,
    leave: leave2,
    async setMicrophone(track) {
      if (!track && micTrack) micTrack.stop();
      micTrack = track;
      await session?.setMicrophone(track);
      changed();
    },
    setRecording(on) {
      session?.setRecording(on);
    },
    get holding() {
      return mine;
    },
    async setHolding(itemIn2) {
      const item = itemCoordinate4(itemIn2);
      const put = () => {
        mine = "";
        mineModel?.removeFromParent();
        mineModel = null;
        inHand = -2;
        void play?.held(null, null);
        session?.setHolding("");
      };
      if (!item) {
        const had = !!mine;
        put();
        return { ok: true, said: had ? "Put away." : "You are holding nothing." };
      }
      if (!d.items || itemsRule() === "none") return { ok: false, said: "Nothing carried is drawn or works in this place." };
      if (!showsItems()) return { ok: false, said: "You have items turned off. Turn them on to hold one." };
      const described = await d.items.describe(item);
      if (!described) return { ok: false, said: "That item's description couldn't be found." };
      if (!canBeHeld(described)) return { ok: false, said: `${described.title} isn't something to hold.` };
      if (described.use === "granted") return { ok: false, said: `${described.title} has to be granted by its maker, which can't be checked here yet.` };
      if (described.script && d.itemScripts && !scriptAllowed(described.script.sha256)) {
        if (askedScript !== described.script.sha256) {
          askedScript = described.script.sha256;
          return { ok: false, said: `${described.title} does things of its own, with code written by its maker (${described.maker.slice(0, 8)}\u2026). It runs shut away on your device: it can't reach the network, your account or anything of this world. Press Hold again to let it.` };
        }
        allowScript(described.script.sha256);
      }
      const model = await d.items.model(described);
      put();
      mine = item;
      mineModel = model;
      placeMine();
      session?.setHolding(item);
      await play?.held(described, model);
      return { ok: true, said: `You are holding ${described.title}. People here can see it.` };
    },
    get play() {
      return play;
    },
    get holdingHand() {
      return mine ? hand() : -1;
    },
    muteItems(pubkey, on) {
      if (on) itemMutes.add(pubkey);
      else itemMutes.delete(pubkey);
      changed();
    },
    isItemsMuted(pubkey) {
      return itemMutes.has(pubkey);
    },
    get itemsRule() {
      return itemsRule();
    },
    selfLook() {
      if (session) return session.self.look;
      const mine2 = typeof d.look === "function" ? d.look() : d.look;
      const read = mine2 ? decodeLook(mine2) : null;
      return read?.ok ? read.value.look : plainSeed ??= `plain-${Math.random().toString(36).slice(2, 12)}`;
    },
    personAt(raycaster) {
      const badges = [...avatars.values()].filter((a) => a.picture && a.root.visible).map((a) => a.picture);
      if (!badges.length) return null;
      const hit = raycaster.intersectObjects(badges, false)[0];
      return hit ? String(hit.object.userData.person) : null;
    },
    whereIs(pubkey) {
      const a = avatars.get(pubkey);
      if (!a?.target) return null;
      d.camera.getWorldPosition(v);
      const to = new THREE16.Vector3().fromArray(a.target.head.position).sub(v);
      const distance = to.length();
      if (distance < 1e-3) return { distance: 0, pan: 0 };
      const right = new THREE16.Vector3(1, 0, 0).applyQuaternion(d.camera.getWorldQuaternion(q));
      const pan = THREE16.MathUtils.clamp(to.normalize().dot(right), -1, 1) * Math.min(1, distance / 1.5);
      return { distance: Math.round(distance * 100) / 100, pan: Math.round(pan * 100) / 100 };
    },
    pressAt(raycaster) {
      const who = this.personAt(raycaster);
      if (who) onPerson(who);
      return who !== null;
    },
    onPerson(cb) {
      onPerson = cb;
    },
    pointOut(pubkey) {
      const a = avatars.get(pubkey);
      if (!a) return;
      if (!a.beam) {
        a.beam = glow(a.member.look.light);
        a.beam.scale.set(0.5, 3.2, 1);
        a.beam.position.set(0, 2.1, 0);
      }
      a.head.add(a.beam);
      a.beam.visible = true;
      a.beamUntil = performance.now() + 4e3;
    },
    people() {
      return [...avatars.values()].map((a) => a.member);
    },
    setHidden(hidden) {
      hiddenAll = hidden;
      if (hidden) for (const a of avatars.values()) a.root.visible = false;
    },
    setVolume(volume) {
      voiceVolume = Math.min(1, Math.max(0, volume));
      for (const a of avatars.values()) a.audio?.setVolume(mutedKeys.has(a.member.pubkey) ? 0 : voiceVolume);
    },
    get musicOn() {
      return !!tuneTrack;
    },
    get musicListeners() {
      return session?.musicListeners ?? 0;
    },
    async shareMusic(track) {
      if (!session) return;
      tuneTrack = track;
      await session.setMusic(track);
      changed();
    },
    setHearShared(on, volume) {
      hearShared = on;
      sharedVolume = Math.min(1, Math.max(0, volume));
      sinceChoosing = 1;
    },
    muteMusic(pubkey, on) {
      if (on) tuneMuted.add(pubkey);
      else tuneMuted.delete(pubkey);
      sinceChoosing = 1;
      changed();
    },
    isMusicMuted(pubkey) {
      return tuneMuted.has(pubkey);
    },
    mute(pubkey, on) {
      if (on) mutedKeys.add(pubkey);
      else mutedKeys.delete(pubkey);
      avatars.get(pubkey)?.audio?.setVolume(on ? 0 : voiceVolume);
      changed();
    },
    isMuted(pubkey) {
      return mutedKeys.has(pubkey);
    },
    block(pubkey) {
      const gone = session?.block(pubkey);
      if (!gone) return null;
      mutedKeys.delete(pubkey);
      if (gone.identity) {
        keptBlocks = withBlocked(keptBlocks, { key: gone.identity, name: gone.name });
        storeBlocked(keptBlocks);
        reported.add(gone.identity);
      } else blockedNow.set(gone.session, gone.name);
      changed();
      return gone.name;
    },
    unblock(key) {
      reported.delete(key);
      if (!fromClient.has(key)) session?.unblock(key);
      if (blockedNow.delete(key)) return changed();
      keptBlocks = withoutBlocked(keptBlocks, key);
      storeBlocked(keptBlocks);
      changed();
    },
    blocked() {
      return [...keptBlocks.map((b) => ({ key: b.key, name: b.name, kept: true })), ...[...blockedNow].map(([key, name]) => ({ key, name, kept: false }))];
    },
    blockAlso(keys) {
      for (const k of keys) if (/^[0-9a-f]{64}$/.test(k)) fromClient.add(k);
    },
    get blockedElsewhere() {
      return [...fromClient].filter((k) => !keptBlocks.some((b) => b.key === k)).length;
    },
    newlyBlocked() {
      return [...reported];
    },
    testTone() {
      const ctx = listener.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.2;
      const dest = ctx.createMediaStreamDestination();
      osc.connect(gain).connect(dest);
      osc.start();
      return dest.stream.getAudioTracks()[0];
    },
    update(dt) {
      tendMusic(dt);
      placeMine();
      const k = 1 - Math.exp(-dt * 14);
      d.camera.getWorldPosition(v);
      for (const a of avatars.values()) {
        if (!a.target) continue;
        const near = THREE16.MathUtils.clamp((a.head.position.distanceTo(v) - FADE_END) / (FADE_START - FADE_END), 0, 1);
        for (const m of a.materials) m.material.opacity = m.opacity * near;
        a.materials[0].material.tick?.(performance.now() / 1e3);
        if (a.beam?.visible && performance.now() > (a.beamUntil ?? 0)) a.beam.visible = false;
        if (a.bubble) {
          const t = performance.now();
          if (t > (a.bubbleUntil ?? 0)) dropBubble(a);
          else {
            a.bubble.material.opacity = near * Math.min(1, (t - (a.bubbleFrom ?? t)) / 160, ((a.bubbleUntil ?? t) - t) / 600);
            a.bubble.position.y = a.picture ? 0.78 : 0.5;
          }
        }
        const snap = a.placed ? k : 1;
        apply(a.head, a.target.head, snap);
        a.placed = true;
        a.root.visible = !hiddenAll;
        euler.setFromQuaternion(a.head.quaternion, "YXZ");
        a.torso.position.set(a.head.position.x, a.head.position.y - 0.45, a.head.position.z);
        a.torso.rotation.set(0, euler.y, 0);
        const hands = [a.target.left, a.target.right];
        hands.forEach((t, i) => {
          const mesh = a.hands[i];
          if (t) {
            apply(mesh, t, mesh.visible ? k : 1);
            mesh.visible = true;
          } else mesh.visible = false;
        });
      }
      play?.update(dt);
    },
    info() {
      const buf = new Float32Array(512);
      return [...avatars.values()].map((a) => {
        let level = 0;
        if (a.analyser) {
          a.analyser.getFloatTimeDomainData(buf);
          level = Math.sqrt(buf.reduce((s, x) => s + x * x, 0) / buf.length);
        }
        return {
          pubkey: a.member.pubkey,
          name: a.member.name,
          visible: a.root.visible,
          opacity: Math.round((a.materials[0]?.material.opacity ?? 1) * 100) / 100,
          head: a.target?.head.position.map((n) => Math.round(n * 100) / 100) ?? null,
          // What they say they hold, and whether anything is drawn for it: for tests.
          holding: a.heldItem || null,
          heldDrawn: !!a.held,
          hands: [!!a.target?.left, !!a.target?.right],
          audioLevel: Math.round(level * 1e3) / 1e3,
          saying: a.bubbleText ?? "",
          muted: mutedKeys.has(a.member.pubkey),
          music: !!a.member.music,
          hearing: !!a.tune,
          musicVolume: Math.round((a.tuneVolume ?? 0) * 1e3) / 1e3,
          musicLevel: Math.round(rms(a.tuneMeter, levelBuf) * 1e3) / 1e3,
          look: a.member.look,
          guest: a.member.guest,
          identity: a.member.identity ?? null
        };
      });
    }
  };
}
function roomNameFromHash(hash) {
  for (const part of hash.replace(/^#/, "").split("&")) {
    if (part.startsWith("room=")) {
      try {
        const v = decodeURIComponent(part.slice(5));
        if (/^[A-Za-z0-9_-]{4,48}$/.test(v)) return v;
      } catch {
      }
    }
  }
  return null;
}
async function capturePanorama(renderer, scene, position, opts = {}) {
  const width = Math.min(4096, Math.max(256, Math.round(opts.width ?? 2048)));
  const height = width / 2;
  const hidden = (opts.hide ?? []).filter((o) => o.visible);
  const xrWasEnabled = renderer.xr.enabled;
  const previousTarget = renderer.getRenderTarget();
  const autoClearWas = renderer.autoClear;
  const fog = scene.fog;
  const faceTarget = new THREE16.WebGLRenderTarget(Math.min(2048, width / 2), Math.min(2048, width / 2), { type: THREE16.HalfFloatType });
  const flatTarget = new THREE16.WebGLRenderTarget(width, height);
  flatTarget.texture.colorSpace = THREE16.SRGBColorSpace;
  const material = new THREE16.ShaderMaterial({
    uniforms: { face: { value: faceTarget.texture }, forward: { value: new THREE16.Vector3() }, up: { value: new THREE16.Vector3() }, right: { value: new THREE16.Vector3() } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `uniform sampler2D face; uniform vec3 forward; uniform vec3 up; uniform vec3 right; varying vec2 vUv;
      void main(){
        float lon = (vUv.x - 0.5) * 6.283185307179586;
        float lat = (vUv.y - 0.5) * 3.141592653589793;
        vec3 dir = vec3(sin(lon) * cos(lat), sin(lat), -cos(lon) * cos(lat));
        float along = dot(dir, forward);
        // Only the directions this view is the best one for (with a hair of overlap).
        if (along < max(abs(dir.x), max(abs(dir.y), abs(dir.z))) - 0.0005) discard;
        vec2 p = vec2(dot(dir, right), dot(dir, up)) / along;
        gl_FragColor = texture2D(face, clamp(p * 0.5 + 0.5, 0.0, 1.0));
        #include <colorspace_fragment>
      }`,
    depthTest: false,
    depthWrite: false
  });
  const quad = new THREE16.Mesh(new THREE16.PlaneGeometry(2, 2), material);
  const quadScene = new THREE16.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE16.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const faceCamera = new THREE16.PerspectiveCamera(90, 1, 0.05, 700);
  faceCamera.position.copy(position);
  const views = [
    [new THREE16.Vector3(0, 0, -1), new THREE16.Vector3(0, 1, 0)],
    [new THREE16.Vector3(1, 0, 0), new THREE16.Vector3(0, 1, 0)],
    [new THREE16.Vector3(0, 0, 1), new THREE16.Vector3(0, 1, 0)],
    [new THREE16.Vector3(-1, 0, 0), new THREE16.Vector3(0, 1, 0)],
    [new THREE16.Vector3(0, 1, 0), new THREE16.Vector3(0, 0, 1)],
    [new THREE16.Vector3(0, -1, 0), new THREE16.Vector3(0, 0, -1)]
  ];
  try {
    for (const o of hidden) o.visible = false;
    scene.fog = null;
    renderer.xr.enabled = false;
    renderer.setRenderTarget(flatTarget);
    renderer.clear();
    for (const [forward, up] of views) {
      faceCamera.up.copy(up);
      faceCamera.lookAt(position.clone().add(forward));
      faceCamera.updateMatrixWorld(true);
      renderer.autoClear = true;
      renderer.setRenderTarget(faceTarget);
      renderer.render(scene, faceCamera);
      material.uniforms.forward.value.copy(forward);
      material.uniforms.up.value.copy(up);
      material.uniforms.right.value.crossVectors(forward, up);
      renderer.autoClear = false;
      renderer.setRenderTarget(flatTarget);
      renderer.render(quadScene, quadCamera);
    }
    const pixels = new Uint8Array(width * height * 4);
    renderer.readRenderTargetPixels(flatTarget, 0, 0, width, height, pixels);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const g = canvas.getContext("2d");
    const image = g.createImageData(width, height);
    for (let y = 0; y < height; y++) image.data.set(pixels.subarray((height - 1 - y) * width * 4, (height - y) * width * 4), y * width * 4);
    g.putImageData(image, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", opts.quality ?? 0.82));
    if (!blob) throw new Error("nswp-sdk: this browser couldn't encode the preview");
    return blob;
  } finally {
    for (const o of hidden) o.visible = true;
    scene.fog = fog;
    renderer.xr.enabled = xrWasEnabled;
    renderer.autoClear = autoClearWas;
    renderer.setRenderTarget(previousTarget);
    faceTarget.dispose();
    flatTarget.dispose();
    material.dispose();
    quad.geometry.dispose();
  }
}
function panoramaTexture(image) {
  const texture = new THREE16.Texture(image);
  texture.colorSpace = THREE16.SRGBColorSpace;
  texture.wrapS = THREE16.RepeatWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE16.LinearFilter;
  texture.magFilter = THREE16.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
function createPortalWindow(geometry, pano, opts = {}) {
  const reach = opts.reach ?? 1.5;
  const material = new THREE16.ShaderMaterial({
    uniforms: {
      pano: { value: pano },
      mask: { value: opts.mask ?? null },
      useMask: { value: opts.mask ? 1 : 0 },
      toLocal: { value: new THREE16.Matrix3() },
      center: { value: new THREE16.Vector3() },
      reach: { value: Number.isFinite(reach) ? reach : 0 }
    },
    vertexShader: `varying vec3 vWorld; varying vec2 vUv;
      void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D pano; uniform sampler2D mask; uniform float useMask; uniform mat3 toLocal; uniform vec3 center; uniform float reach;
      varying vec3 vWorld; varying vec2 vUv;
      void main(){
        if (useMask > 0.5 && texture2D(mask, vUv).a < 0.5) discard;
        vec3 eye = cameraPosition;
        if (reach > 0.0) {
          vec3 away = cameraPosition - center;
          eye = center + away * (reach / (length(away) + reach));
        }
        vec3 dir = normalize(toLocal * (vWorld - eye));
        float lon = atan(dir.x, -dir.z);
        float lat = asin(clamp(dir.y, -1.0, 1.0));
        gl_FragColor = vec4(texture2D(pano, vec2(lon / 6.283185307179586 + 0.5, lat / 3.141592653589793 + 0.5)).rgb, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE16.DoubleSide
  });
  const mesh = new THREE16.Mesh(geometry, material);
  const rotation = new THREE16.Matrix4();
  mesh.onBeforeRender = () => {
    rotation.extractRotation(mesh.matrixWorld);
    material.uniforms.toLocal.value.setFromMatrix4(rotation).invert();
    material.uniforms.center.value.setFromMatrixPosition(mesh.matrixWorld);
  };
  return mesh;
}
var JOINED_KEY = () => `nswp:joined:${location.pathname}`;
function addRoomControls(controls, presence, opts = {}) {
  const useTone = new URLSearchParams(opts.search ?? location.search).get("mic") === "tone";
  const useTestScreen = new URLSearchParams(opts.search ?? location.search).get("screen") === "test";
  const canShare = useTestScreen || typeof navigator.mediaDevices?.getDisplayMedia === "function";
  const sounds = opts.sharedMusic === false ? null : opts.sounds ?? null;
  let invited = roomNameFromHash(location.hash);
  let busy = false;
  let last = invited ? "You were invited to a private room. Joining shows your IP address to the others in it." : "Joining lets you see and hear others here. It shows your IP address to them.";
  const tell = (text) => {
    last = text;
    controls.say(text);
  };
  const status = () => {
    const s = presence.session;
    if (!s) return last;
    const others = s.members.length;
    const who = s.status === "no-relays" ? "can't reach any relay" : others === 0 ? "nobody else here yet" : others === 1 ? "1 other person here" : `${others} other people here`;
    const as = s.self.guest ? "" : ` You are here as ${s.self.name}.`;
    return `${presence.roomName ? "Private room" : "Open room"}: ${who}.${as}${presence.micOn ? " Your microphone is on." : ""}${presence.musicOn ? ` Your music is offered to people near you: ${presence.musicListeners === 0 ? "nobody is hearing it" : presence.musicListeners === 1 ? "1 person is hearing it" : `${presence.musicListeners} people are hearing it`}.` : ""}${presence.screenOn ? ` You are sharing your screen: ${presence.screenViewers === 0 ? "nobody is watching" : presence.screenViewers === 1 ? "1 person is watching" : `${presence.screenViewers} people are watching`}.` : ""}`;
  };
  const waitingFor = /* @__PURE__ */ new Map();
  let watchingSigner = false;
  const askSigner = (what, to, then) => {
    const signer = worldSigner();
    if (!watchingSigner) {
      watchingSigner = true;
      signer.onChange(() => {
        for (const [name, was] of [...waitingFor]) {
          if (!signer.more.includes(name)) continue;
          waitingFor.delete(name);
          if (Date.now() - was.at < 3e5) was.then();
        }
      });
    }
    const where = signer.host ?? "your sign-in address";
    if (signer.offers && !signer.offers.includes(what)) return `${where} doesn't let a world ${to} yet. It can be done at your home.`;
    if (opts.presenting?.()) return `This world needs your say before it can ${to}, once, in a window of ${where} that can't be seen from in here. Step out of the headset and press this again.`;
    waitingFor.set(what, { then, at: Date.now() });
    signer.want([...signer.more, what]);
    return signer.unlock() ? `This world needs your say before it can ${to}: once, in the window of ${where} that has opened.` : `The window of ${where} couldn't be opened. Allow this site to open windows, and press again.`;
  };
  const signedInHere = () => signerNamed() && worldSigner().state === "unlocked" ? worldSigner().pubkey : null;
  const worldFollows = () => ({
    people: worldPeople(),
    pubkey: signedInHere,
    allowed: () => worldSigner().more.includes("follows"),
    ask: (then) => askSigner("follows", "change who you follow", then)
  });
  const worldMessages = () => ({
    messages: createMessages({
      hand: {
        pubkey: signedInHere,
        ready: () => worldSigner().more.includes("messages"),
        seal: (to, text) => worldSigner().seal(to, text),
        open: (wrap2) => worldSigner().unwrap(wrap2),
        reach: (relays) => worldSigner().reach(relays)
      },
      known: (pubkey) => !!follows().people.follows()?.includes(pubkey),
      ...opts.noteRelays ? { relays: opts.noteRelays } : {}
    }),
    pubkey: signedInHere,
    allowed: () => worldSigner().more.includes("messages"),
    ask: (then) => askSigner("messages", "send and read your private messages", then)
  });
  let followsKept = null;
  const follows = () => followsKept ??= opts.follows ?? worldFollows();
  const following = addFollowingControls(controls, {
    follows: follows(),
    ...opts.noteRelays ? { relays: opts.noteRelays } : {},
    keyboard: () => opts.panels?.keyboard ?? null,
    ...opts.presenting ? { presenting: opts.presenting } : {},
    ...opts.about ? { about: opts.about } : {},
    more: (who) => [{ id: "following-write", icon: "chat", label: `Write to ${who.name}, privately`, act: () => messaging.write(who.pubkey) }]
  });
  const messaging = addMessagingControls(controls, {
    hand: opts.messages ?? worldMessages(),
    profiles: following.profiles,
    panels: opts.panels ?? null,
    ...opts.presenting ? { presenting: opts.presenting } : {}
  });
  if (signerNamed()) {
    worldSigner().onChange(() => {
      if (!opts.follows) following.refresh();
      if (!opts.messages) messaging.refresh();
    });
  }
  const followPress = (key, name, adding) => following.press(key, name, adding);
  const refresh = () => {
    const s = presence.session;
    opts.onState?.(
      s ? { name: s.name, private: !!presence.roomName, status: s.status, self: s.self.pubkey, members: s.members.map((m) => m.pubkey), relays: s.relayCount, mic: presence.micOn, screen: presence.screenOn, music: presence.musicOn, musicListeners: presence.musicListeners, sharing: s.members.filter((m) => m.sharing).map((m) => m.pubkey), watching: [...watching.keys()] } : null
    );
    controls.addSection({ id: "room", label: "Room", icon: "room", note: status });
    tendChat();
    tendFeed();
    people();
    remember();
  };
  const remember = () => {
    try {
      if (presence.session) sessionStorage.setItem(JOINED_KEY(), presence.micOn ? "mic" : "joined");
      else if (!busy) sessionStorage.removeItem(JOINED_KEY());
    } catch {
    }
  };
  const microphone = async () => {
    try {
      const track = useTone ? presence.testTone() : (await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })).getAudioTracks()[0];
      await presence.setMicrophone(track);
      return true;
    } catch {
      return false;
    }
  };
  const watching = /* @__PURE__ */ new Map();
  const sharers = /* @__PURE__ */ new Set();
  const stopWatching = (pubkey, panelGone = false) => {
    const w = watching.get(pubkey);
    if (!w) return;
    watching.delete(pubkey);
    presence.watch(pubkey, false);
    w.video.srcObject = null;
    w.texture?.dispose();
    if (!panelGone) w.panel?.close();
  };
  const startWatching = (m) => {
    const stream = presence.screenOf(m.pubkey);
    if (!opts.panels || !stream || watching.has(m.pubkey)) return false;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    const w = { video, texture: null, panel: null };
    watching.set(m.pubkey, w);
    const show = () => {
      if (w.panel || watching.get(m.pubkey) !== w || !video.videoWidth || !video.videoHeight) return;
      w.texture = new THREE16.VideoTexture(video);
      w.texture.colorSpace = THREE16.SRGBColorSpace;
      w.panel = opts.panels.open(
        { kind: "custom", title: `${m.name}'s screen`, texture: w.texture, aspect: video.videoWidth / video.videoHeight, onClose: () => stopWatching(m.pubkey, true) },
        { keep: false }
      );
      refresh();
    };
    video.addEventListener("loadedmetadata", show);
    video.addEventListener("resize", show);
    void video.play().catch(() => {
    });
    presence.watch(m.pubkey, true);
    return true;
  };
  const testScreen = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const g = canvas.getContext("2d");
    let n = 0;
    const draw = () => {
      g.fillStyle = "#10243a";
      g.fillRect(0, 0, 1280, 720);
      g.fillStyle = "#ffd166";
      g.font = "64px sans-serif";
      g.fillText(`A shared screen, frame ${++n}`, 80, 380);
    };
    draw();
    const timer = setInterval(draw, 200);
    const track = canvas.captureStream(10).getVideoTracks()[0];
    track.addEventListener("ended", () => clearInterval(timer));
    return track;
  };
  let listed = [];
  let extras = [];
  let chosen = null;
  let headcount = 0;
  let toldOfMusic = false;
  const blockedNote = () => {
    const n = presence.blocked().length;
    const e = presence.blockedElsewhere;
    return `${n === 0 ? "" : `You have blocked ${n === 1 ? "1 person" : `${n} people`} here: you don't see or hear each other. Unblock anyone below. `}${e === 0 ? "" : `${e === 1 ? "1 person is" : `${e} people are`} blocked wherever you go: that list is kept by the place you set out from, and is changed there. `}`;
  };
  if (opts.arrived?.blocked?.length) presence.blockAlso(opts.arrived.blocked);
  const recorders = /* @__PURE__ */ new Set();
  const choose = (m) => {
    chosen = m.pubkey;
    people();
    presence.pointOut(m.pubkey);
    controls.say(m.identity ? `${m.name} is under the column of light. Their key: ${encodeNpub3(m.identity)}` : `${m.name} is under the column of light. A guest: nobody has vouched for who they are.`);
  };
  presence.onPerson((pubkey) => {
    const m = presence.people().find((x) => x.pubkey === pubkey);
    if (!m) return;
    choose(m);
    controls.signal("show:people");
  });
  controls.add({
    id: "people-pictures",
    section: "people",
    icon: "selfie",
    on: () => showsPictures(),
    label: () => showsPictures() ? "Profile pictures: on" : "Profile pictures: off",
    short: "Pictures",
    act: () => {
      setShowsPictures(!showsPictures());
      controls.say(showsPictures() ? "People's own pictures are shown over their names. Each is fetched from wherever its owner keeps it, which tells that place your address." : "No pictures are fetched or shown, here or in the next world.");
    }
  });
  const people = () => {
    const here = presence.session ? presence.people() : [];
    if (presence.session && here.length !== headcount) controls.signal(here.length > headcount ? "join" : "leave");
    headcount = presence.session ? here.length : 0;
    for (const id of [...listed, ...extras]) controls.remove(id);
    extras = [];
    listed = here.map((m) => `person-${m.pubkey.slice(0, 12)}`);
    if (!here.some((m) => m.pubkey === chosen)) chosen = null;
    controls.addSection({
      id: "people",
      label: "People",
      icon: "people",
      note: () => `${blockedNote()}${!presence.session ? "Join the room to see who else is here." : here.length === 0 ? "Nobody else is here yet." : here.some((m) => m.pubkey === chosen) ? "What they say about themselves is their own words. Muting and blocking are yours alone: nobody is told. Who you follow is public." : `${here.length === 1 ? "1 person is" : `${here.length} people are`} here with you. Select one, or press the picture over their head, to see who they are, and to mute their voice or their music, or block them.`}`,
      // Whoever was chosen, at the head of the section: who they are here, and what they say of themselves.
      card: () => {
        const who2 = here.find((m) => m.pubkey === chosen);
        if (!who2) return null;
        return {
          title: who2.name,
          tag: who2.guest ? "Guest" : "By name",
          proven: !who2.guest,
          // A name is not unique and a picture can be copied: the key behind them is what tells two people apart.
          sub: who2.identity ? shortNpub6(who2.identity) : "Nobody has vouched for who they are.",
          copy: who2.identity ? encodeNpub3(who2.identity) : "",
          text: who2.guest ? "" : who2.about ?? "",
          picture: !who2.guest && showsPictures() ? who2.picture ?? "" : "",
          color: who2.look.light,
          now: [
            // What they have done here, as they say. Only someone who came by name has anything to show.
            ...who2.identity ? opts.about?.lines(who2.identity) ?? [] : [],
            ...who2.recording ? ["Recording what they see"] : [],
            ...who2.sharing ? ["Sharing their screen"] : [],
            ...who2.music ? ["Sharing music"] : [],
            ...presence.isMuted(who2.pubkey) ? ["You have muted their voice"] : []
          ]
        };
      }
    });
    here.forEach(
      (m, i) => controls.add({
        id: listed[i],
        section: "people",
        kind: "swatch",
        color: m.look.light,
        label: () => `${m.name}${m.recording ? ", recording" : ""}${m.sharing ? ", sharing their screen" : ""}${m.music ? ", sharing music" : ""}`,
        act: () => choose(m)
      })
    );
    if (sounds && !toldOfMusic && !sounds.levels.hearShared && here.some((m) => m.music)) {
      toldOfMusic = true;
      controls.say(`${here.find((m) => m.music).name} is sharing music. To hear what people near you share, turn it on in Sound.`);
    }
    for (const key of [...watching.keys()]) if (!here.some((m) => m.pubkey === key && m.sharing)) stopWatching(key);
    for (const m of here) {
      if (m.sharing && !sharers.has(m.pubkey)) controls.say(opts.panels ? `${m.name} is sharing their screen. Select them in People to watch.` : `${m.name} is sharing their screen.`);
      if (m.sharing) sharers.add(m.pubkey);
      else sharers.delete(m.pubkey);
    }
    const who = here.find((m) => m.pubkey === chosen);
    if (who?.sharing && opts.panels) {
      extras.push("person-watch");
      controls.add({
        id: "person-watch",
        section: "people",
        icon: "panel",
        on: () => watching.has(who.pubkey),
        label: () => watching.has(who.pubkey) ? `Stop watching ${who.name}'s screen` : `Watch ${who.name}'s screen`,
        act: () => {
          if (watching.has(who.pubkey)) stopWatching(who.pubkey);
          else if (startWatching(who)) controls.say(`${who.name}'s screen is opening on a panel of your own. Put the panel away to stop.`);
          else controls.say(`${who.name}'s screen can't be shown here.`);
          refresh();
        }
      });
    }
    const me = follows().pubkey();
    if (who?.identity && me && who.identity !== me) {
      const them = who.identity;
      const people2 = follows().people;
      if (follows().allowed() && people2.follows() === null) void people2.load().then(() => refresh());
      extras.push("person-follow");
      controls.add({
        id: "person-follow",
        section: "people",
        icon: "check",
        on: () => people2.isFollowing(them) === true,
        label: () => people2.isFollowing(them) ? `Unfollow ${who.name}` : `Follow ${who.name}`,
        act: () => followPress(them, who.name, !people2.isFollowing(them))
      });
    }
    if (who?.identity && me && who.identity !== me) {
      const them = who.identity;
      extras.push("person-write");
      controls.add({ id: "person-write", section: "people", icon: "chat", label: `Write to ${who.name}, privately`, act: () => messaging.write(them) });
    }
    if (who) {
      extras.push("person-mute", "person-music", "person-block");
      controls.add(
        {
          id: "person-mute",
          section: "people",
          icon: () => presence.isMuted(who.pubkey) ? "mic" : "micOff",
          on: () => presence.isMuted(who.pubkey),
          label: () => presence.isMuted(who.pubkey) ? `Unmute ${who.name}'s voice` : `Mute ${who.name}'s voice`,
          act: () => {
            const now = !presence.isMuted(who.pubkey);
            presence.mute(who.pubkey, now);
            controls.say(now ? `You no longer hear ${who.name} speak. They still see and hear you, and aren't told.` : `You hear ${who.name} speak again.`);
          }
        },
        ...sounds ? [
          {
            id: "person-music",
            section: "people",
            icon: (() => presence.isMusicMuted(who.pubkey) ? "sound" : "soundOff"),
            on: () => presence.isMusicMuted(who.pubkey),
            label: () => presence.isMusicMuted(who.pubkey) ? `Unmute ${who.name}'s music` : `Mute ${who.name}'s music`,
            act: () => {
              const now = !presence.isMusicMuted(who.pubkey);
              presence.muteMusic(who.pubkey, now);
              controls.say(
                now ? `You won't hear music ${who.name} shares. You still hear them speak.` : sounds.levels.hearShared ? `You hear ${who.name}'s music again when they share it and you are near.` : `${who.name}'s music is no longer muted. To hear anyone's shared music, turn it on in Sound.`
              );
            }
          }
        ] : [],
        ...presence.itemsRule === "allowed" ? [
          {
            id: "person-mute-items",
            section: "people",
            icon: "close",
            on: () => presence.isItemsMuted(who.pubkey),
            label: () => presence.isItemsMuted(who.pubkey) ? `Unmute ${who.name}'s items` : `Mute ${who.name}'s items`,
            act: () => {
              const now = !presence.isItemsMuted(who.pubkey);
              presence.muteItems(who.pubkey, now);
              controls.say(now ? `What ${who.name}'s items do can't reach you, and you won't see or hear it. They aren't told.` : `${who.name}'s items are no longer muted.`);
            }
          }
        ] : [],
        {
          id: "person-block",
          section: "people",
          icon: "exit",
          label: `Block ${who.name}`,
          act: () => {
            stopWatching(who.pubkey);
            const name = presence.block(who.pubkey);
            if (!name) return;
            chosen = null;
            controls.say(
              who.identity ? `${name} is blocked. You won't see or hear each other here, now or when they come back by that name. To them, you have left.` : `${name} is blocked for this visit. You won't see or hear each other. A guest gets a new key each visit, so it can't hold beyond this one.`
            );
            refresh();
          }
        }
      );
    }
    for (const b of presence.blocked()) {
      const id = `unblock-${b.key.slice(0, 12)}`;
      extras.push(id);
      controls.add({
        id,
        section: "people",
        icon: "check",
        label: `Unblock ${b.name}${b.kept ? "" : " (blocked this visit)"}`,
        act: () => {
          presence.unblock(b.key);
          controls.say(`${b.name} is no longer blocked. You'll see each other again within half a minute if they are here.`);
          refresh();
        }
      });
    }
    for (const m of here) {
      if (m.recording && !recorders.has(m.pubkey)) controls.say(`${m.name} is recording what they see.`);
      if (m.recording) recorders.add(m.pubkey);
      else recorders.delete(m.pubkey);
    }
  };
  let chatFor = null;
  let chatStops = [];
  const CHAT_W = 768;
  const CHAT_H = 900;
  const WRITE_H = 132;
  let chatPanel = null;
  const drawChatPanel = () => {
    if (!chatPanel) return;
    const view = controls.chat.view();
    if (view.version === chatPanel.drawn) return;
    chatPanel.drawn = view.version;
    const t = controls.theme;
    const g = chatPanel.canvas.getContext("2d");
    g.fillStyle = t.glass;
    g.fillRect(0, 0, CHAT_W, CHAT_H);
    g.textBaseline = "middle";
    const ROW = 46;
    const measure = (text) => g.measureText(text).width;
    let y = CHAT_H - WRITE_H - 18;
    for (let i = view.lines.length - 1; i >= 0; i--) {
      const line = view.lines[i];
      const lead = line.note ? "" : `${line.mine ? "You" : line.who}:`;
      g.font = line.note ? "italic 32px system-ui, sans-serif" : "34px system-ui, sans-serif";
      const rows = wrapWords(lead ? `${lead} ${line.text}` : line.text, measure, CHAT_W - 56, 6);
      y -= rows.length * ROW;
      if (y < 12) break;
      rows.forEach((row, r) => {
        const at = y + ROW * (r + 0.5);
        let x = 28;
        let rest = row;
        if (r === 0 && lead && row.startsWith(lead)) {
          g.font = "600 34px system-ui, sans-serif";
          g.fillStyle = line.mine ? t.ink : line.color || t.accent;
          g.globalAlpha = line.mine ? 0.62 : 1;
          g.fillText(lead, x, at);
          x += measure(lead);
          rest = row.slice(lead.length);
          g.font = "34px system-ui, sans-serif";
        }
        g.globalAlpha = line.note ? 0.62 : 1;
        g.fillStyle = t.ink;
        g.fillText(rest, x, at);
      });
      g.globalAlpha = 1;
      y -= 10;
    }
    if (!view.lines.length) {
      g.font = "32px system-ui, sans-serif";
      g.fillStyle = t.ink;
      g.globalAlpha = 0.7;
      wrapWords("Nobody has written anything yet. What is written here goes to the people in this room, and is kept nowhere.", measure, CHAT_W - 80, 6).forEach((row, r) => g.fillText(row, 40, 200 + r * ROW));
      g.globalAlpha = 1;
    }
    g.strokeStyle = t.accent;
    g.lineWidth = 3;
    g.fillStyle = `rgba(${rgb(t.accent)}, 0.16)`;
    g.beginPath();
    g.roundRect(20, CHAT_H - WRITE_H + 12, CHAT_W - 40, WRITE_H - 32, 22);
    g.fill();
    g.stroke();
    g.font = "600 36px system-ui, sans-serif";
    g.fillStyle = t.ink;
    g.textAlign = "center";
    g.fillText("Write to the room", CHAT_W / 2, CHAT_H - WRITE_H / 2 - 4);
    g.textAlign = "left";
    chatPanel.texture.needsUpdate = true;
    controls.chat.seen();
  };
  const closeChatPanel = () => {
    const was = chatPanel;
    chatPanel = null;
    was?.texture.dispose();
    was?.panel.close();
  };
  const writeInHeadset = () => {
    if (!opts.panels || !controls.chat.view().ready) return;
    void opts.panels.keyboard.ask({ title: "Write to the room. Done sends it.", maxLength: CHAT_LIMITS.chars }).then((text) => {
      const trouble = text ? controls.chat.send(text) : null;
      if (trouble) tell(trouble);
    });
  };
  const openChatPanel = () => {
    if (!opts.panels || chatPanel || !controls.chat.view().ready) return;
    const canvas = document.createElement("canvas");
    canvas.width = CHAT_W;
    canvas.height = CHAT_H;
    const texture = new THREE16.CanvasTexture(canvas);
    texture.colorSpace = THREE16.SRGBColorSpace;
    try {
      const panel = opts.panels.open(
        {
          kind: "custom",
          title: controls.chat.view().title,
          texture,
          aspect: CHAT_W / CHAT_H,
          onPress: (_x, y) => {
            if (y > 1 - WRITE_H / CHAT_H) writeInHeadset();
          },
          onClose: () => {
            if (chatPanel?.texture === texture) chatPanel = null;
            texture.dispose();
          }
        },
        // To one side of where they are looking, an arm's reach away, and pinned: it comes with them until they unpin it.
        { id: "room-chat", keep: false, place: { width: 0.46 }, pin: [-0.46, -0.04, -0.8] }
      );
      chatPanel = { panel, canvas, texture, drawn: -1 };
      drawChatPanel();
    } catch (err) {
      texture.dispose();
      tell(err instanceof Error ? err.message.replace(/^nswp-sdk: /, "") : "The chat panel couldn't be opened.");
    }
  };
  controls.subscribe(drawChatPanel);
  const tendChat = () => {
    const s = presence.session;
    if (s === chatFor) return;
    for (const stop of chatStops) stop();
    chatStops = [];
    chatFor = s;
    controls.chat.detach();
    closeChatPanel();
    if (!s) return;
    controls.chat.attach(
      (text) => {
        const how = s.say(text);
        if (how === "slow") return "That is a lot at once. Wait a moment, then send it again.";
        if (how === "said" && s.members.length === 0) controls.chat.add({ note: true, text: "Nobody else is in the room yet, so nobody read that." });
        return null;
      },
      { title: presence.roomName ? "Private room chat" : "Room chat" }
    );
    chatStops.push(
      s.on("said", (m, line) => {
        const mine = m.pubkey === s.self.pubkey;
        controls.chat.add({ id: line.id, who: m.name, text: line.text, mine, color: `#${m.color.toString(16).padStart(6, "0")}` });
        if (mine || !showsChat()) return;
        controls.signal("heard");
        const where = presence.whereIs(m.pubkey);
        opts.sounds?.play("chat", where ?? { distance: 3 });
      }),
      // Who comes and goes is said in the chat too. A moment is waited for a name: a pass is shown just after arriving.
      s.on("member", (m) => {
        setTimeout(() => {
          if (chatFor === s && s.members.includes(m)) controls.chat.add({ note: true, text: `${m.name} is here.` });
        }, 1500);
      }),
      s.on("leave", (m) => controls.chat.add({ note: true, text: `${m.name} left.` }))
    );
  };
  onChatChange(() => {
    if (!showsChat()) closeChatPanel();
    refresh();
  });
  const notes = opts.notes ?? {
    ready: () => worldSigner().state === "unlocked",
    sign: (n) => worldSigner().sign(n),
    onChange: (fn) => worldSigner().onChange(fn),
    locked: () => worldSigner().state === "locked",
    unlock: () => worldSigner().unlock(),
    host: () => worldSigner().host,
    unanswered: () => worldSigner().unanswered ? unansweredWords(worldSigner()) : null,
    pubkey: () => worldSigner().pubkey,
    who: () => hereAs()?.name || worldSigner().name
  };
  const usualRelays = () => opts.noteRelays ?? DEFAULT_RELAYS10;
  let relaysKept = null;
  const ownRelays = (key) => {
    if (!key) return Promise.resolve([]);
    if (relaysKept && relaysKept.key === key && Date.now() - relaysKept.at < 6e5) return relaysKept.found;
    const found = askWell({ kinds: [RELAY_LIST_KIND7], authors: [key], limit: 4 }, { own: [], usual: usualRelays(), timeoutMs: 2500 }).then((got) => readRelayList7(got.events, key)?.write ?? []).catch(() => []);
    relaysKept = { key, at: Date.now(), found };
    return found;
  };
  let wantsFeed = false;
  const postNote = async (words) => {
    const signed = await notes.sign({ kind: 1, content: words, tags: [] }).catch(() => null);
    const note = signed && verifyEvent7(signed) && signed.kind === 1 && signed.content === words ? signed : null;
    if (!note) return { ok: false, said: "That wasn't sent: your sign-in said no." };
    const to = await sendWell(note, { own: await ownRelays(note.pubkey), usual: usualRelays() }).catch(() => null);
    const kept3 = to?.took ?? 0;
    const n = to?.relays.length ?? 0;
    const own = to?.own ?? 0;
    const where = own === n ? `${kept3} of your ${n} relays` : own ? `${kept3} of ${n} relays: yours, and the usual ones because too few of your own were answering` : `${kept3} of the ${n} usual relays: you have published no relay list of your own`;
    return kept3 ? { ok: true, said: `Sent out, to ${where}. Anyone can read it now.` } : { ok: false, said: "Signed, but no relay took it. It wasn't sent." };
  };
  const loadPosts = async () => {
    const key = notes.pubkey?.();
    if (!key) return [];
    const got = await askWell({ kinds: [1], authors: [key], limit: FEED_LIMITS.kept }, { own: await ownRelays(key), usual: usualRelays(), timeoutMs: 5e3 });
    if (!got.events.length && !Object.values(got.relays).some((said) => said === "eose")) return null;
    return got.events.filter((e) => e.pubkey === key && e.kind === 1 && !e.tags.some((t) => t[0] === "e")).map((e) => ({ id: e.id, text: e.content, at: e.created_at }));
  };
  let feedFor = null;
  const FEED_LEAD = 150;
  let feedPanel = null;
  const closeFeedPanel = () => {
    const was = feedPanel;
    feedPanel = null;
    was?.texture.dispose();
    was?.panel.close();
  };
  const tendFeed = () => {
    const key = notes.ready() ? notes.pubkey?.() ?? "" : null;
    if (key === feedFor) return;
    feedFor = key;
    if (key === null) {
      controls.feed.detach();
      return closeFeedPanel();
    }
    controls.feed.attach({ who: () => notes.who?.() || (key ? shortNpub6(key) : "you"), marked: opts.notes ? opts.notes.marked?.() ?? "" : location.host, send: postNote, load: loadPosts });
  };
  const drawFeedPanel = () => {
    if (!feedPanel) return;
    const view = controls.feed.view();
    const stamp2 = `${view.version}:${Math.floor(Date.now() / 6e4)}:${view.lead}`;
    if (stamp2 === feedPanel.drawn) return;
    feedPanel.drawn = stamp2;
    const t = controls.theme;
    const g = feedPanel.canvas.getContext("2d");
    g.fillStyle = t.glass;
    g.fillRect(0, 0, CHAT_W, CHAT_H);
    g.textBaseline = "middle";
    g.textAlign = "left";
    const ROW = 44;
    const measure = (text) => g.measureText(text).width;
    g.font = "30px system-ui, sans-serif";
    g.fillStyle = t.ink;
    g.globalAlpha = 0.72;
    g.font = "27px system-ui, sans-serif";
    wrapWords(view.lead, measure, CHAT_W - 56, 4).forEach((row, r) => g.fillText(row, 28, 24 + r * 33));
    g.globalAlpha = 1;
    g.strokeStyle = t.accent;
    g.lineWidth = 3;
    g.fillStyle = `rgba(${rgb(t.accent)}, 0.16)`;
    g.beginPath();
    g.roundRect(20, FEED_LEAD, CHAT_W - 40, WRITE_H - 32, 22);
    g.fill();
    g.stroke();
    g.font = "600 36px system-ui, sans-serif";
    g.fillStyle = t.ink;
    g.textAlign = "center";
    g.fillText("Send out a post", CHAT_W / 2, FEED_LEAD + (WRITE_H - 32) / 2);
    g.textAlign = "left";
    let y = FEED_LEAD + WRITE_H;
    const say = (text) => {
      g.font = "italic 30px system-ui, sans-serif";
      g.globalAlpha = 0.7;
      wrapWords(text, measure, CHAT_W - 56, 3).forEach((row, r) => g.fillText(row, 28, y + ROW * (r + 0.5)));
      g.globalAlpha = 1;
      y += ROW * 2;
    };
    if (view.said) say(view.said);
    if (!view.posts.length) say(view.loading ? "Fetching your posts\u2026" : "Nothing here yet. What you send out appears here, and on Nostr for anyone to read.");
    const nowSec = Math.floor(Date.now() / 1e3);
    for (const post of view.posts) {
      g.font = "33px system-ui, sans-serif";
      const rows = wrapWords(post.text, measure, CHAT_W - 56, 5);
      if (y + (rows.length + 1) * ROW > CHAT_H - 10) break;
      g.fillStyle = t.ink;
      g.globalAlpha = post.state === "sending" ? 0.6 : 1;
      rows.forEach((row, r) => g.fillText(row, 28, y + ROW * (r + 0.5)));
      y += rows.length * ROW;
      g.font = "26px system-ui, sans-serif";
      g.fillStyle = post.state === "failed" ? t.warn : t.ink;
      g.globalAlpha = post.state === "failed" ? 1 : 0.55;
      g.fillText(post.state === "sending" ? "Sending\u2026" : post.state === "failed" ? "Not sent" : ago(post.at, nowSec), 28, y + 20);
      g.globalAlpha = 0.14;
      g.fillStyle = t.ink;
      g.fillRect(28, y + ROW + 4, CHAT_W - 56, 2);
      g.globalAlpha = 1;
      y += ROW + 16;
    }
    feedPanel.texture.needsUpdate = true;
  };
  const openFeedPanel = () => {
    if (!opts.panels || feedPanel || !controls.feed.view().ready) return;
    const canvas = document.createElement("canvas");
    canvas.width = CHAT_W;
    canvas.height = CHAT_H;
    const texture = new THREE16.CanvasTexture(canvas);
    texture.colorSpace = THREE16.SRGBColorSpace;
    try {
      const panel = opts.panels.open(
        {
          kind: "custom",
          title: controls.feed.view().title,
          texture,
          aspect: CHAT_W / CHAT_H,
          onPress: (_x, y) => {
            if (y < FEED_LEAD / CHAT_H || y > (FEED_LEAD + WRITE_H) / CHAT_H || !opts.panels) return;
            void opts.panels.keyboard.ask({ title: "Write a post. Done sends it out, for anyone to read.", maxLength: CHAT_LIMITS.chars }).then((text) => {
              const trouble = text ? controls.feed.send(text) : null;
              if (trouble) tell(trouble);
            });
          },
          onClose: () => {
            if (feedPanel?.texture === texture) feedPanel = null;
            texture.dispose();
          }
        },
        // On the other side from the room's chat, so both can be up.
        { id: "my-feed", keep: false, place: { width: 0.46 }, pin: [0.46, -0.04, -0.8] }
      );
      feedPanel = { panel, canvas, texture, drawn: "" };
      controls.feed.opened();
      drawFeedPanel();
    } catch (err) {
      texture.dispose();
      tell(err instanceof Error ? err.message.replace(/^nswp-sdk: /, "") : "Your feed couldn't be opened.");
    }
  };
  controls.subscribe(drawFeedPanel);
  const openFeed = () => {
    if (presence.presenting && opts.panels) return feedPanel ? closeFeedPanel() : openFeedPanel();
    controls.signal("toggle:feed");
  };
  notes.onChange?.(() => {
    tendFeed();
    if (notes.ready() && wantsFeed) {
      wantsFeed = false;
      openFeed();
    }
    refresh();
  });
  let turning = false;
  const asWhoTheyAre = async () => {
    const s = presence.session;
    if (!s || busy || turning) return;
    const who = hereAs();
    if (!!who === !s.self.guest) return;
    turning = busy = true;
    const mic = presence.micOn;
    const name = presence.roomName;
    for (const key of [...watching.keys()]) stopWatching(key);
    presence.leave();
    try {
      await presence.join(name);
      if (mic) await microphone();
      tell(presence.session?.self.guest ? "The room sees a guest now." : `The room sees you as ${presence.session?.self.name} now.`);
    } catch {
      tell("You left the room, and joining it again didn't work. Join it again from here.");
    } finally {
      turning = busy = false;
      refresh();
    }
  };
  if (signerNamed()) {
    worldSigner().onChange(() => void asWhoTheyAre());
    onHereAs(() => {
      void asWhoTheyAre();
      refresh();
    });
  }
  controls.add(
    {
      id: "room-chat",
      section: "room",
      hotbar: true,
      icon: "chat",
      label: () => {
        const n = controls.chat.view().unread;
        return n ? `Chat: ${n} new` : "Chat";
      },
      short: () => {
        const n = controls.chat.view().unread;
        return n ? `Chat ${n}` : "Chat";
      },
      on: () => controls.chat.view().unread > 0,
      hidden: () => !presence.session || !showsChat(),
      act: () => {
        if (presence.presenting && opts.panels) return chatPanel ? closeChatPanel() : openChatPanel();
        controls.signal("toggle:chat");
      }
    },
    {
      id: "feed",
      section: "room",
      icon: "note",
      // It is here whenever there is something to post with, signed in or not: a row that isn't there can't be
      // found. Signed out, it says what comes first, and pressing it starts that.
      label: () => {
        if (notes.ready()) return "Send out a post";
        const host = notes.host?.() ?? "your sign-in address";
        return notes.unanswered?.() ? `Sending out a post isn't available: ${host} didn't answer` : `Send out a post: sign in at ${host} first`;
      },
      short: "Post",
      hidden: () => !(notes.ready() || notes.locked?.() || notes.unanswered?.()),
      act: () => {
        if (notes.ready()) return openFeed();
        const why = notes.unanswered?.();
        if (why) return tell(why);
        const host = notes.host?.() ?? "your sign-in address";
        if (presence.presenting) return tell(`A window from ${host} is needed first, and none can open in a headset. Leave the headset view for a moment, press this again, and come back in.`);
        wantsFeed = !!notes.unlock?.();
        tell(
          wantsFeed ? `A window from ${host} has opened. Sign in there if it asks, and say yes. Then your public feed opens here.` : `Your browser didn't let a window open. Allow pop-ups for this site and press this again. Nothing is typed in this world: ${host} asks.`
        );
      }
    },
    {
      id: "room-chat-show",
      section: "room",
      icon: "chat",
      label: () => showsChat() ? "Written chat: on" : "Written chat: off",
      on: () => showsChat(),
      act: () => {
        setShowsChat(!showsChat());
        tell(showsChat() ? "What people write in a room is shown to you, and you can write. It goes only to the people in the room, and is kept nowhere." : "Nothing anyone writes is shown to you, here or in the next world, and nobody is told.");
      }
    },
    {
      id: "room-join",
      section: "room",
      hotbar: true,
      icon: () => presence.session ? "leave" : "room",
      label: () => presence.session ? "Leave the room" : "Join the room",
      short: () => presence.session ? "Leave" : "Join",
      on: () => !!presence.session,
      hidden: () => busy,
      act: async () => {
        if (presence.session) {
          for (const key of [...watching.keys()]) stopWatching(key);
          presence.leave();
          controls.signal("leave");
          tell("You left the room.");
          return refresh();
        }
        busy = true;
        try {
          await presence.join(invited);
          controls.signal("join");
        } catch (err) {
          tell(`Couldn't join: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
          busy = false;
          refresh();
        }
      }
    },
    {
      id: "room-mic",
      section: "room",
      hotbar: true,
      icon: () => presence.micOn ? "mic" : "micOff",
      label: () => presence.micOn ? "Turn microphone off" : "Turn microphone on",
      short: "Mic",
      on: () => presence.micOn,
      hidden: () => !presence.session,
      act: async () => {
        if (presence.micOn) {
          await presence.setMicrophone(null);
          controls.signal("micOff");
        } else if (await microphone()) controls.signal("micOn");
        else tell("The microphone is blocked or unavailable.");
        refresh();
      }
    },
    ...sounds ? [
      {
        id: "sound-share",
        section: "sound",
        icon: "sound",
        on: () => presence.musicOn,
        label: () => presence.musicOn ? "Sharing your music with people near you: on" : "Share your music with people near you",
        hidden: () => !presence.session || sounds.jukebox.list().length === 0,
        act: async () => {
          if (presence.musicOn) {
            await presence.shareMusic(null);
            tell("You stopped sharing your music.");
            return refresh();
          }
          await presence.shareMusic(sounds.jukebox.output());
          tell(
            `Your music is offered to people near you. It reaches only those who have chosen to hear shared music, and fades with distance.${presence.micOn ? " With your microphone on, wear headphones, or they hear it twice." : ""}`
          );
          refresh();
        }
      },
      {
        id: "sound-hear",
        section: "sound",
        icon: "sound",
        on: () => sounds.levels.hearShared,
        label: () => sounds.levels.hearShared ? "Hear music others share: on" : "Hear music others share: off",
        act: () => {
          sounds.setLevels({ hearShared: !sounds.levels.hearShared });
          controls.say(sounds.levels.hearShared ? "You'll hear music that people near you share, quieter the further they are." : "You won't hear anyone's shared music.");
        }
      },
      {
        id: "sound-shared",
        section: "sound",
        hidden: () => !sounds.levels.hearShared,
        on: () => sounds.levels.shared > 0,
        label: () => `Others' music: ${LEVEL_WORDS[levelStep(sounds.levels.shared)]}`,
        act: () => sounds.setLevels({ shared: nextLevel(sounds.levels.shared) })
      }
    ] : [],
    {
      id: "room-screen",
      section: "room",
      icon: "panel",
      on: () => presence.screenOn,
      label: () => presence.screenOn ? "Stop sharing your screen" : "Share your screen",
      // A phone or a headset's browser can't offer a screen. It can still watch one.
      hidden: () => !presence.session || !canShare,
      act: async () => {
        if (presence.screenOn) {
          await presence.shareScreen(null);
          tell("You stopped sharing your screen.");
          return refresh();
        }
        try {
          const track = useTestScreen ? testScreen() : (await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 15, max: 30 } }, audio: false })).getVideoTracks()[0];
          await presence.shareScreen(track);
          tell("Your screen is offered to this room. It is sent only to people who choose to watch. Share one window if anything else on your screen is private.");
        } catch {
          tell("Nothing was shared.");
        }
        refresh();
      }
    },
    {
      id: "room-invite",
      section: "room",
      icon: "link",
      label: () => presence.roomName ? "Copy invite link" : "Make a private room",
      hidden: () => !presence.session,
      act: async () => {
        if (!presence.roomName) {
          const bytes = crypto.getRandomValues(new Uint8Array(9));
          const code = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_");
          history.replaceState(history.state, "", `${location.pathname}${location.search}#room=${code}`);
          invited = code;
          await presence.join(code);
        }
        try {
          await navigator.clipboard.writeText(location.href);
          tell("Invite link copied. Anyone with it can join.");
        } catch {
          tell("Copy this page's address to invite someone.");
        }
        refresh();
      }
    }
  );
  (opts.sounds ?? null)?.onChange((l) => {
    presence.setVolume(l.off ? 0 : l.voices);
    presence.setHearShared(!!sounds && !l.off && l.hearShared, l.shared);
  });
  let kept2 = null;
  try {
    kept2 = wasRefreshed() ? sessionStorage.getItem(JOINED_KEY()) : null;
  } catch {
  }
  refresh();
  const carried = opts.arrived?.joined ? { mic: !!opts.arrived.mic, from: "there" } : kept2 ? { mic: kept2 === "mic", from: "refresh" } : null;
  if (carried && (carried.from === "refresh" || !invited)) {
    busy = true;
    void (async () => {
      try {
        await presence.join(carried.from === "refresh" ? invited : null);
        const heard = carried.mic ? await microphone() : false;
        const early = 2500 - performance.now();
        if (early > 0) await new Promise((done) => setTimeout(done, early));
        tell(
          `You are still in the room${carried.from === "there" ? ", as you were where you came from" : ""}: others here can see you${heard ? " and hear you" : ""}.${carried.mic && !heard ? " Your microphone is off here: the browser didn't allow it." : ""} Leave is where Join was.`
        );
      } catch (err) {
        tell(`Couldn't stay joined: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        busy = false;
        refresh();
      }
    })();
  }
  return {
    refresh,
    following,
    messaging,
    travelling: () => ({ joined: !!presence.session && !presence.roomName, mic: !!presence.session && !presence.roomName && presence.micOn, blocked: presence.newlyBlocked() })
  };
}
function offerHeadset(title, enter, stay) {
  const scrim = document.createElement("div");
  scrim.id = "nswp-enter";
  scrim.setAttribute("role", "dialog");
  scrim.setAttribute("aria-label", `You've arrived at ${title}`);
  Object.assign(scrim.style, { position: "fixed", inset: "0", zIndex: "50", display: "grid", placeContent: "center", justifyItems: "center", gap: "18px", padding: "24px", background: "rgba(4, 7, 11, 0.62)", textAlign: "center" });
  const heading = document.createElement("p");
  heading.textContent = title;
  Object.assign(heading.style, { margin: "0", font: "700 clamp(28px, 6vw, 56px)/1.1 system-ui, sans-serif", color: "#eef5fb" });
  const go = document.createElement("button");
  go.type = "button";
  go.id = "nswp-enter-vr";
  go.textContent = "Enter VR";
  Object.assign(go.style, { font: "700 clamp(24px, 5vw, 40px)/1 system-ui, sans-serif", minWidth: "min(78vw, 520px)", minHeight: "120px", padding: "0 32px", border: "0", borderRadius: "18px", background: "#eef5fb", color: "#04070b", cursor: "pointer" });
  const flat = document.createElement("button");
  flat.type = "button";
  flat.id = "nswp-enter-flat";
  flat.textContent = "Look around on this screen";
  Object.assign(flat.style, { font: "500 18px/1 system-ui, sans-serif", padding: "14px 20px", border: "0", background: "none", color: "#eef5fb", textDecoration: "underline", cursor: "pointer" });
  scrim.append(heading, go, flat);
  const remove = () => {
    removeEventListener("keydown", onKey);
    scrim.remove();
  };
  const onKey = (e) => {
    if (e.key === "Escape") stay();
  };
  go.addEventListener("click", enter);
  flat.addEventListener("click", stay);
  addEventListener("keydown", onKey);
  document.body.append(scrim);
  go.focus();
  return { remove };
}
async function addViewControls(controls, d) {
  if (!controls.has("fresh")) controls.add(freshAction(controls, { busy: () => d.renderer.xr.isPresenting }));
  const xr = navigator.xr;
  let supported = false;
  try {
    supported = xr ? await xr.isSessionSupported("immersive-vr") : false;
  } catch {
  }
  const presenting = () => d.renderer.xr.isPresenting;
  d.renderer.xr.addEventListener("sessionstart", () => d.hud?.setHidden(true));
  d.renderer.xr.addEventListener("sessionend", () => d.hud?.setHidden(false));
  let offer = null;
  const answered = () => {
    if (!offer) return;
    offer.remove();
    offer = null;
    d.onOffer?.(false);
  };
  const enter = async () => {
    if (presenting()) return;
    try {
      const session = await xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "hand-tracking"] });
      await d.renderer.xr.setSession(session);
      d.onState?.("presenting");
      session.addEventListener("end", () => d.onState?.("ended"));
      answered();
    } catch (err) {
      d.onState?.(`error: ${err instanceof Error ? err.message : String(err)}`);
      controls.say("Couldn't start VR on this device.");
    }
  };
  try {
    xr?.addEventListener?.("sessiongranted", () => void enter());
  } catch {
  }
  if (supported && d.arrived && !presenting()) {
    offer = offerHeadset(d.arrived.title, () => void enter(), answered);
    d.onOffer?.(true);
  }
  controls.add(
    {
      id: "vr",
      section: "view",
      icon: "vr",
      tone: "primary",
      hotbar: true,
      hidden: () => !supported,
      label: () => presenting() ? "Leave VR" : "Enter VR",
      short: "VR",
      act: async () => {
        if (presenting()) return void await d.renderer.xr.getSession()?.end();
        await enter();
      }
    },
    { id: "turn", section: "view", icon: "turn", label: "Turn around", act: () => turnVisitor(d.rig, d.camera, 180) },
    fullscreenAction(controls, presenting)
  );
  addDeskControls(controls, { presenting });
  if (d.fov !== false && d.camera.isPerspectiveCamera) watchFov(d.camera, { presenting });
  if (!controls.has("identity") && identityHost()) {
    const leaving = async (to) => ({ ...await d.leaving?.(to), xrSession: d.renderer.xr.getSession() });
    controls.addSection(identitySection());
    controls.add(figureAction(controls, leaving), identityAction(controls, leaving), signerAction(controls, { presenting: () => d.renderer.xr.isPresenting }));
  }
  document.addEventListener("fullscreenchange", () => controls.setTarget(""));
  controls.addSection({
    id: "view",
    label: "View",
    icon: "vr",
    note: supported ? "In a headset, raise your wrist or select the small Menu button low in front of you to reach these controls." : "This device can't enter VR. Everything here works without it."
  });
  return supported;
}

export {
  SKY_GLSL,
  createAlloy,
  MeshBuilder,
  createFigure,
  CUES,
  turnVisitor,
  createConsole,
  LOOK_STEPS,
  FOV_STEPS,
  lookScale,
  setLookScale,
  visitorFov,
  setVisitorFov,
  onDeskChange,
  addDeskControls,
  watchFov,
  watchFresh,
  freshAction,
  ITEM_BUDGET,
  showsItems,
  setShowsItems,
  onItemsChange,
  withinBudget,
  fitToSize,
  createItems,
  runInBox,
  scriptAllowed,
  allowScript,
  createPlay,
  readProfile,
  createProfiles,
  keyIn,
  addFollowingControls,
  createMessages,
  addMessagingControls,
  createPeople,
  createSaves,
  createWorldSigner,
  signerNamed,
  hereAs,
  onHereAs,
  seekPass,
  byName,
  identityWords,
  youCard,
  identityHost,
  identitySection,
  identityAction,
  worldSigner,
  worldSaves,
  worldPeople,
  signerAction,
  figureAction,
  WALK_SPEED,
  RUN,
  KEY_TURN,
  TOP_SPEED,
  DOUBLE_TAP,
  TAP_REACH,
  PATH_MOST,
  FACE_RATE,
  DRAG_LOOK,
  reachOf,
  dotsBetween,
  createStepPace,
  createStroll,
  readPad,
  DEFAULT_COMFORT,
  CASUAL_COMFORT,
  INTENSE_COMFORT,
  isIntense,
  createXrInput,
  PANEL_LOOKS,
  PANEL_LIMITS,
  LIBRARY_LIMITS,
  createKeyboard,
  createLibrary,
  createPanels,
  addPanelControls,
  createFloorMarks,
  PORTAL_WIDTH,
  PORTAL_HEIGHT,
  PORTAL_SPRING,
  PORTAL_SIGN_HEIGHT,
  DOOR_REACH,
  LOOK_SPEED,
  PITCH_LIMIT,
  SPRINT,
  lookAfter,
  strideOf,
  heldKey,
  createFps,
  JUMP_HEIGHT,
  JUMP_GRAVITY,
  JUMP_SPEED,
  createJump,
  addJump,
  viewScale,
  createScores,
  addScoreControls,
  createBag,
  itemIn,
  addBagControls,
  addItemControls,
  createDoorRatings,
  ordinal,
  someOf,
  worldPersonLines,
  createAchievements,
  addAchievementControls,
  createSounds,
  addSoundControls,
  CHAMBER_ORDER,
  createChamber,
  createCrossing,
  takePicture,
  takeSelfie,
  canRecord,
  recordClip,
  saveFile,
  addCameraControls,
  textSprite,
  speechSprite,
  createPresence,
  capturePanorama,
  panoramaTexture,
  createPortalWindow,
  addRoomControls,
  addViewControls
};
