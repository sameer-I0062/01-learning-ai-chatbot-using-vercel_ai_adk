"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { ChatMessage } from "@/lib/ai/message";
import { MODEL_CONTEXT_WINDOW } from "@/lib/ai/config";
import { MessageContent } from "@/components/message-content";

function isDisconnectError(error: Error) {
  const message = error.message.toLowerCase();
  return error.name === "TypeError" && (message.includes("fetch") || message.includes("network"));
}

export function Chat() {
  const { messages, sendMessage, status, error, regenerate, clearError } = useChat<ChatMessage>();
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);

  const isBusy = status === "submitted" || status === "streaming";

  const totalTokensUsed = useMemo(
    () => messages.reduce((sum, m) => sum + (m.metadata?.usage?.totalTokens ?? 0), 0),
    [messages],
  );

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distanceFromBottom < 80;
  }

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, status]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  function submitMessage() {
    const text = input.trim();
    if (!text || isBusy) return;
    isAtBottomRef.current = true;
    sendMessage({ text });
    setInput("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitMessage();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-3 sm:px-4 dark:border-zinc-800">
        <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Chat Assistant</h1>
        <span className="text-[11px] text-zinc-500 sm:text-xs dark:text-zinc-400">
          {totalTokensUsed.toLocaleString()} / {MODEL_CONTEXT_WINDOW.toLocaleString()} tokens
        </span>
      </header>

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-6 sm:px-4">
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
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm sm:max-w-[80%] ${
                  message.role === "user"
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                }`}
              >
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <MessageContent key={i} text={part.text} />;
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

                  if (part.type === "tool-schedule_appointment") {
                    if (part.state !== "output-available") {
                      return (
                        <div
                          key={i}
                          className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500 italic dark:text-zinc-400"
                        >
                          📅 Scheduling your appointment…
                        </div>
                      );
                    }
                    const { purpose, dateTime, name } = part.output;
                    return (
                      <div
                        key={i}
                        className="mb-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                      >
                        ✅ Appointment confirmed — <strong>{purpose}</strong> for {name} on {dateTime}
                      </div>
                    );
                  }

                  return null;
                })}

                {message.role === "assistant" && message.metadata?.usage?.totalTokens != null && (
                  <div className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                    {message.metadata.usage.totalTokens.toLocaleString()} tokens
                  </div>
                )}
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
            <div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <p>
                {isDisconnectError(error)
                  ? "Can't reach the server. Make sure it's running, then try again."
                  : error.message}
              </p>
              <div className="flex gap-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => regenerate()}
                  className="underline underline-offset-2"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={() => clearError()}
                  className="text-red-500 underline underline-offset-2 dark:text-red-400"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-zinc-200 px-3 py-3 sm:px-4 sm:py-4 dark:border-zinc-800">
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
            disabled={isBusy || !input.trim()}
            className="min-h-11 rounded-full bg-zinc-900 px-4 text-sm font-medium text-zinc-50 disabled:opacity-40 sm:px-5 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
