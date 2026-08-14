"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Bordered card; default is the bezos "ghost" card with no border. */
  bordered?: boolean;
}

export function Card({ children, className, bordered = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg transition-all duration-200",
        bordered && "card",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-0 py-4 mb-2", className)}>{children}</div>;
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-0 pb-6", className)}>{children}</div>;
}
