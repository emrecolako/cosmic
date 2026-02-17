/**
 * English translations for Cosmic Blueprint (default)
 */

export const en = {
  // Landing page
  landing: {
    badge: "Numerology + Western Astrology + Chinese Zodiac",
    title1: "Cosmic",
    title2: "Blueprint",
    subtitle: "Your complete cosmic profile, unified.",
    subtitle2: "Three ancient systems. One personal reading.",
    privacy: "Your data stays in your browser. We don't store birth details.",
  },

  // Input wizard
  wizard: {
    step1Title: "Your Birth Details",
    step2Title: "Your Life Context",
    fullNameLabel: "Full name (as given at birth)",
    fullNamePlaceholder: "Enter your full birth name",
    dobLabel: "Date of birth",
    birthTimeLabel: "Time of birth",
    iDontKnow: "I don't know",
    iKnowMyBirthTime: "I know my birth time",
    birthPlaceLabel: "Place of birth (city)",
    birthPlacePlaceholder: "Optional — enables rising sign calculation",
    lifeStageLabel: "Current life stage",
    whatsOnYourMindLabel: "What's on your mind?",
    whatsOnYourMindOptional: "(optional)",
    whatsOnYourMindPlaceholder: "A sentence or two about what's happening in your life right now...",
    genderLabel: "Gender",
    genderOptional: "(optional)",
    genderOptions: {
      female: "Female",
      male: "Male",
      nonBinary: "Non-binary",
      preferNotToSay: "Prefer not to say",
    },
    back: "Back",
    continue: "Continue",
    reveal: "Reveal My Cosmic Blueprint",
    loading: "Mapping your blueprint...",
  },

  // Life stages
  lifeStages: {
    exploring: "Exploring life",
    building_career: "Building career",
    in_relationship: "In a relationship",
    married: "Married",
    parent: "Parent",
    empty_nester: "Empty nester",
    retired: "Retired",
    prefer_not_to_say: "Prefer not to say",
  },

  // Results page
  results: {
    newReading: "New Reading",
    title: "Cosmic Blueprint",
    forPerson: "for",
    loadingMessage: "Mapping your cosmic blueprint...",
    errorTitle: "Something went wrong",
    startOver: "Start Over",
    cosmicSnapshotLabel: "Your Cosmic Snapshot",
    generateAnother: "Generate Another Reading",
    closingMessage: "May this map serve your journey well.",
  },

  // Section headers
  sections: {
    numbersTitle: "The Numbers",
    numbersSubtitle: "Your numerology profile reveals the mathematical signature of your life",
    starMapTitle: "Your Star Map",
    starMapSubtitle: "Western astrology reveals your celestial identity",
    easternMirrorTitle: "Your Eastern Mirror",
    easternMirrorSubtitle: "Chinese astrology reflects your cosmic animal nature",
    unifiedReadingTitle: "The Unified Reading",
    unifiedReadingSubtitle: "Where all your cosmic threads weave together",
    currentSeasonTitle: "This Season For You",
    currentSeasonSubtitle: "What the cosmos is activating in your life right now",
    cosmicToolkitTitle: "Your Cosmic Toolkit",
    cosmicToolkitSubtitle: "Practical takeaways from your complete cosmic profile",
  },

  // Numerology
  numerology: {
    lifePath: "Life Path",
    expression: "Expression",
    soulUrge: "Soul Urge",
    personality: "Personality",
    personalYear: "Personal Year",
  },

  // Western astrology
  western: {
    sunSign: "Sun Sign",
    moonSign: "Moon Sign",
    risingSign: "Rising Sign",
    natalChart: "Natal Chart",
    solarChartNote: "Solar chart — provide birth time for full natal chart with moon and rising sign",
    birthTimeNote: "Provide your birth time and place for moon sign, rising sign, and more precise readings.",
    decan: "Decan",
    element: "Element",
    modality: "Modality",
    rulingPlanet: "Ruling Planet",
  },

  // Chinese zodiac
  chinese: {
    the: "The ",
    bestWith: "Best With",
    challenging: "Challenging",
    elementLabel: "Element",
  },

  // Combined analysis
  analysis: {
    errorMessage: "The AI analysis couldn't be generated at this time.",
    tryAgain: "Try Again",
    personalYear: "Personal Year",
  },

  // Zodiac sign translations (same in English)
  zodiacSigns: {
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

  elements: {
    Fire: "Fire",
    Water: "Water",
    Earth: "Earth",
    Air: "Air",
    Wood: "Wood",
    Metal: "Metal",
  },

  modalities: {
    Cardinal: "Cardinal",
    Fixed: "Fixed",
    Mutable: "Mutable",
  },

  animals: {
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

  yinYang: {
    Yin: "Yin",
    Yang: "Yang",
  },

  // Interpretations - will use the originals from lib/numerology.ts
  interpretations: null as null,

  animalDescriptions: null as null,
  elementDescriptions: null as null,
  signDescriptions: null as null,
  signTraits: null as null,
} as const;
