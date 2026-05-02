"use client";

import { useState, useCallback } from "react";
import type { MetaAdAccount, MetaCampaign, MetaAdSet, DatePreset, BreadcrumbItem, DashboardLevel } from "@/lib/meta/types";
import { useDashboardData } from "@/app/hooks/use-dashboard-data";
import { Breadcrumbs } from "../components/dashboard/breadcrumbs";
import { DateRangePicker } from "../components/dashboard/date-range-picker";
import { AccountsList } from "../components/dashboard/accounts-list";
import { CampaignsView } from "../components/dashboard/campaigns-view";
import { AdSetsView } from "../components/dashboard/adsets-view";
import { AdsView } from "../components/dashboard/ads-view";
import { MetaConnectButton } from "../components/meta-connect-button";

interface AccountsResponse {
  accounts: MetaAdAccount[];
  error?: string;
}

export default function DashboardPage() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [datePreset, setDatePreset] = useState<DatePreset>("last_7d");

  const { data, loading, error } = useDashboardData<AccountsResponse>("/api/dashboard");

  const currentLevel: DashboardLevel = breadcrumbs.length === 0
    ? "accounts"
    : breadcrumbs[breadcrumbs.length - 1].level;

  const currentId = breadcrumbs.length > 0
    ? breadcrumbs[breadcrumbs.length - 1].id
    : null;

  const handleNavigate = useCallback((index: number) => {
    if (index < 0) {
      setBreadcrumbs([]);
    } else {
      setBreadcrumbs((prev) => prev.slice(0, index + 1));
    }
  }, []);

  const drillDown = useCallback((level: DashboardLevel, id: string, label: string) => {
    setBreadcrumbs((prev) => [...prev, { level, id, label }]);
  }, []);

  const handleSelectAccount = useCallback((account: MetaAdAccount) => {
    drillDown("account", account.id, account.name || `Account ${account.account_id}`);
  }, [drillDown]);

  const handleSelectCampaign = useCallback((campaign: MetaCampaign) => {
    drillDown("campaign", campaign.id, campaign.name);
  }, [drillDown]);

  const handleSelectAdSet = useCallback((adSet: MetaAdSet) => {
    drillDown("adset", adSet.id, adSet.name);
  }, [drillDown]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-4 w-full max-w-2xl px-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Not connected
  if (error === "HTTP 401" || data?.error === "Not connected to Meta") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Connect your Meta account to view your dashboard
        </h2>
        <MetaConnectButton />
      </div>
    );
  }

  // Error
  if (error || data?.error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
        <p className="text-sm text-foreground-muted max-w-md">
          {error ?? data?.error}
        </p>
      </div>
    );
  }

  const accounts = data?.accounts ?? [];

  return (
    <div className="h-full overflow-y-auto">
      {/* Toolbar */}
      {breadcrumbs.length > 0 && (
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
            <div className="sm:ml-auto">
              <DateRangePicker value={datePreset} onChange={setDatePreset} />
            </div>
          </div>
        </div>
      )}

      {/* Date picker for accounts level */}
      {breadcrumbs.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {currentLevel === "accounts" && (
          <AccountsList accounts={accounts} onSelect={handleSelectAccount} />
        )}

        {currentLevel === "account" && currentId && (
          <CampaignsView
            accountId={currentId}
            datePreset={datePreset}
            onSelectCampaign={handleSelectCampaign}
          />
        )}

        {currentLevel === "campaign" && currentId && (
          <AdSetsView
            campaignId={currentId}
            datePreset={datePreset}
            onSelectAdSet={handleSelectAdSet}
          />
        )}

        {currentLevel === "adset" && currentId && (
          <AdsView adSetId={currentId} datePreset={datePreset} />
        )}
      </div>
    </div>
  );
}
