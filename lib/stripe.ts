/**
 * Minimal Stripe Checkout client over the REST API (no SDK dependency).
 * Stripe is the only record of payment: sessions carry a reading hash in
 * metadata and are verified on every paid request.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const STRIPE_API = "https://api.stripe.com/v1";
const PAID_SESSION_MAX_AGE_S = 24 * 60 * 60;
const WEBHOOK_TOLERANCE_S = 5 * 60;

export function paymentsConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_ID &&
      process.env.READING_HASH_SECRET &&
      (process.env.VERCEL_ENV !== "production" ||
        /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY))
  );
}

/** A missing or test key must never make a production reading free. */
export function paywallEnabled(): boolean {
  return process.env.VERCEL_ENV === "production" || paymentsConfigured();
}

export function priceLabel(): string {
  return process.env.READING_PRICE_LABEL || "$4.99";
}

async function stripe<T>(path: string, init?: { method?: string; form?: Record<string, string> }): Promise<T> {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(init?.form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: init?.form ? new URLSearchParams(init.form) : undefined,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Stripe ${path} failed: ${response.status}`);
  return response.json() as Promise<T>;
}

interface CheckoutSession {
  id: string;
  url: string | null;
  created: number;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  metadata: Record<string, string> | null;
}

/**
 * `tracking` holds the PostHog distinct ID and first-touch UTM values. They
 * are copied into metadata so the webhook can attribute the order.
 */
export async function createCheckoutSession(
  readingHash: string,
  origin: string,
  locale: string,
  tracking: Record<string, string> = {}
): Promise<string> {
  const metadata = Object.fromEntries(
    Object.entries(tracking).map(([key, value]) => [`metadata[${key}]`, value])
  );
  const session = await stripe<CheckoutSession>("/checkout/sessions", {
    method: "POST",
    form: {
      mode: "payment",
      "line_items[0][price]": process.env.STRIPE_PRICE_ID!,
      "line_items[0][quantity]": "1",
      allow_promotion_codes: "true",
      ...metadata,
      "metadata[readingHash]": readingHash,
      success_url: `${origin}/results?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/results?checkout=canceled`,
      locale: locale === "en" ? "auto" : locale,
    },
  });
  if (!session.url) throw new Error("Stripe session has no URL");
  return session.url;
}

/** True when the session is paid, recent, and was bought for this exact reading. */
export async function isPaidSession(sessionId: string, readingHash: string): Promise<boolean> {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return false;
  try {
    const session = await stripe<CheckoutSession>(`/checkout/sessions/${sessionId}`);
    return (
      session.payment_status === "paid" &&
      session.metadata?.readingHash === readingHash &&
      Date.now() / 1000 - session.created < PAID_SESSION_MAX_AGE_S
    );
  } catch {
    return false;
  }
}

/** Checks a `Stripe-Signature` header against the raw request body. */
export function verifyWebhookSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowS = Math.floor(Date.now() / 1000)
): boolean {
  if (!header) return false;
  const parts = header.split(",").map((part) => part.split("=", 2) as [string, string]);
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  if (!Number.isFinite(timestamp) || Math.abs(nowS - timestamp) > WEBHOOK_TOLERANCE_S) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest();
  return parts.some(([key, value]) => {
    if (key !== "v1" || !/^[0-9a-f]{64}$/.test(value ?? "")) return false;
    return timingSafeEqual(Buffer.from(value, "hex"), expected);
  });
}

type PromotionCodeRef = string | { id: string; code?: string } | null | undefined;

interface OrderSession extends CheckoutSession {
  amount_total: number | null;
  amount_subtotal: number | null;
  currency: string | null;
  discounts?: { promotion_code?: PromotionCodeRef }[] | null;
  total_details?: {
    amount_discount?: number;
    breakdown?: { discounts?: { discount?: { promotion_code?: PromotionCodeRef } }[] };
  } | null;
}

export interface PaidOrder {
  sessionId: string;
  paid: boolean;
  amountTotal: number | null;
  amountSubtotal: number | null;
  amountDiscount: number;
  currency: string | null;
  promotionCodeId?: string;
  promoCode?: string;
  metadata: Record<string, string>;
}

/**
 * Re-reads the session from Stripe (the webhook body is only a hint) and
 * resolves the customer-facing promotion code, e.g. a partner's code.
 */
export async function fetchOrder(sessionId: string): Promise<PaidOrder> {
  const session = await stripe<OrderSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=total_details.breakdown`
  );
  const promo =
    session.discounts?.find((d) => d.promotion_code)?.promotion_code ??
    session.total_details?.breakdown?.discounts?.find((d) => d.discount?.promotion_code)?.discount
      ?.promotion_code;
  const promotionCodeId = typeof promo === "string" ? promo : promo?.id;
  let promoCode = typeof promo === "object" && promo ? promo.code : undefined;
  if (promotionCodeId && !promoCode) {
    try {
      promoCode = (await stripe<{ code: string }>(`/promotion_codes/${encodeURIComponent(promotionCodeId)}`)).code;
    } catch {
      // The promotion code ID is still recorded.
    }
  }
  return {
    sessionId: session.id,
    paid: session.payment_status === "paid",
    amountTotal: session.amount_total,
    amountSubtotal: session.amount_subtotal,
    amountDiscount: session.total_details?.amount_discount ?? 0,
    currency: session.currency,
    promotionCodeId,
    promoCode,
    metadata: session.metadata ?? {},
  };
}
