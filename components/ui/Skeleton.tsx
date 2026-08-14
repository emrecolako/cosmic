"use client";

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

/** Skeleton mirroring a NumerologyCard stat block. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-lg bg-panel p-5">
      <Skeleton className="h-3 w-24 mb-4 bg-base/50" />
      <Skeleton className="h-9 w-12 mb-3 bg-base/50" />
      <Skeleton className="h-4 w-32 mb-2 bg-base/50" />
      <Skeleton className="h-3 w-full bg-base/50" />
    </div>
  );
}

/** Skeleton mirroring a paragraph block of the unified reading. */
export function ParagraphSkeleton() {
  const widths = ["w-full", "w-[92%]", "w-full", "w-[85%]", "w-full", "w-[70%]"];
  return (
    <div className="space-y-3">
      {widths.map((w, i) => (
        <Skeleton key={i} className={`h-4 ${w}`} />
      ))}
    </div>
  );
}
