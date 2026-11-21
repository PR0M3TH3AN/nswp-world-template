/** The content rules the box's page must be served with. Nothing may be reached; only its own inline script and the worker it makes may run. */
export declare const ITEM_BOX_CSP = "default-src 'none'; script-src 'unsafe-inline' blob:; worker-src blob:; frame-ancestors 'self'";
/**
 * The box's rules for a world that may itself be shown in a frame by its visitors' client (protocol/02-doors.md,
 * "A client that keeps the screen"). A page says who may be above it all the way up: the box is in its world, and
 * the world is then in the client, so the box has to let that client be above it too or it won't start there.
 *
 * Only who may be above the box changes, and only by that one site: what the box may reach is the same nothing.
 * `client` is the client's origin, as the world's own rules name it. Anything that isn't one https origin, and
 * no client at all, gives the box's ordinary rules.
 */
export declare function itemBoxCsp(client?: string): string;
/**
 * The box's page, whole. A world's build writes it out as `item-box.html`. It takes a script by message from the
 * page that frames it, runs it in a worker, passes events in and asks out, and ends the worker if it stops
 * answering.
 */
export declare const ITEM_BOX_HTML: string;
