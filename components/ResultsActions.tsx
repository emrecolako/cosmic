"use client";

import Link from "next/link";
import { useI18n } from "@/components/LocaleProvider";
import Button from "@/components/ui/Button";

interface ResultsActionsProps {
  canCopy: boolean;
  onShare: () => void;
  onCopy: () => void;
  onNewReading: () => void;
}

/** End-of-report next steps: share, keep a copy, or start another reading. */
export default function ResultsActions({
  canCopy,
  onShare,
  onCopy,
  onNewReading,
}: ResultsActionsProps) {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="actions-title"
      className="card p-5 sm:p-8 mb-[env(safe-area-inset-bottom)]"
    >
      <h2 id="actions-title" className="text-lg text-ink">
        {t.results.actionsTitle}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{t.results.actionsBody}</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <Button onClick={onShare} className="min-h-12 w-full">
          {t.results.shareCta}
        </Button>
        <Button
          variant="outline"
          onClick={onCopy}
          disabled={!canCopy}
          className="min-h-12 w-full"
        >
          {t.results.copyReading}
        </Button>
        <Link
          href="/"
          onClick={onNewReading}
          className="min-h-12 w-full inline-flex items-center justify-center rounded-md px-4 font-mono text-xs uppercase tracking-wider text-ink-muted hover:bg-panel hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          {t.results.generateAnother}
        </Link>
      </div>
      <p className="mt-6 text-center font-mono text-xs tracking-wider uppercase text-ink-muted">
        {t.results.closingMessage}
      </p>
    </section>
  );
}
