import { NextRequest, NextResponse } from "next/server";
import { buildAnalysisPrompt, SYSTEM_PROMPT, CosmicProfile } from "@/lib/analysis-prompt";
import { MODEL_CHAIN, OPENROUTER_URL } from "@/lib/openrouter";

/**
 * Analysis-only endpoint. All deterministic calculations happen client-side
 * (lib/profile.ts); this route receives the computed profile, builds the
 * prompt, and streams the model's marker-delimited plain-text reading back so
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
    };

    const prompt = buildAnalysisPrompt(cosmicProfile);

    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional OpenRouter attribution headers
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
            // SSE frames are newline-delimited; keep the trailing partial line
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
                if (!clientDisconnected) controller.enqueue(encoder.encode(text));
              }
            }
          }
          // Cache only complete, well-formed responses — never failures,
          // otherwise a transient model error gets pinned for 24h.
          if (full.includes("<<<READING>>>")) {
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
              // Client already gone; nothing left to notify.
            }
          }
        }
      },
      cancel() {
        // The client disconnected (navigation, tab close, retry). Stop
        // touching `controller` and let the upstream OpenRouter read wind
        // down naturally so we don't burn tokens or throw on a dead stream.
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
