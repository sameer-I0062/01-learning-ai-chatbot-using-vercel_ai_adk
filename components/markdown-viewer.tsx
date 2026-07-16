"use client";

import { isValidElement, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { HtmlViewer } from "./html-viewer";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return extractText(node.props.children);
  return "";
}

const components: Components = {
  a(props) {
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
  },
  pre(props) {
    const { children } = props;
    const codeElement = isValidElement<{ className?: string; children?: ReactNode }>(children)
      ? children
      : undefined;
    const language = /language-(\w+)/.exec(codeElement?.props.className ?? "")?.[1];
    const code = extractText(children);

    return (
      <>
        <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">
          {children}
        </pre>
        {language === "html" && <HtmlViewer html={code} />}
      </>
    );
  },
};

export function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-1 prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}
