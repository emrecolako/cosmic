import type { Metadata } from "next";
import { isIndexable, loadContent } from "./content";
import type { LibraryEntry } from "./registry";

export function libraryMetadata(entry: LibraryEntry): Metadata {
  const content = loadContent(entry);
  const title = `${entry.title} | Unified Reading`;
  return {
    title: { absolute: title },
    description: content.description,
    alternates: { canonical: entry.path, types: { "text/markdown": `${entry.path}.md` } },
    robots: isIndexable(content) ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description: content.description, url: entry.path, type: "article", siteName: "Unified Reading", modifiedTime: content.updatedAt },
    // No twitter.images: the file-based og:image URL carries a build hash, and X falls back to og:image.
    twitter: { card: "summary_large_image", title, description: content.description },
  };
}
