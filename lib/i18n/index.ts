import { en, type Messages } from "./en";
import { tr } from "./tr";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { pt } from "./pt";
import { it } from "./it";
import type { Locale } from "./locales";

const catalogs: Record<Locale, Messages> = { en, tr, es, fr, de, pt, it };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? en;
}

export { en, formatMessage } from "./en";
export * from "./locales";
export type { Messages } from "./en";
