"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

export function MessageInput({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea as the user types multiple lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  function submit() {
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-zinc-200 px-3 py-3 sm:px-4 sm:py-4 dark:border-zinc-800"
    >
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Shift+Enter for a new line)"
          rows={1}
          className="max-h-40 min-h-11 flex-1 resize-none overflow-y-auto rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="min-h-11 rounded-full bg-zinc-900 px-4 text-sm font-medium text-zinc-50 disabled:opacity-40 sm:px-5 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Send
        </button>
      </div>
    </form>
  );
}
