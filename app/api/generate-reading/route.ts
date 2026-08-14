import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisPrompt, SYSTEM_PROMPT, CosmicProfile } from "@/lib/analysis-prompt";

/**
 * Analysis-only endpoint. All deterministic calculations happen client-side
 * (lib/profile.ts); this route receives the computed profile, builds the
 * prompt, and streams Claude's marker-delimited plain-text reading back so
 * the client can reveal it as it is written.
 */

// Simple in-memory cache (will reset on deploy, which is fine)
const cache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_MAX_ENTRIES = 500;

// The full JSON string is the key — no hashing, so distinct inputs can never
// collide and receive another person's cached reading.
function getCacheKey(body: Record<string, unknown>): string {
  return JSON.stringify({
    name: body.fullName,
    dob: body.dateOfBirth,
    stage: body.lifeStage,
    time: body.birthTime,
    place: body.birthPlace,
    mind: body.whatsOnYourMind,
    gender: body.gender,
  });
}

function setCache(key: string, data: string): void {
  const now = Date.now();
  for (const [k, v] of cache) {
    if (now - v.timestamp >= CACHE_TTL) cache.delete(k);
  }
  // Still over budget after sweeping: drop oldest entries (Map preserves
  // insertion order)
  while (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  cache.set(key, { data, timestamp: now });
}

// Per-IP sliding-window rate limit. In-memory, so it's per-instance — fine
// for this deployment scale; swap for a shared store if scaling out.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateLimitHits.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
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

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate required raw inputs
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
    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(String(body.dateOfBirth))) {
      return NextResponse.json(
        { error: "Invalid date of birth format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }
    if (body.birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(body.birthTime))) {
      return NextResponse.json(
        { error: "Invalid birth time format. Expected HH:MM (24-hour)." },
        { status: 400 }
      );
    }

    // Validate the client-computed profile payload
    if (
      typeof body.numerology !== "object" ||
      typeof body.westernAstro !== "object" ||
      typeof body.chineseZodiac !== "object" ||
      typeof body.lifeStageContext !== "object" ||
      typeof body.age !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing calculated profile data." },
        { status: 400 }
      );
    }

    // Normalize optional fields: enforce client-side limits server-side too
    if (typeof body.whatsOnYourMind === "string") {
      body.whatsOnYourMind = body.whatsOnYourMind.trim().slice(0, 200) || undefined;
    } else {
      body.whatsOnYourMind = undefined;
    }

    // Check cache
    const cacheKey = getCacheKey(body);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return textStream(cached.data);
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
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
    };

    const client = new Anthropic({ apiKey });
    const prompt = buildAnalysisPrompt(cosmicProfile);

    const stream = client.messages.stream({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
      system: SYSTEM_PROMPT,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let full = "";
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              full += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          // Cache only complete, well-formed responses — never failures,
          // otherwise a transient Claude error gets pinned for 24h.
          if (full.includes("<<<READING>>>")) {
            setCache(cacheKey, full);
          }
          controller.close();
        } catch (streamError) {
          console.error("Claude stream error:", streamError);
          controller.error(streamError);
        }
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
