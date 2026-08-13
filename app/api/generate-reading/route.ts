import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calculateNumerologyProfile } from "@/lib/numerology";
import { getChineseZodiac } from "@/lib/chinese-zodiac";
import { calculateWesternProfile } from "@/lib/western-astrology";
import { classifyLifeStage, calculateAge, LifeStageOption } from "@/lib/life-stages";
import { buildAnalysisPrompt, SYSTEM_PROMPT, CosmicProfile } from "@/lib/analysis-prompt";
import { geocodePlace } from "@/lib/geocode";
import { getTimezoneOffsetHours } from "@/lib/timezone";

// Simple in-memory cache (will reset on deploy, which is fine)
const cache = new Map<string, { data: unknown; timestamp: number }>();
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
    locale: body.locale,
    mind: body.whatsOnYourMind,
    gender: body.gender,
  });
}

function setCache(key: string, data: unknown): void {
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

    // Validate required fields
    if (!body.fullName || !body.dateOfBirth || !body.lifeStage) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, dateOfBirth, lifeStage" },
        { status: 400 }
      );
    }

    // Normalize optional fields: enforce client-side limits server-side too
    body.locale = body.locale === "tr" ? "tr" : "en";
    if (typeof body.whatsOnYourMind === "string") {
      body.whatsOnYourMind = body.whatsOnYourMind.trim().slice(0, 200) || undefined;
    } else {
      body.whatsOnYourMind = undefined;
    }
    if (body.birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(body.birthTime))) {
      return NextResponse.json(
        { error: "Invalid birth time format. Expected HH:MM (24-hour)." },
        { status: 400 }
      );
    }

    // Parse date string explicitly to avoid timezone shifting
    // (new Date("YYYY-MM-DD") parses as UTC midnight, but local-time getters shift the day)
    const dateParts = String(body.dateOfBirth).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!dateParts) {
      return NextResponse.json(
        { error: "Invalid date of birth format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }
    const parsedYear = parseInt(dateParts[1], 10);
    const parsedMonth = parseInt(dateParts[2], 10);
    const parsedDay = parseInt(dateParts[3], 10);
    if (parsedMonth < 1 || parsedMonth > 12 || parsedDay < 1 || parsedDay > 31) {
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      );
    }
    const dateOfBirth = new Date(parsedYear, parsedMonth - 1, parsedDay);
    if (
      isNaN(dateOfBirth.getTime()) ||
      dateOfBirth.getFullYear() !== parsedYear ||
      dateOfBirth.getMonth() !== parsedMonth - 1 ||
      dateOfBirth.getDate() !== parsedDay
    ) {
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      );
    }
    if (parsedYear < 1900 || dateOfBirth.getTime() > Date.now()) {
      return NextResponse.json(
        { error: "Date of birth must be between 1900 and today." },
        { status: 400 }
      );
    }

    // Validate name contains at least one alphabetic character
    if (!/[a-zA-ZÀ-ɏ]/.test(body.fullName)) {
      return NextResponse.json(
        { error: "Name must contain at least one letter." },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(body);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Geocode birth place, then resolve the historically correct UTC offset
    // (incl. DST and past timezone changes) for the birth moment
    let latitude: number | undefined;
    let longitude: number | undefined;
    let timezoneOffsetHours: number | undefined;

    if (body.birthPlace) {
      const geo = await geocodePlace(body.birthPlace);
      if (geo) {
        latitude = geo.latitude;
        longitude = geo.longitude;
        let birthHours: number | undefined;
        let birthMinutes: number | undefined;
        if (body.birthTime) {
          const [h, m] = String(body.birthTime).split(":").map(Number);
          birthHours = h;
          birthMinutes = m;
        }
        timezoneOffsetHours =
          getTimezoneOffsetHours(
            geo.latitude,
            geo.longitude,
            parsedYear,
            parsedMonth,
            parsedDay,
            birthHours,
            birthMinutes
          ) ?? undefined;
      }
    }

    // Run all calculations
    const currentYear = new Date().getUTCFullYear();
    const age = calculateAge(dateOfBirth);
    const numerology = calculateNumerologyProfile(body.fullName, dateOfBirth, currentYear);
    const chineseZodiac = getChineseZodiac(dateOfBirth);
    const westernAstro = calculateWesternProfile(
      dateOfBirth,
      body.birthTime || undefined,
      latitude,
      longitude,
      timezoneOffsetHours
    );
    const lifeStageContext = classifyLifeStage(
      age,
      body.lifeStage as LifeStageOption
    );

    const cosmicProfile: CosmicProfile = {
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      birthTime: body.birthTime,
      birthPlace: body.birthPlace,
      lifeStage: body.lifeStage,
      whatsOnYourMind: body.whatsOnYourMind,
      gender: body.gender,
      age,
      locale: body.locale || "en",
      numerology,
      westernAstro,
      chineseZodiac,
      lifeStageContext,
    };

    // Base response with calculated data
    const responseData: Record<string, unknown> = {
      numerology,
      westernAstro,
      chineseZodiac,
      lifeStageContext,
      age,
      currentYear,
      combinedAnalysis: null,
      cosmicSnapshot: null,
      currentSeason: null,
      cosmicToolkit: null,
    };

    // Try Claude API for combined analysis
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === "your_key_here") {
        throw new Error("ANTHROPIC_API_KEY not configured");
      }

      const client = new Anthropic({ apiKey });
      const prompt = buildAnalysisPrompt(cosmicProfile);

      const message = await client.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system: SYSTEM_PROMPT,
      });

      const textContent = message.content.find((c) => c.type === "text");
      if (textContent && textContent.type === "text") {
        // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
        let rawText = textContent.text.trim();
        if (rawText.startsWith("```")) {
          rawText = rawText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "");
        }

        let parsed: Record<string, unknown> | null = null;

        // Try direct JSON parse
        try {
          parsed = JSON.parse(rawText);
        } catch {
          // Try extracting JSON object from the text
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
            } catch {
              // Final fallback
            }
          }
        }

        if (parsed) {
          responseData.combinedAnalysis = parsed.unifiedReading || null;
          responseData.cosmicSnapshot = parsed.cosmicSnapshot || null;
          responseData.currentSeason = parsed.currentSeason || null;
          responseData.cosmicToolkit = parsed.cosmicToolkit || null;
        } else {
          // Could not parse JSON at all — use raw text as combined analysis
          responseData.combinedAnalysis = rawText;
        }
      }
    } catch (apiError) {
      console.error("Claude API error:", apiError);
      // Still return calculated data — only combined analysis is missing
    }

    // Cache only successful responses — never cache failures, otherwise a
    // transient Claude error (rate limit, billing, network) gets pinned for 24h.
    if (responseData.combinedAnalysis !== null) {
      setCache(cacheKey, responseData);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Generate reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate reading" },
      { status: 500 }
    );
  }
}
