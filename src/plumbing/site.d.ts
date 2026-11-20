/** Made at build time from home.json and signed/ (see scripts/lib.mjs). */
declare module "virtual:site" {
  const site: {
    /** The home layout to draw, as an unsigned event. */
    layout: unknown;
    /** The key that announced this world, or null before `npm run sign`. */
    publisher: string | null;
    /** The 360° picture each door shows, by the door's coordinate: the SHA-256 it is kept under in /doors/. */
    doors: Record<string, string>;
    /** What kind of place each door leads to, by the door's coordinate: one of the protocol's categories, as that world's own announcement said. */
    kinds: Record<string, string>;
  };
  export default site;
}
