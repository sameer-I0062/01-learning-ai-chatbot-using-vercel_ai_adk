import type { InferUITools, UIMessage } from "ai";
import type { tools } from "./tools";

export type ChatMessage = UIMessage<unknown, never, InferUITools<typeof tools>>;
