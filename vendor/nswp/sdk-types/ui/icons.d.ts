/**
 * The kit's icons: line drawings on a 24-unit square, as SVG path data. One
 * set serves both renderers: the flat HUD puts them in an <svg>, and the
 * headset console draws them on its canvas with Path2D.
 */
export declare const ICONS: {
    readonly home: "M4 11.5 12 4l8 7.5M6 10v10h12V10M10 20v-5h4v5";
    readonly turn: "M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5";
    readonly room: "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20a6 6 0 0 1 12 0M16.5 11.5a2.5 2.5 0 1 0 0-5M17.5 14.6A5 5 0 0 1 21.5 20";
    readonly leave: "M10 4H5v16h5M14 8l4 4-4 4M18 12H9";
    readonly mic: "M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6";
    readonly micOff: "M9 9v2a3 3 0 0 0 4.6 2.5M15 10.5V6a3 3 0 0 0-5.7-1.3M6 11a6 6 0 0 0 9.6 4.8M18 11a6 6 0 0 1-.4 2.2M12 17v4M9 21h6M4 4l16 16";
    readonly list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01";
    readonly vr: "M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3.5l-2-2.5h-3L8.5 17H5a2 2 0 0 1-2-2V9ZM8 12h.01M16 12h.01";
    readonly exit: "M18 6 6 18M6 6l12 12";
    readonly look: "M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11ZM9 14a3 3 0 0 0 3 3";
    readonly help: "M9.2 9a3 3 0 1 1 4.6 2.5c-1 .7-1.8 1.4-1.8 2.7M12 18h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z";
    readonly menu: "M4 7h16M4 12h16M4 17h10";
    /** An arched doorway: this project's mark for a way through. */
    readonly door: "M7 21V10a5 5 0 0 1 10 0v11M5 21h14M14.5 14h.01";
    readonly link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.700l1-1";
    readonly save: "M7 4h10v17l-5-3.5L7 21V4Z";
    readonly pin: "M9 4h6l-1 6 3 3H7l3-3-1-6ZM12 13v7";
    readonly step: "M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.800-6 10-6 10ZM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z";
    readonly size: "M4 18 9 6l5 12M5.700 14h6.600M15 18l3.500-8 3.500 8M16 15.700h5";
    readonly motion: "M3 12h4l3-7 4 14 3-7h4";
    readonly check: "M5 12.500 10 17.500 19 7";
    readonly camera: "M4 8h3l1.5-2h7L17 8h3v11H4ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z";
    readonly selfie: "M4 5h16v14H4ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7.5 19a4.5 4.5 0 0 1 9 0";
    readonly record: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z";
    /** A panel: a frame with a bar along its top. */
    readonly panel: "M4 5h16v14H4ZM4 9h16M15 7h.01M17.5 7h.01";
    readonly note: "M6 3h9l4 4v14H6ZM14 3v5h5M9 13h7M9 17h5";
    /** A loudspeaker, sounding and crossed out. */
    readonly sound: "M4 9.500v5h3.500L13 19V5L7.500 9.500ZM16.500 9a4.500 4.500 0 0 1 0 6M19 6.500a8 8 0 0 1 0 11";
    readonly soundOff: "M4 9.500v5h3.500L13 19V5L7.500 9.500ZM16.500 9.500l4.500 5M21 9.500l-4.500 5";
    readonly you: "M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM5 20.5a7 7 0 0 1 14 0";
    readonly close: "M6 6l12 12M18 6 6 18";
    readonly key: "M14.5 9.5a3.5 3.5 0 1 0-3.4 3.5L4 20v-3h3v-3h3l1.6-1.6M16 8h.01";
    readonly chat: "M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 10h8M8 13h5";
    readonly people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M16 11a2.5 2.5 0 1 0 0-5M21 20a5 5 0 0 0-4-4.9";
    readonly bag: "M6 8h12l1.2 12H4.8L6 8ZM9 8V6.5a3 3 0 0 1 6 0V8";
    readonly trophy: "M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4";
    readonly coin: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM14.6 9.6c-.5-1-1.4-1.6-2.6-1.6-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2 2.6.8 2.6 2-1.1 2-2.6 2c-1.2 0-2.1-.6-2.6-1.6M12 6.5V8M12 16v1.5";
};
export type IconName = keyof typeof ICONS;
