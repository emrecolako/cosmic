import Link from "next/link";

export default function NotFoundPage() {
  return <main id="main" lang="en" className="atlas-shell"><article className="unified-prose">
    <h1 className="wizard-title editorial">That page is not here.</h1>
    <p>Try the <Link href="/">homepage</Link>, explore the <Link href="/sample">sample reading</Link>, or read <Link href="/about">about Cosmic Blueprint</Link>.</p>
  </article></main>;
}
