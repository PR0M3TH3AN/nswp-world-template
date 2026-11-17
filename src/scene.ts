/**
 * YOUR WORLD starts here. This line picks the scene a visitor sees.
 *
 *   ./scenes/home.js   the home described in home.json (the default)
 *   ./scenes/game.js   a small example game
 *
 * Change either one, or write your own file in src/scenes/ and point this
 * line at it. A scene is one function, `buildScene(ctx)`, that adds things to
 * `ctx.scene` and may hand back an `update(t, dt)` to run every frame. What it
 * builds is entirely up to you: a home, a game, a gallery, a landscape.
 *
 * Two things to keep, whatever you build:
 *
 * - Anything that takes a visitor to another site must be a portal, made with
 *   `ctx.addPortal()` (or handed over with `ctx.usePortals()`). A portal sends
 *   them through their own Airlock, which shows the real address first. Never
 *   navigate away yourself.
 * - Never ask a visitor for a password, a key or a sign-in. A world doesn't
 *   need them, and a place that asks looks exactly like a phishing page.
 */
export { buildScene } from "./scenes/home.js";
