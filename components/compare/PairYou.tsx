"use client";

import { useEffect, useRef, useState } from "react";
import { compareLabel, lifePathSide, parseCompare, type CompareType } from "@/lib/compare";

const article = (name: string, kind: CompareType) => (kind === "sun" ? name : `the ${name}`);

/**
 * On a pair page reached from /compare, ?you=<value> marks which half is the
 * reader's: a line under the H1, and the matching key-facts rows highlighted.
 * Anything that doesn't validate, or matches neither half, is ignored.
 */
export default function PairYou({ kind, pair }: { kind: CompareType; pair: [string, string] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    const you = parseCompare(kind, new URLSearchParams(window.location.search).get("you"));
    if (!you) return;
    const mine = kind === "lp" ? lifePathSide(you.v) : compareLabel(you);
    const side = pair[0] === pair[1] && mine === pair[0] ? "both" : mine === pair[0] ? "a" : mine === pair[1] ? "b" : null;
    if (!side) return;
    ref.current?.closest("article")?.setAttribute("data-you", side);
    const other = side === "a" ? pair[1] : pair[0];
    const yourLabel = kind === "lp" && you.v !== mine ? `${you.v}, read here through its root ${mine}` : mine;
    setLine(side === "both"
      ? `You and your friend are both ${kind === "lp" ? `Life Path ${mine}` : mine}${kind === "lp" && you.v !== mine ? ` (yours is ${you.v}, read through its root)` : ""}.`
      : `You're ${article(yourLabel, kind)} in this pairing; your friend is ${article(other, kind)}.`);
  }, [kind, pair]);

  return <p ref={ref} className="pair-you" hidden={!line} aria-live="polite">{line}</p>;
}
