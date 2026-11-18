import {
  room
} from "./shared-PMZZ7JZF.js";
import {
  ICONS,
  rgb
} from "./shared-WXBVZMXQ.js";

// packages/sdk/src/three.ts
import * as THREE5 from "three";
import { spawnOffset } from "@nswp/core";

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
        const p = paint(row);
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
    g.computeBoundingSphere();
    return g;
  }
  /** Everything added, as one mesh in this material (see alloy.ts). */
  build(material) {
    return new THREE2.Mesh(this.geometry(), material);
  }
};

// packages/sdk/src/turn.ts
import * as THREE3 from "three";
function turnVisitor(rig, camera, degrees) {
  const head = camera.getWorldPosition(new THREE3.Vector3());
  const a = THREE3.MathUtils.degToRad(degrees);
  const dx = rig.position.x - head.x;
  const dz = rig.position.z - head.z;
  rig.position.x = head.x + dx * Math.cos(a) + dz * Math.sin(a);
  rig.position.z = head.z - dx * Math.sin(a) + dz * Math.cos(a);
  rig.rotation.y += a;
}

// packages/sdk/src/console.ts
import * as THREE4 from "three";
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
  return new THREE4.ShaderMaterial({
    transparent: true,
    depthTest: false,
    side: THREE4.DoubleSide,
    uniforms: { map: { value: map }, uOpen: { value: 1 }, uTime: { value: 0 }, uAccent: { value: new THREE4.Color() }, uLines: { value: 1 } },
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
  const group = new THREE4.Group();
  group.name = "nswp-console";
  group.visible = false;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  const texture = new THREE4.CanvasTexture(canvas);
  texture.colorSpace = THREE4.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = holoMaterial(texture);
  const panel = new THREE4.Mesh(new THREE4.PlaneGeometry(1, ASPECT), material);
  panel.renderOrder = 30;
  panel.visible = false;
  group.add(panel);
  const openerCanvas = document.createElement("canvas");
  openerCanvas.width = 256;
  openerCanvas.height = 300;
  const openerTexture = new THREE4.CanvasTexture(openerCanvas);
  openerTexture.colorSpace = THREE4.SRGBColorSpace;
  const opener = new THREE4.Mesh(new THREE4.PlaneGeometry(0.15, 0.15 * 300 / 256), new THREE4.MeshBasicMaterial({ map: openerTexture, transparent: true, depthTest: false }));
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
  const head = new THREE4.Vector3();
  const facing = new THREE4.Vector3();
  const want = new THREE4.Vector3();
  const hand = new THREE4.Vector3();
  const toHand = new THREE4.Vector3();
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

// packages/sdk/src/three.ts
var avatarShapes = null;
function avatarParts() {
  if (avatarShapes) return avatarShapes;
  const tone = new THREE5.Color(1713456);
  const head = new MeshBuilder().at();
  head.tone = tone;
  head.lathe([[5e-4, -0.135], [0.07, -0.125], [0.118, -0.05], [0.13, 0.02], [0.112, 0.085], [0.06, 0.128], [5e-4, 0.14]], [0, 0, 0], 8, (row) => ({ shade: 0.85 + row * 0.12 }), { turn: Math.PI / 8 });
  head.lathe([[0.074, -0.125], [0.084, -0.118]], [0, 0, 0], 8, () => ({ glow: 0.8 }), { turn: Math.PI / 8 });
  head.box([0.15, 0.04, 0.05], [0, 0.02, -0.108], { glow: 1 });
  head.box([0.18, 0.065, 0.04], [0, 0.02, -0.098], { bevel: 0.012, shade: 0.6 });
  for (const x of [-0.128, 0.128]) head.box([0.02, 0.07, 0.07], [x, 0, 0], { bevel: 6e-3, shade: 1.3 });
  const torso = new MeshBuilder().at();
  torso.tone = tone;
  torso.lathe([[0.03, -0.2], [0.17, -0.25], [0.12, 0.12], [0.145, 0.165], [0.145, 0.19], [0.08, 0.25], [5e-4, 0.25]], [0, 0, 0], 6, (row) => row === 0 ? { glow: 0.45 } : row === 3 ? { glow: 0.7 } : { shade: 0.9 + row % 2 * 0.2 }, { turn: Math.PI / 6 });
  const hand = new MeshBuilder().at();
  hand.lathe([[5e-4, -0.06], [0.04, 0], [5e-4, 0.06]], [0, 0, 0], 4, () => ({ glow: 0.75 }));
  avatarShapes = { head: head.geometry(), torso: torso.geometry(), hand: hand.geometry() };
  return avatarShapes;
}
function createFigure(color) {
  const parts = avatarParts();
  const metal = createAlloy(color, { gloss: 0.7 });
  const head = new THREE5.Group();
  head.add(new THREE5.Mesh(parts.head, metal));
  const torso = new THREE5.Mesh(parts.torso, metal);
  torso.position.y = -0.45;
  const hands = [new THREE5.Mesh(parts.hand, metal), new THREE5.Mesh(parts.hand, metal)];
  hands[0].position.set(-0.28, -0.5, -0.12);
  hands[1].position.set(0.28, -0.5, -0.12);
  const group = new THREE5.Group();
  group.add(head, torso, ...hands);
  return { group, head, torso, hands, metal };
}
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
  const tex = new THREE5.CanvasTexture(canvas);
  tex.colorSpace = THREE5.SRGBColorSpace;
  const sprite = new THREE5.Sprite(new THREE5.SpriteMaterial({ map: tex, depthWrite: false }));
  sprite.scale.set(width, width * canvas.height / canvas.width, 1);
  return sprite;
}
function createPresence(d) {
  const labelColor = d.labelColor ?? "#ffffff";
  const changed = () => d.onChange?.();
  const listener = new THREE5.AudioListener();
  d.camera.add(listener);
  const avatars = /* @__PURE__ */ new Map();
  const pendingStreams = /* @__PURE__ */ new Map();
  let session = null;
  let roomName = null;
  let sendTimer;
  let micTrack = null;
  let offsetApplied = false;
  const makeAvatar = (member) => {
    const color = new THREE5.Color(member.color);
    const root = new THREE5.Group();
    root.visible = false;
    const figure = createFigure(color);
    const { head, torso, hands, metal } = figure;
    const label = textSprite(member.name, labelColor, 0.5);
    label.position.set(0, 0.3, 0);
    head.add(label);
    hands.forEach((h) => h.visible = false);
    root.add(figure.group);
    d.scene.add(root);
    const materials = [metal, label.material].map((material) => {
      const opacity = material.opacity;
      material.transparent = true;
      return { material, opacity };
    });
    return { member, root, head, torso, hands, target: null, placed: false, materials };
  };
  const attachAudio = (avatar, stream) => {
    if (avatar.audio) return;
    const el = new Audio();
    el.muted = true;
    el.srcObject = stream;
    void el.play().catch(() => {
    });
    const pa = new THREE5.PositionalAudio(listener);
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
  };
  const v = new THREE5.Vector3();
  const q = new THREE5.Quaternion();
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
    const s = await room.join(name ? { name } : {});
    session = s;
    if (!offsetApplied) {
      const off = spawnOffset(s.self.pubkey);
      d.rig.position.x += off.x;
      d.rig.position.z += off.z;
      offsetApplied = true;
    }
    s.on("status", changed);
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
  const tp = new THREE5.Vector3();
  const tq = new THREE5.Quaternion();
  const euler = new THREE5.Euler();
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
        const near = THREE5.MathUtils.clamp((a.head.position.distanceTo(v) - FADE_END) / (FADE_START - FADE_END), 0, 1);
        for (const m of a.materials) m.material.opacity = m.opacity * near;
        a.materials[0].material.tick(performance.now() / 1e3);
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
          audioLevel: Math.round(level * 1e3) / 1e3
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
  const faceTarget = new THREE5.WebGLRenderTarget(Math.min(2048, width / 2), Math.min(2048, width / 2), { type: THREE5.HalfFloatType });
  const flatTarget = new THREE5.WebGLRenderTarget(width, height);
  flatTarget.texture.colorSpace = THREE5.SRGBColorSpace;
  const material = new THREE5.ShaderMaterial({
    uniforms: { face: { value: faceTarget.texture }, forward: { value: new THREE5.Vector3() }, up: { value: new THREE5.Vector3() }, right: { value: new THREE5.Vector3() } },
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
  const quad = new THREE5.Mesh(new THREE5.PlaneGeometry(2, 2), material);
  const quadScene = new THREE5.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE5.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const faceCamera = new THREE5.PerspectiveCamera(90, 1, 0.05, 700);
  faceCamera.position.copy(position);
  const views = [
    [new THREE5.Vector3(0, 0, -1), new THREE5.Vector3(0, 1, 0)],
    [new THREE5.Vector3(1, 0, 0), new THREE5.Vector3(0, 1, 0)],
    [new THREE5.Vector3(0, 0, 1), new THREE5.Vector3(0, 1, 0)],
    [new THREE5.Vector3(-1, 0, 0), new THREE5.Vector3(0, 1, 0)],
    [new THREE5.Vector3(0, 1, 0), new THREE5.Vector3(0, 0, 1)],
    [new THREE5.Vector3(0, -1, 0), new THREE5.Vector3(0, 0, -1)]
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
  const texture = new THREE5.Texture(image);
  texture.colorSpace = THREE5.SRGBColorSpace;
  texture.wrapS = THREE5.RepeatWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE5.LinearFilter;
  texture.magFilter = THREE5.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
function createPortalWindow(geometry, pano, opts = {}) {
  const reach = opts.reach ?? 1.5;
  const material = new THREE5.ShaderMaterial({
    uniforms: {
      pano: { value: pano },
      mask: { value: opts.mask ?? null },
      useMask: { value: opts.mask ? 1 : 0 },
      toLocal: { value: new THREE5.Matrix3() },
      center: { value: new THREE5.Vector3() },
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
    side: THREE5.DoubleSide
  });
  const mesh = new THREE5.Mesh(geometry, material);
  const rotation = new THREE5.Matrix4();
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
    return `${presence.roomName ? "Private room" : "Open room"}: ${who}.${presence.micOn ? " Your microphone is on." : ""}`;
  };
  const refresh = () => {
    const s = presence.session;
    opts.onState?.(
      s ? { name: s.name, private: !!presence.roomName, status: s.status, self: s.self.pubkey, members: s.members.map((m) => m.pubkey), relays: s.relayCount, mic: presence.micOn } : null
    );
    controls.addSection({ id: "room", label: "Room", icon: "room", note: status });
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
        try {
          const session = await xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "hand-tracking"] });
          await d.renderer.xr.setSession(session);
          d.onState?.("presenting");
          session.addEventListener("end", () => d.onState?.("ended"));
        } catch (err) {
          d.onState?.(`error: ${err instanceof Error ? err.message : String(err)}`);
          controls.say("Couldn't start VR on this device.");
        }
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
  turnVisitor,
  createConsole,
  createFigure,
  textSprite,
  createPresence,
  capturePanorama,
  panoramaTexture,
  createPortalWindow,
  addRoomControls,
  addViewControls
};
