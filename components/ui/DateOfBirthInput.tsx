"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";
import { FieldError, inputStyles } from "@/components/ui/Field";

/**
 * Day / month / year date of birth entry.
 *
 * Replaces <input type="date">, whose iOS wheel starts at today (decades of
 * scrolling) and whose desktop format is locale-ambiguous. Each part carries a
 * bday-* autocomplete token so browser autofill can fill it.
 *
 * The value stays a "YYYY-MM-DD" string so the rest of the app is unchanged.
 * Incomplete input is kept as "YYYY-MM-DD" with empty parts (e.g. "1990--12")
 * so nothing the user typed is lost; see `isCompleteDob`.
 */

export function splitDob(value: string): { year: string; month: string; day: string } {
  const [year = "", month = "", day = ""] = value.split("-");
  return { year, month, day };
}

export function isCompleteDob(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** True when a complete YYYY-MM-DD names a real calendar date. */
export function isRealDate(value: string): boolean {
  if (!isCompleteDob(value)) return false;
  const { year, month, day } = splitDob(value);
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
}

interface DateOfBirthInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

export default function DateOfBirthInput({
  label,
  value,
  onChange,
  onBlur,
  error,
}: DateOfBirthInputProps) {
  const { locale, t } = useI18n();
  const id = useId();
  const errorId = `${id}-error`;
  const { year, month, day } = splitDob(value);
  const [monthFirst, setMonthFirst] = useState(false);

  // Month-first only where the visitor's browser formats dates that way
  // (en-US). Read after mount so server and client markup match.
  useEffect(() => {
    const parts = new Intl.DateTimeFormat(navigator.language).formatToParts(
      new Date(2000, 0, 2)
    );
    const order = parts.filter((p) => p.type === "day" || p.type === "month");
    setMonthFirst(order[0]?.type === "month");
  }, []);

  const monthNames = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) =>
      format.format(new Date(2000, i, 1))
    );
  }, [locale]);

  const emit = (next: { year?: string; month?: string; day?: string }) => {
    const merged = { year, month, day, ...next };
    onChange(`${merged.year}-${merged.month}-${merged.day}`);
  };

  const digits = (raw: string, max: number) => raw.replace(/\D/g, "").slice(0, max);

  // Pad a single-digit day on blur so "7" becomes "07".
  const handleDayBlur = () => {
    if (day.length === 1 && day !== "0") emit({ day: day.padStart(2, "0") });
  };

  const handleGroupBlur = (event: React.FocusEvent<HTMLFieldSetElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onBlur?.();
    }
  };

  const describedBy = error ? errorId : undefined;
  const invalid = !!error || undefined;
  const subLabel = "block font-mono text-[11px] uppercase tracking-wider text-ink-muted mb-1";

  const dayField = (
    <div key="day" className="w-[4.5rem] shrink-0">
      <label htmlFor={`${id}-day`} className={subLabel}>
        {t.wizard.dobDay}
      </label>
      <input
        id={`${id}-day`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="bday-day"
        enterKeyHint="next"
        placeholder="DD"
        maxLength={2}
        value={day}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => emit({ day: digits(event.target.value, 2) })}
        onBlur={handleDayBlur}
        className={cn(inputStyles, "number-mono text-center px-2", error && "border-ink")}
      />
    </div>
  );

  const monthField = (
    <div key="month" className="flex-1 min-w-0">
      <label htmlFor={`${id}-month`} className={subLabel}>
        {t.wizard.dobMonth}
      </label>
      <select
        id={`${id}-month`}
        autoComplete="bday-month"
        value={month}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => emit({ month: event.target.value })}
        className={cn(
          inputStyles,
          "appearance-none bg-base pr-8 bg-no-repeat",
          !month && "text-ink-muted",
          error && "border-ink"
        )}
        style={{
          backgroundImage:
            "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)",
          backgroundPosition: "calc(100% - 16px) 50%, calc(100% - 11px) 50%",
          backgroundSize: "5px 5px, 5px 5px",
        }}
      >
        <option value="">{t.wizard.dobMonthPlaceholder}</option>
        {monthNames.map((name, i) => (
          <option key={name} value={String(i + 1).padStart(2, "0")}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );

  const yearField = (
    <div key="year" className="w-[5.5rem] shrink-0">
      <label htmlFor={`${id}-year`} className={subLabel}>
        {t.wizard.dobYear}
      </label>
      <input
        id={`${id}-year`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="bday-year"
        enterKeyHint="next"
        placeholder="YYYY"
        maxLength={4}
        value={year}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => emit({ year: digits(event.target.value, 4) })}
        className={cn(inputStyles, "number-mono text-center px-2", error && "border-ink")}
      />
    </div>
  );

  return (
    <fieldset onBlur={handleGroupBlur}>
      <legend className="block font-mono text-xs uppercase tracking-wider text-ink-muted mb-2">
        {label}
      </legend>
      <div className="flex gap-2">
        {monthFirst ? [monthField, dayField, yearField] : [dayField, monthField, yearField]}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
}
