import { NextRequest, NextResponse } from "next/server";
import { getMetaToken } from "@/lib/session";
import { MetaAPI } from "@/lib/meta/api";
import type { InsightParams, MetaInsightsFull } from "@/lib/meta/types";

type Params = { params: Promise<{ entityType: string; entityId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const token = await getMetaToken();
  if (!token) {
    return NextResponse.json({ error: "Not connected to Meta" }, { status: 401 });
  }

  const { entityType, entityId } = await params;
  const searchParams = req.nextUrl.searchParams;
  const insightParams: InsightParams = {};

  const datePreset = searchParams.get("datePreset");
  if (datePreset) insightParams.datePreset = datePreset as InsightParams["datePreset"];

  const since = searchParams.get("since");
  const until = searchParams.get("until");
  if (since) {
    insightParams.since = since;
    insightParams.until = until ?? since;
  }

  const api = new MetaAPI(token);

  try {
    switch (entityType) {
      case "account":
        return NextResponse.json(await handleAccount(api, entityId, insightParams));
      case "campaign":
        return NextResponse.json(await handleCampaign(api, entityId, insightParams));
      case "adset":
        return NextResponse.json(await handleAdSet(api, entityId, insightParams));
      case "ad":
        return NextResponse.json(await handleAd(api, entityId, insightParams));
      default:
        return NextResponse.json({ error: `Unknown entity type: ${entityType}` }, { status: 400 });
    }
  } catch (error) {
    console.error(`Dashboard ${entityType}/${entityId} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch data" },
      { status: 500 }
    );
  }
}

async function handleAccount(api: MetaAPI, accountId: string, params: InsightParams) {
  const [campaigns, accountInsights, accountTimeSeries] = await Promise.all([
    api.getCampaignsPaginated(accountId),
    api.getInsightsFull(accountId, params).catch(() => null),
    api.getInsightsTimeSeries(accountId, params).catch(() => []),
  ]);

  const campaignInsightsResults = await Promise.allSettled(
    campaigns.map((c) => api.getInsightsFull(c.id, params))
  );

  const campaignInsights: Record<string, MetaInsightsFull | null> = {};
  campaigns.forEach((c, i) => {
    const result = campaignInsightsResults[i];
    campaignInsights[c.id] = result.status === "fulfilled" ? result.value : null;
  });

  return { campaigns, accountInsights, accountTimeSeries, campaignInsights };
}

async function handleCampaign(api: MetaAPI, campaignId: string, params: InsightParams) {
  const [adSets, campaignInsights, campaignTimeSeries] = await Promise.all([
    api.getAdSetsPaginated(campaignId),
    api.getInsightsFull(campaignId, params).catch(() => null),
    api.getInsightsTimeSeries(campaignId, params).catch(() => []),
  ]);

  const adSetInsightsResults = await Promise.allSettled(
    adSets.map((s) => api.getInsightsFull(s.id, params))
  );

  const adSetInsights: Record<string, MetaInsightsFull | null> = {};
  adSets.forEach((s, i) => {
    const result = adSetInsightsResults[i];
    adSetInsights[s.id] = result.status === "fulfilled" ? result.value : null;
  });

  return { adSets, campaignInsights, campaignTimeSeries, adSetInsights };
}

async function handleAdSet(api: MetaAPI, adSetId: string, params: InsightParams) {
  const [ads, adSetInsights, adSetTimeSeries] = await Promise.all([
    api.getAdsPaginated(adSetId),
    api.getInsightsFull(adSetId, params).catch(() => null),
    api.getInsightsTimeSeries(adSetId, params).catch(() => []),
  ]);

  const adInsightsResults = await Promise.allSettled(
    ads.map((a) => api.getInsightsFull(a.id, params))
  );

  const adInsights: Record<string, MetaInsightsFull | null> = {};
  ads.forEach((a, i) => {
    const result = adInsightsResults[i];
    adInsights[a.id] = result.status === "fulfilled" ? result.value : null;
  });

  return { ads, adSetInsights, adSetTimeSeries, adInsights };
}

async function handleAd(api: MetaAPI, adId: string, params: InsightParams) {
  const [adInsights, adTimeSeries] = await Promise.all([
    api.getInsightsFull(adId, params).catch(() => null),
    api.getInsightsTimeSeries(adId, params).catch(() => []),
  ]);

  return { adInsights, adTimeSeries };
}
