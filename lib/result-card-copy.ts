/**
 * Copy for the screenshot-ready Life Path card (/api/card). Edit freely:
 * `name` is the number's title, `line` is the one sentence on the card.
 * Keep lines short enough to read at Stories size (about 70 characters),
 * in the reading's voice: warm, specific, no claims or statistics.
 */
export const RESULT_CARD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as const;
export type ResultCardNumber = (typeof RESULT_CARD_NUMBERS)[number];

export const RESULT_CARD_COPY: Record<ResultCardNumber, { name: string; line: string }> = {
  1: { name: "The Leader", line: "You would rather make the path than wait to find one." },
  2: { name: "The Diplomat", line: "You hear what the room isn't saying." },
  3: { name: "The Communicator", line: "You turn ordinary days into stories worth retelling." },
  4: { name: "The Builder", line: "What you build is still standing long after the hype." },
  5: { name: "The Adventurer", line: "You learn by going, and you are always going somewhere." },
  6: { name: "The Nurturer", line: "People feel at home around you before they know why." },
  7: { name: "The Seeker", line: "You'd rather understand one thing deeply than everything a little." },
  8: { name: "The Powerhouse", line: "You see how things work, then make them work at scale." },
  9: { name: "The Humanitarian", line: "Your circle of care is wider than most people's map." },
  11: { name: "The Intuitive Master", line: "You often know before you can explain how you know." },
  22: { name: "The Master Builder", line: "You dream at full size, then draw up the plans." },
  33: { name: "The Master Teacher", line: "You lead with care, and people grow around you." },
};

export function isResultCardNumber(value: number): value is ResultCardNumber {
  return (RESULT_CARD_NUMBERS as readonly number[]).includes(value);
}
