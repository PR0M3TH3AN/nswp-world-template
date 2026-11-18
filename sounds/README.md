# Your world's own sounds

Put sound files here to use them in place of the ones every world gets.
Then name them in `world.json`:

```json
"sounds": {
  "cues": { "step": "sounds/step.ogg", "hover": null },
  "music": "sounds/loop.ogg"
}
```

- A cue you name plays your file. A cue set to `null` is silent. A cue you
  leave out keeps the default. Give a list of files and one is chosen each
  time, so a sound heard often isn't the same every time.
- `music` is what plays in your world. `null` means none. A list plays in
  turn, each piece fading into the next. Left out, your world plays the piece
  every world starts with.
- `hum` is a steady sound under the music: one file, or `null` for none. Left
  out, your world has the hum every world starts with. Visitors can switch it
  off for themselves.
- The defaults are recorded sounds that come with the template, in
  `vendor/nswp/sounds/`; its README says where each came from. Where one
  can't be played, the plumbing makes the sound itself.
- The cues: `step`, `land`, `bump`, `grab`, `drop`, `hover`, `press`,
  `menuOpen`, `menuClose`, `cross`, `arrive`, `join`, `leave`, `micOn`,
  `micOff`, `notice`, `error`.
- A cue file is at most 512 KB and three seconds. A longer or larger one is
  passed over and the default plays.
- How loud things are is the visitor's to set. A loud file is brought down
  to match the others.
- Files must be here, in this folder. A sound on another site is refused: it
  would tell that site who is visiting yours.
- Use only sounds you have the right to use.

## Music between visitors

A visitor can play their own songs, which only they hear, and can offer them
to people standing near. Others hear that only if they turned it on. If your
world should have none of it (a concert, a quiet room), add
`"sharedMusic": false` to `world.json`.
