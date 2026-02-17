"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/I18nProvider";

interface CombinedAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
  onRetry?: () => void;
}

export default function CombinedAnalysis({
  analysis,
  isLoading,
  onRetry,
}: CombinedAnalysisProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-4 rounded-lg" style={{ width: `${85 + Math.random() * 15}%` }} />
        ))}
        <div className="skeleton h-4 rounded-lg w-3/4" />
        <div className="h-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`b-${i}`} className="skeleton h-4 rounded-lg" style={{ width: `${80 + Math.random() * 20}%` }} />
        ))}
        <div className="skeleton h-4 rounded-lg w-2/3" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-8">
        <p className="text-cream/40 mb-4">{t.analysis.errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-xl bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-all text-sm font-medium"
          >
            {t.analysis.tryAgain}
          </button>
        )}
      </div>
    );
  }

  const paragraphs = analysis.split("\n\n").filter((p) => p.trim());

  return (
    <div className="space-y-5">
      {paragraphs.map((paragraph, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="text-cream/70 leading-relaxed text-[15px]"
        >
          {paragraph}
        </motion.p>
      ))}
    </div>
  );
}
