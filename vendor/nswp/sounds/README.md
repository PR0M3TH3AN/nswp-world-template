# The kit's own sounds

The sounds every world starts with: seventeen cues, a room's hum, and one
piece of music. A site serves this folder (the reference worlds and the
world template put it at `/sounds/kit/`) and gives its address to
`createSounds({ kit })`. A world replaces any of them with files of its own;
where a file can't be had, the kit makes the sound in the browser instead.

`sounds.json` names the files. Most come as Opus in Ogg and as MP3, because
no one form plays in every browser.

## Where they came from

The owner chose each of these by ear, on 2026-11-18, from candidates made for
this project. None is taken from a recording, a library or another work.

| File | Length | Made with |
|---|---|---|
| `cues/step` | 0.12 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/land` | 0.6 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/bump` | 0.3 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/grab` | 0.129 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/drop-1` | 0.088 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/drop-2` | 0.25 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/hover-1` | 0.04 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/hover-2` | 0.04 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/press` | 0.113 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/menuOpen` | 0.6 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/menuClose` | 0.563 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/cross` | 1.2 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/arrive` | 1.2 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/join` | 0.997 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/leave` | 0.914 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/micOn` | 0.12 s | made in code, no model or samples |
| `cues/micOff` | 0.12 s | made in code, no model or samples |
| `cues/notice` | 1.497 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `cues/error` | 0.9 s | MOSS-SoundEffect v2.0 (OpenMOSS, Apache-2.0) |
| `hum` | 48 s, loops | made in code (filtered noise), no model or samples |
| `music/default.ogg` | 96 s, loops | made in code (a synthesizer written for this), no model or samples |

MOSS-SoundEffect v2.0 is published by OpenMOSS under the Apache License 2.0.
Its card places no terms on what it generates. The files made in code are
original to this project. All of them are offered here under this
repository's licence.

The hum and the music are made to run end into beginning. The kit plays them
with a short fade between the two that keeps the loudness level.
