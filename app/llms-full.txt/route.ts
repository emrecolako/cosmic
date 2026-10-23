import { isIndexable, loadContent } from "@/lib/library/content";
import { factsFor } from "@/lib/library/facts";
import { ALL_ENTRIES } from "@/lib/library/registry";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Each indexable library page's answer and key facts, for answer engines. */
export function GET() {
  const pages = ALL_ENTRIES.filter((entry) => isIndexable(loadContent(entry)));
  const body = [
    "# Unified Reading library (full)",
    "",
    "> Answers and calculated facts from the Unified Reading library. Each section links to the full page and its markdown version. Houses (whole sign) and the chart ruler are calculated only with a birth time and place; planetary aspects and transits are not calculated; these traditions are for reflection, not prediction.",
    "",
    ...(pages.length
      ? pages.flatMap((entry) => {
        const content = loadContent(entry);
        return [
          `## ${entry.title}`,
          "",
          `URL: ${SITE_URL}${entry.path} (markdown: ${SITE_URL}${entry.path}.md) · updated ${content.updatedAt}`,
          "",
          content.answer,
          "",
          ...factsFor(entry).rows.map((row) => `- ${row.label}: ${row.value}`),
          "",
        ];
      })
      : ["The library is awaiting editorial review. See https://unifiedreading.com/llms.txt for the public pages.", ""]),
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
