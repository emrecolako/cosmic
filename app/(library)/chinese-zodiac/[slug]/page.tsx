import { notFound } from "next/navigation";
import LibraryPage from "@/components/library/LibraryPage";
import { libraryMetadata } from "@/lib/library/metadata";
import { entriesOfType, entryFor, type PageType } from "@/lib/library/registry";

export const dynamic = "force-static";
export const dynamicParams = false;

const TYPES: PageType[] = ["chinese-zodiac", "chinese-zodiac-year", "chinese-zodiac-element"];
const resolve = (slug: string) => TYPES.map((type) => entryFor(type, slug)).find(Boolean);

export function generateStaticParams() {
  return TYPES.flatMap((type) => entriesOfType(type)).map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const entry = resolve((await params).slug);
  if (!entry) notFound();
  return libraryMetadata(entry);
}

export default async function Page({ params }: Props) {
  const entry = resolve((await params).slug);
  if (!entry) notFound();
  return <LibraryPage entry={entry} />;
}
