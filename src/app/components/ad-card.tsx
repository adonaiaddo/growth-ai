"use client";

import type { MetaAd } from "@/lib/meta/types";

interface AdCardProps {
  ad: MetaAd;
}

export function AdCard({ ad }: AdCardProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.02] backdrop-blur-sm p-3 transition-all duration-200 hover:border-white/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.05)]">
      {ad.creative?.thumbnail_url && (
        <img
          src={ad.creative.thumbnail_url}
          alt={ad.creative.title ?? "Ad preview"}
          className="h-16 w-16 rounded-md object-cover flex-shrink-0 ring-1 ring-white/10"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <StatusDot status={ad.status} />
          <span className="text-sm font-medium text-foreground truncate">
            {ad.name}
          </span>
        </div>
        {ad.creative?.title && (
          <p className="text-xs text-foreground-muted mt-1 truncate">
            {ad.creative.title}
          </p>
        )}
        {ad.creative?.body && (
          <p className="text-xs text-foreground-muted mt-0.5 line-clamp-2">
            {ad.creative.body}
          </p>
        )}
      </div>
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
