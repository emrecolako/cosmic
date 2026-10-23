import {
  ANIMALS,
  ANIMAL_BRANCHES,
  animalYears,
  chineseRelations,
  fiveElementRelation,
  trineElement,
  wheelDistance,
} from "../../../lib/library/facts";
import { LUNAR_NEW_YEAR_DATES, SAN_HE_TRINES, zodiacYearProfile } from "../../../lib/chinese-zodiac";
import { liuChongOf, liuHaiOf, liuHeOf, trineOf } from "../../../lib/library/registry";
import type { PageCopy } from "./index";
import { ANIMAL_COPY, ANIMAL_DAILY, type AnimalCopy, ANIMAL_PAIR_MORE, ELEMENT_EVERYDAY, ELEMENT_NATURE, PAIR_RELATION_TEXT } from "./animals";
import { CHINESE_PAIR_TEXT } from "./chinese-pairs";
import { ANIMAL_MORE } from "./extensions";
import { an, fitAnswer, list, para, secondVoice, withPartner } from "./util";

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const order = ANIMALS as readonly string[];
const cycleKey = (a: string, b: string) => (order.indexOf(a) <= order.indexOf(b) ? `${a}|${b}` : `${b}|${a}`);
const trineMates = (animal: string) => trineOf(animal).filter((x) => x !== animal);
const plural = (animal: string) => (animal === "Ox" ? "Oxen" : `${animal}s`);
const firstOf = (gist: string) => gist.split(",")[0];
const lnyOf = (year: number) => `${MONTHS[LUNAR_NEW_YEAR_DATES[year].month - 1]} ${LUNAR_NEW_YEAR_DATES[year].day}`;

const DISTANCE_TEXT: Record<number, (a: string, b: string) => string> = {
  1: (a, b) => `On the twelve-animal wheel the ${a} and the ${b} are neighbours, one branch apart, so ${an(a)} year and ${an(b)} year follow each other directly. The ${a} and the ${b} belong to different trines and often have contrasting temperaments, which can make each curious about the other.`,
  2: (a, b) => `On the twelve-animal wheel the ${a} and the ${b} sit two branches apart. Since polarity alternates around the wheel, the ${a} shares its yin-yang polarity with the ${b}, but the ${a} and the ${b} belong to different trines and approach life from different angles.`,
  3: (a, b) => `On the twelve-animal wheel the ${a} and the ${b} sit three branches apart, a quarter of the way around. The ${a} has the opposite polarity to the ${b} and a different trine, so traditional readings treat the ${a} and the ${b} as neither natural allies nor direct opposites.`,
  4: (a, b) => `On the twelve-animal wheel the ${a} and the ${b} sit four branches apart, a third of the way around, exactly the spacing of the San He trines. The ${a} and the ${b} are traditionally read as sharing a rhythm and an outlook.`,
  5: (a, b) => `On the twelve-animal wheel the ${a} and the ${b} sit five branches apart, nearly opposite but not quite. The ${a} has the opposite polarity to the ${b}, and the ${a} and the ${b} are traditionally read as needing patience to understand each other's priorities.`,
  6: (a, b) => `On the twelve-animal wheel the ${a} and the ${b} sit six branches apart, directly opposite each other. Opposite animals form the Liu Chong clashes, and the ${a} and the ${b} are traditionally described as strongly contrasting, sometimes magnetic, sometimes combative.`,
};

const RELATION_CONTEXT: Record<string, string> = {
  "San He": "San He, the three harmonies, is the most widely cited compatibility structure in Chinese astrology. Each trine groups animals spaced four branches apart, and pairs within a trine are traditionally treated as the most natural allies.",
  "Liu He": "Liu He, the six harmonies, pairs each animal with one secret friend. These pairings are traditionally read as quietly supportive, complementing each other in ways that are not always obvious from outside.",
  "Liu Chong": "Liu Chong, the six clashes, pairs each animal with the one directly opposite it on the wheel. Traditional readings treat these as the most challenging pairings, describing tension rather than impossibility, and many such couples are said to learn a great deal from each other.",
  "Liu Hai": "Liu Hai, the six harms, pairs animals whose relationship is traditionally said to be undermined by small hurts and misunderstandings. The advice usually given is not avoidance but deliberate communication and fairness.",
};

function trineNote(a: string, b: string): string {
  if (a === b) return `Every ${a} shares the ${trineElement(a)} trine with the ${list(trineMates(a))}, has the ${liuHeOf(a)} as its Liu He secret friend, and sits opposite the ${liuChongOf(a)} in the six clashes.`;
  const sameTrine = trineOf(a).includes(b);
  return sameTrine
    ? `Elsewhere in the classical tables, the ${a}'s Liu He secret friend is the ${liuHeOf(a)} and the ${b}'s is the ${liuHeOf(b)}, while their Liu Chong opposites are the ${liuChongOf(a)} and the ${liuChongOf(b)}.`
    : `The ${a} belongs to the ${trineElement(a)} trine with the ${list(trineMates(a))}, and the ${b} to the ${trineElement(b)} trine with the ${list(trineMates(b))}.`;
}

function elementParagraph(a: string, b: string): string {
  const ea = ANIMAL_BRANCHES[a].element;
  const eb = ANIMAL_BRANCHES[b].element;
  const rel = fiveElementRelation(a, b);
  const giver = rel.from === ea ? a : b;
  const taker = rel.from === ea ? b : a;
  const elementText = rel.cycle === "same element"
    ? a === b
      ? `Two ${plural(a)} share ${ea} as their fixed element. In five-element thinking a shared element is read as mutual recognition, so each ${a} tends to understand the other's instincts, with the caution that the same strengths and excesses are doubled.`
      : `The ${a} and the ${b} share ${ea} as their fixed element. In five-element thinking that shared ${ea} is read as mutual recognition between the ${a} and the ${b}, with the caution that the ${a}'s and the ${b}'s excesses can double up as easily as their strengths.`
    : rel.cycle === "generating"
      ? `The ${a}'s fixed element is ${ea} and the ${b}'s is ${eb}. In the generating cycle of the five elements, ${rel.from} feeds ${rel.to}, so the ${giver} is often read as supporting or nourishing the ${taker}, with the ${giver}'s ${rel.from} helping the ${taker}'s ${rel.to} to grow.`
      : `The ${a}'s fixed element is ${ea} and the ${b}'s is ${eb}. In the controlling cycle of the five elements, ${rel.from} restrains ${rel.to}, so the ${giver} can act as a check on the ${taker}. Whether the ${giver}'s ${rel.from} feels grounding or stifling to the ${taker} depends on how it is handled.`;
  const ya = ANIMAL_BRANCHES[a].yinYang;
  const yb = ANIMAL_BRANCHES[b].yinYang;
  const polarity = a === b
    ? `As ${ya} animals, two ${plural(a)} share the same polarity, ${ya === "Yang" ? "outward and active" : "inward and receptive"} in traditional terms.`
    : ya === yb
      ? `The ${a} and the ${b} are both ${ya} animals, so the ${a} and the ${b} share a ${ya === "Yang" ? "more outward, active" : "more inward, receptive"} polarity.`
      : `The ${ya === "Yang" ? a : b} is a Yang animal and the ${ya === "Yang" ? b : a} a Yin animal, a pairing of active and receptive energies that traditional thinking treats as complementary.`;
  return para(elementText, polarity);
}

export function buildAnimal(animal: string): PageCopy {
  const copy = ANIMAL_COPY[animal];
  const branch = ANIMAL_BRANCHES[animal];
  const index = order.indexOf(animal);
  const years = animalYears(animal).filter(({ year }) => year >= 1960 && year <= 2032);
  const earlyYear = years.find(({ year }) => LUNAR_NEW_YEAR_DATES[year].month === 2 && LUNAR_NEW_YEAR_DATES[year].day >= 5) ?? years[0];
  const lny = LUNAR_NEW_YEAR_DATES[earlyYear.year];
  const previous = zodiacYearProfile(earlyYear.year - 1);

  const yearsSection = para(
    `Recent and upcoming years of the ${animal} are ${list(years.map((y) => `${y.year} (${y.element})`))}.`,
    `Each begins at Lunar New Year rather than on January 1, so people born in January or early February need to check the date: in ${earlyYear.year}, for example, the ${animal} year began on ${MONTHS[lny.month - 1]} ${lny.day}, and anyone born before that is a ${previous.element} ${previous.animal}.`,
    `The element attached to each year comes from the ten-year cycle of heavenly stems, so a ${years[0].element} ${animal} and a ${years[1].element} ${animal} share the animal's core character but differ in flavour.`,
    `Separately, the ${animal} always carries ${branch.element} as its fixed element and a ${branch.yinYang} polarity, which describe the animal itself.`,
    `Because the five stem elements and twelve animals line up again only every sixty years, the ${years[2].element} ${animal} of ${years[2].year} returns in ${years[2].year + 60}.`,
    `The Chinese zodiac calculator on this site applies the Lunar New Year table from 1924 to 2044 automatically.`,
  );

  return {
    description: `The ${animal} in the Chinese zodiac: ${copy.gist}, its ${branch.element} element, years from ${years[0].year} to ${years[years.length - 1].year}, and its San He, Liu He and Liu Chong matches.`.slice(0, 200),
    answer: `In Chinese astrology, the ${animal} is the ${ORDINALS[index]} animal of the twelve-year cycle, with ${branch.element} as its fixed element and ${branch.yinYang} polarity. It is traditionally associated with ${copy.gist}. Your animal follows the Lunar New Year of your birth, so early-year birthdays can belong to the previous animal.`,
    sections: [
      { heading: `The ${animal} in Chinese astrology`, paragraphs: [copy.character, ANIMAL_MORE[animal][0]] },
      { heading: `The ${animal} at work`, paragraphs: [copy.work, ANIMAL_MORE[animal][1]] },
      { heading: `The ${animal} in relationships`, paragraphs: [copy.love, ANIMAL_MORE[animal][2]] },
      { heading: `Years of the ${animal} and their elements`, paragraphs: [yearsSection] },
      { heading: `Growth edges for the ${animal}`, paragraphs: [copy.growth, para(ANIMAL_MORE[animal][3], `For anyone born in ${an(animal)} year, these growth notes are prompts for reflection rather than fixed traits.`)] },
    ],
    faq: [
      ...copy.faq,
      {
        question: `What years are the Year of the ${animal}?`,
        answer: `Between 1924 and 2044 the ${animal} years are ${list(animalYears(animal).map((y) => String(y.year)))}. Each starts at Lunar New Year, which falls between January 21 and February 20.`,
      },
      {
        question: `Which animals are most compatible with the ${animal}?`,
        answer: `Traditionally the ${list(trineMates(animal))} share the ${animal}'s San He trine and the ${liuHeOf(animal)} is its Liu He secret friend. The ${liuChongOf(animal)} (Liu Chong) and the ${liuHaiOf(animal)} (Liu Hai) are the pairings readings treat as needing more care.`,
      },
    ],
  };
}

/** Names the partner inside an animal's own sentences so each pairing reads as addressed to it. */
function toward(copy: AnimalCopy, self: string, other: string): AnimalCopy {
  if (self === other) return copy;
  return {
    ...copy,
    asPartner: copy.asPartner.replace(new RegExp(`^The ${self} tends to bring`), `With the ${other}, the ${self} tends to bring`),
    needs: copy.needs.replace(new RegExp(`^The ${self} usually needs`), `With the ${other}, the ${self} usually needs`),
    friction: copy.friction.replace(/^Under stress, /, `Under stress with the ${other}, `),
    helps: copy.helps.replace(/^What helps with an? /, `What helps the ${other} with a `).replace(new RegExp(`with a (?=${"[AEIOU]"})`), "with an "),
  };
}

/** Swaps "the Wood partner" style phrases for the animal names. */
function namedEveryday(text: string, a: string, b: string): string {
  const ea = ANIMAL_BRANCHES[a].element;
  const eb = ANIMAL_BRANCHES[b].element;
  if (ea === eb) return text.replace(/^In everyday terms, shared (\w+) suggests/, `In everyday terms, the shared $1 of the ${a} and the ${b} suggests`).replace("two people", `the ${a} and the ${b}`).replace("both sides", `the ${a}'s side and the ${b}'s`).replace("two steady people", `a steady ${a} and a steady ${b}`);
  return text.replace(new RegExp(`the ${ea} partner`, "g"), `the ${a}`).replace(new RegExp(`the ${eb} partner`, "g"), `the ${b}`);
}

export function buildChinesePair(a: string, b: string): PageCopy {
  const ca = toward(ANIMAL_COPY[a], a, b);
  const cb = toward(ANIMAL_COPY[b], b, a);
  const da = ANIMAL_DAILY[a];
  const db = ANIMAL_DAILY[b];
  const same = a === b;
  const two = plural(a);
  const relations = chineseRelations(a, b);
  const primary = relations[0];
  const distance = wheelDistance(a, b);
  const rel = fiveElementRelation(a, b);
  const key = cycleKey(a, b);
  const ma = ANIMAL_PAIR_MORE[a];
  const mb = ANIMAL_PAIR_MORE[b];
  const recent = (animal: string) => animalYears(animal).filter(({ year }) => year <= 2026).slice(-2);
  const [prevA, lastA] = recent(a);
  const lastB = recent(b)[1];
  const hours = same
    ? `In the traditional double-hour clock, the ${a} also names the hours from ${ANIMAL_BRANCHES[a].hours}.`
    : `In the traditional double-hour clock, the ${a} names the hours from ${ANIMAL_BRANCHES[a].hours} and the ${b} those from ${ANIMAL_BRANCHES[b].hours}.`;
  const yearExample = same
    ? `For example, the ${a} year of ${prevA.year} was ${an(prevA.element)} year and the ${a} year of ${lastA.year} ${an(lastA.element)} year, so two ${plural(a)} born in those years differ in flavour.`
    : `For example, the most recent ${a} year, ${lastA.year}, was ${an(lastA.element)} year, and the most recent ${b} year, ${lastB.year}, ${an(lastB.element)} year.`;

  const relationLabel: Record<string, string> = {
    "same animal": "the same animal",
    "San He": "San He (three harmonies)",
    "Liu He": "Liu He (secret friends)",
    "Liu Chong": "Liu Chong (six clashes)",
    "Liu Hai": "Liu Hai (six harms)",
    "no classical pairing": "no classical pairing",
  };

  const traditional = (() => {
    if (same) {
      return [para(`When both partners are ${two}, the Chinese zodiac pairs an animal with itself. Classical tables do not list same-animal pairs among the harmonies or clashes; traditional readings instead describe them as mirrors, in which the ${a}'s ${ca.gist} is shared and so are its blind spots.`, ca.twin), para(trineNote(a, a), `Because the ${a} pairs with itself here, the ${trineElement(a)} trine still frames the relationship: both partners share the same natural allies and the same opposite.`, hours)];
    }
    if (primary === "no classical pairing") {
      return [
        CHINESE_PAIR_TEXT[key],
        para(`The ${a} and the ${b} do not appear together in the San He trines, the Liu He secret friends, the Liu Chong clashes or the Liu Hai harms, so traditional readings treat ${an(`${a}-${b}`)} pairing as open. For the ${a} and the ${b}, that places more weight on the two individuals, the five-element relationship and their year elements.`, trineNote(a, b), hours),
      ];
    }
    if (primary === "San He") return [CHINESE_PAIR_TEXT[key], para(RELATION_CONTEXT["San He"], `The third member of the ${a} and ${b}'s trine is the ${trineOf(a).find((x) => x !== a && x !== b)}, so the three are often described together.`, trineNote(a, b), hours)];
    return [PAIR_RELATION_TEXT[key], para(RELATION_CONTEXT[primary], `Each animal has exactly one ${primary} partner, so for the ${a} that partner is the ${b}, and for the ${b} it is the ${a}.`, trineNote(a, b), hours)];
  })();

  const elementKey = rel.cycle === "same element" ? `same|${ANIMAL_BRANCHES[a].element}` : `${rel.from}|${rel.to}`;
  const yearElementNote = same
    ? `Each birth year also carries its own element from the heavenly stems, so a Metal ${a} and a Water ${a} read slightly differently, and two ${plural(a)} born exactly twelve years apart will have year elements one step apart in the cycle.`
    : `Each birth year also carries its own element from the heavenly stems, so a Metal ${a} differs from a Water ${a}, and a Wood ${b} from a Fire ${b}; a full reading compares those year elements too.`;
  const natures = same
    ? `In five-element terms the ${a}'s ${ANIMAL_BRANCHES[a].element} is associated with ${ELEMENT_NATURE[ANIMAL_BRANCHES[a].element]}, a quality two ${plural(a)} hold in common.`
    : rel.cycle === "same element"
      ? `In five-element terms ${ANIMAL_BRANCHES[a].element} is associated with ${ELEMENT_NATURE[ANIMAL_BRANCHES[a].element]}, a quality the ${a} and the ${b} hold in common.`
      : `In five-element terms the ${a}'s ${ANIMAL_BRANCHES[a].element} is associated with ${ELEMENT_NATURE[ANIMAL_BRANCHES[a].element]}, and the ${b}'s ${ANIMAL_BRANCHES[b].element} with ${ELEMENT_NATURE[ANIMAL_BRANCHES[b].element]}.`;

  return {
    description: `${a} and ${b} compatibility in the Chinese zodiac: ${relationLabel[primary]}, their ${ANIMAL_BRANCHES[a].element}${same ? "" : ` and ${ANIMAL_BRANCHES[b].element}`} elements, yin-yang, and what helps the pairing.`.slice(0, 200),
    answer: same
      ? `In Chinese astrology, two ${two} share the same branch, ${ANIMAL_BRANCHES[a].element} element and ${ANIMAL_BRANCHES[a].yinYang} polarity, so the match is read as a mirror. Each recognises the other's ${ca.gist}; the pairing tends to work best when the shared blind spot, ${ca.frictionShort}, is named early.`
      : fitAnswer(`In Chinese astrology, the ${a} and the ${b} are ${primary === "no classical pairing" ? "not linked by any of the classical harmony or clash structures" : `a ${relationLabel[primary]} pairing`}, with ${ANIMAL_BRANCHES[a].element} and ${ANIMAL_BRANCHES[b].element} as fixed elements (${rel.description.toLowerCase()}). The ${a} brings ${ca.gist} and the ${b} ${cb.gist}.`, ["The tradition reads these as themes to work with, not a verdict."]),
    sections: [
      {
        heading: same ? `How two ${two} relate` : `How the ${a} and the ${b} relate`,
        paragraphs: same
          ? [para(ca.asPartner, da.first, `Traditional readings associate the ${a} with ${ca.gist}, and in a same-animal pair that quality is present twice.`, ma.values), para(`Two ${two} may have been born in the same year or twelve, twenty-four or more years apart, so their year elements can differ even though the animal is shared.`, ca.needs, `Both partners usually need this at once, which can be a source of deep understanding or of competition for the same thing.`, `Friends often notice that two ${plural(a)} share habits as well as values, from how they handle plans to how they greet strangers.`)]
          : [para(ca.asPartner, cb.asPartner, ma.values, mb.values), para(da.first, secondVoice(db.first), `Traditional readings associate the ${a} with ${ca.gist} and the ${b} with ${cb.gist}.`, DISTANCE_TEXT[distance](a, b))],
      },
      { heading: same ? `What the tradition says about a same-animal pair` : `The traditional link: ${relationLabel[primary]}`, paragraphs: traditional },
      { heading: `Five elements and yin-yang`, paragraphs: [para(elementParagraph(a, b), natures), para(namedEveryday(ELEMENT_EVERYDAY[elementKey], a, b), yearElementNote, yearExample)] },
      {
        heading: same ? `Friction and what helps two ${two}` : `Needs, friction and what helps`,
        paragraphs: same
          ? [para(ca.friction, `When both partners respond this way at once, the pattern tends to amplify rather than balance out.`, withPartner(da.repair, a)), ma.twinFriction, para(ca.helps, `For two ${two}, agreeing in advance who will step back first when ${ca.frictionShort} appears can keep a shared trait from becoming a shared problem, and taking turns in that role keeps it fair.`)]
          : [para(ca.needs, cb.needs), para(ca.friction, secondVoice(cb.friction)), para(ca.helps, cb.helps), para(withPartner(da.repair, b), secondVoice(withPartner(db.repair, a)))],
      },
      {
        heading: same ? `Two ${two} day to day` : `The ${a} and the ${b} day to day`,
        paragraphs: same
          ? [para(withPartner(da.atHome, a), ma.homeMore, da.twinMore), para(`Traditionally ${da.activity}, which two ${plural(a)} can enjoy side by side.`, withPartner(da.asTeam, a), ma.teamMore, `On a shared team, two ${two} tend to reinforce each other's ${firstOf(ca.gist)}, which is a real asset once roles are clearly divided.`)]
          : [para(withPartner(da.atHome, b), ma.homeMore, withPartner(db.atHome, a), mb.homeMore), para(withPartner(da.asTeam, b), ma.teamMore, withPartner(db.asTeam, a), mb.teamMore, `Shared projects that draw on the ${a}'s ${firstOf(ca.gist)} and the ${b}'s ${firstOf(cb.gist)} tend to show this pairing at its best.`)],
      },
    ],
    faq: [
      {
        question: `Are the ${a} and the ${b} compatible in the Chinese zodiac?`,
        answer: same
          ? `Classical tables do not rate same-animal pairs as harmonies or clashes. Two ${two} tend to understand each other quickly and share the same blind spot, ${ca.frictionShort}, so awareness matters more than any rating.`
          : `Traditionally the ${a} and the ${b} are ${primary === "no classical pairing" ? "an open pairing with no classical harmony or clash" : `a ${relationLabel[primary]} pairing`}. That describes a tendency, not a verdict; for the ${a} and the ${b}, the themes to watch are ${ca.frictionShort} and ${cb.frictionShort}.`,
      },
      {
        question: `What are the elements of the ${a}${same ? "" : ` and the ${b}`}?`,
        answer: same
          ? `The ${a}'s fixed element is ${ANIMAL_BRANCHES[a].element} and its polarity is ${ANIMAL_BRANCHES[a].yinYang}. Each birth year adds a separate year element from the heavenly stems.`
          : `The ${a}'s fixed element is ${ANIMAL_BRANCHES[a].element} (${ANIMAL_BRANCHES[a].yinYang}) and the ${b}'s is ${ANIMAL_BRANCHES[b].element} (${ANIMAL_BRANCHES[b].yinYang}); in the five-element cycles, ${rel.description.toLowerCase()}. Each birth year adds a separate year element.`,
      },
      {
        question: same ? `Which animals are best for the ${a}?` : `Which San He trine do the ${a} and the ${b} belong to?`,
        answer: same
          ? `Traditionally the ${list(trineMates(a))} share the ${a}'s San He trine and the ${liuHeOf(a)} is its Liu He secret friend.`
          : trineOf(a).includes(b)
            ? `Both belong to the ${trineElement(a)} trine, ${list(SAN_HE_TRINES.find((t) => t.includes(a))!)}.`
            : `The ${a} belongs to the ${trineElement(a)} trine and the ${b} to the ${trineElement(b)} trine, so they are not trine mates.`,
      },
      {
        question: `What might the ${a} and the ${b} enjoy doing together?`,
        answer: same
          ? `Traditionally ${da.activity}. Two ${two} often enjoy these side by side, and taking turns to choose keeps plans fresh.`
          : `Traditionally ${da.activity}, while ${db.activity}. Alternating who chooses gives both a taste of the other's world.`,
      },
      {
        question: `Does the Chinese zodiac use the calendar year?`,
        answer: same
          ? `No. Animal years begin at Lunar New Year: the ${a} year of ${lastA.year} began on ${lnyOf(lastA.year)}, and the one before it, in ${prevA.year}, on ${lnyOf(prevA.year)}, so January birthdays need checking. The calculator does this automatically.`
          : `No. Animal years begin at Lunar New Year: the ${a} year of ${lastA.year} began on ${lnyOf(lastA.year)} and the ${b} year of ${lastB.year} on ${lnyOf(lastB.year)}, so January birthdays need checking. The calculator does this automatically.`,
      },
    ],
  };
}
