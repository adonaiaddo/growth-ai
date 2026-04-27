const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

const SCOPES = [
  "ads_management",
  "ads_read",
  "pages_show_list",
  "pages_read_engagement",
  "business_management",
].join(",");

/**
 * Server-side CSRF state store.
 * Attached to globalThis to survive HMR in development.
 * Each entry stores a timestamp so we can expire stale tokens.
 */
const g = globalThis as unknown as { _oauthStates?: Map<string, number> };
if (!g._oauthStates) g._oauthStates = new Map();
const pendingStates = g._oauthStates;

/** Max age for a pending state token (10 minutes) */
const STATE_MAX_AGE_MS = 10 * 60 * 1000;

export function buildMetaOAuthUrl(): { url: string; state: string } {
  // Clean up expired states
  const now = Date.now();
  for (const [key, ts] of pendingStates) {
    if (now - ts > STATE_MAX_AGE_MS) pendingStates.delete(key);
  }

  const state = crypto.randomUUID();
  pendingStates.set(state, now);

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    scope: SCOPES,
    response_type: "code",
    state,
  });

  return {
    url: `https://www.facebook.com/v21.0/dialog/oauth?${params}`,
    state,
  };
}

export function validateOAuthState(state: string): boolean {
  const ts = pendingStates.get(state);
  pendingStates.delete(state); // one-time use
  if (!ts) return false;
  return Date.now() - ts < STATE_MAX_AGE_MS;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  // Exchange code for short-lived token
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    code,
  });

  const res = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?${params}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  // Exchange for long-lived token (~60 days)
  const longLivedParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: data.access_token,
  });

  const longRes = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?${longLivedParams}`
  );
  const longData = await longRes.json();

  if (longData.error) {
    throw new Error(longData.error.message);
  }

  return longData.access_token;
}
