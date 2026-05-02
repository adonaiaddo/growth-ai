"use client";

import type { MetaAdAccount } from "@/lib/meta/types";

const ACCOUNT_STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Active", color: "text-emerald-300" },
  2: { label: "Disabled", color: "text-red-300" },
  3: { label: "Unsettled", color: "text-yellow-300" },
  7: { label: "Pending Risk Review", color: "text-orange-300" },
  8: { label: "Pending Settlement", color: "text-yellow-300" },
  9: { label: "In Grace Period", color: "text-yellow-300" },
  100: { label: "Pending Closure", color: "text-red-300" },
  101: { label: "Closed", color: "text-foreground-muted" },
  201: { label: "Any Active", color: "text-emerald-300" },
  202: { label: "Any Closed", color: "text-foreground-muted" },
};

interface AccountsListProps {
  accounts: MetaAdAccount[];
  onSelect: (account: MetaAdAccount) => void;
}

export function AccountsList({ accounts, onSelect }: AccountsListProps) {
  if (!accounts.length) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-3">
        <p className="text-foreground-muted text-sm">No ad accounts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Ad Accounts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map((account) => {
          const status = ACCOUNT_STATUS_MAP[account.account_status] ?? {
            label: `Status ${account.account_status}`,
            color: "text-foreground-muted",
          };
          return (
            <button
              key={account.id}
              onClick={() => onSelect(account)}
              className="glass card-hover rounded-xl p-4 text-left transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground truncate group-hover:text-violet-300 transition-colors">
                    {account.name || `Account ${account.account_id}`}
                  </h3>
                  <p className="text-xs text-foreground-muted mt-1 font-mono">
                    {account.account_id}
                  </p>
                </div>
                <svg className="h-4 w-4 text-foreground-muted/50 shrink-0 mt-1 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs">
                <span className={status.color}>{status.label}</span>
                <span className="text-foreground-muted">{account.currency}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
