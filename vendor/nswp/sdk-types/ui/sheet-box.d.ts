/**
 * Where a mounted menu's sheet is just now, asked by the client's end of the port so that it can tell a framed
 * world what of its view the menu covers (`covers`; docs/plans/the-clients-menu.md, section 15).
 *
 * Kept apart from the menu's own file: the port is loaded with the page and the menu may be fetched later, so the
 * port must not pull the menu in to ask this. The menu says how to find its sheet as it is mounted; the port asks
 * by the menu it was handed (`below.attach(menu)`). Neither is a name a world or a client uses.
 */
export interface SheetNow {
    /** The sheet's box in this page's window, in pixels, while it is up. Null while it is down or hidden. */
    box: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    /** Whether it is on its way up or down: its box is then where it is passing, not where it comes to rest. */
    moving: boolean;
}
/** A menu says how its sheet is found, as it is mounted. */
export declare function keepSheet(menu: object, now: () => SheetNow): void;
/** Where that menu's sheet is. A thing that is no mounted menu has none. */
export declare function sheetOf(menu: object | null): SheetNow;
