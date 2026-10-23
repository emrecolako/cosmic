import { ELEMENT_POLARITY, SIGN_ORDER, signDates, zodiacPairFacts } from "../../../lib/library/facts";
import type { PageCopy } from "./index";
import { ZODIAC_PAIR_HOOKS } from "./zodiac-pairs";
import { ELEMENT_TEXT, MODALITY_TEXT, RULER_TEXT, SEPARATION_PRACTICE, SEPARATION_TEXT, SIGN_COPY, SIGN_DAILY, SIGN_FIRST, ELEMENT_DAILY, MODALITY_CONFLICT } from "./signs";
import { an, list, pairLine, para, secondVoice, withPartner } from "./util";

const sortedKey = (x: string, y: string) => [x, y].sort().join("|");
/** "Leos", but "Aries partners" for names already ending in s. */
const plural = (sign: string) => (sign.endsWith("s") ? `${sign} partners` : `${sign}s`);

const RELATION_GIST: Record<string, string> = {
  "same element": "a same-element match that tends to feel familiar",
  "complementary elements": "a complementary match in which each element feeds the other",
  "contrasting elements": "a contrasting match that asks for translation between styles",
};

/** Names the partner inside a sign's own sentences, so each pairing reads as addressed to it. */
function toward(copy: (typeof SIGN_COPY)[string], self: string, other: string): (typeof SIGN_COPY)[string] {
  if (self === other) return copy;
  return {
    ...copy,
    needs: copy.needs.replace(new RegExp(`^${self} usually needs`), `With ${other}, ${self} usually needs`),
    friction: copy.friction.replace(/^When stressed, /, `When stressed around ${other}, `),
    helps: copy.helps.replace(new RegExp(`^What helps with ${self}`), `What helps ${other} with ${self}`),
    talk: copy.talk.replace(/^In conversation, /, `In conversation with ${other}, `),
  };
}

export function buildZodiacPair(a: string, b: string): PageCopy {
  const f = zodiacPairFacts(a, b);
  const ca = toward(SIGN_COPY[a], a, b);
  const cb = toward(SIGN_COPY[b], b, a);
  const same = a === b;
  // Element templates take the signs in the alphabetical order of their elements.
  const [ex, ey] = f.a.element <= f.b.element ? [a, b] : [b, a];
  const elementText = ELEMENT_TEXT[sortedKey(f.a.element, f.b.element)](ex, ey);
  const modalityText = MODALITY_TEXT[sortedKey(f.a.modality, f.b.modality)](a, b);
  const separationText = SEPARATION_TEXT[f.separation](a, b);
  const rulers = f.sharedRuler
    ? `${same ? `Both partners share` : `${a} and ${b} share`} a ruling planet, ${RULER_TEXT[f.a.rulingPlanet]}, so ${same ? "the two" : "these signs"} often value similar things even when they express them differently.`
    : `${a} is ruled by ${RULER_TEXT[f.a.rulingPlanet]}, and ${b} is ruled by ${RULER_TEXT[f.b.rulingPlanet]}, so ${an(`${a}-${b}`)} pairing is often read as ${f.a.rulingPlanet} meeting ${f.b.rulingPlanet}.`;
  const da = SIGN_DAILY[a];
  const db = SIGN_DAILY[b];
  const traitsA = f.a.traits.slice(0, 3);
  const traitsB = f.b.traits.slice(0, 3);
  const polarityA = ELEMENT_POLARITY[f.a.element].toLowerCase();
  const polarityB = ELEMENT_POLARITY[f.b.element].toLowerCase();
  const polarity = same
    ? `As ${an(f.a.element)} sign, ${a} is classed as ${polarityA} in traditional astrology, so a pair of ${plural(a)} doubles that ${polarityA === "active" ? "outward, initiating" : "inward, receptive"} quality.`
    : polarityA === polarityB
      ? `Both are ${polarityA} signs in traditional astrology (Fire and Air are active, Earth and Water receptive), so ${a} and ${b} tend to meet the world with a similar ${polarityA === "active" ? "outward, initiating" : "inward, receptive"} stance.`
      : `In traditional astrology Fire and Air signs are active and Earth and Water signs receptive, so ${polarityA === "active" ? a : b} tends to reach outward while ${polarityA === "active" ? b : a} tends to take in and consolidate.`;
  const position = same
    ? `${a} is sign ${SIGN_ORDER.indexOf(a) + 1} of 12 when counting from Aries, the start of the tropical year at the March equinox.`
    : `Counting from Aries, ${a} is sign ${SIGN_ORDER.indexOf(a) + 1} and ${b} is sign ${SIGN_ORDER.indexOf(b) + 1}, which is where the ${f.separation}-degree figure comes from: each sign spans 30 degrees.`;

  return {
    ogLine: pairLine(same ? SIGN_COPY[a].twin : ZODIAC_PAIR_HOOKS[`${a}|${b}`], [a, b]),
    description: `${a} and ${b} compatibility in Western astrology: ${f.a.element} and ${f.b.element}, ${f.a.modality.toLowerCase()} and ${f.b.modality.toLowerCase()}, the ${f.separation}° ${f.separationName.toLowerCase()} between them, and what helps the pairing.`.slice(0, 200),
    answer: same
      ? `In Western astrology, two ${a} Suns share the same ${f.a.modality.toLowerCase()} ${f.a.element} sign ruled by ${f.a.rulingPlanet}, so the match is often read as instinctively familiar. Each recognises the other's ${list(traitsA.slice(0, 2))} nature; the pairing tends to work best when both make room for what neither naturally supplies.`
      : `In Western astrology, ${a} (${f.a.modality.toLowerCase()} ${f.a.element}) and ${b} (${f.b.modality.toLowerCase()} ${f.b.element}) sit ${f.separation} degrees apart, ${RELATION_GIST[f.elementRelation]}. ${a} is often described as ${list(traitsA.slice(0, 2))} and ${b} as ${list(traitsB.slice(0, 2))}; Sun signs describe tendencies, not outcomes.`,
    sections: [
      {
        heading: same ? `How two ${a} Suns show up together` : `How ${a} and ${b} show up together`,
        paragraphs: same
          ? [para(ca.inLove, ca.talk), para(SIGN_FIRST[a].first, ca.twin, `Seen from outside, ${an(a)} couple often looks unusually in sync, sharing a pace, a sense of humour, a taste in friends and a way of reacting to news.`)]
          : [ZODIAC_PAIR_HOOKS[`${a}|${b}`], para(ca.inLove, ca.talk), para(cb.inLove, cb.talk), para(SIGN_FIRST[a].first.replace(/^On first meeting, /, `On first meeting ${b}, `), SIGN_FIRST[b].first.replace(/^On first meeting, /, `On first meeting ${a}, `), `Put together, ${a} brings ${ca.gift.replace(/^[A-Za-z]+ offers /, "").replace(/\.$/, "")}, while ${b} brings ${cb.gift.replace(/^[A-Za-z]+ offers /, "").replace(/\.$/, "")}.`)],
      },
      {
        heading: same ? `One element, one modality: ${f.a.element} and ${f.a.modality.toLowerCase()}` : `${f.a.element} meets ${f.b.element}: element and modality`,
        paragraphs: [elementText, para(modalityText, polarity, same
          ? `The traditional keywords for ${a}, ${list(f.a.traits)}, describe both partners at once, which is exactly why this pairing can feel so familiar so quickly.`
          : `The traditional keywords for ${a} include ${list(traitsA)}, and those for ${b} include ${list(traitsB)}.`)],
      },
      {
        heading: same ? `The same sign: 0 degrees apart` : `The ${f.separation}° relationship: ${f.separationName.toLowerCase()}`,
        paragraphs: [para(separationText, SEPARATION_PRACTICE[f.separation](a, b)), para(position, rulers, `For ${same ? `two ${plural(a)}` : `${a} and ${b}`}, this is a relationship between whole signs rather than an aspect calculated from two birth charts.`)],
      },
      {
        heading: same ? `What two ${plural(a)} need, and where friction starts` : `Needs, friction and what helps`,
        paragraphs: same
          ? [para(ca.needs, ca.friction, `When both partners react the same way at the same moment, naming the pattern out loud tends to defuse it faster than either person backing down.`, SIGN_FIRST[a].twinRepair), para(MODALITY_CONFLICT[sortedKey(f.a.modality, f.b.modality)], ca.helps, `For two ${plural(a)}, it can help to agree which of you will slow down first when ${ca.frictionShort} shows up, since the same instinct will usually arrive on both sides at once.`)]
          : [para(ca.needs, cb.needs), para(ca.friction, secondVoice(cb.friction), MODALITY_CONFLICT[sortedKey(f.a.modality, f.b.modality)]), para(ca.helps, cb.helps, `Naming ${ca.frictionShort} and ${cb.frictionShort} as patterns, rather than as faults, tends to make them easier to work with, and much easier to laugh about later.`)],
      },
      {
        heading: same ? `Two ${plural(a)} day to day` : `${a} and ${b} day to day`,
        paragraphs: same
          ? [para(withPartner(da.atHome, a), da.twinMore), para(withPartner(da.asTeam, a), `Two ${plural(a)} in the same team tend to amplify each other's ${f.a.traits[1]} streak, which is useful once responsibilities are split clearly and credit is shared generously.`), ELEMENT_DAILY[sortedKey(f.a.element, f.b.element)](ex, ey)]
          : [para(withPartner(da.atHome, b), secondVoice(withPartner(db.atHome, a), "its")), para(withPartner(da.asTeam, b), secondVoice(withPartner(db.asTeam, a)), `Shared projects that use both the ${f.a.traits[0]} side of ${a} and the ${f.b.traits[0]} side of ${b}, a trip, a renovation, a joint hobby, tend to show this pairing at its best.`), ELEMENT_DAILY[sortedKey(f.a.element, f.b.element)](ex, ey)],
      },
    ],
    faq: [
      {
        question: `Are ${a} and ${b} compatible?`,
        answer: same
          ? `Two ${plural(a)} share an element, modality and ruler, which is ${RELATION_GIST[f.elementRelation]}. Astrology describes themes rather than scores, and for ${an(a)} couple the theme is ${ca.frictionShort} meeting itself.`
          : `${a} and ${b} have ${f.elementRelation} (${f.a.element} and ${f.b.element}) and sit ${f.separation} degrees apart, ${RELATION_GIST[f.elementRelation]}. Astrology describes themes rather than scores; for ${a} and ${b}, the themes to watch are ${ca.frictionShort} and ${cb.frictionShort}.`,
      },
      {
        question: same ? `What are the dates and element of ${a}?` : `What are the dates and elements of ${a} and ${b}?`,
        answer: same
          ? `In ${2026}, the Sun is in ${a} from ${signDates(a)}. ${a} is a ${f.a.modality} ${f.a.element} sign ruled by ${f.a.rulingPlanet}. Dates near a cusp can shift by a day from year to year, which is why the calculator uses the Sun's actual position.`
          : `In ${2026}, the Sun is in ${a} from ${signDates(a)} and in ${b} from ${signDates(b)}. ${a} is a ${f.a.modality} ${f.a.element} sign ruled by ${f.a.rulingPlanet}; ${b} is a ${f.b.modality} ${f.b.element} sign ruled by ${f.b.rulingPlanet}. Cusp dates can shift by a day between years.`,
      },
      {
        question: same ? `What does it mean when both partners are ${a}?` : `What does the ${f.separation}° angle between ${a} and ${b} mean?`,
        answer: same
          ? `It means both Suns sit in the same sign, so traditional astrology expects shared instincts and shared blind spots. The most common friction is ${ca.frictionShort} on both sides at once.`
          : `Counting around the zodiac, ${b} sits ${f.separation} degrees from ${a}, ${an(f.separationName.toLowerCase())} in traditional terms. It describes how ${a} and ${b} relate as signs, not an aspect between planets in two people's charts.`,
      },
      {
        question: `What might ${a} and ${b} enjoy doing together?`,
        answer: same
          ? `${da.activity}. Two ${plural(a)} often enjoy these side by side, and taking turns to choose keeps the plans fresh.`
          : `${da.activity}, while ${db.activity}. Alternating who chooses gives both partners a taste of the other's world.`,
      },
    ],
  };
}
