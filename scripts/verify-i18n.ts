import { en, getMessages, negotiateLocale, SUPPORTED_LOCALES, LANGUAGE_NAMES } from "../lib/i18n";
import { loadContent } from "../lib/i18n/content";
import { buildAnalysisPrompt } from "../lib/analysis-prompt";
import { calculateNumerologyProfile } from "../lib/numerology";
import { calculateWesternProfile } from "../lib/western-astrology";
import { getChineseZodiac } from "../lib/chinese-zodiac";
import { classifyLifeStage, calculateAge } from "../lib/life-stages";

let failures = 0;
let passes = 0;

function check(label: string, actual: unknown, expected: unknown): void {
  const ok = actual === expected;
  if (ok) passes++;
  else {
    failures++;
    console.error(`FAIL  ${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
}

function assert(label: string, ok: boolean): void {
  if (ok) passes++;
  else {
    failures++;
    console.error(`FAIL  ${label}`);
  }
}

function keyShape(value: unknown): unknown {
  if (Array.isArray(value)) return [];
  if (!value || typeof value !== "object") return typeof value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, keyShape(child)])
  );
}

// Accept-Language negotiation: q-values, regional subtags, malformed/zero q, wildcard and fallback.
check("locale tr-TR", negotiateLocale("tr-TR,tr;q=0.9,en;q=0.8"), "tr");
check("locale pt-BR", negotiateLocale("pt-BR,pt;q=0.8"), "pt");
check("locale es-419", negotiateLocale("es-419,es;q=0.8"), "es");
check("locale q ordering", negotiateLocale("en;q=0.5,de-DE;q=0.9"), "de");
check("locale zero q ignored", negotiateLocale("tr;q=0,en;q=0.5"), "en");
check("locale malformed q ignored", negotiateLocale("de;q=wat,fr;q=0.7"), "fr");
check("locale wildcard fallback", negotiateLocale("*;q=1"), "en");
check("locale unsupported fallback", negotiateLocale("zz-ZZ,ja;q=0.8"), "en");
check("locale missing fallback", negotiateLocale(null), "en");

// All UI catalogs must have exactly the same structural key shape as English.
const englishShape = JSON.stringify(keyShape(en));
for (const locale of SUPPORTED_LOCALES) {
  const messages = getMessages(locale);
  check(`catalog shape ${locale}`, JSON.stringify(keyShape(messages)), englishShape);
  assert(`catalog meta title ${locale}`, messages.meta.title.trim().length > 0);
  assert(`catalog wizard reveal ${locale}`, messages.wizard.reveal.trim().length > 0);
}

// Content packs must cover every rendered lookup key and every numerology master number.
const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const animals = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const categories = ["lifePath","expression","soulUrge","personality","personalYear"];
const numbers = [1,2,3,4,5,6,7,8,9,11,22,33];

for (const locale of SUPPORTED_LOCALES) {
  const content = await loadContent(locale);
  for (const sign of signs) {
    assert(`content sign name ${locale}/${sign}`, !!content.signNames[sign]);
    assert(`content zodiac ${locale}/${sign}`, !!content.zodiac[sign]?.description && content.zodiac[sign].traits.length > 0);
  }
  for (const animal of animals) {
    assert(`content animal name ${locale}/${animal}`, !!content.animalNames[animal]);
    assert(`content animal prose ${locale}/${animal}`, !!content.chineseAnimals[animal]);
  }
  for (const category of categories) {
    for (const number of numbers) {
      const entry = content.numerology[category]?.[number];
      assert(`content numerology ${locale}/${category}/${number}`, !!entry?.title && !!entry.brief && entry.keywords.length > 0);
    }
  }
}

// Prompt contract: source data stays English while output language is explicit and parser markers remain exact.
const dob = new Date(1990, 5, 15);
const currentYear = new Date().getUTCFullYear();
const age = calculateAge(dob);
const baseProfile = {
  fullName: "Ada Lovelace",
  dateOfBirth: "1990-06-15",
  lifeStage: "Building career, Parent",
  age,
  numerology: calculateNumerologyProfile("Ada Lovelace", dob, currentYear),
  westernAstro: calculateWesternProfile(dob),
  chineseZodiac: getChineseZodiac(dob),
  lifeStageContext: classifyLifeStage(age, ["building_career", "parent"]),
};

for (const locale of SUPPORTED_LOCALES) {
  const prompt = buildAnalysisPrompt({ ...baseProfile, locale });
  assert(`prompt language ${locale}`, prompt.includes(LANGUAGE_NAMES[locale]));
  assert(`prompt marker snapshot ${locale}`, prompt.includes("<<<SNAPSHOT>>>"));
  assert(`prompt marker reading ${locale}`, prompt.includes("<<<READING>>>"));
  assert(`prompt marker season ${locale}`, prompt.includes("<<<SEASON>>>"));
  assert(`prompt marker toolkit ${locale}`, prompt.includes("<<<TOOLKIT>>>"));
  assert(`prompt English enum sun ${locale}`, prompt.includes(`Sun Sign: ${baseProfile.westernAstro.sunSign.sign}`));
  assert(`prompt English enum animal ${locale}`, prompt.includes(`Animal: ${baseProfile.chineseZodiac.animal}`));
  assert(`prompt English life stage ${locale}`, prompt.includes("Life Stage: Building career, Parent"));
}

console.log(`\n${passes} i18n checks passed, ${failures} failed`);
if (failures > 0) process.exit(1);
