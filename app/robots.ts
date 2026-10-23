import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SITEMAP_IDS } from "@/lib/library/sitemaps";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/results", "/library-md/"] }],
    sitemap: [`${SITE_URL}/sitemap.xml`, ...SITEMAP_IDS.map((id) => `${SITE_URL}/sitemap/${id}.xml`)],
    host: SITE_URL,
  };
}
