"use client";
import { useI18n } from '@/components/LocaleProvider';
import { atlasCopy } from '@/lib/i18n/atlas';
import { ParagraphSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
interface CombinedAnalysisProps { analysis: string | null; isStreaming: boolean; hasError: boolean; onRetry: () => void; }
export default function CombinedAnalysis({ analysis, isStreaming, hasError, onRetry }: CombinedAnalysisProps) {
  const { t, locale } = useI18n();
  const copy = atlasCopy[locale];
  const blocks = analysis?.split('\n\n').filter(block => block.trim()) ?? [];
  return <div className="unified-prose" aria-busy={isStreaming}>
    {!analysis && !hasError && <><p role="status" className="!font-sans !text-sm text-ink-muted mb-6">{t.analysis.generating}</p><ParagraphSkeleton /></>}
    {blocks.map((block, index) => block.startsWith('## ') ? <h3 key={index}>{block.replace(/^##\s*/, '')}</h3> : <p key={index} className="text-ink-secondary mb-6">{block}{isStreaming && index === blocks.length - 1 && <span aria-hidden="true" className="inline-block w-1 h-6 bg-[var(--gold)] ml-1 animate-pulse" />}</p>)}
    {hasError && <div role="alert" className="reading-error mt-8"><p className="mb-5 text-ink-secondary">{copy.partial}</p><Button variant="outline" onClick={onRetry}>{t.analysis.tryAgain}</Button></div>}
  </div>;
}
