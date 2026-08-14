import type { LocaleContent } from "./types";

const NUMBERS = [1,2,3,4,5,6,7,8,9,11,22,33] as const;
const CATEGORIES = ["lifePath","expression","soulUrge","personality","personalYear"] as const;

export interface LocalizedContentSeed {
  categoryNames: Record<string, string>;
  numberThemes: Record<number, string[]>;
  numberBrief: (category: string, number: number, themes: string[]) => string;
  signNames: Record<string, string>;
  signTraits: Record<string, string[]>;
  signDescription: (sign: string, traits: string[]) => string;
  elementNames: Record<string, string>;
  modalityNames: Record<string, string>;
  planetNames: Record<string, string>;
  animalNames: Record<string, string>;
  animalTraits: Record<string, string[]>;
  animalDescription: (animal: string, traits: string[]) => string;
  chineseElementNames: Record<string, string>;
  chineseElementDescriptions: Record<string, string>;
  yinYang: Record<string, string>;
}

export function buildLocalizedContent(seed: LocalizedContentSeed): LocaleContent {
  const numerology = Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      Object.fromEntries(NUMBERS.map((number) => {
        const themes = seed.numberThemes[number];
        return [number, {
          title: `${seed.categoryNames[category]} ${number}`,
          brief: seed.numberBrief(seed.categoryNames[category], number, themes),
          keywords: themes,
        }];
      })),
    ])
  );

  const zodiac = Object.fromEntries(
    Object.keys(seed.signNames).map((sign) => [sign, {
      description: seed.signDescription(seed.signNames[sign], seed.signTraits[sign]),
      traits: seed.signTraits[sign],
    }])
  );

  const chineseAnimals = Object.fromEntries(
    Object.keys(seed.animalNames).map((animal) => [
      animal,
      seed.animalDescription(seed.animalNames[animal], seed.animalTraits[animal]),
    ])
  );

  return {
    numerology,
    zodiac,
    chineseAnimals,
    chineseElements: seed.chineseElementDescriptions,
    signNames: seed.signNames,
    elementNames: seed.elementNames,
    modalityNames: seed.modalityNames,
    planetNames: seed.planetNames,
    animalNames: seed.animalNames,
    chineseElementNames: seed.chineseElementNames,
    yinYang: seed.yinYang,
  };
}
