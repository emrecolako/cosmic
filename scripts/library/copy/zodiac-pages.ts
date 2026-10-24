/**
 * Sign, Moon sign, rising sign and decan pages under /zodiac/{slug}. Prose
 * comes from sign-pages-*.ts, moon-pages.ts, rising-pages.ts and
 * decan-pages-*.ts; dates, rulers, dignities and houses are computed.
 */
import { MOON_DIGNITY_LABEL, SIGN_DATES, decanDates, decanRuler, moonDignity, planetName, sign, signAt } from "../../../lib/library/facts";
import { SIGN_ORDER } from "../../../lib/western-astrology";
import { DECAN_PAGES_1 } from "./decan-pages-1";
import { DECAN_PAGES_2 } from "./decan-pages-2";
import type { PageCopy } from "./index";
import { MOON_PAGES } from "./moon-pages";
import { RISING_PAGES } from "./rising-pages";
import { SIGN_PAGES_1 } from "./sign-pages-1";
import { SIGN_PAGES_2 } from "./sign-pages-2";
import { cap, fitAnswer, list, para } from "./util";

const SIGN_PAGES = { ...SIGN_PAGES_1, ...SIGN_PAGES_2 };
const DECAN_PAGES = { ...DECAN_PAGES_1, ...DECAN_PAGES_2 };
const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];
const DECAN_WORDS = ["", "first", "second", "third"];
const HOUSE_THEMES: Array<[number, string]> = [[2, "money and possessions"], [4, "home and roots"], [5, "creativity and romance"], [7, "partnership"], [10, "career and reputation"]];
const lower = (text: string) => text.toLowerCase();

/** What each planet is traditionally said to add when it sub-rules a decan. */
const PLANET_FLAVOUR: Record<string, string> = {
  Sun: "The Sun brings warmth, pride and a need to be seen. Where it sub-rules, astrologers look for generosity, creative confidence and a wish to lead from the front, along with sensitivity to whether effort is noticed and appreciated. Solar decans are often linked with performance, visibility and a strong personal signature, and their usual lesson is to share the stage.",
  Moon: "The Moon adds feeling, memory and responsiveness. Its decans are usually described as more intuitive and more attached to home, family and familiar rhythms, quick to sense a mood in the room and slower to let go of old loyalties. Lunar decans are often linked with caretaking, nostalgia and changeable moods, and their usual lesson is to look after their own needs as carefully as other people's.",
  Mercury: "Mercury lends curiosity, quick wits and a talent for language and detail. Under its influence a sign is said to think aloud, question more, trade information freely and enjoy problems that reward cleverness more than force. Mercurial decans are often linked with writing, trade, teaching and nimble problem-solving, and their usual lesson is to finish what the quick mind starts.",
  Venus: "Venus contributes charm, taste and a pull towards harmony. Its decans tend to be pictured as more sociable and aesthetic, alert to beauty and fairness, and keen to soften conflict through diplomacy, pleasure and good company. Venusian decans are often linked with art, hospitality, partnership and style, and their usual lesson is to say what they want rather than smooth it over.",
  Mars: "Mars adds drive, courage and a readiness to compete. A Mars decan is commonly read as more direct and physical, impatient with delay, energised by a challenge and willing to start fights that others would rather avoid. Martial decans are often linked with sport, competition, enterprise and protective instincts, and their usual lesson is to choose battles worth winning.",
  Jupiter: "Jupiter widens the view, adding optimism, generosity and an appetite for meaning. Its decans are often described as more philosophical and adventurous, drawn to teaching, travel and big ideas, and sometimes prone to overpromising. Jovial decans are often linked with philosophy, scholarship, publishing, law and long journeys, and their usual lesson is to match vision with follow-through.",
  Saturn: "Saturn contributes discipline, patience and a sense of responsibility. Under its sub-rulership a sign is said to take itself more seriously, plan for the long term, respect structure and earn confidence slowly through steady achievement. Saturnine decans are often linked with management, craft, institutions and long apprenticeships, and their usual lesson is to allow rest and lightness alongside duty.",
  Uranus: "Uranus brings originality, independence and a taste for the unconventional. Its decans tend to be described as more inventive and contrarian, quick to question tradition, attached to freedom and comfortable standing slightly apart from the crowd. Uranian decans are often linked with technology, reform, science and unusual lifestyles, and their usual lesson is to stay connected while staying free.",
  Neptune: "Neptune adds imagination, compassion and porous boundaries. Its decans are usually pictured as dreamy, artistic and spiritually inclined, deeply empathetic and occasionally vague, needing quiet time to separate their own feelings from other people's. Neptunian decans are often linked with music, film, healing professions and spiritual practice, and their usual lesson is to keep one foot on the ground.",
  Pluto: "Pluto lends intensity, depth and a drive to transform. A Pluto decan is commonly read as more private and probing, unafraid of difficult truths, slow to trust and capable of remarkable reinvention after a setback. Plutonian decans are often linked with research, crisis work, psychology and finance, and their usual lesson is to share power and let others in.",
};
const nth = (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
/** "Mar 21" → "March 21" for running text. */
const longDate = (short: string) => short.replace(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/, (m) => ({ Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June", Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December" })[m]!);

export function buildSign(signName: string): PageCopy {
  const copy = SIGN_PAGES[signName];
  const meta = sign(signName);
  const index = SIGN_ORDER.indexOf(signName);
  const dates = SIGN_DATES[signName];
  const decans = [1, 2, 3].map((d) => ({ d, ruler: decanRuler(signName, d), ...decanDates(signName, d) }));

  const decanParagraph = para(
    `${signName} divides into three decans of ten degrees each. The first, roughly ${decans[0].start} to ${decans[0].end}, belongs to ${planetName(decans[0].ruler)}; the second, about ${decans[1].start} to ${decans[1].end}, to ${planetName(decans[1].ruler)}; and the third, around ${decans[2].start} to ${decans[2].end}, to ${planetName(decans[2].ruler)}.`,
    `Each has its own page, and every ${signName} birthday links to its decan.`,
  );

  return {
    description: `${signName} zodiac sign: personality traits, strengths and challenges, love, career, decans and dates (${longDate(dates.start)} to ${longDate(dates.end)}).`.slice(0, 200),
    answer: fitAnswer(
      `In Western astrology, ${signName} is the ${ORDINALS[index]} sign of the zodiac, a ${lower(meta.modality)} ${lower(meta.element)} sign ruled by ${planetName(meta.rulingPlanet)}. It is traditionally associated with ${copy.gist}. The Sun is in ${signName} from about ${longDate(dates.start)} to ${longDate(dates.end)}.`,
      ["The exact dates shift by a day from year to year.", `Its opposite sign is ${signAt(signName, 6)}.`],
    ),
    sections: [
      { heading: `${signName} personality traits`, paragraphs: copy.overview },
      { heading: `${signName} strengths and challenges`, paragraphs: [copy.strengths, copy.challenges] },
      { heading: `${signName} in love and relationships`, paragraphs: copy.love },
      { heading: `${signName} at work`, paragraphs: copy.work },
      { heading: `Growth and the three ${signName} decans`, paragraphs: [copy.growth, decanParagraph] },
    ],
    faq: [
      ...copy.faq,
      { question: `What are the dates for ${signName}?`, answer: `About ${longDate(dates.start)} to ${longDate(dates.end)}. The Sun's entry into each sign moves by a day or so between years, so birthdays at either end are cusp dates; the zodiac sign calculator settles them for a specific year.` },
      { question: `What are the three ${signName} decans?`, answer: `The first decan (0° to 9°) is linked with ${planetName(decans[0].ruler)}, the second (10° to 19°) with ${planetName(decans[1].ruler)} and the third (20° to 29°) with ${planetName(decans[2].ruler)}, following the rulers of the ${lower(meta.element)} signs in zodiac order.` },
    ],
  };
}

function findingMoon(signName: string): string {
  const meta = sign(signName);
  const dignity = moonDignity(signName);
  const dignityLine = {
    domicile: `Cancer is the Moon's own sign, so tradition calls this placement domicile: the Moon's needs and the sign's style point the same way.`,
    exaltation: `Tradition calls Taurus the Moon's exaltation, the sign where its steadiness is said to be at its most comfortable after Cancer.`,
    detriment: `Capricorn sits opposite Cancer, so tradition calls this the Moon's detriment: feelings tend to be handled through duty and structure rather than shown openly, which is a different route, not a lesser one.`,
    fall: `Scorpio sits opposite Taurus, the Moon's exaltation, so tradition calls this placement its fall: emotional security takes more work to build and is often deeper once it is there.`,
    none: `${signName} gives the Moon no traditional dignity or debility, so its expression follows the sign's ${lower(meta.element)} element and ${lower(meta.modality)} mode without either boost or strain.`,
  }[dignity];
  return para(
    `The Moon crosses the whole zodiac every 27.3 days, moving about thirteen degrees a day, so it spends roughly two and a half days in ${signName} each month.`,
    `That is why a Moon sign needs the birth time and place, not only the date: on a day when the Moon changes sign, the hour decides it.`,
    dignityLine,
    `Unified Reading calculates the Moon from the Moon's actual position at the moment of birth; if no birth time is given, it only shows a Moon sign when the Moon stayed in one sign for that whole date in every time zone.`,
    `The Moon's phase adds a clue: someone born at a new Moon in ${signName} also has the Sun in ${signName}, while a full Moon in ${signName} means the Sun was opposite, in ${signAt(signName, 6)}.`,
  );
}

export function buildMoon(signName: string): PageCopy {
  const copy = MOON_PAGES[signName];
  const meta = sign(signName);
  const dignity = moonDignity(signName);
  return {
    description: `Moon in ${signName} meaning: emotional nature, needs, relationships and stress patterns, the Moon's dignity in ${signName}, and how to find your Moon sign.`.slice(0, 200),
    answer: fitAnswer(
      `In Western astrology, the Moon in ${signName} describes emotional needs and instinctive reactions coloured by ${signName}'s ${lower(meta.element)} element and ${lower(meta.modality)} mode. It is associated with ${copy.gist}. Finding your Moon sign needs a birth time, because the Moon changes sign about every two and a half days.`,
      ["It describes feelings, not fate."],
    ),
    sections: [
      { heading: `Moon in ${signName}: emotional nature`, paragraphs: copy.emotional },
      { heading: `What a ${signName} Moon needs`, paragraphs: [copy.needs, copy.comfort] },
      { heading: `${signName} Moon in relationships`, paragraphs: copy.relationships },
      { heading: `${signName} Moon under stress, and growth`, paragraphs: [copy.stress, copy.growth] },
      { heading: `How to tell if your Moon is in ${signName}`, paragraphs: [findingMoon(signName)] },
    ],
    faq: [
      copy.faq,
      { question: `What does Moon in ${signName} mean?`, answer: `The Moon sign describes the emotional layer of a chart: what feels safe, how feelings show and what restores you. In ${signName} it is linked with ${copy.gist}. The Sun sign describes identity; the Moon describes needs.` },
      { question: `Is the Moon strong in ${signName}?`, answer: `${MOON_DIGNITY_LABEL[dignity]}. ${dignity === "none" ? "That makes it neither especially strong nor weak by traditional rules." : dignity === "domicile" || dignity === "exaltation" ? "Tradition counts it among the Moon's comfortable placements." : "Tradition reads it as a placement that works harder for emotional ease, not as a bad one."} Modern astrologers weigh the whole chart.` },
      { question: `Do I need a birth time to know if my Moon is in ${signName}?`, answer: `Usually yes. The Moon stays in ${signName} for only about two and a half days, so a birth date near a change of sign needs the time and place. If the Moon stayed in ${signName} all day, the date alone is enough.` },
    ],
  };
}

export function buildRising(signName: string): PageCopy {
  const copy = RISING_PAGES[signName];
  const meta = sign(signName);
  const houses = para(
    `With whole sign houses, the system Unified Reading uses, ${signName} rising makes ${signName} the 1st house and gives each following sign the next house: ${list(HOUSE_THEMES.map(([h, theme]) => `the ${nth(h)} house of ${theme} falls in ${signAt(signName, h - 1)}`))}.`,
    `The descendant, the point opposite the ascendant, is in ${signAt(signName, 6)}, which astrology links with the qualities a person seeks or meets in partners.`,
  );
  return {
    description: `${signName} rising meaning: first impressions, approach to life, style, the chart ruler ${planetName(meta.rulingPlanet)} and the whole sign houses for a ${signName} ascendant.`.slice(0, 200),
    answer: fitAnswer(
      `In Western astrology, ${signName} rising means ${signName} was on the eastern horizon at the moment of birth, shaping first impressions and the approach to life. It is linked with ${copy.gist}. The chart ruler is ${planetName(meta.rulingPlanet)}, and finding the rising sign needs an exact birth time and place.`,
      ["It is also called the ascendant."],
    ),
    sections: [
      { heading: `${signName} rising: first impressions`, paragraphs: copy.impression },
      { heading: `How ${signName} rising approaches life`, paragraphs: copy.approach },
      { heading: `${cap(planetName(meta.rulingPlanet))}, the chart ruler for ${signName} rising`, paragraphs: [copy.ruler, houses] },
      { heading: `${signName} rising style and growth`, paragraphs: [copy.style, copy.growth] },
    ],
    faq: [
      copy.faq,
      { question: `What is the chart ruler for ${signName} rising?`, answer: `${cap(planetName(meta.rulingPlanet))}, the planet that rules ${signName}. Its sign and house in the birth chart are read as a guide to where the person's energy tends to go, which is why Unified Reading names the chart ruler when it has a birth time and place.` },
      { question: `What is the descendant for ${signName} rising?`, answer: `${signAt(signName, 6)}. The descendant is always the sign opposite the rising sign; with whole sign houses it marks the 7th house of partnership.` },
      { question: `How do I know if I am ${signName} rising?`, answer: `You need your birth date, exact time and place. The rising sign moves through all twelve signs in a day, about two hours each, so even half an hour can change it near a boundary. The free Unified Reading preview calculates it when you add a birth time and place.` },
    ],
  };
}

export function buildDecan(signName: string, decan: number): PageCopy {
  const copy = DECAN_PAGES[`${signName}-${decan}`];
  const meta = sign(signName);
  const ruler = decanRuler(signName, decan);
  const dates = decanDates(signName, decan);
  const source = signAt(signName, (decan - 1) * 4);
  const others = [1, 2, 3].filter((d) => d !== decan);
  const rulerLine = ruler === meta.rulingPlanet
    ? `${cap(DECAN_WORDS[decan])} decans take the sign's own ruler, so ${planetName(ruler)} rules both the sign and this decan, which is why it is often called the purest expression of ${signName}.`
    : `Its sub-ruler, ${planetName(ruler)}, comes from ${source}, the ${["", "", "next", "last"][decan]} ${lower(meta.element)} sign after ${signName}, so this decan borrows a little of ${source}'s character while staying ${signName} at heart.`;

  const datesParagraph = para(
    `The ${DECAN_WORDS[decan]} decan covers ${(decan - 1) * 10}° to ${decan * 10 - 1}° of ${signName}, which in most years means birthdays from ${dates.start} to ${dates.end}.`,
    rulerLine,
    `The other two decans of ${signName} belong to ${list(others.map((d) => `${planetName(decanRuler(signName, d))} (decan ${d})`))}.`,
    `Because decans are measured in degrees rather than days, the calendar dates drift by a day or so between years.`,
  );
  const signGist = SIGN_PAGES[signName].gist;
  const neighbours = others.map((d) => `decan ${d} leans towards ${DECAN_PAGES[`${signName}-${d}`].gist}`);
  const flavourParagraph = para(
    PLANET_FLAVOUR[ruler],
    ruler === meta.rulingPlanet
      ? `Here ${planetName(ruler)} doubles up with the sign's own ruler, so ${signName}'s ${signGist} come through with little filtering.`
      : `Set against ${signName}'s ${signGist}, that ${ruler} note shifts the emphasis without changing the sign underneath.`,
  );
  const comparison = para(
    `Within ${signName}, ${list(neighbours)}.`,
    `A decan is one layer of a chart among many, so the Moon, rising sign and houses can strengthen or soften everything described here. These notes work best as prompts for reflection: notice which lines ring true, which feel foreign, and what that contrast suggests.`,
  );

  return {
    description: `${signName} decan ${decan} (${dates.start} to ${dates.end}): personality, love, work and growth, with ${planetName(ruler)} as sub-ruler of the ${DECAN_WORDS[decan]} ten degrees of ${signName}.`.slice(0, 200),
    answer: fitAnswer(
      `In Western astrology, the ${DECAN_WORDS[decan]} decan of ${signName} covers ${(decan - 1) * 10}° to ${decan * 10 - 1}° of the sign, roughly ${dates.start} to ${dates.end}, with ${planetName(ruler)} as its sub-ruler${ruler === meta.rulingPlanet ? ", the sign's own planet" : ` beside ${planetName(meta.rulingPlanet)}`}. It is read as ${copy.gist}.`,
      ["Decans are a traditional refinement of the Sun sign.", "Exact dates shift slightly between years."],
    ),
    sections: [
      { heading: `${signName} decan ${decan} personality`, paragraphs: copy.character },
      { heading: `${signName} decan ${decan} in love and at work`, paragraphs: [copy.love, copy.work] },
      { heading: `Dates and sub-ruler of ${signName} decan ${decan}: what ${planetName(ruler)} adds`, paragraphs: [datesParagraph, flavourParagraph] },
      { heading: `Growth for ${signName} decan ${decan}`, paragraphs: [copy.growth, comparison] },
    ],
    faq: [
      copy.faq,
      { question: `What are the dates of ${signName} decan ${decan}?`, answer: `In most years ${dates.start} to ${dates.end}, the days when the Sun is between ${(decan - 1) * 10}° and ${decan * 10 - 1}° of ${signName}. Birthdays at either end can fall in the neighbouring decan in some years.` },
      { question: `What planet rules ${signName} decan ${decan}?`, answer: `${cap(planetName(ruler))}. In the triplicity system each ${lower(meta.element)} sign's decans take the rulers of the ${lower(meta.element)} signs in order, starting with ${signName}'s own ruler, ${planetName(meta.rulingPlanet)}.` },
    ],
  };
}
