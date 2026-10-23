import type { Metadata } from "next";
import ComparePageClient from "@/components/compare/ComparePageClient";
import { compareDescription, compareHeadline, compareOgImagePath, compareVideoPath, parseCompare } from "@/lib/compare";
import { ogSize } from "@/lib/library/og";
import { SITE_URL } from "@/lib/site";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : null);
const sharerFrom = async (searchParams: SearchParams) => {
  const params = await searchParams;
  return parseCompare(one(params.t), one(params.v));
};

/**
 * Personal invitation links: never indexed, and not in the registry, so never
 * in a sitemap. The share card is built here from ?t=&v= alone, so a pasted
 * link previews without JavaScript; only the computed value is ever shown.
 */
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sharer = await sharerFrom(searchParams);
  const title = sharer ? compareHeadline(sharer) : "Compare with a friend";
  const description = compareDescription(sharer);
  const image = { url: compareOgImagePath(sharer), ...ogSize, alt: title, type: "image/png" };
  const videoUrl = sharer && `${SITE_URL}${compareVideoPath(sharer)}`;
  return {
    title: { absolute: `${title} | Unified Reading` },
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: "/compare" },
    openGraph: {
      type: "website",
      siteName: "Unified Reading",
      title,
      description,
      images: [image],
      ...(videoUrl && { videos: [{ url: videoUrl, secureUrl: videoUrl, type: "video/mp4", ...ogSize }] }),
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const sharer = await sharerFrom(searchParams);
  return <main id="main" className="atlas-shell"><div className="compare-shell"><ComparePageClient sharer={sharer} /></div></main>;
}
