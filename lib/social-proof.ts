/**
 * Social proof shown on the landing page.
 *
 * PLACEHOLDER: there is no real usage data or testimonials yet, so this ships
 * as `null` and nothing renders. Fill it with *real* numbers / quotes (with
 * permission) to turn the block on — never invent them.
 */
export interface SocialProof {
  /** e.g. "12,400 readings generated" — must come from real analytics. */
  stat?: string;
  testimonials?: Array<{ quote: string; author: string }>;
}

export const SOCIAL_PROOF: SocialProof | null = null;
