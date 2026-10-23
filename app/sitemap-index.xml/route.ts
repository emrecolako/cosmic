import { SITE_URL } from "@/lib/site";
import { SITEMAP_IDS, lastModifiedOf } from "@/lib/library/sitemaps";

export const dynamic = "force-static";

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_IDS.map((id) => `<sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc><lastmod>${lastModifiedOf(id)}</lastmod></sitemap>`).join("\n")}
</sitemapindex>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
