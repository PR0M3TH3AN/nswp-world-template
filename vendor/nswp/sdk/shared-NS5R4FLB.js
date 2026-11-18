import {
  room
} from "./shared-PMZZ7JZF.js";
import {
  ICONS,
  rgb
} from "./shared-WXBVZMXQ.js";

// packages/sdk/src/three.ts
import * as THREE3 from "three";
import { spawnOffset } from "@nswp/core";

// packages/sdk/src/turn.ts
import * as THREE from "three";
function turnVisitor(rig, camera, degrees) {
  const head = camera.getWorldPosition(new THREE.Vector3());
  const a = THREE.MathUtils.degToRad(degrees);
  const dx = rig.position.x - head.x;
  const dz = rig.position.z - head.z;
  rig.position.x = head.x + dx * Math.cos(a) + dz * Math.sin(a);
  rig.position.z = head.z - dx * Math.sin(a) + dz * Math.cos(a);
  rig.rotation.y += a;
}

// packages/sdk/src/console.ts
import * as THREE2 from "three";
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
  return new THREE2.ShaderMaterial({
    transparent: true,
    depthTest: false,
    side: THREE2.DoubleSide,
    uniforms: { map: { value: map }, uOpen: { value: 1 }, uTime: { value: 0 }, uAccent: { value: new THREE2.Color() }, uLines: { value: 1 } },
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
  const group = new THREE2.Group();
  group.name = "nswp-console";
  group.visible = false;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  const texture = new THREE2.CanvasTexture(canvas);
  texture.colorSpace = THREE2.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = holoMaterial(texture);
  const panel = new THREE2.Mesh(new THREE2.PlaneGeometry(1, ASPECT), material);
  panel.renderOrder = 30;
  panel.visible = false;
  group.add(panel);
  const openerCanvas = document.createElement("canvas");
  openerCanvas.width = 256;
  openerCanvas.height = 300;
  const openerTexture = new THREE2.CanvasTexture(openerCanvas);
  openerTexture.colorSpace = THREE2.SRGBColorSpace;
  const opener = new THREE2.Mesh(new THREE2.PlaneGeometry(0.15, 0.15 * 300 / 256), new THREE2.MeshBasicMaterial({ map: openerTexture, transparent: true, depthTest: false }));
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
  const head = new THREE2.Vector3();
  const facing = new THREE2.Vector3();
  const want = new THREE2.Vector3();
  const hand = new THREE2.Vector3();
  const toHand = new THREE2.Vector3();
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
  const tex = new THREE3.CanvasTexture(canvas);
  tex.colorSpace = THREE3.SRGBColorSpace;
  const sprite = new THREE3.Sprite(new THREE3.SpriteMaterial({ map: tex, depthWrite: false }));
  sprite.scale.set(width, width * canvas.height / canvas.width, 1);
  return sprite;
}
function createPresence(d) {
  const labelColor = d.labelColor ?? "#ffffff";
  const changed = () => d.onChange?.();
  const listener = new THREE3.AudioListener();
  d.camera.add(listener);
  const avatars = /* @__PURE__ */ new Map();
  const pendingStreams = /* @__PURE__ */ new Map();
  let session = null;
  let roomName = null;
  let sendTimer;
  let micTrack = null;
  let offsetApplied = false;
  const makeAvatar = (member) => {
    const color = new THREE3.Color(member.color);
    const root = new THREE3.Group();
    root.visible = false;
    const head = new THREE3.Group();
    const skull = new THREE3.Mesh(new THREE3.SphereGeometry(0.13, 24, 16), new THREE3.MeshStandardMaterial({ color, roughness: 0.5 }));
    const visor = new THREE3.Mesh(new THREE3.BoxGeometry(0.2, 0.07, 0.06), new THREE3.MeshStandardMaterial({ color: 1119256, roughness: 0.2, metalness: 0.6 }));
    visor.position.set(0, 0.02, -0.1);
    const label = textSprite(member.name, labelColor, 0.5);
    label.position.set(0, 0.3, 0);
    head.add(skull, visor, label);
    const torso = new THREE3.Mesh(new THREE3.CylinderGeometry(0.1, 0.17, 0.5, 16), new THREE3.MeshStandardMaterial({ color, roughness: 0.8, transparent: true, opacity: 0.85 }));
    const handGeo = new THREE3.SphereGeometry(0.045, 12, 8);
    const handMat = new THREE3.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
    const hands = [new THREE3.Mesh(handGeo, handMat), new THREE3.Mesh(handGeo, handMat)];
    hands.forEach((h) => h.visible = false);
    root.add(head, torso, ...hands);
    d.scene.add(root);
    const materials = [skull.material, visor.material, torso.material, handMat, label.material].map((material) => {
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
    const pa = new THREE3.PositionalAudio(listener);
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
  const v = new THREE3.Vector3();
  const q = new THREE3.Quaternion();
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
  const tp = new THREE3.Vector3();
  const tq = new THREE3.Quaternion();
  const euler = new THREE3.Euler();
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
        const near = THREE3.MathUtils.clamp((a.head.position.distanceTo(v) - FADE_END) / (FADE_START - FADE_END), 0, 1);
        for (const m of a.materials) m.material.opacity = m.opacity * near;
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
  const faceTarget = new THREE3.WebGLRenderTarget(Math.min(2048, width / 2), Math.min(2048, width / 2), { type: THREE3.HalfFloatType });
  const flatTarget = new THREE3.WebGLRenderTarget(width, height);
  flatTarget.texture.colorSpace = THREE3.SRGBColorSpace;
  const material = new THREE3.ShaderMaterial({
    uniforms: { face: { value: faceTarget.texture }, forward: { value: new THREE3.Vector3() }, up: { value: new THREE3.Vector3() }, right: { value: new THREE3.Vector3() } },
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
  const quad = new THREE3.Mesh(new THREE3.PlaneGeometry(2, 2), material);
  const quadScene = new THREE3.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE3.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const faceCamera = new THREE3.PerspectiveCamera(90, 1, 0.05, 700);
  faceCamera.position.copy(position);
  const views = [
    [new THREE3.Vector3(0, 0, -1), new THREE3.Vector3(0, 1, 0)],
    [new THREE3.Vector3(1, 0, 0), new THREE3.Vector3(0, 1, 0)],
    [new THREE3.Vector3(0, 0, 1), new THREE3.Vector3(0, 1, 0)],
    [new THREE3.Vector3(-1, 0, 0), new THREE3.Vector3(0, 1, 0)],
    [new THREE3.Vector3(0, 1, 0), new THREE3.Vector3(0, 0, 1)],
    [new THREE3.Vector3(0, -1, 0), new THREE3.Vector3(0, 0, -1)]
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
  const texture = new THREE3.Texture(image);
  texture.colorSpace = THREE3.SRGBColorSpace;
  texture.wrapS = THREE3.RepeatWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE3.LinearFilter;
  texture.magFilter = THREE3.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
function createPortalWindow(geometry, pano, opts = {}) {
  const reach = opts.reach ?? 1.5;
  const material = new THREE3.ShaderMaterial({
    uniforms: {
      pano: { value: pano },
      mask: { value: opts.mask ?? null },
      useMask: { value: opts.mask ? 1 : 0 },
      toLocal: { value: new THREE3.Matrix3() },
      center: { value: new THREE3.Vector3() },
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
    side: THREE3.DoubleSide
  });
  const mesh = new THREE3.Mesh(geometry, material);
  const rotation = new THREE3.Matrix4();
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
  turnVisitor,
  createConsole,
  textSprite,
  createPresence,
  capturePanorama,
  panoramaTexture,
  createPortalWindow,
  addRoomControls,
  addViewControls
};
