"use client";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-white/[0.03] border border-white/5 animate-pulse ${className}`} />
  );
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[88px]" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <Skeleton className="h-[300px]" />;
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <MetricsGridSkeleton />
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  );
}
