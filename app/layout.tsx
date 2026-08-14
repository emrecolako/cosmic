import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LocaleProvider } from "@/components/LocaleProvider";
import Header from "@/components/Header";
import { getMessages, negotiateLocale } from "@/lib/i18n";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = negotiateLocale((await headers()).get("accept-language"));
  const t = getMessages(locale);

  return {
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      type: "website",
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
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} min-h-screen antialiased font-sans`}
      >
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
