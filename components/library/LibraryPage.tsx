import Link from "next/link";
import SampleCta from "@/components/SampleCta";
import DateBox, { type DateBoxMode } from "@/components/library/DateBox";
import PairYou from "@/components/compare/PairYou";
import BirthChartTool from "@/components/library/tools/BirthChartTool";
import BirthdayCompatibilityTool from "@/components/library/tools/BirthdayCompatibilityTool";
import NameNumerologyTool from "@/components/library/tools/NameNumerologyTool";
import type { CompareType } from "@/lib/compare";
import { LibraryShareButton, LibraryViewTracker } from "@/components/library/LibraryClient";
import { loadContent } from "@/lib/library/content";
import { factsFor, sign, signDates } from "@/lib/library/facts";
import { libraryJsonLd } from "@/lib/library/jsonld";
import { ANALYTICS_PAGE_TYPE, breadcrumbsFor, linkGroupsFor, prevNextFor, relatedFor, type LibraryEntry } from "@/lib/library/registry";
import { priceLabel } from "@/lib/stripe";

const SYSTEM_LABEL: Record<LibraryEntry["system"], string> = {
  numerology: "Numerology",
  western: "Western astrology",
  chinese: "Chinese astrology",
  mixed: "Numerology · Western astrology · Chinese zodiac",
};

/** Cross-system pages name only the two traditions they combine. */
const TYPE_LABEL: Partial<Record<LibraryEntry["type"], string>> = {
  "life-path-sign": "Numerology · Western astrology",
  "sign-animal": "Western astrology · Chinese zodiac",
};

const CALCULATOR_MODE: Record<string, DateBoxMode> = {
  "life-path-calculator": "life-path",
  "zodiac-sign-calculator": "zodiac",
  "chinese-zodiac-calculator": "chinese",
};

/** Calculators that are their own interactive tool rather than a date box. */
const TOOLS: Record<string, () => React.ReactNode> = {
  "name-numerology-calculator": NameNumerologyTool,
  "birthday-compatibility-calculator": BirthdayCompatibilityTool,
  "birth-chart-calculator": BirthChartTool,
};

/** "Compare with a friend" shows on Life Path number pages, pair pages and calculators. */
function compareTypeFor(entry: LibraryEntry): CompareType | undefined {
  switch (entry.type) {
    case "life-path":
    case "life-path-pair": return "lp";
    case "zodiac-pair": return "sun";
    case "chinese-zodiac-pair": return "cz";
    case "calculator": return entry.system === "western" ? "sun" : entry.system === "chinese" ? "cz" : "lp";
    default: return undefined;
  }
}

const PAIR_KIND: Partial<Record<LibraryEntry["type"], CompareType>> = { "life-path-pair": "lp", "zodiac-pair": "sun", "chinese-zodiac-pair": "cz" };

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export default function LibraryPage({ entry }: { entry: LibraryEntry }) {
  const content = loadContent(entry);
  const facts = factsFor(entry);
  const crumbs = breadcrumbsFor(entry);
  const related = relatedFor(entry);
  const { prev, next } = prevNextFor(entry);
  const spokes = linkGroupsFor(entry);
  const calculatorMode = CALCULATOR_MODE[entry.slug];
  const Tool = TOOLS[entry.slug];
  const pageType = ANALYTICS_PAGE_TYPE[entry.type];
  const compare = compareTypeFor(entry);
  const pairKind = PAIR_KIND[entry.type];

  return <main id="main" className="atlas-shell library-shell">
    <LibraryViewTracker pageType={pageType} slug={entry.slug} system={entry.system} />
    <article className="library-article" data-review-status={content.reviewed ? "reviewed" : "pending"}>
      <nav aria-label="Breadcrumb" className="library-breadcrumb">
        <ol>{crumbs.map((crumb, i) => <li key={crumb.path}>{i === crumbs.length - 1 ? <span aria-current="page">{crumb.name}</span> : <Link href={crumb.path}>{crumb.name}</Link>}</li>)}</ol>
      </nav>
      <p className="eyebrow">{TYPE_LABEL[entry.type] ?? SYSTEM_LABEL[entry.system]}</p>
      <h1 className="library-title">{entry.title}</h1>
      {pairKind && facts.pair && <PairYou kind={pairKind} pair={facts.pair} />}
      <p data-answer className="library-answer">{content.answer}</p>
      <div className="library-byline">
        <span>By Unified Reading editorial</span>
        <LibraryShareButton path={entry.path} title={entry.title} pageType={pageType} slug={entry.slug} />
      </div>

      {Tool && <Tool />}
      {calculatorMode && <DateBox pageType={pageType} slug={entry.slug} mode={calculatorMode} compare={compare} />}

      <section className="library-facts" aria-labelledby="key-facts">
        <h2 id="key-facts">Key facts</h2>
        <table><tbody>{facts.rows.map((row) => <tr key={row.label} data-side={row.side}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}</tbody></table>
      </section>

      {!calculatorMode && !Tool && <DateBox pageType={pageType} slug={entry.slug} compare={compare} />}

      <div className="library-body">
        {content.sections.map((section) => <section key={section.heading} id={section.id}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </section>)}
      </div>

      {spokes.map((group) => <nav key={group.heading} id={group.id} className="library-spokes" aria-label={group.heading}>
        <h2>{group.heading}</h2>
        {entry.slug === "zodiac" && <p className="library-spokes-note">{signDates(group.heading)} · {sign(group.heading).modality} {sign(group.heading).element} · ruled by {sign(group.heading).rulingPlanet}</p>}
        <ul>{group.entries.map((spoke) => <li key={spoke.path}><Link href={spoke.path}>{spoke.label}</Link></li>)}</ul>
      </nav>)}

      <section className="library-together" aria-labelledby="read-together">
        <h2 id="read-together">Read together</h2>
        <p>One tradition on its own gives a single angle. A Unified Reading puts your Life Path and name numbers, your Sun sign (plus Moon and rising when you know your birth time), your Chinese zodiac animal and your life stage side by side, and points out where they agree and where they pull apart. See how that looks in the <Link href="/sample">fictional sample reading</Link>, or start with the free preview and pay {priceLabel()} once only if you want the full reading.</p>
        <SampleCta price={priceLabel()} position="read-together" placement="library" pageType={pageType} slug={entry.slug} />
      </section>

      {content.faq.length > 0 && <section className="library-faq" aria-labelledby="faq">
        <h2 id="faq">Frequently asked questions</h2>
        {content.faq.map((item) => <details key={item.question} open>
          <summary><h3>{item.question}</h3></summary>
          <p>{item.answer}</p>
        </details>)}
      </section>}

      <nav className="library-related" aria-labelledby="related">
        <h2 id="related">Related pages</h2>
        <ul>{related.map((link) => <li key={link.path}><Link href={link.path}>{link.label}</Link></li>)}</ul>
      </nav>

      <nav className="library-prevnext" aria-label="Previous and next">
        <Link href={prev.path} rel="prev"><span>Previous</span>{prev.label}</Link>
        <Link href={next.path} rel="next"><span>Next</span>{next.label}</Link>
      </nav>

      <p className="library-reviewed">
        {content.reviewed
          ? `Last reviewed ${formatDate(content.updatedAt)}${content.reviewer ? ` by ${content.reviewer}` : ""}.`
          : `Last updated ${formatDate(content.updatedAt)}. Awaiting editorial review.`}
        {" "}Numerology and astrology are interpretive traditions for reflection, not predictions.
      </p>
    </article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(libraryJsonLd(entry, content, facts)).replace(/</g, "\\u003c") }} />
  </main>;
}
