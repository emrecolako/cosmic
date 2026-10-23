import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { attributionFromMetadata, flattenAttribution, resolveAttribution, sanitizeDistinctId } from "@/lib/attribution";
import { captureServerEvent, posthogServerConfigured, stableUuid } from "@/lib/posthog-server";
import { birthFlagsFromMetadata } from "@/lib/birth-flags";
import {
  fetchOrder,
  isReadingOrder,
  isRetryable,
  majorUnits,
  readingCheckoutSessionId,
  updateOrderMetadata,
  verifyWebhookSignature,
  type WebhookEvent,
} from "@/lib/stripe";

interface StripeEvent extends WebhookEvent {
  id: string;
  created: number;
  livemode: boolean;
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
  // Shared Stripe account: other products' events must not trigger API calls here.
  const sessionId = readingCheckoutSessionId(event);
  if (!sessionId) {
    console.debug(`[stripe-webhook] skipped ${event.type} ${event.id}: not a paid reading session`);
    return NextResponse.json({ received: true });
  }

  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      console.warn(`[stripe-webhook] skipped ${event.id}: STRIPE_PRICE_ID is not set`);
      return NextResponse.json({ received: true });
    }
    const order = await fetchOrder(sessionId);
    // A readingHash session without our Price is unexpected: misconfiguration or a changed Price.
    if (!isReadingOrder(order, priceId)) {
      console.warn(`[stripe-webhook] skipped ${event.id}: session has readingHash but no line item with STRIPE_PRICE_ID`);
      return NextResponse.json({ received: true });
    }
    if (!order.paid) return NextResponse.json({ received: true });

    const touches = attributionFromMetadata(order.metadata);
    const attribution = resolveAttribution(touches, order.promoPartner);

    try {
      await updateOrderMetadata(order, {
        attribution_rule: attribution.rule,
        ...(attribution.partner ? { attributed_partner: attribution.partner.slice(0, 200) } : {}),
        ...(order.promoCode ? { promo_code: order.promoCode } : {}),
        ...(order.promotionCodeId ? { promotion_code_id: order.promotionCodeId } : {}),
      });
    } catch (error) {
      if (isRetryable(error)) throw error;
      console.error("Stripe metadata write-back failed:", error instanceof Error ? error.message : error);
    }

    if (!posthogServerConfigured()) {
      console.warn("order_paid not sent: set NEXT_PUBLIC_POSTHOG_KEY and an absolute POSTHOG_HOST or NEXT_PUBLIC_POSTHOG_HOST");
      return NextResponse.json({ received: true });
    }

    const distinctId =
      sanitizeDistinctId(order.metadata.posthog_distinct_id) ??
      `order_${createHash("sha256").update(sessionId).digest("hex").slice(0, 24)}`;
    await captureServerEvent({
      event: "order_paid",
      distinctId,
      uuid: stableUuid(`order_paid:${sessionId}`),
      timestamp: new Date(event.created * 1000),
      properties: {
        amount: majorUnits(order.amountTotal, order.currency),
        amount_subtotal: majorUnits(order.amountSubtotal, order.currency),
        amount_discount: majorUnits(order.amountDiscount, order.currency),
        currency: order.currency?.toUpperCase() ?? null,
        promo_code: order.promoCode ?? null,
        promotion_code_id: order.promotionCodeId ?? null,
        attributed_partner: attribution.partner ?? null,
        attribution_rule: attribution.rule,
        ...flattenAttribution(touches),
        stripe_session_id: sessionId,
        readingHash: order.metadata.readingHash ?? null,
        ...birthFlagsFromMetadata(order.metadata),
        $host: order.metadata.site_host ?? null,
        vercel_env: process.env.VERCEL_ENV ?? "development",
        livemode: event.livemode,
        stripe_event_type: event.type,
        $process_person_profile: false,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isRetryable(error)) {
      console.error("order_paid skipped after a permanent Stripe error:", message);
      return NextResponse.json({ received: true });
    }
    // The event UUID keeps retries idempotent in PostHog; metadata writes are idempotent too.
    console.error("order_paid failed, Stripe will retry:", message);
    return NextResponse.json({ error: "Could not record order." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
