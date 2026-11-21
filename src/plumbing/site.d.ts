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
    /** Where each door leads, by the door's coordinate: its address, as that world's own announcement said. */
    places: Record<string, string>;
    /** What each door's place does with the things visitors carry, by the door's coordinate: "allowed" or "play", as its own announcement said. */
    carried: Record<string, string>;
    /** What each door's place offers, by the door's coordinate: the modes and capabilities its own announcement named, and the listings it says it is entered by, where it names any. Absent for a door not asked about since this was kept. */
    offered: Record<string, { modes: string[]; capabilities: string[]; access?: string[] }>;
  };
  export default site;
}
