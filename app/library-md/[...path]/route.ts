import { libraryMarkdown, markdownHeaders } from "@/lib/library/markdown";
import { ALL_ENTRIES, entryByPath } from "@/lib/library/registry";

/** Served at {page}.md through the rewrites in next.config.ts. */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_ENTRIES.map((entry) => ({ path: entry.path.slice(1).split("/") }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const entry = entryByPath(`/${(await params).path.join("/")}`);
  if (!entry) return new Response("Not found\n", { status: 404 });
  return new Response(libraryMarkdown(entry), { headers: markdownHeaders(entry) });
}
