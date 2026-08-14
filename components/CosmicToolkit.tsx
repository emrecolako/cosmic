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
          className="rounded-lg bg-panel p-4 flex items-start gap-4 animate-fade-in-up opacity-0"
          style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "forwards" }}
        >
          <div className="number-mono text-xs text-ink-muted pt-0.5 shrink-0 tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}
