"use client";

import type { BreadcrumbItem } from "@/lib/meta/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      <button
        onClick={() => onNavigate(-1)}
        className="shrink-0 text-foreground-muted hover:text-foreground transition-colors font-medium"
      >
        Ad Accounts
      </button>
      {items.map((item, i) => (
        <span key={`${item.level}-${item.id}`} className="flex items-center gap-1 shrink-0">
          <svg className="h-3.5 w-3.5 text-foreground-muted/50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          {i === items.length - 1 ? (
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          ) : (
            <button
              onClick={() => onNavigate(i)}
              className="text-foreground-muted hover:text-foreground transition-colors truncate max-w-[200px]"
            >
              {item.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  );
}
