"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DateBox from "@/components/library/DateBox";
import { track } from "@/lib/analytics";
import { storedAttribution } from "@/lib/attribution";
import { compareHeadline, parseCompare, pairEntryFor, valueFromDate, type CompareValue } from "@/lib/compare";

/**
 * The friend's side of "Compare with a friend". Valid ?t=&v= shows who is
 * asking and only the date box; anything else gets the generic date box.
 * No signup or paywall: the result is the canonical pair page with ?you=.
 */
export default function ComparePageClient() {
  const router = useRouter();
  const [state, setState] = useState<{ ready: boolean; sharer: CompareValue | null }>({ ready: false, sharer: null });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharer = parseCompare(params.get("t"), params.get("v"));
    setState({ ready: true, sharer });
    if (sharer) track("compare_landed", { t: sharer.t, v: sharer.v, share_ref: storedAttribution().shareRef });
  }, []);

  if (!state.ready) return <h1 className="library-title">Compare with a friend</h1>;

  const { sharer } = state;
  if (!sharer) {
    return <>
      <p className="eyebrow">Compare with a friend</p>
      <h1 className="library-title">Find your Life Path, Sun sign and Chinese zodiac animal</h1>
      <DateBox pageType="compare" slug="compare" />
    </>;
  }

  const complete = (date: Date) => {
    const friend = valueFromDate(sharer.t, date);
    const pair = pairEntryFor(sharer, friend);
    track("compare_completed", { t: sharer.t, pair_slug: pair.slug, share_ref: storedAttribution().shareRef }, { sendInstantly: true });
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
