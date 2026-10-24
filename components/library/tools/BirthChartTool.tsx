"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchPlaces, type PlaceSuggestion } from "@/lib/place-search";
import { getMoonSign, getMoonSignInAnyZone, getRisingSign, getSunSign } from "@/lib/western-astrology";
import { PREFILL_KEY } from "@/components/library/DateBox";
import { track } from "@/lib/analytics";
import { textGlyph } from "@/lib/utils";

const DECANS = ["", "first", "second", "third"];

function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || year < 1900 || date > new Date()) return null;
  return date;
}

/**
 * Sun, Moon and rising signs, calculated in the browser with the same
 * formulas as the free Western card in a reading (lib/western-astrology.ts).
 * The full chart engine stays on the server with the paid Star Map. Only the
 * place search leaves the page: what you type in that box goes to
 * OpenStreetMap's Photon search, as in the reading form. The date and time
 * never do.
 */
export default function BirthChartTool() {
  const [value, setValue] = useState("");
  const [time, setTime] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [place, setPlace] = useState<PlaceSuggestion | null>(null);
  const [offset, setOffset] = useState<number | undefined>(undefined);
  const [previewHref, setPreviewHref] = useState("/#details");
  const reported = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const date = useMemo(() => parseDate(value), [value]);

  useEffect(() => setPreviewHref(`/${window.location.search}#details`), []);

  // Place suggestions, debounced.
  useEffect(() => {
    if (place && query === place.label) return;
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      abort.current?.abort();
      abort.current = new AbortController();
      setSuggestions(await searchPlaces(query, "en", abort.current.signal));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, place]);

  // The UTC offset for the chosen place at the birth date and time, resolved locally (tz-lookup).
  useEffect(() => {
    if (!place || !date) {
      setOffset(undefined);
      return;
    }
    let cancelled = false;
    import("@/lib/timezone").then(({ getTimezoneOffsetHours }) => {
      if (cancelled) return;
      const [hours, minutes] = (time || "12:00").split(":").map(Number);
      setOffset(getTimezoneOffsetHours(place.latitude, place.longitude, date.getFullYear(), date.getMonth() + 1, date.getDate(), hours, minutes) ?? undefined);
    });
    return () => {
      cancelled = true;
    };
  }, [place, date, time]);

  const result = useMemo(() => {
    if (!date) return null;
    const known = Boolean(time) && offset !== undefined;
    return {
      // A time is only meaningful with a zone; until then the Sun stays on the noon fallback rather than reading the time as UTC.
      sun: getSunSign(date, known ? time : undefined, offset),
      // Without a time and zone, the Moon is shown only if it holds all day everywhere.
      moon: known ? getMoonSign(date, time, offset) : getMoonSignInAnyZone(date),
      rising: known && place ? getRisingSign(date, time, place.latitude, place.longitude, offset) : null,
      known,
    };
  }, [date, time, offset, place]);

  useEffect(() => {
    if (result && !reported.current) {
      reported.current = true;
      track("library_tool_used", { page_type: "calculator", tool: "birth-chart" });
    }
  }, [result]);

  const choose = (suggestion: PlaceSuggestion) => {
    setSuggestions([]);
    setQuery(suggestion.label);
    setPlace(suggestion);
  };

  const handOff = () => {
    try {
      sessionStorage.setItem(PREFILL_KEY, value);
    } catch {
      // The wizard simply starts empty when storage is unavailable.
    }
    track("cta_clicked", { placement: "library", page_type: "calculator", page_slug: "birth-chart-calculator", position: "birth-chart-tool" });
  };

  const missing = !time && !place ? "a birth time and place" : !time ? "a birth time" : !place ? "a birth place" : "";

  return <section className="library-datebox library-tool" aria-labelledby="tool-birth-chart">
    <h2 id="tool-birth-chart" className="library-datebox-title">Find your Sun, Moon and rising signs</h2>
    <p className="library-datebox-note">Calculated in your browser. Your date and time are not sent anywhere or added to the link; only the place search box is looked up, through OpenStreetMap.</p>
    <div className="library-tool-fields">
      <label className="library-datebox-label">
        <span>Date of birth</span>
        <input type="date" name="library-chart-dob" autoComplete="bday" min="1900-01-01" value={value} onChange={(event) => setValue(event.target.value)} data-attr="library-chart-date" />
      </label>
      <label className="library-datebox-label">
        <span>Time of birth (optional)</span>
        <input type="time" name="library-chart-time" value={time} onChange={(event) => setTime(event.target.value)} data-attr="library-chart-time" />
      </label>
      <div className="library-datebox-label library-tool-place">
        <label htmlFor="library-chart-place">Place of birth (optional)</label>
        <input id="library-chart-place" type="text" autoComplete="off" value={query} placeholder="Town or city" onChange={(event) => { setQuery(event.target.value); setPlace(null); }} data-attr="library-chart-place" />
        {suggestions.length > 0 && <ul className="library-tool-suggestions" role="listbox" aria-label="Places">
          {suggestions.map((s) => <li key={`${s.label}-${s.latitude}`}><button type="button" onClick={() => choose(s)}>{s.label}</button></li>)}
        </ul>}
      </div>
    </div>
    {result && <div className="library-datebox-result" aria-live="polite">
      <dl>
        <div><dt>Sun</dt><dd><Link href={`/zodiac/${result.sun.sign.toLowerCase()}`}>{textGlyph(result.sun.glyph)} {result.sun.sign}</Link></dd></div>
        <div><dt>Moon</dt><dd>{result.moon ? <Link href={`/zodiac/moon-in-${result.moon.toLowerCase()}`}>{result.moon}</Link> : "Needs birth time"}</dd></div>
        <div><dt>Rising</dt><dd>{result.rising ? <Link href={`/zodiac/${result.rising.toLowerCase()}-rising`}>{result.rising}</Link> : "Needs time and place"}</dd></div>
      </dl>
      <p className="library-datebox-detail">
        {result.sun.sign} {result.known ? "at your birth time" : "at local noon"}, in its <Link href={`/zodiac/${result.sun.sign.toLowerCase()}-decan-${result.sun.decan}`}>{DECANS[result.sun.decan]} decan</Link>.
        {!result.moon ? " The Moon changed sign on this date, so its sign depends on the birth time." : result.known ? "" : " The Moon stayed in one sign all day, so the date alone is enough for it."}
        {missing ? ` Add ${missing} to find the rising sign.` : ""}
        {" "}The other planets, whole sign houses and your chart ruler are part of the full Unified Reading.
      </p>
      <div className="library-datebox-actions">
        <Link className="atlas-primary library-datebox-cta" href={previewHref} onClick={handOff} data-attr="library-chart-cta">See your free preview<span aria-hidden="true">↗</span></Link>
      </div>
    </div>}
  </section>;
}
