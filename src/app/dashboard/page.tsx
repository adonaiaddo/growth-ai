"use client";

import { useEffect, useState } from "react";
import type { MetaCampaign, MetaAdSet, MetaAd } from "@/lib/meta/types";
import { CampaignCard } from "../components/campaign-card";
import { AdSetCard } from "../components/adset-card";
import { AdCard } from "../components/ad-card";
import { MetaConnectButton } from "../components/meta-connect-button";

interface DashboardData {
  campaigns: MetaCampaign[];
  adSets: MetaAdSet[];
  ads: MetaAd[];
  error?: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        setData({ campaigns: [], adSets: [], ads: [], error: "Failed to load" });
        setLoading(false);
      });
  }, []);

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  if (data?.error === "Not connected to Meta") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Connect your Meta account to view your dashboard
        </h2>
        <MetaConnectButton />
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="text-4xl">&#x26A0;&#xFE0F;</div>
        <h2 className="text-lg font-semibold text-red-400">
          Something went wrong
        </h2>
        <p className="text-sm text-foreground-muted max-w-md">
          {data.error}
        </p>
      </div>
    );
  }

  if (!data?.campaigns?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="text-4xl">&#x1F4CA;</div>
        <h2 className="text-lg font-semibold text-foreground">
          No campaigns yet
        </h2>
        <p className="text-sm text-foreground-muted max-w-md">
          Go to the Chat tab and ask Growth AI to create a campaign for you.
          Your campaigns will appear here with their ad sets, ads, and
          performance metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Campaigns
      </h2>
      <div className="space-y-3 max-w-3xl">
        {data.campaigns.map((campaign) => {
          const campaignAdSets = data.adSets.filter(
            (s) => s.campaign_id === campaign.id
          );
          return (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              expanded={expandedCampaigns.has(campaign.id)}
              onToggle={() => toggleCampaign(campaign.id)}
            >
              {campaignAdSets.length === 0 ? (
                <p className="text-xs text-foreground-muted">No ad sets</p>
              ) : (
                campaignAdSets.map((adSet) => {
                  const adSetAds = data.ads.filter(
                    (a) => a.adset_id === adSet.id
                  );
                  return (
                    <AdSetCard key={adSet.id} adSet={adSet}>
                      {adSetAds.map((ad) => (
                        <AdCard key={ad.id} ad={ad} />
                      ))}
                    </AdSetCard>
                  );
                })
              )}
            </CampaignCard>
          );
        })}
      </div>
    </div>
  );
}
