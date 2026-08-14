import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cosmic Blueprint — Your Complete Cosmic Profile",
  description:
    "Discover your unified cosmic profile combining numerology, Western astrology, Chinese astrology, and natal chart analysis into one beautifully synthesized reading.",
  openGraph: {
    title: "Cosmic Blueprint",
    description: "Your complete cosmic profile, unified.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Theme: dark by default (cosmic app), light on explicit choice.
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark";

  return (
    <html
      lang="en"
      className={theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} min-h-screen antialiased font-sans`}
      >
        <Providers>
          <Header initialTheme={theme} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
