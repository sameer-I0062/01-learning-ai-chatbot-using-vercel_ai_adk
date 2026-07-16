"use client";

import { useRef, useState } from "react";

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 600;

export function HtmlViewer({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(MIN_HEIGHT);

  function handleLoad() {
    const body = iframeRef.current?.contentWindow?.document.body;
    if (body) {
      setHeight(Math.min(Math.max(body.scrollHeight, MIN_HEIGHT), MAX_HEIGHT));
    }
  }

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      onLoad={handleLoad}
      title="HTML preview"
      // No `allow-scripts`: the iframe can render markup/CSS but cannot execute
      // any JS the model or a tool result might have produced.
      sandbox="allow-same-origin"
      style={{ height }}
      className="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800"
    />
  );
}
