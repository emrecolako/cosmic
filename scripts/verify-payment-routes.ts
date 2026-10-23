/** Isolated route checks: all Stripe and PostHog calls are intercepted in memory. */
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { POST as checkout } from "../app/api/checkout/route";
import { POST as webhook } from "../app/api/stripe-webhook/route";
import { POST as generateReading } from "../app/api/generate-reading/route";
import { SAMPLE_INPUT } from "../lib/sample";
import { computeProfile } from "../lib/profile";

let passes = 0;
function check(label: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
  passes++;
}

const keys = ["STRIPE_SECRET_KEY", "STRIPE_PRICE_ID", "READING_HASH_SECRET", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST", "NEXT_PUBLIC_SITE_URL", "OPENROUTER_API_KEY", "VERCEL_ENV"] as const;
const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
const originalFetch = globalThis.fetch;

async function main() {
  Object.assign(process.env, {
    STRIPE_SECRET_KEY: "sk_test_verification_only",
    STRIPE_PRICE_ID: "price_reading",
    READING_HASH_SECRET: "verification-only-hash-secret",
    STRIPE_WEBHOOK_SECRET: "whsec_verification_only",
    NEXT_PUBLIC_POSTHOG_KEY: "phc_verification_only",
    NEXT_PUBLIC_POSTHOG_HOST: "https://mock-posthog.test",
    NEXT_PUBLIC_SITE_URL: "https://preview.example.test",
    OPENROUTER_API_KEY: "sk-or-verification-only",
    VERCEL_ENV: "preview",
  });

  const profile = await computeProfile(SAMPLE_INPUT);
  if (!profile) throw new Error("Sample profile unavailable");
  const body = {
    ...SAMPLE_INPUT,
    lifeStage: "Building career, In a relationship",
    locale: "en",
    age: profile.age,
    numerology: profile.numerology,
    westernAstro: profile.westernAstro,
    chineseZodiac: profile.chineseZodiac,
    lifeStageContext: profile.lifeStageContext,
    analytics: { distinctId: "visitor-test", first: { utm_source: "Maya", utm_medium: "Partner" }, last: {} },
  };

  let postedCheckout: URLSearchParams | undefined;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url) !== "https://api.stripe.com/v1/checkout/sessions") throw new Error("Unexpected external call");
    postedCheckout = init?.body as URLSearchParams;
    return new Response(JSON.stringify({ url: "https://checkout.stripe.com/mock", amount_total: 499, currency: "usd" }), { status: 200 });
  }) as typeof fetch;
  const checkoutResponse = await checkout(new NextRequest("https://preview.example.test/api/checkout", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  }));
  const checkoutJson = await checkoutResponse.json();
  check("checkout returns mock session", checkoutResponse.status, 200);
  check("checkout uses reading Price", postedCheckout?.get("line_items[0][price]"), "price_reading");
  check("checkout uses preview return URL", postedCheckout?.get("success_url"), "https://preview.example.test/results?session_id={CHECKOUT_SESSION_ID}");
  check("checkout allows promo codes", postedCheckout?.get("allow_promotion_codes"), "true");
  check("checkout returns reading hash", typeof checkoutJson.readingHash, "string");
  check("checkout mirrors hash on PaymentIntent", postedCheckout?.get("payment_intent_data[metadata][readingHash]"), checkoutJson.readingHash);
  check("checkout mirrors first touch", postedCheckout?.get("payment_intent_data[metadata][first_touch_utm_source]"), "Maya");

  const event = (metadata: Record<string, string> | null) => ({
    id: "evt_test_reading", type: "checkout.session.completed", created: Math.floor(Date.now() / 1000), livemode: false,
    data: { object: { id: "cs_test_reading", object: "checkout.session", metadata } },
  });
  const signedRequest = (payload: object, valid = true) => {
    const raw = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = valid ? createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET!).update(`${timestamp}.${raw}`).digest("hex") : "0".repeat(64);
    return new NextRequest("https://preview.example.test/api/stripe-webhook", {
      method: "POST", headers: { "stripe-signature": `t=${timestamp},v1=${signature}` }, body: raw,
    });
  };
  let calls: string[] = [];
  globalThis.fetch = (async (url: string | URL | Request) => { calls.push(String(url)); throw new Error("No external call expected"); }) as typeof fetch;
  check("invalid signature rejected", (await webhook(signedRequest(event({ readingHash: checkoutJson.readingHash }), false))).status, 400);
  check("invalid signature makes no API call", calls.length, 0);
  check("other product webhook acknowledged", (await webhook(signedRequest(event({ product: "other" })))).status, 200);
  check("other product webhook makes no API call", calls.length, 0);

  const order = {
    id: "cs_test_reading", payment_status: "paid", metadata: { readingHash: checkoutJson.readingHash, site_host: "preview.example.test" },
    payment_intent: "pi_test_reading", amount_total: 499, amount_subtotal: 499, currency: "usd",
    total_details: { amount_discount: 0 }, line_items: { data: [{ price: { id: "price_other_product" } }] },
  };
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    if (!String(url).startsWith("https://api.stripe.com/v1/checkout/sessions/")) throw new Error("Unexpected external call");
    return new Response(JSON.stringify(order), { status: 200 });
  }) as typeof fetch;
  check("other Price webhook acknowledged", (await webhook(signedRequest(event({ readingHash: checkoutJson.readingHash })))).status, 200);
  check("other Price avoids metadata and analytics", calls.length, 1);

  order.line_items.data[0].price.id = "price_reading";
  calls = [];
  let paidEvent: Record<string, unknown> | undefined;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push(String(url));
    if (String(url).includes("/checkout/sessions/cs_test_reading?") && init?.method !== "POST") return new Response(JSON.stringify(order), { status: 200 });
    if (String(url).startsWith("https://api.stripe.com/v1/") && init?.method === "POST") return new Response("{}", { status: 200 });
    if (String(url) === "https://mock-posthog.test/i/v0/e/") {
      paidEvent = JSON.parse(String(init?.body));
      return new Response("{}", { status: 200 });
    }
    throw new Error("Unexpected external call");
  }) as typeof fetch;
  check("reading payment webhook acknowledged", (await webhook(signedRequest(event({ readingHash: checkoutJson.readingHash })))).status, 200);
  check("reading payment updates Session", calls.some((url) => url.endsWith("/checkout/sessions/cs_test_reading")), true);
  check("reading payment updates PaymentIntent", calls.some((url) => url.endsWith("/payment_intents/pi_test_reading")), true);
  check("reading payment records server event", paidEvent?.event, "order_paid");
  check("reading payment records preview environment", (paidEvent?.properties as Record<string, unknown>)?.vercel_env, "preview");

  const readingRequest = (mode: "teaser" | "full") => new NextRequest("https://preview.example.test/api/generate-reading", {
    method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.42" },
    body: JSON.stringify({ ...body, mode, checkoutSessionId: "cs_test_reading" }),
  });
  const aiResponse = (text: string) => new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`, {
    status: 200, headers: { "content-type": "text/event-stream" },
  });
  calls = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    if (String(url).includes("openrouter.ai/api/v1/chat/completions")) return aiResponse("<<<SNAPSHOT>>>A small preview.");
    throw new Error("Unexpected external call");
  }) as typeof fetch;
  const teaserResponse = await generateReading(readingRequest("teaser"));
  check("teaser generation succeeds with mocked model", teaserResponse.status, 200);
  check("teaser carries paywall header", teaserResponse.headers.get("x-paywall"), "1");
  check("configured teaser offers checkout", teaserResponse.headers.get("x-checkout-available"), "1");
  check("teaser carries readable snapshot", (await teaserResponse.text()).includes("A small preview."), true);
  check("teaser sends one mocked model request", calls.length, 1);

  order.line_items.data[0].price.id = "price_other_product";
  calls = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    if (String(url).startsWith("https://api.stripe.com/v1/checkout/sessions/")) return new Response(JSON.stringify(order), { status: 200 });
    throw new Error("Unexpected external call");
  }) as typeof fetch;
  check("other product cannot unlock generation", (await generateReading(readingRequest("full"))).status, 402);
  check("rejected unlock never reaches model", calls.length, 1);

  order.line_items.data[0].price.id = "price_reading";
  calls = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    if (String(url).startsWith("https://api.stripe.com/v1/checkout/sessions/")) return new Response(JSON.stringify({ ...order, created: Math.floor(Date.now() / 1000) }), { status: 200 });
    if (String(url).includes("openrouter.ai/api/v1/chat/completions")) return aiResponse("<<<SNAPSHOT>>>Snapshot.\n<<<READING>>>A complete reading.\n<<<TOOLKIT>>>- Try a question journal.");
    throw new Error("Unexpected external call");
  }) as typeof fetch;
  const fullResponse = await generateReading(readingRequest("full"));
  check("paid reading generation succeeds with mocks", fullResponse.status, 200);
  check("paid reading does not carry paywall header", fullResponse.headers.get("x-paywall"), null);
  check("paid reading carries full text", (await fullResponse.text()).includes("A complete reading."), true);
  check("paid generation verifies Stripe then calls model", calls.length, 2);

  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_PRICE_ID;
  delete process.env.READING_HASH_SECRET;
  calls = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    if (String(url).includes("openrouter.ai/api/v1/chat/completions")) return aiResponse("<<<SNAPSHOT>>>Only a preview.");
    throw new Error("Unexpected external call");
  }) as typeof fetch;
  const unconfiguredTeaser = await generateReading(readingRequest("teaser"));
  check("unconfigured hosted preview still uses paywall", unconfiguredTeaser.headers.get("x-paywall"), "1");
  check("unconfigured preview marks checkout unavailable", unconfiguredTeaser.headers.get("x-checkout-available"), "0");
  check("unconfigured preview serves only snapshot", (await unconfiguredTeaser.text()).includes("<<<READING>>>"), false);
  check("unconfigured preview rejects full request", (await generateReading(readingRequest("full"))).status, 503);
  check("unconfigured preview rejects checkout", (await checkout(new NextRequest("https://preview.example.test/api/checkout", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  }))).status, 503);
  check("unconfigured preview makes no Stripe request", calls.some((url) => url.includes("api.stripe.com")), false);

  process.env.STRIPE_SECRET_KEY = "sk_live_wrong_for_preview";
  process.env.STRIPE_PRICE_ID = "price_reading";
  process.env.READING_HASH_SECRET = "verification-only-hash-secret";
  calls = [];
  check("live key cannot enable preview checkout", (await checkout(new NextRequest("https://preview.example.test/api/checkout", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  }))).status, 503);
  check("live key cannot unlock preview generation", (await generateReading(readingRequest("full"))).status, 503);
  check("rejected live key makes no external request", calls.length, 0);
}

main().then(() => console.log(`${passes} isolated payment route checks passed`)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  globalThis.fetch = originalFetch;
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
});
