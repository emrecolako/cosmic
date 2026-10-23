import Link from "next/link";
import { HOME_LIBRARY_LINKS } from "@/lib/library/registry";

/** Server-rendered entry points into the library for the homepage. */
export default function LibraryLinks() {
  return <section className="atlas-shell library-home-links" aria-labelledby="library-home-links" lang="en">
    <h2 id="library-home-links" className="eyebrow">From the library</h2>
    <ul>{HOME_LIBRARY_LINKS.map((entry) => <li key={entry.path}><Link href={entry.path}>{entry.label}</Link></li>)}</ul>
  </section>;
}
