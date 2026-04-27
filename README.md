# Growth AI

Conversational AI for Meta Ads management. Chat with an AI agent that researches your product, generates ad copy and images, builds targeting strategies, and creates full campaigns on Meta — all through natural conversation.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Vercel AI SDK** for streaming chat + tool calls
- **OpenAI** — GPT-5-mini for chat, DALL-E 3 for image generation
- **Tavily** for web search and webpage scraping
- **Meta Marketing API v21.0** for campaign management
- **Tailwind CSS 4**

---

## Prerequisites

Before running the app, you need accounts and API keys from three services:

| Service | What you need | Where to get it |
|---------|--------------|-----------------|
| **OpenAI** | API key | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Tavily** | API key | [app.tavily.com](https://app.tavily.com) |
| **Meta** | App ID + App Secret | [developers.facebook.com](https://developers.facebook.com) |
| **ngrok** | Tunnel for local OAuth | [ngrok.com](https://ngrok.com) |

---

## 1. Create a Meta App

The Meta App handles OAuth so users can connect their ad accounts.

### Step 1: Create the app

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App**
2. Select **"Other"** as the app type, then **"Business"**
3. Name it (e.g., "Growth AI") and create

### Step 2: Add Facebook Login

1. In the left sidebar, click **Use cases** → **Add use case**
2. Add **"Facebook Login for Business"**
3. Under Facebook Login → **Settings**, add your redirect URI:
   ```
   https://YOUR-NGROK-SUBDOMAIN.ngrok-free.app/api/meta/callback
   ```
   (You'll get this URL in step 3 below — come back and add it after starting ngrok)

### Step 3: Add Marketing API use cases

1. Go to **Use cases** → add these:
   - **Create & manage ads with Marketing API**
   - **Measure ad performance data with Marketing API**

### Step 4: Configure required permissions

In the app's **Permissions** section, make sure these are granted:

| Permission | Purpose |
|-----------|---------|
| `ads_management` | Create/edit campaigns, ad sets, ads |
| `ads_read` | Read campaign data and insights |
| `pages_show_list` | List available Facebook Pages |
| `pages_read_engagement` | Read Page details for ad creatives |
| `business_management` | Access business-level pages and accounts |

### Step 5: Set Privacy Policy URL

1. Go to **App settings** → **Basic**
2. Add a **Privacy Policy URL** (required to publish the app)
3. Save changes

### Step 6: Publish the app

1. In the left sidebar, click **Publish**
2. Click the **Publish** button

> **This step is critical.** If the app stays in Development Mode, you can create campaigns and ad sets but `createAdCreative` will fail with error 1885183: *"app is in development mode."* Publishing the app fixes this.

### Step 7: Copy your credentials

From **App settings** → **Basic**, copy:
- **App ID** → goes in `META_APP_ID`
- **App Secret** → goes in `META_APP_SECRET`

---

## 2. Set Up ngrok

Meta OAuth requires HTTPS redirect URIs. ngrok tunnels your local dev server.

### Install ngrok

```bash
# macOS
brew install ngrok

# or download from https://ngrok.com/download
```

### Create a tunnel

```bash
ngrok http 3000
```

This gives you a URL like:
```
https://a1b2-203-0-113-42.ngrok-free.app
```

### Add the callback URL to Meta

Take your ngrok URL and append `/api/meta/callback`. Add this as a **Valid OAuth Redirect URI** in your Meta App:

1. Meta App Dashboard → **Facebook Login** → **Settings**
2. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://YOUR-SUBDOMAIN.ngrok-free.app/api/meta/callback
   ```
3. Save

> **Tip:** ngrok free tier gives you a random subdomain each time you restart. If you have a paid plan, use a stable subdomain: `ngrok http --subdomain=my-growth-ai 3000`

---

## 3. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# OpenAI — powers the chat agent (GPT-5-mini) and image generation (DALL-E 3)
OPENAI_API_KEY=sk-...

# Tavily — web search and webpage scraping for product research
TAVILY_API_KEY=tvly-...

# Meta App credentials (from developers.facebook.com → App Settings → Basic)
META_APP_ID=123456789
META_APP_SECRET=abc123...

# Meta OAuth redirect — must match EXACTLY what you added in Meta App Dashboard
# This is your ngrok URL + /api/meta/callback
META_REDIRECT_URI=https://YOUR-SUBDOMAIN.ngrok-free.app/api/meta/callback

# Your local app URL (no trailing slash)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Environment variable reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-5-mini and DALL-E 3 |
| `TAVILY_API_KEY` | Yes | Tavily API key for web search/scraping |
| `META_APP_ID` | Yes | Facebook App ID |
| `META_APP_SECRET` | Yes | Facebook App Secret |
| `META_REDIRECT_URI` | Yes | Full OAuth callback URL (ngrok + `/api/meta/callback`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL of the app (`http://localhost:3000` for dev) |

---

## 4. Install and Run

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

Make sure ngrok is running in a separate terminal (`ngrok http 3000`) before trying to connect a Meta account.

---

## 5. Connect Your Meta Account

1. Open the app at `http://localhost:3000`
2. Click **"Connect Meta Account"** in the sidebar
3. Facebook OAuth dialog opens — log in and grant permissions
4. **Important:** During the Facebook login flow, make sure to select the Facebook Pages and Ad Accounts you want to use
5. After authorization, you're redirected back to the app with a connected account

The app exchanges the short-lived token for a long-lived token (~60 days). Tokens are stored in server memory — restarting the dev server clears them and you'll need to reconnect.

---

## 6. OpenAI Rate Limits

The agent makes multiple tool calls per conversation turn. The default OpenAI rate limits for GPT-4o (30,000 TPM) are too low for this app.

**Recommended setup:**
- Use `gpt-5-mini` (default) — 500,000 TPM
- Or increase your OpenAI rate limit tier at [platform.openai.com](https://platform.openai.com/settings/organization/limits)

To change the model, edit `src/lib/ai/model.ts`:

```typescript
const MODEL_ID = "gpt-5-mini"; // Change to gpt-4o, gpt-4.1-mini, etc.
```

---

## How It Works

### Conversation flow

The AI agent follows a structured 3-phase workflow:

1. **Research & Discovery** — Scrapes websites, searches the web, analyzes the product and market
2. **Strategy & Creative** — Generates targeting recommendations, ad copy (multiple variations using different copywriting frameworks), and ad images via DALL-E 3
3. **Execution** — After explicit user approval, creates the full campaign chain on Meta:
   - Select Ad Account → Select Page → Fetch Pixels (for conversion campaigns) → Search Interests → Create Campaign → Create Ad Set → Upload Image → Create Ad Creative → Create Ad

All ads are created in **PAUSED** status. Nothing goes live without you manually activating it in Meta Ads Manager.

### AI tools

| Tool | Description |
|------|-------------|
| `webSearch` | Search the web via Tavily |
| `scrapeWebpage` | Extract content from a URL |
| `suggestTargeting` | AI-powered audience targeting recommendations |
| `generateAdCopy` | Generate multiple ad copy variations |
| `generateAdImage` | Generate images via DALL-E 3 |
| `checkMetaConnection` | Verify Meta account is linked |
| `disconnectMeta` | Unlink current Meta account |
| `getAdAccounts` | List user's ad accounts |
| `getPages` | List Facebook Pages available for ads |
| `getPixels` | List Meta Pixels for conversion tracking |
| `createPixel` | Create a new Meta Pixel |
| `searchInterests` | Look up valid interest IDs from Meta's targeting database |
| `createCampaign` | Create a campaign |
| `createAdSet` | Create an ad set with targeting and budget |
| `createAdCreative` | Upload image + create creative with copy |
| `createAd` | Link creative to ad set (final step) |
| `getCampaigns` | List existing campaigns |
| `getAdSets` | List ad sets for a campaign |
| `getAds` | List ads in an ad set |
| `getAdInsights` | Pull performance metrics |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with sidebar
│   ├── page.tsx                   # Main chat page
│   ├── globals.css                # Tailwind CSS
│   ├── dashboard/page.tsx         # Campaign dashboard
│   ├── api/
│   │   ├── chat/route.ts          # POST: AI chat streaming endpoint
│   │   ├── dashboard/route.ts     # GET: campaign data for dashboard
│   │   ├── transcribe/route.ts    # POST: audio transcription
│   │   └── meta/
│   │       ├── auth/route.ts      # GET: initiate OAuth flow
│   │       ├── callback/route.ts  # GET: OAuth callback + token exchange
│   │       └── status/route.ts    # GET: check connection status
│   └── components/
│       ├── chat.tsx               # Chat UI (useChat hook)
│       ├── message-bubble.tsx     # Message rendering + markdown
│       ├── tool-result-card.tsx   # Collapsible tool result cards
│       ├── tool-display-config.ts # Tool icons and labels
│       ├── meta-connect-button.tsx
│       └── nav.tsx                # Sidebar navigation
├── lib/
│   ├── meta/
│   │   ├── api.ts                 # MetaAPI class (Graph API v21.0 wrapper)
│   │   ├── oauth.ts               # OAuth helpers, scopes, CSRF state
│   │   └── types.ts               # Meta API TypeScript types
│   ├── ai/
│   │   ├── tools.ts               # All AI agent tool definitions
│   │   ├── creative.ts            # DALL-E 3 image generation + local caching
│   │   ├── system-prompt.ts       # Agent persona and workflow rules
│   │   ├── model.ts               # LLM model config + rate limit retry
│   │   └── web-search.ts          # Tavily search + scrape wrappers
│   └── session.ts                 # In-memory token storage
└── types/index.ts                 # Shared TypeScript types
```

---

## Troubleshooting

### "App is in development mode" (error 1885183)

Your Meta App isn't published. Go to developers.facebook.com → your app → **Publish** → set a Privacy Policy URL → click **Publish**.

### "Invalid Scopes: pages_manage_ads"

This is not a valid Facebook Login scope. The app uses `pages_show_list` and `pages_read_engagement` instead. If you see this error during OAuth, the scopes in `src/lib/meta/oauth.ts` need to be checked.

### No Facebook Pages found

During the Facebook OAuth login flow, make sure you select the Pages you want to use. If you skipped this:
1. In the app, ask the AI to "disconnect my Meta account"
2. Reconnect and this time select your Pages in the permission dialog

### OAuth redirect mismatch

The `META_REDIRECT_URI` in `.env.local` must **exactly** match what's in your Meta App Dashboard under Facebook Login → Settings → Valid OAuth Redirect URIs. If you restart ngrok (free tier), you get a new subdomain — update both `.env.local` and the Meta App Dashboard.

### Rate limit errors (429)

The app includes retry logic with exponential backoff, but if you hit persistent 429s:
- Check your OpenAI usage tier at [platform.openai.com](https://platform.openai.com)
- Switch to a model with higher TPM limits (gpt-5-mini has 500k TPM vs gpt-4o at 30k TPM)

### DALL-E image URL expired (HTTP 409)

DALL-E image URLs use temporary Azure SAS tokens that expire. The app caches generated images to disk (`/tmp/growth-ai-images/`) immediately after generation. If the cache was cleared, regenerate the image.

### "Bid amount or bid constraints required"

The app sets `bid_strategy: "LOWEST_COST_WITHOUT_CAP"` by default. If the agent tries to use `LINK_CLICKS` billing, it must provide a `bidAmount` in cents.

### "Select a promoted object for your ad set"

Conversion campaigns (`OFFSITE_CONVERSIONS`, `VALUE`) require a `promoted_object` with `pixel_id`. The agent has a validation guard for this. If you see the error, tell the agent to "fetch my pixels first."

### Token cleared after dev server restart

Tokens are stored in server memory (`globalThis`). Restarting `npm run dev` clears them. Just click "Connect Meta Account" again to re-authenticate.
