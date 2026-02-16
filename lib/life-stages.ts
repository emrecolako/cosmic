/**
 * Life Stage Classification Engine
 *
 * Classifies the user's current life context and provides guidance
 * for adapting the tone and focus of the cosmic reading.
 */

export interface LifeStageContext {
  stage: string;
  ageRange: string;
  focusAreas: string[];
  toneGuidance: string;
  topicsToEmphasize: string[];
  topicsToDeemphasize: string[];
}

export type LifeStageOption =
  | "exploring"
  | "building_career"
  | "in_relationship"
  | "married"
  | "parent"
  | "empty_nester"
  | "retired"
  | "prefer_not_to_say";

export const LIFE_STAGE_LABELS: Record<LifeStageOption, string> = {
  exploring: "Exploring life",
  building_career: "Building career",
  in_relationship: "In a relationship",
  married: "Married",
  parent: "Parent",
  empty_nester: "Empty nester",
  retired: "Retired",
  prefer_not_to_say: "Prefer not to say",
};

export const LIFE_STAGE_ICONS: Record<LifeStageOption, string> = {
  exploring: "🌱",
  building_career: "🚀",
  in_relationship: "💕",
  married: "💍",
  parent: "👨‍👩‍👧",
  empty_nester: "🏡",
  retired: "🌅",
  prefer_not_to_say: "✨",
};

/**
 * Classify the user's life stage and return contextual guidance
 * for adapting the cosmic reading.
 *
 * @param age - The person's current age
 * @param selectedStage - The life stage they selected
 * @returns A LifeStageContext with focus areas, tone guidance, and topic weighting
 */
export function classifyLifeStage(
  age: number,
  selectedStage: LifeStageOption
): LifeStageContext {
  const getAgeRange = (age: number): string => {
    if (age < 18) return "youth";
    if (age < 25) return "young adult";
    if (age < 35) return "early adulthood";
    if (age < 50) return "midlife";
    if (age < 65) return "mature";
    return "elder";
  };

  const ageRange = getAgeRange(age);

  const stageContexts: Record<LifeStageOption, LifeStageContext> = {
    exploring: {
      stage: "Exploring Life",
      ageRange,
      focusAreas: ["identity discovery", "potential", "personal growth", "finding direction"],
      toneGuidance:
        "Encouraging and possibility-oriented. Emphasize potential and discovery. Frame challenges as growth opportunities. Avoid prescriptive advice — invite exploration instead.",
      topicsToEmphasize: [
        "natural talents and strengths",
        "areas of untapped potential",
        "learning styles and intellectual gifts",
        "social and communication strengths",
        "what makes them unique",
      ],
      topicsToDeemphasize: [
        "career milestones",
        "financial planning",
        "relationship advice",
        "legacy themes",
      ],
    },
    building_career: {
      stage: "Building Career",
      ageRange,
      focusAreas: ["professional strengths", "leadership style", "strategic timing", "work-life harmony"],
      toneGuidance:
        "Strategic and empowering. Focus on professional strengths and timing. Frame cosmic patterns as tools for career navigation. Be specific about leadership and communication styles.",
      topicsToEmphasize: [
        "natural leadership style",
        "professional strengths and blind spots",
        "best timing for initiatives and risks",
        "communication and collaboration style",
        "ideal work environment and conditions",
      ],
      topicsToDeemphasize: [
        "retirement themes",
        "parenting style",
        "spiritual development emphasis",
      ],
    },
    in_relationship: {
      stage: "In a Relationship",
      ageRange,
      focusAreas: ["relational dynamics", "emotional needs", "communication style", "growth together"],
      toneGuidance:
        "Warm and relationally focused. Emphasize emotional intelligence and communication patterns. Frame personal traits in terms of how they show up in partnerships. Be sensitive and nuanced.",
      topicsToEmphasize: [
        "emotional needs and love language tendencies",
        "communication patterns in intimacy",
        "attachment style tendencies",
        "what they bring to partnerships",
        "areas of personal growth within relationship",
      ],
      topicsToDeemphasize: [
        "pure career ambition framing",
        "independence at all costs",
        "solitary pursuits emphasis",
      ],
    },
    married: {
      stage: "Married",
      ageRange,
      focusAreas: ["partnership dynamics", "shared goals", "emotional depth", "evolving together"],
      toneGuidance:
        "Grounded and partnership-oriented. Acknowledge the depth of committed partnership. Focus on evolving together, maintaining individual identity within union, and deepening connection.",
      topicsToEmphasize: [
        "partnership strengths and dynamics",
        "emotional depth and vulnerability patterns",
        "shared purpose and vision alignment",
        "maintaining individuality within commitment",
        "deepening intimacy over time",
      ],
      topicsToDeemphasize: [
        "single life exploration",
        "radical independence framing",
        "starting from scratch themes",
      ],
    },
    parent: {
      stage: "Parent",
      ageRange,
      focusAreas: ["nurturing style", "patience patterns", "family dynamics", "self-care balance"],
      toneGuidance:
        "Compassionate and understanding. Acknowledge the intensity of parenting. Balance focus between their role as parent and their identity as an individual. Emphasize self-compassion.",
      topicsToEmphasize: [
        "natural nurturing and teaching style",
        "patience and emotional regulation patterns",
        "balancing personal needs with caretaking",
        "what kind of environment they create",
        "how their cosmic profile shows up in family dynamics",
      ],
      topicsToDeemphasize: [
        "aggressive career ambition",
        "solo adventure emphasis",
        "risk-taking encouragement",
      ],
    },
    empty_nester: {
      stage: "Empty Nester",
      ageRange,
      focusAreas: ["rediscovery", "new chapters", "wisdom sharing", "personal renaissance"],
      toneGuidance:
        "Celebratory and forward-looking. Acknowledge the transition with respect. Emphasize the exciting opportunity for rediscovery and new pursuits. Frame wisdom as a superpower.",
      topicsToEmphasize: [
        "rediscovering personal passions",
        "new chapter possibilities",
        "accumulated wisdom and how to use it",
        "evolving relationship dynamics",
        "creative and spiritual renaissance",
      ],
      topicsToDeemphasize: [
        "basic identity discovery",
        "entry-level career advice",
        "early relationship dynamics",
      ],
    },
    retired: {
      stage: "Retired",
      ageRange,
      focusAreas: ["wisdom integration", "legacy", "spiritual depth", "joyful living"],
      toneGuidance:
        "Respectful and wisdom-honoring. Acknowledge the depth of lived experience. Focus on integration, legacy, spiritual growth, and the freedom this chapter brings. Never patronize.",
      topicsToEmphasize: [
        "wisdom integration and life review",
        "legacy and what they leave behind",
        "spiritual deepening and inner peace",
        "mentoring and sharing knowledge",
        "joyful living and freedom of this chapter",
      ],
      topicsToDeemphasize: [
        "career climbing",
        "basic relationship advice",
        "youthful identity exploration",
      ],
    },
    prefer_not_to_say: {
      stage: "Universal",
      ageRange,
      focusAreas: ["self-understanding", "personal growth", "timing awareness", "inner wisdom"],
      toneGuidance:
        "Balanced and universally applicable. Focus on self-understanding and personal growth without assumptions about life circumstances. Keep advice broadly relevant.",
      topicsToEmphasize: [
        "core personality strengths",
        "personal growth opportunities",
        "communication and emotional patterns",
        "timing and cycles",
        "inner wisdom and intuition",
      ],
      topicsToDeemphasize: [],
    },
  };

  return stageContexts[selectedStage] || stageContexts.prefer_not_to_say;
}

/**
 * Calculate age from date of birth.
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }
  return age;
}
