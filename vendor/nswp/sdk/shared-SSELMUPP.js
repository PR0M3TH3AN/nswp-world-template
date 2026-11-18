import {
  room
} from "./shared-PMZZ7JZF.js";

// packages/sdk/src/three.ts
import * as THREE2 from "three";
import { spawnOffset } from "@nswp/core";

// packages/sdk/src/menu.ts
import * as THREE from "three";
function menuItemFor(button) {
  return { label: () => button.textContent ?? "", hidden: () => button.hidden !== false || button.disabled, act: () => button.click() };
}
var ROW_W = 0.56;
var ROW_H = 0.13;
var GAP = 0.025;
function drawPill(canvas, text, color) {
  const g = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  g.clearRect(0, 0, w, h);
  g.fillStyle = "rgba(16,18,23,0.94)";
  g.strokeStyle = color;
  g.lineWidth = 6;
  g.beginPath();
  g.roundRect(5, 5, w - 10, h - 10, (h - 10) / 2);
  g.fill();
  g.stroke();
  g.fillStyle = color;
  g.font = `600 ${Math.round(h * 0.42)}px system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 2, w - 70);
}
function drawNote(canvas, text, color) {
  const g = canvas.getContext("2d");
  const w = canvas.width;
  const size = 34;
  g.font = `400 ${size}px system-ui, sans-serif`;
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width <= w - 48 || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  lines.length = Math.min(lines.length, 4);
  const h = 32 + lines.length * (size + 8);
  canvas.height = h;
  g.fillStyle = "rgba(10,12,18,0.82)";
  g.beginPath();
  g.roundRect(0, 0, w, h, 20);
  g.fill();
  g.font = `400 ${size}px system-ui, sans-serif`;
  g.fillStyle = color;
  g.textBaseline = "top";
  lines.forEach((l, i) => g.fillText(l, 24, 18 + i * (size + 8)));
  return h / w;
}
function createWorldMenu(opts) {
  const color = opts.textColor ?? "#f2f3f6";
  const group = new THREE.Group();
  group.name = "world-menu";
  group.visible = false;
  const rowGeo = new THREE.PlaneGeometry(ROW_W, ROW_H);
  const makeRow = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = Math.round(768 * ROW_H / ROW_W);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(rowGeo, new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false }));
    mesh.renderOrder = 20;
    group.add(mesh);
    return { mesh, canvas, texture, text: "" };
  };
  const write = (row, text) => {
    if (row.text === text) return;
    row.text = text;
    drawPill(row.canvas, text, color);
    row.texture.needsUpdate = true;
  };
  const opener = makeRow();
  write(opener, "Menu");
  opener.mesh.scale.setScalar(0.62);
  const closer = makeRow();
  write(closer, "Close");
  const rows = opts.items.map(() => makeRow());
  const noteCanvas = document.createElement("canvas");
  noteCanvas.width = 768;
  const noteTexture = new THREE.CanvasTexture(noteCanvas);
  noteTexture.colorSpace = THREE.SRGBColorSpace;
  const note = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: noteTexture, transparent: true, depthTest: false }));
  note.renderOrder = 20;
  group.add(note);
  let noteText = "";
  let open = false;
  let placed = false;
  let settling = false;
  let aimed = null;
  let sinceRead = 1;
  let shown = [];
  const head = new THREE.Vector3();
  const facing = new THREE.Vector3();
  const want = new THREE.Vector3();
  const layout = () => {
    opener.mesh.visible = !open;
    closer.mesh.visible = open;
    note.visible = false;
    for (const r of rows) r.mesh.visible = false;
    if (!open) {
      opener.mesh.position.set(0, 0, 0);
      shown = [opener.mesh];
      return;
    }
    const showing = [];
    opts.items.forEach((item, i) => {
      if (item.hidden?.()) return;
      const row = rows[i];
      write(row, typeof item.label === "function" ? item.label() : item.label);
      row.mesh.visible = true;
      showing.push(row);
    });
    showing.push(closer);
    const text = opts.note?.().trim() ?? "";
    let noteH = 0;
    if (text) {
      if (text !== noteText) {
        noteText = text;
        const ratio = drawNote(noteCanvas, text, color);
        noteTexture.needsUpdate = true;
        note.scale.set(ROW_W * 1.25, ROW_W * 1.25 * ratio, 1);
      }
      noteH = note.scale.y + GAP;
      note.visible = true;
    }
    const total = noteH + showing.length * ROW_H + (showing.length - 1) * GAP;
    let y = total / 2;
    if (text) {
      note.position.set(0, y - note.scale.y / 2, 0);
      y -= noteH;
    }
    for (const row of showing) {
      row.mesh.position.set(0, y - ROW_H / 2, 0);
      y -= ROW_H + GAP;
    }
    shown = showing.map((r) => r.mesh);
  };
  const place = () => {
    const flat = Math.hypot(facing.x, facing.z) || 1;
    const reach = open ? 1 : 0.75;
    want.set(head.x + facing.x / flat * reach, Math.max(0.4, head.y - (open ? 0.22 : 0.52)), head.z + facing.z / flat * reach);
  };
  const face = () => {
    group.rotation.y = Math.atan2(head.x - group.position.x, head.z - group.position.z);
  };
  const menu = {
    group,
    get open() {
      return open;
    },
    setOpen(next) {
      if (open === next) return;
      open = next;
      placed = false;
      sinceRead = 0;
      layout();
    },
    pick(raycaster) {
      if (!group.visible) return null;
      const hit = raycaster.intersectObjects(shown, false)[0];
      return hit?.object ?? null;
    },
    aim(button) {
      aimed = button;
    },
    press(button) {
      if (button === opener.mesh) return menu.setOpen(true);
      if (button === closer.mesh) return menu.setOpen(false);
      const i = rows.findIndex((r) => r.mesh === button);
      const item = opts.items[i];
      if (!item) return;
      void Promise.resolve(item.act()).catch(() => {
      }).finally(() => {
        sinceRead = 1;
      });
    },
    update(dt, camera, showing) {
      if (!showing) {
        if (group.visible) {
          group.visible = false;
          open = false;
          placed = false;
          layout();
        }
        return;
      }
      camera.getWorldPosition(head);
      camera.getWorldDirection(facing);
      place();
      if (!placed) {
        group.position.copy(want);
        placed = true;
        settling = false;
        layout();
      } else if (open) {
        if (Math.hypot(head.x - group.position.x, head.z - group.position.z) > 2.5) menu.setOpen(false);
      } else {
        if (group.position.distanceTo(want) > 0.6) settling = true;
        if (settling) {
          group.position.lerp(want, Math.min(1, dt * 6));
          if (group.position.distanceTo(want) < 0.02) settling = false;
        }
      }
      face();
      group.visible = true;
      if (open && (sinceRead += dt) > 0.3) {
        sinceRead = 0;
        layout();
      }
      for (const mesh of shown) {
        const base = mesh === opener.mesh ? 0.62 : 1;
        mesh.scale.setScalar(base * (mesh === aimed ? 1.08 : 1));
      }
    }
  };
  const labelOf = (mesh) => [opener, closer, ...rows].find((r) => r.mesh === mesh)?.text ?? "";
  menu.describe = () => ({ showing: group.visible, open, buttons: shown.map(labelOf), note: open && note.visible ? noteText : "" });
  menu.pressLabelled = (label) => {
    const mesh = shown.find((m) => labelOf(m) === label);
    if (!mesh) return false;
    menu.press(mesh);
    return true;
  };
  layout();
  return menu;
}
function turnVisitor(rig, camera, degrees) {
  const head = camera.getWorldPosition(new THREE.Vector3());
  const a = THREE.MathUtils.degToRad(degrees);
  const dx = rig.position.x - head.x;
  const dz = rig.position.z - head.z;
  rig.position.x = head.x + dx * Math.cos(a) + dz * Math.sin(a);
  rig.position.z = head.z - dx * Math.sin(a) + dz * Math.cos(a);
  rig.rotation.y += a;
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
  const tex = new THREE2.CanvasTexture(canvas);
  tex.colorSpace = THREE2.SRGBColorSpace;
  const sprite = new THREE2.Sprite(new THREE2.SpriteMaterial({ map: tex, depthWrite: false }));
  sprite.scale.set(width, width * canvas.height / canvas.width, 1);
  return sprite;
}
function createPresence(d) {
  const labelColor = d.labelColor ?? "#ffffff";
  const changed = () => d.onChange?.();
  const listener = new THREE2.AudioListener();
  d.camera.add(listener);
  const avatars = /* @__PURE__ */ new Map();
  const pendingStreams = /* @__PURE__ */ new Map();
  let session = null;
  let roomName = null;
  let sendTimer;
  let micTrack = null;
  let offsetApplied = false;
  const makeAvatar = (member) => {
    const color = new THREE2.Color(member.color);
    const root = new THREE2.Group();
    root.visible = false;
    const head = new THREE2.Group();
    const skull = new THREE2.Mesh(new THREE2.SphereGeometry(0.13, 24, 16), new THREE2.MeshStandardMaterial({ color, roughness: 0.5 }));
    const visor = new THREE2.Mesh(new THREE2.BoxGeometry(0.2, 0.07, 0.06), new THREE2.MeshStandardMaterial({ color: 1119256, roughness: 0.2, metalness: 0.6 }));
    visor.position.set(0, 0.02, -0.1);
    const label = textSprite(member.name, labelColor, 0.5);
    label.position.set(0, 0.3, 0);
    head.add(skull, visor, label);
    const torso = new THREE2.Mesh(new THREE2.CylinderGeometry(0.1, 0.17, 0.5, 16), new THREE2.MeshStandardMaterial({ color, roughness: 0.8, transparent: true, opacity: 0.85 }));
    const handGeo = new THREE2.SphereGeometry(0.045, 12, 8);
    const handMat = new THREE2.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
    const hands = [new THREE2.Mesh(handGeo, handMat), new THREE2.Mesh(handGeo, handMat)];
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
    const pa = new THREE2.PositionalAudio(listener);
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
  const v = new THREE2.Vector3();
  const q = new THREE2.Quaternion();
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
  const tp = new THREE2.Vector3();
  const tq = new THREE2.Quaternion();
  const euler = new THREE2.Euler();
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
        const near = THREE2.MathUtils.clamp((a.head.position.distanceTo(v) - FADE_END) / (FADE_START - FADE_END), 0, 1);
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
function attachRoomControls(presence, c) {
  const useTone = new URLSearchParams(c.search ?? location.search).get("mic") === "tone";
  let invited = roomNameFromHash(location.hash);
  let note = "";
  const refresh = () => {
    const s = presence.session;
    c.onState?.(
      s ? { name: s.name, private: !!presence.roomName, status: s.status, self: s.self.pubkey, members: s.members.map((m) => m.pubkey), relays: s.relayCount, mic: presence.micOn } : null
    );
    c.roomButton.textContent = s ? "Leave the room" : "Join the room";
    c.micButton.hidden = !s;
    c.inviteButton.hidden = !s;
    c.micButton.textContent = presence.micOn ? "Turn microphone off" : "Turn microphone on";
    c.inviteButton.textContent = presence.roomName ? "Copy invite link" : "Make a private room";
    if (!s) return;
    const others = s.members.length;
    const who = s.status === "no-relays" ? "can't reach any relay" : others === 0 ? "nobody else here yet" : others === 1 ? "1 other person here" : `${others} other people here`;
    c.status.textContent = `${presence.roomName ? "Private room" : "Open room"}: ${who}.${note ? ` ${note}` : ""}`;
  };
  c.roomButton.addEventListener("click", () => {
    if (presence.session) {
      presence.leave();
      note = "";
      refresh();
      c.status.textContent = "You left the room.";
      return;
    }
    c.roomButton.disabled = true;
    presence.join(invited).then(refresh).catch((err) => {
      c.status.textContent = `Couldn't join: ${err instanceof Error ? err.message : String(err)}`;
    }).finally(() => c.roomButton.disabled = false);
  });
  c.micButton.addEventListener("click", async () => {
    if (!presence.session) return;
    if (presence.micOn) {
      await presence.setMicrophone(null);
      note = "";
    } else {
      try {
        const track = useTone ? presence.testTone() : (await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })).getAudioTracks()[0];
        await presence.setMicrophone(track);
        note = "Your microphone is on.";
      } catch {
        note = "The microphone is blocked or unavailable.";
      }
    }
    refresh();
  });
  c.inviteButton.addEventListener("click", async () => {
    if (!presence.session) return;
    if (!presence.roomName) {
      const bytes = crypto.getRandomValues(new Uint8Array(9));
      const code = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_");
      history.replaceState(history.state, "", `${location.pathname}${location.search}#room=${code}`);
      invited = code;
      await presence.join(code);
    }
    try {
      await navigator.clipboard.writeText(location.href);
      note = "Invite link copied. Anyone with it can join.";
    } catch {
      note = "Copy this page's address to invite someone.";
    }
    refresh();
  });
  if (invited) c.status.textContent = "You were invited to a private room. Joining shows your IP address to the others in it.";
  refresh();
  return { refresh };
}
async function capturePanorama(renderer, scene, position, opts = {}) {
  const width = Math.min(4096, Math.max(256, Math.round(opts.width ?? 2048)));
  const height = width / 2;
  const hidden = (opts.hide ?? []).filter((o) => o.visible);
  const xrWasEnabled = renderer.xr.enabled;
  const previousTarget = renderer.getRenderTarget();
  const autoClearWas = renderer.autoClear;
  const fog = scene.fog;
  const faceTarget = new THREE2.WebGLRenderTarget(Math.min(2048, width / 2), Math.min(2048, width / 2), { type: THREE2.HalfFloatType });
  const flatTarget = new THREE2.WebGLRenderTarget(width, height);
  flatTarget.texture.colorSpace = THREE2.SRGBColorSpace;
  const material = new THREE2.ShaderMaterial({
    uniforms: { face: { value: faceTarget.texture }, forward: { value: new THREE2.Vector3() }, up: { value: new THREE2.Vector3() }, right: { value: new THREE2.Vector3() } },
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
  const quad = new THREE2.Mesh(new THREE2.PlaneGeometry(2, 2), material);
  const quadScene = new THREE2.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE2.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const faceCamera = new THREE2.PerspectiveCamera(90, 1, 0.05, 200);
  faceCamera.position.copy(position);
  const views = [
    [new THREE2.Vector3(0, 0, -1), new THREE2.Vector3(0, 1, 0)],
    [new THREE2.Vector3(1, 0, 0), new THREE2.Vector3(0, 1, 0)],
    [new THREE2.Vector3(0, 0, 1), new THREE2.Vector3(0, 1, 0)],
    [new THREE2.Vector3(-1, 0, 0), new THREE2.Vector3(0, 1, 0)],
    [new THREE2.Vector3(0, 1, 0), new THREE2.Vector3(0, 0, 1)],
    [new THREE2.Vector3(0, -1, 0), new THREE2.Vector3(0, 0, -1)]
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
  const texture = new THREE2.Texture(image);
  texture.colorSpace = THREE2.SRGBColorSpace;
  texture.wrapS = THREE2.RepeatWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE2.LinearFilter;
  texture.magFilter = THREE2.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
function createPortalWindow(geometry, pano, opts = {}) {
  const reach = opts.reach ?? 1.5;
  const material = new THREE2.ShaderMaterial({
    uniforms: {
      pano: { value: pano },
      mask: { value: opts.mask ?? null },
      useMask: { value: opts.mask ? 1 : 0 },
      toLocal: { value: new THREE2.Matrix3() },
      center: { value: new THREE2.Vector3() },
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
    side: THREE2.DoubleSide
  });
  const mesh = new THREE2.Mesh(geometry, material);
  const rotation = new THREE2.Matrix4();
  mesh.onBeforeRender = () => {
    rotation.extractRotation(mesh.matrixWorld);
    material.uniforms.toLocal.value.setFromMatrix4(rotation).invert();
    material.uniforms.center.value.setFromMatrixPosition(mesh.matrixWorld);
  };
  return mesh;
}

export {
  menuItemFor,
  createWorldMenu,
  turnVisitor,
  textSprite,
  createPresence,
  attachRoomControls,
  capturePanorama,
  panoramaTexture,
  createPortalWindow
};
