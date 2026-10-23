import LibraryPage from "@/components/library/LibraryPage";
import { libraryMetadata } from "@/lib/library/metadata";
import { hubEntry } from "@/lib/library/registry";

export const dynamic = "force-static";

const entry = hubEntry("compatibility");
export const metadata = libraryMetadata(entry);

export default function Page() {
  return <LibraryPage entry={entry} />;
}
