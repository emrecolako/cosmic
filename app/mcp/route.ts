import { NextResponse, type NextRequest } from "next/server";
import { handleMcp } from "@/lib/mcp";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
  "Cache-Control": "no-store",
};

/** Stateless Streamable HTTP endpoint: JSON responses, no sessions, no SSE stream. */
export async function POST(request: NextRequest) {
  if (isRateLimited(clientIp(request), "mcp")) {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32000, message: "Rate limited; retry in a minute." } }, { status: 429, headers: CORS });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400, headers: CORS });
  }
  const response = handleMcp(body);
  if (response === null) return new Response(null, { status: 202, headers: CORS });
  return NextResponse.json(response, { headers: CORS });
}

// No server-initiated stream; the spec allows 405 here.
export function GET() {
  return new Response("This MCP server is stateless. POST JSON-RPC messages to /mcp.\n", { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
