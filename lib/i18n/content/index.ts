import type { Locale } from "@/lib/i18n/locales";
import type { LocaleContent } from "./types";

export async function loadContent(locale: Locale): Promise<LocaleContent> {
  switch (locale) {
    case "tr": return (await import("./tr")).content;
    case "es": return (await import("./es")).content;
    case "fr": return (await import("./fr")).content;
    case "de": return (await import("./de")).content;
    case "pt": return (await import("./pt")).content;
    case "it": return (await import("./it")).content;
    case "en":
    default: return (await import("./en")).content;
  }
}

export type { LocaleContent } from "./types";
