import type { LibraryContent } from "../../../lib/library/content";
import type { LibraryEntry } from "../../../lib/library/registry";
import { buildAnimal, buildChinesePair } from "./chinese";
import { HUB_EXTRA, HUB_FAQ, HUB_FIFTH, HUB_MORE } from "./hub-extensions";
import { HUB_COPY } from "./hubs";
import { buildLifePath, buildLifePathPair } from "./life-path";
import { buildZodiacPair } from "./zodiac";
import { TOOL_COPY } from "./tool-pages";
import { DATE_HUB_COPY, buildBirthday, buildBirthdayMonth, buildElementAnimal, buildZodiacYear } from "./dates";
import { MONTH_NAMES, parseBirthdaySlug } from "../../../lib/library/calendar";
import { animalOfSlug, numberOfSlug, signOfSlug, yearOfSlug } from "../../../lib/library/registry";
import { NUMEROLOGY_HUB_COPY, buildAngelNumber, buildBirthdayNumber, buildNameNumber, buildPersonalYear } from "./numerology-pages";
import { buildLifePathSign, buildSignAnimal } from "./cross-pages";
import { buildDecan, buildMoon, buildRising, buildSign } from "./zodiac-pages";

export type PageCopy = Omit<LibraryContent, "updatedAt" | "reviewed" | "reviewer">;

const pair = (entry: LibraryEntry) => entry.label.split(" and ");

export function buildPage(entry: LibraryEntry): PageCopy {
  switch (entry.type) {
    case "hub":
    case "calculator": {
      if (TOOL_COPY[entry.slug]) return TOOL_COPY[entry.slug];
      if (DATE_HUB_COPY[entry.slug]) return DATE_HUB_COPY[entry.slug];
      if (NUMEROLOGY_HUB_COPY[entry.slug]) return NUMEROLOGY_HUB_COPY[entry.slug];
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
    case "birthday":
      return buildBirthday(parseBirthdaySlug(entry.slug)!);
    case "birthday-month":
      return buildBirthdayMonth(MONTH_NAMES.findIndex((name) => name.toLowerCase() === entry.slug) + 1);
    case "chinese-zodiac-year":
      return buildZodiacYear(Number(entry.slug));
    case "chinese-zodiac-element": {
      const [element, animal] = entry.label.split(" ");
      return buildElementAnimal(element, animal);
    }
    case "sign":
      return buildSign(entry.label);
    case "moon-sign":
      return buildMoon(signOfSlug(entry.slug));
    case "rising-sign":
      return buildRising(signOfSlug(entry.slug));
    case "decan":
      return buildDecan(signOfSlug(entry.slug), Number(entry.slug.split("-").pop()));
    case "life-path-sign":
      return buildLifePathSign(Number(entry.slug.split("-")[0]), signOfSlug(entry.slug));
    case "sign-animal":
      return buildSignAnimal(signOfSlug(entry.slug), animalOfSlug(entry.slug));
    case "expression":
    case "soul-urge":
    case "personality":
      return buildNameNumber(entry.type, numberOfSlug(entry.slug));
    case "birthday-number":
      return buildBirthdayNumber(numberOfSlug(entry.slug));
    case "personal-year":
      return buildPersonalYear(numberOfSlug(entry.slug), yearOfSlug(entry.slug) as 2026 | 2027);
    case "angel-number":
      return buildAngelNumber(entry.slug);
  }
}
