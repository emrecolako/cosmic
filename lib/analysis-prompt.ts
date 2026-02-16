/**
 * Claude API Prompt Builder
 *
 * Dynamically constructs the analysis prompt based on available data,
 * life stage, and user context.
 */

import { NumerologyProfile } from "./numerology";
import { WesternAstrologyProfile } from "./western-astrology";
import { ChineseZodiacProfile } from "./chinese-zodiac";
import { LifeStageContext } from "./life-stages";

export interface CosmicProfile {
  fullName: string;
  dateOfBirth: string;
  birthTime?: string;
  birthPlace?: string;
  lifeStage: string;
  whatsOnYourMind?: string;
  gender?: string;
  age: number;
  numerology: NumerologyProfile;
  westernAstro: WesternAstrologyProfile;
  chineseZodiac: ChineseZodiacProfile;
  lifeStageContext: LifeStageContext;
}

export const SYSTEM_PROMPT = `You are a master astrologer and numerologist who synthesizes multiple cosmic systems into unified, practical wisdom. You write with warmth and intelligence — never vague, never preachy. You acknowledge that these are interpretive frameworks, not deterministic predictions. You adapt your advice to the person's actual life context.

Your writing style:
- Warm but intelligent — like a wise friend who reads a lot
- Specific and insightful, not generic or vague
- Acknowledges complexity without being confusing
- Uses vivid metaphors sparingly and effectively
- Conversational but substantive
- Never uses excessive exclamation marks or emojis
- Never says "the stars say" or similar woo-woo language
- Treats these systems as lenses for self-understanding, not fortune-telling

You always structure your response as valid JSON.`;

/**
 * Build the full analysis prompt for the Claude API call.
 * Dynamically adjusts based on available data and life context.
 *
 * @param data - The complete cosmic profile data
 * @returns The formatted user prompt string for the Claude API
 */
export function buildAnalysisPrompt(data: CosmicProfile): string {
  const hasFullNatalData = !!data.birthTime && !!data.birthPlace;

  // Build the data payload
  const sections: string[] = [];

  sections.push(`## Person Profile
- Name: ${data.fullName}
- Age: ${data.age}
- Life Stage: ${data.lifeStage}${data.gender ? `\n- Gender: ${data.gender}` : ""}${data.whatsOnYourMind ? `\n- Currently on their mind: "${data.whatsOnYourMind}"` : ""}`);

  sections.push(`## Numerology
- Life Path Number: ${data.numerology.lifePath.number} (${data.numerology.lifePath.interpretation.title})
- Expression Number: ${data.numerology.expression.number} (${data.numerology.expression.interpretation.title})
- Soul Urge Number: ${data.numerology.soulUrge.number} (${data.numerology.soulUrge.interpretation.title})
- Personality Number: ${data.numerology.personality.number} (${data.numerology.personality.interpretation.title})
- Personal Year: ${data.numerology.personalYear.number} (${data.numerology.personalYear.interpretation.title})`);

  let astroSection = `## Western Astrology
- Sun Sign: ${data.westernAstro.sunSign.sign} (${data.westernAstro.sunSign.element}, ${data.westernAstro.sunSign.modality}, ruled by ${data.westernAstro.sunSign.rulingPlanet}, Decan ${data.westernAstro.sunSign.decan})`;

  if (data.westernAstro.moonSign) {
    astroSection += `\n- Moon Sign: ${data.westernAstro.moonSign}`;
  }
  if (data.westernAstro.risingSign) {
    astroSection += `\n- Rising Sign: ${data.westernAstro.risingSign}`;
  }
  if (!hasFullNatalData) {
    astroSection += `\n- Note: Birth time${!data.birthPlace ? " and location" : ""} not provided, so moon sign, rising sign, and house placements are unavailable.`;
  }

  sections.push(astroSection);

  sections.push(`## Chinese Astrology
- Animal: ${data.chineseZodiac.animal} ${data.chineseZodiac.emoji}
- Element: ${data.chineseZodiac.element}
- Polarity: ${data.chineseZodiac.yinYang}
- Best compatibility: ${data.chineseZodiac.compatibility.bestWith.join(", ")}
- Challenging matches: ${data.chineseZodiac.compatibility.challenging.join(", ")}`);

  sections.push(`## Life Stage Context
- Stage: ${data.lifeStageContext.stage}
- Focus Areas: ${data.lifeStageContext.focusAreas.join(", ")}
- Tone Guidance: ${data.lifeStageContext.toneGuidance}
- Emphasize: ${data.lifeStageContext.topicsToEmphasize.join(", ")}${data.lifeStageContext.topicsToDeemphasize.length > 0 ? `\n- De-emphasize: ${data.lifeStageContext.topicsToDeemphasize.join(", ")}` : ""}`);

  const dataPayload = sections.join("\n\n");

  return `Based on the following cosmic profile data, generate a unified reading. Your response MUST be valid JSON with exactly these fields:

{
  "cosmicSnapshot": "A compelling 2-3 sentence executive summary that captures the essence of this person's cosmic profile. This should feel like the most insightful paragraph in the reading — the one they'd share with a friend.",

  "unifiedReading": "An 800-1200 word unified narrative that: (1) Finds connecting threads across numerology, Western astrology, and Chinese astrology. (2) Identifies reinforcing patterns where multiple systems agree. (3) Calls out interesting tensions where systems suggest opposing tendencies — framed as complexity, not contradiction. (4) Adapts language and focus based on their life stage. (5) Uses a warm, intelligent tone.${data.whatsOnYourMind ? " (6) Weaves in the personal context they shared naturally — don't just append it, integrate it." : ""} Use paragraph breaks for readability. Do NOT use markdown headers within the reading — it should flow as prose.",

  "currentSeason": "A 150-200 word section about what's active for them right now, based on their Personal Year number (${data.numerology.personalYear.number} — ${data.numerology.personalYear.interpretation.title}) and current cosmic transits relevant to their sun sign. This should feel timely and actionable.",

  "cosmicToolkit": ["item1", "item2", "item3", "item4", "item5"]
}

The cosmicToolkit should be 3-5 specific, practical takeaways based on their complete profile. Each should be 1-2 sentences — not just "be more patient" but something specific to their profile combination. Think actionable micro-advice.

${dataPayload}`;
}
