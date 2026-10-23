/**
 * UI copy for the Star Map houses block. English only in phase 1: other
 * locales keep the sign-level Star Map (lib/chart/flags.ts). Library text
 * comes from the server, never from here.
 */
export const starMapCopy = {
  eyebrowFull: "Your chart, by house",
  eyebrowSolar: "Your solar chart",
  /** Spec T8 precision line, with "whole sign houses" spelled out. */
  precision: "Each house is one whole sign, counted from your rising sign. Markers show calculated positions. Planetary aspects and current transits are not calculated.",
  precisionLocked: "Each house is one whole sign, counted from your rising sign. The planets in each house are part of your full reading.",
  approximate: "Treat this chart as approximate: a placement sits right on a sign boundary, or the birthplace is close to the poles.",
  sunUnstable: "The Sun changed sign on your birth date, so we can’t count your houses without a birth time.",
  housesTitle: "Your houses",
  housesGloss: "Houses split your chart into 12 areas of life, such as home, work and love. A planet’s house shows where its energy tends to show up.",
  sunRulerHint: "The planet linked to your Sun sign. Your chart ruler, which depends on your rising sign, is in your Star Map houses.",
  teaserLabel: "Your Sun and rising, together",
  solarTeaserLabel: "The theme that stands out",
  lockedSentences: "{n} more sentences in your full reading",
  lockedSentence: "1 more sentence in your full reading",
  locked: "Locked",
  more: "More of your Star Map",
  morePlacements: "More placements",
  share: "Share",
  shareCopied: "Copied with a link to Unified Reading.",
  shareFailed: "Couldn’t share. Please try again.",
  loading: "Working out your houses…",
  error: "We couldn’t work out your houses just now. Your signs are still shown above.",
  retry: "Try again",
  wheelLabel: "Natal chart by house",
  wheelLockedLabel: "Natal chart with 12 house divisions. Placements are part of your full reading.",
  glosses: {
    chartRuler: "Your chart ruler is the planet that rules your rising sign. Astrologers read it as a guide to your overall direction.",
    rising: "Your rising sign was coming up over the eastern horizon when you were born. It colours first impressions.",
    descendant: "Your Descendant is the sign on your 7th house, the house of close partners.",
    midheaven: "Your Midheaven is the top point of your chart, linked with career and public life.",
    stellium: "A stellium is a cluster of three or more planets in one house.",
  },
} as const;

export type GlossKey = keyof typeof starMapCopy.glosses;

/** One plain-language gloss for the first piece of jargon in a title. */
export function glossFor(title: string): GlossKey | null {
  if (/chart ruler/i.test(title)) return "chartRuler";
  if (/descendant|7th house ruler/i.test(title)) return "descendant";
  if (/midheaven/i.test(title)) return "midheaven";
  if (/stellium/i.test(title)) return "stellium";
  if (/rising/i.test(title)) return "rising";
  return null;
}
