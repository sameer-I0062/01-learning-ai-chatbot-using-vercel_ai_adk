"use client";

import { useEffect, useRef } from "react";
import type { ChatStatus } from "ai";
import type { ChatMessage } from "@/types/chat";
import { MessageBubble } from "@/components/message-bubble";
import { AUTO_SCROLL_THRESHOLD_PX } from "@/lib/ui-constants";

export function MessageList({ messages, status }: { messages: ChatMessage[]; status: ChatStatus }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distanceFromBottom < AUTO_SCROLL_THRESHOLD_PX;
  }

  useEffect(() => {
    // Always snap to bottom when the user just sent a new message, even if
    // they'd scrolled up to read earlier ones. Otherwise, only auto-scroll
    // (e.g. as a reply streams in) while they're already near the bottom.
    const justSentByUser =
      messages.length > prevMessageCountRef.current && messages.at(-1)?.role === "user";
    prevMessageCountRef.current = messages.length;

    if (justSentByUser) {
      isAtBottomRef.current = true;
    }

    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, status]);

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-6 sm:px-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Ask me anything. I can search the web when I need up-to-date info.
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-white px-4 py-2 text-sm text-zinc-400 shadow-sm dark:bg-zinc-900 dark:text-zinc-500">
              Thinking…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
