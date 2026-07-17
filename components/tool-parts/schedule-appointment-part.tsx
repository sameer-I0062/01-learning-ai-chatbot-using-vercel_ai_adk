import type { ChatMessage } from "@/types/chat";

type ScheduleAppointmentPart = Extract<ChatMessage["parts"][number], { type: "tool-schedule_appointment" }>;

export function ScheduleAppointmentToolPart({ part }: { part: ScheduleAppointmentPart }) {
  if (part.state !== "output-available") {
    return (
      <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-500 italic dark:text-zinc-400">
        Scheduling your appointment…
      </div>
    );
  }

  const { purpose, dateTime, name } = part.output;

  return (
    <div className="mb-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
      Appointment confirmed — <strong>{purpose}</strong> for {name} on {dateTime}
    </div>
  );
}
