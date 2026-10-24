/**
 * Cross-system pages: Life Path × Sun sign (/life-path/{n}-{sign}) and Sun
 * sign × Chinese animal (/zodiac/{sign}-{animal}). Each combination has its
 * own hand-written synthesis (lp-sign-*.ts, sign-animal-*.ts); briefs and
 * practices are shared blocks (cross-blocks.ts); polarity, elements and the
 * example birth date are computed.
 */
import { ANIMAL_BRANCHES } from "../../../lib/chinese-zodiac";
import { exampleBirthDate } from "../../../lib/library/date-facts";
import { ELEMENT_POLARITY, ELEMENT_YIN_YANG, SIGN_DATES, lifePathMeaning, numberPolarity, planetName, sign } from "../../../lib/library/facts";
import { MASTER_ROOTS } from "../../../lib/library/registry";
import { ANIMAL_COPY } from "./animals";
import { ANIMAL_BRIEF, ANIMAL_PRACTICE, LP_BRIEF, LP_PRACTICE, SIGN_BRIEF, SIGN_PRACTICE } from "./cross-blocks";
import { SIGN_PAGES_1 } from "./sign-pages-1";
import { SIGN_PAGES_2 } from "./sign-pages-2";
import type { PageCopy } from "./index";
import { LP_SIGN_1 } from "./lp-sign-1";
import { LP_SIGN_2 } from "./lp-sign-2";
import { LP_SIGN_3 } from "./lp-sign-3";
import { LP_SIGN_4 } from "./lp-sign-4";
import { SIGN_ANIMAL_1 } from "./sign-animal-1";
import { SIGN_ANIMAL_2 } from "./sign-animal-2";
import { SIGN_ANIMAL_3 } from "./sign-animal-3";
import { SIGN_ANIMAL_4 } from "./sign-animal-4";
import { fitAnswer, list, para } from "./util";

const LP_SIGN: Record<string, [string, string]> = { ...LP_SIGN_1, ...LP_SIGN_2, ...LP_SIGN_3, ...LP_SIGN_4 };
const SIGN_ANIMAL: Record<string, [string, string]> = { ...SIGN_ANIMAL_1, ...SIGN_ANIMAL_2, ...SIGN_ANIMAL_3, ...SIGN_ANIMAL_4 };

const ELEMENT_THEME: Record<string, string> = {
  Fire: "drive, enthusiasm and action",
  Earth: "practicality, patience and the material world",
  Air: "ideas, communication and connection",
  Water: "feeling, intuition and emotional depth",
};
const CHINESE_ELEMENT_THEME: Record<string, string> = {
  Wood: "growth, flexibility and generosity",
  Fire: "warmth, passion and visibility",
  Earth: "stability, patience and care",
  Metal: "resolve, precision and principle",
  Water: "adaptability, insight and quiet persistence",
};
const SIGN_GIST: Record<string, string> = Object.fromEntries(Object.entries({ ...SIGN_PAGES_1, ...SIGN_PAGES_2 }).map(([name, copy]) => [name, copy.gist]));
const lower = (text: string) => text.toLowerCase();
const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
/** The page's own first sentences, for FAQ answers that summarise it. */
const opening = (paragraph: string, count = 2) => (paragraph.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? [paragraph]).slice(0, count).map((sentence) => sentence.trim()).join(" ");
const pick = <T,>(variants: T[], i: number) => variants[i % variants.length];

export function buildLifePathSign(n: number, signName: string): PageCopy {
  const hook = LP_SIGN[`${n}-${signName}`];
  if (!hook) throw new Error(`Missing Life Path × sign copy for ${n}-${signName}`);
  const meaning = lifePathMeaning(n);
  const meta = sign(signName);
  const numberSide = numberPolarity(n);
  const signSide = ELEMENT_POLARITY[meta.element];
  const same = numberSide === signSide;
  const root = MASTER_ROOTS[n];
  const example = exampleBirthDate((d) => d.lifePath === n && d.sign === signName);
  const v = n + meta.sign.length;

  const resonance = para(
    `Traditional numerology treats ${root ? `master number ${n}, through its root ${root}` : `${n}`} as ${(root ?? n) % 2 ? "an odd, active" : "an even, receptive"} number, and astrology counts ${lower(meta.element)} signs as ${lower(signSide)}.`,
    same
      ? pick([`So both halves of a Life Path ${n} ${signName} point the same way, which tends to make the combination feel consistent and its strengths easy to see, and its blind spots easy to double.`, `That alignment usually makes a Life Path ${n} ${signName} feel all of a piece: the number and the sign amplify each other, for better and for worse.`], v)
      : pick([`So a Life Path ${n} ${signName} carries one ${lower(numberSide)} side and one ${lower(signSide)} side, a built-in balance that can feel like an inner negotiation until both are given room.`, `The number and the sign therefore lean in different directions, which often reads as range: one part of a Life Path ${n} ${signName} pushes outward while the other holds back and steadies.`], v),
    `${signName}'s ${lower(meta.element)} element is linked with ${ELEMENT_THEME[meta.element]}, and ${planetName(meta.rulingPlanet)}, its ruler, adds its own note to ${meaning.title}'s ${meaning.keywords[0]}.`,
  );

  const glance = pick([
    `At a glance: ${meaning.title}, with its ${meaning.keywords.slice(0, 2).join(" and ")}, meets ${signName}'s ${SIGN_GIST[signName]}. The number comes from the whole birth date and the sign from the Sun's position that day, so the two are independent readings of the same birthday.`,
    `In short, ${signName} supplies ${SIGN_GIST[signName]}, and Life Path ${n} adds ${meaning.keywords.slice(0, 2).join(" and ")}. One is calculated from the digits of the birth date, the other from where the Sun stood, which is why their agreements are worth noticing.`,
  ], v);
  const exampleLine = example
    ? `For a concrete case, anyone born on ${longDate(example)} is a Life Path ${n} ${signName}; the Life Path calculator and the zodiac sign calculator confirm any other date.`
    : `The Life Path calculator and the zodiac sign calculator confirm whether a particular birth date fits this combination.`;

  return {
    description: `Life Path ${n} ${signName}: what ${meaning.title} and ${signName} share, where they pull apart, strengths, challenges and practical advice for this numerology and zodiac combination.`.slice(0, 200),
    answer: fitAnswer(
      `In numerology, Life Path ${n} is ${meaning.title}, associated with ${list(meaning.keywords.slice(0, 3))}; in Western astrology, ${signName} is a ${lower(meta.modality)} ${lower(meta.element)} sign. A Life Path ${n} ${signName} combines both, ${same ? "with the two pulling in the same direction" : "with one active and one receptive side to balance"}.`,
      [`${signName}'s ruler is ${planetName(meta.rulingPlanet)}.`, "Read it as a tendency, not a verdict."],
    ),
    sections: [
      { heading: `Life Path ${n} ${signName}: the combined picture`, paragraphs: [hook[0], glance] },
      { heading: `Where Life Path ${n} and ${signName} agree, and where they pull apart`, paragraphs: [hook[1], LP_PRACTICE[n]] },
      { heading: `The two halves: Life Path ${n} and ${signName}`, paragraphs: [LP_BRIEF[n], SIGN_BRIEF[signName]] },
      { heading: `Living it: practical ideas for a Life Path ${n} ${signName}`, paragraphs: [SIGN_PRACTICE[signName], para(resonance, exampleLine)] },
    ],
    faq: [
      { question: `What does it mean to be a Life Path ${n} ${signName}?`, answer: opening(hook[0]) },
      { question: `Do Life Path ${n} and ${signName} go well together?`, answer: same ? `They tend to reinforce each other: Life Path ${n} is ${lower(numberSide)} in numerology and ${signName} is ${lower(signSide)} in astrology, so their strengths stack, and so do their blind spots.` : `They complement more than they echo: Life Path ${n} is ${lower(numberSide)} in numerology while ${signName} is ${lower(signSide)}, so the combination holds two speeds that work best when each gets its turn.` },
      { question: `Does a Life Path ${n} ${signName} reading need a birth time?`, answer: `Not for these two. The Life Path uses only the digits of the day, month and year, and the Sun sign only needs a time when the birthday falls on a cusp. A full Unified Reading adds the Moon and rising sign, which do depend on the hour and place of birth.` },
      { question: `How do I know if I am a Life Path ${n} ${signName}?`, answer: `Your Sun is in ${signName} if you were born between about ${SIGN_DATES[signName].start} and ${SIGN_DATES[signName].end}, and your Life Path comes from reducing the month, day and year of birth separately, then adding them.${example ? ` Someone born on ${longDate(example)}, for example, is a Life Path ${n} ${signName}.` : ""}` },
    ],
  };
}

export function buildSignAnimal(signName: string, animal: string): PageCopy {
  const hook = SIGN_ANIMAL[`${signName}-${animal}`];
  if (!hook) throw new Error(`Missing sign × animal copy for ${signName}-${animal}`);
  const meta = sign(signName);
  const branch = ANIMAL_BRANCHES[animal];
  const signYinYang = ELEMENT_YIN_YANG[meta.element];
  const samePolarity = signYinYang === branch.yinYang;
  const sameElement = meta.element === branch.element;
  const example = exampleBirthDate((d) => d.sign === signName && d.animal === animal);
  const v = signName.length + animal.length;

  const bridge = para(
    sameElement
      ? `Both halves share an element by name: ${signName} is a ${lower(meta.element)} sign and the ${animal}'s fixed element is ${branch.element}, so the Western and Chinese pictures of ${lower(meta.element)}, ${ELEMENT_THEME[meta.element]} on one side and ${CHINESE_ELEMENT_THEME[branch.element]} on the other, overlap unusually well.`
      : `The elements differ: ${signName} is a ${lower(meta.element)} sign, linked with ${ELEMENT_THEME[meta.element]}, while the ${animal}'s fixed element is ${branch.element}, which Chinese tradition links with ${CHINESE_ELEMENT_THEME[branch.element]}.`,
    `Many East-West readings line up fire and air signs with yang and earth and water signs with yin, which makes ${signName} ${lower(signYinYang)} and the ${animal} ${lower(branch.yinYang)}.`,
    samePolarity
      ? pick([`On that reading the two point the same way, so a ${signName} ${animal} tends to feel consistent from the inside.`, `That shared polarity is one reason a ${signName} ${animal} can come across as all of a piece.`], v)
      : pick([`On that reading they pull in different directions, which often shows up as a useful range between pushing ahead and holding back.`, `That contrast gives a ${signName} ${animal} two gears, and learning when to use each is part of the work.`], v),
  );

  const glance = pick([
    `At a glance: ${signName} brings ${SIGN_GIST[signName]}, and the ${animal} brings ${ANIMAL_COPY[animal].gist}. The sign follows the Sun's position on the birthday and the animal follows the lunar year, so each system reads the same birth from a different calendar.`,
    `In short, the ${animal} contributes ${ANIMAL_COPY[animal].gist}, while ${signName} adds ${SIGN_GIST[signName]}. Western astrology times the sign by the Sun, Chinese astrology times the animal by the lunar year, and that independence is what makes their overlaps interesting.`,
  ], v);
  const exampleLine = example
    ? `For a concrete case, anyone born on ${longDate(example)} is a ${signName} ${animal}; the zodiac sign and Chinese zodiac calculators check any other date, including births near Lunar New Year.`
    : `The zodiac sign and Chinese zodiac calculators check whether a particular birth date fits this combination, including births near Lunar New Year.`;

  return {
    description: `${signName} ${animal}: how the Western ${signName} Sun and the Chinese Year of the ${animal} combine, where they agree, where they pull apart, and practical advice.`.slice(0, 200),
    answer: fitAnswer(
      `In Western astrology, ${signName} is a ${lower(meta.modality)} ${lower(meta.element)} sign ruled by ${planetName(meta.rulingPlanet)}; in Chinese astrology, the ${animal} is a ${lower(branch.yinYang)} animal whose fixed element is ${branch.element}. A ${signName} ${animal} is someone with the Sun in ${signName} born in a Year of the ${animal}.`,
      ["The two systems are independent, so their overlaps are worth noticing."],
    ),
    sections: [
      { heading: `${signName} ${animal}: the combined picture`, paragraphs: [hook[0], glance] },
      { heading: `Where ${signName} and the ${animal} agree, and where they pull apart`, paragraphs: [hook[1], ANIMAL_PRACTICE[animal]] },
      { heading: `The two halves: ${signName} and the ${animal}`, paragraphs: [SIGN_BRIEF[signName], ANIMAL_BRIEF[animal]] },
      { heading: `Living it: practical ideas for a ${signName} ${animal}`, paragraphs: [SIGN_PRACTICE[signName], para(bridge, exampleLine)] },
    ],
    faq: [
      { question: `What is a ${signName} ${animal} like?`, answer: opening(hook[0]) },
      { question: `Do ${signName} and the ${animal} share an element?`, answer: sameElement ? `Yes, by name: ${signName} is a ${lower(meta.element)} sign and the ${animal}'s fixed element is ${branch.element}. The two traditions describe the element differently, but they overlap enough to reinforce each other.` : `No. ${signName} is ${lower(meta.element)} in Western astrology and the ${animal}'s fixed element is ${branch.element}. The Western and Chinese element systems are separate, so the combination draws on two different vocabularies.` },
      { question: `Does a ${signName} ${animal} reading need a birth time?`, answer: `Rarely. The Sun sign only needs the hour on a cusp birthday, and the animal only needs care for January and February births close to Lunar New Year. A full Unified Reading adds the Moon and rising sign, which do depend on the exact time and place of birth.` },
      { question: `How do I know if I am a ${signName} ${animal}?`, answer: `You need a ${signName} Sun, born between about ${SIGN_DATES[signName].start} and ${SIGN_DATES[signName].end}, in a Year of the ${animal}, which begins at Lunar New Year rather than on January 1.${example ? ` Someone born on ${longDate(example)}, for example, is a ${signName} ${animal}.` : ""}` },
    ],
  };
}
