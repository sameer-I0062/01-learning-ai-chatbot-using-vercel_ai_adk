"use client";

import { useChat } from "@ai-sdk/react";
import { useMemo } from "react";
import type { ChatMessage } from "@/types/chat";
import { ChatHeader } from "@/components/chat-header";
import { MessageList } from "@/components/message-list";
import { ErrorBanner } from "@/components/error-banner";
import { MessageInput } from "@/components/message-input";

export function Chat() {
  const { messages, sendMessage, status, error, regenerate, clearError } = useChat<ChatMessage>();

  const isBusy = status === "submitted" || status === "streaming";

  const totalTokensUsed = useMemo(
    () => messages.reduce((sum, m) => sum + (m.metadata?.usage?.totalTokens ?? 0), 0),
    [messages],
  );

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 dark:bg-black">
      <ChatHeader totalTokensUsed={totalTokensUsed} />

      <MessageList messages={messages} status={status} />

      {error && (
        <div className="px-3 pb-2 sm:px-4">
          <div className="mx-auto max-w-2xl">
            <ErrorBanner error={error} onRetry={() => regenerate()} onDismiss={clearError} />
          </div>
        </div>
      )}

      <MessageInput disabled={isBusy} onSend={(text) => sendMessage({ text })} />
    </div>
  );
}
