# PROJECT_BLUEPRINT — IDRISIUM Corp Facebook AI Bot

## 1) Overview
- Company: **IDRISIUM Corp.** — Offline-first, privacy-centric, high-performance. Motto: "Mafish 2alb.. Fi bas Talaga" (مفيش قلب.. في بس تلاجه).
- Founder & Lead Developer: **Idris Ghamid (18)** — contact: idris.ghamid@gmail.com | TikTok @idris.ghamid | Instagram @idris.ghamid | Telegram @IDRV72 | Website: http://idrisium.linkpc.net/ | GitHub: https://github.com/IDRISIUM.
- Goal: End-to-end intelligent Facebook page assistant (posts, comments, Messenger) powered by Gemini 2.5 Pro with real-time webhooks, scheduling, and analytics.
- Principles: Offline-first mindset (resilient caching/queueing), privacy-by-design (minimal PII, secure tokens), fast (<2s perceived load, >99.9% uptime target).

## 2) Architecture (high level)
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS 4 (dark-first UI). State: React Query (TanStack) + Zustand for local UI. Real-time via tRPC subscriptions / SSE. i18n (ar/en) ready.
- **Backend**: Node.js (18+/20+), Express for webhook endpoints + tRPC for typed API. Background jobs via BullMQ (Redis) or node-cron fallback. DI-friendly service layer.
- **Database**: MySQL/TiDB via Drizzle ORM. Tables: users, botSettings, fbPosts, fbComments, fbMessages, scheduledPosts, conversations, botActivity, webhooksLog, aiResponses.
- **AI**: Google Gemini 2.5 Pro (server-side) with personality profiles and safety controls. Prompt templates per persona with guardrails.
- **Facebook**: Graph API for posts/comments/messages; Webhook verification & signature validation.
- **Deployment**: Vercel for frontend; Backend as Vercel functions or container on Render/Fly. Managed MySQL/TiDB. Redis (managed) for queues & rate limiting.
- **Observability**: Pino structured logs, OpenTelemetry hooks (optional), request/response audit trails (PII-minimized).

## 3) UX & Brand (IDRISIUM Standard)
- Dark mode default: **#000000** background, neon green **#39FF14** primary, off-white **#EDEDED** headings, platinum **#A0A0A0** body, glassmorphism cards (radius 16-24px), strong geometric headings (Orbitron/Cairo), body Inter/Tajawal. Interactive feedback (scale/ripple). Arabic & English support. Avoid placeholders; real labels/text from AppStrings.
- Layouts: responsive grid, overflow-safe (SingleChildScrollView/overflow-auto), quick actions, stat widgets, charts.
- About/credits: include IDRISIUM Corp & Idris Ghamid attribution in app footer/About.

## 4) Key User Flows
1) **Onboarding**: Manus OAuth → Settings: Page ID + Access Token + Verify token + App Secret → Test connection → Select persona → Toggle auto-replies.
2) **Posts**: Create/preview → choose now/schedule/recurring (daily/weekly/monthly) → store scheduledJobs → worker publishes at due time → status updates + retries.
3) **Comments**: Webhook ingest → store comment → dedupe → generate Gemini reply (persona) → optional manual review → publish via Graph API → mark replied → stats update.
4) **Messenger**: Webhook ingest → load conversation context → Gemini reply with context window → send via Graph API → persist thread → mark state.
5) **Dashboard**: Real-time stats (posts/comments/messages counts, pending reply queues), charts (daily/weekly), quick actions, bot connectivity state.

## 5) Data Model (Drizzle / MySQL)
- users(id, email, name, locale, createdAt)
- botSettings(id, userId FK, pageId, accessToken, verifyToken, appSecret, persona, toneOverrides JSON, autoReplyComments bool, autoReplyMessages bool, language enum[ar,en], createdAt, updatedAt)
- fbPosts(id, userId FK, pageId, fbPostId, content, mediaUrls JSON, status enum[draft,scheduled,published,failed], scheduledAt, publishedAt, stats JSON{likes,comments,shares}, retryCount, error)
- scheduledPosts(id, postId FK, recurrence enum[none,daily,weekly,monthly], nextRunAt, lastRunAt, timezone)
- fbComments(id, fbCommentId, postId FK nullable, userId FK, message, fromName, fromId, status enum[new,replied,ignored], repliedAt, replyId, language)
- fbMessages(id, fbMessageId, conversationId FK, senderId, senderName, message, attachments JSON, direction enum[inbound,outbound], createdAt)
- conversations(id, userId FK, pageId, participantId, lastMessageAt, personaSnapshot JSON, state JSON)
- aiResponses(id, source enum[comment,message], sourceId, prompt, response, model, latencyMs, createdAt)
- botActivity(id, userId, type, refId, status, meta JSON, createdAt)
- webhooksLog(id, eventId, type, payload JSON, signatureValid bool, receivedAt)

## 6) Backend Modules
- **/server/services/facebook.ts**: Graph API client (posts, comments, messages, verify signature), rate-limit & retry with backoff.
- **/server/services/gemini.ts**: Prompt builder per persona + safety + context window, caches system prompts, streaming support.
- **/server/webhooks/facebook.ts**: GET verify (hub.verify_token), POST handler with signature check, routes events to comment/message pipelines.
- **/server/routers** (tRPC): posts (CRUD + schedule), comments (list/update/reply/manual approve), messages (threads, send), settings (get/update/test), stats (aggregations), health.
- **/server/jobs**: scheduled-posts processor, retry logic, backoff, activity logging.
- **/server/_core**: env validation (zod), logger, db client, queue client, auth middleware (JWT), error mapper.

## 7) Frontend Pages & Components
- Pages: Home, Dashboard, Settings, Posts, PostScheduler, Comments, Messages, Statistics.
- Components: PostCard, CommentCard, MessageCard, StatWidget, PostSchedulerForm, BotSettingsForm, PersonaSelector, ActivityLog, Charts (Recharts or Chart.js), Loader/Toast.
- State/query: React Query for server data; optimistic updates for settings and replies; websocket/SSE hooks for live stats.
- Theming: Tailwind config with IDRISIUM palette + typography tokens; glass panels; motion (framer-motion) for enter transitions.

## 8) Scheduling & Reliability
- Cron/worker runs every minute to dispatch due scheduledPosts. Use Redis queue with delayed jobs. Idempotent publish with dedupe keys per postId+scheduledAt. Retry with exponential backoff, cap attempts, alert on permanent failure. Activity log stored.

## 9) Security & Compliance
- Secrets only in env vars; never persisted. Facebook webhook signature validation (X-Hub-Signature-256). Verify-token challenge endpoint. Input validation (zod) on all tRPC procedures. Rate limiting per IP/user for public endpoints. PII minimization and encryption at rest for tokens. JWT auth for dashboard API. Audit trails for outbound calls.

## 10) Testing & Quality
- Unit: Vitest for services (facebook, gemini, schedulers).
- Integration: tRPC handlers + DB + Graph API mocks. Webhook signature tests.
- E2E: Playwright for main flows (login, settings, create post, schedule, auto-reply preview).
- Performance: k6 smoke for API latency; Lighthouse for frontend.

## 11) Deployment & Ops
- Env vars: FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN, FACEBOOK_VERIFY_TOKEN, FACEBOOK_APP_SECRET, GEMINI_API_KEY, DATABASE_URL, JWT_SECRET, NODE_ENV.
- CI: lint (eslint), typecheck (tsc), test (vitest), build (client/server). Preview deploy to Vercel. Migrations via Drizzle kit.

## 12) Risks & Mitigations
- Facebook API rate limits → queue + backoff + circuit breaker.
- Token expiry/revocation → health checks + refresh flows.
- AI hallucinations/toxicity → persona guardrails + safety filters + confidence thresholds + manual review option.
- Timezone errors in scheduling → store timezone per user, use UTC in DB, explicit conversions in UI.

## 13) Next Steps
1) Scaffold repo: pnpm workspaces (client/server), Vite React 19 + Tailwind 4 config, Express + tRPC setup, Drizzle schema.
2) Implement env validation & core libs, Facebook/Gemini service stubs with tests.
3) Build UI shell (dark theme, nav, About/credits), wire tRPC client, add pages/components skeleton.
4) Add schedulers, webhook handlers, analytics widgets, and E2E happy path.
