/**
 * Pythagorean Numerology Calculation Engine
 *
 * Implements core numerology calculations using the Pythagorean letter-number system.
 * Master numbers (11, 22, 33) are preserved and never reduced.
 */

const PYTHAGOREAN_VALUES: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

/**
 * Reduce a number to a single digit, preserving master numbers (11, 22, 33).
 */
function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num)
      .split("")
      .reduce((sum, d) => sum + parseInt(d), 0);
  }
  return num;
}

/**
 * Sum the Pythagorean values of letters in a string.
 */
function sumLetterValues(letters: string): number {
  return letters
    .toUpperCase()
    .split("")
    .filter((ch) => PYTHAGOREAN_VALUES[ch] !== undefined)
    .reduce((sum, ch) => sum + PYTHAGOREAN_VALUES[ch], 0);
}

/**
 * Calculate the Life Path Number from a date of birth.
 * Each component (month, day, year) is reduced separately, then summed and reduced.
 * Master numbers (11, 22, 33) are preserved.
 *
 * @param dateOfBirth - The person's date of birth
 * @returns The Life Path Number (1-9, 11, 22, or 33)
 */
export function calculateLifePath(dateOfBirth: Date): number {
  const month = dateOfBirth.getMonth() + 1;
  const day = dateOfBirth.getDate();
  const year = dateOfBirth.getFullYear();

  const reducedMonth = reduceToSingleDigit(month);
  const reducedDay = reduceToSingleDigit(day);
  const reducedYear = reduceToSingleDigit(
    String(year)
      .split("")
      .reduce((sum, d) => sum + parseInt(d), 0)
  );

  return reduceToSingleDigit(reducedMonth + reducedDay + reducedYear);
}

/**
 * Calculate the Expression (Destiny) Number from the full birth name.
 * All letters of the full name are summed using the Pythagorean system and reduced.
 *
 * @param fullName - The person's full birth name
 * @returns The Expression Number (1-9, 11, 22, or 33)
 */
export function calculateExpression(fullName: string): number {
  return reduceToSingleDigit(sumLetterValues(fullName));
}

/**
 * Calculate the Soul Urge (Heart's Desire) Number from vowels in the birth name.
 *
 * @param fullName - The person's full birth name
 * @returns The Soul Urge Number (1-9, 11, 22, or 33)
 */
export function calculateSoulUrge(fullName: string): number {
  const vowels = fullName
    .toUpperCase()
    .split("")
    .filter((ch) => VOWELS.has(ch))
    .join("");
  return reduceToSingleDigit(sumLetterValues(vowels));
}

/**
 * Calculate the Personality Number from consonants in the birth name.
 *
 * @param fullName - The person's full birth name
 * @returns The Personality Number (1-9, 11, 22, or 33)
 */
export function calculatePersonality(fullName: string): number {
  const consonants = fullName
    .toUpperCase()
    .split("")
    .filter((ch) => PYTHAGOREAN_VALUES[ch] !== undefined && !VOWELS.has(ch))
    .join("");
  return reduceToSingleDigit(sumLetterValues(consonants));
}

/**
 * Calculate the current Personal Year number.
 * Uses birth month + birth day + current calendar year, reduced.
 *
 * @param dateOfBirth - The person's date of birth
 * @returns The Personal Year Number (1-9, 11, 22, or 33)
 */
export function calculatePersonalYear(dateOfBirth: Date): number {
  const month = dateOfBirth.getMonth() + 1;
  const day = dateOfBirth.getDate();
  const currentYear = new Date().getFullYear();

  const reducedMonth = reduceToSingleDigit(month);
  const reducedDay = reduceToSingleDigit(day);
  const reducedYear = reduceToSingleDigit(
    String(currentYear)
      .split("")
      .reduce((sum, d) => sum + parseInt(d), 0)
  );

  return reduceToSingleDigit(reducedMonth + reducedDay + reducedYear);
}

/** Interpretation data for numerology numbers */
export const INTERPRETATIONS: Record<
  string,
  Record<number, { title: string; brief: string; keywords: string[] }>
> = {
  lifePath: {
    1: {
      title: "The Leader",
      brief:
        "You are a natural-born innovator and independent thinker. Your path is one of originality, courage, and self-determination. You thrive when you forge your own trail.",
      keywords: ["independence", "ambition", "originality", "leadership"],
    },
    2: {
      title: "The Diplomat",
      brief:
        "You are a natural peacemaker with deep sensitivity and intuition. Your path is one of cooperation, balance, and harmonizing opposing forces.",
      keywords: ["cooperation", "sensitivity", "balance", "partnership"],
    },
    3: {
      title: "The Communicator",
      brief:
        "You radiate creative energy and natural charisma. Your path is one of self-expression, joy, and inspiring others through your words and artistic gifts.",
      keywords: ["creativity", "expression", "joy", "inspiration"],
    },
    4: {
      title: "The Builder",
      brief:
        "You are the foundation upon which great things are built. Your path is one of discipline, hard work, and creating lasting structures in the world.",
      keywords: ["stability", "discipline", "practicality", "dedication"],
    },
    5: {
      title: "The Adventurer",
      brief:
        "You are a free spirit driven by curiosity and change. Your path is one of freedom, versatility, and learning through diverse life experiences.",
      keywords: ["freedom", "change", "adventure", "versatility"],
    },
    6: {
      title: "The Nurturer",
      brief:
        "You carry a deep sense of responsibility and love for home and community. Your path is one of service, healing, and creating beauty and harmony.",
      keywords: ["responsibility", "love", "service", "harmony"],
    },
    7: {
      title: "The Seeker",
      brief:
        "You are a deep thinker drawn to life's mysteries. Your path is one of spiritual exploration, analysis, and the pursuit of inner wisdom and truth.",
      keywords: ["wisdom", "introspection", "spirituality", "analysis"],
    },
    8: {
      title: "The Powerhouse",
      brief:
        "You have a natural command of the material world. Your path is one of achievement, authority, and mastering the balance between material and spiritual wealth.",
      keywords: ["power", "abundance", "authority", "achievement"],
    },
    9: {
      title: "The Humanitarian",
      brief:
        "You carry a universal compassion and broad vision. Your path is one of service to humanity, creative wisdom, and learning to let go with grace.",
      keywords: ["compassion", "wisdom", "humanitarianism", "completion"],
    },
    11: {
      title: "The Intuitive Master",
      brief:
        "You carry the amplified energy of the 2 with a spiritual charge. Your path is one of illumination, spiritual insight, and inspiring others through visionary leadership.",
      keywords: ["intuition", "illumination", "inspiration", "spiritual mastery"],
    },
    22: {
      title: "The Master Builder",
      brief:
        "You carry the practical power of the 4 on a grand scale. Your path is one of turning visionary dreams into tangible reality that benefits many.",
      keywords: [
        "visionary building",
        "mastery",
        "large-scale achievement",
        "legacy",
      ],
    },
    33: {
      title: "The Master Teacher",
      brief:
        "You carry the nurturing power of the 6 at its highest expression. Your path is one of selfless service, spiritual teaching, and uplifting humanity through love.",
      keywords: [
        "master healing",
        "selfless service",
        "spiritual teaching",
        "unconditional love",
      ],
    },
  },
  expression: {
    1: {
      title: "Independent Creator",
      brief:
        "Your destiny calls you to lead through originality. You express yourself best when pioneering new ideas and standing confidently in your individuality.",
      keywords: ["pioneer", "self-starter", "original"],
    },
    2: {
      title: "Harmonious Mediator",
      brief:
        "Your destiny lies in creating bridges between people. You express your gifts through diplomacy, emotional intelligence, and supportive partnerships.",
      keywords: ["mediator", "supporter", "tactful"],
    },
    3: {
      title: "Creative Visionary",
      brief:
        "Your destiny is to inspire through creative expression. Whether through words, art, or performance, you light up rooms and lift spirits.",
      keywords: ["artist", "optimist", "entertainer"],
    },
    4: {
      title: "Systematic Organizer",
      brief:
        "Your destiny calls for building reliable systems. You express your talents through methodical planning, loyalty, and tangible results.",
      keywords: ["organizer", "dependable", "methodical"],
    },
    5: {
      title: "Dynamic Catalyst",
      brief:
        "Your destiny is one of change and progress. You express yourself through adaptability, communication, and breaking free of limitations.",
      keywords: ["catalyst", "communicator", "adaptable"],
    },
    6: {
      title: "Compassionate Guide",
      brief:
        "Your destiny is to nurture and heal. You express your gifts through creating beautiful, harmonious spaces and caring deeply for those around you.",
      keywords: ["healer", "caretaker", "aesthetic"],
    },
    7: {
      title: "Philosophical Mind",
      brief:
        "Your destiny calls you inward. You express your gifts through deep research, spiritual inquiry, and sharing hard-won wisdom with others.",
      keywords: ["researcher", "philosopher", "analyst"],
    },
    8: {
      title: "Executive Force",
      brief:
        "Your destiny is to wield power with integrity. You express your talents through strategic vision, financial acumen, and inspiring confident action.",
      keywords: ["executive", "strategist", "achiever"],
    },
    9: {
      title: "Universal Healer",
      brief:
        "Your destiny is to serve the greater good. You express yourself through compassion, artistic talent, and a broad worldview that embraces all.",
      keywords: ["philanthropist", "artist", "old soul"],
    },
    11: {
      title: "Spiritual Messenger",
      brief:
        "Your destiny is to channel higher truths. You express your gifts through visionary ideas, heightened sensitivity, and inspiring spiritual growth in others.",
      keywords: ["visionary", "channel", "inspirational"],
    },
    22: {
      title: "Architect of Change",
      brief:
        "Your destiny is to manifest large-scale transformation. You express your power through practical idealism and building systems that serve many.",
      keywords: ["architect", "transformer", "global thinker"],
    },
    33: {
      title: "Cosmic Healer",
      brief:
        "Your destiny is pure compassionate service. You express your gifts through nurturing on a grand scale, teaching through love, and healing communities.",
      keywords: ["master healer", "teacher", "selfless guide"],
    },
  },
  soulUrge: {
    1: {
      title: "Desire for Independence",
      brief: "Deep down, you crave the freedom to chart your own course and be recognized for your unique contributions.",
      keywords: ["autonomy", "recognition", "self-direction"],
    },
    2: {
      title: "Desire for Connection",
      brief: "Your heart yearns for deep, meaningful partnerships and a life filled with love, peace, and emotional harmony.",
      keywords: ["love", "peace", "partnership"],
    },
    3: {
      title: "Desire for Expression",
      brief: "Your soul craves creative outlets and the joy of sharing your inner world through artistic or verbal expression.",
      keywords: ["creativity", "joy", "self-expression"],
    },
    4: {
      title: "Desire for Stability",
      brief: "At your core, you seek a life of order, security, and accomplishment built on a solid foundation.",
      keywords: ["security", "order", "accomplishment"],
    },
    5: {
      title: "Desire for Freedom",
      brief: "Your innermost desire is total freedom — to experience, explore, and live life on your own eclectic terms.",
      keywords: ["exploration", "variety", "liberation"],
    },
    6: {
      title: "Desire for Harmony",
      brief: "Your heart desires a beautiful, harmonious life centered around family, love, and being of service to your community.",
      keywords: ["family", "beauty", "service"],
    },
    7: {
      title: "Desire for Understanding",
      brief: "Deep within, you crave truth and understanding. You long for the space to think deeply and connect with the spiritual.",
      keywords: ["truth", "solitude", "spiritual depth"],
    },
    8: {
      title: "Desire for Mastery",
      brief: "Your soul craves accomplishment and the respect that comes from mastering your domain and wielding influence wisely.",
      keywords: ["success", "influence", "material mastery"],
    },
    9: {
      title: "Desire for Transcendence",
      brief: "Your heart yearns to make a meaningful difference. You desire a life devoted to higher ideals and service to humanity.",
      keywords: ["meaning", "idealism", "universal love"],
    },
    11: {
      title: "Desire for Illumination",
      brief: "Your soul craves spiritual insight and the ability to inspire others with your heightened intuitive awareness.",
      keywords: ["enlightenment", "inspiration", "vision"],
    },
    22: {
      title: "Desire for Legacy",
      brief: "Deep within, you desire to leave a lasting mark on the world through monumental achievements that serve humanity.",
      keywords: ["legacy", "global impact", "manifestation"],
    },
    33: {
      title: "Desire for Universal Love",
      brief: "Your soul yearns to embody pure, selfless love and to devote your life to the spiritual upliftment of others.",
      keywords: ["divine love", "healing", "sacrifice"],
    },
  },
  personality: {
    1: {
      title: "The Individualist",
      brief: "Others see you as confident, self-assured, and capable. You project an aura of independence and determination.",
      keywords: ["confident", "assertive", "capable"],
    },
    2: {
      title: "The Peacemaker",
      brief: "Others see you as gentle, approachable, and considerate. You project warmth and a cooperative spirit.",
      keywords: ["gentle", "warm", "cooperative"],
    },
    3: {
      title: "The Entertainer",
      brief: "Others see you as charismatic, witty, and socially gifted. You project charm and an infectious enthusiasm.",
      keywords: ["charming", "witty", "sociable"],
    },
    4: {
      title: "The Rock",
      brief: "Others see you as reliable, hardworking, and practical. You project stability and trustworthiness.",
      keywords: ["reliable", "practical", "grounded"],
    },
    5: {
      title: "The Free Spirit",
      brief: "Others see you as exciting, magnetic, and unpredictable. You project an energy of adventure and possibility.",
      keywords: ["magnetic", "adventurous", "dynamic"],
    },
    6: {
      title: "The Caregiver",
      brief: "Others see you as responsible, nurturing, and domestic. You project an aura of comfort and reliability.",
      keywords: ["nurturing", "responsible", "comforting"],
    },
    7: {
      title: "The Mystic",
      brief: "Others see you as reserved, intellectual, and somewhat enigmatic. You project an aura of depth and mystery.",
      keywords: ["mysterious", "intellectual", "reserved"],
    },
    8: {
      title: "The Authority",
      brief: "Others see you as powerful, ambitious, and financially savvy. You project success and executive capability.",
      keywords: ["powerful", "ambitious", "commanding"],
    },
    9: {
      title: "The Idealist",
      brief: "Others see you as sophisticated, compassionate, and worldly. You project an aura of grace and generosity.",
      keywords: ["generous", "sophisticated", "worldly"],
    },
    11: {
      title: "The Illuminator",
      brief: "Others see you as inspirational and somewhat otherworldly. You project a magnetic, almost ethereal quality.",
      keywords: ["inspirational", "intuitive", "luminous"],
    },
    22: {
      title: "The Master Planner",
      brief: "Others see you as immensely capable and visionary. You project an aura of someone who can move mountains.",
      keywords: ["visionary", "powerful", "masterful"],
    },
    33: {
      title: "The Beacon",
      brief: "Others see you as deeply compassionate and spiritually evolved. You project a healing, nurturing light.",
      keywords: ["radiant", "healing", "saintly"],
    },
  },
  personalYear: {
    1: {
      title: "New Beginnings",
      brief: "This is a year of fresh starts and new initiatives. Plant seeds, take bold action, and assert your independence. What you begin now sets the tone for a 9-year cycle.",
      keywords: ["new cycle", "initiative", "independence"],
    },
    2: {
      title: "Patience & Partnership",
      brief: "This is a year for cooperation and quiet development. The seeds you planted last year need tending. Focus on relationships, diplomacy, and patience.",
      keywords: ["patience", "cooperation", "gestation"],
    },
    3: {
      title: "Creative Expression",
      brief: "This is a year to express yourself and enjoy life. Social connections flourish, creative projects bloom, and joy is the theme. Share your gifts.",
      keywords: ["creativity", "socializing", "self-expression"],
    },
    4: {
      title: "Building Foundations",
      brief: "This is a year for hard work and laying solid groundwork. Discipline yourself, organize your life, and build the structures that will support your future.",
      keywords: ["hard work", "discipline", "structure"],
    },
    5: {
      title: "Change & Freedom",
      brief: "This is a year of dynamic change and expansion. Expect the unexpected, embrace new experiences, and break free from what limits you.",
      keywords: ["change", "travel", "freedom"],
    },
    6: {
      title: "Home & Responsibility",
      brief: "This is a year centered on family, home, and community. Accept responsibilities with grace, nurture your relationships, and create beauty in your environment.",
      keywords: ["family", "service", "domestic harmony"],
    },
    7: {
      title: "Reflection & Inner Growth",
      brief: "This is a year for turning inward. Study, meditate, analyze, and deepen your understanding of yourself and life's mysteries. Solitude is productive now.",
      keywords: ["introspection", "study", "spiritual growth"],
    },
    8: {
      title: "Power & Achievement",
      brief: "This is a year of material harvest and personal power. Business ventures thrive, finances improve, and your authority grows. Think big and act decisively.",
      keywords: ["achievement", "financial gain", "authority"],
    },
    9: {
      title: "Completion & Release",
      brief: "This is a year of endings and clearing. Let go of what no longer serves you — relationships, habits, projects. Make space for the new cycle about to begin.",
      keywords: ["endings", "letting go", "humanitarian service"],
    },
    11: {
      title: "Spiritual Awakening",
      brief: "This is a master year of heightened intuition and spiritual awareness. Pay attention to synchronicities, trust your inner guidance, and inspire others.",
      keywords: ["illumination", "intuition", "spiritual insight"],
    },
    22: {
      title: "Master Building Year",
      brief: "This is a master year for manifesting grand visions. Your practical and spiritual powers combine to create something of lasting significance.",
      keywords: ["manifestation", "legacy building", "practical mastery"],
    },
    33: {
      title: "Master Teaching Year",
      brief: "This is a master year of selfless service and compassionate leadership. Your ability to uplift and heal others reaches its peak. Lead with love.",
      keywords: ["compassionate leadership", "healing", "service"],
    },
  },
};

/**
 * Get the interpretation for a specific numerology type and number.
 *
 * @param type - The numerology calculation type (lifePath, expression, soulUrge, personality, personalYear)
 * @param number - The calculated number
 * @returns An interpretation object with title, brief description, and keywords
 */
export function getInterpretation(
  type: string,
  number: number
): { title: string; brief: string; keywords: string[] } {
  const typeData = INTERPRETATIONS[type];
  if (!typeData) {
    return {
      title: "Unknown",
      brief: "Interpretation not available.",
      keywords: [],
    };
  }
  return (
    typeData[number] || {
      title: "Unknown",
      brief: "Interpretation not available for this number.",
      keywords: [],
    }
  );
}

export interface NumerologyProfile {
  lifePath: { number: number; interpretation: { title: string; brief: string; keywords: string[] } };
  expression: { number: number; interpretation: { title: string; brief: string; keywords: string[] } };
  soulUrge: { number: number; interpretation: { title: string; brief: string; keywords: string[] } };
  personality: { number: number; interpretation: { title: string; brief: string; keywords: string[] } };
  personalYear: { number: number; interpretation: { title: string; brief: string; keywords: string[] } };
}

/**
 * Calculate a complete numerology profile.
 *
 * @param fullName - The person's full birth name
 * @param dateOfBirth - The person's date of birth
 * @returns A full NumerologyProfile with all five numbers and interpretations
 */
export function calculateNumerologyProfile(
  fullName: string,
  dateOfBirth: Date
): NumerologyProfile {
  const lp = calculateLifePath(dateOfBirth);
  const exp = calculateExpression(fullName);
  const su = calculateSoulUrge(fullName);
  const pers = calculatePersonality(fullName);
  const py = calculatePersonalYear(dateOfBirth);

  return {
    lifePath: { number: lp, interpretation: getInterpretation("lifePath", lp) },
    expression: { number: exp, interpretation: getInterpretation("expression", exp) },
    soulUrge: { number: su, interpretation: getInterpretation("soulUrge", su) },
    personality: { number: pers, interpretation: getInterpretation("personality", pers) },
    personalYear: { number: py, interpretation: getInterpretation("personalYear", py) },
  };
}
