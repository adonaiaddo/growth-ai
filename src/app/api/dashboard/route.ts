import { NextResponse } from "next/server";
import { getMetaToken } from "@/lib/session";
import { MetaAPI } from "@/lib/meta/api";

export async function GET() {
  const token = await getMetaToken();
  if (!token) {
    return NextResponse.json(
      { error: "Not connected to Meta" },
      { status: 401 }
    );
  }

  try {
    const api = new MetaAPI(token);
    const accounts = await api.getAdAccounts();

    if (accounts.length === 0) {
      return NextResponse.json({ accounts: [], campaigns: [], adSets: [], ads: [] });
    }

    // Use first ad account
    const adAccountId = accounts[0].id;

    // Fetch sequentially to avoid redundant API calls
    const campaigns = await api.getCampaigns(adAccountId).catch(() => []);

    const adSetsByCampaign = await Promise.all(
      campaigns.map((c) => api.getAdSets(c.id).catch(() => []))
    );
    const adSets = adSetsByCampaign.flat();

    const adsByAdSet = await Promise.all(
      adSets.map((s) => api.getAds(s.id).catch(() => []))
    );
    const ads = adsByAdSet.flat();

    return NextResponse.json({
      accounts,
      campaigns,
      adSets,
      ads,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
