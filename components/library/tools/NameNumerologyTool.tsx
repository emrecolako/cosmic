"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { INTERPRETATIONS, PYTHAGOREAN_VALUES, VOWELS, calculateExpression, calculatePersonality, calculateSoulUrge, normalizeName } from "@/lib/numerology";
import { track } from "@/lib/analytics";

const POSITIONS = [
  { key: "expression", label: "Expression", meaning: "every letter: natural talents", calc: calculateExpression, pick: () => true, interpretation: "expression" },
  { key: "soul-urge", label: "Soul Urge", meaning: "vowels: what you want inside", calc: calculateSoulUrge, pick: (ch: string) => VOWELS.has(ch), interpretation: "soulUrge" },
  { key: "personality", label: "Personality", meaning: "consonants: how you come across", calc: calculatePersonality, pick: (ch: string) => !VOWELS.has(ch), interpretation: "personality" },
] as const;

/** The letters the calculation counts, normalised exactly as lib/numerology does. */
const lettersOf = (name: string) =>
  normalizeName(name).toUpperCase().split("").filter((ch) => PYTHAGOREAN_VALUES[ch] !== undefined);

/**
 * Expression, Soul Urge and Personality numbers from a birth name, computed in
 * the browser. The name is never sent, stored or put in the URL; the only
 * event is that the tool was used.
 */
export default function NameNumerologyTool() {
  const [name, setName] = useState("");
  const reported = useRef(false);
  const letters = useMemo(() => lettersOf(name), [name]);
  const results = useMemo(() => {
    if (letters.length < 2) return null;
    return POSITIONS.map((position) => {
      const counted = letters.filter((ch) => position.pick(ch));
      const values = counted.map((ch) => PYTHAGOREAN_VALUES[ch]);
      const n = position.calc(name);
      // A name with no vowels (Rhys, Lynn: Y is a consonant here) or no consonants (Ao) has no number in that position.
      return { ...position, n, available: counted.length > 0, counted, total: values.reduce((sum, v) => sum + v, 0), title: INTERPRETATIONS[position.interpretation][n]?.title };
    });
  }, [letters, name]);

  useEffect(() => {
    if (results && !reported.current) {
      reported.current = true;
      track("library_tool_used", { page_type: "calculator", tool: "name-numerology" });
    }
  }, [results]);

  return <section className="library-datebox library-tool" aria-labelledby="tool-name-numerology">
    <h2 id="tool-name-numerology" className="library-datebox-title">Calculate your name numbers</h2>
    <p className="library-datebox-note">Calculated in your browser. Your name is not sent anywhere, saved or added to the link.</p>
    <label className="library-datebox-label">
      <span>Full name at birth</span>
      <input type="text" name="library-birth-name" autoComplete="off" spellCheck={false} value={name} onChange={(event) => setName(event.target.value)} placeholder="First, middle and last names" data-attr="library-name-input" />
    </label>
    {results && <div className="library-datebox-result" aria-live="polite">
      <dl>
        {results.map((r) => <div key={r.key}>
          <dt>{r.label}</dt>
          <dd>{r.available ? <Link href={`/numerology/${r.key}-${r.n}`}>{r.n}</Link> : "—"}</dd>
        </div>)}
      </dl>
      <ul className="library-tool-steps">
        {results.map((r) => <li key={r.key}>
          {r.available
            ? <><strong>{r.label} {r.n}{r.title ? ` · ${r.title}` : ""}</strong> ({r.meaning}). {r.counted.join(" ")} = {r.total}{r.total === r.n ? "" : ` → ${r.n}`}{[11, 22, 33].includes(r.n) ? ", a master number kept whole" : ""}.</>
            : <><strong>{r.label}: not available</strong> ({r.meaning}). This name has no {r.key === "soul-urge" ? "vowels (A, E, I, O, U; Y counts as a consonant here)" : "consonants"}, so there is nothing to add up.</>}
        </li>)}
      </ul>
      <p className="library-datebox-detail">Y counts as a consonant, as in every Unified Reading. Your Life Path comes from your birth date instead; the <Link href="/life-path-calculator">Life Path calculator</Link> works it out.</p>
    </div>}
  </section>;
}
