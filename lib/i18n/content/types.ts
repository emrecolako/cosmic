export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;
export type NumerologyCategory =
  | "lifePath"
  | "expression"
  | "soulUrge"
  | "personality"
  | "personalYear";

export type SignName =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type WesternElementName = "Fire" | "Water" | "Earth" | "Air";
export type ModalityName = "Cardinal" | "Fixed" | "Mutable";
export type PlanetName =
  | "Mars"
  | "Venus"
  | "Mercury"
  | "Moon"
  | "Sun"
  | "Pluto"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune";

export type AnimalName =
  | "Rat"
  | "Ox"
  | "Tiger"
  | "Rabbit"
  | "Dragon"
  | "Snake"
  | "Horse"
  | "Goat"
  | "Monkey"
  | "Rooster"
  | "Dog"
  | "Pig";

export type ChineseElementName = "Wood" | "Fire" | "Earth" | "Metal" | "Water";
export type YinYangName = "Yin" | "Yang";

export interface InterpretationCopy {
  title: string;
  brief: string;
  keywords: string[];
}

export interface ZodiacCopy {
  description: string;
  traits: string[];
}

export interface LocaleContent {
  numerology: Record<
    NumerologyCategory,
    Record<NumerologyNumber, InterpretationCopy>
  >;
  zodiac: Record<SignName, ZodiacCopy>;
  chineseAnimals: Record<AnimalName, string>;
  chineseElements: Record<ChineseElementName, string>;
  signNames: Record<SignName, string>;
  elementNames: Record<WesternElementName, string>;
  modalityNames: Record<ModalityName, string>;
  planetNames: Record<PlanetName, string>;
  animalNames: Record<AnimalName, string>;
  chineseElementNames: Record<ChineseElementName, string>;
  yinYang: Record<YinYangName, string>;
}
