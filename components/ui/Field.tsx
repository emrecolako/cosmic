"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const inputStyles =
  "w-full bg-transparent border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink-muted focus-visible:ring-1 focus-visible:ring-ink-muted transition-all";

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-mono text-xs uppercase tracking-wider text-ink-muted mb-2"
    >
      {children}
      {hint && <span className="ml-1 opacity-60 normal-case">{hint}</span>}
    </label>
  );
}

export function FieldError({ id, children }: { id?: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="font-mono text-xs uppercase tracking-wider text-ink mt-1.5">
      ! {children}
    </p>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, ...props }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    return (
      <div>
        <FieldLabel htmlFor={id} hint={hint}>
          {label}
        </FieldLabel>
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(inputStyles, error && "border-ink", className)}
          {...props}
        />
        <FieldError id={errorId}>{error}</FieldError>
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, className, ...props }, ref) => {
    const id = useId();
    return (
      <div>
        <FieldLabel htmlFor={id} hint={hint}>
          {label}
        </FieldLabel>
        <textarea ref={ref} id={id} className={cn(inputStyles, "resize-none", className)} {...props} />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
