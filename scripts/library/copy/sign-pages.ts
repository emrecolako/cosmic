/** Copy shape for the /zodiac/{sign} pages; content lives in sign-pages-1.ts and sign-pages-2.ts. */
export interface SignPageCopy {
  /** 5-12 words, lowercase, the sign's core traits for the one-line answer: "courage, initiative and directness". */
  gist: string;
  /** Two paragraphs, 95-120 words each: the sign's character, symbolism, element/modality/ruler in plain language. */
  overview: [string, string];
  /** 85-115 words each. */
  strengths: string;
  challenges: string;
  /** Two paragraphs, 85-115 words each: in love and close relationships (what it offers, needs, friction, what helps). */
  love: [string, string];
  /** Two paragraphs, 85-115 words each: at work and with money (style, suited roles, leadership, pitfalls). */
  work: [string, string];
  /** 100-130 words: growth edges and practical, non-predictive suggestions. */
  growth: string;
  /** Two FAQs specific to the sign, answers 30-60 words (e.g. "What is Scorpio's biggest weakness?", "Who is Scorpio most compatible with?"). */
  faq: [{ question: string; answer: string }, { question: string; answer: string }];
}
