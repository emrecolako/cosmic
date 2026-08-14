/**
 * Parser for the streamed AI analysis.
 *
 * The model emits four marker-delimited plain-text sections (see
 * lib/analysis-prompt.ts). Parsing is tolerant of partial input so the
 * client can re-parse on every streamed chunk and reveal text as it arrives.
 */

export interface ParsedAnalysis {
  cosmicSnapshot: string | null;
  combinedAnalysis: string | null;
  currentSeason: string | null;
  cosmicToolkit: string[] | null;
}

const MARKER_RE = /<<<(SNAPSHOT|READING|SEASON|TOOLKIT)>>>/g;

export function parseAnalysis(text: string): ParsedAnalysis {
  const sections: Record<string, string> = {};
  const matches = [...text.matchAll(MARKER_RE)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    sections[match[1]] = text.slice(start, end).trim();
  }

  const toolkit = sections.TOOLKIT
    ? sections.TOOLKIT.split("\n")
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
    : null;

  return {
    cosmicSnapshot: sections.SNAPSHOT || null,
    combinedAnalysis: sections.READING || null,
    currentSeason: sections.SEASON || null,
    cosmicToolkit: toolkit && toolkit.length > 0 ? toolkit : null,
  };
}
