export type MessagePart =
  | { type: "text"; content: string }
  | { type: "code"; language?: string; content: string };
