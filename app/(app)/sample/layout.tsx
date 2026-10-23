import type { Metadata } from 'next';

const shareTitle = 'Sample Reading | Unified Reading';
const shareDescription = 'See how one reading brings numerology, Western zodiac signs, and the Chinese zodiac together.';

/** og:image comes from ./opengraph-image.tsx (its URL carries a build hash); X falls back to og:image. */
export const metadata: Metadata = {
  title: 'Sample Numerology & Astrology Reading | Unified Reading',
  description: 'Explore a free fictional sample from Unified Reading that combines numerology, Western zodiac signs, and the Chinese zodiac.',
  alternates: { canonical: '/sample' },
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: '/sample',
    type: 'website',
    siteName: 'Unified Reading',
  },
  twitter: {
    card: 'summary_large_image',
    title: shareTitle,
    description: shareDescription,
  },
};

export default function SampleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
