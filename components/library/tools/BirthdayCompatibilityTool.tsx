"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateLifePath, reduceToSingleDigit } from "@/lib/numerology";
import { SIGN_ORDER, ZODIAC_SIGNS, getSunSign } from "@/lib/western-astrology";
import { LIU_CHONG_PAIRS, LIU_HAI_PAIRS, LIU_HE_PAIRS, SAN_HE_TRINES, getChineseZodiac } from "@/lib/chinese-zodiac";
import { pairEntryFor, valueFromDate, lifePathSide } from "@/lib/compare";
import { track } from "@/lib/analytics";

function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || year < 1900 || date > new Date()) return null;
  return date;
}

const POLARITY: Record<string, string> = { Fire: "active", Air: "active", Earth: "receptive", Water: "receptive" };
const SEPARATION: Record<number, string> = { 0: "the same sign", 1: "neighbouring signs", 2: "a sextile, two signs apart", 3: "a square, three signs apart", 4: "a trine, four signs apart", 5: "a quincunx, five signs apart", 6: "opposite signs" };
const inPairs = (pairs: [string, string][], a: string, b: string) => pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

function signNote(a: string, b: string): string {
  const ea = ZODIAC_SIGNS.find((s) => s.sign === a)!.element;
  const eb = ZODIAC_SIGNS.find((s) => s.sign === b)!.element;
  const d = Math.abs(SIGN_ORDER.indexOf(a) - SIGN_ORDER.indexOf(b));
  const elements = ea === eb ? `both ${ea.toLowerCase()} signs` : POLARITY[ea] === POLARITY[eb] ? `${ea.toLowerCase()} and ${eb.toLowerCase()}, complementary elements` : `${ea.toLowerCase()} and ${eb.toLowerCase()}, contrasting elements`;
  return `${SEPARATION[Math.min(d, 12 - d)]}; ${elements}.`;
}

function animalNote(a: string, b: string): string {
  if (a === b) return "The same animal: shared instincts, and shared blind spots.";
  const relations = [
    SAN_HE_TRINES.some((t) => t.includes(a) && t.includes(b)) && "San He, the three harmonies",
    inPairs(LIU_HE_PAIRS, a, b) && "Liu He, the secret friends",
    inPairs(LIU_CHONG_PAIRS, a, b) && "Liu Chong, the six clashes",
    inPairs(LIU_HAI_PAIRS, a, b) && "Liu Hai, the six harms",
  ].filter(Boolean);
  return relations.length ? `Traditionally ${relations.join(" and ")}.` : "No classical pairing, so the relationship depends on the rest of each chart.";
}

/**
 * Compares two birth dates across numerology, the Western zodiac and the
 * Chinese zodiac, in the browser. Neither date is sent or put in the URL.
 */
export default function BirthdayCompatibilityTool() {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const reported = useRef(false);
  const a = useMemo(() => parseDate(first), [first]);
  const b = useMemo(() => parseDate(second), [second]);
  const result = useMemo(() => {
    if (!a || !b) return null;
    const people = [a, b].map((date) => ({ lifePath: calculateLifePath(date), sun: getSunSign(date).sign, animal: getChineseZodiac(date).animal }));
    const [x, y] = people;
    const lpA = Number(lifePathSide(String(x.lifePath)));
    const lpB = Number(lifePathSide(String(y.lifePath)));
    return {
      people,
      pairs: [
        { label: "Life Path", value: `${x.lifePath} and ${y.lifePath}`, entry: pairEntryFor(valueFromDate("lp", a), valueFromDate("lp", b)), note: `Combined number ${lpA} + ${lpB} = ${lpA + lpB}${reduceToSingleDigit(lpA + lpB) === lpA + lpB ? "" : ` → ${reduceToSingleDigit(lpA + lpB)}`}; ${lpA % 2 === lpB % 2 ? (lpA % 2 ? "both odd, active numbers" : "both even, receptive numbers") : "one odd and one even, a complementary pair"}.` },
        { label: "Sun signs", value: `${x.sun} and ${y.sun}`, entry: pairEntryFor(valueFromDate("sun", a), valueFromDate("sun", b)), note: `${signNote(x.sun, y.sun).charAt(0).toUpperCase()}${signNote(x.sun, y.sun).slice(1)}` },
        { label: "Chinese zodiac", value: `${x.animal} and ${y.animal}`, entry: pairEntryFor(valueFromDate("cz", a), valueFromDate("cz", b)), note: animalNote(x.animal, y.animal) },
      ],
    };
  }, [a, b]);

  useEffect(() => {
    if (result && !reported.current) {
      reported.current = true;
      track("library_tool_used", { page_type: "calculator", tool: "birthday-compatibility" });
    }
  }, [result]);

  return <section className="library-datebox library-tool" aria-labelledby="tool-birthday-compatibility">
    <h2 id="tool-birthday-compatibility" className="library-datebox-title">Compare two birthdays</h2>
    <p className="library-datebox-note">Calculated in your browser. Neither date is sent anywhere or added to the link.</p>
    <div className="library-tool-fields">
      <label className="library-datebox-label">
        <span>First birth date</span>
        <input type="date" name="library-dob-a" min="1900-01-01" value={first} onChange={(event) => setFirst(event.target.value)} data-attr="library-compat-date-a" />
      </label>
      <label className="library-datebox-label">
        <span>Second birth date</span>
        <input type="date" name="library-dob-b" min="1900-01-01" value={second} onChange={(event) => setSecond(event.target.value)} data-attr="library-compat-date-b" />
      </label>
    </div>
    {result && <div className="library-datebox-result" aria-live="polite">
      <table className="library-tool-table">
        <thead><tr><th scope="col">System</th><th scope="col">Pairing</th><th scope="col">What tradition says</th></tr></thead>
        <tbody>
          {result.pairs.map((pair) => <tr key={pair.label}>
            <th scope="row">{pair.label}</th>
            <td><Link href={pair.entry.path}>{pair.value}</Link></td>
            <td>{pair.note}</td>
          </tr>)}
        </tbody>
      </table>
      <p className="library-datebox-detail">Each pairing links to its full guide. {result.people.map((p, i) => <span key={i}>{i === 0 ? "The first birthday is a " : " The second is a "}<Link href={`/life-path/${p.lifePath}-${p.sun.toLowerCase()}`}>Life Path {p.lifePath} {p.sun}</Link> and a <Link href={`/zodiac/${p.sun.toLowerCase()}-${p.animal.toLowerCase()}`}>{p.sun} {p.animal}</Link>.</span>)} Compatibility here compares whole numbers, signs and animals; it is a starting point for conversation, not a score.</p>
    </div>}
  </section>;
}
