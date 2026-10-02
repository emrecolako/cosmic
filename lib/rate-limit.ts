import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitHits = new Map<string, number[]>();

export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Process-local sliding window; `scope` keeps routes from sharing a budget. */
export function isRateLimited(ip: string, scope = "reading"): boolean {
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const hits = (rateLimitHits.get(key) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  if (rateLimitHits.size > 5000) rateLimitHits.clear();
  if (hits.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitHits.set(key, hits);
    return true;
  }
  hits.push(now);
  rateLimitHits.set(key, hits);
  return false;
}
