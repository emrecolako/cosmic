import { readFileSync } from "node:fs";
import path from "node:path";
import type { LibraryEntry, PageType } from "./registry";

export interface LibrarySection { heading: string; paragraphs: string[]; id?: string }
export interface LibraryFaq { question: string; answer: string }

/** Stored at content/library/{type}/{slug}.json. */
export interface LibraryContent {
  description: string;
  answer: string;
  sections: LibrarySection[];
  faq: LibraryFaq[];
  updatedAt: string;
  reviewed: boolean;
  reviewer: string | null;
}

export const CONTENT_ROOT = path.join(process.cwd(), "content", "library");

export const contentFile = (type: PageType, slug: string) => path.join(CONTENT_ROOT, type, `${slug}.json`);

const cache = new Map<string, LibraryContent>();

export function loadContent(entry: Pick<LibraryEntry, "type" | "slug">): LibraryContent {
  const file = contentFile(entry.type, entry.slug);
  let content = cache.get(file);
  if (!content) {
    content = JSON.parse(readFileSync(file, "utf8")) as LibraryContent;
    cache.set(file, content);
  }
  return content;
}

/**
 * Unreviewed pages render for everyone but stay out of search until an
 * editor reviews them, unless LIBRARY_INDEX_UNREVIEWED=true at build time.
 */
export function isIndexable(content: Pick<LibraryContent, "reviewed">): boolean {
  return content.reviewed || process.env.LIBRARY_INDEX_UNREVIEWED === "true";
}

export const wordsOf = (text: string) => text.toLowerCase().match(/[a-z0-9]+(?:['’-][a-z0-9]+)*/g) ?? [];

export function bodyText(content: LibraryContent): string {
  return [
    content.answer,
    ...content.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...content.faq.flatMap((f) => [f.question, f.answer]),
  ].join("\n");
}
