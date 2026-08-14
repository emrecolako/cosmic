/**
 * OpenRouter integration constants.
 *
 * The reading is generated via OpenRouter's chat-completions API using its
 * native `models[]` fallback routing: the first model in the chain that is
 * available serves the request. OpenRouter caps this array at 3 entries.
 *
 * Deliberately non-reasoning models only. Reasoning models (tested:
 * deepseek/deepseek-v4-pro-0813) spend an unpredictable, sometimes total,
 * share of `max_tokens` on hidden chain-of-thought before writing any
 * visible content — on our long structured prompt it consumed the entire
 * budget and returned nothing, after 75-90s. (`openai/gpt-5.2-chat` was the
 * first pick here but has no live endpoints on OpenRouter — 404.)
 */

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const MODEL_CHAIN = [
  "openai/gpt-5.6-luna", // default — non-reasoning ChatGPT-style model, in OpenRouter's creative collection
  "anthropic/claude-sonnet-5", // previous direct backend, strong instruction-following
  "google/gemini-3.1-pro-preview", // tops creative-writing leaderboards
];
