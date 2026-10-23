import { lifePathExample, lifePathMeaning, lifePathPairFacts } from "../../../lib/library/facts";
import { MASTER_ROOTS } from "../../../lib/library/registry";
import type { PageCopy } from "./index";
import { LIFE_PATH_PAIR_DEPTH, LIFE_PATH_PAIR_HOOKS } from "./life-path-pairs";
import { LIFE_PATH_MORE } from "./extensions";
import { NUMBER_COPY, PARTNER_COPY, PARTNER_EXTRA, PARTNER_MORE } from "./numbers";
import { list, para, secondVoice, withPartner } from "./util";

/**
 * A common modern grouping in popular numerology (not part of the
 * Pythagorean calculation itself): thinkers, builders and creatives.
 */
const FAMILIES: Array<{ name: string; members: number[]; theme: string }> = [
  { name: "the thinkers", members: [1, 5, 7], theme: "independence of mind and a need for personal freedom" },
  { name: "the builders", members: [2, 4, 8], theme: "practicality, security and steady effort" },
  { name: "the creatives", members: [3, 6, 9], theme: "feeling, expression and care for others" },
];
const familyOf = (n: number) => FAMILIES.find((f) => f.members.includes(MASTER_ROOTS[n] ?? n))!;

const t = (n: number) => lifePathMeaning(n).title;
const k = (n: number) => lifePathMeaning(n).keywords[0];
const pick = (pair: number[], family: string) => pair.find((n) => familyOf(n).name === family)!;

const FAMILY_PAIR_TEXT: Record<string, (a: number, b: number) => string> = {
  "the thinkers|the thinkers": (a, b) => `In a grouping many modern numerologists use, ${a === b ? `both ${a}s` : `${a} and ${b}`} belong to the thinkers (1, 5 and 7), numbers linked with independence of mind. ${a === b ? `Two people on the path of ${t(a)}` : `${t(a)} and ${t(b)}`} usually understand each other's need for personal space and dislike being told what to do. The shared blind spot is warmth: with ${k(a)} and ${k(b)} in the foreground, closeness can be assumed rather than said.`,
  "the builders|the builders": (a, b) => `In a grouping many modern numerologists use, ${a === b ? `both ${a}s` : `${a} and ${b}`} belong to the builders (2, 4 and 8), numbers linked with practicality and security. ${a === b ? `Two people on the path of ${t(a)}` : `${t(a)} and ${t(b)}`} tend to agree on effort, loyalty and planning ahead. The shared blind spot is rigidity: when ${k(a)} and ${k(b)} both point toward stability, change can feel like a threat rather than an opening.`,
  "the creatives|the creatives": (a, b) => `In a grouping many modern numerologists use, ${a === b ? `both ${a}s` : `${a} and ${b}`} belong to the creatives (3, 6 and 9), numbers linked with feeling, expression and care. ${a === b ? `Two people on the path of ${t(a)}` : `${t(a)} and ${t(b)}`} usually share emotional openness and a generous outlook. The shared blind spot is practicality, since ${k(a)} and ${k(b)} can both crowd out the logistics.`,
  "the builders|the thinkers": (a, b) => { const th = pick([a, b], "the thinkers"); const bu = pick([a, b], "the builders"); return `In a grouping many modern numerologists use, the ${th}, ${t(th)}, sits with the thinkers (1, 5 and 7) and the ${bu}, ${t(bu)}, with the builders (2, 4 and 8). The ${th} brings independence and new angles rooted in ${k(th)}, and the ${bu} brings method and follow-through rooted in ${k(bu)}. These styles complement each other once neither expects the other to work the same way.`; },
  "the creatives|the thinkers": (a, b) => { const th = pick([a, b], "the thinkers"); const cr = pick([a, b], "the creatives"); return `In a grouping many modern numerologists use, the ${th}, ${t(th)}, sits with the thinkers (1, 5 and 7) and the ${cr}, ${t(cr)}, with the creatives (3, 6 and 9). The ${th} tends to lead with ideas and ${k(th)}, the ${cr} with feeling and ${k(cr)}, so conversations can be rich but sometimes cross wires. Naming whether a talk is about solving or about sharing helps.`; },
  "the builders|the creatives": (a, b) => { const bu = pick([a, b], "the builders"); const cr = pick([a, b], "the creatives"); return `In a grouping many modern numerologists use, the ${bu}, ${t(bu)}, sits with the builders (2, 4 and 8) and the ${cr}, ${t(cr)}, with the creatives (3, 6 and 9). The ${bu} offers structure grounded in ${k(bu)}, and the ${cr} offers warmth grounded in ${k(cr)}, which can make a well-rounded household or team. Tension tends to appear around priorities: plans and budgets on one side, people and meaning on the other.`; },
};

const familyPairText = (a: number, b: number) => {
  const key = [familyOf(a).name, familyOf(b).name].sort().join("|");
  return FAMILY_PAIR_TEXT[key](a, b);
};

const PARITY_TEXT: Record<string, (a: number, b: number) => string> = {
  "both odd": (a, b) => `${a === b ? `Two ${a}s` : `Both ${a} and ${b}`} are odd numbers, which traditional numerology associates with active, outward and self-expressive energy. Odd-odd pairings such as ${a} with ${b} are often described as stimulating, with initiative on each side, and they can be prone to clashes of will because ${a === b ? `both partners on the path of ${t(a)}` : `${t(a)} and ${t(b)}`} would rather move than wait.`,
  "both even": (a, b) => `${a === b ? `Two ${a}s` : `Both ${a} and ${b}`} are even numbers, which traditional numerology associates with receptive, steady and relationship-minded energy. Even-even pairings such as ${a} with ${b} are often described as secure and considerate, with a shared preference for stability, and they can become cautious, with ${a === b ? `both partners on the path of ${t(a)}` : `${t(a)} and ${t(b)}`} waiting for the other to take the risk.`,
  "one odd, one even": (a, b) => { const odd = a % 2 ? a : b; const even = a % 2 ? b : a; return `${odd} is an odd number and ${even} is an even number. Traditional numerology links odd numbers with active, outward energy and even numbers with receptive, steadying energy, so this pairing is often read as complementary: ${t(odd)} tends to initiate while ${t(even)} tends to consolidate. The balance works when the ${odd} values the ${even}'s role instead of trying to convert it, and the reverse.`; },
};

const titleOf = (n: number) => lifePathMeaning(n).title;
const keywordsOf = (n: number) => lifePathMeaning(n).keywords;

export function buildLifePath(n: number): PageCopy {
  const copy = NUMBER_COPY[n];
  const meaning = lifePathMeaning(n);
  const root = MASTER_ROOTS[n];
  const family = familyOf(n);
  const example = lifePathExample(n);
  const kin = family.members.filter((m) => m !== (root ?? n));
  const masterOf = Object.entries(MASTER_ROOTS).find(([, r]) => r === n)?.[0];

  const calculation = para(
    `Life Path ${n} comes from the full date of birth. In the Pythagorean method used by Unified Reading, the month, the day and the year are each reduced to a single digit or a master number, then added together and reduced again if needed.`,
    `For example, a birth date of ${example.date} gives ${example.steps}, so the Life Path is ${n}.`,
    `Reducing the three parts separately matters: adding every digit in one long string can produce a different result, especially where 11 or 22 would appear along the way.`,
    masterOf
      ? `When a final total of ${masterOf} appears, it is kept as master number ${masterOf} rather than reduced to ${n}, which is why people with Life Path ${masterOf} often read the ${n} material as well.`
      : `Life Path ${n} is not linked to a master number, so the only way to reach it is a total that reduces to ${n} directly.`,
    `Unified Reading applies exactly these steps when it builds a reading.`,
    `The Life Path calculator on this site shows each step for any date, and it runs in the browser without sending the date anywhere.`,
  );

  return {
    description: `Life Path ${n} meaning in numerology: ${meaning.title}, ${list(meaning.keywords)}, with work, relationship and growth themes${root ? ` and how master number ${n} relates to ${root}` : ""}.`.slice(0, 200),
    answer: `In numerology, Life Path ${n} is ${meaning.title}, a path traditionally associated with ${list(meaning.keywords)}. It is calculated from the full date of birth${root ? `, kept whole as a master number` : ""}, and it is read as a set of tendencies around ${copy.gist} rather than a fixed description of anyone.`,
    sections: [
      { heading: `What Life Path ${n} describes`, paragraphs: [copy.core, LIFE_PATH_MORE[n][0]] },
      { heading: `Life Path ${n} at work`, paragraphs: [copy.work, LIFE_PATH_MORE[n][1]] },
      { heading: `Life Path ${n} in love and friendship`, paragraphs: [copy.love, LIFE_PATH_MORE[n][2]] },
      { heading: `Growth edges for Life Path ${n}`, paragraphs: [copy.growth, LIFE_PATH_MORE[n][3]] },
      root
        ? { heading: `Why ${n} is a master number`, paragraphs: [copy.master!, LIFE_PATH_MORE[n][4]] }
        : { heading: `How Life Path ${n} is calculated`, paragraphs: [calculation] },
    ],
    faq: [
      ...copy.faq,
      {
        question: `Which Life Path numbers are most compatible with ${n}?`,
        answer: `In a grouping many modern numerologists use, ${root ? `${n}, through its root ${root}, sits` : `${n} sits`} with ${list(kin.map(String))} among ${family.name}, numbers linked with ${family.theme}, so those pairings are often described as easy to understand. Pairings across groups can be just as strong; they simply ask for more translation between styles.`,
      },
      {
        question: `Does Life Path ${n} decide someone's personality?`,
        answer: `No. Numerology offers Life Path ${n} as a lens for reflection, describing themes such as ${list(keywordsOf(n).slice(0, 2))}. A Unified Reading combines it with name numbers, the Sun sign and the Chinese zodiac so that no single number is treated as the whole story.`,
      },
    ],
  };
}

export function buildLifePathPair(a: number, b: number): PageCopy {
  const f = lifePathPairFacts(a, b);
  const pa = PARTNER_COPY[a];
  const pb = PARTNER_COPY[b];
  const hook = LIFE_PATH_PAIR_HOOKS[`${a}-${b}`];
  const same = a === b;
  const combinedCopy = NUMBER_COPY[f.combined];
  const sumText = `${a} + ${b} = ${a + b}${a + b === f.combined ? "" : `, which reduces to ${f.combined}`}`;
  const sharedKeywords = keywordsOf(a).filter((k) => keywordsOf(b).includes(k));

  const keywordSentence = same
    ? `Both people carry the same traditional keywords, ${list(keywordsOf(a))}, so strengths double and so do blind spots.`
    : `Side by side, the keywords for ${a} (${list(keywordsOf(a))}) and for ${b} (${list(keywordsOf(b))}) ${sharedKeywords.length ? `overlap on ${list(sharedKeywords)}` : "do not overlap, which is often where the pairing's growth lies"}.`;

  const combined = para(
    `Some numerologists also add two Life Path numbers together to describe the relationship as a third presence. For this pairing, ${sumText}${f.combined in MASTER_ROOTS ? `, a master number that is kept whole` : ""}.`,
    `Life Path ${f.combined} is ${titleOf(f.combined)}, so the shared life of a ${a} and a ${b} is often read as leaning toward ${combinedCopy.gist}.`,
    `This is an optional layer, not part of either person's own Life Path, and it works best as a question to talk about: where does ${combinedCopy.gist} already show up for the two of you?`,
  );

  const ma = PARTNER_MORE[a];
  const mb = PARTNER_MORE[b];
  const pm = (text: string, other: number) => withPartner(text, other);
  const titles = same
    ? `In the traditional titles, this is ${titleOf(a)} meeting ${titleOf(a)}, a pairing of equals that rarely needs to explain itself.`
    : `In the traditional titles, ${titleOf(a)} meets ${titleOf(b)}, which already hints at the different instincts each brings to shared decisions.`;
  const practice = same
    ? para(pa.tryThis, `In a pairing of two ${a}s, it can help for both people to take this on at once, so neither feels singled out.`, pm(ma.question, b))
    : para(pa.tryThis, pb.tryThis, pm(ma.question, b), pm(mb.question, a));

  return {
    description: `Life Path ${a} and ${b} compatibility in numerology: how ${titleOf(a)} and ${titleOf(b)} connect, common friction, the combined number ${f.combined} and practical ideas.`.slice(0, 200),
    answer: same
      ? `In numerology, two Life Path ${a}s (${titleOf(a)}) share ${NUMBER_COPY[a].gist}, so the bond can feel familiar quickly. The pairing tends to work best when ${hook.gist}, since the same strengths and the same blind spots show up on both sides of the relationship.`
      : `In numerology, Life Path ${a} (${titleOf(a)}) and Life Path ${b} (${titleOf(b)}) are often read as ${f.parity === "one odd, one even" ? "complementary" : f.parity === "both odd" ? "two active, outward numbers" : "two steady, receptive numbers"}. The ${a} tends to bring ${NUMBER_COPY[a].gist} and the ${b} ${NUMBER_COPY[b].gist}; the pairing tends to work best when ${hook.gist}.`,
    sections: [
      {
        heading: same ? `How two Life Path ${a}s tend to meet` : `How Life Path ${a} and Life Path ${b} tend to meet`,
        paragraphs: same ? [para(hook.hook, pm(ma.everyday, b)), para(pa.brings, pa.twin)] : [para(hook.hook, pa.brings, pb.brings), para(pm(ma.everyday, b), secondVoice(pm(mb.everyday, a)))],
      },
      {
        heading: same ? `What two ${a}s share` : `Where ${a} and ${b} agree and differ`,
        paragraphs: [PARITY_TEXT[f.parity](a, b), para(familyPairText(a, b), keywordSentence, titles)],
      },
      {
        heading: same ? `What each ${a} needs, and where friction starts` : `What each number needs, and where friction starts`,
        paragraphs: same
          ? [para(pa.needs, `When both partners need this at once, it helps to say so rather than compete for it.`), para(pa.friction, `With two ${a}s, the same reaction can arrive from both sides at the same moment, which is why naming the pattern early tends to defuse it.`, pm(ma.repair, b)), PARTNER_EXTRA[a].twinMore]
          : [para(pa.needs, pb.needs), para(pa.friction, pb.friction), para(pm(ma.repair, b), pm(mb.repair, a))],
      },
      {
        heading: same ? `Two ${a}s at home and at work` : `Life Path ${a} and ${b} at home and at work`,
        paragraphs: same
          ? [LIFE_PATH_PAIR_DEPTH[`${a}-${b}`], para(pm(ma.atHome, b), PARTNER_EXTRA[a].twinHome), para(pm(ma.atWork, b), PARTNER_EXTRA[a].twinWork)]
          : [LIFE_PATH_PAIR_DEPTH[`${a}-${b}`], para(pm(ma.atHome, b), secondVoice(pm(mb.atHome, a))), para(pm(ma.atWork, b), secondVoice(pm(mb.atWork, a)))],
      },
      { heading: `The combined number ${f.combined} and practical steps`, paragraphs: [combined, practice] },
    ],
    faq: [
      {
        question: `Are Life Path ${a} and ${b} compatible?`,
        answer: `Numerology does not score relationships, but it does describe themes. ${same ? `Two ${a}s share ${NUMBER_COPY[a].gist}` : `The ${a} brings ${NUMBER_COPY[a].gist} and the ${b} brings ${NUMBER_COPY[b].gist}`}, and the pairing tends to work best when ${hook.gist}. Any pairing can work well; the numbers suggest what to pay attention to.`,
      },
      {
        question: `What is the combined number for Life Path ${a} and ${b}?`,
        answer: `Adding the two Life Path numbers gives ${sumText}. Life Path ${f.combined} is ${titleOf(f.combined)}, so some numerologists read the relationship itself as leaning toward ${combinedCopy.gist}. It is an optional, interpretive layer.`,
      },
      {
        question: `What tends to cause friction between Life Path ${a} and ${b}?`,
        answer: same
          ? `The usual friction point is ${pa.frictionShort}, appearing on both sides at once. Pairs of ${a}s tend to manage it by agreeing in advance how they will handle that moment.`
          : `The usual friction points are ${pa.frictionShort} and ${pb.frictionShort}. They are easier to manage once both people can name them without blame.`,
      },
      same
        ? {
          question: `Are two Life Path ${a}s too similar?`,
          answer: `Similarity is a starting point, not a problem. Two ${a}s tend to understand each other's motives quickly; the work is making sure the shared blind spot, ${pa.frictionShort}, is noticed by at least one of them.`,
        }
        : {
          question: `Is ${b}-and-${a} the same as ${a}-and-${b}?`,
          answer: `Yes. Life Path compatibility is symmetrical, so the order of the numbers does not change the reading. This page covers Life Path ${a} with Life Path ${b} in either order.`,
        },
      {
        question: `What might Life Path ${a} and ${b} enjoy doing together?`,
        answer: same
          ? `Numerology suggests that ${PARTNER_EXTRA[a].activity}. Two ${a}s often enjoy doing these side by side, and taking turns choosing keeps the plans fresh.`
          : `Numerology suggests that ${PARTNER_EXTRA[a].activity}, while ${PARTNER_EXTRA[b].activity}. Alternating who chooses gives both partners a taste of the other's world.`,
      },
    ],
  };
}
