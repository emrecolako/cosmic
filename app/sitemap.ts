import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { CORE_LAST_MODIFIED, CORE_PAGES, SITEMAP_IDS, libraryUrls, type SitemapId } from "@/lib/library/sitemaps";

/** Served at /sitemap/{id}.xml; /sitemap.xml is rewritten to the index at app/sitemap-index.xml. */
export function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const sitemapId = (await id) as SitemapId;
  if (sitemapId === "core") {
    return CORE_PAGES.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: CORE_LAST_MODIFIED,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.6,
    }));
  }
  return libraryUrls(sitemapId).map(({ path, lastModified }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: sitemapId === "hub" ? 0.7 : 0.5,
  }));
}
