import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LocaleProvider } from "@/components/LocaleProvider";
import Header from "@/components/Header";
import { getMessages, negotiateLocale } from "@/lib/i18n";
import { paywallEnabled } from "@/lib/stripe";

export async function generateMetadata(): Promise<Metadata> {
  const locale = negotiateLocale((await headers()).get("accept-language"));
  const t = getMessages(locale);

  return {
    metadataBase: new URL("https://unifiedreading.com"),
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Unified Reading — one reading from three interpretive traditions" }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = negotiateLocale(headerStore.get("accept-language"));
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark";
  const readingOffer = paywallEnabled() ? undefined : {
    "@type": "Offer",
    url: "https://unifiedreading.com/pricing",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  };

  return (
    <html
      lang={locale}
      className={theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen antialiased font-sans"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://unifiedreading.com/#organization",
                name: "Unified Reading",
                url: "https://unifiedreading.com/",
                sameAs: ["https://github.com/emrecolako/cosmic"],
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "product support",
                  url: "https://unifiedreading.com/contact",
                  availableLanguage: ["English"],
                },
              },
              {
                "@type": "WebApplication",
                "@id": "https://unifiedreading.com/#app",
                name: "Unified Reading",
                url: "https://unifiedreading.com/",
                description: "A personal reflection reading that combines numerology, Western astrology, Chinese zodiac, and life-stage context.",
                applicationCategory: "LifestyleApplication",
                operatingSystem: "Web",
                publisher: { "@id": "https://unifiedreading.com/#organization" },
              },
              {
                "@type": "Service",
                "@id": "https://unifiedreading.com/#reading",
                name: "Personal reading from Unified Reading",
                serviceType: "Personal numerology and astrology reflection reading",
                description: "A unified interpretation of calculated numerology, Western zodiac, Chinese zodiac, and selected life-stage context.",
                provider: { "@id": "https://unifiedreading.com/#organization" },
                url: "https://unifiedreading.com/",
                ...(readingOffer ? { offers: readingOffer } : {}),
              },
              {
                "@type": "Product",
                "@id": "https://unifiedreading.com/#reading-product",
                name: "Personal reading from Unified Reading",
                description: "A personal report combining numerology, Western astrology, Chinese zodiac, and life-stage context for reflection.",
                category: "Personal reading",
                brand: { "@id": "https://unifiedreading.com/#organization" },
                url: "https://unifiedreading.com/pricing",
                ...(readingOffer ? { offers: readingOffer } : {}),
              },
            ],
          }).replace(/</g, "\\u003c") }}
        />
        <LocaleProvider locale={locale}>
          <Providers>
            <Header initialTheme={theme} />
            {children}
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
