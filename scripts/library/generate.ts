/**
 * Writes content/library/{type}/{slug}.json from the authored copy in
 * scripts/library/copy/. Run with: npx tsx scripts/library/generate.ts
 *
 * Pages already marked reviewed:true are never overwritten, so editors can
 * fix copy in the JSON directly once they have reviewed it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ALL_ENTRIES } from "../../lib/library/registry";
import { contentFile, type LibraryContent } from "../../lib/library/content";
import { buildPage } from "./copy";

const UPDATED_AT = process.env.LIBRARY_UPDATED_AT ?? new Date().toISOString().slice(0, 10);

let written = 0;
let kept = 0;
for (const entry of ALL_ENTRIES) {
  const file = contentFile(entry.type, entry.slug);
  if (existsSync(file) && (JSON.parse(readFileSync(file, "utf8")) as LibraryContent).reviewed) {
    kept++;
    continue;
  }
  const page = buildPage(entry);
  const previous = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as LibraryContent) : undefined;
  // updatedAt (and so sitemap lastmod and IndexNow) only moves when the copy itself changes.
  const unchanged = previous && JSON.stringify({ ...previous, updatedAt: "" }) === JSON.stringify({ description: page.description, answer: page.answer, ...(page.ogLine ? { ogLine: page.ogLine } : {}), sections: page.sections, faq: page.faq, updatedAt: "", reviewed: false, reviewer: null });
  if (unchanged) continue;
  const { description, answer, ogLine, sections, faq } = page;
  const content: LibraryContent = { description, answer, ...(ogLine ? { ogLine } : {}), sections, faq, updatedAt: UPDATED_AT, reviewed: false, reviewer: null };
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(content, null, 2)}\n`);
  written++;
}
console.log(`Wrote ${written} library pages; kept ${kept} reviewed pages unchanged; ${ALL_ENTRIES.length} total.`);
