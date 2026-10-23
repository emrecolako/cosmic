"use client";

import { useEffect, useState } from "react";
import { track, trackShare, useSharerRef } from "@/lib/analytics";
import { shareUrl, type ShareChannel } from "@/lib/share";

export function LibraryViewTracker({ pageType, slug, system }: { pageType: string; slug: string; system: string }) {
  useEffect(() => {
    track("library_viewed", { page_type: pageType, slug, system });
  }, [pageType, slug, system]);
  return null;
}

export function LibraryShareButton({ path, title, pageType, slug }: { path: string; title: string; pageType: string; slug: string }) {
  const sharerRef = useSharerRef();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const share = async () => {
    const channel: ShareChannel = typeof navigator.share === "function" ? "native" : "copy";
    const url = shareUrl(channel, { ref: sharerRef, path, campaign: "library-share" });
    try {
      if (channel === "native") await navigator.share({ title, url });
      else await navigator.clipboard.writeText(url);
      trackShare("library", channel, sharerRef, { page_type: pageType, slug });
      setStatus(channel === "copy" ? "copied" : "idle");
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") setStatus("failed");
    }
  };

  return <button type="button" className="library-share" onClick={share} data-attr="library-share">
    {status === "copied" ? "Link copied" : status === "failed" ? "Couldn't share" : "Share this page"}
  </button>;
}
