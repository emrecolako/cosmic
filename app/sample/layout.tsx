import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sample Numerology & Astrology Reading | Unified Reading',
  description: 'Explore a free fictional sample from Unified Reading that combines numerology, Western zodiac signs, and the Chinese zodiac.',
  alternates: { canonical: '/sample' },
  openGraph: {
    title: 'Sample Reading | Unified Reading',
    description: 'See how one reading brings numerology, Western zodiac signs, and the Chinese zodiac together.',
    url: '/sample',
  },
};

export default function SampleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
