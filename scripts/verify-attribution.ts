/**
 * Regression tests for order attribution and the Stripe webhook filters.
 * Run with: npm run verify:attribution
 */

import {
  attributionFromMetadata,
  captureAttribution,
  flattenAttribution,
  resolveAttribution,
  sanitizeAttribution,
  storedAttribution,
} from "../lib/attribution";
import { createHash } from "node:crypto";
import { createCheckoutSession, isPaidSession, isReadingOrder, promoPartnerFrom, readingCheckoutSessionId } from "../lib/stripe";
import { shareRefFor, shareUrl } from "../lib/share";

let failures = 0;
let passes = 0;

function check(label: string, actual: unknown, expected: unknown): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) passes++;
  else {
    failures++;
    console.error(`FAIL  ${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
}

// --- Webhook filters (shared Stripe account) ---
const session = (metadata: Record<string, string> | null, type = "checkout.session.completed") => ({
  type,
  data: { object: { id: "cs_test_1", object: "checkout.session", metadata } },
});
check("reading session is processed", readingCheckoutSessionId(session({ readingHash: "abc" })), "cs_test_1");
check("other product's session is skipped", readingCheckoutSessionId(session({ product: "opengrant" })), null);
check("session without metadata is skipped", readingCheckoutSessionId(session(null)), null);
check("async success is processed", readingCheckoutSessionId(session({ readingHash: "abc" }, "checkout.session.async_payment_succeeded")), "cs_test_1");
check("unrelated event type is skipped", readingCheckoutSessionId(session({ readingHash: "abc" }, "invoice.paid")), null);
check("non-session object is skipped", readingCheckoutSessionId({ type: "checkout.session.completed", data: { object: { id: "pi_1", object: "payment_intent", metadata: { readingHash: "abc" } } } }), null);
check("order with the reading price passes", isReadingOrder({ priceIds: ["price_other", "price_reading"] }, "price_reading"), true);
check("order with another product's price is skipped", isReadingOrder({ priceIds: ["price_review_rescue"] }, "price_reading"), false);
check("order without line items is skipped", isReadingOrder({ priceIds: [] }, "price_reading"), false);
check("unset STRIPE_PRICE_ID never matches", isReadingOrder({ priceIds: ["price_reading"] }, undefined), false);

// --- Promotion codes: only tagged codes credit a partner ---
check("public code without metadata is not a partner", promoPartnerFrom(undefined), undefined);
check("public code with unrelated metadata is not a partner", promoPartnerFrom({ campaign: "launch" }), undefined);
check("blank partner metadata is not a partner", promoPartnerFrom({ partner: "  " }), undefined);
check("tagged code credits its partner, lowercased", promoPartnerFrom({ partner: " Maya " }), "maya");

// --- Resolution precedence and case handling ---
const partnerFirst = { first: { utm_source: "Joe", utm_medium: "Partner" }, last: {} };
check("utm_medium compared case-insensitively", resolveAttribution(partnerFirst), { rule: "first_touch", partner: "joe" });
check("last touch beats first touch", resolveAttribution({ first: { utm_source: "joe", utm_medium: "partner" }, last: { utm_source: "MAYA", utm_medium: "PARTNER" } }), { rule: "last_touch", partner: "maya" });
check("non-partner last touch falls back to partner first touch", resolveAttribution({ first: { utm_source: "joe", utm_medium: "partner" }, last: { utm_source: "tiktok", utm_medium: "social" } }), { rule: "first_touch", partner: "joe" });
check("tagged promo code beats both touches", resolveAttribution(partnerFirst, promoPartnerFrom({ partner: "maya" })), { rule: "promo_code", partner: "maya" });
check("public promo code falls through to touches", resolveAttribution(partnerFirst, promoPartnerFrom(undefined)), { rule: "first_touch", partner: "joe" });
check("utm_source=Maya matches promo partner maya", resolveAttribution({ first: {}, last: { utm_source: "Maya", utm_medium: "partner" } }).partner, promoPartnerFrom({ partner: "maya" }));
check("no partner touch and no code", resolveAttribution({ first: { utm_source: "tiktok", utm_medium: "social" }, last: {} }), { rule: "none" });

// --- First/last touch storage ---
const store: Record<string, string> = {};
const globals = globalThis as Record<string, unknown>;
globals.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; } };
function visit(url: string, referrer = "") {
  globals.window = { location: new URL(url) };
  globals.document = { referrer };
  captureAttribution();
}
visit("https://unifiedreading.com/", "https://checkout.stripe.com/c/pay/cs_x");
visit("https://unifiedreading.com/", "https://preview-abc.vercel.app/");
visit("https://unifiedreading.com/", "https://www.unifiedreading.com/pricing");
check("internal referrers are ignored", storedAttribution(), { first: {}, last: {} });
visit("https://unifiedreading.com/", "https://www.reddit.com/r/x/?share=1");
check("referrer-only first touch drops the query", storedAttribution().first, { referrer: "https://www.reddit.com/r/x/", landing_path: "/" });
visit("https://unifiedreading.com/?utm_source=maya&utm_medium=partner&utm_campaign=oct-sprint");
check("UTM visit replaces referrer-only first touch", storedAttribution().first, { utm_source: "maya", utm_medium: "partner", utm_campaign: "oct-sprint", landing_path: "/" });
visit("https://unifiedreading.com/?utm_source=tiktok&utm_medium=social&utm_term=astro");
check("later UTM visit keeps first touch", storedAttribution().first.utm_source, "maya");
check("later UTM visit updates last touch", storedAttribution().last, { utm_source: "tiktok", utm_medium: "social", utm_term: "astro", landing_path: "/" });
visit("https://unifiedreading.com/", "https://news.ycombinator.com/");
check("referrer-only later visit changes nothing", storedAttribution().last.utm_source, "tiktok");
const roundTrip = attributionFromMetadata(flattenAttribution(storedAttribution()));
check("touches survive Stripe metadata round trip", roundTrip, { first: storedAttribution().first, last: { utm_source: "tiktok", utm_medium: "social", utm_term: "astro", landing_path: "/" } });

async function verifySharing() {
  // --- Share links ---
  const ref = "0123456789ab";
  check("share link format", shareUrl("copy"), "https://unifiedreading.com/?utm_source=share&utm_medium=referral&utm_campaign=reading-share&utm_content=copy");
  check("share link carries the sharer ref", shareUrl("copy", { ref }), "https://unifiedreading.com/?utm_source=share&utm_medium=referral&utm_campaign=reading-share&utm_content=copy&ref=0123456789ab");
  check("share link keeps a path", shareUrl("native", { path: "/sample" }), "https://unifiedreading.com/sample?utm_source=share&utm_medium=referral&utm_campaign=reading-share&utm_content=native");
  check("sharer ref is the first 12 hex of SHA-256(distinct_id)", await shareRefFor("0192f0e4-7c1a-7d3e-9b2f-5a6c7d8e9f01"), createHash("sha256").update("0192f0e4-7c1a-7d3e-9b2f-5a6c7d8e9f01").digest("hex").slice(0, 12));

  const shareTouch = { utm_source: "share", utm_medium: "referral", utm_campaign: "reading-share", utm_content: "native", landing_path: "/" };
  visit(shareUrl("native", { ref }));
  check("share landing stores the incoming ref", storedAttribution().shareRef, ref);
  check("share landing keeps an earlier first touch", storedAttribution().first.utm_source, "maya");
  check("share landing becomes last touch, without the ref", storedAttribution().last, shareTouch);
  check("share ref does not override partner first touch", resolveAttribution(storedAttribution()), { rule: "first_touch", partner: "maya" });
  check("share landing is not a partner", resolveAttribution({ first: {}, last: shareTouch }), { rule: "none" });
  visit("https://unifiedreading.com/?ref=ba9876543210");
  check("ref-only landing updates the ref", storedAttribution().shareRef, "ba9876543210");
  check("ref-only landing leaves touches alone", [storedAttribution().first.utm_source, storedAttribution().last.utm_content], ["maya", "native"]);
  visit("https://unifiedreading.com/?ref=%3Cscript%3E");
  visit("https://unifiedreading.com/?ref=ABCDEF012345");
  check("malformed refs are ignored", storedAttribution().shareRef, "ba9876543210");
  check("untrusted shareRef is dropped by sanitizeAttribution", sanitizeAttribution({ first: {}, last: {}, shareRef: "x".repeat(12) }), { first: {}, last: {} });

  // The checkout route sends flattenAttribution(sanitizeAttribution(body.analytics)) to createCheckoutSession.
  const checkoutBody = JSON.parse(JSON.stringify({ distinctId: "id", ...storedAttribution() }));
  let checkoutForm = new URLSearchParams();
  globals.fetch = async (_url: string, init: { body: URLSearchParams }) => {
    checkoutForm = init.body;
    return { ok: true, json: async () => ({ id: "cs_test_1", url: "https://checkout.stripe.com/c/pay/cs_test_1", amount_total: 499, currency: "usd" }) };
  };
  await createCheckoutSession("hash", "https://unifiedreading.com", "en", flattenAttribution(sanitizeAttribution(checkoutBody)));
  check("share ref reaches Checkout Session metadata", checkoutForm.get("metadata[share_ref]"), "ba9876543210");
  check("share ref reaches PaymentIntent metadata", checkoutForm.get("payment_intent_data[metadata][share_ref]"), "ba9876543210");
  check("partner first touch still reaches checkout", checkoutForm.get("metadata[first_touch_utm_source]"), "maya");
  check("share ref survives the webhook metadata round trip", attributionFromMetadata({ share_ref: "ba9876543210" }).shareRef, "ba9876543210");

  for (const key of Object.keys(store)) delete store[key];
  visit(shareUrl("copy"));
  check("share landing is a first touch for a new visitor", storedAttribution().first.utm_content, "copy");
  check("share landing without a ref stores none", storedAttribution().shareRef, undefined);

  // --- Library landings ---
  for (const key of Object.keys(store)) delete store[key];
  visit("https://unifiedreading.com/?utm_source=maya&utm_medium=partner");
  visit(shareUrl("copy", { path: "/life-path/1-vs-9", campaign: "library-share" }));
  check("compare link keeps t and v and adds the compare-friend tags", shareUrl("native", { ref: "0123456789ab", path: "/compare?t=lp&v=7", campaign: "compare-friend" }), "https://unifiedreading.com/compare?t=lp&v=7&utm_source=share&utm_medium=referral&utm_campaign=compare-friend&utm_content=native&ref=0123456789ab");
  check("library share link format", shareUrl("copy", { path: "/life-path/1-vs-9", campaign: "library-share" }), "https://unifiedreading.com/life-path/1-vs-9?utm_source=share&utm_medium=referral&utm_campaign=library-share&utm_content=copy");
  check("library landing records its path on the last touch", storedAttribution().last.landing_path, "/life-path/1-vs-9");
  check("library landing keeps the partner first touch", [storedAttribution().first.utm_source, storedAttribution().first.landing_path], ["maya", "/"]);
  check("library landing does not override partner credit", resolveAttribution(storedAttribution()), { rule: "first_touch", partner: "maya" });
  check("landing path reaches Checkout metadata", flattenAttribution(storedAttribution()).last_touch_landing_path, "/life-path/1-vs-9");
  visit("https://unifiedreading.com/zodiac");
  check("internal navigation without a touch leaves the landing path alone", storedAttribution().last.landing_path, "/life-path/1-vs-9");
  for (const key of Object.keys(store)) delete store[key];
  visit("https://unifiedreading.com/life-path/1-vs-9?utm_source=instagram&utm_medium=social&utm_content=reel-123");
  const reelTouch = { utm_source: "instagram", utm_medium: "social", utm_content: "reel-123", landing_path: "/life-path/1-vs-9" };
  check("reel link to a pair page is the first touch", storedAttribution().first, reelTouch);
  check("reel link to a pair page is the last touch", storedAttribution().last, reelTouch);
  visit("https://unifiedreading.com/");
  check("moving from the pair page to the wizard keeps the reel touch", storedAttribution().first.utm_content, "reel-123");
  check("reel touch reaches Checkout metadata", [flattenAttribution(storedAttribution()).first_touch_utm_source, flattenAttribution(storedAttribution()).first_touch_utm_content, flattenAttribution(storedAttribution()).first_touch_landing_path], ["instagram", "reel-123", "/life-path/1-vs-9"]);
  check("a reel is not a partner", resolveAttribution(storedAttribution()), { rule: "none" });

  for (const key of Object.keys(store)) delete store[key];
  visit("https://unifiedreading.com/compatibility/aries-and-leo", "https://www.google.com/");
  check("organic library landing is a first touch with its path", storedAttribution().first, { referrer: "https://www.google.com", landing_path: "/compatibility/aries-and-leo" });

}

async function verifyPaidSession() {
  const originalFetch = globalThis.fetch;
  const originalPrice = process.env.STRIPE_PRICE_ID;
  const originalKey = process.env.STRIPE_SECRET_KEY;
  const now = Math.floor(Date.now() / 1000);
  process.env.STRIPE_PRICE_ID = "price_reading";
  process.env.STRIPE_SECRET_KEY = "sk_test_verification_only";
  let response = {
    payment_status: "paid",
    metadata: { readingHash: "reading-hash" },
    created: now,
    line_items: { data: [{ price: { id: "price_reading" } }] },
  };
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return new Response(JSON.stringify(response), { status: 200 });
  }) as typeof fetch;
  try {
    check("paid reading session is accepted", await isPaidSession("cs_test_reading", "reading-hash"), true);
    check("wrong reading hash is rejected", await isPaidSession("cs_test_reading", "other-hash"), false);
    response = { ...response, payment_status: "unpaid" };
    check("unpaid session is rejected", await isPaidSession("cs_test_reading", "reading-hash"), false);
    response = { ...response, payment_status: "paid", line_items: { data: [{ price: { id: "price_other_product" } }] } };
    check("paid session for another product is rejected", await isPaidSession("cs_test_reading", "reading-hash"), false);
    response = { ...response, line_items: { data: [] } };
    check("paid session without line items is rejected", await isPaidSession("cs_test_reading", "reading-hash"), false);
    const before = calls;
    check("invalid session ID is rejected", await isPaidSession("invalid", "reading-hash"), false);
    check("invalid session ID avoids Stripe lookup", calls, before);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalPrice === undefined) delete process.env.STRIPE_PRICE_ID;
    else process.env.STRIPE_PRICE_ID = originalPrice;
    if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalKey;
  }
}

verifyPaidSession().then(verifySharing).then(() => {
  console.log(`\n${passes} attribution and payment checks passed, ${failures} failed`);
  if (failures > 0) process.exitCode = 1;
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
