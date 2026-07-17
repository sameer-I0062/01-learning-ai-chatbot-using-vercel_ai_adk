"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { COPY_FEEDBACK_DURATION_MS } from "@/lib/ui-constants";

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clear any pending "reset copied state" timer if the component unmounts
  // (e.g. this message scrolls out and gets removed) before it fires.
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
    } catch {
      // clipboard access denied or unavailable; nothing more we can do here
    }
  }

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
        <span className="text-xs text-zinc-400">{language ?? "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
        >
          {copied ? (
            <>
              <CheckIcon /> Copied
            </>
          ) : (
            <>
              <CopyIcon /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2 text-xs text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
