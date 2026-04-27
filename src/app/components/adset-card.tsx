"use client";

import type { MetaAdSet } from "@/lib/meta/types";

interface AdSetCardProps {
  adSet: MetaAdSet;
  children?: React.ReactNode;
}

export function AdSetCard({ adSet, children }: AdSetCardProps) {
  const budget = adSet.daily_budget
    ? `$${(parseInt(adSet.daily_budget) / 100).toFixed(2)}/day`
    : "No budget set";

  const countries =
    adSet.targeting?.geo_locations?.countries?.join(", ") ?? "\u2014";
  const ageRange = `${adSet.targeting?.age_min ?? "\u2014"}-${adSet.targeting?.age_max ?? "\u2014"}`;

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] backdrop-blur-sm p-3 transition-all duration-200 hover:border-white/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.05)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusDot status={adSet.status} />
          <span className="text-sm font-medium text-foreground">
            {adSet.name}
          </span>
        </div>
        <span className="text-xs text-foreground-muted font-mono">
          {budget}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-foreground-muted">
        <span>Countries: {countries}</span>
        <span>Age: {ageRange}</span>
        <span>Goal: {adSet.optimization_goal}</span>
      </div>
      {children && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-emerald-400 status-dot-glow text-emerald-400",
    PAUSED: "bg-yellow-400 status-dot-glow text-yellow-400",
    ARCHIVED: "bg-zinc-400",
    DELETED: "bg-red-400 status-dot-glow text-red-400",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colors[status] ?? "bg-zinc-400"}`}
      title={status}
    />
  );
}
