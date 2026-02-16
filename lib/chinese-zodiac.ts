/**
 * Chinese Zodiac Calculation Engine
 *
 * Determines the Chinese zodiac animal, element, and yin/yang polarity
 * based on the date of birth, with proper Lunar New Year boundary handling.
 */

/**
 * Lunar New Year dates from 1924 to 2044.
 * Month is 1-indexed (1 = January, 2 = February).
 */
const LUNAR_NEW_YEAR_DATES: Record<number, { month: number; day: number }> = {
  1924: { month: 2, day: 5 },
  1925: { month: 1, day: 24 },
  1926: { month: 2, day: 13 },
  1927: { month: 2, day: 2 },
  1928: { month: 1, day: 23 },
  1929: { month: 2, day: 10 },
  1930: { month: 1, day: 30 },
  1931: { month: 2, day: 17 },
  1932: { month: 2, day: 6 },
  1933: { month: 1, day: 26 },
  1934: { month: 2, day: 14 },
  1935: { month: 2, day: 4 },
  1936: { month: 1, day: 24 },
  1937: { month: 2, day: 11 },
  1938: { month: 1, day: 31 },
  1939: { month: 2, day: 19 },
  1940: { month: 2, day: 8 },
  1941: { month: 1, day: 27 },
  1942: { month: 2, day: 15 },
  1943: { month: 2, day: 5 },
  1944: { month: 1, day: 25 },
  1945: { month: 2, day: 13 },
  1946: { month: 2, day: 2 },
  1947: { month: 1, day: 22 },
  1948: { month: 2, day: 10 },
  1949: { month: 1, day: 29 },
  1950: { month: 2, day: 17 },
  1951: { month: 2, day: 6 },
  1952: { month: 1, day: 27 },
  1953: { month: 2, day: 14 },
  1954: { month: 2, day: 3 },
  1955: { month: 1, day: 24 },
  1956: { month: 2, day: 12 },
  1957: { month: 1, day: 31 },
  1958: { month: 2, day: 18 },
  1959: { month: 2, day: 8 },
  1960: { month: 1, day: 28 },
  1961: { month: 2, day: 15 },
  1962: { month: 2, day: 5 },
  1963: { month: 1, day: 25 },
  1964: { month: 2, day: 13 },
  1965: { month: 2, day: 2 },
  1966: { month: 1, day: 21 },
  1967: { month: 2, day: 9 },
  1968: { month: 1, day: 30 },
  1969: { month: 2, day: 17 },
  1970: { month: 2, day: 6 },
  1971: { month: 1, day: 27 },
  1972: { month: 2, day: 15 },
  1973: { month: 2, day: 3 },
  1974: { month: 1, day: 23 },
  1975: { month: 2, day: 11 },
  1976: { month: 1, day: 31 },
  1977: { month: 2, day: 18 },
  1978: { month: 2, day: 7 },
  1979: { month: 1, day: 28 },
  1980: { month: 2, day: 16 },
  1981: { month: 2, day: 5 },
  1982: { month: 1, day: 25 },
  1983: { month: 2, day: 13 },
  1984: { month: 2, day: 2 },
  1985: { month: 2, day: 20 },
  1986: { month: 2, day: 9 },
  1987: { month: 1, day: 29 },
  1988: { month: 2, day: 17 },
  1989: { month: 2, day: 6 },
  1990: { month: 1, day: 27 },
  1991: { month: 2, day: 15 },
  1992: { month: 2, day: 4 },
  1993: { month: 1, day: 23 },
  1994: { month: 2, day: 10 },
  1995: { month: 1, day: 31 },
  1996: { month: 2, day: 19 },
  1997: { month: 2, day: 7 },
  1998: { month: 1, day: 28 },
  1999: { month: 2, day: 16 },
  2000: { month: 2, day: 5 },
  2001: { month: 1, day: 24 },
  2002: { month: 2, day: 12 },
  2003: { month: 2, day: 1 },
  2004: { month: 1, day: 22 },
  2005: { month: 2, day: 9 },
  2006: { month: 1, day: 29 },
  2007: { month: 2, day: 18 },
  2008: { month: 2, day: 7 },
  2009: { month: 1, day: 26 },
  2010: { month: 2, day: 14 },
  2011: { month: 2, day: 3 },
  2012: { month: 1, day: 23 },
  2013: { month: 2, day: 10 },
  2014: { month: 1, day: 31 },
  2015: { month: 2, day: 19 },
  2016: { month: 2, day: 8 },
  2017: { month: 1, day: 28 },
  2018: { month: 2, day: 16 },
  2019: { month: 2, day: 5 },
  2020: { month: 1, day: 25 },
  2021: { month: 2, day: 12 },
  2022: { month: 2, day: 1 },
  2023: { month: 1, day: 22 },
  2024: { month: 2, day: 10 },
  2025: { month: 1, day: 29 },
  2026: { month: 2, day: 17 },
  2027: { month: 2, day: 6 },
  2028: { month: 1, day: 26 },
  2029: { month: 2, day: 13 },
  2030: { month: 2, day: 3 },
  2031: { month: 1, day: 23 },
  2032: { month: 2, day: 11 },
  2033: { month: 1, day: 31 },
  2034: { month: 2, day: 19 },
  2035: { month: 2, day: 8 },
  2036: { month: 1, day: 28 },
  2037: { month: 2, day: 15 },
  2038: { month: 2, day: 4 },
  2039: { month: 1, day: 24 },
  2040: { month: 2, day: 12 },
  2041: { month: 2, day: 1 },
  2042: { month: 1, day: 22 },
  2043: { month: 2, day: 10 },
  2044: { month: 1, day: 30 },
};

const ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
] as const;

const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;

const ANIMAL_EMOJIS: Record<string, string> = {
  Rat: "🐀", Ox: "🐂", Tiger: "🐅", Rabbit: "🐇",
  Dragon: "🐉", Snake: "🐍", Horse: "🐎", Goat: "🐐",
  Monkey: "🐒", Rooster: "🐓", Dog: "🐕", Pig: "🐖",
};

const ANIMAL_DESCRIPTIONS: Record<string, string> = {
  Rat: "Quick-witted, resourceful, and versatile. The Rat is charming and clever, with a natural ability to adapt to any situation. You have a sharp eye for opportunity and an instinct for survival that serves you well in life.",
  Ox: "Diligent, dependable, and strong. The Ox embodies steady determination and honest effort. You have an incredible work ethic and a quiet confidence that earns deep respect from those around you.",
  Tiger: "Brave, competitive, and magnetic. The Tiger is a natural leader who faces life with courage and passion. Your charisma draws people to you, and your fierce independence keeps you on your own unique path.",
  Rabbit: "Gentle, elegant, and perceptive. The Rabbit moves through life with grace and diplomacy. You have refined taste, deep empathy, and an ability to create peace and beauty wherever you go.",
  Dragon: "Ambitious, energetic, and fearless. The Dragon is the most powerful sign in Chinese astrology. You radiate confidence and are destined for greatness — others are naturally drawn to your strength and vitality.",
  Snake: "Wise, intuitive, and enigmatic. The Snake sees beneath the surface of things. You possess deep philosophical wisdom, natural elegance, and a powerful intuition that guides your decisions.",
  Horse: "Energetic, free-spirited, and warm. The Horse lives for adventure and freedom. You have boundless enthusiasm, a magnetic personality, and an infectious optimism that lights up every room.",
  Goat: "Creative, gentle, and compassionate. The Goat (or Sheep) is the artist of the zodiac. You have a rich inner life, deep appreciation for beauty, and a tender heart that feels deeply for others.",
  Monkey: "Clever, inventive, and mischievous. The Monkey is the ultimate problem-solver. You have quick intelligence, irresistible charm, and an unmatched ability to find creative solutions to any challenge.",
  Rooster: "Observant, hardworking, and courageous. The Rooster is honest and straightforward, with an eye for detail that misses nothing. You take pride in your work and aren't afraid to speak your truth.",
  Dog: "Loyal, honest, and kind. The Dog is the most faithful companion in the zodiac. You have a strong sense of justice, unwavering loyalty to those you love, and a warm heart that values integrity above all.",
  Pig: "Generous, compassionate, and sincere. The Pig approaches life with an open heart and genuine warmth. You are generous to a fault, blessed with good fortune, and bring joy to everyone around you.",
};

const ELEMENT_DESCRIPTIONS: Record<string, string> = {
  Wood: "Growth, creativity, and flexibility. Wood energy brings expansion, generosity, and a pioneering spirit.",
  Fire: "Passion, dynamism, and leadership. Fire energy brings enthusiasm, warmth, and a magnetic presence.",
  Earth: "Stability, nourishment, and practicality. Earth energy brings groundedness, reliability, and nurturing wisdom.",
  Metal: "Precision, determination, and strength. Metal energy brings discipline, focus, and unwavering resolve.",
  Water: "Wisdom, intuition, and adaptability. Water energy brings depth, empathy, and the ability to flow through obstacles.",
};

/**
 * Determine the Chinese zodiac year, handling the Lunar New Year boundary.
 * If the birth date is before Lunar New Year of that calendar year,
 * the person belongs to the previous year's zodiac.
 */
function getChineseZodiacYear(dateOfBirth: Date): number {
  const calendarYear = dateOfBirth.getFullYear();
  const month = dateOfBirth.getMonth() + 1;
  const day = dateOfBirth.getDate();

  const lny = LUNAR_NEW_YEAR_DATES[calendarYear];
  if (!lny) {
    // Fallback: just use calendar year
    return calendarYear;
  }

  // If born before Lunar New Year, they belong to previous year's zodiac
  if (month < lny.month || (month === lny.month && day < lny.day)) {
    return calendarYear - 1;
  }

  return calendarYear;
}

export interface ChineseZodiacProfile {
  animal: string;
  emoji: string;
  element: string;
  yinYang: "Yin" | "Yang";
  description: string;
  elementDescription: string;
  compatibility: {
    bestWith: string[];
    challenging: string[];
  };
}

/**
 * Calculate the full Chinese zodiac profile for a date of birth.
 * Handles Lunar New Year boundaries for January/February birthdays.
 *
 * @param dateOfBirth - The person's date of birth
 * @returns A ChineseZodiacProfile with animal, element, yin/yang, and descriptions
 */
export function getChineseZodiac(dateOfBirth: Date): ChineseZodiacProfile {
  const zodiacYear = getChineseZodiacYear(dateOfBirth);

  // The cycle starts from Rat (1924 is year of the Rat, index 0)
  const animalIndex = ((zodiacYear - 1924) % 12 + 12) % 12;
  const animal = ANIMALS[animalIndex];

  // Heavenly Stem element: each element covers 2 consecutive years
  // The heavenly stem cycle is 10 years. The element index = floor((year - 4) % 10 / 2)
  const elementIndex = Math.floor(((zodiacYear - 4) % 10 + 10) % 10 / 2);
  const element = ELEMENTS[elementIndex];

  // Yin/Yang: even years are Yang, odd years are Yin
  const yinYang: "Yin" | "Yang" = zodiacYear % 2 === 0 ? "Yang" : "Yin";

  // Compatibility tables (traditional)
  const COMPATIBILITY: Record<string, { best: string[]; challenging: string[] }> = {
    Rat: { best: ["Dragon", "Monkey", "Ox"], challenging: ["Horse", "Rooster"] },
    Ox: { best: ["Rat", "Snake", "Rooster"], challenging: ["Tiger", "Dragon", "Horse", "Goat"] },
    Tiger: { best: ["Dragon", "Horse", "Pig"], challenging: ["Ox", "Tiger", "Snake", "Monkey"] },
    Rabbit: { best: ["Goat", "Monkey", "Dog", "Pig"], challenging: ["Snake", "Rooster"] },
    Dragon: { best: ["Rooster", "Rat", "Monkey"], challenging: ["Ox", "Goat", "Dog"] },
    Snake: { best: ["Dragon", "Rooster"], challenging: ["Tiger", "Rabbit", "Snake", "Horse", "Pig"] },
    Horse: { best: ["Tiger", "Goat", "Rabbit"], challenging: ["Rat", "Ox", "Rooster", "Horse"] },
    Goat: { best: ["Rabbit", "Horse", "Pig"], challenging: ["Ox", "Tiger", "Dog"] },
    Monkey: { best: ["Ox", "Rabbit"], challenging: ["Tiger", "Pig"] },
    Rooster: { best: ["Ox", "Snake"], challenging: ["Rat", "Rabbit", "Horse", "Rooster", "Dog", "Pig"] },
    Dog: { best: ["Rabbit", "Tiger"], challenging: ["Dragon", "Goat", "Rooster"] },
    Pig: { best: ["Tiger", "Rabbit", "Goat"], challenging: ["Snake", "Monkey"] },
  };

  const compat = COMPATIBILITY[animal] || { best: [], challenging: [] };

  return {
    animal,
    emoji: ANIMAL_EMOJIS[animal] || "🌟",
    element,
    yinYang,
    description: ANIMAL_DESCRIPTIONS[animal] || "",
    elementDescription: ELEMENT_DESCRIPTIONS[element] || "",
    compatibility: {
      bestWith: compat.best,
      challenging: compat.challenging,
    },
  };
}

/**
 * Get the Chinese zodiac animal and element for the current year.
 * Useful for determining current year compatibility.
 */
export function getCurrentYearZodiac(): { animal: string; element: string } {
  const now = new Date();
  const zodiacYear = getChineseZodiacYear(now);
  const animalIndex = ((zodiacYear - 1924) % 12 + 12) % 12;
  const elementIndex = Math.floor(((zodiacYear - 4) % 10 + 10) % 10 / 2);
  return {
    animal: ANIMALS[animalIndex],
    element: ELEMENTS[elementIndex],
  };
}
