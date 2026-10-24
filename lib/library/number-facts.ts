/**
 * Computed facts for the wave-4 numerology pages: worked name examples,
 * birthday-number reductions, Personal Year counts and personal months, and
 * angel-number roots. Everything uses the same tables as lib/numerology.ts.
 */
import { INTERPRETATIONS, PYTHAGOREAN_VALUES, VOWELS, calculateExpression, calculatePersonalYear, calculatePersonality, calculateSoulUrge, reduceToSingleDigit } from "../numerology";
import { BIRTHDAYS, birthdayLabel } from "./calendar";
import type { NameNumberKind } from "./registry";

/** Fictional names for worked examples (first + last, combined until one fits). */
const FIRST_NAMES = ["Maria", "James", "Sofia", "Daniel", "Amara", "Lucas", "Elena", "Noah", "Priya", "Samuel", "Grace", "Mateo", "Hana", "Oliver", "Leila", "Ethan", "Nadia", "Isaac", "Clara", "Omar", "Ruth", "Felix", "Yara", "Hugo", "Ines", "Adam", "Zoe", "Kofi", "Lena", "Theo"];
const MIDDLE_NAMES = ["", "Ann", "Jo", "Lee", "May", "Rose", "Kai", "Eve", "Ann Marie", "Jo Ellen", "Rose Anna", "Lee Edward", "Kai Matthew"];
const LAST_NAMES = ["Lopez", "Okafor", "Bennett", "Novak", "Haddad", "Rossi", "Silva", "Walsh", "Cohen", "Ibrahim", "Larsen", "Moreau", "Patel", "Hughes", "Tanaka", "Costa", "Dubois", "Nguyen", "Fischer", "Reyes"];

const CALCULATE: Record<NameNumberKind, (name: string) => number> = { expression: calculateExpression, "soul-urge": calculateSoulUrge, personality: calculatePersonality };
const LETTERS: Record<NameNumberKind, (letter: string) => boolean> = {
  expression: () => true,
  "soul-urge": (letter) => VOWELS.has(letter),
  personality: (letter) => !VOWELS.has(letter),
};
export const INTERPRETATION_KEY: Record<NameNumberKind, "expression" | "soulUrge" | "personality"> = { expression: "expression", "soul-urge": "soulUrge", personality: "personality" };

/** "22" for a master total, otherwise the reduction steps: "34 → 7". */
export function reductionChain(total: number): string {
  const steps = [total];
  let n = total;
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((sum, d) => sum + Number(d), 0);
    steps.push(n);
  }
  return steps.join(" → ");
}

export interface NameExample { name: string; letters: string; values: number[]; total: number; result: number }

/**
 * A fictional full name whose number in this position is n, with the letters
 * counted. First names rotate with n so the examples vary; middle names are
 * only tried when no two-part name fits (Expression 2 needs a total of 20, 101 or 110).
 */
export function nameExample(kind: NameNumberKind, n: number): NameExample | undefined {
  const firsts = [...FIRST_NAMES.slice(n % FIRST_NAMES.length), ...FIRST_NAMES.slice(0, n % FIRST_NAMES.length)];
  for (const middle of MIDDLE_NAMES) for (const first of firsts) {
    for (const last of LAST_NAMES) {
      const name = [first, middle, last].filter(Boolean).join(" ");
      if (CALCULATE[kind](name) !== n) continue;
      const letters = name.toUpperCase().split("").filter((ch) => PYTHAGOREAN_VALUES[ch] !== undefined && LETTERS[kind](ch));
      const values = letters.map((ch) => PYTHAGOREAN_VALUES[ch]);
      const total = values.reduce((sum, v) => sum + v, 0);
      return { name, letters: letters.join(" "), values, total, result: n };
    }
  }
  return undefined;
}

export const nameTitle = (kind: NameNumberKind, n: number) => INTERPRETATIONS[INTERPRETATION_KEY[kind]][n];

/** Personal Year facts for one number and calendar year. */
export function personalYearFacts(n: number, year: number) {
  const dates = BIRTHDAYS.filter((d) => calculatePersonalYear(new Date(2024, d.month - 1, d.day), year) === n);
  const yearDigits = String(year).split("").reduce((sum, d) => sum + Number(d), 0);
  return {
    count: dates.length,
    examples: dates.slice(0, 4).map(birthdayLabel),
    /** The first qualifying birthday in each month that has one. */
    byMonth: dates.filter((d, i) => i === 0 || dates[i - 1].month !== d.month).map(birthdayLabel),
    universal: reduceToSingleDigit(yearDigits),
    universalSteps: `${String(year).split("").join(" + ")} = ${reductionChain(yearDigits)}`,
    months: Array.from({ length: 12 }, (_, m) => reduceToSingleDigit(n + m + 1)),
    /** The first example birthday's Personal Year the year before and after. */
    neighbours: dates[0]
      ? { previous: calculatePersonalYear(new Date(2024, dates[0].month - 1, dates[0].day), year - 1), next: calculatePersonalYear(new Date(2024, dates[0].month - 1, dates[0].day), year + 1) }
      : { previous: 0, next: 0 },
    title: INTERPRETATIONS.personalYear[n],
  };
}

/** Angel sequence digit sum and Pythagorean root. */
export function angelFacts(sequence: string) {
  const digits = sequence.split("").map(Number);
  const total = digits.reduce((sum, d) => sum + d, 0);
  return { digits, total, root: reduceToSingleDigit(total), steps: `${digits.join(" + ")} = ${reductionChain(total)}` };
}
