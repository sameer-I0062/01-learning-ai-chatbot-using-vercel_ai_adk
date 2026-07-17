import { groq } from "@ai-sdk/groq";
import {
  APICallError,
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
} from "ai";
import { MAX_HISTORY_MESSAGES } from "@/lib/ai/config";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { tools } from "@/lib/ai/tools";
import type { ChatMessage } from "@/types/chat";

export async function POST(req: Request) {
  try {
    const messages = await parseRequestMessages(req);
    if (messages instanceof Response) return messages;

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
      stream: toUIMessageStream({
        stream: result.stream,
        onError: toClientErrorMessage,
        messageMetadata: ({ part }) => {
          if (part.type === "finish") {
            return { usage: part.totalUsage };
          }
        },
      }),
    });
  } catch (err) {
    // Defense in depth: any unexpected failure (bad message shape reaching
    // convertToModelMessages, etc.) still returns a clean JSON error instead
    // of leaking Next's default HTML error page to the client.
    console.error("Unhandled /api/chat error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

async function parseRequestMessages(req: Request): Promise<ChatMessage[] | Response> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages)) {
    return Response.json({ error: "Request body must include a 'messages' array." }, { status: 400 });
  }

  return messages as ChatMessage[];
}

function toClientErrorMessage(error: unknown): string {
  console.error("Chat stream error:", error);

  if (APICallError.isInstance(error)) {
    const code = parseGroqErrorCode(error.responseBody);

    if (code === "context_length_exceeded") {
      return "This conversation is too long for the model to handle. Try starting a new chat.";
    }
    if (error.statusCode === 401 || error.statusCode === 403) {
      return "The AI service is not configured correctly (invalid API key). Please contact the site owner.";
    }
    if (error.statusCode === 429) {
      return "Too many requests right now. Please wait a moment and try again.";
    }
    if (error.statusCode && error.statusCode >= 500) {
      return "The AI service is temporarily unavailable. Please try again shortly.";
    }
    return "The AI service returned an error. Please try again.";
  }

  return "Something went wrong while generating a response. Please try again.";
}

function parseGroqErrorCode(responseBody: string | undefined): string | undefined {
  if (!responseBody) return undefined;
  try {
    return JSON.parse(responseBody)?.error?.code;
  } catch {
    return undefined;
  }
}
