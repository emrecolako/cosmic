/**
 * Internationalization (i18n) system for Cosmic Blueprint
 *
 * Detects browser language and serves Turkish or English content accordingly.
 */

import { en } from "./en";
import { tr } from "./tr";

export type Locale = "en" | "tr";
export type Translations = typeof tr;

/**
 * Detect locale from browser language.
 * Returns "tr" for Turkish browsers, "en" for everything else.
 */
export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const lang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || "en";
  if (lang.startsWith("tr")) return "tr";
  return "en";
}

/**
 * Get translations for a given locale.
 */
export function getTranslations(locale: Locale): Translations {
  if (locale === "tr") return tr;
  // For English, return tr structure but with en values (falling back to tr keys structure)
  return en as unknown as Translations;
}

export { en, tr };
