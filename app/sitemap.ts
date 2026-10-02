import type { MetadataRoute } from "next";

const origin = "https://unifiedreading.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about", "/sample", "/privacy", "/pricing", "/contact"].map((path) => ({
    url: `${origin}${path}`,
    lastModified: "2026-10-02",
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
