import type { InferUITools, LanguageModelUsage, UIMessage } from "ai";
import type { tools } from "./tools";

export type ChatMessageMetadata = {
  usage?: LanguageModelUsage;
};

export type ChatMessage = UIMessage<ChatMessageMetadata, never, InferUITools<typeof tools>>;
