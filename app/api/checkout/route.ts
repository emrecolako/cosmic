import { NextRequest, NextResponse } from "next/server";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { validateReadingBody } from "@/lib/reading-request";
import { readingHash } from "@/lib/reading-hash";
import { createCheckoutSession, paymentsConfigured, paywallEnabled } from "@/lib/stripe";
import { sanitizeAttribution, sanitizeDistinctId } from "@/lib/attribution";

export async function POST(request: NextRequest) {
  if (!paywallEnabled()) {
    return NextResponse.json({ error: "Checkout is not configured on this deployment." }, { status: 404 });
  }
  if (!paymentsConfigured()) {
    return NextResponse.json({ error: "Payments are temporarily unavailable." }, { status: 503 });
  }
  if (isRateLimited(clientIp(request), "checkout")) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }
  try {
    const body = await request.json();
    const invalid = validateReadingBody(body);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const distinctId = sanitizeDistinctId(body.analytics?.distinctId);
    const tracking: Record<string, string> = {
      ...sanitizeAttribution(body.analytics),
      ...(distinctId ? { posthog_distinct_id: distinctId } : {}),
    };
    const url = await createCheckoutSession(readingHash(body), origin, String(body.locale), tracking);
    return NextResponse.json({ url });
  } catch {
    console.error("Checkout session creation failed");
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }
}
