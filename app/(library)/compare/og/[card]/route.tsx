import { compareOgImage } from "@/lib/library/og";
import { ALL_COMPARE_VALUES, compareCardKey, parseCompareCardKey } from "@/lib/compare";

export const dynamic = "force-static";

/** All 36 cards plus the generic one prerender; any other key renders the generic card, never a 404. */
export function generateStaticParams() {
  return [...ALL_COMPARE_VALUES, null].map((value) => ({ card: compareCardKey(value) }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ card: string }> }) {
  return compareOgImage(parseCompareCardKey((await params).card));
}
