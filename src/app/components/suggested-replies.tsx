"use client";

interface SuggestedRepliesProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export function SuggestedReplies({
  suggestions,
  onSelect,
}: SuggestedRepliesProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="flex flex-wrap justify-end gap-2">
        {suggestions.map((text, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(text)}
            className="group suggestion-pill"
          >
            <span className="suggestion-pill-inner">
              <span>{text}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-3 w-3 shrink-0 text-foreground-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
