import { SITE_URL } from "../site";
import { isIndexable, loadContent } from "./content";
import { factsFor } from "./facts";
import { linkGroupsFor, relatedFor, type LibraryEntry } from "./registry";

const abs = (path: string) => `${SITE_URL}${path}`;

/** Markdown twin of a library page, for agents (same pattern as /pricing.md). */
export function libraryMarkdown(entry: LibraryEntry): string {
  const content = loadContent(entry);
  const facts = factsFor(entry);
  const lines = [
    "---",
    `title: ${JSON.stringify(entry.title)}`,
    `description: ${JSON.stringify(content.description)}`,
    `canonical: ${abs(entry.path)}`,
    `last-updated: ${content.updatedAt}`,
    `reviewed: ${content.reviewed}`,
    "author: Unified Reading editorial",
    "---",
    "",
    `# ${entry.title}`,
    "",
    content.answer,
    "",
    "## Key facts",
    "",
    "| Fact | Value |",
    "| --- | --- |",
    ...facts.rows.map((row) => `| ${row.label} | ${row.value.replace(/\|/g, "/")} |`),
    "",
    ...content.sections.flatMap((section) => [`## ${section.heading}`, "", ...section.paragraphs.flatMap((p) => [p, ""])]),
    ...linkGroupsFor(entry).flatMap((group) => [`## ${group.heading}`, "", ...group.entries.map((e) => `- [${e.label}](${abs(e.path)})`), ""]),
    ...(content.faq.length ? ["## Frequently asked questions", "", ...content.faq.flatMap((f) => [`### ${f.question}`, "", f.answer, ""])] : []),
    "## Related pages",
    "",
    ...relatedFor(entry).map((e) => `- [${e.label}](${abs(e.path)})`),
    "",
    "## About Unified Reading",
    "",
    `Unified Reading combines Pythagorean numerology, the Western Sun sign (Moon and rising with a birth time), the Chinese zodiac and life-stage context in one reading. The preview is free at ${abs("/#details")}; the full reading is $4.99, paid once through Stripe, with no subscription. A fictional sample is at ${abs("/sample")}. With a birth time and place it adds whole sign houses and the chart ruler; it does not calculate planetary aspects or transits, and it is a framework for reflection, not a prediction.`,
    "",
  ];
  return lines.join("\n");
}

export function markdownHeaders(entry: LibraryEntry): Record<string, string> {
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    Link: `<${abs(entry.path)}>; rel="canonical"`,
    ...(isIndexable(loadContent(entry)) ? {} : { "X-Robots-Tag": "noindex" }),
  };
}
