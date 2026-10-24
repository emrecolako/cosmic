"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateLifePath, reduceToSingleDigit } from "@/lib/numerology";
import { getSunSign } from "@/lib/western-astrology";
import { getChineseZodiac, LUNAR_NEW_YEAR_DATES } from "@/lib/chinese-zodiac";
import { landingContext, track } from "@/lib/analytics";
import type { LibraryPageType } from "@/lib/share";
import { valueFromDate, type CompareType } from "@/lib/compare";
import CompareWithFriend from "@/components/compare/CompareWithFriend";

export const PREFILL_KEY = "ur:prefill";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type DateBoxMode = "compact" | "life-path" | "zodiac" | "chinese";
export function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (year < 1900 || date > new Date()) return null;
  return date;
}

type Part = "month" | "day" | "year";
const PART_SPEC: Record<Part, { label: string; placeholder: string; maxLength: number; autoComplete: string }> = {
  month: { label: "Month", placeholder: "MM", maxLength: 2, autoComplete: "bday-month" },
  day: { label: "Day", placeholder: "DD", maxLength: 2, autoComplete: "bday-day" },
  year: { label: "Year", placeholder: "YYYY", maxLength: 4, autoComplete: "bday-year" },
};

function dateFromParts({ month, day, year }: Record<Part, string>): Date | null {
  if (!month || !day || year.length !== 4) return null;
  const [y, m, d] = [Number(year), Number(month), Number(day)];
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  if (y < 1900 || date > new Date()) return null;
  return date;
}

const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function lifePathSteps(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const yearSum = String(year).split("").reduce((sum, d) => sum + Number(d), 0);
  const parts = [reduceToSingleDigit(month), reduceToSingleDigit(day), reduceToSingleDigit(yearSum)];
  const total = parts.reduce((sum, p) => sum + p, 0);
  const result = calculateLifePath(date);
  return `Month ${month} → ${parts[0]}, day ${day} → ${parts[1]}, year ${year} → ${yearSum} → ${parts[2]}. ${parts.join(" + ")} = ${total}${total === result ? "" : ` → ${result}`}.`;
}

/**
 * Computes Life Path, Sun sign and Chinese animal in the browser. The date
 * never leaves the page: no request, no URL parameter, and events carry only
 * the page type and slug. Three numeric fields (numeric keypad on phones,
 * nothing to parse) and one button; the free result renders right below,
 * with the paid offer after it. "See your free preview" hands the date to the
 * wizard through sessionStorage. With `compare`, the reader can send their
 * computed value (never the date) to a friend.
 */
export default function DateBox({ pageType, slug, mode = "compact", compare, onResult, variant = "library", dayFirst = false, price, children }: {
  pageType: LibraryPageType | "home";
  slug: string;
  mode?: DateBoxMode;
  compare?: CompareType;
  /** Replaces the result: the button hands the date straight on, as on /compare. */
  onResult?: (date: Date) => void;
  /** "hero" sits in the home page's dark hero, without its own heading. */
  variant?: "library" | "hero";
  dayFirst?: boolean;
  /** Full Reading price, shown under the free result. */
  price?: string | null;
  children?: React.ReactNode;
}) {
  const [parts, setParts] = useState<Record<Part, string>>({ month: "", day: "", year: "" });
  const [date, setDate] = useState<Date | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [previewHref, setPreviewHref] = useState("/#details");
  const started = useRef(false);
  const viewed = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputs = useRef<Partial<Record<Part, HTMLInputElement | null>>>({});
  const order: Part[] = dayFirst ? ["day", "month", "year"] : ["month", "day", "year"];
  const result = useMemo(() => {
    if (!date) return null;
    const lny = LUNAR_NEW_YEAR_DATES[date.getFullYear()];
    return {
      lifePath: calculateLifePath(date),
      sun: getSunSign(date),
      chinese: getChineseZodiac(date),
      beforeLunarNewYear: !!lny && (date.getMonth() + 1 < lny.month || (date.getMonth() + 1 === lny.month && date.getDate() < lny.day)),
      lny,
    };
  }, [date]);

  // Campaign tags from a reel or partner link carry into the wizard, as SampleCta does.
  useEffect(() => setPreviewHref(variant === "hero" ? "#details" : `/${window.location.search}#details`), [variant]);

  useEffect(() => {
    if (!result || viewed.current) return;
    viewed.current = true;
    const { landing_page, utm_source, seconds_since_landing } = landingContext();
    track("free_result_viewed", { landing_page, utm_source, seconds_to_result: seconds_since_landing, page_type: pageType, page_slug: slug });
    track("library_date_entered", { page_type: pageType });
    const box = resultRef.current?.getBoundingClientRect();
    if (box && box.bottom > window.innerHeight) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result, pageType, slug]);

  const setPart = (part: Part, raw: string) => {
    const value = raw.replace(/\D/g, "").slice(0, PART_SPEC[part].maxLength);
    setParts((current) => ({ ...current, [part]: value }));
    setInvalid(false);
    // Move on once a field can't take another digit: "12", or "4" for a month.
    const full = value.length === PART_SPEC[part].maxLength || (part === "month" && Number(value) > 1) || (part === "day" && Number(value) > 3);
    const next = order[order.indexOf(part) + 1];
    if (full && next) inputs.current[next]?.focus();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const entered = dateFromParts(parts);
    if (!entered) {
      setInvalid(true);
      return;
    }
    if (!started.current) {
      started.current = true;
      const { landing_page, utm_source } = landingContext();
      track("reading_started", { landing_page, utm_source, entry: "date_box", page_type: pageType, page_slug: slug }, onResult ? { sendInstantly: true } : undefined);
    }
    if (onResult) onResult(entered);
    else setDate(entered);
  };

  const handOff = () => {
    try {
      if (date) sessionStorage.setItem(PREFILL_KEY, isoDate(date));
    } catch {
      // The wizard simply starts empty when storage is unavailable.
    }
    track("cta_clicked", { placement: pageType === "home" ? "home" : "library", page_type: pageType, page_slug: slug, position: "date-box" });
  };

  const heading = mode === "life-path" ? "Calculate your Life Path number" : mode === "zodiac" ? "Find your Sun sign" : mode === "chinese" ? "Find your Chinese zodiac animal" : "Try it with your birth date";
  const errorId = `datebox-${slug}-error`;
  const previewCta = <>See your free preview<span aria-hidden="true">↗</span></>;

  return <section className={`library-datebox library-datebox-${mode} library-datebox-${variant}`} data-quick-date aria-labelledby={variant === "library" ? `datebox-${slug}` : undefined} aria-label={variant === "hero" ? "Your free result from your birth date" : undefined}>
    {variant === "library" && <h2 id={`datebox-${slug}`} className="library-datebox-title">{heading}</h2>}
    <p className="library-datebox-note">Calculated in your browser. Your date is not sent anywhere or added to the link.</p>
    <form className="library-datebox-form" onSubmit={submit} noValidate>
      <fieldset aria-describedby={invalid ? errorId : undefined}>
        <legend className="library-datebox-label">Date of birth</legend>
        <div className="library-datebox-fields">
          {order.map((part) => <label key={part} className={`library-datebox-part library-datebox-${part}`}>
            <span>{PART_SPEC[part].label}</span>
            <input
              ref={(el) => { inputs.current[part] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name={`library-dob-${part}`}
              autoComplete={PART_SPEC[part].autoComplete}
              placeholder={PART_SPEC[part].placeholder}
              maxLength={PART_SPEC[part].maxLength}
              value={parts[part]}
              onChange={(event) => setPart(part, event.target.value)}
              aria-invalid={invalid || undefined}
              data-attr={`library-date-${part}`}
            />
          </label>)}
        </div>
      </fieldset>
      {invalid && <p id={errorId} className="library-datebox-error" role="alert">Enter a real date between 1900 and today.</p>}
      {children}
      <button type="submit" className={`atlas-primary library-datebox-submit${variant === "hero" ? " button-light" : ""}`} data-attr={onResult ? "compare-see-match" : "library-date-submit"}>
        {onResult ? "See how we match" : "Show my free result"}<span aria-hidden="true">↗</span>
      </button>
    </form>
    {result && <div ref={resultRef} className="library-datebox-result" aria-live="polite">
      <dl>
        <div><dt>Life Path</dt><dd><Link href={`/life-path/${result.lifePath}`}>{result.lifePath}</Link></dd></div>
        <div><dt>Sun sign</dt><dd><Link href={`/zodiac/${result.sun.sign.toLowerCase()}`}>{result.sun.glyph} {result.sun.sign}</Link></dd></div>
        <div><dt>Chinese zodiac</dt><dd><Link href={`/chinese-zodiac/${result.chinese.element.toLowerCase()}-${result.chinese.animal.toLowerCase()}`}>{result.chinese.element} {result.chinese.animal}</Link></dd></div>
      </dl>
      {mode === "life-path" && <p className="library-datebox-detail">{lifePathSteps(date!)} {[11, 22, 33].includes(result.lifePath) ? `${result.lifePath} is a master number, so it is kept whole.` : ""}</p>}
      {mode === "zodiac" && <p className="library-datebox-detail">{result.sun.sign} is a {result.sun.modality} {result.sun.element} sign ruled by {result.sun.rulingPlanet}; this date falls in its {["first", "second", "third"][result.sun.decan - 1]} decan. The sign comes from the Sun&apos;s calculated position at noon on that day, so dates near a cusp resolve for the specific year. Moon and rising signs need a birth time and place.</p>}
      {mode === "chinese" && <p className="library-datebox-detail">{result.chinese.yinYang} {result.chinese.element} {result.chinese.animal}.{result.lny ? ` Lunar New Year ${date!.getFullYear()} fell on ${MONTHS[result.lny.month - 1]} ${result.lny.day}${result.beforeLunarNewYear ? `, so this date still belongs to the previous zodiac year` : ""}.` : " This year is outside the 1924-2044 Lunar New Year table, so a February 5 boundary is assumed."}</p>}
      <div className="library-datebox-actions">
        {/* On the home page a plain anchor fires hashchange, which opens the wizard. */}
        {variant === "hero"
          ? <a className="atlas-primary library-datebox-cta button-light" href={previewHref} onClick={handOff} data-attr="home-date-cta">{previewCta}</a>
          : <Link className="atlas-primary library-datebox-cta" href={previewHref} onClick={handOff} data-attr="library-date-cta">{previewCta}</Link>}
        {compare && <CompareWithFriend values={[valueFromDate(compare, date!)]} placement={pageType} context={{ page_type: pageType, page_slug: slug }} />}
      </div>
      {price && <p className="library-datebox-offer">Want all three read together? The Full Reading is {price}, one time, after your free preview.</p>}
    </div>}
  </section>;
}
