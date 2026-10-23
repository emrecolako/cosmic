"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from './LocaleProvider';
import { atlasCopy } from '@/lib/i18n/atlas';
import { track } from '@/lib/analytics';
import type { LibraryPageType } from '@/lib/share';

type SampleCtaProps =
  | { price: string | null; position: 'top' | 'bottom'; placement?: 'sample' }
  | { price: string | null; position: string; placement: 'library'; pageType: LibraryPageType; slug: string };

/**
 * First/last touch were already stored by captureAttribution on landing; the
 * query string is carried over so the start page sees the same campaign tags.
 * `price` is null where Checkout isn't configured, as on the homepage.
 */
export default function SampleCta(props: SampleCtaProps) {
  const { price, position } = props;
  const placement = props.placement ?? 'sample';
  const { locale } = useI18n();
  const copy = atlasCopy[locale];
  const [href, setHref] = useState('/#details');
  useEffect(() => setHref(`/${window.location.search}#details`), []);
  const context = props.placement === 'library' ? { page_type: props.pageType, page_slug: props.slug } : {};
  return <div className={`sample-cta sample-cta-${position}`}>
    <Link
      className="atlas-primary"
      href={href}
      onClick={() => track('cta_clicked', { placement, position, price: price ?? undefined, locale, ...context })}
      data-attr={`${placement}-cta-${position}`}
    >
      {price ? `${copy.ownReading} — ${price}` : copy.ownReading}<span aria-hidden="true">↗</span>
    </Link>
    <p className="hero-note">{copy.ownReadingNote}</p>
  </div>;
}
