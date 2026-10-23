"use client";

import { useEffect, useState } from "react";
import { track, trackShare, useSharerRef } from "@/lib/analytics";
import { shareUrl, type LibraryPageType, type ShareChannel } from "@/lib/share";

/** library_viewed, cta_clicked and share_created must carry identical page_type and page_slug values. */
export function LibraryViewTracker({ pageType, slug, system }: { pageType: LibraryPageType; slug: string; system: string }) {
  useEffect(() => {
    track("library_viewed", { page_type: pageType, page_slug: slug, system });
  }, [pageType, slug, system]);
  return null;
}

/**
 * Opens the native share sheet, or copies text + link where there isn't one.
 * The link is the canonical page with the library UTMs and the sharer's ref.
 */
export async function shareLibraryLink({ path, title, text, sharerRef }: { path: string; title: string; text?: string; sharerRef?: string }): Promise<{ channel: ShareChannel; copied: boolean } | null> {
  const channel: ShareChannel = typeof navigator.share === "function" ? "native" : "copy";
  const url = shareUrl(channel, { ref: sharerRef, path, campaign: "library-share" });
  try {
    if (channel === "native") await navigator.share({ title, text, url });
    else await navigator.clipboard.writeText(text ? `${text} ${url}` : url);
    return { channel, copied: channel === "copy" };
  } catch (error) {
    if ((error as DOMException)?.name === "AbortError") return null;
    throw error;
  }
}

export function LibraryShareButton({ path, title, pageType, slug }: { path: string; title: string; pageType: LibraryPageType; slug: string }) {
  const sharerRef = useSharerRef();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const share = async () => {
    try {
      const result = await shareLibraryLink({ path, title, sharerRef });
      if (!result) return;
      trackShare(pageType, result.channel, sharerRef, { page_type: pageType, page_slug: slug });
      setStatus(result.copied ? "copied" : "idle");
    } catch {
      setStatus("failed");
    }
  };

  return <button type="button" className="library-share" onClick={share} data-attr="library-share">
    {status === "copied" ? "Link copied" : status === "failed" ? "Couldn't share" : "Share this page"}
  </button>;
}
