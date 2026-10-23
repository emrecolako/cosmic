import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import "../globals.css";
import { Providers } from "@/components/Providers";
import { LocaleProvider } from "@/components/LocaleProvider";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import SiteJsonLd from "@/components/SiteJsonLd";
import { getMessages, negotiateLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = negotiateLocale((await headers()).get("accept-language"));
  const t = getMessages(locale);

  return {
    metadataBase: new URL(SITE_URL),
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
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang={locale}
      className={theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen antialiased font-sans"
      >
        <SiteJsonLd />
        <LocaleProvider locale={locale}>
          <Providers>
            <Header initialTheme={theme} />
            {children}
            <SiteFooter />
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
