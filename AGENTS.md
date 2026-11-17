# Instructions for AI coding assistants

This folder is one person's world on the spatial web: a static WebXR site built
with Three.js, following the Nostr Spatial Web Protocol (NSWP). The owner wants
help changing what the world is. Your job is to build what they ask for inside
the scene, and to leave the protocol's plumbing working.

## Where things are

| Path | Whose it is | What you may do |
|---|---|---|
| `src/scene.ts`, `src/scenes/` | The owner's scene | Change freely. This is where almost all work belongs |
| `home.json` | The owner's home layout | Change freely. Often the whole task |
| `world.json` | Facts about the world | Change what the owner asks. Never change `url` or `d` unasked: they are the world's identity |
| `src/index.html` | The page around the scene | Restyle freely. Keep `#stage` and the button ids |
| `src/plumbing/` | The protocol's plumbing | Avoid. Change only if the task can't be done otherwise, and say that you did |
| `scripts/` | Build and publishing commands | Avoid |
| `vendor/` | The vendored NSWP library | Never edit. `npm run check` fails if it changes |
| `signed/`, `previews/` | Generated, and public | Never edit by hand. `npm run sign` and `npm run preview` write them |
| `dist/` | Build output | Never edit |

## Rules that must survive any change

1. **Every way out is a portal.** Anything that takes a visitor to another site
   goes through `ctx.addPortal()` or a portal handed to `ctx.usePortals()`. Do
   not write `location.href = …`, `location.assign()`, `window.open()` or a
   link to another site. A portal sends the visitor through their own Airlock,
   which shows the real address and waits for them to agree. That page is the
   visitor's only protection against a misleading portal.
2. **Never ask for credentials.** No password fields, no key or `nsec` entry, no
   `window.nostr`, no sign-in of any kind. A world doesn't need them, and a
   credential prompt inside a 3D scene can't be told apart from phishing.
3. **No code from other sites.** No `<script src="https://…">`, no importing
   from a URL. Add a dependency with `npm install` so it is bundled. The
   arrival context must never be readable by foreign code.
4. **The page starts through the plumbing.** `src/main.ts` calls `startWorld()`
   first. That call reads how the visitor arrived and removes it from the
   address at once.
5. **A portal's sign always shows the address.** Don't hide or replace the
   second line of a portal's sign.

## How to work

- `npm run dev` serves the world on localhost and rebuilds on every save,
  including saves to `home.json` and `world.json`.
- **After every change, run `npm run check`.** It type-checks, builds, and
  tests the rules above. Fix anything marked ✘ before you finish. A line marked
  ! is information, not a failure.
- To look at the result without a headset, open the dev address. Add
  `?xr=emulate` for an emulated Meta Quest 3.
- For automated testing, the page exposes `window.__nswpTest`: `state.ready`
  turns true when the scene is up, `portals()` lists the portals,
  `teleport(x, z)` moves the visitor, and `goThrough(i)` uses a portal.

## Never do these without the owner asking in so many words

- `npm run announce -- --yes`. It publishes to public Nostr relays and can't be
  undone. Running `npm run announce` without `--yes` is always safe.
- `npm run keygen`, or anything that reads, moves or prints the key file. The
  key lives outside this folder and must never be committed or shown.
- Deploying or uploading `dist/` anywhere.
- Changing `url` or `d` in `world.json`.

## Writing a scene

A scene is a function in `src/scenes/`, chosen by the one line in
`src/scene.ts`:

```ts
import * as THREE from "three";
import type { SceneContext, SceneHandle } from "../plumbing/types.js";

export async function buildScene(ctx: SceneContext): Promise<SceneHandle> {
  // ctx.scene, ctx.camera, ctx.renderer: plain Three.js objects.
  // ctx.rig: move this to move the visitor. Never move the camera itself.
  // ctx.layout: home.json, parsed. ctx.config: world.json. ctx.arrival: how they arrived, or null.
  return {
    update(t, dt) { /* every frame; t and dt are in seconds */ },
    hideFromPreview: [], // objects about one visitor, left out of the world's preview picture
  };
}
```

- **Units and axes.** Metres. Y is up. A visitor arrives at `main-entrance` in
  `world.json` (by default `[0, 0, 4]`) facing −Z, with their eyes about 1.6 m
  up. Put the things they should see first in front of them, at negative Z.
- **The plumbing adds nothing you can see.** No lights, no floor. A scene that
  adds neither is black. `createHome()` from `nswp-sdk/home` adds both.
- **Portals.** `ctx.addPortal({ url }, { label, position, rotation, color })`.
  `position` is where the portal stands on the floor. The plumbing handles
  clicking it, pointing at it in VR, and walking through it.
- **The visitor's position** is `ctx.camera.getWorldPosition(v)`. It works the
  same in VR and on a flat screen.
- **Your own interactions.** On a flat screen, listen for pointer events on
  `ctx.renderer.domElement`. In VR, listen for `select` on
  `ctx.renderer.xr.getController(0)` and `(1)`. Use only `select`: controllers,
  hand pinches and gaze-and-pinch all send it, so the world works on every
  headset. Don't read controller buttons or thumbsticks for anything essential.
- **Text.** `textSprite(text, color, widthInMetres)` from `nswp-sdk/three`.

## Keeping it fast

A standalone headset draws every frame twice, 72 to 90 times a second, on a
phone's processor. For a world that stays comfortable there:

- Keep the whole scene under about 100,000 triangles and 50 draw calls.
  Merge or instance repeated objects.
- Use at most four real lights. Prefer emissive materials for things that glow.
- No real-time shadows, no post-processing.
- Keep the first download small. Don't add large libraries for small effects.
- Never move the visitor without their input. Unasked motion makes people ill.
  If a scene does move them, set `comfort.intensity` in `world.json` honestly.

## Honesty in `world.json`

The fields under `world` are claims shown to visitors before they arrive:
`modes`, `comfort`, `inputs`, `perf`. If your change makes one untrue (the
scene now needs smooth movement, or no longer works without a headset), update
it. After any change to `world.json` or `home.json`, the owner needs to run
`npm run sign` again; tell them.
