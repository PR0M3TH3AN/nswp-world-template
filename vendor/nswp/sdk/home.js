import {
  MeshBuilder,
  PORTAL_HEIGHT,
  PORTAL_SIGN_HEIGHT,
  PORTAL_SPRING,
  PORTAL_WIDTH,
  SKY_GLSL,
  createAlloy,
  createPortalWindow,
  textSprite
} from "./shared-CE7D3UBD.js";
import "./shared-ODNIMJUA.js";
import "./shared-Q23R6KOF.js";
import "./shared-Q3D4OUDA.js";
import "./shared-WWPRVQWW.js";
import "./shared-QLSLERQ3.js";

// packages/sdk/src/home.ts
import * as THREE3 from "three";
import { checkDestination, checkPictureBytes, encodeNaddr, LAYOUT_LIMITS, portalTarget, WORLD_KIND } from "@nswp/core";

// packages/sdk/src/environment.ts
import * as THREE2 from "three";

// packages/sdk/src/models.ts
import * as THREE from "three";
function mouldingProfile(hw, hd, bev, c, cd) {
  return [
    [-hw, -hd + bev],
    [-hw + bev, -hd],
    [-c, -hd],
    [-c, -hd + cd],
    [c, -hd + cd],
    [c, -hd],
    [hw - bev, -hd],
    [hw, -hd + bev],
    [hw, hd - bev],
    [hw - bev, hd],
    [c, hd],
    [c, hd - cd],
    [-c, hd - cd],
    [-c, hd],
    [-hw + bev, hd],
    [-hw, hd - bev]
  ];
}
function mouldingPaint(side) {
  if (side === 3 || side === 11) return { glow: 1 };
  if (side === 2 || side === 4 || side === 10 || side === 12) return { shade: 0.55 };
  if (side === 0 || side === 6 || side === 8 || side === 14) return { shade: 1.35 };
  return side === 15 ? { shade: 0.8 } : {};
}
function addArchFrame(b) {
  const hw = 0.09;
  const hd = 0.11;
  const bev = 0.028;
  const R = PORTAL_WIDTH / 2 + hw;
  const foot = 0.2;
  const profile = mouldingProfile(hw, hd, bev, 0.017, 0.022);
  const frames = [];
  let t = 0;
  const add = (p, x) => {
    const prev = frames[frames.length - 1];
    if (prev) t += Math.hypot(p[0] - prev.p[0], p[1] - prev.p[1]);
    frames.push({ p, x, y: [0, 0, 1], t });
  };
  add([-R, foot, 0], [-1, 0, 0]);
  const STEPS = 30;
  for (let i = 0; i <= STEPS; i++) {
    const a = Math.PI - i / STEPS * Math.PI;
    add([Math.cos(a) * R, PORTAL_SPRING + Math.sin(a) * R, 0], [Math.cos(a), Math.sin(a), 0]);
  }
  add([R, foot, 0], [1, 0, 0]);
  b.sweep(profile, frames, mouldingPaint);
  for (const x of [-R, R]) {
    b.box([0.3, foot, 0.36], [x, foot / 2, 0], { bevel: 0.025, panel: { margin: 0.05, depth: 0.018, faces: "z+ z-" } });
    b.box([0.34, 0.03, 0.4], [x, foot + 5e-3, 0], { bevel: 0.01, shade: 1.3 });
  }
  b.box([PORTAL_WIDTH + 0.02, 0.05, 0.42], [0, 0.025, 0], { bevel: 0.015 });
  b.line([-PORTAL_WIDTH / 2, 0.051, 0.17], [PORTAL_WIDTH / 2, 0.051, 0.17], 0.03, [0, 1, 0]);
  b.line([-PORTAL_WIDTH / 2, 0.051, -0.17], [PORTAL_WIDTH / 2, 0.051, -0.17], 0.03, [0, 1, 0]);
  for (const x of [-R, R]) b.box([0.24, 0.1, 0.28], [x, PORTAL_SPRING, 0], { bevel: 0.02, shade: 1.2 });
  const top = PORTAL_SPRING + R;
  b.box([0.24, 0.26, 0.28], [0, top + 0.02, 0], { bevel: 0.03, shade: 1.15 });
  for (const z of [0.141, -0.141])
    b.quad([0, top + 0.09, z], [0.05, top + 0.02, z], [0, top - 0.05, z], [-0.05, top + 0.02, z], { glow: 1 }, [0, 0, z > 0 ? 1 : -1]);
}
function addWall(b, length, height, o = {}) {
  const bays = Math.max(1, Math.round(length / 2));
  const bay = length / bays;
  const paint = { color: o.color };
  b.box([length, 0.2, 0.3], [0, 0.1, 0], { ...paint, bevel: 0.03, shade: 1.15 });
  b.box([length, 0.14, 0.34], [0, height - 0.07, 0], { ...paint, bevel: 0.03, shade: 1.2 });
  b.line([-length / 2, 0.205, 0.13], [length / 2, 0.205, 0.13], 0.025, [0, 1, 0], { glow: 0.9 });
  for (let i = 0; i < bays; i++) {
    const x = -length / 2 + bay * (i + 0.5);
    b.box([bay - 0.16, height - 0.34, 0.16], [x, height / 2, 0], { ...paint, bevel: 0.02, panel: { margin: 0.16, depth: 0.035, faces: "z+" } });
    b.box([bay - 0.9, 0.05, 0.02], [x, height - 0.62, 0.062], { glow: 0.55 });
  }
  for (let i = 0; i <= bays; i++) {
    const x = -length / 2 + bay * i;
    b.box([0.16, height - 0.3, 0.26], [x, height / 2, 0.02], { ...paint, bevel: 0.025, shade: 1.1 });
    b.line([x, 0.24, 0.151], [x, height - 0.2, 0.151], 0.022, [0, 0, 1], { glow: 0.8 });
  }
}
function addPlinth(b) {
  b.box([0.7, 0.08, 0.7], [0, 0.04, 0], { bevel: 0.02, shade: 1.15 });
  b.box([0.54, 0.76, 0.54], [0, 0.46, 0], { bevel: 0.02, panel: { margin: 0.07, depth: 0.02 } });
  b.box([0.46, 0.04, 0.46], [0, 0.86, 0], { glow: 0.85 });
  b.box([0.66, 0.1, 0.66], [0, 0.95, 0], { bevel: 0.03, shade: 1.2 });
}
function addBench(b, soft) {
  b.box([1.4, 0.07, 0.46], [0, 0.45, 0], { bevel: 0.02, color: soft });
  b.line([-0.66, 0.412, 0.2], [0.66, 0.412, 0.2], 0.018, [0, -1, 0], { glow: 0.9 });
  for (let i = 0; i < 6; i++) b.box([0.17, 0.3, 0.03], [-0.575 + i * 0.23, 0.69, -0.2], { bevel: 8e-3, color: soft });
  b.box([1.4, 0.05, 0.06], [0, 0.88, -0.2], { bevel: 0.015, shade: 1.2 });
  for (const x of [-0.64, 0.64]) {
    b.box([0.05, 0.86, 0.05], [x, 0.45, -0.2], { bevel: 0.012 });
    b.box([0.05, 0.42, 0.05], [x, 0.21, 0.18], { bevel: 0.012 });
    b.box([0.06, 0.04, 0.46], [x, 0.02, 0], { bevel: 0.01, shade: 1.2 });
    b.box([0.05, 0.035, 0.36], [x, 0.4, 0], { bevel: 8e-3 });
  }
}
function addTable(b, soft) {
  b.box([1.2, 0.05, 0.7], [0, 0.725, 0], { bevel: 0.018, color: soft });
  const y = 0.751;
  const [x, z] = [0.5, 0.25];
  b.line([-x, y, z], [x, y, z], 0.014, [0, 1, 0]);
  b.line([x, y, z], [x, y, -z], 0.014, [0, 1, 0]);
  b.line([x, y, -z], [-x, y, -z], 0.014, [0, 1, 0]);
  b.line([-x, y, -z], [-x, y, z], 0.014, [0, 1, 0]);
  b.box([1.06, 0.07, 0.56], [0, 0.665, 0], { bevel: 0.012, shade: 0.8 });
  for (const [lx, lz] of [[-0.5, -0.24], [0.5, -0.24], [-0.5, 0.24], [0.5, 0.24]])
    b.lathe([[0.022, 0], [0.03, 0.04], [0.04, 0.63]], [lx, 0, lz], 4, () => ({ shade: 1.1 }), { turn: Math.PI / 4 });
}
function addLamp(b) {
  b.lathe([[0.21, 0], [0.21, 0.03], [0.1, 0.07], [0.035, 0.11]], [0, 0, 0], 8, (row) => ({ shade: row === 1 ? 1.3 : 1 }));
  b.lathe([[0.03, 0.11], [0.022, 1.42]], [0, 0, 0], 6);
  b.lathe([[0.022, 1.42], [0.15, 1.46], [0.15, 1.49], [0.13, 1.49]], [0, 0, 0], 8, () => ({ shade: 1.2 }));
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2 + Math.PI / 4;
    b.box([0.022, 0.3, 0.022], [Math.cos(a) * 0.13, 1.64, Math.sin(a) * 0.13], { bevel: 5e-3 });
  }
  b.lathe([[1e-3, 1.5], [0.085, 1.64], [1e-3, 1.78]], [0, 0, 0], 4, () => ({ glow: 1 }), { turn: Math.PI / 4 });
  b.lathe([[0.16, 1.79], [0.16, 1.82], [0.06, 1.88], [1e-3, 1.9]], [0, 0, 0], 8, () => ({ shade: 1.2 }));
}
function addPlant(b, soft, seed = 1) {
  b.lathe([[0.17, 0], [0.25, 0.32], [0.27, 0.34], [0.27, 0.37], [0.22, 0.37]], [0, 0, 0], 4, (row) => ({ shade: row >= 2 ? 1.3 : 1 }), { turn: Math.PI / 4 });
  b.line([-0.2, 0.2, 0.211], [0.2, 0.2, 0.211], 0.016, [0, 0, 1], { glow: 0.7 });
  b.line([0.2, 0.2, -0.211], [-0.2, 0.2, -0.211], 0.016, [0, 0, -1], { glow: 0.7 });
  let s = seed * 9301 + 49297;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const blades = 11;
  for (let i = 0; i < blades; i++) {
    const turn = i / blades * Math.PI * 2 + rand() * 0.5;
    const lean = 0.18 + rand() * 0.75;
    const long = 0.55 + rand() * 0.5;
    const wide = 0.07 + rand() * 0.04;
    const [cx, cz] = [Math.cos(turn), Math.sin(turn)];
    const out = (d, h, side) => [cx * d - cz * side, 0.37 + h, cz * d + cx * side];
    const base = out(0.05, 0, 0);
    const mid = long * 0.55;
    const [l, r] = [out(Math.sin(lean) * mid, Math.cos(lean) * mid, wide), out(Math.sin(lean) * mid, Math.cos(lean) * mid, -wide)];
    const keel = out(Math.sin(lean) * mid * 0.86, Math.cos(lean) * mid * 0.86 - 0.03, 0);
    const tip = out(Math.sin(lean * 1.25) * long, Math.cos(lean * 1.25) * long, 0);
    const up = [cx * Math.cos(lean), Math.sin(lean), cz * Math.cos(lean)];
    const down = [-up[0], -up[1], -up[2]];
    b.tri(base, l, keel, { color: soft, shade: 1.15 }, up);
    b.tri(base, keel, r, { color: soft, shade: 0.9 }, up);
    b.tri(l, tip, keel, { color: soft, shade: 1.3, glow: 0.12 }, up);
    b.tri(keel, tip, r, { color: soft, shade: 1.05, glow: 0.12 }, up);
    b.tri(base, l, keel, { color: soft, shade: 0.6 }, down);
    b.tri(base, keel, r, { color: soft, shade: 0.5 }, down);
    b.tri(l, tip, keel, { color: soft, shade: 0.7 }, down);
    b.tri(keel, tip, r, { color: soft, shade: 0.6 }, down);
  }
}
function addPictureFrame(b, w, h) {
  const bar = 0.07;
  b.box([w + bar * 2, bar, 0.06], [0, h / 2 + bar / 2, 0], { bevel: 0.014, shade: 1.15 });
  b.box([w + bar * 2, bar, 0.06], [0, -h / 2 - bar / 2, 0], { bevel: 0.014, shade: 1.15 });
  b.box([bar, h, 0.06], [-w / 2 - bar / 2, 0, 0], { bevel: 0.014, shade: 1.15 });
  b.box([bar, h, 0.06], [w / 2 + bar / 2, 0, 0], { bevel: 0.014, shade: 1.15 });
  b.box([w + 0.02, h + 0.02, 0.02], [0, 0, -0.02], { shade: 0.5 });
  b.line([-w / 2, -h / 2 - bar - 1e-3, 0.02], [w / 2, -h / 2 - bar - 1e-3, 0.02], 0.014, [0, -1, 0], { glow: 0.8 });
}
function loopFrames(at, steps) {
  const pts = Array.from({ length: steps }, (_, i) => new THREE.Vector3(...at(i / steps)));
  const middle = pts.reduce((sum, p) => sum.add(p), new THREE.Vector3()).multiplyScalar(1 / steps);
  let length = 0;
  return pts.map((p, i) => {
    const next = pts[(i + 1) % steps];
    const prev = pts[(i + steps - 1) % steps];
    const tangent = next.clone().sub(prev).normalize();
    const away = p.clone().sub(middle);
    const y = tangent.clone().cross(away).normalize();
    const x = y.clone().cross(tangent).normalize();
    if (i > 0) length += p.distanceTo(prev);
    return { p: [p.x, p.y, p.z], x: [x.x, x.y, x.z], y: [y.x, y.y, y.z], t: length };
  });
}
function bandProfile(wide, thick) {
  const [w, t, e] = [wide / 2, thick / 2, Math.min(thick, wide) * 0.3];
  return [[-t, -w + e], [-t + e, -w], [t - e, -w], [t, -w + e], [t, -0.012], [t + 4e-3, -0.012], [t + 4e-3, 0.012], [t, 0.012], [t, w - e], [t - e, w], [-t + e, w], [-t, w - e]];
}
function metalTone(ground) {
  return new THREE.Color(ground).multiplyScalar(2.4).lerp(new THREE.Color(1450542), 0.5);
}
function addKnot(b, size = 0.7, p = 2, q = 3) {
  const [R, r] = [1, 0.48];
  const k = size / (2 * (R + r));
  const frames = loopFrames((u) => {
    const t = u * Math.PI * 2;
    const out = R + r * Math.cos(q * t);
    return [out * Math.cos(p * t) * k, out * Math.sin(p * t) * k, r * Math.sin(q * t) * k * 1.3];
  }, 60 * Math.max(p, q));
  const wide = size * (q > 3 ? 0.1 : 0.14);
  b.sweep(bandProfile(wide, size * 0.04), frames, (side) => side === 5 ? { glow: 1 } : side === 1 || side === 9 ? { shade: 1.35 } : side === 11 || side === 0 || side === 10 ? { shade: 0.75 } : {}, { loop: true });
}
function addHelix(b, size = 0.8) {
  const radius = size * 0.2;
  const turns = 1.5;
  const steps = 64;
  for (const start of [0, Math.PI]) {
    const frames = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const a = start + u * turns * Math.PI * 2;
      const out = radius * (0.25 + 0.75 * Math.sin(u * Math.PI));
      const x = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      const travel = new THREE.Vector3(-Math.sin(a) * out * turns * Math.PI * 2, size, Math.cos(a) * out * turns * Math.PI * 2).normalize();
      const y = travel.clone().cross(x).normalize();
      frames.push({ p: [x.x * out, size * (u - 0.5), x.z * out], x: [x.x, x.y, x.z], y: [y.x, y.y, y.z], t: u * size * 3 });
    }
    b.sweep(bandProfile(size * 0.1, size * 0.03), frames, (side) => side === 5 ? { glow: 1 } : side === 1 || side === 9 ? { shade: 1.35 } : side >= 10 || side === 0 ? { shade: 0.7 } : {});
  }
  for (let i = 1; i < 9; i++) {
    const u = i / 9;
    const a = u * turns * Math.PI * 2;
    const out = radius * (0.25 + 0.75 * Math.sin(u * Math.PI));
    b.place(new THREE.Matrix4().makeRotationY(-a).setPosition(0, size * (u - 0.5), 0));
    b.box([out * 2, size * 0.012, size * 0.012], [0, 0, 0], { glow: 0.8 });
  }
  b.at();
}
function addGyro(b, size = 0.7) {
  const hoops = [
    [0.5, [1, 0, 0], [0, 1, 0]],
    [0.39, [0, 0, 1], [0.34, 0.94, 0]],
    [0.28, [0.8, 0, 0.6], [-0.3, 0.87, 0.4]]
  ];
  for (const [radius, e1raw, e2raw] of hoops) {
    const e1 = new THREE.Vector3(...e1raw).normalize();
    const n = e1.clone().cross(new THREE.Vector3(...e2raw)).normalize();
    const e2 = n.clone().cross(e1);
    const frames = [];
    const steps = 48;
    for (let i = 0; i < steps; i++) {
      const a = i / steps * Math.PI * 2;
      const out = e1.clone().multiplyScalar(Math.cos(a)).addScaledVector(e2, Math.sin(a));
      frames.push({ p: [out.x * radius * size, out.y * radius * size, out.z * radius * size], x: [out.x, out.y, out.z], y: [-n.x, -n.y, -n.z], t: a * radius * size });
    }
    b.sweep(bandProfile(size * 0.075, size * 0.03), frames, (side) => side === 5 ? { glow: 1 } : side === 1 || side === 9 ? { shade: 1.35 } : side >= 10 || side === 0 ? { shade: 0.7 } : {}, { loop: true });
  }
  const r = size * 0.1;
  b.lathe([[5e-4, -r * 1.5], [r, 0], [5e-4, r * 1.5]], [0, 0, 0], 4, () => ({ glow: 0.9 }));
}
function addCrystal(b, size = 0.8, seed = 1, at = [0, 0, 0], degrees = 0) {
  let s = seed * 9301 + 49297;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const base = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(degrees)).setPosition(...at);
  const shard = (lean, turn, long, thick, sides) => {
    const m = new THREE.Matrix4().makeRotationY(turn).multiply(new THREE.Matrix4().makeRotationZ(lean));
    b.place(base.clone().multiply(m));
    const lit = 0.1 + rand() * 0.15;
    b.lathe([[5e-4, 0], [thick, long * 0.1], [thick * 0.92, long * 0.72], [5e-4, long]], [0, 0, 0], sides, (row) => row === 2 ? { shade: 1.5, glow: lit } : row === 0 ? { shade: 0.7 } : { shade: 0.95 + rand() * 0.3 }, { turn: rand() * 3 });
  };
  shard(0.04, 0, size, size * 0.13, 6);
  const more = 6;
  for (let i = 0; i < more; i++) shard(0.35 + rand() * 0.5, i / more * Math.PI * 2 + rand() * 0.6, size * (0.35 + rand() * 0.4), size * (0.05 + rand() * 0.045), 5);
}
function addSpiral(b, size = 0.8) {
  const count = 17;
  const bar = size * 0.02;
  for (let i = 0; i < count; i++) {
    const u = i / (count - 1);
    const half = size * (0.1 + 0.2 * Math.sin(u * Math.PI));
    b.place(new THREE.Matrix4().makeRotationY(u * 2.4).setPosition(0, size * (u - 0.5), 0));
    const lit = i % 3 === 1 ? { glow: 0.9 } : { bevel: bar * 0.3, shade: 1 + i % 2 * 0.25 };
    for (const k of [1, -1]) {
      b.box([half * 2 + bar, bar, bar], [0, 0, k * half], lit);
      b.box([bar, bar, half * 2 - bar], [k * half, 0, 0], lit);
    }
  }
  b.at();
  b.lathe([[size * 0.012, -size * 0.5], [size * 0.012, size * 0.5]], [0, 0, 0], 4);
  for (const k of [1, -1]) b.lathe([[5e-4, k * size * 0.5 - size * 0.05], [size * 0.035, k * size * 0.5], [5e-4, k * size * 0.5 + size * 0.05]], [0, 0, 0], 4, () => ({ glow: 1 }));
}
function addTree(b, leaf, seed = 1, tall = 2.4) {
  let s = seed * 9301 + 49297;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const turn = rand() * Math.PI;
  b.lathe([[0.2, 0], [0.13, 0.22], [0.1, tall * 0.5], [0.07, tall]], [0, 0, 0], 6, (row) => ({ shade: row === 0 ? 1.2 : 0.9 }), { twist: 0.9, turn });
  for (let i = 0; i < 3; i++) {
    const a = turn + i / 3 * Math.PI * 2;
    const [cx, cz] = [Math.cos(a), Math.sin(a)];
    const side = [-cz * 0.05, 0, cx * 0.05];
    for (const k of [1, -1])
      b.tri([cx * 0.14 + side[0] * k, 0, cz * 0.14 + side[2] * k], [cx * 0.42, 0, cz * 0.42], [cx * 0.12, 0.3, cz * 0.12], { shade: k > 0 ? 1.1 : 0.8 }, [side[0] * k, 0.02, side[2] * k]);
  }
  const tiers = 3 + seed % 2;
  let y = tall * 0.58;
  for (let i = 0; i < tiers; i++) {
    const u = i / tiers;
    const r = (1.02 - u * 0.7) * (0.9 + rand() * 0.2);
    const high = 0.62 - u * 0.12;
    b.lathe(
      [[r * 0.2, y + 0.06], [r, y], [r * 0.985, y + 0.035], [r * 0.42, y + high * 0.6], [0.03, y + high]],
      [0, 0, 0],
      7,
      (row) => row === 0 ? { color: leaf, glow: 0.22, shade: 1.2 } : row === 1 ? { glow: 0.9 } : { color: leaf, shade: row === 2 ? 1 : 0.7 },
      { turn: turn + i * 0.45 }
    );
    y += high * 0.62;
  }
  b.lathe([[5e-4, y + 0.16], [0.07, y + 0.27], [5e-4, y + 0.4]], [0, 0, 0], 4, () => ({ glow: 1 }), { turn });
}

// packages/sdk/src/environment.ts
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
var NOISE_GLSL = `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float noise3(vec3 p){
  vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}`;
function planSky(seed, ask = {}) {
  const rand = seeded(seed * 31 + 5);
  const side = ask.turn !== void 0 ? ask.turn < 0 ? -1 : 1 : rand() > 0.5 ? 1 : -1;
  const az = ask.turn !== void 0 ? THREE2.MathUtils.degToRad(ask.turn) : side * THREE2.MathUtils.degToRad(30 + rand() * 22);
  const el = THREE2.MathUtils.degToRad(ask.height ?? 19 + rand() * 4);
  const planet = new THREE2.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
  const right = new THREE2.Vector3(0, 1, 0).cross(planet).normalize().negate();
  const up = planet.clone().cross(right).normalize().negate();
  const lean = rand() * Math.PI * 2;
  const band = new THREE2.Vector3(Math.cos(lean) * 0.75, 0.62, Math.sin(lean) * 0.75).normalize();
  return { planet, right, up, size: (0.12 + rand() * 0.03) * (ask.size ?? 1), side, band };
}
function createSky(glow, ground, seed, plan) {
  const sky = new THREE2.Mesh(
    new THREE2.SphereGeometry(1, 48, 24),
    new THREE2.ShaderMaterial({
      side: THREE2.BackSide,
      depthWrite: false,
      depthTest: false,
      fog: false,
      uniforms: {
        uAccent: { value: glow },
        uGround: { value: ground },
        uTime: { value: 0 },
        uSeed: { value: seed % 100 },
        uPlanet: { value: plan.planet },
        uRight: { value: plan.right },
        uUp: { value: plan.up },
        uSize: { value: plan.size },
        // Where its light comes from, in its own directions (across, up, towards the eye): below and behind, so only an edge is lit.
        uLight: { value: new THREE2.Vector3(0.62 * plan.side, -0.5, -0.6).normalize() },
        // The pole its rings turn about, tipped towards the eye so they open into an ellipse.
        uRing: { value: new THREE2.Vector3(0.3 * plan.side, 0.88, 0.37).normalize() },
        uBand: { value: plan.band }
      },
      // The dome is drawn round the eye wherever it is, so the sky never comes closer.
      vertexShader: "varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0); gl_Position = p.xyww; }",
      fragmentShader: `uniform vec3 uAccent; uniform vec3 uGround; uniform float uTime; uniform float uSeed;
        uniform vec3 uPlanet; uniform vec3 uRight; uniform vec3 uUp; uniform float uSize; uniform vec3 uLight; uniform vec3 uRing; uniform vec3 uBand;
        varying vec3 vDir;
        ${SKY_GLSL}
        ${NOISE_GLSL}
        // One layer of stars: a lattice of cells, a few of which hold a star somewhere inside.
        vec3 stars(vec3 d, float scale, float share, float size){
          vec3 p = d * scale;
          vec3 id = floor(p);
          float pick = hash3(id);
          if (pick < 1.0 - share) return vec3(0.0);
          vec3 where = vec3(hash3(id + 1.7), hash3(id + 5.3), hash3(id + 9.1)) - 0.5;
          float dist = length(fract(p) - 0.5 - where * 0.55);
          float bright = fract(pick * 91.7);
          bright = 0.15 + 0.85 * bright * bright * bright;
          float twinkle = 0.75 + 0.25 * sin(uTime * (0.5 + bright * 2.0) + pick * 90.0);
          vec3 tint = mix(vec3(0.78, 0.86, 1.0), mix(uAccent, vec3(1.0), 0.35), step(0.6, fract(pick * 37.3)));
          return tint * smoothstep(size, 0.0, dist) * bright * twinkle;
        }
        void main(){
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 c = skyGlow(d, uAccent, uGround);
          float above = smoothstep(-0.01, 0.1, h);

          // The band of far stars: a faint cloud along one great circle, and more stars where it runs.
          float off = dot(d, uBand);
          float band = exp(-off * off * 16.0);
          float cloud = 0.0;
          if (band > 0.03) {
            cloud = noise3(d * 3.1 + uSeed) * 0.55 + noise3(d * 7.7 + uSeed) * 0.3 + noise3(d * 17.0) * 0.15;
            cloud = smoothstep(0.3, 0.8, cloud) * band;
            c += mix(uAccent, uAccent.brg, 0.5 * noise3(d * 2.0 - uSeed)) * cloud * 0.055 * above;
          }
          vec3 sky = stars(d, 95.0, 0.010 + 0.02 * band, 0.2) * 0.8 + stars(d, 44.0, 0.006, 0.13) * 1.5 + stars(d, 210.0, 0.012 + 0.03 * cloud, 0.3) * 0.3;
          c += sky * above;

          // The ringed world. Across its face: x and y from -1 to 1, as on a disc.
          if (dot(d, uPlanet) > 0.0) {
            vec2 q = vec2(dot(d, uRight), dot(d, uUp)) / uSize;
            float r2 = dot(q, q);
            float haze = smoothstep(0.02, 0.16, h); // it sinks into the horizon's light
            if (r2 < 9.0) {
              // Light spilling past the lit edge.
              float r = sqrt(r2);
              vec3 rim = vec3(q / max(r, 0.001), 0.0);
              float day = smoothstep(-0.1, 0.5, dot(rim, uLight));
              c += uAccent * exp(-max(r - 1.0, 0.0) * 7.0) * (0.02 + 0.3 * day) * haze * step(1.0, r2);
              if (r2 < 1.0) {
                vec3 n = vec3(q, sqrt(1.0 - r2));
                float lit = smoothstep(-0.02, 0.3, dot(n, uLight));
                // Its own grid: lines of longitude that turn with it, lines of latitude that don't.
                vec2 g = vec2(atan(n.x, n.z) + uTime * 0.006, asin(clamp(n.y, -1.0, 1.0))) * (12.0 / 3.14159265);
                vec2 gw = fwidth(g);
                vec2 gl = abs(fract(g - 0.5) - 0.5) / max(gw, vec2(0.0001));
                float line = (1.0 - min(min(gl.x, gl.y), 1.0)) * smoothstep(0.5, 0.15, max(gw.x, gw.y));
                // Lights on the night side, gathered where its cities would be.
                vec2 cell = floor(g * 5.0);
                float town = step(0.72, hash(cell)) * smoothstep(0.42, 0.62, noise(g * 0.8 + uSeed));
                float lamp = town * smoothstep(0.32, 0.1, length(fract(g * 5.0) - 0.5)) * (0.6 + 0.4 * sin(uTime * 0.7 + hash(cell) * 40.0));
                vec3 world = uGround * 0.22;
                world += uAccent * (line * 0.05 + lamp * 0.3) * (1.0 - lit);
                world = mix(world, uAccent * 0.42 + uGround, lit * 0.85);
                world += mix(uAccent, vec3(1.0), 0.35) * line * lit * 0.32;
                world += uAccent * pow(r2, 7.0) * (0.05 + 0.5 * lit);
                float edge = smoothstep(1.0, 1.0 - fwidth(r2) * 1.5, r2);
                c = mix(c, mix(c, world, haze), edge);
              }
              // The rings: where this line of sight meets their plane.
              float z = -(q.x * uRing.x + q.y * uRing.y) / uRing.z;
              if (r2 > 1.0 || z > 0.0) {
                vec3 P = vec3(q, z);
                float rho = length(P);
                float inside = smoothstep(1.42, 1.5, rho) * smoothstep(2.32, 2.24, rho);
                if (inside > 0.0) {
                  float k = rho * 26.0;
                  float lane = mix(hash(vec2(floor(k), 3.0 + uSeed)), hash(vec2(floor(k) + 1.0, 3.0 + uSeed)), smoothstep(0.35, 0.65, fract(k)));
                  float shade = mix(lane * lane, 0.3, smoothstep(0.3, 1.0, fwidth(k)));
                  shade *= 1.0 - 0.85 * smoothstep(0.06, 0.0, abs(rho - 1.93)); // a gap
                  float behind = dot(P, uLight);
                  float shadow = behind < 0.0 && length(P - uLight * behind) < 1.0 ? 0.1 : 1.0;
                  c += mix(uAccent, vec3(1.0), 0.2) * shade * inside * shadow * 0.24 * haze;
                }
              }
            }
          }

          // A grain finer than a screen can band.
          c += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.0015;
          gl_FragColor = vec4(max(c, 0.0), 1.0);
          #include <colorspace_fragment>
        }`
    })
  );
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  return sky;
}
function createConstellations(glow, seed, plan) {
  const rand = seeded(seed * 17 + 3);
  const lines = [];
  const lineData = [];
  const nodes = [];
  const nodeData = [];
  const FIGURES = 7;
  for (let f = 0; f < FIGURES; f++) {
    let start = new THREE2.Vector3();
    for (let tries = 0; tries < 30; tries++) {
      const az = rand() * Math.PI * 2;
      const el = THREE2.MathUtils.degToRad(24 + rand() * 46);
      start.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
      if (start.dot(plan.planet) < 0.72) break;
    }
    const phase = f / FIGURES + rand() * 0.05;
    const stars = [start];
    const far = [0];
    const count = 5 + Math.floor(rand() * 4);
    for (let i = 1; i < count; i++) {
      const from = rand() < 0.7 ? stars.length - 1 : Math.floor(rand() * stars.length);
      const step = new THREE2.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize().multiplyScalar(0.07 + rand() * 0.09);
      const next = stars[from].clone().add(step).normalize();
      if (next.y < 0.3) next.setY(0.3).normalize();
      const along = far[from] + stars[from].distanceTo(next) * 10;
      lines.push(...stars[from].toArray(), ...next.toArray());
      lineData.push(far[from], phase, along, phase);
      stars.push(next);
      far.push(along);
    }
    for (const s of stars) {
      nodes.push(...s.toArray());
      nodeData.push(0.5 + rand() * 0.5, phase);
    }
  }
  const SHOW = "float show(float phase, float t){ return smoothstep(0.1, 0.75, sin(t * 0.045 + phase * 6.2831) * 0.5 + 0.5); }";
  const VERT = "vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0); gl_Position = p.xyww;";
  const common = { transparent: true, depthWrite: false, blending: THREE2.AdditiveBlending, fog: false };
  const lineGeometry = new THREE2.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE2.Float32BufferAttribute(lines, 3));
  lineGeometry.setAttribute("data", new THREE2.Float32BufferAttribute(lineData, 2));
  const lineMaterial = new THREE2.ShaderMaterial({
    ...common,
    uniforms: { uAccent: { value: glow }, uTime: { value: 0 } },
    vertexShader: `attribute vec2 data; varying vec2 vData; varying float vUp; void main(){ vData = data; vUp = position.y; ${VERT} }`,
    fragmentShader: `uniform vec3 uAccent; uniform float uTime; varying vec2 vData; varying float vUp; ${SHOW}
      void main(){
        float on = show(vData.y, uTime) * smoothstep(0.2, 0.45, vUp);
        float run = smoothstep(0.92, 1.0, fract(vData.x * 0.28 - uTime * 0.11 + vData.y * 3.0));
        gl_FragColor = vec4(mix(uAccent, vec3(1.0), 0.25 + 0.5 * run), (0.2 + 0.8 * run) * on);
        #include <colorspace_fragment>
      }`
  });
  const nodeGeometry = new THREE2.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE2.Float32BufferAttribute(nodes, 3));
  nodeGeometry.setAttribute("data", new THREE2.Float32BufferAttribute(nodeData, 2));
  const nodeMaterial = new THREE2.ShaderMaterial({
    ...common,
    uniforms: { uAccent: { value: glow }, uTime: { value: 0 }, uPixels: { value: 1 } },
    vertexShader: `attribute vec2 data; uniform float uPixels; varying vec2 vData; varying float vUp; void main(){ vData = data; vUp = position.y; ${VERT} gl_PointSize = (5.0 + 5.0 * data.x) * uPixels; }`,
    fragmentShader: `uniform vec3 uAccent; uniform float uTime; varying vec2 vData; varying float vUp; ${SHOW}
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float on = show(vData.y, uTime) * smoothstep(0.2, 0.45, vUp);
        float a = smoothstep(0.16, 0.06, d) + smoothstep(0.5, 0.1, d) * 0.22;
        gl_FragColor = vec4(mix(uAccent, vec3(1.0), 0.5), a * on * (0.55 + 0.45 * vData.x));
        #include <colorspace_fragment>
      }`
  });
  const group = new THREE2.Group();
  const drawn = [new THREE2.LineSegments(lineGeometry, lineMaterial), new THREE2.Points(nodeGeometry, nodeMaterial)];
  for (const o of drawn) {
    o.frustumCulled = false;
    o.renderOrder = -9;
    o.onBeforeRender = (renderer) => {
      nodeMaterial.uniforms.uPixels.value = renderer.getPixelRatio();
    };
  }
  group.add(...drawn);
  return group;
}
function createGround(glow, ground) {
  const floor = new THREE2.Mesh(
    new THREE2.PlaneGeometry(900, 900),
    new THREE2.ShaderMaterial({
      uniforms: { uAccent: { value: glow }, uGround: { value: ground }, uTime: { value: 0 } },
      vertexShader: "varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: `uniform vec3 uAccent; uniform vec3 uGround; uniform float uTime; varying vec3 vWorld;
        ${SKY_GLSL}
        ${NOISE_GLSL}
        // A line every \`size\` metres, one pixel sharp at any distance: x across, y along.
        vec2 rule(vec2 p, float size){
          vec2 q = p / size;
          vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
          return 1.0 - min(g, 1.0);
        }
        void main(){
          vec2 p = vWorld.xz;
          vec3 V = normalize(cameraPosition - vWorld);
          float far = length(p - cameraPosition.xz);
          vec2 fine = rule(p, 1.0) * exp(-far * 0.085);
          vec2 wide = rule(p, 8.0) * exp(-far * 0.02);
          // Each eight-metre plate is its own piece of ground: a shade apart from its neighbours.
          vec2 plate = floor(p / 8.0);
          vec3 c = uGround * (0.86 + 0.28 * hash(plate)) ;
          // The sky in the floor, as on polished stone: nothing straight down, a lot at a glancing angle.
          float glance = pow(1.0 - max(V.y, 0.0), 5.0);
          c += skyGlow(reflect(-V, vec3(0.0, 1.0, 0.0)), uAccent, uGround) * glance * 0.55;
          // Light running along the main lines, each at its own pace and in its own direction.
          float lineX = floor(p.y / 8.0 + 0.5);
          float lineZ = floor(p.x / 8.0 + 0.5);
          float boltX = smoothstep(0.972, 1.0, fract(p.x * 0.011 * (hash(vec2(lineX, 3.0)) > 0.5 ? 1.0 : -1.0) - uTime * (0.05 + 0.07 * hash(vec2(lineX, 9.0))) + hash(vec2(lineX, 1.0))));
          float boltZ = smoothstep(0.972, 1.0, fract(p.y * 0.011 * (hash(vec2(lineZ, 5.0)) > 0.5 ? 1.0 : -1.0) - uTime * (0.05 + 0.07 * hash(vec2(lineZ, 7.0))) + hash(vec2(lineZ, 2.0))));
          float bolts = wide.y * boltX + wide.x * boltZ;
          // A slow ring of light that travels out across the floor.
          float ring = smoothstep(2.6, 0.0, abs(far - mod(uTime * 5.0, 110.0))) * exp(-far * 0.028);
          float light = max(fine.x, fine.y) * 0.26 + max(wide.x, wide.y) * 0.8 + ring * (0.1 + max(fine.x, fine.y) * 0.5);
          c = mix(c, uAccent, clamp(light, 0.0, 1.0));
          c += mix(uAccent, vec3(1.0), 0.6) * bolts * 1.4;
          // A stud where the main lines cross.
          vec2 cross8 = abs(fract(p / 8.0 + 0.5) - 0.5) * 8.0;
          c += uAccent * smoothstep(0.16, 0.1, max(cross8.x, cross8.y)) * exp(-far * 0.03) * 0.8;
          c = mix(c, uAccent, 0.07 * smoothstep(40.0, 300.0, far));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = -2;
  return floor;
}
function skylineShapes() {
  const dark = { bevel: 0.02 };
  const windows = (b, y0, y1, half, rows, glow = 0.26) => {
    for (let r = 0; r < rows; r++) {
      const y = y0 + (r + 0.5) / rows * (y1 - y0);
      const w = 0.35 * ((y1 - y0) / rows);
      b.line([-half * 0.82, y, half + 1e-3], [half * 0.82, y, half + 1e-3], w, [0, 0, 1], { glow, flow: r });
      b.line([half + 1e-3, y, half * 0.82], [half + 1e-3, y, -half * 0.82], w, [1, 0, 0], { glow, flow: r + 0.5 });
      b.line([half * 0.82, y, -half - 1e-3], [-half * 0.82, y, -half - 1e-3], w, [0, 0, -1], { glow, flow: r + 1 });
      b.line([-half - 1e-3, y, -half * 0.82], [-half - 1e-3, y, half * 0.82], w, [-1, 0, 0], { glow, flow: r + 1.5 });
    }
  };
  const seams = (b, y0, y1, half, width = 0.02) => {
    for (const [ox, oz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]])
      b.line([ox * (half + 4e-3), y0, oz * (half + 4e-3)], [ox * (half + 4e-3), y1, oz * (half + 4e-3)], width, [ox, 0, oz], { glow: 0.9 });
  };
  const spire = new MeshBuilder().at();
  const tiers = [[0.5, 0, 0.36], [0.39, 0.37, 0.62], [0.27, 0.63, 0.8], [0.14, 0.81, 0.9]];
  for (const [half, y0, y1] of tiers) {
    spire.box([half * 2, y1 - y0, half * 2], [0, (y0 + y1) / 2, 0], dark);
    spire.box([half * 2 + 0.03, 8e-3, half * 2 + 0.03], [0, y1 - 4e-3, 0], { glow: 0.6 });
    windows(spire, y0 + 0.02, y1 - 0.03, half, Math.max(2, Math.round((y1 - y0) * 22)));
    seams(spire, y0, y1, half);
  }
  spire.lathe([[0.03, 0.9], [0.012, 0.985]], [0, 0, 0], 4, () => ({ shade: 1.4 }));
  spire.box([0.04, 0.012, 0.04], [0, 0.992, 0], { glow: 1 });
  const blade = new MeshBuilder().at();
  const [bx, bz, lo, hi] = [0.2, 0.46, 0.8, 1];
  blade.quad([-bx, 0, bz], [bx, 0, bz], [bx, lo, bz], [-bx, lo, bz], {}, [0, 0, 1]);
  blade.quad([-bx, 0, -bz], [bx, 0, -bz], [bx, hi, -bz], [-bx, hi, -bz], {}, [0, 0, -1]);
  for (const sx of [-1, 1]) blade.quad([sx * bx, 0, -bz], [sx * bx, 0, bz], [sx * bx, lo, bz], [sx * bx, hi, -bz], { shade: 1.15 }, [sx, 0, 0]);
  blade.quad([-bx, lo, bz], [bx, lo, bz], [bx, hi, -bz], [-bx, hi, -bz], { glow: 0.5 }, [0, 1, 0.3]);
  for (const sx of [-1, 1]) {
    for (const z of [-0.3, -0.1, 0.1, 0.3]) blade.line([sx * (bx + 2e-3), 0.03, z], [sx * (bx + 2e-3), lo + (hi - lo) * (0.5 - z / (bz * 2)) - 0.03, z], 0.018, [sx, 0, 0], { glow: 0.55 });
    blade.box([0.05, 0.9 * lo, 0.12], [sx * (bx + 0.025), 0.45 * lo, 0], dark);
  }
  blade.line([0, 0.03, bz + 2e-3], [0, lo - 0.02, bz + 2e-3], 0.03, [0, 0, 1], { glow: 0.9 });
  blade.line([0, 0.03, -bz - 2e-3], [0, hi - 0.02, -bz - 2e-3], 0.03, [0, 0, -1], { glow: 0.9 });
  const twin = new MeshBuilder().at();
  for (const [x, top] of [[-0.3, 1], [0.3, 0.74]]) {
    twin.box([0.38, top - 0.06, 0.8], [x, (top - 0.06) / 2, 0], dark);
    twin.box([0.3, 0.06, 0.6], [x, top - 0.03, 0], dark);
    twin.box([0.32, 8e-3, 0.62], [x, top - 0.062, 0], { glow: 0.7 });
    for (const z of [0.401, -0.401]) twin.line([x, 0.03, z], [x, top - 0.08, z], 0.03, [0, 0, z], { glow: 0.9 });
    for (let r = 0; r < Math.round(top * 14); r++) {
      const y = 0.05 + r / Math.round(top * 14) * (top - 0.14);
      for (const sx of [-1, 1]) twin.line([x + sx * 0.191, y, -0.33], [x + sx * 0.191, y, 0.33], 0.014, [sx, 0, 0], { glow: 0.3, flow: r });
    }
  }
  for (const y of [0.34, 0.6]) {
    twin.box([0.24, 0.03, 0.14], [0, y, 0], dark);
    twin.line([-0.11, y - 0.016, 0], [0.11, y - 0.016, 0], 0.05, [0, -1, 0], { glow: 0.8 });
  }
  const stack = new MeshBuilder().at();
  const shaft = [[0.36, 0]];
  const decks = 6;
  for (let i = 0; i < decks; i++) {
    const y = 0.1 + i / decks * 0.78;
    const r = 0.36 - i * 0.03;
    shaft.push([r, y], [r + 0.14, y + 0.012], [r + 0.14, y + 0.03], [r - 0.03, y + 0.045]);
  }
  shaft.push([0.15, 0.9], [0.05, 0.93], [0.012, 1]);
  stack.lathe(shaft, [0, 0, 0], 6, (row) => row > 0 && (row - 1) % 4 === 1 && row < decks * 4 ? { glow: 0.3 } : (row - 1) % 4 === 0 ? { shade: 0.7 } : {});
  stack.box([0.03, 0.012, 0.03], [0, 1, 0], { glow: 1 });
  const arch = new MeshBuilder().at();
  const moulding = mouldingProfile(0.03, 0.045, 0.012, 8e-3, 8e-3);
  const turns = 64;
  const frames = [];
  for (let i = 0; i < turns; i++) {
    const a = Math.PI * 2 - i / turns * Math.PI * 2;
    frames.push({ p: [Math.cos(a) * 0.5, 0.36 + Math.sin(a) * 0.5, 0], x: [Math.cos(a), Math.sin(a), 0], y: [0, 0, 1], t: i * 0.6 });
  }
  arch.sweep(moulding, frames, mouldingPaint, { loop: true });
  return { towers: [spire, blade, twin, stack], arch };
}
function createEnvironment(accent, opts = {}) {
  const group = new THREE2.Group();
  group.name = "environment";
  const glow = new THREE2.Color(accent);
  const ground = new THREE2.Color(opts.ground ?? GROUND);
  const clear = opts.clear ?? 14;
  const seed = opts.seed ?? Math.round((glow.r * 7 + glow.g * 13 + glow.b * 29 + ground.r * 31) * 1e3);
  const ticking = [];
  const plan = planSky(seed, opts.planet);
  const sky = createSky(glow, ground, seed, plan);
  const floor = createGround(glow, ground);
  ticking.push(sky.material, floor.material);
  group.add(sky, floor);
  if (opts.constellations !== false) {
    const figures = createConstellations(glow, seed, plan);
    for (const o of figures.children) ticking.push(o.material);
    group.add(figures);
  }
  if (opts.skyline !== false) {
    const rand = seeded(20261117 + seed);
    const alloy = createAlloy(glow, { ground, gloss: 0.6, speed: 0.25, reach: 5 });
    ticking.push(alloy);
    const shapes = skylineShapes();
    const each = shapes.towers.map(() => []);
    const snap = (n) => Math.round(n / 2) * 2;
    const up = new THREE2.Vector3(0, 1, 0);
    const place = (out, w, h) => {
      const angle = rand() * Math.PI * 2;
      const kind = Math.floor(rand() * shapes.towers.length);
      each[kind].push(
        new THREE2.Matrix4().compose(
          new THREE2.Vector3(snap(Math.sin(angle) * out), 0, snap(Math.cos(angle) * out)),
          new THREE2.Quaternion().setFromAxisAngle(up, Math.floor(rand() * 4) * (Math.PI / 2)),
          new THREE2.Vector3(w, h, w)
        )
      );
    };
    for (let i = 0; i < 18; i++) place(clear + 85 + rand() * 50, 7 + rand() * 6, 9 + rand() * rand() * 22);
    for (let i = 0; i < 60; i++) place(clear + 125 + rand() * 170, 11 + rand() * 9, 26 + rand() * rand() * 96);
    shapes.towers.forEach((shape, k) => {
      const towers = new THREE2.InstancedMesh(shape.geometry(), alloy, each[k].length);
      each[k].forEach((m, i) => towers.setMatrixAt(i, m));
      towers.instanceMatrix.needsUpdate = true;
      towers.frustumCulled = false;
      group.add(towers);
    });
    const ARCHES = 3;
    const arches = new THREE2.InstancedMesh(shapes.arch.geometry(), alloy, ARCHES);
    const turn = rand() * Math.PI * 2;
    for (let i = 0; i < ARCHES; i++) {
      const angle = turn + i / ARCHES * Math.PI * 2 + (rand() - 0.5) * 0.7;
      const out = clear + 200 + rand() * 90;
      const size = 110 + rand() * 70;
      arches.setMatrixAt(i, new THREE2.Matrix4().compose(new THREE2.Vector3(Math.sin(angle) * out, 0, Math.cos(angle) * out), new THREE2.Quaternion().setFromAxisAngle(up, angle), new THREE2.Vector3(size, size, size)));
    }
    arches.instanceMatrix.needsUpdate = true;
    arches.frustumCulled = false;
    group.add(arches);
  }
  if (opts.dust !== false) {
    const rand = seeded(7 + seed);
    const N = 320;
    const at = new Float32Array(N * 3);
    const phase = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = rand() * Math.PI * 2;
      const r = 2 + rand() * 30;
      at.set([Math.cos(a) * r, 0.2 + rand() * rand() * 8, Math.sin(a) * r], i * 3);
      phase[i] = rand();
    }
    const geometry = new THREE2.BufferGeometry();
    geometry.setAttribute("position", new THREE2.BufferAttribute(at, 3));
    geometry.setAttribute("phase", new THREE2.BufferAttribute(phase, 1));
    const dust = new THREE2.Points(
      geometry,
      new THREE2.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE2.AdditiveBlending,
        uniforms: { uAccent: { value: glow }, uTime: { value: 0 }, uPixels: { value: 1 } },
        vertexShader: `attribute float phase; uniform float uTime; uniform float uPixels; varying float vFade;
          void main(){
            vec3 p = position;
            p.y += sin(uTime * 0.25 + phase * 40.0) * 0.35;
            p.x += sin(uTime * 0.11 + phase * 17.0) * 0.5;
            p.z += cos(uTime * 0.09 + phase * 29.0) * 0.5;
            vec4 v = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * v;
            // Small and sharp: a mote, never a blur across the view.
            gl_PointSize = clamp((1.5 + phase * 2.5) * (9.0 / max(-v.z, 1.0)), 1.5, 7.0) * uPixels;
            vFade = (0.2 + 0.8 * (0.5 + 0.5 * sin(uTime * 0.6 + phase * 80.0))) * smoothstep(44.0, 14.0, -v.z) * smoothstep(0.6, 2.2, -v.z);
          }`,
        fragmentShader: `uniform vec3 uAccent; varying float vFade;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            gl_FragColor = vec4(mix(uAccent, vec3(1.0), 0.4), (smoothstep(0.22, 0.08, d) + smoothstep(0.5, 0.0, d) * 0.3) * vFade * 0.6);
            #include <colorspace_fragment>
          }`
      })
    );
    dust.frustumCulled = false;
    dust.onBeforeRender = (renderer) => {
      dust.material.uniforms.uPixels.value = renderer.getPixelRatio();
    };
    ticking.push(dust.material);
    group.add(dust);
  }
  return {
    group,
    update(t) {
      for (const m of ticking) m.uniforms.uTime.value = t;
    }
  };
}

// packages/sdk/src/home.ts
function addressLine(dest) {
  if (!dest.url) return "A world on Nostr";
  const chk = checkDestination(dest.url);
  return chk.ok ? chk.value.registrableDomain ?? chk.value.hostname : "invalid address";
}
var archMask = null;
function archMaskTexture() {
  if (archMask) return archMask;
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 700;
  const g = canvas.getContext("2d");
  const k = canvas.height / PORTAL_HEIGHT;
  g.beginPath();
  g.moveTo(0, canvas.height);
  g.lineTo(0, canvas.height - PORTAL_SPRING * k);
  g.arc(canvas.width / 2, canvas.height - PORTAL_SPRING * k, canvas.width / 2, Math.PI, 0);
  g.lineTo(canvas.width, canvas.height);
  g.closePath();
  g.fillStyle = "#ffffff";
  g.fill();
  archMask = new THREE3.CanvasTexture(canvas);
  return archMask;
}
var frameGeometry = null;
function archFrameGeometry() {
  if (!frameGeometry) {
    const b = new MeshBuilder().at();
    addArchFrame(b);
    frameGeometry = b.geometry();
  }
  return frameGeometry;
}
function veilMaterial(color) {
  return new THREE3.ShaderMaterial({
    side: THREE3.DoubleSide,
    uniforms: { uTime: { value: 0 }, uColor: { value: color }, uAim: { value: 0 }, uSize: { value: new THREE3.Vector2(PORTAL_WIDTH, PORTAL_HEIGHT) }, uSpring: { value: PORTAL_SPRING } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform float uTime; uniform vec3 uColor; uniform float uAim; uniform vec2 uSize; uniform float uSpring; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      // Distance to the nearest edge of a honeycomb, and which cell this is.
      vec3 comb(vec2 p){
        vec2 r = vec2(1.0, 1.7320508);
        vec2 a = mod(p, r) - r * 0.5;
        vec2 b = mod(p - r * 0.5, r) - r * 0.5;
        vec2 g = dot(a, a) < dot(b, b) ? a : b;
        float edge = 0.5 - max(abs(g.x), dot(abs(g), normalize(r)));
        return vec3(edge, p - g);
      }
      void main(){
        vec2 p = vec2((vUv.x - 0.5) * uSize.x, vUv.y * uSize.y);
        float half_ = uSize.x * 0.5;
        float d = p.y < uSpring ? half_ - abs(p.x) : half_ - length(p - vec2(0.0, uSpring));
        if (d < 0.0) discard;
        vec2 mid = vec2(0.0, uSize.y * 0.52);
        float deep = 1.0 - smoothstep(0.0, 1.15, length((p - mid) * vec2(1.0, 0.72)));
        vec3 c = mix(vec3(0.004, 0.007, 0.012), uColor * 0.2, deep);
        // The honeycomb: faint lines, and a cell here and there lit for a while.
        vec3 h = comb(p * 9.0 + vec2(0.0, uTime * 0.12));
        float cell = hash(h.yz);
        float lit = smoothstep(0.86, 1.0, sin(uTime * (0.35 + cell * 0.6) + cell * 40.0) * 0.5 + 0.5) * step(0.7, cell);
        c += uColor * (smoothstep(0.045, 0.0, h.x) * (0.1 + 0.2 * deep) + lit * 0.32 * smoothstep(0.0, 0.2, h.x));
        // A band of light rising, and the glow at the heart of it.
        float band = smoothstep(0.16, 0.0, abs(fract(p.y * 0.36 - uTime * 0.07) - 0.5) - 0.02);
        c += uColor * band * 0.12;
        c += (uColor * 0.85 + 0.25) * pow(deep, 3.0) * (0.36 + 0.4 * uAim);
        // Darker towards the frame, so it reads as set back into it.
        c *= 0.45 + 0.55 * smoothstep(0.0, 0.22, d);
        c *= 1.0 + uAim * 0.5;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`
  });
}
function gateGlow(color) {
  const material = new THREE3.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE3.AdditiveBlending,
    side: THREE3.DoubleSide,
    uniforms: { uColor: { value: color }, uAim: { value: 0 }, uSpring: { value: PORTAL_SPRING }, uRadius: { value: PORTAL_WIDTH / 2 + 0.09 } },
    vertexShader: "attribute float floor; varying vec2 vAt; varying float vFloor; void main(){ vAt = position.xy; vFloor = floor; vec3 p = floor > 0.5 ? vec3(position.x, 0.014, position.y) : position; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
    fragmentShader: `uniform vec3 uColor; uniform float uAim; uniform float uSpring; uniform float uRadius; varying vec2 vAt; varying float vFloor;
      void main(){
        float a;
        if (vFloor > 0.5) {
          // On the floor: brightest under the opening, gone a couple of metres out.
          vec2 q = vAt / vec2(1.7, 2.4);
          a = pow(max(1.0 - dot(q, q), 0.0), 2.0) * 0.2;
        } else {
          float d = vAt.y < uSpring ? abs(abs(vAt.x) - uRadius) : abs(length(vAt - vec2(0.0, uSpring)) - uRadius);
          a = (exp(-d * 5.0) * 0.16 + exp(-d * 18.0) * 0.2) * smoothstep(-0.02, 0.5, vAt.y);
        }
        gl_FragColor = vec4(uColor, a * (0.8 + 0.6 * uAim));
        #include <colorspace_fragment>
      }`
  });
  const group = new THREE3.Group();
  const [w, h] = [PORTAL_WIDTH + 2.6, PORTAL_HEIGHT + 1.7];
  for (const z of [0.125, -0.125]) {
    const sheet = new THREE3.PlaneGeometry(w, h);
    sheet.translate(0, h / 2 - 0.2, z);
    sheet.setAttribute("floor", new THREE3.Float32BufferAttribute([0, 0, 0, 0], 1));
    group.add(new THREE3.Mesh(sheet, material));
  }
  const pool = new THREE3.PlaneGeometry(3.4, 4.8);
  pool.setAttribute("floor", new THREE3.Float32BufferAttribute([1, 1, 1, 1], 1));
  const onFloor = new THREE3.Mesh(pool, material);
  onFloor.frustumCulled = false;
  group.add(onFloor);
  return { group, material };
}
function createPortalGate(destination, opts = {}) {
  const color = new THREE3.Color(opts.color ?? 5032432);
  const textColor = opts.textColor ?? "#f2f3f6";
  const group = new THREE3.Group();
  const alloy = createAlloy(color, { gloss: 0.75 });
  const frame = new THREE3.Mesh(archFrameGeometry(), alloy);
  const veil = veilMaterial(color);
  const plane = new THREE3.PlaneGeometry(PORTAL_WIDTH, PORTAL_HEIGHT);
  const target = new THREE3.Mesh(plane, veil);
  target.name = "portal";
  target.position.y = PORTAL_HEIGHT / 2;
  const glow = gateGlow(color);
  group.add(frame, target, glow.group);
  let sign = null;
  const setLabel = (label) => {
    if (sign) {
      group.remove(sign);
      sign.material.map?.dispose();
      sign.material.dispose();
    }
    sign = textSprite(`${label}
${addressLine(destination)}`, textColor, 2.2);
    sign.position.set(0, PORTAL_SIGN_HEIGHT, 0);
    group.add(sign);
  };
  setLabel(opts.label ?? "Portal");
  let aim = 0;
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
      aim += (gate.aimed - aim) * Math.min(1, dt * 12);
      veil.uniforms.uTime.value = t;
      veil.uniforms.uAim.value = aim;
      glow.material.uniforms.uAim.value = aim;
      alloy.tick(t);
      alloy.aim(aim);
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
var haloTexture = null;
function createHalo(color, size) {
  if (!haloTexture) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const g = canvas.getContext("2d");
    const fade = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    fade.addColorStop(0, "rgba(255,255,255,0.9)");
    fade.addColorStop(0.18, "rgba(255,255,255,0.32)");
    fade.addColorStop(0.5, "rgba(255,255,255,0.07)");
    fade.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = fade;
    g.fillRect(0, 0, 128, 128);
    haloTexture = new THREE3.CanvasTexture(canvas);
  }
  const halo = new THREE3.Sprite(new THREE3.SpriteMaterial({ map: haloTexture, color, transparent: true, depthWrite: false, blending: THREE3.AdditiveBlending }));
  halo.scale.setScalar(size);
  return halo;
}
function buildRoom(layout, b) {
  if (layout.room.template !== "hall") return;
  const W = 16;
  const D = 14;
  const H = 4.5;
  const mid = -D / 2 + 5;
  addWall(b.at([0, 0, mid - D / 2 - 0.1]), W + 0.6, H);
  addWall(b.at([-W / 2 - 0.1, 0, mid], 90), D, H);
  addWall(b.at([W / 2 + 0.1, 0, mid], -90), D, H);
}
function buildItem(p, layout, b, soft, opts, portals, index) {
  const accent = new THREE3.Color(layout.room.accent);
  const textColor = opts.textColor ?? "#f2f3f6";
  const g = new THREE3.Group();
  b.at(p.position, p.rotation);
  if (p.source === "published") {
    const box = new THREE3.LineSegments(new THREE3.EdgesGeometry(new THREE3.BoxGeometry(0.5, 0.5, 0.5)), new THREE3.LineBasicMaterial({ color: accent }));
    box.position.y = 0.25;
    g.add(box);
    return g;
  }
  switch (p.type) {
    case "frame": {
      const W = 1.2;
      const H = 0.9;
      addPictureFrame(b, W, H);
      const picture = new THREE3.Mesh(new THREE3.PlaneGeometry(W, H), new THREE3.MeshBasicMaterial({ color: 857632 }));
      picture.position.z = 0.012;
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
    case "plant":
      addPlant(b, soft, index + 1);
      return null;
    case "lamp": {
      addLamp(b);
      const halo = createHalo(accent, 1.5);
      halo.position.y = 1.64;
      const pool = createHalo(accent, 1);
      const disc = new THREE3.Mesh(new THREE3.CircleGeometry(2.6, 40), new THREE3.MeshBasicMaterial({ map: pool.material.map, color: accent, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE3.AdditiveBlending }));
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = 0.012;
      g.add(halo, disc);
      return g;
    }
    case "bench":
      addBench(b, soft);
      return null;
    case "table":
      addTable(b, soft);
      return null;
    case "plinth":
      addPlinth(b);
      return null;
    default:
      return null;
  }
}
function createHome(layout, opts = {}) {
  const group = new THREE3.Group();
  group.name = `home:${layout.d}`;
  const accent = new THREE3.Color(layout.room.accent);
  const ground = new THREE3.Color(layout.room.color);
  if (opts.lights !== false) {
    group.add(new THREE3.HemisphereLight(16777215, ground, 0.9));
    const key = new THREE3.DirectionalLight(16777215, 0.8);
    key.position.set(3, 9, 5);
    group.add(key);
  }
  const environment = opts.environment === false ? null : createEnvironment(accent, { ground });
  if (environment) group.add(environment.group);
  const b = new MeshBuilder();
  b.tone = metalTone(ground);
  const soft = b.tone.clone().lerp(accent, 0.03);
  buildRoom(layout, b);
  if (layout.room.template === "open") {
    const edge = new THREE3.Mesh(new THREE3.RingGeometry(11.94, 12, 96), new THREE3.MeshBasicMaterial({ color: accent }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = 0.012;
    group.add(edge);
  }
  const portals = [];
  let markers = 0;
  layout.items.forEach((p, i) => {
    const object = buildItem(p, layout, b, soft, opts, portals, i);
    if (p.source === "published") markers++;
    if (!object) return;
    object.position.set(...p.position);
    object.rotation.y = THREE3.MathUtils.degToRad(p.rotation);
    group.add(object);
  });
  let alloy = null;
  if (b.triangles > 0) {
    alloy = createAlloy(accent, { ground, gloss: 0.55 });
    group.add(b.build(alloy));
  }
  return {
    group,
    portals,
    markers,
    update(t, dt) {
      environment?.update(t);
      alloy?.tick(t);
      for (const gate of portals) gate.update(t, dt);
    }
  };
}
export {
  GROUND,
  MeshBuilder,
  PORTAL_HEIGHT,
  PORTAL_WIDTH,
  addArchFrame,
  addBench,
  addCrystal,
  addGyro,
  addHelix,
  addKnot,
  addLamp,
  addPictureFrame,
  addPlant,
  addPlinth,
  addSpiral,
  addTable,
  addTree,
  addWall,
  archFrameGeometry,
  bandProfile,
  createAlloy,
  createEnvironment,
  createHalo,
  createHome,
  createPortalGate,
  loopFrames,
  metalTone,
  mouldingPaint,
  mouldingProfile
};
