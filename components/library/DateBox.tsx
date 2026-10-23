"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateLifePath, reduceToSingleDigit } from "@/lib/numerology";
import { getSunSign } from "@/lib/western-astrology";
import { getChineseZodiac, LUNAR_NEW_YEAR_DATES } from "@/lib/chinese-zodiac";
import { track } from "@/lib/analytics";
import type { LibraryPageType } from "@/lib/share";
import { valueFromDate, type CompareType } from "@/lib/compare";
import CompareWithFriend from "@/components/compare/CompareWithFriend";

export const PREFILL_KEY = "ur:prefill";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type DateBoxMode = "compact" | "life-path" | "zodiac" | "chinese";
function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (year < 1900 || date > new Date()) return null;
  return date;
}

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
 * the page type and slug. "See your free preview" hands it to the wizard
 * through sessionStorage. With `compare`, the reader can send their computed
 * value (never the date) to a friend.
 */
export default function DateBox({ pageType, slug, mode = "compact", compare, onResult, children }: {
  pageType: LibraryPageType;
  slug: string;
  mode?: DateBoxMode;
  compare?: CompareType;
  /** Replaces the default result actions, as on /compare. */
  onResult?: (date: Date) => void;
  children?: React.ReactNode;
}) {
  const [value, setValue] = useState("");
  const [previewHref, setPreviewHref] = useState("/#details");
  const reported = useRef(false);
  const date = useMemo(() => parseDate(value), [value]);
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
  useEffect(() => setPreviewHref(`/${window.location.search}#details`), []);

  useEffect(() => {
    if (result && !reported.current) {
      reported.current = true;
      track("library_date_entered", { page_type: pageType });
    }
  }, [result, pageType]);

  const handOff = () => {
    try {
      if (date) sessionStorage.setItem(PREFILL_KEY, value);
    } catch {
      // The wizard simply starts empty when storage is unavailable.
    }
    track("cta_clicked", { placement: "library", page_type: pageType, page_slug: slug, position: "date-box" });
  };

  const heading = mode === "life-path" ? "Calculate your Life Path number" : mode === "zodiac" ? "Find your Sun sign" : mode === "chinese" ? "Find your Chinese zodiac animal" : "Try it with your birth date";

  return <section className={`library-datebox library-datebox-${mode}`} aria-labelledby={`datebox-${slug}`}>
    <h2 id={`datebox-${slug}`} className="library-datebox-title">{heading}</h2>
    <p className="library-datebox-note">Calculated in your browser. Your date is not sent anywhere or added to the link.</p>
    <label className="library-datebox-label">
      <span>Date of birth</span>
      <input type="date" name="library-dob" autoComplete="bday" min="1900-01-01" value={value} onChange={(event) => setValue(event.target.value)} data-attr="library-date-input" />
    </label>
    {children}
    {result && <div className="library-datebox-result" aria-live="polite">
      <dl>
        <div><dt>Life Path</dt><dd><Link href={`/life-path/${result.lifePath}`}>{result.lifePath}</Link></dd></div>
        <div><dt>Sun sign</dt><dd><Link href={`/zodiac#${result.sun.sign.toLowerCase()}`}>{result.sun.glyph} {result.sun.sign}</Link></dd></div>
        <div><dt>Chinese zodiac</dt><dd><Link href={`/chinese-zodiac/${result.chinese.animal.toLowerCase()}`}>{result.chinese.element} {result.chinese.animal}</Link></dd></div>
      </dl>
      {mode === "life-path" && <p className="library-datebox-detail">{lifePathSteps(date!)} {[11, 22, 33].includes(result.lifePath) ? `${result.lifePath} is a master number, so it is kept whole.` : ""}</p>}
      {mode === "zodiac" && <p className="library-datebox-detail">{result.sun.sign} is a {result.sun.modality} {result.sun.element} sign ruled by {result.sun.rulingPlanet}; this date falls in its {["first", "second", "third"][result.sun.decan - 1]} decan. The sign comes from the Sun&apos;s calculated position at noon on that day, so dates near a cusp resolve for the specific year. Moon and rising signs need a birth time and place.</p>}
      {mode === "chinese" && <p className="library-datebox-detail">{result.chinese.yinYang} {result.chinese.element} {result.chinese.animal}.{result.lny ? ` Lunar New Year ${date!.getFullYear()} fell on ${MONTHS[result.lny.month - 1]} ${result.lny.day}${result.beforeLunarNewYear ? `, so this date still belongs to the previous zodiac year` : ""}.` : " This year is outside the 1924-2044 Lunar New Year table, so a February 5 boundary is assumed."}</p>}
      <div className="library-datebox-actions">
        {onResult
          ? <button type="button" className="atlas-primary library-datebox-cta" onClick={() => onResult(date!)} data-attr="compare-see-match">See how we match<span aria-hidden="true">↗</span></button>
          : <Link className="atlas-primary library-datebox-cta" href={previewHref} onClick={handOff} data-attr="library-date-cta">See your free preview<span aria-hidden="true">↗</span></Link>}
        {compare && !onResult && <CompareWithFriend values={[valueFromDate(compare, date!)]} placement={pageType} context={{ page_type: pageType, page_slug: slug }} />}
      </div>
    </div>}
  </section>;
}
