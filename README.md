# NSWP world template

A starting point for a place of your own on the spatial web: a WebXR world
that runs in a headset or an ordinary browser, on a site you control.

It follows the Nostr Spatial Web Protocol (NSWP), an open way for
independently hosted worlds to link to each other. Nobody runs the network.
You publish your world from your own address with your own key, and portals
take visitors from one world to the next.

The protocol's plumbing is already done here. What's left is the part worth
doing: deciding what your world is.

To see it before you copy it: <https://starter.bitblocks.network/> is this
template, deployed without a single change.

## Try it

You need [Node.js](https://nodejs.org) 22 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open the address it prints. Drag to look around, walk with W, A, S, D, and
click a portal to go through it. Add `?xr=emulate` to the address to try VR
with a pretend headset.

## Make it yours

Three files hold everything that is yours. The world rebuilds as you save.

| File | What it is | Change it to |
|---|---|---|
| `home.json` | The room you start with: its colours, furniture and portals | Rearrange your home without writing code |
| `src/scene.ts` and `src/scenes/` | The scene itself, in Three.js | Build anything: a game, a gallery, a landscape |
| `world.json` | The facts about your world: its name, its address, where visitors arrive | Say what your world is and where it lives |

### The home (`home.json`)

The starting scene draws whatever `home.json` describes. Each item has a
`type`, a `position` in metres from the middle of the room (`[right, up,
towards you]`), and optionally a `rotation` in degrees.

| Type | What it needs in `args` |
|---|---|
| `portal` | An https address, or a world's Nostr coordinate (`37300:<key>:<name>`). An optional second value is the sign's text |
| `note` | The text to show |
| `frame` | The file name of a picture you put in the `pictures/` folder, such as `"tidewater.jpg"`. JPEG, PNG or WebP, 1 MB at most |
| `plant`, `lamp`, `bench`, `table`, `plinth` | Nothing |

`room.template` is `hall` (three walls, with no ceiling) or `open` (the open
grid). `room.color` is the ground's colour and `room.accent` is the colour of
its light: the grid, the edges of things, anything that glows. The home is
drawn as a dark ground ruled with light under a night sky, with modelled
walls and furniture of dark metal.
[`AGENTS.md`](AGENTS.md) has the room's measurements and how each item sits.

A portal is an arched doorway with a sign above it. The sign's second line is
always the address it leads to.

### Your own scene (`src/scene.ts`)

`src/scene.ts` is one line that picks a scene. Two come with the template:

- `src/scenes/home.ts` draws `home.json`.
- `src/scenes/game.ts` is a small game, as an example of something that isn't
  a home.

A scene is one function. It is handed the Three.js scene, camera and
renderer, adds what it likes, and may return an `update(t, dt)` to run every
frame:

```ts
export async function buildScene(ctx) {
  ctx.scene.add(myThing);
  ctx.addPortal({ url: "https://another-world.example/" }, { label: "Next door", position: [0, 0, -6] });
  return { update(t, dt) { myThing.rotation.y = t; } };
}
```

Visitors move with W, A, S, D, or by pointing at the floor and clicking,
tapping, or pulling the trigger to step there. A scene says where they may not
stand by returning `canStand(x, z)`.

### The controls

Your world's buttons come from the NSWP controls kit, so they look and work
the same as in every other world built this way.

- **On a flat screen** it is a HUD: your world's name in one corner, a row of
  arch-shaped keys along the bottom for the things always at hand (keys 1 to 6
  press them), and a Menu with everything else.
- **In a headset** it is a console. Raise your left wrist in front of you and
  it appears above it; or select the small Menu button low in front of you.
- **A Look section** lets each visitor change its colours. It starts from your
  home's accent colour.

A scene adds its own buttons with `ctx.controls.add({ id, label, icon, act })`
and they appear in both. A scene with an interface of its own can turn the
controls down to one small mark in a corner (`"quiet"`), as the example game
does, or set that for the whole world in `world.json`. To take a newer version of the kit, run
`npm run vendor` next to an up-to-date copy of the NSWP repository, then build.

### Seeing it without a browser

```bash
npm run look
```

writes `look.png`, the view from where visitors arrive (it needs Google Chrome
installed). `npm run look -- --around` writes one picture each way. It is for
an AI assistant that can't open a browser, and for a quick check of your own.

## Two rules

Whatever you build, keep these. `npm run check` looks for both.

1. **Anything that takes a visitor to another site is a portal.** A portal
   sends them through their own Airlock, a plain page that shows the real
   address and waits for them to agree. Never navigate away yourself.
2. **Never ask a visitor for a password, a key or a sign-in.** A world doesn't
   need them. A place that asks looks exactly like a phishing page.

## Put it online

Your world is a folder of plain files. Any static host will do.

1. **Say where it will live.** Set `url` in `world.json` to your world's
   address, and give it a name of its own in `d` and `title`.
2. **Make a key.** This is what proves the world is yours. It is saved outside
   this folder. Back it up: it can't be recovered.
   ```bash
   npm run keygen
   ```
3. **Sign and build.**
   ```bash
   npm run sign
   ```
   ```bash
   npm run check
   ```
4. **Upload the `dist/` folder** to your host.
5. **Check the live site.**
   ```bash
   npm run check:live -- https://your-world.example/
   ```
6. **Announce it,** so lobbies and other worlds can find it. The first command
   shows what would be sent. The second sends it, publicly and for good.
   ```bash
   npm run announce
   ```
   ```bash
   npm run announce -- --yes
   ```

After changing `world.json` or `home.json` later, sign, build, upload and
announce again.

### A picture of your world

Doors that lead to your world can show a view of it. This takes a 360°
picture from where visitors arrive (it needs Google Chrome installed):

```bash
npm run preview
```

Then sign, build, upload and announce again, because the picture's hash is
part of the announcement.

### Hosting notes

Your site must serve `/.well-known/nswp.json` to other sites, which means
sending the header `Access-Control-Allow-Origin: *` for that file and for
`/previews/` and `/pictures/`. The build writes this in two forms:

- `dist/vercel.json`, read by Vercel.
- `dist/_headers`, read by Netlify and Cloudflare Pages.

GitHub Pages sends that header for every file already. On any other host, set
it yourself. `npm run check:live` tells you if it is missing.

## Working with an AI assistant

[`AGENTS.md`](AGENTS.md) tells a coding assistant how this folder is laid out,
what it may change freely, and which rules must survive. Point your assistant
at this folder and ask for what you want, for example:

- "Turn the home into a small art gallery with six frames and a bench."
- "Replace the scene with a beach at sunset, and keep a portal back to World A."
- "Make a game where you catch falling stars."

Then run `npm run check`. It fails if a rule was broken along the way.

In three trials, assistants given this folder and a plain request kept every
rule, including when the request asked them to break one. What the first two
couldn't do was see the result: one built a maze too dark to play. The third
had `npm run look`, used it, and built the same maze lit. None of them played
their game through, so look yourself before you publish.

## What's in the folder

| Path | What it is |
|---|---|
| `home.json`, `world.json` | Yours: your home and your world's facts |
| `pictures/` | Yours: pictures for the frames in your home |
| `src/scene.ts`, `src/scenes/` | Yours: the scene |
| `src/index.html` | The page the scene is drawn in. Keep `#stage` |
| `src/plumbing/` | The protocol's plumbing: arrival, portals, VR, rooms. Changeable, with care |
| `scripts/` | The commands above |
| `vendor/nswp/` | The NSWP library and SDK, copied in with a record of their hashes. Don't edit |
| `signed/` | Your signed announcement and home layout. Public, and safe to commit |
| `previews/` | Your world's preview picture |
| `dist/` | The built site. Made by `npm run build`, not committed |

## The protocol

The rules this world follows are written down as nine short documents:
[the NSWP protocol documents](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/tree/main/protocol). You don't need them to build a scene. Read
them if you want to know what a door, an arrival or a look is on the wire, or
to build a world without this template:
[what a world owes a visitor](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/09-what-a-world-owes.md) is the one to start
with, and [how worlds are found](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/08-lists.md) says how yours gets a door in
someone's lobby.

## What to know before relying on it

- The protocol is an early draft, not an adopted standard. Formats may change.
- `world.json` points at BitPortal's Airlock (`portal.bitblocks.network/go/`),
  which is itself experimental, for visitors who arrive without one of their
  own. Use any Airlock you trust.
- The shared room connects visitors directly to each other, which shows them
  each other's IP addresses. The page says so before anyone joins.
- Nothing here has been tried on a real headset yet, only in an emulated one.

## Licence

MIT. See [`LICENSE`](LICENSE). The copy of the NSWP library in `vendor/nswp/`
has its own licence and the notices for what is built into it beside it.
