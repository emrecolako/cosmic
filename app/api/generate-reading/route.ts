import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calculateNumerologyProfile } from "@/lib/numerology";
import { getChineseZodiac } from "@/lib/chinese-zodiac";
import { calculateWesternProfile } from "@/lib/western-astrology";
import { classifyLifeStage, calculateAge, LifeStageOption } from "@/lib/life-stages";
import { buildAnalysisPrompt, SYSTEM_PROMPT, CosmicProfile } from "@/lib/analysis-prompt";

// Simple in-memory cache (will reset on deploy, which is fine)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(body: Record<string, unknown>): string {
  const key = JSON.stringify({
    name: body.fullName,
    dob: body.dateOfBirth,
    stage: body.lifeStage,
    time: body.birthTime,
    place: body.birthPlace,
  });
  // Simple hash
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(hash);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.fullName || !body.dateOfBirth || !body.lifeStage) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, dateOfBirth, lifeStage" },
        { status: 400 }
      );
    }

    const dateOfBirth = new Date(body.dateOfBirth);
    if (isNaN(dateOfBirth.getTime())) {
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(body);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Run all calculations
    const age = calculateAge(dateOfBirth);
    const numerology = calculateNumerologyProfile(body.fullName, dateOfBirth);
    const chineseZodiac = getChineseZodiac(dateOfBirth);
    const westernAstro = calculateWesternProfile(
      dateOfBirth,
      body.birthTime || undefined,
      body.latitude,
      body.longitude
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
        model: "claude-sonnet-4-5-20250929",
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
        try {
          const parsed = JSON.parse(textContent.text);
          responseData.combinedAnalysis = parsed.unifiedReading || null;
          responseData.cosmicSnapshot = parsed.cosmicSnapshot || null;
          responseData.currentSeason = parsed.currentSeason || null;
          responseData.cosmicToolkit = parsed.cosmicToolkit || null;
        } catch {
          // If JSON parsing fails, try to extract the JSON from the text
          const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              responseData.combinedAnalysis = parsed.unifiedReading || null;
              responseData.cosmicSnapshot = parsed.cosmicSnapshot || null;
              responseData.currentSeason = parsed.currentSeason || null;
              responseData.cosmicToolkit = parsed.cosmicToolkit || null;
            } catch {
              responseData.combinedAnalysis = textContent.text;
            }
          } else {
            responseData.combinedAnalysis = textContent.text;
          }
        }
      }
    } catch (apiError) {
      console.error("Claude API error:", apiError);
      // Still return calculated data — only combined analysis is missing
    }

    // Cache the response
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Generate reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate reading" },
      { status: 500 }
    );
  }
}
