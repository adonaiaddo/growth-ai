"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children, streaming }: { children: string; streaming?: boolean }) {
  const [ending, setEnding] = useState(false);
  const wasStreaming = useRef(false);

  useEffect(() => {
    if (streaming) {
      wasStreaming.current = true;
      setEnding(false);
    } else if (wasStreaming.current) {
      // Streaming just finished — play fade-out, then clean up
      wasStreaming.current = false;
      setEnding(true);
      const timer = setTimeout(() => setEnding(false), 600);
      return () => clearTimeout(timer);
    }
  }, [streaming]);

  const wrapperClass = streaming
    ? "prose-ai prose-ai-streaming"
    : ending
      ? "prose-ai prose-ai-stream-end"
      : "prose-ai";

  return (
    <div className={wrapperClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt ?? ""}
              className="my-3 max-w-full rounded-lg"
              loading="lazy"
            />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 underline decoration-violet-400/30 underline-offset-2 hover:decoration-violet-400 transition-colors"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg bg-white/[0.04] border border-white/[0.06] p-3 text-xs leading-relaxed">
              {children}
            </pre>
          ),
          code: ({ children, className }) => {
            if (className) {
              return <code className="text-violet-300">{children}</code>;
            }
            return (
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-violet-300">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/[0.04] text-foreground-muted">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-t border-white/[0.06] px-3 py-2">
              {children}
            </td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
