"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/LocaleProvider";

/** Fired by the header's Share action; the results page shares the reading. */
export const SHARE_EVENT = "cosmic:share";

const actionStyles =
  "min-h-11 min-w-11 px-2 -mx-2 inline-flex items-center justify-center tracking-wider uppercase transition-opacity hover:opacity-70 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ink";

export default function Header({ initialTheme }: { initialTheme: "dark" | "light" }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(initialTheme === "dark");

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `theme=${next ? "dark" : "light"};path=/;max-age=31536000;samesite=lax`;
  };

  // On the landing page the only action should be starting the form, so
  // Share only appears on results, where there is something worth sharing.
  const showShare = pathname === "/results";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-base/90 backdrop-blur border-b border-line-muted pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="flex h-12 items-center justify-between font-mono text-xs">
          <Link
            href="/"
            className={`${actionStyles} text-ink-secondary`}
          >
            COSMIC-BLUEPRINT
          </Link>
          <div className="flex items-center gap-4 text-ink-muted">
            <button
              type="button"
              onClick={toggleTheme}
              className={actionStyles}
            >
              [{isDark ? t.header.themeLight : t.header.themeDark}]
            </button>
            {showShare && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(SHARE_EVENT))}
                className={`${actionStyles} text-ink-secondary`}
              >
                [{t.header.share}]
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
