/** Copy shapes for the wave-4 numerology pages; content lives in the files named in each comment. */

/** Expression, Soul Urge, Personality and Birthday number pages (expression-pages.ts, soul-urge-pages.ts, personality-pages.ts, birthday-number-pages-*.ts). */
export interface NumberPageCopy {
  /** 5-12 words, lowercase: the core reading for the one-line answer, e.g. "a talent for analysis, research and quiet expertise". */
  gist: string;
  /** Two paragraphs, 95-120 words each: what this number means in this position. */
  meaning: [string, string];
  /** 85-110 words each. */
  strengths: string;
  challenges: string;
  /** 85-110 words each: in love and close relationships; at work and with money. */
  love: string;
  work: string;
  /** 90-120 words: growth edges and practical, non-predictive suggestions. */
  growth: string;
  /** Two FAQs specific to this number in this position, answers 30-60 words. */
  faq: [{ question: string; answer: string }, { question: string; answer: string }];
}

/** Personal Year pages, one per number and calendar year (personal-year-2026.ts, personal-year-2027.ts). */
export interface PersonalYearCopy {
  /** 5-12 words, lowercase: the year's theme for the one-line answer, e.g. "fresh starts, initiative and planting seeds". */
  gist: string;
  /** Two paragraphs, 95-120 words each: the theme of this Personal Year in this specific calendar year. */
  theme: [string, string];
  /** 85-110 words each. */
  love: string;
  work: string;
  /** 90-115 words: what to focus on this year. */
  focus: string;
  /** 80-105 words: what to release or avoid forcing. */
  release: string;
  /** One FAQ, answer 30-60 words. */
  faq: { question: string; answer: string };
}

/** Angel number pages (angel-pages.ts). */
export interface AngelPageCopy {
  /** 5-12 words, lowercase: the popular reading, e.g. "new beginnings, alignment and paying attention to your thoughts". */
  gist: string;
  /** Two paragraphs, 95-120 words each: what the sequence is usually taken to mean, and how it connects to the root number in Pythagorean numerology. */
  meaning: [string, string];
  /** 85-110 words: why people notice repeating numbers (attention, pattern-seeking, the frequency illusion) and how to use the moment for reflection. */
  noticing: string;
  /** 85-110 words each: the common reading for love and relationships; for work, money and decisions. */
  love: string;
  work: string;
  /** 85-110 words: a practical, non-superstitious way to work with the number (journaling prompts, questions to ask). */
  practice: string;
  /** Two FAQs, answers 30-60 words (e.g. "What does 111 mean in love?", "Is seeing 111 a bad sign?"). */
  faq: [{ question: string; answer: string }, { question: string; answer: string }];
}
