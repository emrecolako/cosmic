/**
 * Small shared UI utilities.
 */

/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Force text presentation on a symbol that the platform would otherwise
 * render as a colour emoji (zodiac signs, planets). VARIATION SELECTOR-15
 * keeps the glyph monochrome so it inherits the current text colour.
 */
export function textGlyph(glyph: string): string {
  return `${glyph}\uFE0E`;
}
