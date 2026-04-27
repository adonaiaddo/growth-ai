# Growth AI — Architecture

## Overview
Conversational AI app for Meta Ads management. Users chat with an AI agent that creates campaigns, ad sets, and ads with AI-generated creative (copy, images, targeting).

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Vercel AI SDK** (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
- **OpenAI** (GPT-4o for chat, DALL-E 3 for images)
- **Tailwind CSS 4**
- **Zod** for tool input validation
- **No database** — cookies store Meta access token
- **No Meta SDK** — direct fetch to Graph API

## Project Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout with sidebar nav
│   ├── page.tsx                # Main chat page
│   ├── globals.css             # Tailwind imports
│   ├── dashboard/page.tsx      # Dashboard page
│   ├── api/
│   │   ├── chat/route.ts       # POST: streamText + tools
│   │   ├── dashboard/route.ts  # GET: fetch campaigns/adsets/ads
│   │   └── meta/
│   │       ├── auth/route.ts   # GET: redirect to Meta OAuth
│   │       ├── callback/route.ts # GET: exchange code → token
│   │       └── status/route.ts # GET: check Meta connection
│   └── components/
│       ├── chat.tsx            # Chat UI (useChat)
│       ├── message-bubble.tsx  # Message rendering
│       ├── tool-result-card.tsx
│       ├── meta-connect-button.tsx
│       ├── campaign-card.tsx
│       ├── adset-card.tsx
│       ├── ad-card.tsx
│       └── nav.tsx             # Sidebar navigation
├── lib/
│   ├── meta/
│   │   ├── api.ts              # MetaAPI class
│   │   ├── oauth.ts            # OAuth helpers
│   │   └── types.ts            # Meta API types
│   ├── ai/
│   │   ├── tools.ts            # All agent tool definitions
│   │   ├── creative.ts         # DALL-E wrapper
│   │   ├── system-prompt.ts    # Agent persona
│   │   └── model.ts            # LLM provider config
│   └── session.ts              # Cookie-based token helpers
└── types/index.ts              # Shared types
```

## AI Tools
| Tool | Purpose |
|------|---------|
| checkMetaConnection | Verify account is linked |
| getAdAccounts | List user's ad accounts |
| suggestTargeting | AI-suggest audience |
| generateAdCopy | AI-generate headline, text, CTA |
| generateAdImage | DALL-E 3 image generation |
| createCampaign | Create campaign |
| createAdSet | Create ad set with targeting |
| createAdCreative | Create creative with copy + image |
| createAd | Link creative to ad set |
| getCampaigns | Fetch campaigns |
| getAdSets | Fetch ad sets |
| getAds | Fetch ads |
| getAdInsights | Fetch performance metrics |

## Key Design Decisions
- Ads default to PAUSED (real money involved)
- AI tools work without Meta account connected
- Human-in-the-loop for all creative approval
- Provider-agnostic LLM via Vercel AI SDK
- stepCountIs(15) for multi-tool workflows
- Long-lived token exchange in OAuth callback (~60 days)

## Environment Variables
```
OPENAI_API_KEY=           # GPT-4o + DALL-E 3
META_APP_ID=              # Meta App Dashboard
META_APP_SECRET=          # Meta App Dashboard
META_REDIRECT_URI=        # Must match Meta App settings (ngrok for local dev)
NEXT_PUBLIC_APP_URL=      # http://localhost:3000
```
