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
  numerology: Record<string, Record<number, InterpretationCopy>>;
  zodiac: Record<string, ZodiacCopy>;
  chineseAnimals: Record<string, string>;
  chineseElements: Record<string, string>;
  signNames: Record<string, string>;
  elementNames: Record<string, string>;
  modalityNames: Record<string, string>;
  planetNames: Record<string, string>;
  animalNames: Record<string, string>;
  chineseElementNames: Record<string, string>;
  yinYang: Record<string, string>;
}
