"use client";

import { useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { useToast } from "@/components/ui/Toast";

export default function Header({ initialTheme }: { initialTheme: "dark" | "light" }) {
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(initialTheme === "dark");

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `theme=${next ? "dark" : "light"};path=/;max-age=31536000;samesite=lax`;
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      toast(t.header.shareCopied, "success");
    } catch {
      toast(t.header.shareFailed, "error");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-base">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex h-10 items-center justify-between font-mono text-xs">
          <Link
            href="/"
            className="tracking-wider text-ink-secondary hover:opacity-70 transition-opacity"
          >
            COSMIC-BLUEPRINT
          </Link>
          <div className="flex items-center gap-6 text-ink-muted">
            <button
              onClick={toggleTheme}
              className="hover:opacity-70 transition-opacity tracking-wider uppercase text-ink-secondary"
            >
              [{isDark ? t.header.themeLight : t.header.themeDark}]
            </button>
            <button
              onClick={handleShare}
              className="hover:opacity-70 transition-opacity tracking-wider uppercase"
            >
              [{t.header.share}]
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
