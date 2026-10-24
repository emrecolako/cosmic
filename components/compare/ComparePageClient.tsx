"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import DateBox, { parseDate, PREFILL_KEY } from "@/components/library/DateBox";
import CompareWithFriend from "@/components/compare/CompareWithFriend";
import { track } from "@/lib/analytics";
import { storedAttribution } from "@/lib/attribution";
import { compareHeadline, lifePathSide, pairEntryFor, valueFromDate, type CompareValue } from "@/lib/compare";
import type { PairReading } from "@/lib/compare-pairs";
import { INTERPRETATIONS } from "@/lib/numerology";

const sourceNumber = (sharer: CompareValue) => (sharer.t === "lp" ? Number(sharer.v) : undefined);

/**
 * The friend's side of "Compare with a friend". Valid ?t=&v= (parsed on the
 * server, so the heading and date box arrive without JavaScript) shows who is
 * asking and only the date box; anything else gets the generic date box.
 * No signup or paywall. A Life Path sharer's friend gets the match on this
 * page, from `readings` (the pair-page copy for each possible friend number);
 * signs and animals hand off to the canonical pair page with ?you=.
 */
export default function ComparePageClient({ sharer, readings }: { sharer: CompareValue | null; readings?: Record<string, PairReading> }) {
  const router = useRouter();
  const opened = useRef(false);

  useEffect(() => {
    if (!sharer || opened.current) return;
    opened.current = true;
    track("compare_opened", { t: sharer.t, v: sharer.v, source_number: sourceNumber(sharer), ref: storedAttribution().shareRef });
  }, [sharer]);

  if (!sharer) {
    return <>
      <p className="eyebrow">Compare with a friend</p>
      <h1 className="library-title">Find your Life Path, Sun sign and Chinese zodiac animal</h1>
      <DateBox pageType="compare" slug="compare" />
    </>;
  }

  if (sharer.t === "lp" && readings) return <LifePathCompare sharer={sharer} readings={readings} />;

  const complete = (date: Date) => {
    const friend = valueFromDate(sharer.t, date);
    const pair = pairEntryFor(sharer, friend);
    track("compare_completed", { t: sharer.t, pair: pair.slug, ref: storedAttribution().shareRef }, { sendInstantly: true });
    router.push(`${pair.path}?you=${encodeURIComponent(friend.v)}`);
  };

  return <>
    <p className="eyebrow">Compare with a friend</p>
    <h1 className="library-title">{compareHeadline(sharer)}</h1>
    <DateBox pageType="compare" slug="compare" onResult={complete}>
      <p className="library-datebox-note">Your date stays in this browser. You&apos;ll see the pairing page for the two of you; nothing to sign up for.</p>
    </DateBox>
  </>;
}

const titleOf = (v: string) => INTERPRETATIONS.lifePath[Number(v)]?.title;

function NumberTile({ who, value }: { who: string; value: string }) {
  const root = lifePathSide(value);
  return <div className="compare-tile">
    <span className="compare-tile-who">{who}</span>
    <span className="compare-tile-number">{value}</span>
    <span className="compare-tile-title">{titleOf(value)}{root !== value && <> · read through {root}</>}</span>
  </div>;
}

function LifePathCompare({ sharer, readings }: { sharer: CompareValue; readings: Record<string, PairReading> }) {
  const [input, setInput] = useState("");
  const [friend, setFriend] = useState<{ value: CompareValue; date: string } | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const date = useMemo(() => parseDate(input), [input]);
  const reading = friend && readings[lifePathSide(friend.value.v)];

  useEffect(() => {
    if (friend) resultRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }, [friend]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!date) return;
    const value = valueFromDate("lp", date);
    const pair = readings[lifePathSide(value.v)];
    setFriend({ value, date: input });
    track("compare_completed", { t: "lp", pair: pair.slug, source_number: Number(sharer.v), friend_number: Number(value.v), ref: storedAttribution().shareRef }, { sendInstantly: true });
  };

  const ownReading = () => {
    try {
      if (friend) sessionStorage.setItem(PREFILL_KEY, friend.date);
    } catch {
      // The wizard simply starts empty when storage is unavailable.
    }
    track("cta_clicked", { placement: "compare", page_type: "compare", page_slug: "compare", position: "compare-result" });
  };

  return <>
    <p className="eyebrow">Compare with a friend</p>
    <h1 className="library-title">{compareHeadline(sharer)}</h1>
    <form className="library-datebox compare-form" onSubmit={submit} aria-label="Your birth date">
      <p className="library-datebox-note">Add your birth date to see where you two click, where you rub, and one thing that helps. It stays in this browser and is never added to the link. Nothing to sign up for.</p>
      <label className="library-datebox-label">
        <span>Your date of birth</span>
        <input type="date" name="compare-dob" autoComplete="bday" min="1900-01-01" value={input} onChange={(event) => setInput(event.target.value)} data-attr="compare-date-input" />
      </label>
      <button type="submit" className="atlas-primary library-datebox-cta" disabled={!date} data-attr="compare-see-match">See how we match<span aria-hidden="true">↓</span></button>
    </form>

    {friend && reading && <section ref={resultRef} className="compare-result" aria-live="polite" aria-labelledby="compare-result-title">
      <h2 id="compare-result-title" className="eyebrow">Your match</h2>
      <div className="compare-tiles">
        <NumberTile who="Them" value={sharer.v} />
        <span className="compare-tiles-and" aria-hidden="true">&amp;</span>
        <NumberTile who="You" value={friend.value.v} />
      </div>
      <dl className="compare-reading">
        <div><dt>Where you click</dt><dd>{reading.clicks}</dd></div>
        <div><dt>Where you rub</dt><dd>{reading.rubs}</dd></div>
        <div><dt>One thing that helps</dt><dd>{reading.helps}</dd></div>
      </dl>
      <Link className="atlas-link" href={`${reading.path}?you=${encodeURIComponent(friend.value.v)}`} data-attr="compare-full-pair">Read the full pairing <span aria-hidden="true">→</span></Link>

      <div className="compare-next">
        <p className="eyebrow">Your turn</p>
        <CompareWithFriend
          variant="primary"
          label="Compare with someone else"
          placement="compare-result"
          values={[friend.value]}
          onShared={(value, channel) => track("compare_reshared", { source_number: Number(value.v), pair: reading.slug, share_channel: channel })}
        />
        <Link className="atlas-link" href="/#details" onClick={ownReading} data-attr="compare-own-reading">Get your own free reading <span aria-hidden="true">↗</span></Link>
      </div>
    </section>}
  </>;
}
