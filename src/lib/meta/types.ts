export interface MetaAdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  created_time: string;
}

export interface MetaAdSet {
  id: string;
  name: string;
  campaign_id: string;
  daily_budget: string;
  status: string;
  targeting: {
    age_min?: number;
    age_max?: number;
    geo_locations?: { countries?: string[] };
    flexible_spec?: Array<{ interests?: Array<{ id: string; name: string }> }>;
  };
  optimization_goal: string;
}

export interface MetaAd {
  id: string;
  name: string;
  adset_id: string;
  status: string;
  creative?: {
    id: string;
    thumbnail_url?: string;
    title?: string;
    body?: string;
  };
}

export interface MetaInsights {
  impressions: string;
  clicks: string;
  spend: string;
  ctr: string;
  date_start: string;
  date_stop: string;
}

export interface MetaApiError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}
