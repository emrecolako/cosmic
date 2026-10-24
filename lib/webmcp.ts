import { SITE_URL } from "@/lib/site";

/**
 * WebMCP tools for browser agents, registered from instrumentation-client so
 * they exist on every page and live in an early bundle. None takes birth
 * details: the person enters those in the site's own form.
 */

type ToolInput = Record<string, unknown>;
type BrowserTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean };
  execute: (input: ToolInput) => string;
};
type ModelContext = {
  registerTool: (tool: BrowserTool, options: { signal: AbortSignal }) => Promise<void> | void;
};

const NO_INPUT = { type: "object", properties: {} };
const LIBRARY_TOPICS = ["life-path", "zodiac", "chinese-zodiac"];

function go(path: string, message: string): string {
  window.location.assign(path);
  return message;
}

const TOOLS: BrowserTool[] = [
  {
    name: "get_unified_reading_options",
    description: "Explain the public sample, personal reading, price page, and privacy page without collecting anyone's birth details.",
    inputSchema: NO_INPUT,
    annotations: { readOnlyHint: true },
    execute: () => JSON.stringify({
      sample: `${SITE_URL}/sample`,
      startReading: `${SITE_URL}/#details`,
      pricing: `${SITE_URL}/pricing`,
      privacy: `${SITE_URL}/privacy`,
      library: `${SITE_URL}/library`,
      mcpServer: `${SITE_URL}/mcp`,
      note: "The reading is an interpretive reflection, not a scientific assessment or prediction. Let the person enter birth details on the site.",
    }),
  },
  {
    name: "open_unified_reading_sample",
    description: "Open the free fictional sample reading in this browser tab. No personal details or payment are required.",
    inputSchema: NO_INPUT,
    annotations: { readOnlyHint: false },
    execute: () => go("/sample", "Opening the public sample reading."),
  },
  {
    name: "open_unified_reading_form",
    description: "Open the personal reading form in this browser tab so the person can enter their own birth details. Do not fill the form for them.",
    inputSchema: NO_INPUT,
    annotations: { readOnlyHint: false },
    execute: () => go("/#details", "Opening the reading form. Ask the person to enter their details themselves."),
  },
  {
    name: "open_unified_reading_library_page",
    description: "Open a Unified Reading library guide in this browser tab: a Life Path number (1-9, 11, 22, 33), the zodiac signs overview, or a Chinese zodiac animal.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", enum: LIBRARY_TOPICS, description: "Which tradition the guide belongs to." },
        value: { type: "string", description: "Life Path number (e.g. 7) or Chinese zodiac animal (e.g. horse). Omit for the overview page." },
      },
      required: ["topic"],
    },
    annotations: { readOnlyHint: false },
    execute: ({ topic, value }) => {
      if (typeof topic !== "string" || !LIBRARY_TOPICS.includes(topic)) return "Unknown topic.";
      const slug = String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
      // Single zodiac signs have no page of their own; their meanings live on the hub.
      const path = `/${topic}${slug && topic !== "zodiac" ? `/${slug}` : ""}`;
      return go(path, `Opening ${path}.`);
    },
  },
];

export function registerWebMcpTools(): void {
  // document.modelContext is the spec'd entry point; navigator is the older one.
  const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext
    ?? (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
  if (typeof modelContext?.registerTool !== "function") return;

  const controller = new AbortController();
  for (const tool of TOOLS) {
    try {
      void Promise.resolve(modelContext.registerTool(tool, { signal: controller.signal })).catch(() => {});
    } catch {
      // Browsers without a working WebMCP implementation keep the normal UI.
    }
  }
}
