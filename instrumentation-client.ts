import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// Stripe Checkout returns to /results?session_id=…; the checkout reference
// must not reach analytics even though the page strips it right after load.
const CHECKOUT_PARAM = /([?&])session_id=[^&#]*/g;

function scrub(props: Record<string, unknown> | undefined) {
  if (!props) return;
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string" && v.includes("session_id=")) {
      props[k] = v.replace(CHECKOUT_PARAM, "$1session_id=redacted");
    }
  }
}

if (key && host) {
  posthog.init(key, {
    api_host: host,
    defaults: "2026-08-30",
    capture_pageview: "history_change",
    // Rendered text includes birth names and dates; keep it out of autocapture and replays.
    mask_all_text: true,
    disable_session_recording: true,
    before_send: (event) => {
      if (event) {
        scrub(event.properties);
        scrub(event.$set_once);
        scrub(event.$set);
      }
      return event;
    },
  });
}
