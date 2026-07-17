import { MODEL_CONTEXT_WINDOW } from "@/lib/ai/config";

export function ChatHeader({ totalTokensUsed }: { totalTokensUsed: number }) {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-3 sm:px-4 dark:border-zinc-800">
      <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Chat Assistant</h1>
      <span className="text-[11px] text-zinc-500 sm:text-xs dark:text-zinc-400">
        {totalTokensUsed.toLocaleString()} / {MODEL_CONTEXT_WINDOW.toLocaleString()} tokens
      </span>
    </header>
  );
}
