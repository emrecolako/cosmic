import { INTERPRETATIONS } from "@/lib/numerology";
import { getSunSign } from "@/lib/western-astrology";
import { getChineseZodiac } from "@/lib/chinese-zodiac";
import type {
  AnimalName,
  ChineseElementName,
  LocaleContent,
  SignName,
} from "./types";

const signDates: Record<SignName, Date> = {
  Aries: new Date(2000, 3, 10),
  Taurus: new Date(2000, 4, 10),
  Gemini: new Date(2000, 5, 10),
  Cancer: new Date(2000, 6, 10),
  Leo: new Date(2000, 7, 10),
  Virgo: new Date(2000, 8, 10),
  Libra: new Date(2000, 9, 10),
  Scorpio: new Date(2000, 10, 10),
  Sagittarius: new Date(2000, 11, 10),
  Capricorn: new Date(2000, 0, 10),
  Aquarius: new Date(2000, 1, 10),
  Pisces: new Date(2000, 2, 10),
};

const zodiac = Object.fromEntries(
  Object.entries(signDates).map(([sign, date]) => {
    const profile = getSunSign(date);
    return [sign, { description: profile.description, traits: profile.traits }];
  })
) as LocaleContent["zodiac"];

const animalYears: Record<AnimalName, number> = {
  Rat: 1996,
  Ox: 1997,
  Tiger: 1998,
  Rabbit: 1999,
  Dragon: 2000,
  Snake: 2001,
  Horse: 2002,
  Goat: 2003,
  Monkey: 2004,
  Rooster: 2005,
  Dog: 2006,
  Pig: 2007,
};

const chineseAnimals = Object.fromEntries(
  Object.entries(animalYears).map(([animal, year]) => [
    animal,
    getChineseZodiac(new Date(year, 6, 1)).description,
  ])
) as LocaleContent["chineseAnimals"];

const elementYears: Record<ChineseElementName, number> = {
  Wood: 1984,
  Fire: 1986,
  Earth: 1988,
  Metal: 1990,
  Water: 1992,
};

const chineseElements = Object.fromEntries(
  Object.entries(elementYears).map(([element, year]) => [
    element,
    getChineseZodiac(new Date(year, 6, 1)).elementDescription,
  ])
) as LocaleContent["chineseElements"];

export const content: LocaleContent = {
  numerology: INTERPRETATIONS as LocaleContent["numerology"],
  zodiac,
  chineseAnimals,
  chineseElements,
  signNames: {
    Aries: "Aries",
    Taurus: "Taurus",
    Gemini: "Gemini",
    Cancer: "Cancer",
    Leo: "Leo",
    Virgo: "Virgo",
    Libra: "Libra",
    Scorpio: "Scorpio",
    Sagittarius: "Sagittarius",
    Capricorn: "Capricorn",
    Aquarius: "Aquarius",
    Pisces: "Pisces",
  },
  elementNames: {
    Fire: "Fire",
    Water: "Water",
    Earth: "Earth",
    Air: "Air",
  },
  modalityNames: {
    Cardinal: "Cardinal",
    Fixed: "Fixed",
    Mutable: "Mutable",
  },
  planetNames: {
    Mars: "Mars",
    Venus: "Venus",
    Mercury: "Mercury",
    Moon: "Moon",
    Sun: "Sun",
    Pluto: "Pluto",
    Jupiter: "Jupiter",
    Saturn: "Saturn",
    Uranus: "Uranus",
    Neptune: "Neptune",
  },
  animalNames: {
    Rat: "Rat",
    Ox: "Ox",
    Tiger: "Tiger",
    Rabbit: "Rabbit",
    Dragon: "Dragon",
    Snake: "Snake",
    Horse: "Horse",
    Goat: "Goat",
    Monkey: "Monkey",
    Rooster: "Rooster",
    Dog: "Dog",
    Pig: "Pig",
  },
  chineseElementNames: {
    Wood: "Wood",
    Fire: "Fire",
    Earth: "Earth",
    Metal: "Metal",
    Water: "Water",
  },
  yinYang: {
    Yin: "Yin",
    Yang: "Yang",
  },
};
