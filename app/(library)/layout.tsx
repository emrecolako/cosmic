import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "@/components/Providers";
import { LocaleProvider } from "@/components/LocaleProvider";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import SiteJsonLd from "@/components/SiteJsonLd";
import { SITE_URL } from "@/lib/site";

/**
 * Root layout for the library. Unlike app/(app)/layout.tsx it reads no
 * headers or cookies, so every page here prerenders and is served from the
 * CDN cache. English only; the theme cookie is applied by the inline script.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Unified Reading Library",
  description: "Guides to Life Path numbers, zodiac sign compatibility and the Chinese zodiac from Unified Reading.",
};

const THEME_SCRIPT = `try{if(/(?:^|; )theme=dark(?:;|$)/.test(document.cookie))document.documentElement.classList.add("dark")}catch(e){}`;

export default function LibraryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased font-sans">
        <SiteJsonLd />
        <LocaleProvider locale="en">
          <Providers>
            <Header initialTheme="light" />
            {children}
            <SiteFooter />
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
