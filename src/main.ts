// The page starts here. The plumbing sets everything up, then calls your scene.
import { startWorld } from "./plumbing/boot.js";
import { buildScene } from "./scene.js";

void startWorld(buildScene);
