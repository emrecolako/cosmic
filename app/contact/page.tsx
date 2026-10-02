import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Unified Reading",
  description: "How to send questions or feedback about Unified Reading.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <main id="main" lang="en" className="atlas-shell"><article className="unified-prose">
    <Link className="atlas-link" href="/">← Unified Reading</Link>
    <h1 className="wizard-title editorial">Contact the project</h1>
    <p>Unified Reading is developed in a <a href="https://github.com/emrecolako/cosmic">public GitHub repository</a>. For a feature request, bug report, or general question, <a href="https://github.com/emrecolako/cosmic/issues/new">open an issue</a>. GitHub issues are public, so do not include your birth details, reading, payment information, or other personal data.</p>
    <p>For questions about data handling, read the <Link href="/privacy">privacy explanation</Link> first. For payment or receipt questions, use the support route in your Stripe receipt so you can discuss the transaction privately.</p>
  </article></main>;
}
