import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  const agentMode = request.nextUrl.searchParams.get("mode") === "agent";
  const wantsMarkdown = request.headers.get("accept")?.includes("text/markdown") ?? false;
  if (!agentMode && !wantsMarkdown) return NextResponse.next();

  const destination = new URL(agentMode ? "/agent.md" : "/index.md", request.url);
  const response = NextResponse.rewrite(destination);
  response.headers.set("Content-Type", "text/markdown; charset=utf-8");
  response.headers.set("Vary", "Accept");
  return response;
}

export const config = { matcher: "/" };
