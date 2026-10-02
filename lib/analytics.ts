/**
 * Funnel analytics.
 *
 * Thin wrapper over Vercel Web Analytics (cookieless, no personal data) so
 * the provider can be swapped in one file. NEVER pass PII here — no names,
 * dates, times, places or free text; only counts, booleans and enums.
 *
 * Note: Vercel custom events require a Pro/Enterprise plan. On other plans
 * the calls are harmless no-ops and page views are still recorded.
 *
 * Funnel: landing_view → form_start → form_step_complete(1) → cta_click
 *   → form_submit → result_view → reading_ready | reading_error
 *   → result_action
 */

import { track as vercelTrack } from "@vercel/analytics";

export type FunnelEvent =
  | "landing_view"
  | "cta_click"
  | "form_start"
  | "form_step_complete"
  | "field_error"
  | "form_submit"
  | "result_view"
  | "reading_ready"
  | "reading_error"
  | "result_action";

type Props = Record<string, string | number | boolean | null | undefined>;

export function track(event: FunnelEvent, props?: Props): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event, props ?? {});
  }
  try {
    vercelTrack(event, props);
  } catch {
    // Analytics must never break the funnel.
  }
}
