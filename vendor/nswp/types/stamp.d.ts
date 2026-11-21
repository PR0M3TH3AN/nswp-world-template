/** The mark itself: the kit, and sixteen characters that change with `rules` (the headers the page is served with, in any form). */
export declare function builtMark(kit: string, rules: unknown): string;
/** `html` with its mark put in, or put right: in its head where it has one, and at its end where it doesn't. */
export declare function stampPage(html: string, kit: string, rules: unknown): string;
