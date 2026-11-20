/** Made at build time from home.json and signed/ (see scripts/lib.mjs). */
declare module "virtual:site" {
  const site: {
    /** The home layout to draw, as an unsigned event. */
    layout: unknown;
    /** The key that announced this world, or null before `npm run sign`. */
    publisher: string | null;
    /** The 360° picture each door shows, by the door's coordinate: the SHA-256 it is kept under in /doors/. */
    doors: Record<string, string>;
  };
  export default site;
}
