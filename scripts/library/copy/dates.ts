/**
 * Birthday, birthday-month, Chinese year and element-animal pages. Facts come
 * from lib/library/date-facts.ts; prose comes from the hand-written blocks in
 * birthday-blocks.ts, birthday-hooks-*.ts and element-animals.ts.
 *
 * Template sentences come in variants so neighbouring dates (and years sixty
 * apart) don't share their framing; the verifier caps sibling similarity.
 */
import { ANIMALS, ANIMAL_BRANCHES, LUNAR_NEW_YEAR_DATES } from "../../../lib/chinese-zodiac";
import { BIRTHDAYS, MONTH_NAMES, birthdaySlug, elementAnimalSlug, elementAnimalYears, type MonthDay } from "../../../lib/library/calendar";
import { birthdayFacts, stemBranchName, zodiacYearFacts, type BirthdayFacts } from "../../../lib/library/date-facts";
import { decanRuler, sign, stemToFixed, trineElement, universalYear } from "../../../lib/library/facts";
import { liuChongOf, liuHeOf, trineOf } from "../../../lib/library/registry";
import { ANIMAL_COPY } from "./animals";
import { CUSP_TEXT, DAY_NUMBER_TEXT, DECAN_TEXT, MONTH_TEXT } from "./birthday-blocks";
import { BIRTHDAY_HOOKS_1 } from "./birthday-hooks-1";
import { BIRTHDAY_HOOKS_2 } from "./birthday-hooks-2";
import { BIRTHDAY_HOOKS_3 } from "./birthday-hooks-3";
import { ELEMENT_ANIMAL_LIFE, ELEMENT_ANIMAL_TEXT, STEM_ELEMENT_TEXT, YEAR_SUMMARY } from "./element-animals";
import type { PageCopy } from "./index";
import { an, cap, fitAnswer, list, para } from "./util";

const HOOKS: Record<string, string> = { ...BIRTHDAY_HOOKS_1, ...BIRTHDAY_HOOKS_2, ...BIRTHDAY_HOOKS_3 };
const DECAN_WORDS = ["", "first", "second", "third"];
const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];
const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const pick = <T,>(variants: T[], i: number) => variants[i % variants.length];
const orNames = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`);

// ---------------------------------------------------------------------------
// Birthday pages
// ---------------------------------------------------------------------------

function positionLine(f: BirthdayFacts, v: number): string {
  const meta = sign(f.sign);
  const ruler = decanRuler(f.sign, f.decan);
  return pick([
    ruler === meta.rulingPlanet
      ? `On ${f.label} the Sun usually sits at about ${f.degree}° ${f.sign}, in the ${DECAN_WORDS[f.decan]} decan, where ${ruler} rules the decan as well as the sign.`
      : `On ${f.label} the Sun usually sits at about ${f.degree}° ${f.sign}, in the ${DECAN_WORDS[f.decan]} decan, where ${ruler} is the sub-ruler alongside ${meta.rulingPlanet}.`,
    `By noon UTC on ${f.label}, the Sun has normally reached roughly ${f.degree}° of ${f.sign}. That places the date in the ${f.sign} decan that astrologers give to ${ruler}, the ${DECAN_WORDS[f.decan]} of three.`,
    `Astronomically, ${f.label} puts the Sun near ${f.degree}° ${f.sign} in most years, inside the ${DECAN_WORDS[f.decan]} ten-degree slice of the sign, which tradition links with ${ruler}.`,
  ], v);
}

function lifePathLine(f: BirthdayFacts, v: number): string {
  const byYear = f.lifePathByYear.map(({ year, lifePath }) => `${lifePath} for ${year}`);
  const masters = f.lifePaths.filter((n) => n > 9);
  const masterNote = masters.length ? ` Some birth years on this date reach the master number${masters.length > 1 ? "s" : ""} ${list(masters.map(String))}.` : "";
  return pick([
    `The Life Path, the main number in a numerology chart, also uses the birth year, so it changes from one ${f.label} birthday to the next: it is ${list(byYear.slice(0, 4))}, for example.${masterNote}`,
    `Because the year enters the Life Path calculation, the same ${f.label} birthday leads to different paths across generations, among them ${list(byYear.slice(2, 6))}.${masterNote} The Life Path calculator does the reduction for any year.`,
    `Add the birth year and the picture shifts again: ${an(f.label)} birthday gives Life Path ${list(byYear.slice(3, 7))}.${masterNote} Read the birthday number as a secondary note beside that main theme.`,
  ], v);
}

function chineseLine(f: BirthdayFacts, v: number): string {
  if (f.chinese.kind === "previous") {
    return pick([
      `For the Chinese zodiac, ${f.label} always falls before Lunar New Year, which arrives between January 21 and February 20, so someone born on this date takes the animal of the previous calendar year.`,
      `Chinese astrology counts the year from Lunar New Year, never earlier than January 21, so ${an(f.label)} birthday belongs to the animal of the year before the birth year.`,
      `In the Chinese zodiac ${an(f.label)} birth comes before the new year has turned, so the animal is the one that began the previous winter.`,
    ], v);
  }
  if (f.chinese.kind === "boundary") {
    return pick([
      `For the Chinese zodiac, ${f.label} sits inside the Lunar New Year window: in ${f.chinese.after} of the ${f.chinese.total} years from 1924 to 2044 the new year has already begun by this date, so check the year before choosing an animal.`,
      `${f.label} is a date where the Chinese animal genuinely depends on the year. Lunar New Year had arrived by this date in ${f.chinese.after} of ${f.chinese.total} years between 1924 and 2044; in the others the birth belongs to the previous animal.`,
      `Chinese astrology needs care here, because Lunar New Year moves between January 21 and February 20. Across 1924 to 2044 it had passed by ${f.label} in ${f.chinese.after} of ${f.chinese.total} years, so the year page for your birth year settles it.`,
    ], v);
  }
  return pick([
    `For the Chinese zodiac, Lunar New Year has always passed by ${f.label}, so the animal is simply the one for the birth year.`,
    `Chinese astrology is straightforward for ${an(f.label)} birthday: the new year began weeks earlier, so the birth year's own animal applies.`,
    `By ${f.label} the Chinese new year is well under way, which means the animal and element are those of the calendar birth year.`,
  ], v);
}

const th = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;

/** Day of the year, and when the Sun next changes sign (in most years). */
function seasonLine(f: BirthdayFacts, v: number): string {
  const index = BIRTHDAYS.findIndex((d) => d.month === f.month && d.day === f.day);
  const dayOfYear = f.month <= 2 ? index + 1 : index; // BIRTHDAYS includes Feb 29
  const leap = f.month > 2 ? ` (${th(dayOfYear + 1)} in a leap year)` : f.month === 2 && f.day === 29 ? "" : "";
  let next = index;
  let ahead = 0;
  do {
    next = (next + 1) % BIRTHDAYS.length;
    ahead++;
  } while (birthdayFacts(BIRTHDAYS[next]).sign === f.sign && ahead < 40);
  const change = birthdayFacts(BIRTHDAYS[next]);
  const dayText = f.month === 2 && f.day === 29 ? "February 29 is the 60th day of a leap year, the date that exists only once every four years." : `${f.label} is the ${th(dayOfYear)} day of the year${leap}.`;
  return pick([
    `${dayText} By ${change.label}, ${ahead} day${ahead === 1 ? "" : "s"} later, the Sun has usually moved on into ${change.sign}.`,
    `${dayText} In most years ${change.sign} season is under way by ${change.label}, ${ahead} day${ahead === 1 ? "" : "s"} after this birthday.`,
    `${dayText} Counting forward, the next sign change, into ${change.sign}, is usually complete within ${ahead} day${ahead === 1 ? "" : "s"}, by ${change.label}.`,
  ], v);
}

function famousLine(f: BirthdayFacts, v: number): string {
  if (!f.famous.length) return "";
  const names = f.famous.map((p) => `${p.name} (${p.year})`);
  return pick([
    `Well-known people born on ${f.label} include ${list(names)}.`,
    `${f.label} is also the birthday of ${list(names)}.`,
    `Among the best-known people with ${an(f.label)} birthday are ${list(names)}.`,
  ], v);
}

export function buildBirthday(date: MonthDay): PageCopy {
  const f = birthdayFacts(date);
  const v = date.day + date.month;
  const meta = sign(f.sign);
  const slug = birthdaySlug(date);
  const hook = HOOKS[slug];
  if (!hook) throw new Error(`Missing birthday hook for ${slug}`);
  const cuspKey = f.cusp ? f.signs.join("|") : "";
  const signText = f.cusp ? CUSP_TEXT[cuspKey] : DECAN_TEXT[`${f.sign}-${f.decan}`];
  if (!signText) throw new Error(`Missing sign text for ${slug} (${cuspKey || `${f.sign}-${f.decan}`})`);

  const answerBase = f.cusp
    ? `In Western astrology, ${f.label} is a cusp birthday: depending on the year, time and place of birth, the Sun is in ${orNames(f.signs)}. In numerology the day gives birthday number ${f.birthdayNumber}, while the Life Path also depends on the birth year.`
    : `In Western astrology, ${an(f.label)} birthday falls in ${f.sign}, in the ${DECAN_WORDS[f.decan]} decan, with ${meta.rulingPlanet} as the sign's ruler and ${decanRuler(f.sign, f.decan)} as the decan's. In numerology the day gives birthday number ${f.birthdayNumber}.`;
  const answer = fitAnswer(answerBase, [
    ...(f.cusp
      ? ["Many people born on cusp dates recognise something of both signs."]
      : ["The Life Path also uses the birth year.", `${f.sign} is ${meta.modality.toLowerCase()} and ${meta.element.toLowerCase()}.`]),
    "Both are read as tendencies, not predictions.",
  ]);

  const signHeading = pick([`${f.label} zodiac sign and personality`, `Personality of ${an(f.label)} birthday`, `The ${f.label} birthday in astrology`], v);
  const numberHeading = pick([`${f.label} in numerology`, `Numerology of the ${f.label} birthday`, `Birthday number and Life Path for ${f.label}`], v);
  const contextHeading = pick([`Born on ${f.label}: season, famous birthdays and Chinese zodiac`, `${f.label} in context: the season, Chinese zodiac and famous birthdays`, `Season, Chinese zodiac and famous ${f.label} birthdays`], v);

  return {
    description: `${f.label} birthday meaning: ${f.cusp ? `${orNames(f.signs)} cusp` : `${f.sign} decan ${f.decan}`}, birthday number ${f.birthdayNumber}, Life Path by year, Chinese zodiac note and famous birthdays.`.slice(0, 200),
    answer,
    sections: [
      { heading: signHeading, paragraphs: [hook, para(positionLine(f, v), signText)] },
      { heading: numberHeading, paragraphs: [DAY_NUMBER_TEXT[date.day], lifePathLine(f, v)] },
      { heading: contextHeading, paragraphs: [para(MONTH_TEXT[date.month].day, seasonLine(f, v)), para(chineseLine(f, v), famousLine(f, v))] },
    ],
    faq: [
      {
        question: `What zodiac sign is ${f.label}?`,
        answer: f.cusp
          ? `${f.label} is a cusp date. Between 1930 and 2030 the Sun is in ${orNames(f.signs)} on this date depending on the year, the time of birth and the time zone, and in most years at noon UTC it is in ${f.sign}. The zodiac sign calculator settles it for a specific birth date.`
          : `${f.label} is ${f.sign} in every year from 1930 to 2030, wherever you were born. It falls in the ${DECAN_WORDS[f.decan]} decan of ${f.sign}, which tradition links with ${decanRuler(f.sign, f.decan)}.`,
      },
      {
        question: `What is the Life Path number for someone born on ${f.label}?`,
        answer: `It depends on the birth year. On ${f.label} the Life Path is ${list(f.lifePathByYear.map(({ year, lifePath }) => `${lifePath} in ${year}`))}. The birthday number, from the day alone, is ${f.birthdayNumber} for everyone born on the ${date.day}${date.day === 1 || date.day === 21 || date.day === 31 ? "st" : date.day === 2 || date.day === 22 ? "nd" : date.day === 3 || date.day === 23 ? "rd" : "th"}.`,
      },
      {
        question: `What Chinese zodiac sign is someone born on ${f.label}?`,
        answer: chineseLine(f, v + 1),
      },
      ...(f.famous.length ? [{ question: `Which famous people were born on ${f.label}?`, answer: `${famousLine(f, v + 1)} The list comes from Wikidata and favours people with the most Wikipedia articles.` }] : []),
    ],
  };
}

export function buildBirthdayMonth(month: number): PageCopy {
  const name = MONTH_NAMES[month - 1];
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
    .filter((day) => new Date(Date.UTC(2024, month - 1, day)).getUTCMonth() === month - 1)
    .map((day) => birthdayFacts({ month, day }));
  const runs: Array<{ sign: string; from: number; to: number }> = [];
  for (const f of days) {
    const run = runs[runs.length - 1];
    if (run && run.sign === f.sign) run.to = f.day;
    else runs.push({ sign: f.sign, from: f.day, to: f.day });
  }
  const cusps = days.filter((f) => f.cusp).map((f) => f.day);
  const decanRuns: Array<{ sign: string; decan: number; from: number }> = [];
  for (const f of days) {
    const run = decanRuns[decanRuns.length - 1];
    if (!run || run.sign !== f.sign || run.decan !== f.decan) decanRuns.push({ sign: f.sign, decan: f.decan, from: f.day });
  }
  const decanSchedule = `Decan by decan, ${list(decanRuns.map((r, i) => `${i === 0 ? "the month opens in" : `from the ${th(r.from)}`} the ${DECAN_WORDS[r.decan]} decan of ${r.sign}, linked with ${decanRuler(r.sign, r.decan)}`))}.`;
  const famous = days.filter((f) => f.famous.length && f.day % 3 === 1).map((f) => `${f.famous[0].name} (${f.label})`);
  const [first, second] = runs;
  const monthNumber = month === 11 ? 11 : month > 9 ? month - 9 : month;
  const text = MONTH_TEXT[month];

  const signSummary = second
    ? `In most years ${name} birthdays from the 1st to the ${first.to}${first.to === 21 ? "st" : first.to === 22 ? "nd" : first.to === 23 ? "rd" : "th"} are ${first.sign}, and from the ${second.from}${second.from === 21 ? "st" : second.from === 22 ? "nd" : second.from === 23 ? "rd" : "th"} they are ${second.sign}.`
    : `Every ${name} birthday is ${first.sign}.`;
  const cuspSummary = cusps.length
    ? `The cusp dates, where the sign can differ by year or time zone, are ${name} ${list(cusps.map(String))}; each has its own page explaining both possibilities.`
    : "";

  return {
    description: `${name} birthdays: zodiac signs and decans for every day of ${name}, cusp dates, the month's numerology and its Chinese zodiac boundary.`.slice(0, 200),
    answer: fitAnswer(
      `In Western astrology, ${name} birthdays fall under ${second ? `${first.sign} and ${second.sign}` : first.sign}. ${signSummary}`,
      [
        cusps.length ? `${cap(list(cusps.map((d) => `${name} ${d}`)))} ${cusps.length > 1 ? "are cusp dates" : "is a cusp date"}.` : "",
        `In numerology ${name} is month ${month}${monthNumber === month ? "" : `, which reduces to ${monthNumber}`}.`,
        "Each day has its own page below.",
      ].filter(Boolean),
    ),
    sections: [
      { heading: `Zodiac signs and decans in ${name}`, paragraphs: [text.hub[0], para(signSummary, cuspSummary, decanSchedule)] },
      { heading: `${name} birthdays in numerology and the Chinese zodiac`, paragraphs: [text.hub[1], para(`Every page for ${an(name)} date lists the Life Path for several birth years, because the year changes the total even when the day stays the same.`, month <= 2 ? "Those pages also show how many years since 1924 had already reached Lunar New Year by that date." : "")] },
      { heading: `Famous ${name} birthdays`, paragraphs: [para(`Each ${name} page lists the best-known people born on that date, drawn from Wikidata and ranked by how many Wikipedia language editions have an article about them.`, `A sample across the month: ${list(famous)}.`, `Sharing a birthday with someone well known says nothing about a life's direction, but it is a pleasant way into the date's sign, decan and numbers, which each page then explains in turn.`, `The lists favour people with a precisely recorded birth date in the modern Gregorian calendar, so some much-celebrated figures from earlier centuries are missing.`)] },
    ],
    faq: [
      { question: `What zodiac signs are ${name} birthdays?`, answer: `${signSummary} ${cuspSummary}`.trim() },
      { question: `What is the numerology number of ${name}?`, answer: `${name} is month ${month}${monthNumber === month ? "" : `, which reduces to ${monthNumber}`}${month === 11 ? "; 11 is a master number and is kept whole" : ""}. The month is one of three parts of the Life Path calculation, with the day and the year.` },
      { question: `Which Chinese zodiac animal is someone born in ${name}?`, answer: month === 1 ? "Births from January 1 to 20 always take the previous year's animal, because Lunar New Year is never earlier than January 21. From January 21 it depends on that year's Lunar New Year date." : month === 2 ? "February births up to the 20th depend on the year's Lunar New Year date, which falls between January 21 and February 20. From February 21 on, the birth year's own animal applies." : `Lunar New Year has always passed by ${name}, so ${an(name)} birth takes the animal of the calendar birth year.` },
    ],
  };
}

// ---------------------------------------------------------------------------
// Chinese zodiac years
// ---------------------------------------------------------------------------

/** Numerology year numbers: the year's digits reduced, with 11 and 22 kept. */
const YEAR_NUMBER_TEXT: Record<number, string> = {
  1: "In numerology the year's digits reduce to 1, the number of beginnings, initiative and independence, so numerologists describe a 1 year as one that rewards starting things.",
  2: "In numerology the year's digits reduce to 2, the number of partnership, patience and diplomacy, and a 2 year is traditionally read as one for cooperation rather than solo pushes.",
  3: "In numerology the digits of this year reduce to 3, associated with expression, creativity and sociability, so a 3 year is described as lively and communicative.",
  4: "In numerology the digits reduce to 4, the number of structure, effort and foundations, which gives a 4 year a reputation for steady, practical work.",
  5: "In numerology the year reduces to 5, the number of change, freedom and movement, and a 5 year is usually described as restless and full of variety.",
  6: "In numerology the year's digits come to 6, linked with home, care and responsibility, so a 6 year is read as one centred on family and commitments.",
  7: "In numerology the year reduces to 7, the number of reflection, analysis and inner work, giving a 7 year a quieter, more searching character.",
  8: "In numerology the digits reduce to 8, associated with ambition, authority and material results, so an 8 year is described in terms of effort and reward.",
  9: "In numerology the year reduces to 9, the number of completion, generosity and letting go, and a 9 year is traditionally read as one of endings that clear space.",
  11: "In numerology the digits of this year add up to 11, a master number kept whole, linked with intuition, inspiration and nervous intensity.",
  22: "In numerology the year's digits add up to 22, the master builder's number, kept whole and associated with large, practical plans.",
};

const digitSum = (year: number) => String(year).split("").reduce((sum, d) => sum + Number(d), 0);

export function buildZodiacYear(year: number): PageCopy {
  const y = zodiacYearFacts(year);
  const slug = elementAnimalSlug(y.element, y.animal);
  const cycle = Math.floor((year - 1924) / 60); // 0: 1924-1983, 1: 1984-2043, 2: 2044
  const branch = ANIMAL_BRANCHES[y.animal];
  const others = elementAnimalYears(y.element, y.animal).filter((other) => other !== year);
  const position = (ANIMALS as readonly string[]).indexOf(y.animal);
  const n = universalYear(year);
  const relation = stemToFixed(y.element, branch.element);

  const datesParagraph = pick([
    para(
      `The ${year} ${y.element} ${y.animal} year began at Lunar New Year on ${y.start} and lasted until ${y.end}, the day before the next new year.`,
      `Anyone born between January 1 and ${y.startShort} ${year} therefore belongs to the ${y.previous.element} ${y.previous.animal} year that started in ${year - 1}, while someone born in early ${year + 1}, up to ${y.endShort}, is still a ${y.element} ${y.animal}.`,
      `The Chinese calendar is lunisolar, which is why the start date moves between January 21 and February 20 instead of staying on January 1.`,
      others.length ? `The same ${y.element} ${y.animal} combination also falls in ${list(others.map(String))}, sixty years apart, because five elements and twelve animals realign only once in each sixty-year cycle.` : "",
    ),
    para(
      `Lunar New Year opened the ${y.element} ${y.animal} year on ${y.start}, and the year ran to ${y.end}.`,
      `So a birth date of ${y.startShort}, ${year} or later counts as ${y.element} ${y.animal}, and so do early ${year + 1} birthdays through ${y.endShort}; births in ${year} before ${y.startShort} still belong to the ${y.previous.element} ${y.previous.animal}.`,
      `That moving boundary comes from the lunisolar calendar, in which the new year starts with the second new moon after the winter solstice in most years, so its Gregorian date shifts by up to a month from one year to the next.`,
      others.length ? `Look sixty years either side and the pairing repeats: ${list(others.map(String))} are ${y.element} ${y.animal} years too.` : "",
    ),
    para(
      `The ${y.element} ${y.animal} year of ${year} started on ${y.start}, when Lunar New Year arrived, and ended on ${y.end}.`,
      `Births from New Year's Day to the day before ${y.startShort} fall in the ${y.previous.element} ${y.previous.animal} year instead, and births in ${year + 1} up to ${y.endShort} remain ${y.element} ${y.animal}.`,
      `Because the year follows the moon, its start can be as early as January 21 or as late as February 20, and anyone with a birthday in that window should check the exact date rather than rely on the calendar year.`,
      others.length ? `Earlier ${y.element} ${y.animal} years in the table are ${list(others.map(String))}; the combination comes round once every sixty years.` : "",
    ),
  ], cycle);

  const dayLine = pick([
    `Lunar New Year ${year} fell on a ${y.weekday}, while the Western Sun was in ${y.sunSign}.`,
    `That ${y.weekday} new year arrived with the Sun in ${y.sunSign} in the Western zodiac.`,
    `New year's day was a ${y.weekday}, and the Sun stood in ${y.sunSign}.`,
  ], cycle);
  const nameLine = pick([
    `In the traditional sexagenary count the year is called ${y.stemBranch}: ${y.stemBranch.split("-")[0]} is the ${y.element} heavenly stem and ${y.stemBranch.split("-")[1]} is the ${y.animal}'s earthly branch. Stems and branches alternate between yang and yin together, which is why ${y.yinYang.toLowerCase()} stems only ever meet ${y.yinYang.toLowerCase()} animals.`,
    `Chinese almanacs name ${year} ${y.stemBranch}, pairing the ${y.element} stem ${y.stemBranch.split("-")[0]} with the branch ${y.stemBranch.split("-")[1]}. Both are ${y.yinYang}, as stem and branch always share a polarity, so of the hundred and twenty possible pairings only sixty ever occur, and each one names a single year in every cycle.`,
    `Its stem-branch name is ${y.stemBranch}, the ${y.element} stem ${y.stemBranch.split("-")[0]} joined to the ${y.animal}'s branch ${y.stemBranch.split("-")[1]}, both of them ${y.yinYang}. The same name was used for ${year - 60} and comes back in ${year + 60}, which is how the traditional calendar counts its sixty-year cycles without numbering the years.`,
  ], cycle);

  const personality = cycle < 2
    ? [YEAR_SUMMARY[slug][cycle], STEM_ELEMENT_TEXT[y.element as keyof typeof STEM_ELEMENT_TEXT].character[cycle]]
    : [ELEMENT_ANIMAL_TEXT[slug][1], STEM_ELEMENT_TEXT[y.element as keyof typeof STEM_ELEMENT_TEXT].work];

  const cycleParagraph = para(
    YEAR_NUMBER_TEXT[n],
    `The digits of ${year} add up to ${digitSum(year)}${digitSum(year) === n ? "" : `, which reduces to ${n}`}.`,
    pick([
      `In the twelve-year cycle the ${y.animal} is the ${ORDINALS[position]} animal, earthly branch ${branch.branch}, with ${branch.element} as its fixed element and ${branch.yinYang} polarity. The year element is ${y.element}, and in the five-element cycles ${lower(relation.description)}.`,
      `The ${y.animal} holds the ${ORDINALS[position]} place among the twelve animals and its fixed element is ${branch.element}. Set beside the year's ${y.element} stem, ${lower(relation.description)}, which readings use to describe how settled or stretched the combination feels.`,
      `Among the twelve branches the ${y.animal} comes ${ORDINALS[position]}, a ${branch.yinYang} animal whose fixed element is ${branch.element}. Paired with a ${y.element} year, ${lower(relation.description)}.`,
    ], cycle),
    `The year before was the ${y.previous.element} ${y.previous.animal} and the year after is the ${y.next.element} ${y.next.animal}.`,
  );

  return {
    description: `${year} is the Year of the ${y.element} ${y.animal} in the Chinese zodiac, from ${y.start} to ${y.end}. Personality, Lunar New Year dates and numerology.`.slice(0, 200),
    answer: fitAnswer(
      `In Chinese astrology, ${year} is the Year of the ${y.element} ${y.animal}, a ${y.yinYang} year. It began at Lunar New Year on ${y.start} and ended on ${y.end}, so people born in ${year} before ${y.startShort} belong to the ${y.previous.element} ${y.previous.animal} year.`,
      [`The ${y.element} ${y.animal} returns every sixty years.`, "Each year starts at Lunar New Year, not January 1."],
    ),
    sections: [
      { heading: pick([`When the ${year} ${y.element} ${y.animal} year starts and ends`, `${year} Lunar New Year: start and end dates`, `Dates of the ${year} ${y.animal} year`], cycle), paragraphs: [para(datesParagraph, dayLine)] },
      { heading: pick([`${y.element} ${y.animal} personality`, `What the ${y.element} ${y.animal} is like`, `The ${year} ${y.element} ${y.animal} character`], cycle), paragraphs: personality },
      { heading: pick([`${year} in numerology and the twelve-year cycle`, `${year} in the animal cycle and in numerology`, `The ${year} year number and branch`], cycle), paragraphs: [cycleParagraph, nameLine] },
    ],
    faq: [
      { question: `What Chinese zodiac is ${year}?`, answer: `${year} is the Year of the ${y.element} ${y.animal}. It started on ${y.start} and ended on ${y.end}.` },
      { question: `What if I was born in January or February ${year}?`, answer: `Check the date against ${y.startShort}. Born before ${y.start}, you are a ${y.previous.element} ${y.previous.animal}; born on or after it, you are a ${y.element} ${y.animal}.` },
      { question: `What element is ${year} in the Chinese zodiac?`, answer: `${y.element}, a ${y.yinYang} year. The ${y.animal}'s own fixed element is ${branch.element}; the year element changes every two years, while the fixed element stays with the animal.` },
      { question: `What is the traditional Chinese name for ${year}?`, answer: `${y.stemBranch}. The first part is the heavenly stem, which carries the year's element and polarity; the second is the earthly branch, which carries the animal. Almanacs, calendars and Four Pillars charts identify years this way rather than by animal alone.` },
      { question: `When is the next ${y.element} ${y.animal} year?`, answer: `${year + 60}, sixty years later, when the five elements and twelve animals line up again${others.length ? `; the table also has ${list(others.map(String))}` : ""}.` },
    ],
  };
}

// ---------------------------------------------------------------------------
// Element-animal pages
// ---------------------------------------------------------------------------

export function buildElementAnimal(element: string, animal: string): PageCopy {
  const slug = elementAnimalSlug(element, animal);
  const text = ELEMENT_ANIMAL_TEXT[slug];
  const stem = STEM_ELEMENT_TEXT[element as keyof typeof STEM_ELEMENT_TEXT];
  const branch = ANIMAL_BRANCHES[animal];
  const years = elementAnimalYears(element, animal).map(zodiacYearFacts);
  const position = (ANIMALS as readonly string[]).indexOf(animal);
  const relation = stemToFixed(element, branch.element);
  const mates = trineOf(animal).filter((a) => a !== animal);
  const gist = ANIMAL_COPY[animal].gist;
  const v = position + ["Wood", "Fire", "Earth", "Metal", "Water"].indexOf(element);
  const early = years.find((y) => LUNAR_NEW_YEAR_DATES[y.year].month === 2) ?? years[0];

  const yearsParagraph = para(
    pick([
      `Between 1924 and 2044 the ${element} ${animal} years are ${list(years.map((y) => `${y.year} (${y.start} to ${y.end})`))}.`,
      `${element} ${animal} years in the Lunar New Year table run ${list(years.map((y) => `from ${y.start} to ${y.end}`))}.`,
      `The table from 1924 to 2044 holds ${years.length} ${element} ${animal} years: ${list(years.map((y) => `${y.year}, starting ${y.startShort}`))}.`,
    ], v),
    `Because the year begins at Lunar New Year, a birthday in January or early February needs checking: in ${early.year} anyone born before ${early.startShort} is a ${early.previous.element} ${early.previous.animal}, not a ${element} ${animal}.`,
    pick([
      `The combination returns every sixty years, since five elements cycle through twelve animals and only meet the same pairing again after five rounds of the zodiac.`,
      `Sixty years separate each ${element} ${animal} year, the length of a full round of five elements and twelve animals.`,
      `It takes sixty years for the ${element} stem and the ${animal} branch to coincide again, which is why the same pairing marks grandparents and grandchildren rather than siblings.`,
    ], v),
    `Every ${element} ${animal} year is ${branch.yinYang}, matching the ${animal}'s own polarity.`,
  );
  const stemBranch = stemBranchName(element, animal);
  const namesParagraph = para(
    pick([
      `Chinese almanacs call the combination ${stemBranch}, joining the heavenly stem ${stemBranch.split("-")[0]} to the earthly branch ${stemBranch.split("-")[1]}.`,
      `Its traditional name is ${stemBranch}: ${stemBranch.split("-")[0]} is the ${branch.yinYang.toLowerCase()} ${element} stem and ${stemBranch.split("-")[1]} is the ${animal}'s branch.`,
      `In the sexagenary calendar this is the ${stemBranch} year, the ${element} stem ${stemBranch.split("-")[0]} with the ${animal}'s branch ${stemBranch.split("-")[1]}.`,
    ], v),
    `Births just before each new year fall in ${list(years.map((y) => `the ${y.previous.element} ${y.previous.animal} year (before ${y.start})`))}, and births in the weeks after each ${element} ${animal} year ends belong to the ${years[0].next.element} ${years[0].next.animal}.`,
    `The new year itself fell on a ${list(years.map((y) => `${y.weekday} in ${y.year}`))}.`,
  );

  const compatibility = para(
    `For relationships, the classical structures belong to the animal rather than the element, so the ${element} ${animal} shares the ${animal}'s San He trine with the ${list(mates)} (the ${trineElement(animal)} trine), its Liu He bond with the ${liuHeOf(animal)}, and its Liu Chong clash with the ${liuChongOf(animal)}.`,
    `The element adds a second layer: another ${element} sign shares this year element, while partners whose year element feeds ${element} in the generating cycle are often described as supportive.`,
  );

  return {
    description: `The ${element} ${animal} in Chinese astrology: personality, ${element} element traits, ${list(years.map((y) => String(y.year)))} dates and compatibility.`.slice(0, 200),
    answer: fitAnswer(
      `In Chinese astrology, the ${element} ${animal} is the ${animal} born in a ${element} year, one of five versions of the ${ORDINALS[position]} animal. It combines the ${animal}'s ${gist.split(",")[0]} with ${element}'s qualities. ${element} ${animal} years between 1924 and 2044 are ${list(years.map((y) => String(y.year)))}.`,
      [`The ${animal}'s fixed element is ${branch.element}.`, "Each year starts at Lunar New Year."],
    ),
    sections: [
      // Animals in the second half of the cycle take the other wording, so same-element pages differ.
      { heading: `The ${element} ${animal} personality`, paragraphs: [text[0], stem.character[position < 6 ? 0 : 1]] },
      { heading: `${element} ${animal} at work and in love`, paragraphs: [stem.work, ELEMENT_ANIMAL_LIFE[slug]] },
      { heading: `${element} ${animal} years and dates`, paragraphs: [yearsParagraph, namesParagraph] },
      { heading: `Growth edges and compatibility for the ${element} ${animal}`, paragraphs: [text[1], compatibility] },
    ],
    faq: [
      { question: `What years are ${element} ${animal} years?`, answer: `Between 1924 and 2044: ${list(years.map((y) => `${y.year} (from ${y.start})`))}. Each lasts until the day before the next Lunar New Year.` },
      { question: `What is the ${element} ${animal}'s element relationship?`, answer: `The year element is ${element} and the ${animal}'s fixed element is ${branch.element}; in the five-element cycles ${lower(relation.description)}. Readings use that relationship to describe how easily the two sides of the sign sit together.` },
      { question: `Which animals are most compatible with the ${element} ${animal}?`, answer: `Traditionally the ${list(mates)} (San He) and the ${liuHeOf(animal)} (Liu He). The ${liuChongOf(animal)} is the Liu Chong clash. These pairings depend on the animal, whatever the element.` },
      { question: `What is the ${element} ${animal} called in the Chinese calendar?`, answer: `${stemBranch}. In almanacs and Four Pillars charts each year is named by its heavenly stem, here the ${element} stem ${stemBranch.split("-")[0]}, followed by its earthly branch, here ${stemBranch.split("-")[1]} for the ${animal}, so the name pins down both halves of the combination at once.` },
      { question: `How is the ${element} ${animal} different from other ${animal}s?`, answer: `All ${animal}s share ${gist}. The ${element} year element changes the tone: ${lower(stem.character[0].split(/(?<=\.)\s/)[0])}` },
    ],
  };
}

// ---------------------------------------------------------------------------
// New hubs
// ---------------------------------------------------------------------------

export const DATE_HUB_COPY: Record<string, PageCopy> = {
  birthday: {
    description: "Birthday meanings for all 366 days: Sun sign and decan, cusp dates, birthday number, Life Path by birth year, Chinese zodiac notes and famous birthdays.",
    answer: "In Western astrology, your birthday sets your Sun sign and decan, and in numerology the day gives a birthday number while the full date gives the Life Path. These pages cover every date of the year, including February 29, with cusp dates explained and the Chinese zodiac boundary noted.",
    sections: [
      { heading: "What each birthday page shows", paragraphs: ["Every date from January 1 to December 31, February 29 included, has its own page. Each one opens with the Sun sign and the decan, the ten-degree third of the sign the Sun occupies on that day, and names the planet tradition links with that decan as well as the sign's own ruler. The key-facts table gives the Sun's approximate position in degrees, the birthday number, the Life Path for several birth years and a Chinese zodiac note. Each page then adds a short interpretation written for that date alone, followed by the decan's character, the meaning of the day as a number and a note on the month. Famous birthdays come from Wikidata, ranked by how many language editions of Wikipedia have an article about the person, so the names are verifiable rather than recalled. Month pages gather every date in one place, with the dates where the sign changes. Nothing on these pages asks for personal details: the date box beneath each answer works out the Sun sign, Life Path and Chinese animal inside your browser, and only carries the date forward if you choose to open the free preview."] },
      { heading: "Cusp dates and why some birthdays have two signs", paragraphs: ["The Sun does not enter each sign on the same calendar date every year. Leap years, the length of the tropical year and the time zone of the birth all move the change by a day or so, which is why fixed date ranges on many websites are slightly wrong at the edges. These pages work from the Sun's calculated position for every year from 1930 to 2030 and for every time zone, from fourteen hours ahead of Greenwich to twelve hours behind. A date counts as a cusp when the Sun can be in either of two signs on it, and its page names both. In astrology a cusp is not a third sign: you have one Sun sign, and the birth year, time and place decide which. Many people born on these dates still recognise something of both neighbours, and the cusp pages describe that blend as a tendency rather than a rule. Southern hemisphere readers should note that the seasonal imagery traditionally attached to each sign comes from northern latitudes, where Aries arrives with spring; the signs themselves are measured from the equinox, not the weather."] },
      { heading: "Birthday number and Life Path", paragraphs: ["Numerology reads two numbers from a birth date. The birthday number comes from the day of the month alone: the 21st gives 2 + 1 = 3, and the 29th gives 2 + 9 = 11, which is a master number and stays whole, as do the 11th and the 22nd. Everyone born on the same day of any month shares it, so it is treated as a secondary number describing a particular talent or style. The Life Path uses the month, day and year together, each reduced separately and then combined, so two people with the same birthday but different birth years usually have different Life Paths. That is why each birthday page lists the Life Path for several years, from 1960 to 2020, rather than claiming one number for the date. The Life Path calculator works it out for any full birth date and explains each step of the reduction, so you can check the arithmetic yourself."] },
      { heading: "Reading a birthday page well", paragraphs: ["A birthday page describes everyone born on one date, which is a large and varied group, so treat it as a sketch rather than a portrait. The Sun sign speaks to conscious identity and vitality, the decan narrows that down to a particular flavour, and the birthday number adds a secondary talent. None of them accounts for the Moon, the rising sign or the houses, which move far faster and need a birth time and place, and none of them knows your circumstances. The most useful way to read a page is to notice which descriptions ring true, which feel foreign, and what that contrast suggests about where you are now. Some readers keep notes over several years and find their reactions change with age and life stage. A Unified Reading takes the same approach further, setting your full numerology profile, Western placements and Chinese animal side by side and adapting the interpretation to the stage of life you select, from exploring options to raising a family or stepping back from work."] },
      { heading: "The Chinese zodiac and January and February birthdays", paragraphs: ["The Chinese zodiac follows the lunar year, which starts at Lunar New Year rather than on January 1. Lunar New Year falls between January 21 and February 20, so the animal for a birthday in that window depends on the year. Each January and February page says how many years between 1924 and 2044 had already reached the new year by that date, and the year pages give the exact start and end of every Chinese year in that range. Birthdays from January 1 to January 20 always belong to the previous year's animal, and from February 21 onwards the birth year's own animal always applies. Twins born either side of midnight, or travellers born mid-flight, are rare edge cases worth checking against an exact chart. Adopted people and anyone unsure of an official registration date often find the cusp explanations especially helpful, because they show exactly which detail would change the answer. A Unified Reading combines these traditions with the life stage you choose, showing where your Sun sign, your numbers and your Chinese animal agree and where they pull in different directions, and the free preview needs nothing more than a name and a birth date."] },
    ],
    faq: [
      { question: "Why does my birthday have two possible zodiac signs?", answer: "Because it is a cusp date. The Sun changes sign at a slightly different moment each year, so on some dates the sign depends on the year, time and place of birth. The zodiac sign calculator settles it for your exact date." },
      { question: "What is a birthday number in numerology?", answer: "It is the day of the month reduced to a single digit, keeping 11 and 22. It is read as a secondary number beside the Life Path, which uses the full date of birth." },
      { question: "Is there a page for February 29?", answer: "Yes. February 29 has its own page, with the Life Path listed for leap years only and its Sun sign and decan calculated for the years that have that date." },
      { question: "Do people born on the same day have the same personality?", answer: "No. They share a Sun sign and decan in most years and the same birthday number, but their Moon, rising sign, houses, Life Path and Chinese animal can all differ, quite apart from upbringing, culture and choices. A birthday page describes a shared starting point, not a common fate." },
      { question: "Where do the famous birthdays come from?", answer: "From Wikidata, the open database behind Wikipedia. Each date lists the best-known people with a recorded birth date on that day, ranked by the number of Wikipedia language editions with an article about them." },
    ],
  },
  "chinese-zodiac-years": {
    description: "Every Chinese zodiac year from 1924 to 2044 with its animal, element, yin-yang and exact Lunar New Year start and end dates, plus all sixty element-animal combinations.",
    answer: "In Chinese astrology, each year has an animal, an element and a polarity, and it begins at Lunar New Year rather than January 1. This table covers every year from 1924 to 2044, with the exact start and end date of each, and links to all sixty element and animal combinations.",
    sections: [
      { heading: "How to find your Chinese zodiac year", paragraphs: ["Find your birth year below, grouped by decade, and open its page. If your birthday is between January 1 and February 20, compare it with the Lunar New Year date on that page: born before it, you belong to the previous year, so a birth on January 20, 1990 is an Earth Snake rather than a Metal Horse, because the 1990 year began on January 27. From February 21 onwards the calendar year and the zodiac year always agree. Each year page states the start date, the last day of the year, the animal born before the new year, the animal's fixed element and the year's numerology number. The Chinese zodiac calculator does the same check automatically for any date in the table, which runs from the Wood Rat of 1924 to the Wood Rat of 2044, three full turns of the Rat across the sixty-year cycle, so every combination appears at least twice."] },
      { heading: "Animals, elements and the sixty-year cycle", paragraphs: ["Two cycles run together in the Chinese calendar. The twelve animals, or earthly branches, turn once every twelve years, from Rat to Pig. The ten heavenly stems pair the five elements, Wood, Fire, Earth, Metal and Water, with yang and yin, so each element covers two consecutive years, a yang year and then a yin year. Because a yang stem always meets a yang animal, only sixty of the possible combinations occur, and each returns every sixty years: the Metal Horse of 1930 comes back in 1990 and again in 2050. Each animal also has a fixed element of its own, which never changes, so a Metal Horse carries Metal from its year and Fire from the Horse. Readings use the meeting of those two elements, whether one feeds the other or keeps it in check, to describe how comfortable a particular combination feels, and each element-animal page explains its own pairing."] },
      { heading: "Year element, fixed element and polarity", paragraphs: ["It helps to keep three layers apart. The year element comes from the heavenly stem and changes every two years, so 1990 and 1991 are both Metal years even though one is a Horse and the other a Goat. The fixed element belongs to the animal and never changes: the Rat is always Water, the Tiger always Wood, the Horse always Fire, whatever the year. Polarity alternates every single year, yang then yin, and stem and branch always share it, which is why the Horse is only ever paired with yang stems. When people say they are a Fire Horse or a Water Rabbit they mean the year element plus the animal. Practitioners of Four Pillars astrology go further, building a chart from the stems and branches of the birth year, month, day and hour, which is why a full Chinese chart needs a birth time as well as a date. Unified Reading uses the year layer, which is the one most people know and the one printed on calendars, red envelopes and festival decorations each spring. Shops, banks and families across Singapore, Malaysia, Taiwan and the diaspora decorate with the coming animal weeks ahead of the holiday."] },
      { heading: "Using these pages with other systems", paragraphs: ["A Chinese year page gives the broad character of a whole birth cohort, much as a generation label does, and grandparents, parents and children rarely share one, so on its own it says little about one individual. Combined with a Western Sun sign and a numerology Life Path it becomes more specific, and the places where the systems echo or contradict one another are often the most interesting part. A Water Rabbit who is also a Pisces Sun and a Life Path 2, for instance, collects three separate descriptions of sensitivity and tact, while a Metal Ox with a Gemini Sun and a Life Path 5 holds a clear tension between persistence and appetite for change. Each year page links to its element-animal page, its animal's general profile and the neighbouring years, and every January and February birthday page says how often Lunar New Year had already arrived by that date. A Unified Reading brings these threads together for one person, with interpretation adapted to their current stage of life."] },
      { heading: "Why Lunar New Year moves", paragraphs: ["The traditional Chinese calendar is lunisolar. Its months follow the phases of the moon, while leap months keep the year roughly in step with the seasons. Lunar New Year usually falls on the second new moon after the winter solstice, which places it between January 21 and February 20 in the Gregorian calendar. A year with a leap month runs to about 384 days and the following new year comes late; an ordinary lunar year is about 354 days and the next new year comes early. That is why the start dates on these pages jump around: January 27 in 1990, February 15 in 1991 and February 4 in 1992. Since 1929 the calendar has been computed for China Standard Time, eight hours ahead of Greenwich, so a new moon arriving just before or after midnight there decides the date for everyone, wherever they happen to live or celebrate. Some traditions, including the Four Pillars system, start the year at Lichun around February 4 instead, so a few early-February birthdays can be read differently depending on the method. This library and the Unified Reading calculator follow Lunar New Year. Vietnamese, Korean and other East Asian calendars share the same new moon in most years, though Vietnam's Tet occasionally falls a day apart and substitutes the Cat for the Rabbit."] },
    ],
    faq: [
      { question: "What Chinese zodiac year is it in 2026?", answer: "2026 is the Year of the Fire Horse, which began at Lunar New Year on February 17, 2026. People born in 2026 before that date belong to the Wood Snake year that started in 2025." },
      { question: "Why is my Chinese zodiac different from my birth year's animal?", answer: "If you were born in January or early February before that year's Lunar New Year, your animal is the previous year's. The year page for your birth year shows the exact date." },
      { question: "How many element and animal combinations are there?", answer: "Sixty. Each of the twelve animals appears with five elements, because yang stems only pair with yang animals and yin stems with yin animals, and each combination returns every sixty years." },
      { question: "Which years are Fire Horse years?", answer: "In this table, 1966 and 2026. The Fire Horse has a particular reputation in Japanese and Chinese folklore as headstrong and passionate; 1906 was the previous one and 2086 will be the next, sixty years apart in each case." },
      { question: "Does the Chinese zodiac year start on February 4?", answer: "Not in the system used here. The zodiac year starts at Lunar New Year. Some Four Pillars practitioners use Lichun, around February 4, which can change the animal for a few early-February births." },
    ],
  },
};
