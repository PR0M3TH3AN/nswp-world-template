import {
  room
} from "./shared-E3UFEQZL.js";
import {
  ICONS,
  rgb
} from "./shared-64R25HDC.js";

// packages/sdk/src/three.ts
import * as THREE9 from "three";
import { decodeLook, encodeNpub, spawnOffset } from "@nswp/core";

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
  const cloth = (row, rows, side, sides, turn = 0) => {
    const a = (side + 0.5) / sides * Math.PI * 2 + turn;
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
  const turned = (profile, sides, band, turn = 0) => b.lathe(profile, [0, 0, 0], sides, (row, side) => row === 0 ? { glow: 0.4 } : row === band ? { glow: 0.75 } : { color: cloth(row, profile.length - 1, side, sides, turn), shade: 0.9 + row % 2 * 0.18 }, { turn });
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
  const plate = (x, y, z, cell, facing) => {
    const pitch = cell * 1.14;
    const wide = pitch * 5 + cell * 0.7;
    b.box([wide, wide, 0.02], [x, y, z - facing * 8e-3], { color: DARK, bevel: 6e-3 });
    if (proven) {
      const [half, band, zz] = [wide / 2 + cell * 0.55, cell * 0.38, z + facing * 25e-4];
      const bar = (x0, y0, x1, y1) => b.quad([x + x0, y + y0, zz], [x + x1, y + y0, zz], [x + x1, y + y1, zz], [x + x0, y + y1, zz], { glow: 1 }, [0, 0, facing]);
      bar(-half, half - band, half, half);
      bar(-half, -half, half, -half + band);
      bar(-half, -half + band, -half + band, half - band);
      bar(half - band, -half + band, half, half - band);
    }
    markGrid(look.mark).forEach(
      (row, r) => row.forEach((on, c) => {
        if (!on) return;
        const [cx, cy, cz] = [x + (c - 2) * pitch, y + (2 - r) * pitch, z + facing * 25e-4];
        b.quad([cx - cell / 2, cy - cell / 2, cz], [cx + cell / 2, cy - cell / 2, cz], [cx + cell / 2, cy + cell / 2, cz], [cx - cell / 2, cy + cell / 2, cz], { glow: 1 }, [0, 0, facing]);
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
    const cols = items.length > 8 ? 3 : 2;
    const rowsN = Math.max(1, Math.ceil(items.length / cols));
    const cellW = (areaW - (cols - 1) * 14) / cols;
    const cellH = Math.min(96, (H - 150 - noteH - (rowsN - 1) * 12) / rowsN);
    items.forEach((item, i) => {
      const x = left + i % cols * (cellW + 14);
      const y = 138 + Math.floor(i / cols) * (cellH + 12);
      const tone = item.tone === "warn" ? rgb(t.warn) : A;
      button({ id: `act:${item.id}`, x, y, w: cellW, h: cellH, label: item.label }, (hot) => {
        g.beginPath();
        g.roundRect(x, y, cellW, cellH, [18, 18, 6, 6]);
        g.fillStyle = hot ? `rgba(${tone}, 0.3)` : item.tone === "primary" || item.on ? `rgba(${tone}, 0.16)` : `rgba(${I}, 0.05)`;
        g.fill();
        g.lineWidth = hot ? 4 : 2;
        g.strokeStyle = hot || item.on ? `rgba(${tone}, 1)` : `rgba(${tone}, 0.4)`;
        g.stroke();
        g.fillStyle = item.on ? `rgb(${tone})` : `rgba(${I}, 0.22)`;
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
  const facing = new THREE5.Vector3();
  const want = new THREE5.Vector3();
  const hand = new THREE5.Vector3();
  const toHand = new THREE5.Vector3();
  const setOpen = (next, where = "floating") => {
    if (open === next && mount === where) return;
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
      camera.getWorldDirection(facing);
      const t = controls.theme;
      const presence = controls.presence;
      const tracked = t.wrist === "off" || presence === "hidden" ? void 0 : grips.find((x) => x.hand === t.wrist && x.grip.visible);
      if (tracked) {
        tracked.grip.getWorldPosition(hand);
        toHand.copy(hand).sub(head);
        const far = toHand.length();
        const inView = toHand.normalize().dot(facing);
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
      const flat = Math.hypot(facing.x, facing.z) || 1;
      if (open && mount === "wrist" && tracked) {
        want.set(hand.x, hand.y + 0.16, hand.z);
        if (!placed) group.position.copy(want);
        else group.position.lerp(want, Math.min(1, dt * 14));
        placed = true;
        panel.scale.setScalar(WRIST_W);
        group.lookAt(head);
      } else {
        const reach = open ? 1.05 : 0.75;
        want.set(head.x + facing.x / flat * reach, Math.max(0.4, head.y - (open ? 0.18 : 0.52)), head.z + facing.z / flat * reach);
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
        note: open ? current?.note ?? "" : ""
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

// packages/sdk/src/input.ts
import * as THREE6 from "three";

// packages/sdk/src/actions.ts
var NO_PAD = { stick: [0, 0], from: "none", trigger: 0, squeeze: 0, primary: false, secondary: false };
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
  return { stick, from, trigger: value(0), squeeze: value(1), primary: !!button(4)?.pressed, secondary: !!button(5)?.pressed };
}
var DEFAULT_COMFORT = { move: "steps", turn: "steps", turnStep: 30, narrow: true, moveHand: "left" };
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
var KEY = "nswp:comfort";
function loadComfort() {
  try {
    return { ...DEFAULT_COMFORT, ...cleanComfort(JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "{}")) };
  } catch {
    return { ...DEFAULT_COMFORT };
  }
}
function saveComfort(comfort) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(cleanComfort(comfort)));
  } catch {
  }
}
var WALK_SPEED = 1.8;
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
  frame(dt, pads, comfort) {
    const intent = { turn: 0, walk: [0, 0], stepFrom: [], aiming: [], menu: false, narrow: 0 };
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
          const pace = WALK_SPEED * dt / Math.max(1, Math.hypot(strafe, y));
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
    const menu = pads.some((p) => p.pad.secondary);
    intent.menu = menu && !this.menuDown;
    this.menuDown = menu;
    intent.narrow = sliding && comfort.narrow ? 1 : 0;
    return intent;
  }
};

// packages/sdk/src/input.ts
var unpointable = (root) => root.traverse((o) => void (o.raycast = () => {
}));
function controllerModel(accent) {
  const b = new MeshBuilder().at();
  b.tone = new THREE6.Color(1712684);
  b.light = accent.clone();
  const lean = new THREE6.Matrix4().makeRotationX(THREE6.MathUtils.degToRad(-52)).setPosition(0, -0.012, 0.022);
  b.place(lean);
  b.lathe([[5e-4, -0.07], [0.014, -0.068], [0.018, -0.02], [0.017, 0.03], [0.012, 0.046], [5e-4, 0.048]], [0, 0, 0], 6, (row) => row === 1 ? { glow: 0.5 } : { shade: 0.9 + row % 2 * 0.2 });
  b.place(new THREE6.Matrix4());
  b.box([0.03, 0.022, 0.07], [0, 4e-3, -0.045], { bevel: 6e-3, shade: 1.05 });
  b.box([0.018, 0.012, 4e-3], [0, 4e-3, -0.082], { glow: 1 });
  b.place(new THREE6.Matrix4().makeRotationX(THREE6.MathUtils.degToRad(64)).setPosition(0, 0.012, -0.04));
  b.lathe([[0.046, -4e-3], [0.052, 0], [0.046, 4e-3], [0.041, 0]], [0, 0, 0], 12, (row) => row === 1 ? { glow: 0.7 } : { shade: 0.85 });
  const metal = createAlloy(accent, { gloss: 0.6 });
  const group = new THREE6.Group();
  group.add(b.build(metal));
  const light = () => new THREE6.MeshBasicMaterial({ color: accent.clone().multiplyScalar(0.2) });
  const trigger = new THREE6.Mesh(new THREE6.BoxGeometry(0.012, 0.02, 0.014), light());
  trigger.position.set(0, -0.016, -0.036);
  const squeeze = new THREE6.Mesh(new THREE6.BoxGeometry(8e-3, 0.03, 0.012), light());
  squeeze.position.set(0, -0.034, 0.018);
  squeeze.rotation.x = THREE6.MathUtils.degToRad(-52);
  group.add(trigger, squeeze);
  unpointable(group);
  return { group, metal, trigger, squeeze };
}
var VIGNETTE_VERT = `varying float vFar; void main(){ vFar = length(position.xy); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
var VIGNETTE_FRAG = `uniform float uAmount; varying float vFar; void main(){ gl_FragColor = vec4(0.0, 0.0, 0.0, smoothstep(0.24, 0.42, vFar) * uAmount); }`;
function createXrInput(opts) {
  const { renderer, rig, camera } = opts;
  const accent = new THREE6.Color(opts.accent ?? 16758364);
  let comfort = loadComfort();
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
  const jointShape = new THREE6.OctahedronGeometry(1, 1);
  const jointDark = new THREE6.MeshBasicMaterial({ color: 2568767 });
  const jointLit = new THREE6.MeshBasicMaterial({ color: accent });
  const dressHand = (hand) => {
    for (const joint of hand.children) {
      if (joint.userData.nswpJoint) continue;
      joint.userData.nswpJoint = true;
      const name = String(joint.jointName ?? "");
      const tip = name.endsWith("-tip");
      const mesh = new THREE6.Mesh(jointShape, tip ? jointLit : jointDark);
      const radius = joint.jointRadius;
      mesh.scale.setScalar(Math.min(0.02, Math.max(5e-3, (radius ?? 8e-3) * (tip ? 0.9 : 0.75))));
      unpointable(mesh);
      joint.add(mesh);
    }
  };
  const vignette = new THREE6.Mesh(
    new THREE6.RingGeometry(0.12, 3, 48, 4),
    new THREE6.ShaderMaterial({ uniforms: { uAmount: { value: 0 } }, vertexShader: VIGNETTE_VERT, fragmentShader: VIGNETTE_FRAG, transparent: true, depthTest: false, depthWrite: false })
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
  const headAt = new THREE6.Vector3();
  const ahead = new THREE6.Vector3();
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
  const box = new THREE6.Box3();
  const ball = new THREE6.Sphere();
  const handAt = new THREE6.Vector3();
  const raycaster = new THREE6.Raycaster();
  const turnOnly = new THREE6.Matrix4();
  const HOLD_AT = new THREE6.Vector3(0, 0, -0.06);
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
      pulled = !!best;
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
  const setComfort = (patch, keep = false) => {
    comfort = { ...comfort, ...cleanComfort(patch) };
    if (keep) saveComfort(comfort);
  };
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
    const change = (patch) => {
      setComfort(patch, true);
      controls.addSection({ id: "moving", label: "Moving", icon: "step", note });
    };
    controls.add(
      { id: "move-mode", section: "moving", icon: "step", hidden, on: () => comfort.move === "smooth", label: () => comfort.move === "steps" ? "Moving in steps. Walk smoothly instead" : "Walking smoothly. Move in steps instead", short: "Walk", act: () => change({ move: comfort.move === "steps" ? "smooth" : "steps" }) },
      {
        id: "turn-mode",
        section: "moving",
        icon: "turn",
        hidden,
        on: () => comfort.turn === "smooth",
        label: () => comfort.turn === "smooth" ? "Turning smoothly. Turn in steps instead" : `Turning ${comfort.turnStep}\xB0 at a time. Change`,
        short: "Turn",
        // In steps of 30, then 45, then 90, then smoothly, and round again.
        act: () => change(comfort.turn === "smooth" ? { turn: "steps", turnStep: 30 } : comfort.turnStep === 30 ? { turnStep: 45 } : comfort.turnStep === 45 ? { turnStep: 90 } : { turn: "smooth" })
      },
      { id: "move-hand", section: "moving", icon: "motion", hidden, label: () => `The ${comfort.moveHand} stick moves you. Swap hands`, short: "Hands", act: () => change({ moveHand: comfort.moveHand === "left" ? "right" : "left" }) },
      {
        id: "move-narrow",
        section: "moving",
        icon: "look",
        hidden: () => hidden() || comfort.move === "steps" && comfort.turn === "steps",
        on: () => comfort.narrow,
        label: () => comfort.narrow ? "The view narrows while you move. Turn that off" : "Narrow the view while you move",
        short: "Narrow",
        act: () => change({ narrow: !comfort.narrow })
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
      if (intent.walk[0] !== 0 || intent.walk[1] !== 0) walk(intent.walk[0], intent.walk[1]);
      for (const slot of intent.stepFrom) {
        opts.stepFrom?.(slot);
        pulse(slot, 0.35, 20);
      }
      if (intent.menu) opts.onMenu?.();
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
    setComfort,
    update,
    grabbable(object, o = {}) {
      things.set(object, { object, reach: o.reach ?? 0.1, far: o.far ?? true, release: o.release ?? "stay", ...o.onGrab ? { onGrab: o.onGrab } : {}, ...o.onRelease ? { onRelease: o.onRelease } : {} });
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

// packages/sdk/src/chamber.ts
import * as THREE7 from "three";
var R = 1.8;
var H2 = 2.8;
var BAYS = 10;
var DOOR_W = 1.04;
var DOOR_H = 2.2;
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
  const texture = new THREE7.CanvasTexture(canvas);
  texture.colorSpace = THREE7.SRGBColorSpace;
  return texture;
}
function createChamber(accent, opts = {}) {
  const light = new THREE7.Color(accent);
  const metal = createAlloy(light, { gloss: 0.5, speed: 0.9 });
  const builder = () => {
    const b = new MeshBuilder().at();
    b.tone = new THREE7.Color(1317668);
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
    wallShape.at([Math.sin(a) * reach, 0, -Math.cos(a) * reach], -THREE7.MathUtils.radToDeg(a));
    wallShape.box([bay, H2, 0.12], [0, H2 / 2, 0], { bevel: 0.02, shade: i % 2 ? 1 : 0.86, panel: { margin: 0.12, depth: 0.02, faces: "z+ z-" } });
    for (const x of [-bay * 0.26, bay * 0.26]) for (const z of [0.062, -0.062]) wallShape.line([x, 0.3, z], [x, H2 - 0.3, z], 0.03, [0, 0, Math.sign(z)], { flow: i });
  }
  wallShape.at([0, 0, -reach]);
  for (const side of [-1, 1]) wallShape.box([(bay - DOOR_W) / 2, H2, 0.16], [side * (bay + DOOR_W) / 4, H2 / 2, 0], { bevel: 0.02 });
  wallShape.box([DOOR_W, H2 - DOOR_H, 0.16], [0, DOOR_H + (H2 - DOOR_H) / 2, 0], { bevel: 0.02 });
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
  const sign = new THREE7.Mesh(new THREE7.PlaneGeometry(DOOR_W * 0.94, DOOR_W * 0.94 * (384 / 1024)), new THREE7.MeshBasicMaterial({ transparent: true }));
  sign.position.set(0, DOOR_H + (H2 - DOOR_H) / 2, -reach + 0.085);
  const rising = new THREE7.Group();
  rising.add(walls, ...leaves, sign);
  const group = new THREE7.Group();
  group.add(floor, rising, lid);
  let door = 0;
  let presence = 1;
  const apply = () => {
    const up = presence * presence * (3 - 2 * presence);
    rising.scale.y = Math.max(1e-3, up);
    rising.visible = presence > 2e-3;
    floor.scale.setScalar(Math.max(1e-3, Math.min(1, presence * 1.6)));
    floor.visible = presence > 2e-3;
    lid.position.y = H2 + (1 - up) * 3.5;
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
      for (const mesh of [floor, walls, lid, ...leaves]) mesh.geometry.dispose();
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
  const at = new THREE7.Vector3();
  const facing = new THREE7.Vector3();
  const place = () => {
    chamber?.dispose();
    const made = createChamber(o.accent, o.textColor ? { textColor: o.textColor } : {});
    o.camera.getWorldPosition(at);
    o.camera.getWorldDirection(facing);
    made.group.position.set(at.x, 0, at.z);
    made.group.rotation.y = Math.atan2(-facing.x, -facing.z);
    o.scene.add(made.group);
    chamber = made;
    return made;
  };
  const enter = (next) => {
    state = next;
    since = 0;
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
    }
  };
}

// packages/sdk/src/camera.ts
import * as THREE8 from "three";
async function takePicture(renderer, scene, camera, opts = {}) {
  const width = Math.round(opts.width ?? 1920);
  const height = Math.round(opts.height ?? 1080);
  const hidden = (opts.hide ?? []).filter((o) => o.visible);
  const xrWasEnabled = renderer.xr.enabled;
  const previousTarget = renderer.getRenderTarget();
  const target = new THREE8.WebGLRenderTarget(width, height, { samples: 4 });
  target.texture.colorSpace = THREE8.SRGBColorSpace;
  const eye = new THREE8.PerspectiveCamera(camera.fov, width / height, camera.near, camera.far);
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
  const at = new THREE8.Vector3();
  const facing = new THREE8.Quaternion();
  head.matrixWorld.decompose(at, facing, new THREE8.Vector3());
  const ahead = new THREE8.Vector3(0, 0, -1).applyQuaternion(facing).setY(0);
  if (ahead.lengthSq() < 1e-6) ahead.set(0, 0, -1);
  ahead.normalize();
  const figure = createFigure(look);
  figure.group.position.copy(at);
  figure.group.rotation.y = Math.atan2(-ahead.x, -ahead.z);
  scene.add(figure.group);
  const eye = new THREE8.PerspectiveCamera(58, 1, 0.05, head.far);
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
  const kept = [];
  let clip = null;
  const plain = `plain-${Math.random().toString(36).slice(2, 12)}`;
  let last = "Pictures and clips are saved to this device. Nothing is sent anywhere.";
  const tell = (text) => {
    last = text;
    controls.say(text);
  };
  let latest = null;
  const keep = (capture) => {
    latest = capture;
    if (presenting()) {
      kept.push(capture);
      tell(`Kept. Save ${kept.length === 1 ? "it" : `all ${kept.length}`} from the Camera menu when you leave VR.`);
    } else {
      saveFile(capture.blob, capture.name);
      tell(capture.kind === "clip" ? "Clip saved to this device." : "Picture saved to this device.");
    }
  };
  const shoot = async (kind) => {
    try {
      const hide = d.hide?.() ?? [];
      const blob = kind === "selfie" ? await takeSelfie(d.renderer, d.scene, d.camera, d.look?.() ?? plain, { hide }) : await takePicture(d.renderer, d.scene, d.camera, { hide });
      keep({ kind, blob, name: `${name}-${kind === "selfie" ? "selfie-" : ""}${stamp()}.jpg` });
    } catch {
      tell("That picture couldn't be taken on this device.");
    }
  };
  const finish = (blob) => {
    clip = null;
    d.recording?.(false);
    keep({ kind: "clip", blob, name: `${name}-clip-${stamp()}.${blob.type.includes("mp4") ? "mp4" : "webm"}` });
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
      label: () => kept.length === 1 ? "Save 1 picture" : `Save ${kept.length} pictures`,
      short: "Save",
      tone: "primary",
      hidden: () => kept.length === 0 || presenting(),
      act: () => {
        for (const c of kept.splice(0)) saveFile(c.blob, c.name);
        tell("Saved to this device.");
      }
    }
  );
  return {
    waiting: () => [...kept],
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
  const tex = new THREE9.CanvasTexture(canvas);
  tex.colorSpace = THREE9.SRGBColorSpace;
  const sprite = new THREE9.Sprite(new THREE9.SpriteMaterial({ map: tex, depthWrite: false }));
  sprite.scale.set(width, width * canvas.height / canvas.width, 1);
  return sprite;
}
function createPresence(d) {
  const labelColor = d.labelColor ?? "#ffffff";
  const changed = () => d.onChange?.();
  const listener = new THREE9.AudioListener();
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
      dot = new THREE9.CanvasTexture(canvas);
    }
    return new THREE9.Sprite(new THREE9.SpriteMaterial({ map: dot, color, transparent: true, depthWrite: false }));
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
  const dress = (a, look) => {
    const was = a.figure;
    const figure = createFigure(look, d.figureStyle, { proven: !a.member.guest });
    figure.head.position.copy(was?.head.position ?? figure.head.position);
    figure.head.quaternion.copy(was?.head.quaternion ?? figure.head.quaternion);
    figure.head.add(a.label);
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
    if (a.beam) figure.head.add(a.beam);
    a.root.add(figure.group);
    a.figure = figure;
    a.head = figure.head;
    a.torso = figure.torso;
    a.hands = figure.hands;
    a.materials = [figure.metal, a.label.material].map((material) => {
      const opacity = material === a.label.material ? 1 : material.opacity;
      material.transparent = true;
      return { material, opacity };
    });
  };
  const makeAvatar = (member) => {
    const root = new THREE9.Group();
    root.visible = false;
    const label = textSprite(member.name, labelColor, 0.5);
    label.position.set(0, 0.42, 0);
    d.scene.add(root);
    const a = { member, root, label, target: null, placed: false };
    dress(a, member.look);
    return a;
  };
  const attachAudio = (avatar, stream) => {
    if (avatar.audio) return;
    const el = new Audio();
    el.muted = true;
    el.srcObject = stream;
    void el.play().catch(() => {
    });
    const pa = new THREE9.PositionalAudio(listener);
    pa.setMediaStreamSource(stream);
    pa.setRefDistance(1.5);
    pa.setRolloffFactor(1.2);
    avatar.head.add(pa);
    const analyser = listener.context.createAnalyser();
    analyser.fftSize = 512;
    listener.context.createMediaStreamSource(stream).connect(analyser);
    avatar.audio = pa;
    avatar.element = el;
    avatar.analyser = analyser;
  };
  const removeAvatar = (pubkey) => {
    const a = avatars.get(pubkey);
    if (!a) return;
    avatars.delete(pubkey);
    a.audio?.disconnect();
    if (a.element) a.element.srcObject = null;
    d.scene.remove(a.root);
    a.figure.dispose();
  };
  const v = new THREE9.Vector3();
  const q = new THREE9.Quaternion();
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
  const leave = () => {
    if (sendTimer) clearInterval(sendTimer);
    sendTimer = void 0;
    session?.leave();
    session = null;
    for (const key of [...avatars.keys()]) removeAvatar(key);
    pendingStreams.clear();
    changed();
  };
  const join = async (name) => {
    leave();
    roomName = name;
    void listener.context.resume();
    const look = typeof d.look === "function" ? d.look() : d.look;
    const identity = typeof d.identity === "function" ? d.identity() : d.identity;
    const s = await room.join({ ...name ? { name } : {}, ...look ? { look } : {}, ...identity ? { identity } : {} });
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
      removeAvatar(m.pubkey);
      pendingStreams.delete(m.pubkey);
      changed();
    });
    s.on("pose", (m, pose) => {
      const a = avatars.get(m.pubkey);
      if (!a) return;
      if (!a.target) stepApart(s.self.pubkey, m.pubkey, pose);
      a.target = pose;
    });
    s.on("audio", (m, stream) => {
      pendingStreams.set(m.pubkey, stream);
      const a = avatars.get(m.pubkey);
      if (a) attachAudio(a, stream);
    });
    if (micTrack) await s.setMicrophone(micTrack);
    sendTimer = setInterval(() => s.sendPose(ownPose()), SEND_EVERY_MS);
    changed();
  };
  const tp = new THREE9.Vector3();
  const tq = new THREE9.Quaternion();
  const euler = new THREE9.Euler();
  const apply = (o, t, k) => {
    o.position.lerp(tp.set(...t.position), k);
    o.quaternion.slerp(tq.set(...t.quaternion), k);
  };
  return {
    get session() {
      return session;
    },
    get roomName() {
      return roomName;
    },
    get micOn() {
      return !!micTrack;
    },
    join,
    leave,
    async setMicrophone(track) {
      if (!track && micTrack) micTrack.stop();
      micTrack = track;
      await session?.setMicrophone(track);
      changed();
    },
    setRecording(on) {
      session?.setRecording(on);
    },
    selfLook() {
      if (session) return session.self.look;
      const mine = typeof d.look === "function" ? d.look() : d.look;
      const read = mine ? decodeLook(mine) : null;
      return read?.ok ? read.value.look : plainSeed ??= `plain-${Math.random().toString(36).slice(2, 12)}`;
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
      const k = 1 - Math.exp(-dt * 14);
      d.camera.getWorldPosition(v);
      for (const a of avatars.values()) {
        if (!a.target) continue;
        const near = THREE9.MathUtils.clamp((a.head.position.distanceTo(v) - FADE_END) / (FADE_START - FADE_END), 0, 1);
        for (const m of a.materials) m.material.opacity = m.opacity * near;
        a.materials[0].material.tick?.(performance.now() / 1e3);
        if (a.beam?.visible && performance.now() > (a.beamUntil ?? 0)) a.beam.visible = false;
        const snap = a.placed ? k : 1;
        apply(a.head, a.target.head, snap);
        a.placed = true;
        a.root.visible = true;
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
          hands: [!!a.target?.left, !!a.target?.right],
          audioLevel: Math.round(level * 1e3) / 1e3,
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
  const faceTarget = new THREE9.WebGLRenderTarget(Math.min(2048, width / 2), Math.min(2048, width / 2), { type: THREE9.HalfFloatType });
  const flatTarget = new THREE9.WebGLRenderTarget(width, height);
  flatTarget.texture.colorSpace = THREE9.SRGBColorSpace;
  const material = new THREE9.ShaderMaterial({
    uniforms: { face: { value: faceTarget.texture }, forward: { value: new THREE9.Vector3() }, up: { value: new THREE9.Vector3() }, right: { value: new THREE9.Vector3() } },
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
  const quad = new THREE9.Mesh(new THREE9.PlaneGeometry(2, 2), material);
  const quadScene = new THREE9.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE9.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const faceCamera = new THREE9.PerspectiveCamera(90, 1, 0.05, 700);
  faceCamera.position.copy(position);
  const views = [
    [new THREE9.Vector3(0, 0, -1), new THREE9.Vector3(0, 1, 0)],
    [new THREE9.Vector3(1, 0, 0), new THREE9.Vector3(0, 1, 0)],
    [new THREE9.Vector3(0, 0, 1), new THREE9.Vector3(0, 1, 0)],
    [new THREE9.Vector3(-1, 0, 0), new THREE9.Vector3(0, 1, 0)],
    [new THREE9.Vector3(0, 1, 0), new THREE9.Vector3(0, 0, 1)],
    [new THREE9.Vector3(0, -1, 0), new THREE9.Vector3(0, 0, -1)]
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
  const texture = new THREE9.Texture(image);
  texture.colorSpace = THREE9.SRGBColorSpace;
  texture.wrapS = THREE9.RepeatWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE9.LinearFilter;
  texture.magFilter = THREE9.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
function createPortalWindow(geometry, pano, opts = {}) {
  const reach = opts.reach ?? 1.5;
  const material = new THREE9.ShaderMaterial({
    uniforms: {
      pano: { value: pano },
      mask: { value: opts.mask ?? null },
      useMask: { value: opts.mask ? 1 : 0 },
      toLocal: { value: new THREE9.Matrix3() },
      center: { value: new THREE9.Vector3() },
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
    side: THREE9.DoubleSide
  });
  const mesh = new THREE9.Mesh(geometry, material);
  const rotation = new THREE9.Matrix4();
  mesh.onBeforeRender = () => {
    rotation.extractRotation(mesh.matrixWorld);
    material.uniforms.toLocal.value.setFromMatrix4(rotation).invert();
    material.uniforms.center.value.setFromMatrixPosition(mesh.matrixWorld);
  };
  return mesh;
}
function addRoomControls(controls, presence, opts = {}) {
  const useTone = new URLSearchParams(opts.search ?? location.search).get("mic") === "tone";
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
    return `${presence.roomName ? "Private room" : "Open room"}: ${who}.${as}${presence.micOn ? " Your microphone is on." : ""}`;
  };
  const refresh = () => {
    const s = presence.session;
    opts.onState?.(
      s ? { name: s.name, private: !!presence.roomName, status: s.status, self: s.self.pubkey, members: s.members.map((m) => m.pubkey), relays: s.relayCount, mic: presence.micOn } : null
    );
    controls.addSection({ id: "room", label: "Room", icon: "room", note: status });
    people();
  };
  let listed = [];
  const recorders = /* @__PURE__ */ new Set();
  const people = () => {
    const here = presence.session ? presence.people() : [];
    for (const id of listed) controls.remove(id);
    listed = here.map((m) => `person-${m.pubkey.slice(0, 12)}`);
    controls.addSection({
      id: "people",
      label: "People",
      icon: "people",
      note: () => !presence.session ? "Join the room to see who else is here." : here.length === 0 ? "Nobody else is here yet." : `${here.length === 1 ? "1 person is" : `${here.length} people are`} here with you. Select one to see where they are.`
    });
    here.forEach(
      (m, i) => controls.add({
        id: listed[i],
        section: "people",
        kind: "swatch",
        color: m.look.light,
        label: () => m.recording ? `${m.name}, recording` : m.name,
        act: () => {
          presence.pointOut(m.pubkey);
          controls.say(m.identity ? `${m.name} is under the column of light. Their key: ${encodeNpub(m.identity)}` : `${m.name} is under the column of light. A guest: nobody has vouched for who they are.`);
        }
      })
    );
    for (const m of here) {
      if (m.recording && !recorders.has(m.pubkey)) controls.say(`${m.name} is recording what they see.`);
      if (m.recording) recorders.add(m.pubkey);
      else recorders.delete(m.pubkey);
    }
  };
  controls.add(
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
          presence.leave();
          tell("You left the room.");
          return refresh();
        }
        busy = true;
        try {
          await presence.join(invited);
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
        if (presence.micOn) await presence.setMicrophone(null);
        else {
          try {
            const track = useTone ? presence.testTone() : (await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })).getAudioTracks()[0];
            await presence.setMicrophone(track);
          } catch {
            tell("The microphone is blocked or unavailable.");
          }
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
  refresh();
  return { refresh };
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
    { id: "turn", section: "view", icon: "turn", label: "Turn around", act: () => turnVisitor(d.rig, d.camera, 180) }
  );
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
  turnVisitor,
  createConsole,
  readPad,
  DEFAULT_COMFORT,
  createXrInput,
  createChamber,
  createCrossing,
  takePicture,
  takeSelfie,
  canRecord,
  recordClip,
  saveFile,
  addCameraControls,
  textSprite,
  createPresence,
  capturePanorama,
  panoramaTexture,
  createPortalWindow,
  addRoomControls,
  addViewControls
};
