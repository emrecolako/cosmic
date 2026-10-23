export const list = (items: readonly string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const an = (word: string) => (/^([aeiou]|8|11\b|18\b)/i.test(word) ? `an ${word}` : `a ${word}`);

/** Fills the partner placeholder: "a {o}" becomes "an 8", "{o}" becomes "8". */
export const withPartner = (text: string, other: string | number) =>
  text.replace(/\ba \{o\}/g, an(String(other))).replace(/\bA \{o\}/g, cap(an(String(other)))).replace(/\{o\}/g, String(other));

export const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Joins non-empty sentences/fragments into one paragraph. */
export const para = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export const ordinal = (n: number) => ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"][n] ?? String(n);

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** Appends optional closing sentences until the answer reaches 40 words, never passing 60. */
export function fitAnswer(base: string, extras: string[]): string {
  let answer = base;
  for (const extra of extras) {
    if (countWords(answer) >= 44) break;
    if (countWords(`${answer} ${extra}`) <= 60) answer = `${answer} ${extra}`;
  }
  return answer;
}

/** Varies the opener of the second partner's sentence so paired paragraphs don't repeat it. */
export function secondVoice(text: string, pronoun: "their" | "its" = "their"): string {
  return text
    .replace(/^Day to day, /, "Meanwhile, ")
    .replace(/^Under pressure, /, "Under the same pressure, ")
    .replace(/^After a disagreement, /, `For ${pronoun} part, after a disagreement, `)
    .replace(/^At home, /, `For ${pronoun} part at home, `)
    .replace(/^As colleagues, /, "Alongside that, as colleagues, ")
    .replace(/^When stressed(,| around)/, "Under stress$1")
    .replace(/^In conversation(,| with)/, "When talking$1")
    .replace(/^After an argument, /, "For its part, after an argument, ")
    .replace(/^As a colleague, /, "In turn, as a colleague, ")
    .replace(/^As a teammate, /, "In turn, as a teammate, ")
    .replace(/^On first meeting/, "Meeting for the first time");
}

/**
 * Picks the sentence of a pair-specific paragraph that best says how the two
 * get along, for the share image. Always a verbatim sentence of the page.
 */
export function pairLine(paragraph: string, names: string[]): string {
  const sentences = paragraph.match(/[^.!?]+[.!?]+(?=\s|$)/g)?.map((s) => s.trim()) ?? [paragraph];
  // A line that names the pair reads on its own when quoted out of context.
  const fits = sentences.filter((s) => s.length <= 170 && names.some((name) => s.includes(name)));
  const dynamic = /\b(read as|described as|balanc|complement|meeting of|contrast|admire|tends? to|often|can )/;
  const standalone = fits.filter((s) => !/^(They|Together|Both|Each|It)\b/.test(s));
  return standalone.find((s) => dynamic.test(s)) ?? standalone[0] ?? fits.find((s) => dynamic.test(s)) ?? fits[0] ?? sentences[0];
}
