import Link from "next/link";

export default function LibraryNotFound() {
  return <main id="main" lang="en" className="atlas-shell"><article className="unified-prose">
    <h1 className="wizard-title editorial">That page is not in the library.</h1>
    <p>Browse the <Link href="/library">library index</Link>, try the <Link href="/life-path-calculator">Life Path calculator</Link>, or start at the <Link href="/">homepage</Link>.</p>
  </article></main>;
}
