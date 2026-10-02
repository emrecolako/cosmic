/**
 * OpenRouter integration constants.
 *
 * The reading is generated via OpenRouter's chat-completions API using its
 * native `models[]` fallback routing: the first model in the chain that is
 * available serves the request. OpenRouter caps this array at 3 entries.
 *
 * Low reasoning effort limits hidden token use on this long writing task.
 * GPT-6 Luna passed the reading eval with a complete response at that setting.
 * A prior high-reasoning DeepSeek model exhausted its output budget without
 * visible content, so avoid high effort here.
 */

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const MODEL_CHAIN = [
  "openai/gpt-6-luna", // primary: stronger factual reliability, complete output in the reading eval
  "openai/gpt-5.6-luna", // fast, low-cost fallback
  "anthropic/claude-sonnet-5.5", // provider-diverse fallback with strong prose
];
