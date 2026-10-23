import { isResultCardNumber } from "@/lib/result-card-copy";
import { resultCardImage } from "@/lib/result-card";

/** GET /api/card?t=lp&v=7&s=story|square — the Life Path result card. Takes the number only. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const value = Number(params.get("v"));
  if (params.get("t") !== "lp" || !isResultCardNumber(value)) return new Response("Unknown card", { status: 404 });
  return resultCardImage(value, params.get("s") === "square" ? "square" : "story");
}
