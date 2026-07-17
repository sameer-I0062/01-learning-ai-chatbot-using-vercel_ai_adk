import { tool } from "ai";
import { z } from "zod";
import { saveAppointment } from "@/lib/db/appointments";
import { TOOL_FETCH_TIMEOUT_MS } from "@/lib/ai/config";

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

    try {
      const response = await fetch(url, {
        headers: { "X-API-Key": TINYFISH_API_KEY },
        signal: AbortSignal.timeout(TOOL_FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        return { error: `Search failed with status ${response.status}` };
      }

      return response.json();
    } catch (err) {
      const timedOut = err instanceof Error && err.name === "TimeoutError";
      return { error: timedOut ? "Search timed out." : "Search failed." };
    }
  },
});

export const scheduleAppointment = tool({
  description:
    "Schedule an appointment once the purpose, date/time, and name have all been collected from the user. Call this only after all three details are confirmed.",
  inputSchema: z.object({
    purpose: z
      .string()
      .describe("What the appointment is for, e.g. 'haircut', 'coaching call', 'wedding planner consultation'"),
    dateTime: z.string().describe("The date and time for the appointment, as stated by the user"),
    name: z.string().describe("The name of the person the appointment is for"),
  }),
  execute: async ({ purpose, dateTime, name }) => {
    const confirmedAt = new Date().toISOString();

    try {
      await saveAppointment({ purpose, dateTime, name, confirmedAt });
    } catch (err) {
      console.error("Failed to save appointment to MongoDB:", err);
    }

    return {
      status: "confirmed" as const,
      purpose,
      dateTime,
      name,
      confirmedAt,
    };
  },
});

export const tools = { search_web: searchWeb, schedule_appointment: scheduleAppointment };
