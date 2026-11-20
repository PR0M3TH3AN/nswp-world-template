/** The content rules the box's page must be served with. Nothing may be reached; only its own inline script and the worker it makes may run. */
export declare const ITEM_BOX_CSP = "default-src 'none'; script-src 'unsafe-inline' blob:; worker-src blob:; frame-ancestors 'self'";
/**
 * The box's page, whole. A world's build writes it out as `item-box.html`. It takes a script by message from the
 * page that frames it, runs it in a worker, passes events in and asks out, and ends the worker if it stops
 * answering.
 */
export declare const ITEM_BOX_HTML: string;
