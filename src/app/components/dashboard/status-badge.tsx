"use client";

const STATUS_CONFIGS: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400 status-dot-glow text-emerald-400" },
  PAUSED: { bg: "bg-yellow-500/15", text: "text-yellow-300", dot: "bg-yellow-400 status-dot-glow text-yellow-400" },
  ARCHIVED: { bg: "bg-white/5", text: "text-foreground-muted", dot: "bg-zinc-400" },
  DELETED: { bg: "bg-red-500/15", text: "text-red-300", dot: "bg-red-400 status-dot-glow text-red-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.ARCHIVED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const c = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.ARCHIVED;
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${c.dot}`}
      title={status}
    />
  );
}
