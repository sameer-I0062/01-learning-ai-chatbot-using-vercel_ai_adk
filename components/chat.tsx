"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import type { FormEvent } from "react";
import type { ChatMessage } from "@/lib/ai/message";

export function Chat() {
  const { messages, sendMessage, status, error } = useChat<ChatMessage>();
  const [input, setInput] = useState("");

  const isBusy = status === "submitted" || status === "streaming";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Chat Assistant
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Ask me anything. I can search the web when I need up-to-date info.
            </p>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                }`}
              >
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <span key={i}>{part.text}</span>;
                  }

                  if (part.type === "tool-search_web") {
                    const label =
                      part.state === "output-available"
                        ? `Searched the web for "${part.input?.query ?? ""}"`
                        : `Searching the web for "${part.input?.query ?? "..."}"`;
                    return (
                      <div
                        key={i}
                        className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500 italic dark:text-zinc-400"
                      >
                        🔍 {label}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}

          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-white px-4 py-2 text-sm text-zinc-400 shadow-sm dark:bg-zinc-900 dark:text-zinc-500">
                Thinking…
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              Something went wrong. Please try again.
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800"
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-zinc-50 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
