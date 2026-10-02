"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-sans transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:opacity-50 disabled:pointer-events-none rounded-sm";

    const variants = {
      primary: "bg-[#f7bdcd] text-[#30242a] hover:opacity-80",
      secondary:
        "border border-line-muted bg-base text-ink-secondary hover:bg-panel hover:text-ink",
      ghost: "text-ink-muted hover:bg-panel hover:text-ink",
      outline:
        "border border-line text-ink-secondary hover:bg-panel hover:text-ink hover:border-ink-muted",
    };

    const sizes = {
      sm: "px-3 py-2 min-h-11 text-sm",
      md: "px-4 py-3 min-h-11 text-sm",
      lg: "px-6 py-4 min-h-14 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
