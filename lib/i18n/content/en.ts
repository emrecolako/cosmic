import { INTERPRETATIONS } from "@/lib/numerology";
import { getSunSign } from "@/lib/western-astrology";
import { getChineseZodiac } from "@/lib/chinese-zodiac";
import type { LocaleContent } from "./types";

const signDates: Record<string, Date> = {
  Aries: new Date(2000, 3, 10), Taurus: new Date(2000, 4, 10), Gemini: new Date(2000, 5, 10),
  Cancer: new Date(2000, 6, 10), Leo: new Date(2000, 7, 10), Virgo: new Date(2000, 8, 10),
  Libra: new Date(2000, 9, 10), Scorpio: new Date(2000, 10, 10), Sagittarius: new Date(2000, 11, 10),
  Capricorn: new Date(2000, 0, 10), Aquarius: new Date(2000, 1, 10), Pisces: new Date(2000, 2, 10),
};

const zodiac = Object.fromEntries(
  Object.entries(signDates).map(([name, date]) => {
    const sign = getSunSign(date);
    return [name, { description: sign.description, traits: sign.traits }];
  })
);

const animals = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const chineseProfiles = Object.fromEntries(
  animals.map((animal, i) => [animal, getChineseZodiac(new Date(1996 + i, 6, 1))])
);

const identity = <T extends readonly string[]>(values: T) => Object.fromEntries(values.map((v) => [v, v]));
const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
const elements = ["Fire","Water","Earth","Air","Wood","Metal"] as const;
const modalities = ["Cardinal","Fixed","Mutable"] as const;
const planets = ["Mars","Venus","Mercury","Moon","Sun","Pluto","Jupiter","Saturn","Uranus","Neptune"] as const;
const chineseElements = ["Wood","Fire","Earth","Metal","Water"] as const;

export const content: LocaleContent = {
  numerology: INTERPRETATIONS,
  zodiac,
  chineseAnimals: Object.fromEntries(animals.map((a) => [a, chineseProfiles[a].description])),
  chineseElements: Object.fromEntries(chineseElements.map((e) => [e, animals.map((a) => chineseProfiles[a]).find((p) => p.element === e)?.elementDescription ?? e])),
  signNames: identity(signs),
  elementNames: identity(elements),
  modalityNames: identity(modalities),
  planetNames: identity(planets),
  animalNames: identity(animals),
  chineseElementNames: identity(chineseElements),
  yinYang: { Yin: "Yin", Yang: "Yang" },
};
