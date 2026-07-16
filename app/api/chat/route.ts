import { groq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
} from "ai";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { tools } from "@/lib/ai/tools";
import type { ChatMessage } from "@/lib/ai/message";

const MAX_HISTORY_MESSAGES = 10;

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);

  const result = streamText({
    model: groq("qwen/qwen3-32b"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(recentMessages),
    tools,
    stopWhen: stepCountIs(5),
    providerOptions: {
      groq: { reasoningFormat: "hidden" },
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
