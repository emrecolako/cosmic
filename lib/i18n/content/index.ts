import type { Locale } from "@/lib/i18n/locales";
import { content as enContent } from "./en";
import type { LocaleContent } from "./types";

export async function loadContent(locale: Locale): Promise<LocaleContent> {
  try {
    switch (locale) {
      case "tr":
        return (await import("./tr")).content;
      case "es":
        return (await import("./es")).content;
      case "fr":
        return (await import("./fr")).content;
      case "de":
        return (await import("./de")).content;
      case "pt":
        return (await import("./pt")).content;
      case "it":
        return (await import("./it")).content;
      case "en":
      default:
        return enContent;
    }
  } catch (error) {
    console.error(`Failed to load ${locale} content pack; using English.`, error);
    return enContent;
  }
}

export { enContent };
export type * from "./types";
