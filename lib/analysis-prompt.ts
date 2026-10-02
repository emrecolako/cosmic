/**
 * OpenRouter analysis prompt builder.
 *
 * Dynamically constructs the analysis prompt from the English calculation
 * payload while allowing the model's response language to vary by locale.
 */

import type { NumerologyProfile } from "./numerology";
import type { WesternAstrologyProfile } from "./western-astrology";
import type { ChineseZodiacProfile } from "./chinese-zodiac";
import type { LifeStageContext } from "./life-stages";
import {
  DEFAULT_LOCALE,
  LANGUAGE_NAMES,
  type Locale,
} from "./i18n/locales";

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
  locale?: Locale;
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

You follow the requested output format exactly.`;

export interface PromptOptions {
  /** "snapshot" asks only for the free teaser section shown before payment. */
  scope?: "snapshot" | "full";
}

export function buildAnalysisPrompt(data: CosmicProfile, { scope = "full" }: PromptOptions = {}): string {
  const locale = data.locale ?? DEFAULT_LOCALE;
  const language = LANGUAGE_NAMES[locale];
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
  if (!data.birthTime) {
    astroSection += `\n- Note: Birth time not provided. Moon, rising, and house placements are unavailable.`;
  } else if (!data.westernAstro.risingSign) {
    astroSection += `\n- Note: Rising sign is unavailable; location or timezone may be missing.`;
  }
  astroSection += `\n- Precision: Only the signs listed above are available. No exact degrees, houses, planetary aspects, current transits, or personality scores are calculated. Do not invent them anywhere in the reading.`;

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
  const currentYear = new Date().getUTCFullYear();

  if (scope === "snapshot") {
    return `The current year is ${currentYear}.

LANGUAGE REQUIREMENT — NON-NEGOTIABLE:
Write the ENTIRE response naturally and fluently in ${language}.
Keep only this parser marker exactly as written in English, on its own line: <<<SNAPSHOT>>>.

Based on the following cosmic profile data, write only the opening of a unified reading.

Your response MUST be plain text: the marker on its own line, followed by one section. Output nothing before the marker — no preamble or code fences:

<<<SNAPSHOT>>>
A compelling 2-3 sentence executive summary that captures the essence of this person's cosmic profile by connecting at least two of the systems. This should feel like the most insightful paragraph in the reading — the one they'd share with a friend.

${dataPayload}`;
  }

  return `The current year is ${currentYear}.

LANGUAGE REQUIREMENT — NON-NEGOTIABLE:
Write the ENTIRE response naturally and fluently in ${language}.
Keep only these four parser markers exactly as written in English: <<<SNAPSHOT>>> <<<READING>>> <<<SEASON>>> <<<TOOLKIT>>>.
Do not translate, alter, decorate, repeat, or add punctuation to those markers. Each marker must remain on its own line.
Toolkit entries must still begin with the exact ASCII characters "- ", even when writing in ${language}.

Based on the following cosmic profile data, generate a unified reading.

Your response MUST be plain text in exactly four sections, each introduced by its marker on its own line, in this order. Output nothing before the first marker — no preamble or code fences. Only the requested ## subheadings inside READING are allowed:

<<<SNAPSHOT>>>
A compelling 2-3 sentence executive summary that captures the essence of this person's cosmic profile. This should feel like the most insightful paragraph in the reading — the one they'd share with a friend.

<<<READING>>>
An 800-1200 word unified narrative that: (1) Finds connecting threads across numerology, Western astrology, and Chinese astrology. (2) Identifies reinforcing patterns where multiple systems agree. (3) Calls out interesting tensions where systems suggest opposing tendencies — framed as complexity, not contradiction. (4) Adapts language and focus based on their life stage. (5) Uses a warm, intelligent tone.${data.whatsOnYourMind ? " (6) Weaves in the personal context they shared naturally — don't just append it, integrate it." : ""} Separate paragraphs with blank lines. Add three short editorial subheadings, in the requested language, for shared themes, tensions, and practical meaning. Prefix each subheading with ## and put a blank line before and after it.

<<<SEASON>>>
A 150-200 word section about what's active for them right now, based on their Personal Year number (${data.numerology.personalYear.number} — ${data.numerology.personalYear.interpretation.title}) only. No current planetary transits, exact planetary degrees, houses, aspects, or personality scores have been calculated: never invent or claim them. This should feel timely and actionable.

<<<TOOLKIT>>>
3-5 specific, practical takeaways based on their complete profile, one per line, each line starting with "- ". Each should be 1-2 sentences — not just "be more patient" but something specific to their profile combination. Think actionable micro-advice.

${dataPayload}`;
}
