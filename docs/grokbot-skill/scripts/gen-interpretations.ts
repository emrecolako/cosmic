import { INTERPRETATIONS } from "../../../lib/numerology";
import { getChineseZodiac } from "../../../lib/chinese-zodiac";
import { getSunSign } from "../../../lib/western-astrology";

const out: string[] = [];
const p = (s = "") => out.push(s);

p("# Interpretation tables");
p();
p("Generated from `lib/numerology.ts`, `lib/western-astrology.ts` and");
p("`lib/chinese-zodiac.ts` so the bot and the web app never drift apart.");
p();
p("Use the **titles and keywords verbatim** — they are the shared vocabulary. The");
p("`brief` text is source material for your own prose, not copy to paste into a");
p("reading. Someone who reads their own reading twice should not see the same");
p("sentence they saw on the website.");
p();
p("---");
p();
p("## Numerology");
p();

const NUM_SECTIONS: [string, string, string][] = [
  ["lifePath", "Life Path", "From the date of birth. The overarching journey — the lesson the whole life keeps returning to. The single most important number in the profile."],
  ["expression", "Expression (Destiny)", "From all letters of the birth name. Natural talents and how they are meant to be used in the world."],
  ["soulUrge", "Soul Urge (Heart's Desire)", "From the vowels. What the person actually wants underneath what they say they want. The private number."],
  ["personality", "Personality", "From the consonants. The first impression — how strangers read them before they know them."],
  ["personalYear", "Personal Year", "From birth month + birth day + current year. Where they are in the nine-year cycle. This is the number that makes a reading feel like now."],
];

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

for (const [key, label, blurb] of NUM_SECTIONS) {
  p(`### ${label}`);
  p();
  p(blurb);
  p();
  for (const n of ORDER) {
    const entry = INTERPRETATIONS[key][n];
    if (!entry) continue;
    const master = n >= 11 ? " *(master number — never reduced)*" : "";
    p(`**${n} — ${entry.title}**${master}`);
    p(`${entry.brief}`);
    p(`Keywords: ${entry.keywords.join(", ")}`);
    p();
  }
  p("---");
  p();
}

p("## Western zodiac signs");
p();
p("Element, modality and ruling planet are as much of the reading as the sign name.");
p("Two Fire signs share a temperature; a Cardinal and a Mutable sign of the same");
p("element behave completely differently.");
p();

// One mid-sign date per sign, in 1990, to pull each sign's metadata.
const SIGN_DATES: [number, number][] = [
  [2, 30], [3, 28], [4, 30], [5, 30], [6, 30], [7, 30],
  [8, 30], [9, 30], [10, 30], [0, 15], [1, 10], [2, 10],
];

for (const [month, day] of SIGN_DATES) {
  const s = getSunSign(new Date(1990, month, day));
  p(`**${s.sign} ${s.glyph}** — ${s.element}, ${s.modality}, ruled by ${s.rulingPlanet}`);
  p(s.description);
  p(`Traits: ${s.traits.join(", ")}`);
  p();
}

p("Decans are true 10° divisions of a sign: 1st decan is the sign at its most");
p("characteristic, 2nd and 3rd shade toward the other two signs of the same element.");
p();
p("---");
p();
p("## Chinese zodiac");
p();

// One date per animal year, well clear of any Lunar New Year boundary.
const ANIMAL_YEARS = [1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007];
for (const year of ANIMAL_YEARS) {
  const z = getChineseZodiac(new Date(year, 5, 15));
  p(`**${z.animal} ${z.emoji}**`);
  p(z.description);
  p(`Harmonises with: ${z.compatibility.bestWith.join(", ")}`);
  p(`Friction with: ${z.compatibility.challenging.join(", ")}`);
  p();
}

p("### Elements");
p();
const ELEMENT_YEARS = [1984, 1986, 1988, 1990, 1992];
for (const year of ELEMENT_YEARS) {
  const z = getChineseZodiac(new Date(year, 5, 15));
  p(`**${z.element}** — ${z.elementDescription}`);
  p();
}

p("The element modifies the animal rather than replacing it: a Metal Rabbit is");
p("still gentle, but with a spine the Water Rabbit does not have.");
p();
p("Yang years are even, Yin years odd. Yang reads as outward, initiating,");
p("expressive; Yin as inward, receptive, considered. Neither is better and the");
p("reading should never imply it.");

console.log(out.join("\n"));
