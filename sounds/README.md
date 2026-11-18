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
  leave out keeps the default.
- `music` is what plays in your world. `null` means none. Left out, a quiet
  music is made from your world's title.
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
