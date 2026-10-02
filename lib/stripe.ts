/**
 * Minimal Stripe Checkout client over the REST API (no SDK dependency).
 * Stripe is the only record of payment: sessions carry a reading hash in
 * metadata and are verified on every paid request.
 */

const STRIPE_API = "https://api.stripe.com/v1";
const PAID_SESSION_MAX_AGE_S = 24 * 60 * 60;

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

export async function createCheckoutSession(readingHash: string, origin: string, locale: string): Promise<string> {
  const session = await stripe<CheckoutSession>("/checkout/sessions", {
    method: "POST",
    form: {
      mode: "payment",
      "line_items[0][price]": process.env.STRIPE_PRICE_ID!,
      "line_items[0][quantity]": "1",
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
