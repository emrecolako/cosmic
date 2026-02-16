import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-navy antialiased">{children}</body>
    </html>
  );
}
