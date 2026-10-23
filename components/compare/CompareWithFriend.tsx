"use client";

import { useState } from "react";
import { track, useSharerRef } from "@/lib/analytics";
import { shareUrl, type ShareChannel } from "@/lib/share";
import { compareLabel, comparePath, compareShareText, type CompareValue } from "@/lib/compare";

/**
 * Shares /compare?t=…&v=… with the compare-friend campaign and the sharer's
 * ref. Only the computed value is in the link; never a birth date or name.
 * Pass several values to let the reader pick which one to compare.
 */
export default function CompareWithFriend({ values, placement, context = {}, label = "Compare with a friend" }: {
  values: CompareValue[];
  placement: string;
  context?: Record<string, string>;
  label?: string;
}) {
  const sharerRef = useSharerRef();
  const [picking, setPicking] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const share = async (value: CompareValue) => {
    const channel: ShareChannel = typeof navigator.share === "function" ? "native" : "copy";
    const url = shareUrl(channel, { ref: sharerRef, path: comparePath(value), campaign: "compare-friend" });
    const text = compareShareText(value);
    try {
      if (channel === "native") await navigator.share({ title: "Compare with me on Unified Reading", text, url });
      else await navigator.clipboard.writeText(`${text} ${url}`);
      track("compare_link_created", { ...context, t: value.t, v: value.v, placement, share_channel: channel, sharer_ref: sharerRef });
      // Also a share, so funnels ending in share_created count it.
      track("share_created", { ...context, placement, share_kind: "compare", share_channel: channel, utm_content: channel, sharer_ref: sharerRef });
      setStatus(channel === "copy" ? "copied" : "idle");
      setPicking(false);
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") setStatus("failed");
    }
  };

  const text = status === "copied" ? "Link copied. Send it to a friend." : status === "failed" ? "Couldn't share" : label;
  if (values.length === 1) {
    return <button type="button" className="compare-friend" onClick={() => share(values[0])} data-attr={`compare-friend-${values[0].t}`}>{text} <span aria-hidden="true">→</span></button>;
  }
  return <div className="compare-friend-group">
    <button type="button" className="compare-friend" onClick={() => setPicking(!picking)} aria-expanded={picking} data-attr="compare-friend">{text} <span aria-hidden="true">→</span></button>
    {picking && <div className="compare-friend-options" role="group" aria-label={label}>
      {values.map((value) => <button key={value.t} type="button" onClick={() => share(value)} data-attr={`compare-friend-${value.t}`}>{compareLabel(value)}</button>)}
    </div>}
  </div>;
}
