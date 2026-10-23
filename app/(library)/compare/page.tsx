import type { Metadata } from "next";
import ComparePageClient from "@/components/compare/ComparePageClient";

export const dynamic = "force-static";

/** Personal invitation links: never indexed, and not in the registry, so never in a sitemap. */
export const metadata: Metadata = {
  title: { absolute: "Compare with a friend | Unified Reading" },
  description: "A friend wants to compare numerology or zodiac signs with you. Enter your birth date to see how you match.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return <main id="main" className="atlas-shell"><div className="compare-shell"><ComparePageClient /></div></main>;
}
