import { NextRequest, NextResponse } from "next/server";
import {
  buildAnalysisPrompt,
  SYSTEM_PROMPT,
  type CosmicProfile,
} from "@/lib/analysis-prompt";
import type { Locale } from "@/lib/i18n/locales";
import { MODEL_CHAIN, OPENROUTER_URL } from "@/lib/openrouter";

import { readingCacheKey, cachedReading, cacheReading } from '@/lib/reading-cache';
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { validateReadingBody } from "@/lib/reading-request";
import { readingHash } from "@/lib/reading-hash";
import { isPaidSession, paymentsConfigured, paywallEnabled, priceLabel } from "@/lib/stripe";

type ReadingMode = "teaser" | "full";

function readingHeaders(paywall: boolean): HeadersInit {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    ...(paywall ? { "X-Paywall": "1", "X-Paywall-Price": priceLabel() } : {}),
  };
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(clientIp(request))) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const invalid = validateReadingBody(body);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    const locale = body.locale as Locale;

    // Local development can be free, but production always requires payment.
    const paywall = paywallEnabled();
    const mode: ReadingMode = !paywall || body.mode === "full" ? "full" : "teaser";
    if (paywall && mode === "full") {
      if (!paymentsConfigured()) {
        return NextResponse.json({ error: "Payments are temporarily unavailable." }, { status: 503 });
      }
      const sessionId = typeof body.checkoutSessionId === "string" ? body.checkoutSessionId : "";
      if (!(await isPaidSession(sessionId, readingHash(body)))) {
        return NextResponse.json({ error: "Payment required." }, { status: 402 });
      }
    }
    const headers = readingHeaders(paywall);

    const cacheKey = readingCacheKey({
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      birthTime: body.birthTime,
      birthPlace: body.birthPlace,
      lifeStage: body.lifeStage,
      whatsOnYourMind: body.whatsOnYourMind,
      gender: body.gender,
      locale,
      age: body.age,
      numerology: body.numerology,
      westernAstro: body.westernAstro,
      chineseZodiac: body.chineseZodiac,
      lifeStageContext: body.lifeStageContext,
      mode,
      currentYear: new Date().getUTCFullYear(),
    });
    const cached = cachedReading(cacheKey);
    if (cached) return new Response(cached, { headers });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return NextResponse.json(
        { error: "Analysis service not configured." },
        { status: 503 }
      );
    }

    const cosmicProfile: CosmicProfile = {
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      birthTime: body.birthTime,
      birthPlace: body.birthPlace,
      lifeStage: body.lifeStage,
      whatsOnYourMind: body.whatsOnYourMind,
      gender: body.gender,
      age: body.age,
      numerology: body.numerology,
      westernAstro: body.westernAstro,
      chineseZodiac: body.chineseZodiac,
      lifeStageContext: body.lifeStageContext,
      locale,
    };

    const prompt = buildAnalysisPrompt(cosmicProfile, { scope: mode === "full" ? "full" : "snapshot" });

    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://unifiedreading.com",
        "X-Title": "Unified Reading",
      },
      body: JSON.stringify({
        models: MODEL_CHAIN,
        max_tokens: mode === "full" ? 4096 : 400,
        reasoning: { effort: "low" },
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      console.error("OpenRouter request failed:", upstream.status);
      return NextResponse.json(
        { error: "Failed to generate reading" },
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = upstream.body.getReader();
    let clientDisconnected = false;

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let full = "";
        let buffer = "";
        let served: string | undefined;

        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              let parsed;
              try {
                parsed = JSON.parse(data);
              } catch {
                continue;
              }

              if (parsed.error) {
                throw new Error(
                  "OpenRouter mid-stream error"
                );
              }

              served = parsed.model ?? served;
              const text = parsed.choices?.[0]?.delta?.content;
              if (typeof text === "string" && text) {
                full += text;
                if (!clientDisconnected) {
                  controller.enqueue(encoder.encode(text));
                }
              }
            }
          }

          if (full.includes(mode === "full" ? "<<<READING>>>" : "<<<SNAPSHOT>>>")) {
            cacheReading(cacheKey, full);
          }
          if (served) console.log("Reading served by model:", served);
          if (!clientDisconnected) controller.close();
        } catch (streamError) {
          console.error("OpenRouter stream failed");
          if (!clientDisconnected) {
            try {
              controller.error(streamError);
            } catch {
              // The client has already disconnected.
            }
          }
        }
      },
      cancel() {
        clientDisconnected = true;
        reader.cancel().catch(() => {});
      },
    });

    return new Response(readable, { headers });
  } catch (error) {
    console.error("Generate reading failed");
    return NextResponse.json(
      { error: "Failed to generate reading" },
      { status: 500 }
    );
  }
}
