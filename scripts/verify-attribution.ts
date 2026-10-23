/**
 * Regression tests for order attribution and the Stripe webhook filters.
 * Run with: npm run verify:attribution
 */

import {
  attributionFromMetadata,
  captureAttribution,
  flattenAttribution,
  resolveAttribution,
  storedAttribution,
} from "../lib/attribution";
import { isPaidSession, isReadingOrder, promoPartnerFrom, readingCheckoutSessionId } from "../lib/stripe";

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
check("referrer-only first touch drops the query", storedAttribution().first, { referrer: "https://www.reddit.com/r/x/" });
visit("https://unifiedreading.com/?utm_source=maya&utm_medium=partner&utm_campaign=oct-sprint");
check("UTM visit replaces referrer-only first touch", storedAttribution().first, { utm_source: "maya", utm_medium: "partner", utm_campaign: "oct-sprint" });
visit("https://unifiedreading.com/?utm_source=tiktok&utm_medium=social&utm_term=astro");
check("later UTM visit keeps first touch", storedAttribution().first.utm_source, "maya");
check("later UTM visit updates last touch", storedAttribution().last, { utm_source: "tiktok", utm_medium: "social", utm_term: "astro" });
visit("https://unifiedreading.com/", "https://news.ycombinator.com/");
check("referrer-only later visit changes nothing", storedAttribution().last.utm_source, "tiktok");
const roundTrip = attributionFromMetadata(flattenAttribution(storedAttribution()));
check("touches survive Stripe metadata round trip", roundTrip, { first: storedAttribution().first, last: { utm_source: "tiktok", utm_medium: "social", utm_term: "astro" } });

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

verifyPaidSession().then(() => {
  console.log(`\n${passes} attribution and payment checks passed, ${failures} failed`);
  if (failures > 0) process.exitCode = 1;
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
