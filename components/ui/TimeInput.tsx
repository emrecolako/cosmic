"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/ui/Field";

const inputStyles =
  "w-full bg-transparent border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink-muted focus-visible:ring-1 focus-visible:ring-ink-muted transition-all number-mono";

/**
 * 24-hour HH:MM text input. The native <input type="time"> is a controlled-
 * component minefield (segmented editing, locale-dependent AM/PM, inputs
 * silently dropped) — a masked text field is predictable everywhere and
 * matches the mono aesthetic. Digits auto-format: "1430" → "14:30".
 */
export function formatTimeDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  // A first digit of 3-9 can only be a single-digit hour: "930" → "09:30"
  if (digits.length > 0 && digits[0] > "2") digits = "0" + digits;
  digits = digits.slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function isCompleteTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  error?: string;
}

export default function TimeInput({ value, onChange, ariaLabel, error }: TimeInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="HH:MM"
        maxLength={5}
        aria-label={ariaLabel}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onChange={(e) => onChange(formatTimeDigits(e.target.value))}
        className={cn(inputStyles, error && "border-ink")}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
