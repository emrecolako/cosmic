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
  const key = process.env.STRIPE_SECRET_KEY;
  const environment = process.env.VERCEL_ENV;
  return Boolean(
    key &&
      process.env.STRIPE_PRICE_ID &&
      process.env.READING_HASH_SECRET &&
      (environment === "production"
        ? /^(sk|rk)_live_/.test(key)
        : environment === "preview"
          ? /^(sk|rk)_test_/.test(key)
          : true)
  );
}

/** Missing payment settings must never make a hosted reading free. */
export function paywallEnabled(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview" || paymentsConfigured();
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
  if (!response.ok) throw new StripeError(`Stripe ${path} failed: ${response.status}`, response.status);
  return response.json() as Promise<T>;
}

export class StripeError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** Network errors, Stripe 5xx and rate limits can succeed on retry; other 4xx can't. */
export function isRetryable(error: unknown): boolean {
  return !(error instanceof StripeError) || error.status >= 500 || error.status === 429;
}

const ZERO_DECIMAL = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);

/** Stripe minor units (cents) to a decimal amount, e.g. 499 → 4.99. */
export function majorUnits(amount: number | null | undefined, currency: string | null | undefined): number | null {
  if (amount === null || amount === undefined) return null;
  return currency && ZERO_DECIMAL.has(currency.toLowerCase()) ? amount : amount / 100;
}

interface CheckoutSession {
  id: string;
  url: string | null;
  created: number;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  metadata: Record<string, string> | null;
  amount_total: number | null;
  currency: string | null;
}

export interface CreatedCheckout { url: string; amount: number | null; currency: string | null }

/**
 * `tracking` holds the PostHog distinct ID, site host and attribution
 * touches. They go on both the session and its PaymentIntent so every
 * Stripe view of the order shows its source.
 */
export async function createCheckoutSession(
  readingHash: string,
  origin: string,
  locale: string,
  tracking: Record<string, string> = {}
): Promise<CreatedCheckout> {
  const fields = { ...tracking, readingHash };
  const metadata = Object.fromEntries(
    Object.entries(fields).flatMap(([key, value]) => [
      [`metadata[${key}]`, value],
      [`payment_intent_data[metadata][${key}]`, value],
    ])
  );
  const session = await stripe<CheckoutSession>("/checkout/sessions", {
    method: "POST",
    form: {
      mode: "payment",
      "line_items[0][price]": process.env.STRIPE_PRICE_ID!,
      "line_items[0][quantity]": "1",
      allow_promotion_codes: "true",
      ...metadata,
      success_url: `${origin}/results?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/results?checkout=canceled`,
      locale: locale === "en" ? "auto" : locale,
    },
  });
  if (!session.url) throw new Error("Stripe session has no URL");
  return {
    url: session.url,
    amount: majorUnits(session.amount_total, session.currency),
    currency: session.currency?.toUpperCase() ?? null,
  };
}

/** True when the session is paid, recent, and was bought for this exact reading. */
export async function isPaidSession(sessionId: string, readingHash: string): Promise<boolean> {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return false;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return false;
  try {
    const session = await stripe<OrderSession>(`/checkout/sessions/${sessionId}?expand[]=line_items`);
    return (
      session.payment_status === "paid" &&
      session.metadata?.readingHash === readingHash &&
      isReadingOrder({ priceIds: (session.line_items?.data ?? []).flatMap((item) => item.price?.id ? [item.price.id] : []) }, priceId) &&
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

type PromotionCodeRef = string | { id: string } | null | undefined;

interface OrderSession extends CheckoutSession {
  amount_subtotal: number | null;
  payment_intent: string | { id: string } | null;
  line_items?: { data?: { price?: { id?: string } | null }[] } | null;
  discounts?: { promotion_code?: PromotionCodeRef }[] | null;
  total_details?: {
    amount_discount?: number;
    breakdown?: { discounts?: { discount?: { promotion_code?: PromotionCodeRef } }[] };
  } | null;
}

export interface PaidOrder {
  sessionId: string;
  paymentIntentId?: string;
  paid: boolean;
  amountTotal: number | null;
  amountSubtotal: number | null;
  amountDiscount: number;
  currency: string | null;
  promotionCodeId?: string;
  promoCode?: string;
  /** `metadata.partner` on the promotion code, set in the Stripe dashboard. */
  promoPartner?: string;
  priceIds: string[];
  metadata: Record<string, string>;
}

/** Only promotion codes tagged with `metadata.partner` credit a partner; public codes don't. */
export function promoPartnerFrom(metadata: Record<string, string> | null | undefined): string | undefined {
  return metadata?.partner?.trim().toLowerCase() || undefined;
}

export interface WebhookEvent {
  type: string;
  data?: { object?: { id?: string; object?: string; metadata?: Record<string, string> | null } };
}

const PAID_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);

/**
 * The Stripe account is shared with other products. A paid reading session
 * always carries `metadata.readingHash`; checked before any Stripe API call.
 */
export function readingCheckoutSessionId(event: WebhookEvent): string | null {
  const object = event.data?.object;
  if (!PAID_EVENTS.has(event.type) || object?.object !== "checkout.session" || !object.id) return null;
  return object.metadata?.readingHash ? object.id : null;
}

/** Second check after re-reading the session: it must contain this site's Price. */
export function isReadingOrder(order: Pick<PaidOrder, "priceIds">, priceId: string | undefined): boolean {
  return Boolean(priceId) && order.priceIds.includes(priceId!);
}

/**
 * Re-reads the session from Stripe (the webhook body is only a hint) and
 * resolves the customer-facing promotion code, e.g. a partner's code.
 */
export async function fetchOrder(sessionId: string): Promise<PaidOrder> {
  const session = await stripe<OrderSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=total_details.breakdown&expand[]=line_items`
  );
  const promo =
    session.discounts?.find((d) => d.promotion_code)?.promotion_code ??
    session.total_details?.breakdown?.discounts?.find((d) => d.discount?.promotion_code)?.discount
      ?.promotion_code;
  const promotionCodeId = typeof promo === "string" ? promo : promo?.id;
  let promoCode: string | undefined;
  let promoPartner: string | undefined;
  if (promotionCodeId) {
    try {
      const code = await stripe<{ code: string; metadata?: Record<string, string> | null }>(
        `/promotion_codes/${encodeURIComponent(promotionCodeId)}`
      );
      promoCode = code.code;
      promoPartner = promoPartnerFrom(code.metadata);
    } catch (error) {
      // Retry transient failures so partner credit isn't lost; a permanent one
      // (e.g. a restricted key without Promotion Codes read) must not block the order.
      if (isRetryable(error)) throw error;
      console.error(`Promotion code ${promotionCodeId} lookup failed: ${(error as StripeError).status}`);
    }
  }
  const paymentIntent = session.payment_intent;
  return {
    sessionId: session.id,
    paymentIntentId: typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id,
    paid: session.payment_status === "paid",
    amountTotal: session.amount_total,
    amountSubtotal: session.amount_subtotal,
    amountDiscount: session.total_details?.amount_discount ?? 0,
    currency: session.currency,
    promotionCodeId,
    promoCode,
    promoPartner,
    priceIds: (session.line_items?.data ?? []).flatMap((item) => (item.price?.id ? [item.price.id] : [])),
    metadata: session.metadata ?? {},
  };
}

/**
 * Merges keys into the metadata of the Checkout Session and its PaymentIntent.
 * Each write is attempted even if the other fails; the first error is rethrown
 * afterwards, preferring one worth retrying.
 */
export async function updateOrderMetadata(order: PaidOrder, values: Record<string, string>): Promise<void> {
  const form = Object.fromEntries(Object.entries(values).map(([key, value]) => [`metadata[${key}]`, value]));
  if (Object.keys(form).length === 0) return;
  const targets = [`/checkout/sessions/${encodeURIComponent(order.sessionId)}`];
  if (order.paymentIntentId) targets.push(`/payment_intents/${encodeURIComponent(order.paymentIntentId)}`);
  const errors: unknown[] = [];
  for (const path of targets) {
    try {
      await stripe(path, { method: "POST", form });
    } catch (error) {
      console.error(`Stripe metadata write to ${path.split("/")[1]} failed:`, error instanceof Error ? error.message : error);
      errors.push(error);
    }
  }
  if (errors.length > 0) {
    throw errors.find(isRetryable) ?? errors[0];
  }
}
