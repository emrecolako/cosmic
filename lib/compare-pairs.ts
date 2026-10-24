/**
 * The friend's result on /compare, quoted from the Life Path pair pages so
 * the two never disagree. Each pair page opens with a three-sentence hook
 * (framing, what works, what needs care) and states its "works best when"
 * line as ogLine. Server-only: it reads content/library from disk.
 */
import { loadContent } from "./library/content";
import { lifePathPairEntry, PAIR_NUMBERS } from "./library/registry";

export interface PairReading {
  /** Canonical pair page, e.g. /life-path/3-vs-7. */
  path: string;
  slug: string;
  clicks: string;
  rubs: string;
  helps: string;
}

const sentences = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-Z])/);

export function lifePathPairReading(a: number, b: number): PairReading {
  const entry = lifePathPairEntry(a, b);
  const content = loadContent(entry);
  const [, clicks, rubs] = sentences(content.sections[0].paragraphs[0]);
  if (!clicks || !rubs || !content.ogLine) throw new Error(`Pair copy for ${entry.slug} is missing its hook or ogLine`);
  const helps = content.ogLine.replace(/^The pairing tends to work best when /, "It tends to help when ");
  return { path: entry.path, slug: entry.slug, clicks, rubs, helps };
}

/** Every reading a Life Path sharer can get back, keyed by the friend's root number (1-9). */
export function lifePathReadingsFor(sharerRoot: number): Record<string, PairReading> {
  return Object.fromEntries(PAIR_NUMBERS.map((friend) => [String(friend), lifePathPairReading(sharerRoot, friend)]));
}
