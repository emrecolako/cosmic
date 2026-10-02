/**
 * Share helpers for the results page. Only the headline signs travel in the
 * share text — never birth date, time or place.
 */

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

export async function shareOrCopy(data: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareOutcome> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      // Fall through to clipboard (e.g. share not permitted in this context).
    }
  }
  return (await copyText(`${data.text} ${data.url}`)) ? "copied" : "failed";
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
