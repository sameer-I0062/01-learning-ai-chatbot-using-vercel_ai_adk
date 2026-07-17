import type { ChatMessage } from "@/types/chat";

type SearchWebPart = Extract<ChatMessage["parts"][number], { type: "tool-search_web" }>;

export function SearchWebToolPart({ part }: { part: SearchWebPart }) {
  const label =
    part.state === "output-available"
      ? `Searched the web for "${part.input?.query ?? ""}"`
      : `Searching the web for "${part.input?.query ?? "..."}"`;

  return (
    <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500 italic dark:text-zinc-400">
      🔍 {label}
    </div>
  );
}
