import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sample Numerology & Astrology Reading | Cosmic Blueprint',
  description: 'Explore a free fictional Cosmic Blueprint sample reading that combines numerology, Western zodiac signs, and the Chinese zodiac.',
  alternates: { canonical: '/sample' },
  openGraph: {
    title: 'Sample Reading | Cosmic Blueprint',
    description: 'See how one reading brings numerology, Western zodiac signs, and the Chinese zodiac together.',
    url: '/sample',
  },
};

export default function SampleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
