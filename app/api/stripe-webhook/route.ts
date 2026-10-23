import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ATTRIBUTION_KEYS, sanitizeAttribution, sanitizeDistinctId } from "@/lib/attribution";
import { captureServerEvent, posthogServerConfigured, stableUuid } from "@/lib/posthog-server";
import { fetchOrder, verifyWebhookSignature } from "@/lib/stripe";

const PAID_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);
const ZERO_DECIMAL = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);

interface StripeEvent {
  id: string;
  type: string;
  created: number;
  livemode: boolean;
  data: { object: { id?: string; object?: string } };
}

function major(amount: number | null, currency: string | null): number | null {
  if (amount === null) return null;
  return currency && ZERO_DECIMAL.has(currency) ? amount : amount / 100;
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const payload = await request.text();
  if (!verifyWebhookSignature(payload, request.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const sessionId = event.data?.object?.id;
  if (!PAID_EVENTS.has(event.type) || event.data.object.object !== "checkout.session" || !sessionId) {
    return NextResponse.json({ received: true });
  }

  if (!posthogServerConfigured()) {
    // Fail so Stripe keeps retrying (up to 3 days) until the env vars are fixed.
    console.error("order_paid not sent: PostHog is not configured on the server");
    return NextResponse.json({ error: "Analytics not configured." }, { status: 503 });
  }

  try {
    const order = await fetchOrder(sessionId);
    if (!order.paid) return NextResponse.json({ received: true });

    const attribution = sanitizeAttribution(order.metadata);
    const distinctId =
      sanitizeDistinctId(order.metadata.posthog_distinct_id) ??
      `order_${createHash("sha256").update(sessionId).digest("hex").slice(0, 24)}`;
    const firstTouch = Object.fromEntries(
      ATTRIBUTION_KEYS.filter((key) => attribution[key]).map((key) => [`first_touch_${key}`, attribution[key]])
    );

    await captureServerEvent({
      event: "order_paid",
      distinctId,
      uuid: stableUuid(`order_paid:${sessionId}`),
      timestamp: new Date(event.created * 1000),
      properties: {
        amount: major(order.amountTotal, order.currency),
        amount_subtotal: major(order.amountSubtotal, order.currency),
        amount_discount: major(order.amountDiscount, order.currency),
        currency: order.currency?.toUpperCase() ?? null,
        promo_code: order.promoCode ?? null,
        promotion_code_id: order.promotionCodeId ?? null,
        ...attribution,
        ...firstTouch,
        livemode: event.livemode,
        stripe_event_type: event.type,
        $process_person_profile: false,
      },
    });
  } catch (error) {
    // A non-2xx response makes Stripe retry; the event UUID keeps retries idempotent.
    console.error("order_paid capture failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not record order." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
