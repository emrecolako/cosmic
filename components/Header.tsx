"use client";

import AtlasSeal from "./AtlasSeal";
import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/LocaleProvider";
import { useToast } from "@/components/ui/Toast";

export default function Header({ initialTheme }: { initialTheme: "dark" | "light" }) {
  const { t } = useI18n();
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
    <header className="atlas-header">
      <div className="atlas-shell">
        <div className="atlas-header-inner">
          <Link
            href="/"
            className="atlas-brand"
          >
            <AtlasSeal /> UNIFIED READING
          </Link>
          <div className="header-actions">
            <button
              onClick={toggleTheme}
              className="hover:opacity-70 transition-opacity tracking-wider uppercase text-ink-secondary"
            >
              {isDark ? t.header.themeLight : t.header.themeDark}
            </button>
            <button
              onClick={handleShare}
              className="header-share hover:opacity-70 transition-opacity"
            >
              {t.header.share}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
