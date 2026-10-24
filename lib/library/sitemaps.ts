import { isIndexable, loadContent } from "./content";
import { entriesOfType, type PageType } from "./registry";

export const CORE_PAGES = ["/", "/about", "/sample", "/privacy", "/pricing", "/contact"];
export const CORE_LAST_MODIFIED = "2026-10-02";
export const SITEMAP_IDS = ["core", "hub", "calculator", "life-path", "life-path-pair", "zodiac-pair", "chinese-zodiac", "chinese-zodiac-pair", "birthday-month", "birthday", "chinese-zodiac-year", "chinese-zodiac-element", "sign", "moon-sign", "rising-sign", "decan", "life-path-sign", "sign-animal", "expression", "soul-urge", "personality", "birthday-number", "personal-year", "angel-number"] as const;
export type SitemapId = (typeof SITEMAP_IDS)[number];

/** Indexable pages of one type with the updatedAt from their content JSON. */
export function libraryUrls(type: PageType): Array<{ path: string; lastModified: string }> {
  return entriesOfType(type)
    .map((entry) => ({ entry, content: loadContent(entry) }))
    .filter(({ content }) => isIndexable(content))
    .map(({ entry, content }) => ({ path: entry.path, lastModified: content.updatedAt }));
}

export function lastModifiedOf(id: SitemapId): string {
  if (id === "core") return CORE_LAST_MODIFIED;
  return libraryUrls(id).map((u) => u.lastModified).sort().at(-1) ?? CORE_LAST_MODIFIED;
}
