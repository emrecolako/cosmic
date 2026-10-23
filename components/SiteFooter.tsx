import Link from 'next/link';
export default function SiteFooter() {
  return <footer className="site-footer" lang="en"><div className="atlas-shell site-footer-inner"><Link className="footer-brand" href="/">Unified Reading.</Link><p>A framework for reflection, not a prediction.</p><nav aria-label="Footer"><Link href="/about">Method</Link><Link href="/sample">Sample</Link><Link href="/pricing">Pricing</Link><Link href="/privacy">Privacy</Link><Link href="/contact">Contact</Link></nav></div></footer>;
}
