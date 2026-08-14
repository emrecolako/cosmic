"use client";

import { useId } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/ui/Field";

const inputStyles =
  "w-full bg-transparent border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink-muted focus-visible:ring-1 focus-visible:ring-ink-muted transition-all number-mono";

export function formatTimeDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 0 && digits[0] > "2") digits = `0${digits}`;
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

export default function TimeInput({
  value,
  onChange,
  ariaLabel,
  error,
}: TimeInputProps) {
  const { t } = useI18n();
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={t.ui.timePlaceholder}
        maxLength={5}
        aria-label={ariaLabel}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onChange={(event) => onChange(formatTimeDigits(event.target.value))}
        className={cn(inputStyles, error && "border-ink")}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
