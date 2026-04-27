"use client";

import type { MetaCampaign } from "@/lib/meta/types";

interface CampaignCardProps {
  campaign: MetaCampaign;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function CampaignCard({
  campaign,
  expanded,
  onToggle,
  children,
}: CampaignCardProps) {
  return (
    <div className="glass card-hover rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-all duration-200 text-left"
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={campaign.status} />
          <div>
            <h3 className="font-medium text-foreground">
              {campaign.name}
            </h3>
            <p className="text-xs text-foreground-muted">
              {campaign.objective} &middot; Created{" "}
              {new Date(campaign.created_time).toLocaleDateString()}
            </p>
          </div>
        </div>
        <svg
          className={`h-4 w-4 text-foreground-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {expanded && <div className="border-t border-white/5 p-4 space-y-3">{children}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: "bg-emerald-500/15", text: "text-emerald-300" },
    PAUSED: { bg: "bg-yellow-500/15", text: "text-yellow-300" },
    ARCHIVED: { bg: "bg-white/5", text: "text-foreground-muted" },
    DELETED: { bg: "bg-red-500/15", text: "text-red-300" },
  };
  const c = config[status] ?? config.ARCHIVED;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      {status}
    </span>
  );
}
