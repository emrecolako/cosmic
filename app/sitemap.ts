import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about", "/sample", "/privacy", "/pricing", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: "2026-10-02",
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
