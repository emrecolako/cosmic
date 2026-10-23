import type { LibraryContent } from "../../../lib/library/content";
import type { LibraryEntry } from "../../../lib/library/registry";
import { buildAnimal, buildChinesePair } from "./chinese";
import { HUB_EXTRA, HUB_FAQ, HUB_FIFTH, HUB_MORE } from "./hub-extensions";
import { HUB_COPY } from "./hubs";
import { buildLifePath, buildLifePathPair } from "./life-path";
import { buildZodiacPair } from "./zodiac";

export type PageCopy = Omit<LibraryContent, "updatedAt" | "reviewed" | "reviewer">;

const pair = (entry: LibraryEntry) => entry.label.split(" and ");

export function buildPage(entry: LibraryEntry): PageCopy {
  switch (entry.type) {
    case "hub":
    case "calculator": {
      const copy = HUB_COPY[entry.slug];
      return {
        ...copy,
        sections: [...copy.sections.map((section, i) => ({ ...section, paragraphs: [...section.paragraphs, HUB_MORE[entry.slug][i]] })), HUB_FIFTH[entry.slug]]
          .map((section, i) => (HUB_EXTRA[entry.slug]?.[i] ? { ...section, paragraphs: [...section.paragraphs, HUB_EXTRA[entry.slug][i]] } : section)),
        faq: [...copy.faq, HUB_FAQ[entry.slug]],
      };
    }
    case "life-path":
      return buildLifePath(Number(entry.slug));
    case "life-path-pair": {
      const [a, b] = entry.slug.split("-vs-").map(Number);
      return buildLifePathPair(a, b);
    }
    case "zodiac-pair": {
      const [a, b] = pair(entry);
      return buildZodiacPair(a, b);
    }
    case "chinese-zodiac":
      return buildAnimal(entry.label);
    case "chinese-zodiac-pair": {
      const [a, b] = pair(entry);
      return buildChinesePair(a, b);
    }
  }
}
