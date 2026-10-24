/**
 * Writes lib/library/data/famous-birthdays.json: the best-known people born on
 * each day of the year, ranked by Wikipedia sitelinks, from Wikidata (CC0).
 * Run with: npx tsx scripts/library/fetch-famous-birthdays.ts
 *
 * Only day-precision Gregorian birth dates count, and people with conflicting
 * birth dates are skipped, so the birthday pages never guess. Descriptions are
 * used only to filter people out; free-text Wikidata descriptions vary too much
 * in quality to quote on the page.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ENDPOINT = "https://qlever.dev/api/wikidata";
const PER_DAY = 3;
const MIN_SITELINKS = 40;

const QUERY = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX psv: <http://www.wikidata.org/prop/statement/value/>
PREFIX schema: <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?p ?label ?desc ?dob ?links WHERE {
  ?p wdt:P31 wd:Q5 .
  ?p wikibase:sitelinks ?links .
  FILTER(?links >= ${MIN_SITELINKS})
  ?p p:P569/psv:P569 ?v .
  ?v wikibase:timeValue ?dob ; wikibase:timePrecision 11 ; wikibase:timeCalendarModel wd:Q1985727 .
  ?p rdfs:label ?label . FILTER(LANG(?label) = "en")
  OPTIONAL { ?p schema:description ?desc . FILTER(LANG(?desc) = "en") }
}`;

export interface FamousBirth { qid: string; name: string; year: number }

interface Binding { p: { value: string }; label: { value: string }; desc?: { value: string }; dob: { value: string }; links: { value: string } }

// Names land in page copy, so skip people described in ways the pages should not feature.
const UNSAFE = /\b(tarot|astrolog|numerolog|psychic|criminal|murder|serial killer|terroris|dictator|nazi|war criminal|convicted)\w*/i;

async function main() {
  const url = `${ENDPOINT}?${new URLSearchParams({ query: QUERY })}`;
  const response = await fetch(url, { headers: { Accept: "application/sparql-results+json", "User-Agent": "UnifiedReadingLibrary/1.0" } });
  if (!response.ok) throw new Error(`Wikidata query failed: ${response.status}`);
  const bindings = ((await response.json()) as { results: { bindings: Binding[] } }).results.bindings;

  const people = new Map<string, { name: string; description: string; dates: Set<string>; links: number }>();
  for (const b of bindings) {
    const qid = b.p.value.split("/").pop()!;
    const person = people.get(qid) ?? { name: b.label.value, description: b.desc?.value ?? "", dates: new Set<string>(), links: Number(b.links.value) };
    person.dates.add(b.dob.value.slice(0, 10));
    people.set(qid, person);
  }

  const byDay: Record<string, Array<FamousBirth & { links: number }>> = {};
  for (const [qid, person] of people) {
    if (person.dates.size !== 1) continue;
    const [iso] = person.dates;
    const year = Number(iso.slice(0, 4));
    if (year < 1700 || year > 2015) continue;
    if (!person.description || UNSAFE.test(person.description) || UNSAFE.test(person.name)) continue;
    const key = iso.slice(5, 10);
    (byDay[key] ??= []).push({ qid, name: person.name, year, links: person.links });
  }

  const out: Record<string, FamousBirth[]> = {};
  for (const key of Object.keys(byDay).sort()) {
    out[key] = byDay[key]
      .sort((a, b) => b.links - a.links || a.year - b.year)
      .slice(0, PER_DAY)
      .map(({ qid, name, year }) => ({ qid, name, year }));
  }
  const missing = 366 - Object.keys(out).length;
  const file = path.join(process.cwd(), "lib", "library", "data", "famous-birthdays.json");
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `{\n${Object.entries(out).map(([day, list]) => `  ${JSON.stringify(day)}: ${JSON.stringify(list)}`).join(",\n")}\n}\n`);
  console.log(`Wrote ${Object.keys(out).length} days (${missing} without anyone) from ${people.size} people.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
