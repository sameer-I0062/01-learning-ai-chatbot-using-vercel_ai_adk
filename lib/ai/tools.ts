import { tool } from "ai";
import { z } from "zod";

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;

export const searchWeb = tool({
  description:
    "Search the live web for current or fresh information that may not be in the assistant's training data (recent events, prices, docs, releases, etc). Only use this when the question genuinely needs up-to-date info.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    if (!TINYFISH_API_KEY) {
      return { error: "Web search is not configured (missing TINYFISH_API_KEY)." };
    }

    const url = `https://api.search.tinyfish.ai?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { "X-API-Key": TINYFISH_API_KEY },
    });

    if (!response.ok) {
      return { error: `Search failed with status ${response.status}` };
    }

    return response.json();
  },
});

export const tools = { search_web: searchWeb };
