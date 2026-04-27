"use client";

import { useEffect, useState } from "react";

export function MetaConnectButton() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/meta/status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setConnected(data.connected);
      })
      .catch(() => {
        if (!cancelled) setConnected(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (connected === null) return null;

  if (connected) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 ring-1 ring-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-300">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 status-dot-glow text-emerald-400" />
        Meta Account Connected
      </div>
    );
  }

  return (
    <a
      href="/api/meta/auth"
      className="inline-flex items-center gap-2 rounded-lg bg-white/[0.08] border border-white/[0.12] px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.12] hover:border-white/[0.18] active:scale-[0.98] transition-all duration-200"
    >
      <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
      </svg>
      Connect Meta Account
    </a>
  );
}
