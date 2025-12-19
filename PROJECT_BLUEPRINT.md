# IDRISIUM Corp — Facebook AI Bot (Offline-First, Privacy-Centric)
**Brand**: IDRISIUM Corp — “Mafish 2alb.. Fi bas Talaga”  
**Founder**: Idris Ghamid (Founder & Lead Developer)  
**Principles**: Offline-First, Privacy-Centric, High-Performance

## 1) Vision & Outcomes
- Real-time AI agent (Gemini 2.5 Pro) for Facebook Page posts, comments, and Messenger.
- Deterministic scheduling (minute-level) with retries & audit trails.
- Dual-language UX (AR/EN), dark-first UI (pure black background, neon green accent).
- Full separation: `/client` (frontend) and `/server` (backend). All secrets live in backend.

## 2) Tech Stack
- **Frontend**: React 19 + Vite + TypeScript + Tailwind (IDRISIUM design system). Routing via React Router. Charts via Chart.js or Recharts.
- **Backend**: Node.js 18+, Express + tRPC, Drizzle ORM (MySQL/TiDB), serverless-compatible (Vercel). Cron via Vercel Cron hitting a processing endpoint. Queue/retry via idempotent records + retry counters.
- **AI**: Google Gemini 2.5 Pro (REST). Persona system applied to prompts.
- **Data**: MySQL/TiDB. Drizzle migrations under `/server/drizzle`.
- **Auth**: Manus OAuth (user-provided), JWT for sessions. (Stub to be wired).
- **Infra**: Vercel static frontend + serverless backend (`@vercel/node`). Webhooks exposed at `/api/webhook/facebook`.

## 3) Domain Model (Drizzle/MySQL)
- `users`: id, email, name, locale, createdAt.
- `botSettings`: userId FK, pageId, accessToken, verifyToken, appSecret, persona, autoReplyComments, autoReplyMessages, language, createdAt, updatedAt.
- `fbPosts`: id, userId FK, pagePostId, message, mediaUrl, status (draft|scheduled|posted|failed), scheduledFor, postedAt, stats (likes, comments, shares), lastError, createdAt, updatedAt.
- `scheduledPosts`: id, userId FK, fbPostId FK, scheduleType (once|daily|weekly|monthly), nextRunAt, retryCount, lastRunAt.
- `fbComments`: id, fbCommentId, fbPostId FK, userId FK, message, fromName, status (new|answered|ignored), repliedAt, createdAt.
- `fbMessages`: id, fbMessageId, conversationId FK, userId FK, senderId, text, status (new|answered|ignored), repliedAt, createdAt.
- `conversations`: id, userId FK, participantId, lastMessageAt, personaApplied, language.
- `botActivity`: id, userId FK, type (post_publish|comment_reply|message_reply|error), payload JSON, createdAt.

## 4) Core Flows
### Posts
1. Create/Update post (draft/scheduled/now).  
2. Scheduler endpoint runs each minute → picks due `scheduledPosts` → uses `FacebookService.publishPost` → updates `fbPosts` & `botActivity`. Retry with backoff (max 3).

### Comments (Webhook)
1. Facebook → POST webhook.  
2. Verify signature (X-Hub-Signature-256 + `FACEBOOK_APP_SECRET`).  
3. Store comment in `fbComments`. If auto-reply enabled → build prompt (persona + context) → `GeminiService.generateReply` → `FacebookService.replyToComment` → mark answered, log activity.

### Messenger (Webhook)
1. Facebook → POST webhook.  
2. Verify signature → store message in `fbMessages` + `conversations`.  
3. Build conversation context (recent messages) → Gemini reply → `FacebookService.replyToMessage`.

### Dashboard
- Aggregate counts and recent activity from DB.
- Charts: daily/weekly activity via `stats` tRPC router.

## 5) API Surface
### Express routes
- `GET /api/health` — uptime & version.  
- `GET /api/webhook/facebook` — webhook verify (`hub.verify_token`).  
- `POST /api/webhook/facebook` — receive events (comments/messages) with signature validation.  
- `POST /api/scheduled-posts/process` — cron target for due jobs.

### tRPC routers (`/api/trpc`)
- `posts`: create, list, schedule, publish now, stats per post.  
- `settings`: get/update bot settings, test connection to FB.  
- `stats`: global metrics (posts/comments/messages), charts.  
- `comments`: list, mark answered/ignored, manual reply.  
- `messages`: list conversations/messages, send reply.

## 6) Security & Compliance
- All tokens stay server-side; frontend only calls backend.  
- Webhook signature verification using `FACEBOOK_APP_SECRET`.  
- Input validation with Zod on all procedures/routes.  
- Rate limiting (per IP/user) to be added via middleware.  
- Secrets via environment variables; never baked into client.

## 7) Scheduling Strategy
- Vercel Cron → hits `/api/scheduled-posts/process` every minute.  
- Idempotent: each job checks `nextRunAt <= now && retryCount < max`.  
- Retries with exponential backoff stored in DB.

## 8) Frontend UX (IDRISIUM Standard)
- Dark mode first: background **#000000**, accent **#39FF14**, text **#EDEDED/#A0A0A0**, glassmorphism cards, 16-24px radius. Fonts: Orbitron/Cairo for headings, Inter/Tajawal for body.  
- Components: PostCard, CommentCard, MessageCard, StatWidget, PostSchedulerForm, BotSettingsForm.  
- Pages: Home, Dashboard, Settings, Posts, PostScheduler, Comments, Messages, Statistics.  
- Interactions: hover/press feedback, skeleton loading, error toasts.

## 9) Deployment
- **vercel.json** routes:  
  - `/trpc/*` → server handler  
  - `/api/*` → server handler  
  - `/*` → client `dist`  
- Client build: `npm run build` in `/client`.  
- Server: `@vercel/node` handler wrapping Express app.

## 10) Environment Variables (backend only)
- `FACEBOOK_PAGE_ID`  
- `FACEBOOK_ACCESS_TOKEN`  
- `FACEBOOK_VERIFY_TOKEN`  
- `FACEBOOK_APP_SECRET`  
- `GEMINI_API_KEY`  
- `DATABASE_URL`  
- `JWT_SECRET`  
- `NODE_ENV`

## 11) File Tree (initial)
```
facebook-ai-bot/
├── client/ (React + Vite + Tailwind)
│   ├── src/
│   │   ├── pages/ (Home, Dashboard, Settings, Posts, PostScheduler, Comments, Messages, Statistics)
│   │   ├── components/ (PostCard, CommentCard, MessageCard, StatWidget, forms)
│   │   ├── lib/ (api client, hooks, types)
│   │   ├── App.tsx, main.tsx, index.css
│   └── public/
├── server/ (Express + tRPC + Drizzle)
│   ├── api/index.ts (Vercel entry)
│   ├── src/
│   │   ├── app.ts
│   │   ├── routers/ (posts.ts, settings.ts, stats.ts, comments.ts, messages.ts, index.ts)
│   │   ├── services/ (facebook.ts, gemini.ts)
│   │   ├── webhooks/ (facebook.ts)
│   │   ├── routes/ (scheduledPosts.ts, health.ts)
│   │   ├── db.ts, env.ts, logger.ts
│   │   └── utils/ (signature.ts, scheduler.ts)
│   ├── drizzle/ (schema.ts, migrations/)
│   ├── package.json, tsconfig.json
├── vercel.json
├── package.json (workspaces)
└── README.md
```

## 12) Testing
- Vitest for services & tRPC procedures.  
- Integration: webhook handler & scheduled-posts processor (mock FB/Gemini).  
- E2E (future): Playwright hitting client against mocked backend.

## 13) Next Steps
1) Scaffold backend (env, db, routers, services, vercel handler).  
2) Scaffold frontend (layout, pages, components, API client, dark theme).  
3) Wire scheduling endpoint and retry logic.  
4) Add tests and sample configs (`.env.example` backend only).  
5) Verify deploy on Vercel + cron setup.
