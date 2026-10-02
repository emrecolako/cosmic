import { notFound } from "next/navigation";

export function GET(request: Request) {
  if (request.headers.get("accept")?.includes("text/markdown")) {
    return new Response(
      "# Page not found\n\nThe requested Unified Reading page does not exist. Start at https://unifiedreading.com/ or read the public page index at https://unifiedreading.com/llms.txt.\n",
      { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "no-store" } },
    );
  }
  notFound();
}
