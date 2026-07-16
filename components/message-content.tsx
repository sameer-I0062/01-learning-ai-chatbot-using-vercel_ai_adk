import { parseMessageParts } from "@/lib/parse-message";
import { CodeBlock } from "@/components/code-block";

export function MessageContent({ text }: { text: string }) {
  const parts = parseMessageParts(text);

  return (
    <>
      {parts.map((part, i) =>
        part.type === "code" ? (
          <CodeBlock key={i} code={part.content} language={part.language} />
        ) : (
          <span key={i} className="whitespace-pre-wrap">
            {part.content}
          </span>
        ),
      )}
    </>
  );
}
