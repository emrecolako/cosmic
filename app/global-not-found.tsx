import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LocaleProvider } from "@/components/LocaleProvider";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

/** With two root layouts there is no shared not-found; this one covers unmatched URLs in both. */
export const metadata: Metadata = { title: "Page not found | Unified Reading", robots: { index: false } };

const THEME_SCRIPT = `try{if(/(?:^|; )theme=dark(?:;|$)/.test(document.cookie))document.documentElement.classList.add("dark")}catch(e){}`;

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased font-sans">
        <LocaleProvider locale="en">
          <Providers>
            <Header initialTheme="light" />
            <main id="main" className="atlas-shell"><article className="unified-prose">
              <h1 className="wizard-title editorial">That page is not here.</h1>
              <p>Try the <Link href="/">homepage</Link>, explore the <Link href="/sample">sample reading</Link>, browse the <Link href="/library">library</Link>, or read <Link href="/about">about Unified Reading</Link>.</p>
            </article></main>
            <SiteFooter />
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
