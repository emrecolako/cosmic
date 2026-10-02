"use client";

import { useId } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";
import { FieldError, inputStyles } from "@/components/ui/Field";


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
  onBlur?: () => void;
  describedBy?: string;
  error?: string;
}

export default function TimeInput({
  value,
  onChange,
  ariaLabel,
  onBlur,
  describedBy,
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
        enterKeyHint="next"
        aria-label={ariaLabel}
        aria-invalid={!!error || undefined}
        aria-describedby={[error ? errorId : null, describedBy].filter(Boolean).join(" ") || undefined}
        value={value}
        onChange={(event) => onChange(formatTimeDigits(event.target.value))}
        onBlur={onBlur}
        className={cn(inputStyles, "number-mono", error && "border-ink")}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
