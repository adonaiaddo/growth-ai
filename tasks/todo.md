# Growth AI — MVP Implementation Tracker

## Phase 0: Documentation
- [x] Create CLAUDE.md with project directives
- [x] Create docs/ARCHITECTURE.md with full plan
- [x] Create tasks/todo.md
- [x] Initialize git repo + .gitignore

## Phase 1: Project Scaffolding + Chat UI
- [x] Create Next.js 15 app (TypeScript, Tailwind, App Router)
- [x] Install deps: ai, @ai-sdk/openai, @ai-sdk/react, zod, openai
- [x] Create /api/chat/route.ts with streamText
- [x] Create chat.tsx with useChat hook
- [x] Create message-bubble.tsx
- [x] Verify: TypeScript passes, build succeeds

## Phase 2: AI Creative Tools
- [x] Create lib/ai/model.ts (LLM provider config)
- [x] Create lib/ai/system-prompt.ts (agent persona)
- [x] Create lib/ai/creative.ts (DALL-E wrapper)
- [x] Create lib/ai/tools.ts (generateAdCopy, generateAdImage, suggestTargeting)
- [x] Wire tools into /api/chat/route.ts
- [x] Update message-bubble.tsx for inline images

## Phase 3: Meta OAuth Flow
- [x] Create lib/meta/oauth.ts (URL builder + token exchange)
- [x] Create lib/session.ts (cookie helpers)
- [x] Create /api/meta/auth/route.ts
- [x] Create /api/meta/callback/route.ts
- [x] Create /api/meta/status/route.ts
- [x] Create meta-connect-button.tsx

## Phase 4: Meta API + Full Pipeline
- [x] Create lib/meta/types.ts
- [x] Create lib/meta/api.ts (MetaAPI class)
- [x] Add create tools (campaign, ad set, creative, ad)
- [x] Add read tools (getCampaigns, getAdSets, getAds, getAdInsights)
- [x] Add checkMetaConnection, getAdAccounts tools
- [x] Create tool-result-card.tsx

## Phase 5: Dashboard
- [x] Create nav.tsx (sidebar)
- [x] Update layout.tsx with sidebar
- [x] Create /api/dashboard/route.ts
- [x] Create dashboard/page.tsx
- [x] Create campaign-card.tsx, adset-card.tsx, ad-card.tsx
- [x] Add status badges and expand/collapse

## Phase 6: Polish
- [x] Error handling in chat route (try/catch + maxDuration)
- [x] Lazy-init OpenAI clients (build-time safety)
- [x] Auto-scroll on new messages
- [x] Stop button for streaming
- [x] Loading skeleton for dashboard
- [x] Empty state for dashboard (no campaigns / not connected)

## Build Verification
- [x] `npx tsc --noEmit` — 0 errors
- [x] `npm run build` — clean build, all routes compiled
