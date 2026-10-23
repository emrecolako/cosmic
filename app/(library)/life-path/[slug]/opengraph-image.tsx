import { notFound } from "next/navigation";
import { libraryOgImage } from "@/lib/library/og";
import { entriesOfType, entryFor, type PageType } from "@/lib/library/registry";

export const dynamic = "force-static";
export const dynamicParams = false;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Unified Reading library";

const TYPES: PageType[] = ["life-path", "life-path-pair"];
const resolve = (slug: string) => TYPES.map((type) => entryFor(type, slug)).find(Boolean);

export function generateStaticParams() {
  return TYPES.flatMap((type) => entriesOfType(type)).map(({ slug }) => ({ slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = resolve((await params).slug);
  if (!entry) notFound();
  return libraryOgImage(entry);
}
