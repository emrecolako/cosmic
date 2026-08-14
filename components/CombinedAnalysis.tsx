"use client";

import { useI18n } from "@/components/LocaleProvider";
import { ParagraphSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";

interface CombinedAnalysisProps {
  analysis: string | null;
  isStreaming: boolean;
  hasError: boolean;
  onRetry: () => void;
}

export default function CombinedAnalysis({ analysis, isStreaming, hasError, onRetry }: CombinedAnalysisProps) {
  const { t } = useI18n();
  if (!analysis) {
    if (hasError) {
      return (
        <div className="text-center py-8">
          <p className="font-mono text-xs tracking-wider uppercase text-ink-muted mb-4">{t.analysis.errorMessage}</p>
          <Button variant="outline" onClick={onRetry}>{t.analysis.tryAgain}</Button>
        </div>
      );
    }
    return (
      <div>
        <p className="font-mono text-xs tracking-wider uppercase text-ink-muted mb-4">{t.analysis.generating}</p>
        <ParagraphSkeleton />
      </div>
    );
  }

  const paragraphs = analysis.split("\n\n").filter((p) => p.trim());
  return (
    <div className="space-y-5">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="text-ink-secondary leading-relaxed text-[15px]">
          {paragraph}
          {isStreaming && i === paragraphs.length - 1 && <span className="inline-block w-2 h-4 bg-ink-muted ml-0.5 animate-pulse align-text-bottom" />}
        </p>
      ))}
    </div>
  );
}
