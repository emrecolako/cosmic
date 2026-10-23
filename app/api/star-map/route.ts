import { NextRequest, NextResponse } from "next/server";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { validateReadingBody } from "@/lib/reading-request";
import { acceptedReadingHashes } from "@/lib/reading-hash";
import { isPaidSession, paymentsConfigured, paywallEnabled, priceLabel } from "@/lib/stripe";
import { starMapHousesEnabled } from "@/lib/chart/flags";
import { chartForReading, starMapView } from "@/lib/chart/star-map";

/**
 * Star Map houses for one reading. Without a verified paid session only the
 * free preview is computed into the response; locked text never leaves the server.
 */
export async function POST(request: NextRequest) {
  if (isRateLimited(clientIp(request), "star-map")) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 });
  }
  try {
    const body = await request.json();
    const invalid = validateReadingBody(body);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    if (!starMapHousesEnabled(String(body.locale))) {
      return NextResponse.json({ error: "Star Map houses are not available in this language yet." }, { status: 404 });
    }

    const paywall = paywallEnabled();
    let access: "preview" | "full" = paywall ? "preview" : "full";
    if (paywall && body.mode === "full") {
      if (!paymentsConfigured()) {
        return NextResponse.json({ error: "Payments are temporarily unavailable." }, { status: 503 });
      }
      const sessionId = typeof body.checkoutSessionId === "string" ? body.checkoutSessionId : "";
      if (!(await isPaidSession(sessionId, await acceptedReadingHashes(body)))) {
        return NextResponse.json({ error: "Payment required." }, { status: 402 });
      }
      access = "full";
    }

    const view = starMapView(await chartForReading(body), access);
    return NextResponse.json(view, {
      headers: {
        "Cache-Control": "no-store",
        ...(access === "preview" ? { "X-Paywall": "1", "X-Paywall-Price": priceLabel() } : {}),
      },
    });
  } catch {
    console.error("Star Map failed");
    return NextResponse.json({ error: "Could not calculate the Star Map." }, { status: 500 });
  }
}
