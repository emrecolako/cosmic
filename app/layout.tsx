import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LocaleProvider } from "@/components/LocaleProvider";
import Header from "@/components/Header";
import { getMessages, negotiateLocale } from "@/lib/i18n";

const ibmPlexSans = IBM_Plex_Sans({
  // Only Latin is preloaded; latin-ext (Turkish, German…) still loads on
  // demand via unicode-range.
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  // Only Latin is preloaded; latin-ext (Turkish, German…) still loads on
  // demand via unicode-range.
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://cosmic-jet.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the header and sticky CTA use env(safe-area-inset-*) on notched phones.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = negotiateLocale((await headers()).get("accept-language"));
  const t = getMessages(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: t.meta.ogTitle,
      description: t.meta.description,
      type: "website",
      siteName: "Cosmic Blueprint",
      url: "/",
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.ogTitle,
      description: t.meta.description,
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

  return (
    <html
      lang={locale}
      className={theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} min-h-dvh antialiased font-sans`}
      >
        <LocaleProvider locale={locale}>
          <Providers>
            <Header initialTheme={theme} />
            {children}
          </Providers>
        </LocaleProvider>
        {/* Vercel serves the analytics script; elsewhere it would 404. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
