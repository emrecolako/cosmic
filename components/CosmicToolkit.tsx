"use client";

import { Skeleton } from "@/components/ui/Skeleton";

interface CosmicToolkitProps {
  items: string[] | null;
  isLoading: boolean;
}

export default function CosmicToolkit({ items, isLoading }: CosmicToolkitProps) {
  if (isLoading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="grid gap-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="border-b border-line-muted py-5 flex items-start gap-5 animate-fade-in-up opacity-0"
          style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "forwards" }}
        >
          <div className="number-mono text-sm text-[var(--gold)] w-8 pt-0.5 shrink-0 tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </div>
          <p className="text-base text-ink-secondary leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}
