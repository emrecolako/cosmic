/**
 * Expression, Soul Urge, Personality, Birthday number, Personal Year and
 * angel-number pages, plus the /angel-numbers hub. Prose comes from the files
 * typed in number-pages.ts; worked examples, reductions, Personal Year counts
 * and personal months come from lib/library/number-facts.ts.
 */
import { MONTH_NAMES } from "../../../lib/library/calendar";
import { lifePathMeaning } from "../../../lib/library/facts";
import { angelFacts, nameExample, nameTitle, personalYearFacts, reductionChain } from "../../../lib/library/number-facts";
import { MASTER_ROOTS, type NameNumberKind } from "../../../lib/library/registry";
import { reduceToSingleDigit } from "../../../lib/numerology";
import { ANGEL_PAGES } from "./angel-pages";
import { BIRTHDAY_NUMBER_PAGES_1 } from "./birthday-number-pages-1";
import { BIRTHDAY_NUMBER_PAGES_2 } from "./birthday-number-pages-2";
import { EXPRESSION_PAGES } from "./expression-pages";
import type { PageCopy } from "./index";
import type { NumberPageCopy } from "./number-pages";
import { PERSONAL_YEAR_2026 } from "./personal-year-2026";
import { PERSONAL_YEAR_2027 } from "./personal-year-2027";
import { PERSONALITY_PAGES } from "./personality-pages";
import { SOUL_URGE_PAGES } from "./soul-urge-pages";
import { fitAnswer, list, para } from "./util";

const NAME_PAGES: Record<NameNumberKind, Record<number, NumberPageCopy>> = { expression: EXPRESSION_PAGES, "soul-urge": SOUL_URGE_PAGES, personality: PERSONALITY_PAGES };
const BIRTHDAY_NUMBER_PAGES: Record<number, NumberPageCopy> = { ...BIRTHDAY_NUMBER_PAGES_1, ...BIRTHDAY_NUMBER_PAGES_2 };
const PERSONAL_YEARS = { 2026: PERSONAL_YEAR_2026, 2027: PERSONAL_YEAR_2027 } as const;

const KIND: Record<NameNumberKind, { name: string; also: string; letters: string; reads: string }> = {
  expression: { name: "Expression number", also: "also called the Destiny number", letters: "every letter of the full birth name", reads: "natural talents and the way a person expresses themselves" },
  "soul-urge": { name: "Soul Urge number", also: "also called the Heart's Desire", letters: "the vowels of the full birth name", reads: "inner motivation and what a person privately longs for" },
  personality: { name: "Personality number", also: "sometimes called the outer self", letters: "the consonants of the full birth name", reads: "the impression a person makes before others know them well" },
};
const th = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;
const digitSum = (n: number) => String(n).split("").reduce((sum, d) => sum + Number(d), 0);

export function buildNameNumber(kind: NameNumberKind, n: number): PageCopy {
  const copy = NAME_PAGES[kind][n];
  const k = KIND[kind];
  const meaning = nameTitle(kind, n);
  const example = nameExample(kind, n);
  const root = MASTER_ROOTS[n];
  const exampleParagraph = example
    ? para(
        `To see the arithmetic, take the fictional name ${example.name}. The ${k.name} uses ${k.letters}, so the letters counted are ${example.letters}.`,
        `Their Pythagorean values, ${example.values.join(" + ")}, total ${example.total}, and ${example.total === n ? `that is already ${root ? "a master number, kept whole" : "a single digit"}` : `reducing gives ${reductionChain(example.total)}`}.`,
        root ? `Because ${n} is a master number it is never reduced to ${root}, though its root still colours the reading.` : "",
        `Calculators can disagree at the margins, for instance over whether Y counts as a vowel or which name to use after marriage, so this site always works from the full birth name and treats Y as a consonant.`,
      )
    : "";

  return {
    description: `${k.name.replace(" number", "")} number ${n} meaning in numerology: ${meaning.title}, strengths, challenges, love, work and how to calculate it from a birth name.`.slice(0, 200),
    answer: fitAnswer(
      `In numerology, the ${k.name} ${n}, ${k.also}, comes from ${k.letters} and is traditionally titled ${meaning.title}. It is read as ${copy.gist}.`,
      [`The ${k.name} describes ${k.reads}.`, root ? `As a master number, ${n} is kept whole rather than reduced to ${root}.` : "It sits beside the Life Path, which comes from the birth date.", "Read it as a tendency, not a verdict."],
    ),
    sections: [
      { heading: `What ${k.name} ${n} means`, paragraphs: copy.meaning },
      { heading: `${k.name} ${n} strengths and challenges`, paragraphs: [copy.strengths, copy.challenges] },
      { heading: `${k.name} ${n} in love and at work`, paragraphs: [copy.love, copy.work] },
      { heading: `How ${k.name} ${n} is calculated, and how to grow with it`, paragraphs: [exampleParagraph, copy.growth].filter(Boolean) },
    ],
    faq: [
      ...copy.faq,
      { question: `How do I calculate my ${k.name}?`, answer: `Write out your full birth name, give each letter its Pythagorean value (A J S = 1 through I R = 9), add up ${k.letters.replace("the full birth name", "it").replace("of the full birth name", "")} and reduce the total to one digit, keeping 11, 22 and 33 whole.` },
    ],
  };
}

export function buildBirthdayNumber(day: number): PageCopy {
  const copy = BIRTHDAY_NUMBER_PAGES[day];
  const reduced = reduceToSingleDigit(day);
  const months = MONTH_NAMES.filter((_, i) => new Date(Date.UTC(2024, i, day)).getUTCMonth() === i);
  const reduction = day < 10
    ? `${day} is already a single digit, so the number stands as it is`
    : day === 11 || day === 22
      ? `${day} is a master number and stays whole`
      : `${String(day).split("").join(" + ")} = ${reductionChain(digitSum(day))}`;
  const rootTitle = lifePathMeaning(reduced).title;
  const sameRoot = Array.from({ length: 31 }, (_, i) => i + 1).filter((d) => d !== day && reduceToSingleDigit(d) === reduced);

  const calcParagraph = para(
    `The Birthday number uses the day of the month only: ${reduction}.`,
    day >= 10 && day !== 11 && day !== 22 && day % 10 !== 0 ? `Read as a pair, the ${String(day)[0]} leads and the ${String(day)[1]} follows.` : "",
    day >= 10 && day !== 11 && day !== 22 ? `Numerologists still read the full ${day} as a compound, so it carries something of each digit as well as its root ${reduced}, the number tradition calls ${rootTitle}.` : `Its root theme is ${rootTitle}, the same name the Life Path ${reduced} carries.`,
    `${months.length === 12 ? "Every month has" : `${list(months)} have`} a ${th(day)}, and each of those birthdays has its own page linked below.`,
    sameRoot.length
      ? `The other days of the month that share the root ${reduced} are the ${list(sameRoot.map(th))}; comparing them shows how one root reads differently in each compound.`
      : `No other day of the month carries the master number ${day} unreduced, which is part of why numerologists single it out.`,
  );

  return {
    description: `Birthday number ${day} in numerology: what being born on the ${th(day)} of any month means, its reduction to ${reduced}, strengths, challenges, love and work.`.slice(0, 200),
    answer: fitAnswer(
      `In numerology, the Birthday number ${day} belongs to everyone born on the ${th(day)} of any month. ${day >= 10 && day !== 11 && day !== 22 ? `It reduces as ${String(day).split("").join(" + ")} = ${reductionChain(digitSum(day))}, and` : "It"} is read as ${copy.gist}.`,
      ["It is a secondary number beside the Life Path, which uses the full date.", "Read it as a tendency, not a verdict."],
    ),
    sections: [
      { heading: `What Birthday number ${day} means`, paragraphs: copy.meaning },
      { heading: `Strengths and challenges of the ${th(day)}`, paragraphs: [copy.strengths, copy.challenges] },
      { heading: `Born on the ${th(day)}: love and work`, paragraphs: [copy.love, copy.work] },
      { heading: `How the ${th(day)} is calculated, and growth`, paragraphs: [calcParagraph, copy.growth] },
    ],
    faq: [
      ...copy.faq,
      { question: `Which birthdays have the Birthday number ${day}?`, answer: `Everyone born on ${list(months.map((m) => `${m} ${day}`))}. The month and year change the Life Path, the Sun sign and the Chinese animal, but the Birthday number stays ${day} for all of them.` },
      { question: `What is the difference between a Birthday number and a Life Path?`, answer: `The Birthday number comes from the day alone, so everyone born on the ${th(day)} shares ${day}. The Life Path adds the month and year, so it differs between people born on the same day, and numerologists treat it as the main number.` },
    ],
  };
}

export function buildPersonalYear(n: number, year: 2026 | 2027): PageCopy {
  const copy = PERSONAL_YEARS[year][n];
  const f = personalYearFacts(n, year);
  const universalNote = year === 2026 ? `${year} reduces to 1, a universal year of beginnings` : `${year} reduces to 11, a master universal year linked with intuition and inspiration`;
  const monthRuns = MONTH_NAMES.map((name, i) => `${name} ${f.months[i]}`);

  const whoParagraph = para(
    `The Personal Year adds three reduced parts: the birth month, the birth day and the calendar year, where ${f.universalSteps}.`,
    `In ${year}, ${f.count} of the 366 possible birthdays reach Personal Year ${n}, among them ${list(f.examples)}.`,
    year === 2026
      ? `A universal 1 year is traditionally read as a collective reset, with new institutions, fresh starts and a general appetite for beginnings colouring everyone's personal cycle.`
      : `A universal 11 year is traditionally read as heightened: inspiration runs high, nerves can run thin, and intuition carries extra weight in everyone's personal cycle.`,
    `The cycle in this app runs from January to December, so the theme covers the whole calendar year rather than starting on the birthday.`,
    `Within it, each month has a personal month number, the Personal Year plus the calendar month, reduced: ${list(monthRuns)}.`,
    `Months that echo ${n} tend to bring its theme into focus, while the others add their own colour.`,
    `Following one birthday through the cycle: for ${f.examples[0]}, ${year - 1} was a Personal Year ${f.neighbours.previous} and ${year + 1} becomes a Personal Year ${f.neighbours.next}, so the ${n} sits between those two chapters.`,
  );

  return {
    description: `Personal Year ${n} in ${year}: ${f.title.title}, the year's theme, love, work, what to focus on and release, and the personal months of ${year}.`.slice(0, 200),
    answer: fitAnswer(
      `In numerology, Personal Year ${n} in ${year} is traditionally titled ${f.title.title} and read as a year of ${copy.gist}. ${cap(universalNote)}, which colours every Personal Year in ${year}.`,
      [`In ${year}, ${f.count} of 366 birthdays fall in a Personal Year ${n}.`, "It describes a theme, not a forecast."],
    ),
    sections: [
      { heading: `Personal Year ${n} in ${year}: the theme`, paragraphs: copy.theme },
      { heading: `Love and work in a Personal Year ${n}`, paragraphs: [copy.love, copy.work] },
      { heading: `What to focus on in ${year}, and what to release`, paragraphs: [copy.focus, copy.release] },
      { heading: `Who is in a Personal Year ${n} in ${year}, and the personal months`, paragraphs: [whoParagraph] },
    ],
    faq: [
      copy.faq,
      { question: `How do I calculate my Personal Year for ${year}?`, answer: `Reduce your birth month, your birth day and ${year} (${f.universalSteps}) to single digits, keeping 11 and 22, then add them and reduce again. For example, a ${f.examples[0]} birthday gives Personal Year ${n} in ${year}.` },
      { question: `Which birthdays are in a Personal Year ${n} in ${year}?`, answer: `${f.count} birthdays in all. The earliest in each month ${f.byMonth.length === 1 ? "that has one is" : "are"} ${list(f.byMonth)}${f.byMonth.length < 12 ? `; the remaining months have none, because their reduced month and day cannot add up to ${n} this year` : ""}.` },
      { question: `When does Personal Year ${n} start and end?`, answer: `In this app it runs from January 1 to December 31, ${year}. Some numerologists start the Personal Year on the birthday instead, so the theme can feel as if it arrives a few months later.` },
    ],
  };
}

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function buildAngelNumber(sequence: string): PageCopy {
  const copy = ANGEL_PAGES[sequence];
  const f = angelFacts(sequence);
  const root = lifePathMeaning(f.root);
  const rootParagraph = para(
    `By the Pythagorean method the digits add as ${f.steps}, which links ${sequence} to the number ${f.root}, the number traditional numerology calls ${root.title} and associates with ${list(root.keywords.slice(0, 3))}.`,
    [...new Set(f.digits)].length === 1
      ? `Repetition is usually read as amplification, the single digit turned up until it is hard to ignore.`
      : `Alternating digits are usually read as a dialogue between two numbers, each answering the other.`,
    `Readers who use angel numbers often look at both layers: the repeated digit itself and the root it reduces to, much as a numerologist would read a compound number such as a birthday.`,
  );
  return {
    description: `${sequence} angel number meaning: what people take it to mean, why it keeps appearing, love, work, and its root number ${f.root} in Pythagorean numerology.`.slice(0, 200),
    answer: fitAnswer(
      `In numerology, ${sequence} is popularly read as a sign of ${copy.gist}. Angel numbers are a modern idea rather than classical numerology; by the Pythagorean method its digits add to ${f.total}${f.total === f.root ? "" : `, which reduces to ${f.root}`}, linking it to ${root.title}.`,
      ["Treat it as a prompt for reflection, not a forecast."],
    ),
    sections: [
      { heading: `What ${sequence} means`, paragraphs: copy.meaning },
      { heading: `Why you might keep seeing ${sequence}`, paragraphs: [copy.noticing, rootParagraph] },
      { heading: `${sequence} in love and at work`, paragraphs: [copy.love, copy.work] },
      { heading: `Working with ${sequence}`, paragraphs: [copy.practice, `If ${sequence} keeps catching your eye, the most useful response is usually a question rather than a conclusion: what were you thinking about just then, and what would it look like to act on the theme of ${f.root} this week? The pages for the other sequences and for the ${f.root} itself give more angles, and a short note kept over a few weeks usually shows whether the theme keeps returning or simply faded once noticed.`] },
    ],
    faq: [
      ...copy.faq,
      { question: `Where do people usually notice ${sequence}?`, answer: `Most often on digital clocks, phone lock screens, receipts, licence plates, page numbers, house numbers and flight or platform numbers: places where digits are everywhere and a repeating pattern jumps out. Where you saw it matters less than what you were thinking at the time.` },
      { question: `Is ${sequence} connected to my Life Path number?`, answer: `Only if you choose to read it that way. Your Life Path comes from your birth date, while ${sequence} comes from what you happen to notice. People whose Life Path is ${f.root} often feel the echo is worth a moment's thought; for everyone else it is simply a separate prompt.` },
      { question: `What number does ${sequence} reduce to?`, answer: `${f.steps}. In Pythagorean numerology that root, ${f.root}, is titled ${root.title}, which is why many readings of ${sequence} borrow the themes of ${f.root} as well as of the repeated digit.` },
    ],
  };
}

export const NUMEROLOGY_HUB_COPY: Record<string, PageCopy> = {
  "angel-numbers": {
    description: "Angel numbers explained: what 111, 222, 333, 444, 555, 666, 777, 888, 999, 1111 and 1212 are taken to mean, why repeating numbers stand out, and their numerology roots.",
    answer: "In numerology, angel numbers are repeating sequences such as 111, 444 or 1212 that many people read as nudges to pay attention. The idea is modern rather than classical, but each sequence can be reduced like any number in Pythagorean numerology, which gives it a root theme to reflect on.",
    sections: [
      { heading: "What angel numbers are", paragraphs: ["Angel numbers are repeating or patterned numbers, such as 111, 222 or 1212, that people notice on clocks, receipts, number plates and phone screens and take as a sign worth heeding. The phrase became popular in self-help and spiritual writing from the 1990s onwards, and it is now one of the most searched ideas connected with numerology. It is not part of the classical Pythagorean system, which works with names and birth dates, and the pages here say so plainly. What they offer instead is a grounded way to use the moment: each sequence is linked to the meaning of its digits and to the root number it reduces to, and each page suggests questions to ask yourself rather than events to expect. Many readers find that useful whether they treat the numbers as messages, as coincidences or simply as reminders to stop and check in. Either way, the same honest framing applies to every sequence covered here."] },
      { heading: "Why repeating numbers stand out", paragraphs: ["Human attention is tuned to patterns, and a run of identical digits is about as clean a pattern as everyday life produces. Once a sequence has caught your eye, you are also more likely to spot it again, a familiar effect sometimes called the frequency illusion: the number was always there, but now it registers. None of that makes the experience meaningless. The moment you notice 11:11 or 444 is a natural pause, and what you happen to be thinking about at that instant can be worth writing down. Angel-number readings work best as prompts of that kind. They are poor tools for decisions that need evidence, such as health, money or legal questions, and nothing on these pages should be taken as a warning, a promise or a reason to ignore practical advice from people qualified to give it. Used lightly, though, a repeating number can be a pleasant cue to breathe, look up and ask what matters right now."] },
      { heading: "How each sequence connects to numerology", paragraphs: ["Pythagorean numerology reduces any number by adding its digits until one remains, keeping 11, 22 and 33 whole. Applied to angel numbers, 111 becomes 1 + 1 + 1 = 3, 444 becomes 12 and then 3, 1111 becomes 4, and 1212 becomes 6. Readings therefore look at two layers at once: the repeated digit, such as the independent 1 in 111, and the root it reduces to, such as the expressive 3. The repeated digit is usually treated as the headline, amplified by repetition, and the root as the undertone. Each page below sets out both layers, the common readings for love and work, and a practical way to reflect on the theme. For numbers that belong to you specifically, rather than to the clock, the Life Path, Expression and Personal Year pages are the place to start, because they come from your own birth date and name. Those personal numbers stay the same for life or change on a fixed yearly rhythm, whereas an angel number is whatever happens to catch your attention."] },
      { heading: "A simple way to keep track", paragraphs: ["If a sequence keeps appearing, a lightweight log works better than guessing at its significance in the moment. Note the date, the number, where you saw it and a sentence about what was on your mind. After three or four weeks, read the entries back. Some people find a clear thread, such as a decision they keep circling or a relationship they keep thinking about, and the number has simply become a bookmark for it, like a folded corner in a well-thumbed diary. Others find no pattern at all, which is useful information too. Either outcome is fine, and neither requires believing anything in particular. The point is to turn a fleeting coincidence into a moment of honest reflection, and to let the themes of the root number, from the initiative of 1 to the completion of 9, offer vocabulary rather than instructions. If you would like that kind of reflection grounded in your own birth data, a Unified Reading sets your Life Path, name numbers, Sun sign and Chinese animal side by side and explains where they agree."] },
    ],
    faq: [
      { question: "Are angel numbers part of traditional numerology?", answer: "No. They are a modern popular idea. Classical Pythagorean numerology works with birth names and dates; the angel-number pages borrow its method of reducing digits to give each sequence a root theme." },
      { question: "What should I do when I keep seeing the same number?", answer: "Pause and notice what you were thinking or doing at that moment. Many people keep a short note of these moments and look for themes over a few weeks, which turns a coincidence into a prompt for reflection." },
      { question: "Which angel number is the luckiest?", answer: "None is lucky or unlucky in the tradition the pages draw on. Each sequence carries a theme, from beginnings with 111 to completion with 999, and the useful question is which theme fits what you are living through." },
      { question: "Do angel numbers mean the same thing in every culture?", answer: "No. Number symbolism varies widely: 8 is considered fortunate in Chinese culture because it sounds like prosperity, 4 is often avoided in East Asia, and 13 is unlucky in much of Europe and North America. Angel-number readings mostly follow modern Western spiritual writing." },
      { question: "Is 666 a bad sign?", answer: "Not in numerology. Its digits reduce to 9, and 6 is the number of care and responsibility. Angel-number readings usually treat 666 as a prompt to rebalance attention between practical worries and the people and values that matter." },
    ],
  },
};
