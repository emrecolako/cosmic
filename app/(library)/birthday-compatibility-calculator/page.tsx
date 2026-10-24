import LibraryPage from "@/components/library/LibraryPage";
import { libraryMetadata } from "@/lib/library/metadata";
import { calculatorEntry } from "@/lib/library/registry";

export const dynamic = "force-static";

const entry = calculatorEntry("birthday-compatibility-calculator");
export const metadata = libraryMetadata(entry);

export default function Page() {
  return <LibraryPage entry={entry} />;
}
