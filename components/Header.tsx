"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from './LocaleProvider';
import { useToast } from './ui/Toast';

import { trackShare, useSharerRef } from "@/lib/analytics";
import { shareUrl } from "@/lib/share";

export default function Header({ initialTheme }: { initialTheme: 'dark' | 'light' }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const sharerRef = useSharerRef();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(initialTheme === 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  // Static pages can't read the theme cookie on the server; an inline script sets the class first.
  useEffect(() => setIsDark(document.documentElement.classList.contains('dark')), []);
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.cookie = `theme=${next ? 'dark' : 'light'};path=/;max-age=31536000;samesite=lax`;
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl("copy", { ref: sharerRef }));
      trackShare("header", "copy", sharerRef);
      toast(t.header.shareCopied, "success");
    } catch {
      toast(t.header.shareFailed, "error");
    }
  };
  const close = () => setMenuOpen(false);
  return <header lang="en" className={`atlas-header ${pathname === '/' ? 'home-header' : ''}`}>
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="atlas-shell atlas-header-inner">
      <Link href="/" className="atlas-brand" onClick={close}>Unified Reading.</Link>
      <nav className="desktop-navigation" aria-label="Main navigation"><Link href="/sample">The sample</Link><Link href="/about">The method</Link><Link href="/pricing">Pricing</Link><Link className="nav-preview" href="/#details">Start free ↗</Link></nav>
      <button className="menu-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="site-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? 'Close −' : 'Menu +'}</button>
    </div>
    {menuOpen && <nav id="site-menu" className="site-menu atlas-shell" aria-label="Expanded navigation"><Link href="/sample" onClick={close}>The sample</Link><Link href="/about" onClick={close}>The method</Link><Link href="/pricing" onClick={close}>Pricing</Link><Link href="/contact" onClick={close}>Contact</Link><Link href="/#details" onClick={close}>Start my free preview ↗</Link><div className="menu-tools"><button onClick={toggleTheme}>{isDark ? t.header.themeLight : t.header.themeDark}</button><button onClick={share}>{t.header.share}</button></div></nav>}
  </header>;
}
