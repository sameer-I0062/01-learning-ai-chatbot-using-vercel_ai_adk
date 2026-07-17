import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/chat";

type ReasoningPart = Extract<ChatMessage["parts"][number], { type: "reasoning" }>;

export function ReasoningBlock({ part }: { part: ReasoningPart }) {
  const [open, setOpen] = useState(part.state === "streaming");
  const wasStreaming = useRef(part.state === "streaming");

  useEffect(() => {
    const isStreaming = part.state === "streaming";
    if (wasStreaming.current && !isStreaming) {
      setOpen(false);
    }
    wasStreaming.current = isStreaming;
  }, [part.state]);

  if (!part.text) return null;

  return (
    <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 italic hover:underline"
      >
        {open ? "Hide thinking" : "Show thinking"}
      </button>
      {open && <div className="mt-1 whitespace-pre-wrap border-l-2 border-zinc-300 pl-2 dark:border-zinc-700">{part.text}</div>}
    </div>
  );
}
