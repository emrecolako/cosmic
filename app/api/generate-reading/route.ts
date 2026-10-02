import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  buildAnalysisPrompt,
  SYSTEM_PROMPT,
  type CosmicProfile,
} from "@/lib/analysis-prompt";
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "@/lib/i18n/locales";
import { MODEL_CHAIN, OPENROUTER_URL } from "@/lib/openrouter";
import { mockReading } from "@/lib/mock-reading";

const cache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

// Keyed by a SHA-256 of the inputs so names and birth details are never
// held in server memory in readable form.
function getCacheKey(body: Record<string, unknown>): string {
  const material = JSON.stringify({
    name: body.fullName,
    dob: body.dateOfBirth,
    stage: body.lifeStage,
    time: body.birthTime,
    place: body.birthPlace,
    mind: body.whatsOnYourMind,
    gender: body.gender,
    locale: body.locale,
  });
  return createHash("sha256").update(material).digest("hex");
}

function setCache(key: string, data: string): void {
  const now = Date.now();
  for (const [existingKey, value] of cache) {
    if (now - value.timestamp >= CACHE_TTL) cache.delete(existingKey);
  }
  while (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  cache.set(key, { data, timestamp: now });
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateLimitHits.get(ip) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  if (rateLimitHits.size > 5000) rateLimitHits.clear();
  if (hits.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateLimitHits.set(ip, hits);
  return false;
}

function textStream(text: string): Response {
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function mockStream(text: string, cutOff: boolean): Response {
  const encoder = new TextEncoder();
  const chunkSize = Math.ceil(text.length / 40);
  const end = cutOff ? Math.floor(text.length / 2) : text.length;
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 0; i < end; i += chunkSize) {
        await new Promise((resolve) => setTimeout(resolve, 120));
        controller.enqueue(encoder.encode(text.slice(i, Math.min(i + chunkSize, end))));
      }
      if (cutOff) controller.error(new Error("Mock stream cut off"));
      else controller.close();
    },
  });
  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (!body.fullName || !body.dateOfBirth || !body.lifeStage) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, dateOfBirth, lifeStage" },
        { status: 400 }
      );
    }
    if (
      typeof body.fullName !== "string" ||
      body.fullName.length > 200 ||
      !/[a-zA-ZÀ-ɏ]/.test(body.fullName)
    ) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    if (
      typeof body.lifeStage !== "string" ||
      body.lifeStage.length > 500
    ) {
      return NextResponse.json(
        { error: "Invalid life stage." },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(String(body.dateOfBirth))) {
      return NextResponse.json(
        { error: "Invalid date of birth format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }
    if (
      body.birthTime &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(body.birthTime))
    ) {
      return NextResponse.json(
        { error: "Invalid birth time format. Expected HH:MM (24-hour)." },
        { status: 400 }
      );
    }

    if (body.locale !== undefined && !isLocale(body.locale)) {
      return NextResponse.json(
        { error: "Unsupported locale." },
        { status: 400 }
      );
    }
    const locale: Locale = isLocale(body.locale)
      ? body.locale
      : DEFAULT_LOCALE;
    body.locale = locale;

    if (
      typeof body.numerology !== "object" ||
      body.numerology === null ||
      typeof body.westernAstro !== "object" ||
      body.westernAstro === null ||
      typeof body.chineseZodiac !== "object" ||
      body.chineseZodiac === null ||
      typeof body.lifeStageContext !== "object" ||
      body.lifeStageContext === null ||
      typeof body.age !== "number" ||
      !Number.isFinite(body.age)
    ) {
      return NextResponse.json(
        { error: "Missing calculated profile data." },
        { status: 400 }
      );
    }

    if (typeof body.whatsOnYourMind === "string") {
      body.whatsOnYourMind =
        body.whatsOnYourMind.trim().slice(0, 200) || undefined;
    } else {
      body.whatsOnYourMind = undefined;
    }

    // Dev-only: stream a canned reading (`npm run dev:mock`) so the funnel can
    // be previewed without an OpenRouter key. "error" cuts it off halfway.
    const mockMode = process.env.COSMIC_MOCK_READING;
    if (mockMode && process.env.NODE_ENV !== "production") {
      return mockStream(mockReading(body), mockMode === "error");
    }

    const cacheKey = getCacheKey(body);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return textStream(cached.data);
    }

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

    const prompt = buildAnalysisPrompt(cosmicProfile);

    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cosmic-blueprint.vercel.app",
        "X-Title": "Cosmic Blueprint",
      },
      body: JSON.stringify({
        models: MODEL_CHAIN,
        max_tokens: 4096,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errorBody = await upstream.text().catch(() => "");
      console.error("OpenRouter error:", upstream.status, errorBody);
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
                  `OpenRouter mid-stream error: ${JSON.stringify(parsed.error)}`
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

          // Cache only complete readings, so a retry after a cut-off stream
          // doesn't get the same cut-off text back.
          if (full.includes("<<<READING>>>") && full.includes("<<<TOOLKIT>>>")) {
            setCache(cacheKey, full);
          }
          if (served) console.log("Reading served by model:", served);
          if (!clientDisconnected) controller.close();
        } catch (streamError) {
          console.error("OpenRouter stream error:", streamError);
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

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Generate reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate reading" },
      { status: 500 }
    );
  }
}
