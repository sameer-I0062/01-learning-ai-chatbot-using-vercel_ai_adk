// Context window for qwen/qwen3-32b, per https://api.groq.com/openai/v1/models
export const MODEL_CONTEXT_WINDOW = 131_072;

// How many of the most recent messages are sent to the model as context.
// Keeps token usage/latency bounded on long conversations; older messages
// are still shown in the UI, just not sent to the model.
export const MAX_HISTORY_MESSAGES = 10;

// Aborts a tool's outbound fetch if it hangs longer than this, so one slow
// external API can't stall a chat response indefinitely.
export const TOOL_FETCH_TIMEOUT_MS = 10_000;
