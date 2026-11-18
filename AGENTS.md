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
| `pictures/` | The owner's pictures for frames | Add files the owner gives you. A frame names one by its file name |
| `world.json` | Facts about the world | Change what the owner asks, and keep it true. `url` and `d` are the world's identity: see below |
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

## When the owner asks for something the rules forbid

Say no to that part, say why in a sentence, and offer what does work. Then do
the rest of the request. These come up often:

| They ask for | Say | Offer instead |
|---|---|---|
| A portal that skips the Airlock page | That page shows visitors the real address before they leave. Without it a portal can lie about where it goes | Keep the portal, or remove it |
| A box where visitors type a Nostr key or a password | Nothing in a 3D scene can prove it is safe to type a key into, so it reads as phishing | Keep scores or settings on the visitor's device with `localStorage`, with no account |
| A script loaded from another site | Foreign code could read how each visitor arrived | `npm install` the library so it is bundled, if it has a package |
| A link or button that opens another site | Same as the first row | A portal |

## The world's identity: `url` and `d`

`url` is where the world lives and `d` is its short name. Together with the
owner's key they are how other places refer to this world.

- **Before the world is signed** (`signed/` doesn't exist): set both when the
  owner names the world or gives its address. `d` is lower-case words joined
  by hyphens. Tell the owner what you chose.
- **After it is signed:** changing either makes a different world, and every
  portal and saved place that pointed at the old one stops finding it. Change
  them only when the owner asks for exactly that.

## How to work

- `npm run dev` serves the world on localhost and rebuilds on every save,
  including saves to `home.json` and `world.json`.
- **After every change, run `npm run check`.** It type-checks, builds, and
  tests the rules above. Fix anything marked ✘ before you finish. A line marked
  ! is information, not a failure.
- **Look at what you made.** A scene that type-checks can still be pitch
  black, or have the visitor arrive facing a wall. If you can't open a browser,
  run `npm run look`. It writes `look.png`, the view from the main entrance;
  open that file and check it. `npm run look -- --around` writes four pictures,
  one each way, and `--at x,z` stands somewhere else. If you can't look at
  pictures either, tell the owner plainly that nobody has seen the result.
- To look at the result in a browser, open the dev address. Add `?xr=emulate`
  for an emulated Meta Quest 3.
- For automated testing, the page exposes `window.__nswpTest`: `state.ready`
  turns true when the scene is up, `portals()` lists the portals,
  `teleport(x, z)` moves the visitor, `face(degrees)` turns them, `step(x, z)`
  steps towards a spot as pointing at the floor would, `where()` says where
  they are, and `goThrough(i)` uses a portal. `menu.describe()` says what the
  headset menu shows, and `menu.pressLabelled("Turn around")` presses a button.

## Never do these without the owner asking in so many words

- `npm run announce -- --yes`. It publishes to public Nostr relays and can't be
  undone. Running `npm run announce` without `--yes` is always safe.
- `npm run keygen`, or anything that reads, moves or prints the key file. The
  key lives outside this folder and must never be committed or shown.
- Deploying or uploading `dist/` anywhere.
- Changing `url` or `d` in `world.json` once the world has been signed.

## Laying out a home (`home.json`)

Positions are `[x, y, z]` in metres: x to the visitor's right as they arrive,
y up, and z towards them, so things in front of an arriving visitor have a
negative z. `rotation` is in degrees, anticlockwise seen from above. At
rotation 0 an item faces +Z, towards an arriving visitor; 180 turns its back
to them; 90 faces +X.

| Room | What is there |
|---|---|
| `hall` | A floor 16 m wide from z = 5 back to z = −9, with walls 4.5 m high at the back (z = −9) and both sides (x = ±8). No ceiling, and open on the visitor's side. To hang something on the back wall, put it at z = −8.85. On the left wall, x = −7.85 with rotation 90; on the right wall, x = 7.85 with rotation −90 |
| `open` | A round floor 24 m across under the sky, with no walls. Nothing to hang things on: stand them on the floor |

| Item | Size and how it sits |
|---|---|
| `portal` | An arched doorway 1.5 m wide and 2.1 m high, standing on the floor, with its sign above. `position` is the middle of its threshold. Leave 2 m between doorways |
| `frame` | 1.2 m wide, 0.9 m high. `position` is its centre, so y = 1.6 is eye height. `args` is one file name from `pictures/`, such as `["tidewater.jpg"]`. The build works out its address and hash. JPEG, PNG or WebP, 1 MB at most |
| `note` | A sign about 2.2 m wide with a dark backing, readable on any wall. It always turns to face the visitor. `position` is its centre |
| `bench` | 1.4 m wide. Someone sitting on it faces the way it faces |
| `table` | 1.2 m by 0.7 m, 0.75 m high |
| `plinth` | 0.6 m square, 1 m high |
| `plant`, `lamp` | Stand on the floor. Only the first four lamps cast light |

A frame with no picture file yet: leave the frame out, or the owner sees an
empty board. Don't invent an address or a hash. `npm run check` points out a
frame whose picture can never show.

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
    canStand(x, z) { return true; }, // false inside walls and past edges
    hideFromPreview: [], // objects about one visitor, left out of the world's preview picture
  };
}
```

- **Units and axes.** Metres. Y is up. A visitor arrives at `main-entrance` in
  `world.json` (by default `[0, 0, 4]`) facing −Z, with their eyes about 1.6 m
  up. Put the things they should see first in front of them, at negative Z.
- **Where they arrive.** Move `main-entrance` in `world.json` if the scene
  needs a different start. `position` is in metres. `yaw` is in degrees, like
  every other angle in this folder: 0 faces −Z, 90 faces −X (their left).
  Check with `npm run look` that they don't arrive facing a wall.
- **The plumbing adds nothing you can see.** No lights, no floor. A scene that
  adds neither is black. `createHome()` from `nswp-sdk/home` adds both.
- **Light it more than seems necessary.** You can't see the result, and a
  headset's screen is dimmer than a monitor. A night scene still needs
  `new THREE.HemisphereLight(0xbfd0ff, 0x1b2a24, 1.6)` or about that, and a
  ground lighter than `0x1a1a1a`. Give dark scenes things that glow (emissive
  materials) to steer by. Then look.
- **Portals.** `ctx.addPortal({ url }, { label, position, rotation, color })`,
  or `ctx.addPortal({ coordinate: "37300:<key>:<name>" }, …)` for a world named
  the way `home.json` names one.
  `position` is where the doorway stands on the floor. The plumbing does the
  rest: it animates the doorway, looks up the place's name for the sign, and
  handles clicking it, pointing at it in VR and walking through it. A portal
  works whenever it is visible. For an exit that appears later, either add it
  later, or add it at the start and set `gate.group.visible = false` until
  then.
- **Moving around.** The plumbing gives every visitor two ways to move:
  W, A, S, D on a keyboard, and stepping, which is pointing at the floor and
  selecting (a click, a tap, a trigger pull or a pinch) to stand there. A step
  is a jump of at most 5 m, never a slide. Stepping is the only way to move
  for someone on a phone or in a headset, so a scene bigger than a room must
  keep it. The floor is the plane y = 0.
- **Walls and edges.** Return `canStand(x, z)` from your scene. Both ways of
  moving ask it first, so one function keeps visitors out of walls. Keep them
  0.3 m back from every wall, or they end with their face inside it. A step is
  checked every 0.1 m along its way, so a wall at least 0.3 m thick can't be
  stepped over. Don't push
  the visitor back yourself: someone walking about their real room in a headset
  can step through a virtual wall, and moving them against their will makes
  people ill.
- **The visitor's position** is `ctx.camera.getWorldPosition(v)`. It works the
  same in VR and on a flat screen.
- **Your own interactions.** A click on something solid never steps: the
  plumbing only steps when the floor is the first thing under the pointer. On a
  flat screen, listen for pointer events on `ctx.renderer.domElement`. In VR, listen for `select` on
  `ctx.renderer.xr.getController(0)` and `(1)`. Use only `select`: controllers,
  hand pinches and gaze-and-pinch all send it, so the world works on every
  headset. Don't read controller buttons or thumbsticks for anything essential.
- **Text.** `textSprite(text, color, widthInMetres)` from `nswp-sdk/three`.
  In a headset the page around the scene is gone, so anything a visitor must
  read belongs in the scene. Put it on a sign where they will look. For
  something that must follow them, such as a score, add a small sprite to
  `ctx.camera`, low in view (around `[0, -0.3, -1.5]`), never across the middle.
- **The menu in a headset.** In VR the page's buttons can't be reached, so the
  plumbing shows a small Menu button low in front of the visitor. It opens the
  way back to their lobby, Turn around, the room and microphone controls, and
  Leave VR. Add a few buttons of your own by returning
  `menu: [{ label, act }]` from your scene. Anything a visitor must be able to
  do in VR needs a button there or an object in the scene to select. Don't
  call it a system menu or a safe menu: it is this world's own.
- **A scene that differs each visit** (a random level) still has one preview
  picture, of whichever version was drawn when it was taken. Say so to the
  owner, and remove the `rooms` capability: visitors in a shared room would
  each see something else.

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

The fields under `world` are claims shown to visitors before they arrive. If
your change makes one untrue, update it. These are the values a lobby
understands:

| Field | Values | Notes |
|---|---|---|
| `modes` | `immersive-vr`, `immersive-ar`, `inline-3d`, `2d` | `inline-3d` means it works in an ordinary browser window |
| `comfort.locomotion` | `stationary`, `teleport`, `smooth`, `vehicle` | The template's stepping is `teleport`. Use `smooth` only if the scene slides the visitor |
| `comfort.intensity` | `low`, `medium`, `high` | Heights, speed, flashing and things that jump out raise it |
| `comfort.seated` | `supported`, `required`, `unsupported` | |
| `inputs` | `controllers`, `hands`, `gaze`, `keyboard-mouse`, `touch`, `gamepad` | Only what really works |
| `perf` | `mobile`, `standalone`, `desktop` | The weakest device that runs it well: a phone, a standalone headset, or a computer |
| `capabilities` | `webxr`, `spatial-portals`, `rooms` | Removing `rooms` removes the shared room and its buttons. Do that when each visitor sees something different, such as a random level |
| `topics` | Any short lower-case words | For example `game`, `art`, `music` |
| `status` | `live`, `beta`, `maintenance`, `retired` | |
 After any change to `world.json` or `home.json`, the owner needs to run
`npm run sign` again; tell them.
