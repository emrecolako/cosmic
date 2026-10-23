"use client";
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/LocaleProvider';
import { paywallCopy } from '@/lib/i18n/paywall';
import { formatMessage } from '@/lib/i18n';
import type { CheckoutPlacement } from '@/lib/analytics';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export interface PaywallState { price: string; onUnlock: (placement: CheckoutPlacement) => void; unlocking: boolean; checkoutAvailable: boolean; }
interface UnlockReadingProps extends PaywallState { firstName: string; personalYear: number; }

/** Unlock card shown right after the free snapshot, plus a sticky bar on small screens while the card is off-screen. */
export default function UnlockReading({ price, onUnlock, unlocking, checkoutAvailable, firstName, personalYear }: UnlockReadingProps) {
  const { locale } = useI18n();
  const copy = paywallCopy[locale];
  const cardRef = useRef<HTMLElement>(null);
  const [cardVisible, setCardVisible] = useState(true);
  const cta = checkoutAvailable ? unlocking ? copy.unlocking : formatMessage(copy.cta, { price }) : copy.unavailable;
  const items = [copy.item1, copy.item2, formatMessage(copy.item3, { number: personalYear }), copy.item4];

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setCardVisible(entry.isIntersecting));
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return <>
    <section ref={cardRef} id="unlock" className="unlock-card" aria-labelledby="unlock-title">
      <p className="eyebrow mb-4">{copy.label}</p>
      <h2 id="unlock-title" className="editorial text-3xl mb-5">{firstName ? formatMessage(copy.title, { name: firstName }) : copy.label}</h2>
      <ul className="unlock-list mb-6">{items.map((item) => <li key={item}>{item}</li>)}</ul>
      <Button size="lg" onClick={() => onUnlock('inline_card')} disabled={unlocking || !checkoutAvailable} aria-busy={unlocking} className="w-full sm:w-auto" data-attr="unlock-inline-card">{cta}</Button>
      <p className="text-xs text-ink-muted mt-4">{checkoutAvailable ? formatMessage(copy.note, { price }) : copy.unavailableNote}</p>
    </section>
    {checkoutAvailable && <div className="unlock-sticky" data-hidden={cardVisible || undefined} aria-hidden={cardVisible || undefined}>
      <Button size="md" onClick={() => onUnlock('sticky_bar')} disabled={unlocking} aria-busy={unlocking} tabIndex={cardVisible ? -1 : undefined} className="w-full" data-attr="unlock-sticky-bar">{cta}</Button>
    </div>}
  </>;
}

/** Placeholder for a paid chapter; the faded lines are placeholders only — no paid text reaches the client. */
export function LockedChapter() {
  const { locale } = useI18n();
  return <div className="unlock-panel">
    <div className="unlock-ghost" aria-hidden="true"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-11/12" /><Skeleton className="h-3 w-4/5" /></div>
    <a className="atlas-link mt-4" href="#unlock" data-attr="locked-chapter-to-unlock">{paywallCopy[locale].locked} ↑</a>
  </div>;
}
