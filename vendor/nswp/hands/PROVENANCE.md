# The kit's held hands: where they come from

Four files, each in WebXR's grip space, drawn by `packages/sdk/src/held-hands.ts` on a Quest's controllers:

| File | What it is | From |
|---|---|---|
| `hand-left.glb`, `hand-right.glb` | A hand holding its controller, with the clips `hold`, `index-rest`, `index-pulled`, `fingers-open`, `fingers-squeezed`, `thumb-lower`, `thumb-upper`, `thumb-stick`, `thumb-rest` and `thumb-up` | Made by the 3D artist for the owner of this project: bitportal-art, commit c30f660, `assets/hands/out/` (the smaller trigger pull the owner chose). The owner's own work, and this project's to use. |
| `controller-left.glb`, `controller-right.glb` | The Meta Quest Touch Plus controller, as a see-through shell with every moving part kept | The `meta-quest-touch-plus` model of the WebXR Input Profiles assets (github.com/immersive-web/webxr-input-profiles, `packages/assets/profiles/meta-quest-touch-plus/`), changed by the 3D artist: its texture dropped (with it the maker's mark), its body reduced, one material. MIT licensed: `LICENSE-webxr-input-profiles.md`, beside this file. |

Copied from bitportal-art at c30f660 with `git show`, byte for byte, on 2026-11-25. Nothing here carries a texture,
a logo or a maker's mark. To take a newer set from the artist, copy the four files from the commit the owner names
and change this file's commit.
