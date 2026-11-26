/**
 * Whether the headset shows the flat menu's own drawing (console-sheet.ts) in place of today's console: asked for by
 * the address, `?menu=sheet`, until it is the default (docs/plans/headset-menu.md, step 5). Its own small file, so
 * that what only asks this (the room's chat, a conversation) doesn't bring the console in with it.
 */
export declare const sheetAsked: () => boolean;
