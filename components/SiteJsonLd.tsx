import { priceLabel } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** Site-wide Organization/WebApplication/Service/Product graph, shared by both root layouts. */
export default function SiteJsonLd() {
  const readingPrice = priceLabel().replace(/[^0-9.]/g, "");
  const readingOffer = readingPrice ? {
    "@type": "Offer",
    url: `${SITE_URL}/pricing`,
    price: readingPrice,
    priceCurrency: "USD",
    description: "Full personal reading, one-time payment through Stripe Checkout. The preview is free.",
    availability: "https://schema.org/InStock",
  } : undefined;

  return <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": ORGANIZATION_ID,
          name: "Unified Reading",
          url: `${SITE_URL}/`,
          sameAs: ["https://github.com/emrecolako/cosmic"],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "product support",
            url: `${SITE_URL}/contact`,
            availableLanguage: ["English"],
          },
        },
        {
          "@type": "WebApplication",
          "@id": `${SITE_URL}/#app`,
          name: "Unified Reading",
          url: `${SITE_URL}/`,
          description: "A personal reflection reading that combines numerology, Western astrology, Chinese zodiac, and life-stage context.",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          publisher: { "@id": ORGANIZATION_ID },
        },
        {
          "@type": "Service",
          "@id": `${SITE_URL}/#reading`,
          name: "Personal reading from Unified Reading",
          serviceType: "Personal numerology and astrology reflection reading",
          description: "A unified interpretation of calculated numerology, Western zodiac, Chinese zodiac, and selected life-stage context.",
          provider: { "@id": ORGANIZATION_ID },
          url: `${SITE_URL}/`,
          ...(readingOffer ? { offers: readingOffer } : {}),
        },
        {
          "@type": "Product",
          "@id": `${SITE_URL}/#reading-product`,
          name: "Personal reading from Unified Reading",
          description: "A personal report combining numerology, Western astrology, Chinese zodiac, and life-stage context for reflection.",
          category: "Personal reading",
          brand: { "@id": ORGANIZATION_ID },
          url: `${SITE_URL}/pricing`,
          ...(readingOffer ? { offers: readingOffer } : {}),
        },
      ],
    }).replace(/</g, "\\u003c") }}
  />;
}
