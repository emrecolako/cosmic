"use client";

interface NumerologyCardProps {
  label: string;
  number: number;
  title: string;
  brief: string;
  keywords: string[];
  delay?: number;
}

export default function NumerologyCard({
  label,
  number,
  title,
  brief,
  keywords,
  delay = 0,
}: NumerologyCardProps) {
  return (
    <div
      className="rounded-lg bg-panel p-5 animate-count-up opacity-0"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="font-mono text-xs text-ink-muted uppercase tracking-wider mb-3">
        {label}
      </div>

      <div className="flex items-start gap-4">
        <div className="number-mono text-4xl font-light text-ink shrink-0 tabular-nums">
          {number}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-medium text-ink mb-1">{title}</h3>
          <p className="text-sm text-ink-muted leading-relaxed mb-2">{brief}</p>
          <div className="font-mono text-xs uppercase tracking-wider text-ink-muted">
            {keywords.join(" · ")}
          </div>
        </div>
      </div>
    </div>
  );
}
