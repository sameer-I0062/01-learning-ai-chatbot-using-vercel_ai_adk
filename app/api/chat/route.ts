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

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const result = streamText({
    model: groq("qwen/qwen3-32b"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
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
