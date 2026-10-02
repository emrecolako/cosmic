"use client";
import { useI18n } from '@/components/LocaleProvider';
import { paywallCopy } from '@/lib/i18n/paywall';
import { formatMessage } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
interface UnlockReadingProps { price: string; onUnlock: () => void; unlocking: boolean; }
/** Paywall for the AI chapters. The faded lines are placeholders only — no paid text reaches the client. */
export default function UnlockReading({ price, onUnlock, unlocking }: UnlockReadingProps) {
  const { locale } = useI18n();
  const copy = paywallCopy[locale];
  return <div className="unlock-panel">
    <div className="unlock-ghost" aria-hidden="true"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-11/12" /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div>
    <div className="unlock-card">
      <p className="eyebrow mb-4">{copy.label}</p>
      <h3 className="editorial text-3xl mb-3">{copy.title}</h3>
      <p className="text-ink-secondary leading-7 mb-4">{copy.body}</p>
      <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mb-6">{copy.includes}</p>
      <Button size="lg" onClick={onUnlock} disabled={unlocking} aria-busy={unlocking} className="w-full sm:w-auto">{unlocking ? copy.unlocking : formatMessage(copy.cta, { price })}</Button>
      <p className="text-xs text-ink-muted mt-4">{copy.note}</p>
    </div>
  </div>;
}
