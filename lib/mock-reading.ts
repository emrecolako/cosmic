/**
 * Dev-only stand-in for the AI reading, used when COSMIC_MOCK_READING is set
 * (see `npm run dev:mock`). Lets the full funnel — streaming progress, the
 * finished reading, share/copy and the retry state — be exercised without an
 * OpenRouter key or network access. Never used in production.
 */

interface MockInput {
  fullName: string;
  lifeStage: string;
  whatsOnYourMind?: string;
  numerology: { lifePath: { number: number }; personalYear: { number: number } };
  westernAstro: { sunSign: { sign: string }; moonSign?: string | null; risingSign?: string | null };
  chineseZodiac: { element: string; animal: string };
}

export function mockReading(input: MockInput): string {
  const firstName = input.fullName.trim().split(/\s+/)[0];
  const lifePath = input.numerology.lifePath.number;
  const year = input.numerology.personalYear.number;
  const sun = input.westernAstro.sunSign.sign;
  const animal = `${input.chineseZodiac.element} ${input.chineseZodiac.animal}`;
  const moon = input.westernAstro.moonSign
    ? ` Your ${input.westernAstro.moonSign} moon softens the edges and asks for room to feel things fully.`
    : "";
  const mind = input.whatsOnYourMind
    ? `\n\nYou mentioned: "${input.whatsOnYourMind}". Read that through your Life Path ${lifePath}: the answer is less about choosing the right option and more about choosing the one you can commit to wholeheartedly.`
    : "";

  return `<<<SNAPSHOT>>>
${firstName}, you are a Life Path ${lifePath} with a ${sun} sun and the steady drive of the ${animal}: someone who feels deeply, decides carefully and, once committed, rarely lets go.
<<<READING>>>
[Mock reading — development only] Your Life Path ${lifePath} and ${sun} sun agree on one thing: you don't take life at face value. You look for the pattern underneath, and you trust what you have tested yourself more than what you are told.${moon}

The ${animal} adds momentum. Where your numbers ask you to pause and understand, the ${input.chineseZodiac.animal} wants to move. That isn't a contradiction — it's the engine of your chart. Your best decisions come when you let the careful part of you set direction and the restless part set the pace.

At this stage of life (${input.lifeStage.toLowerCase()}), that shows up as a pull between depth and range. Consider choosing one area where you go deliberately deep this year, and protecting it from the rest of your commitments.${mind}
<<<SEASON>>>
A Personal Year ${year} colours the months ahead. Expect themes of responsibility and follow-through: things you started earlier now ask for steady care rather than new beginnings. Say yes to fewer things, and finish them well.
<<<TOOLKIT>>>
- Block two unbroken hours a week for the work only you can do.
- Before saying yes to something new, name what it replaces.
- Share one unfinished idea each month with someone you trust.
- End each week by writing down one thing to release.
`;
}
