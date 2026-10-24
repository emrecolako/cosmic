/** Copy shape for the /zodiac/{sign}-decan-{n} pages; content lives in decan-pages-1.ts and decan-pages-2.ts. */
export interface DecanPageCopy {
  /** 5-12 words, lowercase: the decan's flavour for the one-line answer, e.g. "pioneering drive in its purest, most impatient form". */
  gist: string;
  /** Two paragraphs, 95-120 words each: the decan's character and how its sub-ruler colours the sign. */
  character: [string, string];
  /** 80-105 words: this decan in love and close relationships. */
  love: string;
  /** 80-105 words: this decan at work. */
  work: string;
  /** 80-105 words: growth edges and practical, non-predictive suggestions. */
  growth: string;
  /** One FAQ specific to this decan, answer 30-60 words. */
  faq: { question: string; answer: string };
}
