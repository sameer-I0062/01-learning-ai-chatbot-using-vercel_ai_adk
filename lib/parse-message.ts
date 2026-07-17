import type { MessagePart } from "@/types/message-parts";

const CODE_BLOCK_REGEX = /```([\w+-]*)\n?([\s\S]*?)```/g;

export function parseMessageParts(text: string): MessagePart[] {
  const parts: MessagePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = CODE_BLOCK_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    const [, language, code] = match;
    parts.push({ type: "code", language: language || undefined, content: code.replace(/\n$/, "") });
    lastIndex = CODE_BLOCK_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}
