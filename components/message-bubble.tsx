import type { ChatMessage } from "@/types/chat";
import { MessageContent } from "@/components/message-content";
import { SearchWebToolPart } from "@/components/tool-parts/search-web-part";
import { ScheduleAppointmentToolPart } from "@/components/tool-parts/schedule-appointment-part";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm sm:max-w-[80%] ${
          isUser
            ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return <MessageContent key={i} text={part.text} />;
          }
          if (part.type === "tool-search_web") {
            return <SearchWebToolPart key={i} part={part} />;
          }
          if (part.type === "tool-schedule_appointment") {
            return <ScheduleAppointmentToolPart key={i} part={part} />;
          }
          return null;
        })}

        {!isUser && message.metadata?.usage?.totalTokens != null && (
          <div className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
            {message.metadata.usage.totalTokens.toLocaleString()} tokens
          </div>
        )}
      </div>
    </div>
  );
}
