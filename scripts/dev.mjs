// Runs the world on your own machine and rebuilds as you edit.
import { serveSite } from "./lib.mjs";

const { port } = await serveSite(Number(process.env.PORT ?? 5173));
console.log(`Your world is at http://127.0.0.1:${port}/`);
console.log(`With a pretend headset: http://127.0.0.1:${port}/?xr=emulate`);
