import { SITE_URL } from "../site";
import type { LibraryContent } from "./content";
import type { PageFacts } from "./facts";
import { breadcrumbsFor, type LibraryEntry } from "./registry";

const ORGANIZATION = { "@id": `${SITE_URL}/#organization` };

export function libraryJsonLd(entry: LibraryEntry, content: LibraryContent, facts: PageFacts): object {
  const url = `${SITE_URL}${entry.path}`;
  const graph: object[] = [
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumbsFor(entry).map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: `${SITE_URL}${crumb.path === "/" ? "/" : crumb.path}`,
      })),
    },
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: entry.title,
      description: content.description,
      url,
      mainEntityOfPage: url,
      inLanguage: "en",
      datePublished: content.updatedAt,
      dateModified: content.updatedAt,
      author: ORGANIZATION,
      publisher: ORGANIZATION,
      isPartOf: { "@id": `${SITE_URL}/#app` },
      about: { "@type": "DefinedTerm", name: facts.about.name, inDefinedTermSet: facts.about.termSet },
    },
  ];
  if (content.faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: content.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }
  if (entry.type === "calculator") {
    graph.push({
      "@type": "WebApplication",
      "@id": `${url}#calculator`,
      name: entry.title,
      url,
      description: content.description,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript; runs entirely in the browser.",
      isAccessibleForFree: true,
      publisher: ORGANIZATION,
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
