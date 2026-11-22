/**
 * Whether a one-time question about how a visitor moves may be put to them now (fps.ts, input.ts). Never to a
 * browser driven by a script, so that a test of anything else isn't a test of this; `?ask=moving` on the page's
 * address asks all the same, which is how it is looked at.
 */
export declare function mayAskHowTheyMove(): boolean;
