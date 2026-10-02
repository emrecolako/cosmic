"use client";

import { useI18n } from "@/components/LocaleProvider";
import { ParagraphSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";

interface CombinedAnalysisProps {
  analysis: string | null;
  isStreaming: boolean;
  hasError: boolean;
  errorMessage: string;
  onRetry: () => void;
}

export default function CombinedAnalysis({
  analysis,
  isStreaming,
  hasError,
  errorMessage,
  onRetry,
}: CombinedAnalysisProps) {
  const { t } = useI18n();

  // Shown whenever the request failed — including after a partial stream,
  // which previously left truncated text on screen with no way to retry.
  const retryBlock = hasError && (
    <div
      role="alert"
      className="rounded-lg border border-line p-5 text-center"
    >
      <p className="text-sm text-ink">{errorMessage}</p>
      <p className="mt-1 text-xs text-ink-muted">{t.analysis.errorReassure}</p>
      <Button onClick={onRetry} className="mt-4 min-h-11">
        {t.analysis.tryAgain}
      </Button>
    </div>
  );

  if (!analysis) {
    if (hasError) return retryBlock;
    return (
      <div aria-busy="true">
        <p className="font-mono text-xs tracking-wider uppercase text-ink-muted mb-4">
          {t.analysis.generating}
        </p>
        <ParagraphSkeleton />
      </div>
    );
  }

  const paragraphs = analysis.split("\n\n").filter((paragraph) => paragraph.trim());

  return (
    <div className="space-y-5">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-ink-secondary leading-relaxed text-base sm:text-[17px]">
          {paragraph}
          {isStreaming && index === paragraphs.length - 1 && (
            <span
              aria-hidden="true"
              className="inline-block w-2 h-4 bg-ink-muted ml-0.5 animate-pulse align-text-bottom"
            />
          )}
        </p>
      ))}
      {retryBlock}
    </div>
  );
}
