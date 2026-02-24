# TourReel — Implementation Spec / Project Bible
**Version:** 1.0
**Date:** February 10, 2026
**Purpose:** Complete implementation reference for AI coding agents (Claude Code, Antigravity, Cursor). Every file path, every dependency, every API contract, every function signature. Build exactly this.

> **Current Stack (Feb 2026)**: **Kie.ai Kling 3.0** (video), **Resend magic-link** (auth), **Gemini Flash** (LLM), **Ollama + pgvector** (RAG). See `apps/worker/src/services/` for live implementation.
---
## TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Dependencies — Exact Versions](#3-dependencies)
4. [Environment Variables](#4-environment-variables)
5. [Build Order — Step by Step](#5-build-order)
6. [Database — PostgreSQL Schema + Migrations](#6-database)
7. [RackNerd Worker Service](#7-racknerd-worker-service)
8. [External API Contracts](#8-external-api-contracts)
9. [BullMQ Job Definitions](#9-bullmq-job-definitions)
10. [Video Pipeline — Exact Implementation](#10-video-pipeline)
11. [Frontend — Next.js Pages & Components](#11-frontend)
12. [API Routes — Express (RackNerd)](#12-api-routes-express)
13. [API Routes — Next.js (Vercel)](#13-api-routes-nextjs)
14. [Authentication Flow](#14-authentication-flow)
15. [Stripe Integration](#15-stripe-integration)
16. [Cloudflare R2 Integration](#16-cloudflare-r2)
17. [Deployment Configuration](#17-deployment)
18. [Error Handling & Retry Logic](#18-error-handling)
19. [Monitoring & Logging](#19-monitoring)
20. [Testing Strategy](#20-testing)
---
## 1. Project Overview
**What we're building:** A SaaS where realtors upload listing photos + floorplan → AI generates a cinematic property tour video with room-to-room transitions and background music.
**Two codebases:**
- `tourreel-web` — Next.js frontend, deployed to Vercel Hobby (free)
- `tourreel-worker` — Node.js backend + job processor, deployed to RackNerd VPS
**Infrastructure (already running on RackNerd):**
- PostgreSQL (database)
- Redis (job queue)
- FFmpeg (video processing)
**External APIs:**
- Kie.ai — Kling 3.0 video generation (primary)
- kie.ai — Veo 3.1 video generation (backup) + Suno V5 music
- OpenRouter — GPT-4o / Gemini 2.5 Pro for floorplan analysis
- Clerk — Authentication
- Stripe — Payments
- Cloudflare R2 — Video storage + CDN
---
## 2. Repository Structure
### `tourreel-web/` (Next.js — Vercel)
```
tourreel-web/
├── .env.local # Local env vars (not committed)
├── .env.example # Template for env vars
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
│
├── public/
│ ├── logo.svg
│ ├── favicon.ico
│ └── images/
│ ├── hero-placeholder.jpg
│ └── demo-tour.mp4
│
├── src/
│ ├── app/
│ │ ├── layout.tsx # Root layout with ClerkProvider
│ │ ├── page.tsx # Landing page (public)
│ │ ├── pricing/
│ │ │ └── page.tsx # Pricing page (public)
│ │ ├── sign-in/
│ │ │ └── [[...sign-in]]/
│ │ │ └── page.tsx # Clerk sign-in
│ │ ├── sign-up/
│ │ │ └── [[...sign-up]]/
│ │ │ └── page.tsx # Clerk sign-up
│ │ ├── dashboard/
│ │ │ ├── layout.tsx # Dashboard layout (auth required)
│ │ │ ├── page.tsx # Dashboard home — job list + usage stats
│ │ │ ├── new/
│ │ │ │ └── page.tsx # Create new tour — multi-step wizard
│ │ │ ├── jobs/
│ │ │ │ └── [id]/
│ │ │ │ └── page.tsx # Job detail — progress + preview + download
│ │ │ ├── listings/
│ │ │ │ └── page.tsx # My listings
│ │ │ └── settings/
│ │ │ └── page.tsx # Account + billing settings
│ │ └── api/
│ │ ├── webhooks/
│ │ │ └── clerk/
│ │ │ └── route.ts # Clerk webhook — sync user to Postgres
│ │ └── proxy/
│ │ └── [...path]/
│ │ └── route.ts # Proxy to RackNerd API (avoids CORS)
│ │
│ ├── components/
│ │ ├── ui/ # Shared UI primitives
│ │ │ ├── button.tsx
│ │ │ ├── card.tsx
│ │ │ ├── input.tsx
│ │ │ ├── select.tsx
│ │ │ ├── progress-bar.tsx
│ │ │ ├── badge.tsx
│ │ │ ├── dialog.tsx
│ │ │ ├── toast.tsx
│ │ │ ├── skeleton.tsx
│ │ │ └── file-upload.tsx
│ │ │
│ │ ├── layout/
│ │ │ ├── header.tsx # Nav bar with auth state
│ │ │ ├── sidebar.tsx # Dashboard sidebar
│ │ │ └── footer.tsx
│ │ │
│ │ ├── landing/
│ │ │ ├── hero.tsx
│ │ │ ├── features.tsx
│ │ │ ├── pricing-cards.tsx
│ │ │ ├── demo-video.tsx
│ │ │ └── testimonials.tsx
│ │ │
│ │ ├── dashboard/
│ │ │ ├── job-list.tsx # List of all video jobs
│ │ │ ├── job-card.tsx # Single job summary card
│ │ │ ├── usage-stats.tsx # Monthly usage display
│ │ │ └── empty-state.tsx
│ │ │
│ │ ├── wizard/ # New tour creation wizard
│ │ │ ├── step-listing.tsx # Step 1: Listing details + photos
│ │ │ ├── step-floorplan.tsx # Step 2: Upload/confirm floorplan
│ │ │ ├── step-sequence.tsx # Step 3: Room sequence (drag & drop)
│ │ │ ├── step-style.tsx # Step 4: Music + transition style
│ │ │ ├── step-confirm.tsx # Step 5: Review + generate
│ │ │ └── room-sequencer.tsx # Drag-and-drop room reorder
│ │ │
│ │ ├── job-detail/
│ │ │ ├── progress-tracker.tsx # Real-time progress display
│ │ │ ├── clip-grid.tsx # Grid of individual clips
│ │ │ ├── clip-preview.tsx # Single clip with approve/reject
│ │ │ ├── video-player.tsx # Final video player
│ │ │ └── download-panel.tsx # Download buttons for all formats
│ │ │
│ │ └── settings/
│ │ ├── profile-form.tsx
│ │ ├── subscription-card.tsx
│ │ └── billing-history.tsx
│ │
│ ├── lib/
│ │ ├── api-client.ts # Typed fetch wrapper for RackNerd API
│ │ ├── constants.ts # App-wide constants
│ │ ├── utils.ts # Utility functions (cn, formatDate, etc.)
│ │ └── types.ts # Shared TypeScript types
│ │
│ ├── hooks/
│ │ ├── use-job-polling.ts # Poll job status every 5s
│ │ ├── use-upload.ts # File upload with progress
│ │ └── use-usage.ts # Current usage stats
│ │
│ └── middleware.ts # Clerk auth middleware
│
└── vercel.json # Vercel config (rewrites, headers)
```
### `tourreel-worker/` (Node.js — RackNerd)
```
tourreel-worker/
├── .env # Env vars (not committed)
├── .env.example # Template
├── .gitignore
├── package.json
├── tsconfig.json
├── ecosystem.config.js # PM2 configuration
│
├── src/
│ ├── index.ts # Express server entry point
│ ├── config.ts # Config loader (env vars + defaults)
│ │
│ ├── db/
│ │ ├── client.ts # PostgreSQL connection pool (pg)
│ │ ├── migrations/
│ │ │ ├── 001_initial_schema.sql
│ │ │ ├── 002_add_music_tracks.sql
│ │ │ └── migrate.ts # Migration runner
│ │ ├── queries/
│ │ │ ├── users.ts # User CRUD queries
│ │ │ ├── listings.ts # Listing CRUD queries
│ │ │ ├── video-jobs.ts # Video job CRUD queries
│ │ │ ├── clips.ts # Clip CRUD queries
│ │ │ ├── subscriptions.ts # Subscription queries
│ │ │ └── usage.ts # Usage tracking queries
│ │ └── seed.ts # Seed data (music tracks, default prompts)
│ │
│ ├── api/
│ │ ├── router.ts # Express router — all routes
│ │ ├── middleware/
│ │ │ ├── auth.ts # Clerk JWT verification
│ │ │ ├── rate-limit.ts # Per-user rate limiting
│ │ │ └── error-handler.ts # Global error handler
│ │ ├── routes/
│ │ │ ├── listings.ts # CRUD /api/listings
│ │ │ ├── jobs.ts # CRUD /api/jobs
│ │ │ ├── clips.ts # /api/jobs/:id/clips
│ │ │ ├── floorplan.ts # /api/floorplan/analyze
│ │ │ ├── usage.ts # /api/usage
│ │ │ └── webhooks.ts # /api/webhooks/fal, /api/webhooks/kie, /api/webhooks/stripe
│ │ └── validators/
│ │ ├── listing.ts # Zod schemas for listing input
│ │ ├── job.ts # Zod schemas for job input
│ │ └── common.ts # Shared validators (UUID, pagination)
│ │
│ ├── queue/
│ │ ├── connection.ts # Redis/BullMQ connection
│ │ ├── queues.ts # Queue definitions
│ │ ├── workers/
│ │ │ ├── video-pipeline.worker.ts # Main pipeline orchestrator
│ │ │ ├── clip-generator.worker.ts # Individual clip generation
│ │ │ ├── stitcher.worker.ts # FFmpeg stitching
│ │ │ ├── music.worker.ts # Music generation + overlay
│ │ │ └── uploader.worker.ts # R2 upload + format export
│ │ └── events.ts # Queue event handlers (logging, notifications)
│ │
│ ├── services/
│ │ ├── kie.ts # Kie.ai Kling 3.0 API client
│ │ ├── kie.ts # kie.ai Veo 3.1 + Suno API client
│ │ ├── openrouter.ts # OpenRouter LLM client
│ │ ├── r2.ts # Cloudflare R2 upload/download
│ │ ├── ffmpeg.ts # FFmpeg wrapper (stitch, overlay, export)
│ │ ├── floorplan-analyzer.ts # Floorplan → room sequence
│ │ ├── prompt-generator.ts # Room sequence → video prompts
│ │ ├── stripe.ts # Stripe billing client
│ │ ├── clerk.ts # Clerk backend verification
│ │ └── notifications.ts # Email notifications (Resend or nodemailer)
│ │
│ ├── utils/
│ │ ├── logger.ts # Pino logger
│ │ ├── temp-files.ts # Temp directory management + cleanup
│ │ ├── download.ts # HTTP file downloader with retry
│ │ ├── retry.ts # Generic retry with exponential backoff
│ │ └── cost-tracker.ts # Track API costs per job
│ │
│ └── types/
│ ├── index.ts # All TypeScript interfaces
│ ├── kie.ts # Kie.ai response types
│ ├── kie.ts # kie.ai response types
│ └── db.ts # Database row types
│
├── scripts/
│ ├── setup-db.sh # Create database + run migrations
│ ├── seed-music.ts # Pre-generate music tracks
│ ├── cleanup-temp.sh # Cron job for orphaned temp files
│ └── health-check.sh # PM2 health check script
│
└── tests/
├── services/
│ ├── fal.test.ts
│ ├── kie.test.ts
│ ├── ffmpeg.test.ts
│ └── floorplan-analyzer.test.ts
├── api/
│ ├── jobs.test.ts
│ └── listings.test.ts
└── integration/
└── pipeline.test.ts # End-to-end: upload → generate → stitch → deliver
```
---
## 3. Dependencies — Exact Versions
### `tourreel-web/package.json`
```json
{
"name": "tourreel-web",
"version": "0.1.0",
"private": true,
"scripts": {
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "next lint",
"type-check": "tsc --noEmit"
},
"dependencies": {
"next": "^14.2.0",
"react": "^18.3.0",
"react-dom": "^18.3.0",
"@clerk/nextjs": "^5.7.0",
"@stripe/stripe-js": "^4.8.0",
"stripe": "^17.4.0",
"@dnd-kit/core": "^6.1.0",
"@dnd-kit/sortable": "^8.0.0",
"@dnd-kit/utilities": "^3.2.0",
"lucide-react": "^0.460.0",
"clsx": "^2.1.0",
"tailwind-merge": "^2.5.0",
"date-fns": "^4.1.0",
"sonner": "^1.7.0",
"zod": "^3.23.0",
"swr": "^2.2.0"
},
"devDependencies": {
"typescript": "^5.6.0",
"@types/react": "^18.3.0",
"@types/node": "^22.9.0",
"tailwindcss": "^3.4.0",
"postcss": "^8.4.0",
"autoprefixer": "^10.4.0",
"eslint": "^8.57.0",
"eslint-config-next": "^14.2.0"
}
}
```
### `tourreel-worker/package.json`
```json
{
"name": "tourreel-worker",
"version": "0.1.0",
"private": true,
"scripts": {
"dev": "tsx watch src/index.ts",
"build": "tsc",
"start": "node dist/index.js",
"migrate": "tsx src/db/migrations/migrate.ts",
"seed": "tsx scripts/seed-music.ts",
"test": "vitest",
"type-check": "tsc --noEmit"
},
"dependencies": {
"express": "^4.21.0",
"cors": "^2.8.5",
"helmet": "^8.0.0",
"compression": "^1.7.4",
"pg": "^8.13.0",
"bullmq": "^5.25.0",
"ioredis": "^5.4.0",
"kie.ai SDK (raw fetch)": "^1.2.0",
"@aws-sdk/client-s3": "^3.700.0",
"@clerk/backend": "^1.17.0",
"stripe": "^17.4.0",
"zod": "^3.23.0",
"pino": "^9.5.0",
"pino-pretty": "^13.0.0",
"dotenv": "^16.4.0",
"node-fetch": "^3.3.0",
"uuid": "^10.0.0",
"mime-types": "^2.1.0"
},
"devDependencies": {
"typescript": "^5.6.0",
"tsx": "^4.19.0",
"@types/express": "^5.0.0",
"@types/cors": "^2.8.0",
"@types/compression": "^1.7.0",
"@types/pg": "^8.11.0",
"@types/uuid": "^10.0.0",
"@types/mime-types": "^2.1.0",
"@types/node": "^22.9.0",
"vitest": "^2.1.0"
}
}
```
**Why these specific packages:**
- `pg` over Prisma/Drizzle: Direct SQL on self-hosted Postgres, no ORM overhead, the agent needs to write explicit queries
- `bullmq` over `bull`: BullMQ is the maintained successor, TypeScript native
- `kie.ai SDK (raw fetch)`: Official Kie.ai SDK with queue/subscribe pattern
- No fal SDK exists for kie.ai — use raw `fetch` calls
- `swr` on frontend for data fetching + polling (simpler than react-query for this)
- `@dnd-kit` for drag-and-drop room reordering (more accessible than react-beautiful-dnd)
- `pino` for structured logging (JSON output, PM2 compatible)
- `tsx` for dev mode (esbuild-powered TypeScript execution)
- `zod` for runtime validation on both frontend and backend
---
## 4. Environment Variables
### `tourreel-web/.env.local`
```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
# Backend API (RackNerd via Cloudflare Tunnel)
NEXT_PUBLIC_API_URL=https://api.tourreel.com
# OR during development: http://YOUR_RACKNERD_IP:3001
# Stripe (public key only — secret key on worker)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
# App
NEXT_PUBLIC_APP_URL=https://tourreel.com
NEXT_PUBLIC_CDN_URL=https://videos.tourreel.com
```
### `tourreel-worker/.env`
```bash
# ─── Server ───
PORT=3001
NODE_ENV=production
LOG_LEVEL=info # debug | info | warn | error
# ─── Database (PostgreSQL on localhost) ───
DATABASE_URL=postgresql://tourreel:YOUR_STRONG_PASSWORD@127.0.0.1:5432/tourreel
# Individual vars as fallback:
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=tourreel
DB_USER=tourreel
DB_PASSWORD=YOUR_STRONG_PASSWORD
# ─── Redis (on localhost) ───
REDIS_URL=redis://127.0.0.1:6379
# OR with password:
# REDIS_URL=redis://:YOUR_REDIS_PASSWORD@127.0.0.1:6379
# ─── Kie.ai (Kling 3.0 + Suno) ───
KIE_API_KEY=kie_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
KIE_WEBHOOK_URL=https://api.tourreel.com/api/webhooks/kie
# ─── OpenRouter (LLM) ───
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_DEFAULT_MODEL=google/gemini-2.5-pro-preview
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o
# ─── Clerk Auth ───
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
# ─── Stripe ───
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_TEAM_PRICE_ID=price_xxxxx
STRIPE_METER_ID=mtr_xxxxx # Usage meter for overage billing
# ─── Cloudflare R2 ───
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=tour-videos
R2_PUBLIC_URL=https://videos.tourreel.com
# R2 endpoint (S3-compatible):
R2_ENDPOINT=https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
# ─── Temp Files ───
TEMP_DIR=/tmp/tourreel-jobs
MAX_CONCURRENT_JOBS=1
MAX_TEMP_AGE_MINUTES=120 # Cleanup files older than this
# ─── Email Notifications (optional — Resend) ───
RESEND_API_KEY=re_xxxxx
NOTIFICATION_FROM_EMAIL=noreply@tourreel.com
# ─── App URLs ───
APP_URL=https://tourreel.com
API_URL=https://api.tourreel.com
```
---
## 5. Build Order — Step by Step
The AI coding agent MUST follow this exact sequence. Each step depends on the previous.
```
PHASE 1: FOUNDATION (Week 1-2)
──────────────────────────────
Step 1.1 → tourreel-worker: Initialize project, install deps, tsconfig
Step 1.2 → tourreel-worker: Create src/config.ts (env var loader)
Step 1.3 → tourreel-worker: Create src/utils/logger.ts (pino)
Step 1.4 → tourreel-worker: Create src/db/client.ts (pg pool)
Step 1.5 → tourreel-worker: Create src/db/migrations/001_initial_schema.sql
Step 1.6 → tourreel-worker: Create src/db/migrations/migrate.ts
Step 1.7 → tourreel-worker: Run migrations (creates all tables)
Step 1.8 → tourreel-worker: Create src/types/index.ts (all interfaces)
Step 1.9 → tourreel-worker: Create src/types/db.ts (database row types)
Step 1.10 → tourreel-worker: Create src/db/queries/*.ts (all CRUD)
Step 1.11 → tourreel-worker: Create src/api/middleware/auth.ts (Clerk JWT)
Step 1.12 → tourreel-worker: Create src/api/middleware/error-handler.ts
Step 1.13 → tourreel-worker: Create src/api/validators/*.ts (Zod schemas)
Step 1.14 → tourreel-worker: Create src/api/routes/listings.ts
Step 1.15 → tourreel-worker: Create src/api/routes/jobs.ts
Step 1.16 → tourreel-worker: Create src/api/routes/usage.ts
Step 1.17 → tourreel-worker: Create src/api/router.ts (mount all routes)
Step 1.18 → tourreel-worker: Create src/index.ts (Express server)
Step 1.19 → tourreel-worker: Test: start server, hit /api/health
PHASE 2: EXTERNAL SERVICE CLIENTS (Week 3)
───────────────────────────────────────────
Step 2.1 → tourreel-worker: Create src/services/r2.ts
Step 2.2 → tourreel-worker: Create src/services/clerk.ts
Step 2.3 → tourreel-worker: Create src/services/openrouter.ts
Step 2.4 → tourreel-worker: Create src/services/kie.ts
Step 2.5 → tourreel-worker: Create src/services/kie.ts
Step 2.6 → tourreel-worker: Create src/services/stripe.ts
Step 2.7 → tourreel-worker: Test each service individually
PHASE 3: PIPELINE CORE (Week 4-5)
──────────────────────────────────
Step 3.1 → tourreel-worker: Create src/services/floorplan-analyzer.ts
Step 3.2 → tourreel-worker: Create src/services/prompt-generator.ts
Step 3.3 → tourreel-worker: Create src/services/ffmpeg.ts
Step 3.4 → tourreel-worker: Create src/utils/temp-files.ts
Step 3.5 → tourreel-worker: Create src/utils/download.ts
Step 3.6 → tourreel-worker: Create src/utils/retry.ts
Step 3.7 → tourreel-worker: Create src/utils/cost-tracker.ts
Step 3.8 → tourreel-worker: Create src/queue/connection.ts
Step 3.9 → tourreel-worker: Create src/queue/queues.ts
Step 3.10 → tourreel-worker: Create src/queue/workers/clip-generator.worker.ts
Step 3.11 → tourreel-worker: Create src/queue/workers/stitcher.worker.ts
Step 3.12 → tourreel-worker: Create src/queue/workers/music.worker.ts
Step 3.13 → tourreel-worker: Create src/queue/workers/uploader.worker.ts
Step 3.14 → tourreel-worker: Create src/queue/workers/video-pipeline.worker.ts (orchestrator)
Step 3.15 → tourreel-worker: Create src/queue/events.ts
Step 3.16 → tourreel-worker: Create src/api/routes/webhooks.ts (fal + kie callbacks)
Step 3.17 → tourreel-worker: Create src/services/notifications.ts
Step 3.18 → tourreel-worker: Test: trigger a job → watch full pipeline execute
PHASE 4: FRONTEND (Week 6-8)
─────────────────────────────
Step 4.1 → tourreel-web: Initialize Next.js project, install deps
Step 4.2 → tourreel-web: Configure Tailwind, create tailwind.config.js
Step 4.3 → tourreel-web: Create src/lib/types.ts (shared types — copy from worker)
Step 4.4 → tourreel-web: Create src/lib/api-client.ts
Step 4.5 → tourreel-web: Create src/lib/utils.ts
Step 4.6 → tourreel-web: Create src/lib/constants.ts
Step 4.7 → tourreel-web: Create src/middleware.ts (Clerk)
Step 4.8 → tourreel-web: Create src/app/layout.tsx (ClerkProvider + global styles)
Step 4.9 → tourreel-web: Create src/components/ui/*.tsx (all primitives)
Step 4.10 → tourreel-web: Create src/components/layout/*.tsx
Step 4.11 → tourreel-web: Create src/app/page.tsx (landing)
Step 4.12 → tourreel-web: Create src/app/pricing/page.tsx
Step 4.13 → tourreel-web: Create src/app/sign-in and sign-up pages
Step 4.14 → tourreel-web: Create src/app/dashboard/layout.tsx
Step 4.15 → tourreel-web: Create src/hooks/use-job-polling.ts
Step 4.16 → tourreel-web: Create src/hooks/use-upload.ts
Step 4.17 → tourreel-web: Create src/hooks/use-usage.ts
Step 4.18 → tourreel-web: Create src/components/dashboard/*.tsx
Step 4.19 → tourreel-web: Create src/app/dashboard/page.tsx
Step 4.20 → tourreel-web: Create src/components/wizard/*.tsx (all 5 steps)
Step 4.21 → tourreel-web: Create src/app/dashboard/new/page.tsx
Step 4.22 → tourreel-web: Create src/components/job-detail/*.tsx
Step 4.23 → tourreel-web: Create src/app/dashboard/jobs/[id]/page.tsx
Step 4.24 → tourreel-web: Create src/app/dashboard/settings/page.tsx
Step 4.25 → tourreel-web: Create src/app/api/proxy/[...path]/route.ts
Step 4.26 → tourreel-web: Create src/app/api/webhooks/clerk/route.ts
PHASE 5: PAYMENTS (Week 9)
──────────────────────────
Step 5.1 → tourreel-worker: Set up Stripe products + prices in dashboard
Step 5.2 → tourreel-worker: Create src/api/routes/webhooks.ts (add Stripe handler)
Step 5.3 → tourreel-web: Create subscription checkout flow in settings page
Step 5.4 → tourreel-web: Create Stripe customer portal redirect
Step 5.5 → tourreel-worker: Implement usage meter event recording
PHASE 6: DEPLOYMENT (Week 10)
─────────────────────────────
Step 6.1 → tourreel-worker: Create ecosystem.config.js (PM2)
Step 6.2 → tourreel-worker: Set up Cloudflare Tunnel
Step 6.3 → tourreel-worker: Create scripts/cleanup-temp.sh + crontab
Step 6.4 → tourreel-worker: Create scripts/health-check.sh
Step 6.5 → tourreel-web: Create vercel.json
Step 6.6 → tourreel-web: Connect GitHub → Vercel
Step 6.7 → tourreel-worker: Create .github/workflows/deploy.yml
Step 6.8 → Set up R2 bucket + custom domain
Step 6.9 → Set up Clerk webhooks
Step 6.10 → Set up Stripe webhooks
Step 6.11 → End-to-end test on production
PHASE 7: POLISH + LAUNCH (Week 11-12)
──────────────────────────────────────
Step 7.1 → Music library: pre-generate 20 tracks via Suno
Step 7.2 → Error handling: retry logic for all external APIs
Step 7.3 → Rate limiting on API routes
Step 7.4 → Email notifications on job complete
Step 7.5 → Landing page polish
Step 7.6 → Beta invite flow
Step 7.7 → End-to-end testing with real listing data
```
---
## 6. Database — PostgreSQL Schema + Migrations
### `src/db/migrations/001_initial_schema.sql`
```sql
-- TourReel Database Schema v1
-- Run: psql -d tourreel -f 001_initial_schema.sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ═══════════════════════════════════════════
-- USERS
-- ═══════════════════════════════════════════
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
clerk_id VARCHAR(255) UNIQUE NOT NULL,
email VARCHAR(255) NOT NULL,
full_name VARCHAR(255),
phone VARCHAR(50),
company VARCHAR(255),
license_number VARCHAR(100),
avatar_url TEXT,
stripe_customer_id VARCHAR(255),
subscription_tier VARCHAR(50) DEFAULT 'free'
CHECK (subscription_tier IN ('free', 'starter', 'pro', 'team')),
videos_used_this_month INT DEFAULT 0,
videos_limit INT DEFAULT 0,
billing_cycle_start TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_clerk ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);
-- ═══════════════════════════════════════════
-- LISTINGS
-- ═══════════════════════════════════════════
CREATE TABLE listings (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
address VARCHAR(500) NOT NULL,
city VARCHAR(255),
state VARCHAR(50),
zip VARCHAR(20),
property_type VARCHAR(50) DEFAULT 'house'
CHECK (property_type IN ('house', 'condo', 'apartment', 'townhouse', 'commercial', 'land')),
bedrooms INT,
bathrooms DECIMAL(3,1),
sqft INT,
listing_price DECIMAL(12,2),
mls_number VARCHAR(50),
exterior_photo_url TEXT,
floorplan_url TEXT,
floorplan_analysis JSONB,
additional_photos JSONB DEFAULT '[]'::jsonb,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
-- ═══════════════════════════════════════════
-- VIDEO JOBS
-- ═══════════════════════════════════════════
CREATE TABLE video_jobs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
status VARCHAR(50) DEFAULT 'pending'
CHECK (status IN (
'pending', 'analyzing', 'generating_prompts',
'generating_clips', 'awaiting_approval',
'stitching', 'adding_music', 'exporting',
'uploading', 'complete', 'failed', 'cancelled'
)),
model_preference VARCHAR(50) DEFAULT 'kling_3'
CHECK (model_preference IN ('kling_3', 'veo_31_fast', 'veo_31_quality')),
tour_sequence JSONB,
music_style VARCHAR(100) DEFAULT 'elegant',
music_track_id UUID,
transition_style VARCHAR(50) DEFAULT 'fade'
CHECK (transition_style IN (
'fade', 'dissolve', 'wipeleft', 'wiperight',
'circleopen', 'circleclose', 'radial', 'smoothleft'
)),
include_exterior BOOLEAN DEFAULT true,
include_backyard BOOLEAN DEFAULT false,
total_clips INT,
completed_clips INT DEFAULT 0,
current_step VARCHAR(100),
progress_percent INT DEFAULT 0
CHECK (progress_percent >= 0 AND progress_percent <= 100),
master_video_url TEXT,
square_video_url TEXT,
vertical_video_url TEXT,
portrait_video_url TEXT,
thumbnail_url TEXT,
video_duration_seconds DECIMAL(6,2),
total_api_cost DECIMAL(10,4) DEFAULT 0,
error_message TEXT,
error_code VARCHAR(50),
retry_count INT DEFAULT 0,
max_retries INT DEFAULT 3,
started_at TIMESTAMPTZ,
completed_at TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_jobs_user ON video_jobs(user_id);
CREATE INDEX idx_jobs_listing ON video_jobs(listing_id);
CREATE INDEX idx_jobs_status ON video_jobs(status);
CREATE INDEX idx_jobs_created ON video_jobs(created_at DESC);
-- ═══════════════════════════════════════════
-- CLIPS (individual room-to-room transitions)
-- ═══════════════════════════════════════════
CREATE TABLE clips (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
video_job_id UUID NOT NULL REFERENCES video_jobs(id) ON DELETE CASCADE,
clip_number INT NOT NULL,
from_room VARCHAR(255),
to_room VARCHAR(255),
prompt TEXT NOT NULL,
start_frame_url TEXT,
end_frame_url TEXT,
model_used VARCHAR(50),
provider VARCHAR(20)
CHECK (provider IN ('fal', 'kie')),
external_task_id VARCHAR(255),
status VARCHAR(50) DEFAULT 'pending'
CHECK (status IN ('pending', 'generating', 'complete', 'failed', 'retrying', 'skipped')),
video_url TEXT,
local_path TEXT,
duration_seconds DECIMAL(6,2),
api_cost DECIMAL(8,4) DEFAULT 0,
generation_time_seconds INT,
approved BOOLEAN,
rejection_reason TEXT,
retry_count INT DEFAULT 0,
max_retries INT DEFAULT 3,
error_message TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
completed_at TIMESTAMPTZ,
UNIQUE(video_job_id, clip_number)
);
CREATE INDEX idx_clips_job ON clips(video_job_id);
CREATE INDEX idx_clips_status ON clips(status);
CREATE INDEX idx_clips_external ON clips(external_task_id);
-- ═══════════════════════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════════════════════
CREATE TABLE subscriptions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
stripe_subscription_id VARCHAR(255) UNIQUE,
stripe_price_id VARCHAR(255),
tier VARCHAR(50) NOT NULL
CHECK (tier IN ('starter', 'pro', 'team')),
status VARCHAR(50) DEFAULT 'active'
CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
monthly_video_limit INT NOT NULL,
price_cents INT NOT NULL,
current_period_start TIMESTAMPTZ,
current_period_end TIMESTAMPTZ,
cancel_at_period_end BOOLEAN DEFAULT false,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_subs_user ON subscriptions(user_id);
CREATE INDEX idx_subs_stripe ON subscriptions(stripe_subscription_id);
-- ═══════════════════════════════════════════
-- USAGE EVENTS (for Stripe metered billing)
-- ═══════════════════════════════════════════
CREATE TABLE usage_events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id),
video_job_id UUID REFERENCES video_jobs(id),
event_type VARCHAR(50) NOT NULL
CHECK (event_type IN ('video_generated', 'video_failed', 'clip_retry', 'premium_export')),
credits_used INT DEFAULT 1,
api_cost DECIMAL(8,4),
stripe_meter_event_id VARCHAR(255),
created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_usage_user ON usage_events(user_id);
CREATE INDEX idx_usage_user_date ON usage_events(user_id, created_at DESC);
CREATE INDEX idx_usage_job ON usage_events(video_job_id);
-- ═══════════════════════════════════════════
-- MUSIC TRACKS (pre-generated library)
-- ═══════════════════════════════════════════
CREATE TABLE music_tracks (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(255) NOT NULL,
style VARCHAR(100) NOT NULL,
mood VARCHAR(100),
duration_seconds DECIMAL(6,2) NOT NULL,
r2_url TEXT NOT NULL,
r2_key TEXT NOT NULL,
suno_task_id VARCHAR(255),
file_size_bytes BIGINT,
is_active BOOLEAN DEFAULT true,
play_count INT DEFAULT 0,
created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_music_style ON music_tracks(style);
CREATE INDEX idx_music_active ON music_tracks(is_active) WHERE is_active = true;
-- ═══════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_listings_updated
BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated
BEFORE UPDATE ON video_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subs_updated
BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Reset monthly usage (call via cron on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
UPDATE users SET
videos_used_this_month = 0,
billing_cycle_start = NOW();
END;
$$ LANGUAGE plpgsql;
```
### `src/db/migrations/migrate.ts`
```typescript
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { pool } from "../client";
import { logger } from "../../utils/logger";
async function migrate() {
// Create migrations tracking table
await pool.query(`
CREATE TABLE IF NOT EXISTS _migrations (
id SERIAL PRIMARY KEY,
filename VARCHAR(255) UNIQUE NOT NULL,
executed_at TIMESTAMPTZ DEFAULT NOW()
)
`);
// Get executed migrations
const { rows: executed } = await pool.query(
"SELECT filename FROM _migrations ORDER BY id"
);
const executedSet = new Set(executed.map((r) => r.filename));
// Get migration files
const migrationsDir = join(__dirname);
const files = readdirSync(migrationsDir)
.filter((f) => f.endsWith(".sql"))
.sort();
for (const file of files) {
if (executedSet.has(file)) {
logger.info(`⏭️ Skipping ${file} (already executed)`);
continue;
}
logger.info(`🔄 Running ${file}...`);
const sql = readFileSync(join(migrationsDir, file), "utf-8");
try {
await pool.query("BEGIN");
await pool.query(sql);
await pool.query(
"INSERT INTO _migrations (filename) VALUES ($1)",
[file]
);
await pool.query("COMMIT");
logger.info(`✅ ${file} completed`);
} catch (err) {
await pool.query("ROLLBACK");
logger.error(`❌ ${file} failed: ${err}`);
process.exit(1);
}
}
logger.info("✅ All migrations complete");
await pool.end();
}
migrate();
```
---
## 7. RackNerd Worker Service — Core Files
### `src/config.ts`
```typescript
import dotenv from "dotenv";
dotenv.config();
function required(key: string): string {
const value = process.env[key];
if (!value) throw new Error(`Missing required env var: ${key}`);
return value;
}
function optional(key: string, defaultValue: string): string {
return process.env[key] || defaultValue;
}
export const config = {
port: parseInt(optional("PORT", "3001")),
nodeEnv: optional("NODE_ENV", "development"),
logLevel: optional("LOG_LEVEL", "info"),
db: {
url: required("DATABASE_URL"),
},
redis: {
url: optional("REDIS_URL", "redis://127.0.0.1:6379"),
},
kie: {
apiKey: required("KIE_API_KEY"),
webhookUrl: process.env.KIE_WEBHOOK_URL,
baseUrl: "https://api.kie.ai",
},
openRouter: {
apiKey: required("OPENROUTER_API_KEY"),
baseUrl: "https://openrouter.ai/api/v1",
defaultModel: optional("OPENROUTER_DEFAULT_MODEL", "google/gemini-2.5-pro-preview"),
fallbackModel: optional("OPENROUTER_FALLBACK_MODEL", "openai/gpt-4o"),
},
clerk: {
secretKey: required("CLERK_SECRET_KEY"),
webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
},
stripe: {
secretKey: required("STRIPE_SECRET_KEY"),
webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
prices: {
starter: process.env.STRIPE_STARTER_PRICE_ID,
pro: process.env.STRIPE_PRO_PRICE_ID,
team: process.env.STRIPE_TEAM_PRICE_ID,
},
meterId: process.env.STRIPE_METER_ID,
},
r2: {
accountId: required("R2_ACCOUNT_ID"),
accessKeyId: required("R2_ACCESS_KEY_ID"),
secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
bucket: optional("R2_BUCKET_NAME", "tour-videos"),
publicUrl: required("R2_PUBLIC_URL"),
endpoint: `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
},
temp: {
dir: optional("TEMP_DIR", "/tmp/tourreel-jobs"),
maxConcurrentJobs: parseInt(optional("MAX_CONCURRENT_JOBS", "1")),
maxTempAgeMinutes: parseInt(optional("MAX_TEMP_AGE_MINUTES", "120")),
},
notifications: {
resendApiKey: process.env.RESEND_API_KEY,
fromEmail: optional("NOTIFICATION_FROM_EMAIL", "noreply@tourreel.com"),
},
app: {
url: optional("APP_URL", "http://localhost:3000"),
apiUrl: optional("API_URL", "http://localhost:3001"),
},
// Video generation defaults
video: {
defaultModel: "kling_3" as const,
defaultTransition: "fade" as const,
defaultClipDuration: 5, // seconds
maxClipsPerVideo: 15,
maxRetriesPerClip: 3,
maxCostPerVideo: 50.00, // USD — hard stop
xfadeDuration: 0.5, // seconds of crossfade
},
} as const;
export type Config = typeof config;
```
### `src/db/client.ts`
```typescript
import { Pool } from "pg";
import { config } from "../config";
import { logger } from "../utils/logger";
export const pool = new Pool({
connectionString: config.db.url,
max: 10, // Max connections (keep low — single VPS)
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 5000,
});
pool.on("error", (err) => {
logger.error("Unexpected PostgreSQL error:", err);
});
pool.on("connect", () => {
logger.debug("New PostgreSQL connection established");
});
// Helper for single queries
export async function query(
text: string,
params?: any[]
): Promise {
const start = Date.now();
const result = await pool.query(text, params);
const duration = Date.now() - start;
if (duration > 1000) {
logger.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}`);
}
return result.rows as T[];
}
// Helper for single-row queries
export async function queryOne(
text: string,
params?: any[]
): Promise {
const rows = await query(text, params);
return rows[0] || null;
}
// Transaction helper
export async function transaction(
fn: (client: any) => Promise
): Promise {
const client = await pool.connect();
try {
await client.query("BEGIN");
const result = await fn(client);
await client.query("COMMIT");
return result;
} catch (err) {
await client.query("ROLLBACK");
throw err;
} finally {
client.release();
}
}
```
### `src/utils/logger.ts`
```typescript
import pino from "pino";
import { config } from "../config";
export const logger = pino({
level: config.logLevel,
transport:
config.nodeEnv === "development"
? { target: "pino-pretty", options: { colorize: true } }
: undefined,
base: { service: "tourreel-worker" },
timestamp: pino.stdTimeFunctions.isoTime,
});
```
### `src/index.ts` (Express Server Entry Point)
```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config";
import { logger } from "./utils/logger";
import { router } from "./api/router";
import { errorHandler } from "./api/middleware/error-handler";
import { initQueues } from "./queue/queues";
import { initWorkers } from "./queue/workers/video-pipeline.worker";
import { pool } from "./db/client";
const app = express();
// ─── Middleware ───
app.use(helmet());
app.use(compression());
app.use(cors({
origin: [
config.app.url,
"http://localhost:3000", // Dev frontend
],
credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
// ─── Health check (no auth required) ───
app.get("/api/health", async (_req, res) => {
try {
await pool.query("SELECT 1");
res.json({
status: "ok",
timestamp: new Date().toISOString(),
version: process.env.npm_package_version || "0.1.0",
});
} catch (err) {
res.status(503).json({ status: "unhealthy", error: "Database unreachable" });
}
});
// ─── API Routes ───
app.use("/api", router);
// ─── Error handler (must be last) ───
app.use(errorHandler);
// ─── Start ───
async function start() {
try {
// Test database connection
await pool.query("SELECT NOW()");
logger.info("✅ PostgreSQL connected");
// Initialize job queues
await initQueues();
logger.info("✅ BullMQ queues initialized");
// Start workers
await initWorkers();
logger.info("✅ Workers started");
// Start Express
app.listen(config.port, "0.0.0.0", () => {
logger.info(`🚀 TourReel Worker running on port ${config.port}`);
logger.info(` Environment: ${config.nodeEnv}`);
logger.info(` Max concurrent jobs: ${config.temp.maxConcurrentJobs}`);
});
} catch (err) {
logger.fatal("Failed to start server:", err);
process.exit(1);
}
}
// Graceful shutdown
process.on("SIGTERM", async () => {
logger.info("SIGTERM received — shutting down...");
await pool.end();
process.exit(0);
});
process.on("SIGINT", async () => {
logger.info("SIGINT received — shutting down...");
await pool.end();
process.exit(0);
});
start();
```
### `src/types/index.ts` (Master Type Definitions)
```typescript
// ═══════════════════════════════════════════
// DATABASE ROW TYPES
// ═══════════════════════════════════════════
export interface DbUser {
id: string;
clerk_id: string;
email: string;
full_name: string | null;
phone: string | null;
company: string | null;
license_number: string | null;
avatar_url: string | null;
stripe_customer_id: string | null;
subscription_tier: SubscriptionTier;
videos_used_this_month: number;
videos_limit: number;
billing_cycle_start: Date | null;
created_at: Date;
updated_at: Date;
}
export interface DbListing {
id: string;
user_id: string;
address: string;
city: string | null;
state: string | null;
zip: string | null;
property_type: PropertyType;
bedrooms: number | null;
bathrooms: number | null;
sqft: number | null;
listing_price: number | null;
mls_number: string | null;
exterior_photo_url: string | null;
floorplan_url: string | null;
floorplan_analysis: FloorplanAnalysis | null;
additional_photos: string[];
created_at: Date;
updated_at: Date;
}
export interface DbVideoJob {
id: string;
listing_id: string;
user_id: string;
status: JobStatus;
model_preference: ModelPreference;
tour_sequence: TourRoom[] | null;
music_style: string;
music_track_id: string | null;
transition_style: TransitionStyle;
include_exterior: boolean;
include_backyard: boolean;
total_clips: number | null;
completed_clips: number;
current_step: string | null;
progress_percent: number;
master_video_url: string | null;
square_video_url: string | null;
vertical_video_url: string | null;
portrait_video_url: string | null;
thumbnail_url: string | null;
video_duration_seconds: number | null;
total_api_cost: number;
error_message: string | null;
error_code: string | null;
retry_count: number;
max_retries: number;
started_at: Date | null;
completed_at: Date | null;
created_at: Date;
updated_at: Date;
}
export interface DbClip {
id: string;
video_job_id: string;
clip_number: number;
from_room: string | null;
to_room: string | null;
prompt: string;
start_frame_url: string | null;
end_frame_url: string | null;
model_used: string | null;
provider: "kie" | null;
external_task_id: string | null;
status: ClipStatus;
video_url: string | null;
local_path: string | null;
duration_seconds: number | null;
api_cost: number;
generation_time_seconds: number | null;
approved: boolean | null;
rejection_reason: string | null;
retry_count: number;
max_retries: number;
error_message: string | null;
created_at: Date;
completed_at: Date | null;
}
export interface DbMusicTrack {
id: string;
name: string;
style: string;
mood: string | null;
duration_seconds: number;
r2_url: string;
r2_key: string;
suno_task_id: string | null;
file_size_bytes: number | null;
is_active: boolean;
play_count: number;
created_at: Date;
}
export interface DbSubscription {
id: string;
user_id: string;
stripe_subscription_id: string | null;
stripe_price_id: string | null;
tier: SubscriptionTier;
status: SubscriptionStatus;
monthly_video_limit: number;
price_cents: number;
current_period_start: Date | null;
current_period_end: Date | null;
cancel_at_period_end: boolean;
created_at: Date;
updated_at: Date;
}
// ═══════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════
export type SubscriptionTier = "free" | "starter" | "pro" | "team";
export type PropertyType = "house" | "condo" | "apartment" | "townhouse" | "commercial" | "land";
export type ModelPreference = "kling_3" | "veo_31_fast" | "veo_31_quality";
export type TransitionStyle = "fade" | "dissolve" | "wipeleft" | "wiperight" | "circleopen" | "circleclose" | "radial" | "smoothleft";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "incomplete";
export type JobStatus =
| "pending"
| "analyzing"
| "generating_prompts"
| "generating_clips"
| "awaiting_approval"
| "stitching"
| "adding_music"
| "exporting"
| "uploading"
| "complete"
| "failed"
| "cancelled";
export type ClipStatus = "pending" | "generating" | "complete" | "failed" | "retrying" | "skipped";
// ═══════════════════════════════════════════
// FLOORPLAN ANALYSIS
// ═══════════════════════════════════════════
export interface FloorplanRoom {
name: string; // e.g. "Master Bedroom"
type: string; // e.g. "bedroom", "kitchen", "bathroom"
approximate_position: {
x: number; // 0-1 normalized
y: number; // 0-1 normalized
};
connects_to: string[]; // Names of connected rooms
floor: number; // 1, 2, etc.
}
export interface FloorplanAnalysis {
rooms: FloorplanRoom[];
suggested_tour_sequence: string[]; // Room names in order
total_rooms: number;
property_type: string;
floors: number;
special_features: string[]; // e.g. ["pool", "garage", "balcony"]
confidence_score: number; // 0-1
}
// ═══════════════════════════════════════════
// TOUR SEQUENCE
// ═══════════════════════════════════════════
export interface TourRoom {
order: number;
from: string; // e.g. "Exterior"
to: string; // e.g. "Front Door"
transition_type: "walk" | "enter" | "stairs" | "exit";
}
// ═══════════════════════════════════════════
// CLIP GENERATION
// ═══════════════════════════════════════════
export interface ClipPrompt {
clip_number: number;
from_room: string;
to_room: string;
prompt: string;
start_frame_url: string | null;
end_frame_url: string | null;
duration_seconds: number;
}
export interface GeneratedClip {
clip_number: number;
video_url: string;
duration_seconds: number;
model_used: string;
provider: "kie";
api_cost: number;
generation_time_seconds: number;
external_task_id: string;
}
// ═══════════════════════════════════════════
// API REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════
// POST /api/listings
export interface CreateListingRequest {
address: string;
city?: string;
state?: string;
zip?: string;
property_type?: PropertyType;
bedrooms?: number;
bathrooms?: number;
sqft?: number;
listing_price?: number;
mls_number?: string;
exterior_photo_url?: string;
floorplan_url?: string;
additional_photos?: string[];
}
// POST /api/jobs
export interface CreateJobRequest {
listing_id: string;
model_preference?: ModelPreference;
tour_sequence?: TourRoom[];
music_style?: string;
music_track_id?: string;
transition_style?: TransitionStyle;
include_exterior?: boolean;
include_backyard?: boolean;
}
// GET /api/jobs/:id response
export interface JobDetailResponse {
job: DbVideoJob;
listing: DbListing;
clips: DbClip[];
music_track: DbMusicTrack | null;
}
// POST /api/floorplan/analyze
export interface FloorplanAnalyzeRequest {
floorplan_url: string;
property_type?: string;
}
export interface FloorplanAnalyzeResponse {
analysis: FloorplanAnalysis;
suggested_sequence: TourRoom[];
}
// GET /api/usage
export interface UsageResponse {
tier: SubscriptionTier;
videos_used: number;
videos_limit: number;
billing_cycle_start: string;
billing_cycle_end: string;
total_cost_this_month: number;
}
// ═══════════════════════════════════════════
// VIDEO OUTPUT URLS
// ═══════════════════════════════════════════
export interface VideoOutputUrls {
master: string; // 1920x1080 16:9
vertical: string; // 1080x1920 9:16
square: string; // 1080x1080 1:1
portrait: string; // 1080x1350 4:5
thumbnail: string; // jpg
}
// ═══════════════════════════════════════════
// SUBSCRIPTION TIER LIMITS
// ═══════════════════════════════════════════
export const TIER_LIMITS: Record monthly_videos: number;
price_cents: number;
max_clips_per_video: number;
models_allowed: ModelPreference[];
formats: string[];
}> = {
free: {
monthly_videos: 0,
price_cents: 0,
max_clips_per_video: 0,
models_allowed: [],
formats: [],
},
starter: {
monthly_videos: 5,
price_cents: 7900, // $79/mo
max_clips_per_video: 10,
models_allowed: ["veo_31_fast"],
formats: ["master", "thumbnail"],
},
pro: {
monthly_videos: 15,
price_cents: 14900, // $149/mo
max_clips_per_video: 15,
models_allowed: ["veo_31_fast", "kling_3"],
formats: ["master", "vertical", "square", "portrait", "thumbnail"],
},
team: {
monthly_videos: 50,
price_cents: 29900, // $299/mo
max_clips_per_video: 15,
models_allowed: ["veo_31_fast", "kling_3", "veo_31_quality"],
formats: ["master", "vertical", "square", "portrait", "thumbnail"],
},
};
```
---
## 8. External API Contracts
### 8A. Kie.ai — Kling 3.0 (Primary Video Generation)
**SDK:** `kie.ai SDK (raw fetch)`
**Docs:** https://Kie.ai/models/kie-ai/kling-video/o3/pro/image-to-video/api
#### Kling 3.0 Image-to-Video with Start + End Frame
```typescript
// src/services/kie.ts
import { config } from "../config";
import { logger } from "../utils/logger";
const KIE_API_KEY = config.kie.apiKey;
// ─── MODEL IDS ───
const MODELS = {
kling_3_standard_i2v: "kie-ai/kling-video/v3/standard/image-to-video",
kling_3_pro_i2v: "kie-ai/kling-video/o3/pro/image-to-video",
kling_3_standard_t2v: "kie-ai/kling-video/v3/standard/text-to-video",
kling_3_pro_t2v: "kie-ai/kling-video/o3/pro/text-to-video",
} as const;
// ─── REQUEST INTERFACE ───
export interface KieKlingRequest {
prompt: string;
image_url: string; // Start frame
tail_image_url?: string; // End frame (for continuity chain)
duration?: string; // "3" to "15" (seconds, as string)
aspect_ratio?: "16:9" | "9:16" | "1:1";
cfg_scale?: number; // 0-1, default 0.5
audio?: boolean; // Generate native audio (default false for us)
negative_prompt?: string;
elements?: Array<{ // For realtor identity (V2)
image_url: string; // Frontal reference
reference_image_urls?: string[]; // Additional angles
}>;
}
// ─── RESPONSE INTERFACE ───
export interface KieKlingResponse {
video: {
url: string; // Direct URL to generated video
content_type: string; // "video/mp4"
file_name: string;
file_size: number;
};
seed: number;
timings: {
inference: number; // Seconds to generate
};
}
// ─── GENERATE CLIP ───
export async function generateClipFal(
request: KieKlingRequest,
options?: { maxRetries?: number; timeout?: number }
): Promise {
const model = MODELS.kling_3_standard_i2v;
const startTime = Date.now();
logger.info({
msg: "Kie.ai clip generation started",
model,
hasEndFrame: !!request.tail_image_url,
duration: request.duration,
});
try {
const result = await kieClient.createTask(model, {
input: {
prompt: request.prompt,
image_url: request.image_url,
tail_image_url: request.tail_image_url,
duration: request.duration || "5",
aspect_ratio: request.aspect_ratio || "16:9",
cfg_scale: request.cfg_scale ?? 0.5,
audio: request.audio ?? false,
negative_prompt: request.negative_prompt || "blurry, distorted, low quality, watermark, text overlay",
...(request.elements ? { elements: request.elements } : {}),
},
logs: true,
onQueueUpdate: (update) => {
if (update.status === "IN_PROGRESS") {
logger.debug(`Kie.ai progress: ${update.logs?.[update.logs.length - 1]?.message || "processing"}`);
}
},
}) as KieKlingResponse;
const elapsed = (Date.now() - startTime) / 1000;
logger.info({
msg: "Kie.ai clip generation complete",
elapsed: `${elapsed.toFixed(1)}s`,
videoUrl: result.video.url,
});
return result;
} catch (err: any) {
logger.error({ msg: "Kie.ai generation failed", error: err.message });
throw err;
}
}
// ─── COST CALCULATION ───
export function calculateKieCost(
durationSeconds: number,
model: string,
audio: boolean
): number {
// Kling 3.0 Standard pricing per second
const ratePerSecond = audio ? 0.252 : 0.168;
return durationSeconds * ratePerSecond;
}
```
### 8B. kie.ai — Veo 3.1 (Backup Video) + Suno (Music)
**No SDK** — raw REST API.
**Base URL:** `https://api.kie.ai`
**Auth:** Bearer token in header
#### Veo 3.1 Image-to-Video
```typescript
// src/services/kie.ts
import { config } from "../config";
import { logger } from "../utils/logger";
const KIE_BASE = config.kie.baseUrl;
const headers = {
"Authorization": `Bearer ${config.kie.apiKey}`,
"Content-Type": "application/json",
};
// ═══════════════════════════════════════════
// VEO 3.1 VIDEO GENERATION
// ═══════════════════════════════════════════
export interface KieVeoRequest {
prompt: string;
image_url: string; // Start frame
last_frame?: string; // End frame URL
model?: "veo-3.1-fast" | "veo-3.1";
duration?: number; // 4, 6, or 8 seconds
aspect_ratio?: "16:9" | "9:16";
generate_audio?: boolean;
reference_images?: string[]; // Up to 4 for identity
callback_url?: string;
}
export interface KieTaskResponse {
task_id: string;
status: "pending" | "processing" | "completed" | "failed";
result?: {
video_url: string;
duration: number;
width: number;
height: number;
};
error?: string;
}
// Create generation task
export async function createVeoTask(request: KieVeoRequest): Promise {
const body = {
model: request.model || "veo-3.1-fast",
generation_type: request.last_frame
? "FIRST_AND_LAST_FRAMES_2_VIDEO"
: "IMAGE_TO_VIDEO",
prompt: request.prompt,
image_url: request.image_url,
...(request.last_frame ? { last_frame: request.last_frame } : {}),
duration: request.duration || 8,
aspect_ratio: request.aspect_ratio || "16:9",
generate_audio: request.generate_audio ?? false,
...(request.reference_images ? { reference_images: request.reference_images } : {}),
...(request.callback_url ? { callback_url: request.callback_url } : {}),
};
logger.info({ msg: "kie.ai Veo task creating", model: body.model });
const response = await fetch(`${KIE_BASE}/v1/video/generate`, {
method: "POST",
headers,
body: JSON.stringify(body),
});
if (!response.ok) {
const error = await response.text();
throw new Error(`kie.ai Veo create failed (${response.status}): ${error}`);
}
const data = await response.json();
logger.info({ msg: "kie.ai Veo task created", taskId: data.task_id });
return data.task_id;
}
// Poll task status
export async function getVeoTaskStatus(taskId: string): Promise {
const response = await fetch(`${KIE_BASE}/v1/task/${taskId}`, {
method: "GET",
headers,
});
if (!response.ok) {
throw new Error(`kie.ai task status failed (${response.status})`);
}
return response.json();
}
// Poll until complete (with timeout)
export async function waitForVeoTask(
taskId: string,
timeoutMs: number = 300000, // 5 minutes
pollIntervalMs: number = 5000
): Promise {
const start = Date.now();
while (Date.now() - start < timeoutMs) {
const status = await getVeoTaskStatus(taskId);
if (status.status === "completed") return status;
if (status.status === "failed") {
throw new Error(`kie.ai Veo generation failed: ${status.error}`);
}
await new Promise((r) => setTimeout(r, pollIntervalMs));
}
throw new Error(`kie.ai Veo task ${taskId} timed out after ${timeoutMs}ms`);
}
// Cost calculation
export function calculateKieVeoCost(
model: "veo-3.1-fast" | "veo-3.1",
durationSeconds: number,
audio: boolean
): number {
// Per 8-second clip (kie.ai uses fixed pricing per clip)
const costs: Record> = {
"veo-3.1-fast": { "no_audio": 0.40, "audio": 0.60 },
"veo-3.1": { "no_audio": 2.00, "audio": 3.20 },
};
const key = audio ? "audio" : "no_audio";
return costs[model]?.[key] || 0.40;
}
// ═══════════════════════════════════════════
// SUNO MUSIC GENERATION
// ═══════════════════════════════════════════
export interface KieSunoRequest {
prompt: string;
model?: "v4" | "v4.5" | "v5";
make_instrumental?: boolean;
duration?: number; // Target duration in seconds
style?: string; // e.g. "ambient, elegant, real estate tour"
title?: string;
custom_mode?: boolean;
callback_url?: string;
}
export interface KieSunoResponse {
task_id: string;
status: "pending" | "processing" | "completed" | "failed";
result?: {
audio_url: string;
title: string;
duration: number;
style: string;
}[];
error?: string;
}
// Create music generation task
export async function createSunoTask(request: KieSunoRequest): Promise {
const body = {
model: request.model || "v5",
prompt: request.prompt,
make_instrumental: request.make_instrumental ?? true,
custom_mode: request.custom_mode ?? true,
...(request.style ? { style: request.style } : {}),
...(request.title ? { title: request.title } : {}),
...(request.callback_url ? { callback_url: request.callback_url } : {}),
};
logger.info({ msg: "kie.ai Suno task creating", style: body.style });
const response = await fetch(`${KIE_BASE}/v1/suno/generate`, {
method: "POST",
headers,
body: JSON.stringify(body),
});
if (!response.ok) {
const error = await response.text();
throw new Error(`kie.ai Suno create failed (${response.status}): ${error}`);
}
const data = await response.json();
return data.task_id;
}
// Poll until complete
export async function waitForSunoTask(
taskId: string,
timeoutMs: number = 120000, // 2 minutes
pollIntervalMs: number = 5000
): Promise {
const start = Date.now();
while (Date.now() - start < timeoutMs) {
const response = await fetch(`${KIE_BASE}/v1/task/${taskId}`, {
method: "GET",
headers,
});
const data: KieSunoResponse = await response.json();
if (data.status === "completed") return data;
if (data.status === "failed") {
throw new Error(`kie.ai Suno generation failed: ${data.error}`);
}
await new Promise((r) => setTimeout(r, pollIntervalMs));
}
throw new Error(`kie.ai Suno task ${taskId} timed out`);
}
```
### 8C. OpenRouter — LLM for Floorplan Analysis & Prompts
```typescript
// src/services/openrouter.ts
import { config } from "../config";
import { logger } from "../utils/logger";
const OPENROUTER_BASE = config.openRouter.baseUrl;
interface OpenRouterMessage {
role: "system" | "user" | "assistant";
content: string | Array<{
type: "text" | "image_url";
text?: string;
image_url?: { url: string };
}>;
}
interface OpenRouterResponse {
choices: Array<{
message: {
content: string;
};
}>;
usage: {
prompt_tokens: number;
completion_tokens: number;
total_tokens: number;
};
model: string;
}
export async function chatCompletion(
messages: OpenRouterMessage[],
options?: {
model?: string;
temperature?: number;
max_tokens?: number;
response_format?: { type: "json_object" };
}
): Promise<{ content: string; model: string; tokens: number; cost: number }> {
const model = options?.model || config.openRouter.defaultModel;
const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
method: "POST",
headers: {
"Authorization": `Bearer ${config.openRouter.apiKey}`,
"Content-Type": "application/json",
"HTTP-Referer": config.app.url,
"X-Title": "TourReel",
},
body: JSON.stringify({
model,
messages,
temperature: options?.temperature ?? 0.3,
max_tokens: options?.max_tokens ?? 4096,
...(options?.response_format ? { response_format: options.response_format } : {}),
}),
});
if (!response.ok) {
const error = await response.text();
// Fallback to secondary model
if (model === config.openRouter.defaultModel && config.openRouter.fallbackModel) {
logger.warn(`OpenRouter primary model failed, trying fallback: ${config.openRouter.fallbackModel}`);
return chatCompletion(messages, {
...options,
model: config.openRouter.fallbackModel,
});
}
throw new Error(`OpenRouter failed (${response.status}): ${error}`);
}
const data: OpenRouterResponse = await response.json();
const content = data.choices[0]?.message?.content || "";
const tokens = data.usage?.total_tokens || 0;
// Approximate cost (varies by model)
const cost = tokens * 0.000003; // ~$3/1M tokens average
return { content, model: data.model, tokens, cost };
}
// Vision call (for floorplan analysis)
export async function visionAnalysis(
imageUrl: string,
prompt: string,
options?: { model?: string }
): Promise<{ content: string; cost: number }> {
return chatCompletion([
{
role: "user",
content: [
{ type: "image_url", image_url: { url: imageUrl } },
{ type: "text", text: prompt },
],
},
], {
...options,
response_format: { type: "json_object" },
temperature: 0.2,
});
}
```
### 8D. Cloudflare R2
```typescript
// src/services/r2.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { createReadStream, statSync } from "fs";
import { lookup } from "mime-types";
import { config } from "../config";
import { logger } from "../utils/logger";
const r2Client = new S3Client({
region: "auto",
endpoint: config.r2.endpoint,
credentials: {
accessKeyId: config.r2.accessKeyId,
secretAccessKey: config.r2.secretAccessKey,
},
});
export async function uploadToR2(
localPath: string,
r2Key: string,
contentType?: string
): Promise {
const detectedType = contentType || lookup(localPath) || "application/octet-stream";
const fileSize = statSync(localPath).size;
logger.info({
msg: "Uploading to R2",
key: r2Key,
size: `${(fileSize / 1024 / 1024).toFixed(1)}MB`,
type: detectedType,
});
await r2Client.send(new PutObjectCommand({
Bucket: config.r2.bucket,
Key: r2Key,
Body: createReadStream(localPath),
ContentType: detectedType,
CacheControl: "public, max-age=31536000", // 1 year (videos are immutable)
}));
const publicUrl = `${config.r2.publicUrl}/${r2Key}`;
logger.info({ msg: "R2 upload complete", url: publicUrl });
return publicUrl;
}
export async function deleteFromR2(r2Key: string): Promise {
await r2Client.send(new DeleteObjectCommand({
Bucket: config.r2.bucket,
Key: r2Key,
}));
logger.info({ msg: "R2 object deleted", key: r2Key });
}
export async function objectExists(r2Key: string): Promise {
try {
await r2Client.send(new HeadObjectCommand({
Bucket: config.r2.bucket,
Key: r2Key,
}));
return true;
} catch {
return false;
}
}
// Build R2 key for a video job output
export function buildR2Key(userId: string, jobId: string, filename: string): string {
return `${userId}/${jobId}/${filename}`;
}
```
---
## 9. BullMQ Job Definitions
### `src/queue/connection.ts`
```typescript
import Redis from "ioredis";
import { config } from "../config";
export const redisConnection = new Redis(config.redis.url, {
maxRetriesPerRequest: null, // Required by BullMQ
});
```
### `src/queue/queues.ts`
```typescript
import { Queue } from "bullmq";
import { redisConnection } from "./connection";
// Main pipeline queue — one job = one complete video
export const videoPipelineQueue = new Queue("video-pipeline", {
connection: redisConnection,
defaultJobOptions: {
attempts: 3,
backoff: { type: "exponential", delay: 30000 },
removeOnComplete: { age: 86400 * 7 }, // Keep 7 days
removeOnFail: { age: 86400 * 30 }, // Keep 30 days
},
});
// Sub-queue for individual clip generation (parallelizable)
export const clipGenerationQueue = new Queue("clip-generation", {
connection: redisConnection,
defaultJobOptions: {
attempts: 3,
backoff: { type: "exponential", delay: 10000 },
removeOnComplete: { age: 86400 },
removeOnFail: { age: 86400 * 7 },
},
});
export async function initQueues() {
// Drain any stale jobs from previous crashes
await videoPipelineQueue.obliterate({ force: true });
await clipGenerationQueue.obliterate({ force: true });
}
// ─── JOB DATA INTERFACES ───
export interface VideoPipelineJobData {
jobId: string; // video_jobs.id
listingId: string; // listings.id
userId: string; // users.id
}
export interface ClipGenerationJobData {
clipId: string; // clips.id
jobId: string; // video_jobs.id
clipNumber: number;
prompt: string;
startFrameUrl: string | null;
endFrameUrl: string | null;
modelPreference: string;
durationSeconds: number;
}
```
---
## 10. Video Pipeline — The Core Orchestrator
### `src/services/ffmpeg.ts`
```typescript
// FFmpeg wrapper — all video processing happens here
import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { join } from "path";
import { logger } from "../utils/logger";
import { config } from "../config";
const execFileAsync = promisify(execFile);
// ─── GET VIDEO DURATION ───
export async function getVideoDuration(filePath: string): Promise {
const { stdout } = await execFileAsync("ffprobe", [
"-v", "quiet",
"-print_format", "json",
"-show_format",
filePath,
]);
const data = JSON.parse(stdout);
return parseFloat(data.format.duration);
}
// ─── NORMALIZE CLIP ───
// Ensure consistent resolution, framerate, codec for stitching
export async function normalizeClip(
inputPath: string,
outputPath: string,
options?: { width?: number; height?: number; fps?: number }
): Promise {
const width = options?.width || 1920;
const height = options?.height || 1080;
const fps = options?.fps || 24;
await execFileAsync("ffmpeg", [
"-i", inputPath,
"-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
"-r", String(fps),
"-c:v", "libx264",
"-preset", "fast",
"-crf", "18",
"-an", // Strip audio (we add music later)
"-movflags", "+faststart",
"-y",
outputPath,
], { timeout: 120000 });
logger.debug({ msg: "Clip normalized", input: inputPath, output: outputPath });
}
// ─── STITCH CLIPS WITH XFADE ───
export async function stitchClips(
clipPaths: string[], // Ordered array of normalized clip file paths
outputPath: string,
transition: string = "fade",
xfadeDuration: number = 0.5
): Promise<{ duration: number }> {
if (clipPaths.length === 0) throw new Error("No clips to stitch");
if (clipPaths.length === 1) {
// Single clip — just copy
await execFileAsync("ffmpeg", [
"-i", clipPaths[0], "-c", "copy", "-y", outputPath,
]);
const duration = await getVideoDuration(outputPath);
return { duration };
}
// Get all durations
const durations: number[] = [];
for (const clip of clipPaths) {
durations.push(await getVideoDuration(clip));
}
// Build xfade filter chain
const inputs: string[] = [];
for (const clip of clipPaths) {
inputs.push("-i", clip);
}
const filterParts: string[] = [];
const n = clipPaths.length;
// First xfade: [0:v][1:v] → [v01]
let offset = durations[0] - xfadeDuration;
filterParts.push(
`[0:v][1:v]xfade=transition=${transition}:duration=${xfadeDuration}:offset=${offset}[v01]`
);
let cumulative = durations[0] + durations[1] - xfadeDuration;
// Chain remaining clips
for (let i = 2; i < n; i++) {
const prevLabel = `v${String(i - 2).padStart(2, "0")}${String(i - 1).padStart(2, "0")}`;
const currLabel = `v${String(i - 1).padStart(2, "0")}${String(i).padStart(2, "0")}`;
offset = cumulative - xfadeDuration;
filterParts.push(
`[${prevLabel}][${i}:v]xfade=transition=${transition}:duration=${xfadeDuration}:offset=${offset}[${currLabel}]`
);
cumulative += durations[i] - xfadeDuration;
}
const finalLabel = `v${String(n - 2).padStart(2, "0")}${String(n - 1).padStart(2, "0")}`;
const filterComplex = filterParts.join(";");
const args = [
...inputs,
"-filter_complex", filterComplex,
"-map", `[${finalLabel}]`,
"-c:v", "libx264",
"-preset", "medium",
"-crf", "18",
"-movflags", "+faststart",
"-y",
outputPath,
];
logger.info({ msg: "Stitching clips", count: n, transition });
await execFileAsync("ffmpeg", args, { timeout: 300000 }); // 5 min timeout
const duration = await getVideoDuration(outputPath);
logger.info({ msg: "Stitch complete", duration: `${duration.toFixed(1)}s` });
return { duration };
}
// ─── ADD MUSIC OVERLAY ───
export async function addMusicOverlay(
videoPath: string,
musicPath: string,
outputPath: string,
options?: { volume?: number; fadeInSec?: number; fadeOutSec?: number }
): Promise {
const volume = options?.volume ?? 0.3;
const fadeIn = options?.fadeInSec ?? 2;
const fadeOut = options?.fadeOutSec ?? 3;
const videoDuration = await getVideoDuration(videoPath);
const fadeOutStart = Math.max(0, videoDuration - fadeOut);
await execFileAsync("ffmpeg", [
"-i", videoPath,
"-i", musicPath,
"-filter_complex",
`[1:a]volume=${volume},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}[music]`,
"-map", "0:v",
"-map", "[music]",
"-c:v", "copy",
"-c:a", "aac",
"-b:a", "192k",
"-shortest",
"-movflags", "+faststart",
"-y",
outputPath,
], { timeout: 120000 });
logger.info({ msg: "Music overlay complete", output: outputPath });
}
// ─── GENERATE FORMAT VARIANTS ───
export async function generateVariants(
masterPath: string,
outputDir: string
): Promise<{ vertical: string; square: string; portrait: string; thumbnail: string }> {
const vertical = join(outputDir, "vertical.mp4");
const square = join(outputDir, "square.mp4");
const portrait = join(outputDir, "portrait.mp4");
const thumbnail = join(outputDir, "thumb.jpg");
// 9:16 Vertical (TikTok/Reels)
await execFileAsync("ffmpeg", [
"-i", masterPath,
"-vf", "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920",
"-c:v", "libx264", "-crf", "20", "-c:a", "copy",
"-movflags", "+faststart", "-y", vertical,
], { timeout: 120000 });
// 1:1 Square (Instagram)
await execFileAsync("ffmpeg", [
"-i", masterPath,
"-vf", "crop=ih:ih:(iw-ih)/2:0,scale=1080:1080",
"-c:v", "libx264", "-crf", "20", "-c:a", "copy",
"-movflags", "+faststart", "-y", square,
], { timeout: 120000 });
// 4:5 Portrait
await execFileAsync("ffmpeg", [
"-i", masterPath,
"-vf", "crop=ih*4/5:ih:(iw-ih*4/5)/2:0,scale=1080:1350",
"-c:v", "libx264", "-crf", "20", "-c:a", "copy",
"-movflags", "+faststart", "-y", portrait,
], { timeout: 120000 });
// Thumbnail (first frame)
await execFileAsync("ffmpeg", [
"-i", masterPath,
"-vf", "select=eq(n\\,0)",
"-frames:v", "1",
"-q:v", "2",
"-y", thumbnail,
], { timeout: 30000 });
logger.info({ msg: "All format variants generated" });
return { vertical, square, portrait, thumbnail };
}
// ─── EXTRACT LAST FRAME (for continuity chain) ───
export async function extractLastFrame(
videoPath: string,
outputPath: string
): Promise {
// Get total frames
const { stdout } = await execFileAsync("ffprobe", [
"-v", "quiet",
"-count_frames",
"-select_streams", "v:0",
"-show_entries", "stream=nb_read_frames",
"-print_format", "json",
videoPath,
]);
const data = JSON.parse(stdout);
const totalFrames = parseInt(data.streams[0].nb_read_frames) - 1;
await execFileAsync("ffmpeg", [
"-i", videoPath,
"-vf", `select=eq(n\\,${totalFrames})`,
"-frames:v", "1",
"-q:v", "1",
"-y", outputPath,
], { timeout: 30000 });
logger.debug({ msg: "Last frame extracted", frame: totalFrames, output: outputPath });
}
```
### `src/services/floorplan-analyzer.ts`
```typescript
import { visionAnalysis } from "./openrouter";
import { FloorplanAnalysis, TourRoom } from "../types";
import { logger } from "../utils/logger";
const FLOORPLAN_PROMPT = `You are a real estate floorplan analyst. Analyze this floorplan image and return a JSON object with this exact structure:
{
"rooms": [
{
"name": "Room Name",
"type": "bedroom|bathroom|kitchen|living|dining|foyer|hallway|garage|closet|office|laundry|pantry|other",
"approximate_position": { "x": 0.5, "y": 0.3 },
"connects_to": ["Other Room Name"],
"floor": 1
}
],
"suggested_tour_sequence": ["Exterior", "Front Door", "Foyer", "Living Room", ...],
"total_rooms": 8,
"property_type": "house|apartment|condo|townhouse",
"floors": 1,
"special_features": ["pool", "garage", "balcony", "fireplace"],
"confidence_score": 0.85
}
Rules:
- Start tour from "Exterior" → "Front Door" always
- Follow a logical walking path (don't teleport between rooms)
- Prefer: entrance → main living areas → kitchen → bedrooms → bathrooms → outdoor
- End with backyard/patio if visible
- For multi-floor: complete one floor before going to the next
- Position values are 0-1 normalized (top-left origin)
- connects_to should list rooms directly accessible through a door or opening
- confidence_score: 0-1 how confident you are in the analysis
Return ONLY valid JSON. No markdown, no explanation.`;
export async function analyzeFloorplan(
floorplanUrl: string,
propertyType?: string
): Promise {
const prompt = propertyType
? `${FLOORPLAN_PROMPT}\n\nNote: This is a ${propertyType}.`
: FLOORPLAN_PROMPT;
logger.info({ msg: "Analyzing floorplan", url: floorplanUrl });
const { content, cost } = await visionAnalysis(floorplanUrl, prompt);
try {
// Parse JSON from response (handle possible markdown wrapping)
let jsonStr = content.trim();
if (jsonStr.startsWith("```")) {
jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
}
const analysis: FloorplanAnalysis = JSON.parse(jsonStr);
logger.info({
msg: "Floorplan analysis complete",
rooms: analysis.total_rooms,
floors: analysis.floors,
confidence: analysis.confidence_score,
cost: `$${cost.toFixed(4)}`,
});
return analysis;
} catch (err) {
logger.error({ msg: "Failed to parse floorplan analysis", content: content.substring(0, 200) });
throw new Error("Floorplan analysis returned invalid JSON");
}
}
// Convert FloorplanAnalysis into ordered TourRoom array
export function buildTourSequence(analysis: FloorplanAnalysis): TourRoom[] {
const sequence: TourRoom[] = [];
const rooms = analysis.suggested_tour_sequence;
for (let i = 0; i < rooms.length - 1; i++) {
const from = rooms[i];
const to = rooms[i + 1];
let transition_type: TourRoom["transition_type"] = "walk";
if (to.toLowerCase().includes("door") || to.toLowerCase().includes("entrance")) {
transition_type = "enter";
} else if (to.toLowerCase().includes("stair") || to.toLowerCase().includes("upstairs")) {
transition_type = "stairs";
} else if (to.toLowerCase().includes("exterior") || to.toLowerCase().includes("backyard")) {
transition_type = "exit";
}
sequence.push({
order: i + 1,
from,
to,
transition_type,
});
}
return sequence;
}
```
### `src/services/prompt-generator.ts`
```typescript
import { chatCompletion } from "./openrouter";
import { TourRoom, ClipPrompt } from "../types";
import { logger } from "../utils/logger";
const PROMPT_GENERATION_SYSTEM = `You are a cinematic real estate video director. Generate video clip prompts for an AI video generator (Kling 3.0 / Veo 3.1).
Each clip shows a smooth camera movement transitioning from one room to the next. The camera should feel like a professional Steadicam walkthrough — smooth, eye-level, gentle forward movement.
For each clip, output a detailed video generation prompt that includes:
- Camera movement type (dolly forward, tracking shot, gentle pan)
- Lighting description (match time of day consistently across all clips)
- Architectural/interior design details
- The transition between rooms (through doorway, around corner, etc.)
Style rules for ALL clips:
- Professional real estate cinematography
- Warm, inviting lighting (golden hour feel)
- Smooth, steady camera movement
- No people unless specified
- 4K quality, shallow depth of field
- Consistent color grading across all clips
Return a JSON array of clip prompts.`;
export async function generateClipPrompts(
tourSequence: TourRoom[],
propertyDetails: {
property_type: string;
style?: string; // e.g. "modern", "traditional", "mediterranean"
exterior_description?: string;
}
): Promise {
const userMessage = `Property: ${propertyDetails.property_type}
${propertyDetails.style ? `Style: ${propertyDetails.style}` : ""}
${propertyDetails.exterior_description ? `Exterior: ${propertyDetails.exterior_description}` : ""}
Tour sequence (generate one prompt per transition):
${tourSequence.map((t, i) => `${i + 1}. ${t.from} → ${t.to} (${t.transition_type})`).join("\n")}
Return a JSON array where each element has:
{
"clip_number": 1,
"from_room": "Exterior",
"to_room": "Front Door",
"prompt": "Detailed cinematic prompt here...",
"duration_seconds": 5
}
Return ONLY valid JSON array. No markdown.`;
logger.info({ msg: "Generating clip prompts", clips: tourSequence.length });
const { content, cost } = await chatCompletion(
[
{ role: "system", content: PROMPT_GENERATION_SYSTEM },
{ role: "user", content: userMessage },
],
{
temperature: 0.4,
max_tokens: 8192,
response_format: { type: "json_object" },
}
);
try {
let jsonStr = content.trim();
if (jsonStr.startsWith("```")) {
jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
}
// Handle both {clips: [...]} and direct array
let parsed = JSON.parse(jsonStr);
const clips: ClipPrompt[] = Array.isArray(parsed) ? parsed : parsed.clips || parsed.prompts || [];
// Ensure all clips have required fields
const validated = clips.map((clip: any, index: number) => ({
clip_number: clip.clip_number || index + 1,
from_room: clip.from_room || tourSequence[index]?.from || `Room ${index}`,
to_room: clip.to_room || tourSequence[index]?.to || `Room ${index + 1}`,
prompt: clip.prompt,
start_frame_url: null, // Set during generation
end_frame_url: null, // Set during generation
duration_seconds: clip.duration_seconds || 5,
}));
logger.info({
msg: "Clip prompts generated",
count: validated.length,
cost: `$${cost.toFixed(4)}`,
});
return validated;
} catch (err) {
logger.error({ msg: "Failed to parse clip prompts", content: content.substring(0, 200) });
throw new Error("Prompt generation returned invalid JSON");
}
}
```
---
## 11. Frontend — Key Component Implementations
### `src/lib/api-client.ts` (Frontend)
```typescript
// Typed API client for calling the RackNerd backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
interface ApiOptions {
method?: string;
body?: any;
token?: string;
headers?: Record;
}
class ApiError extends Error {
constructor(public status: number, message: string) {
super(message);
this.name = "ApiError";
}
}
async function apiFetch(path: string, options: ApiOptions = {}): Promise {
const { method = "GET", body, token, headers = {} } = options;
const res = await fetch(`${API_URL}${path}`, {
method,
headers: {
"Content-Type": "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
...headers,
},
...(body ? { body: JSON.stringify(body) } : {}),
});
if (!res.ok) {
const error = await res.json().catch(() => ({ message: res.statusText }));
throw new ApiError(res.status, error.message || "Request failed");
}
return res.json();
}
// ─── API METHODS ───
export const api = {
// Listings
listings: {
list: (token: string) =>
apiFetch<{ listings: any[] }>("/api/listings", { token }),
create: (token: string, data: any) =>
apiFetch<{ listing: any }>("/api/listings", { method: "POST", body: data, token }),
get: (token: string, id: string) =>
apiFetch<{ listing: any }>(`/api/listings/${id}`, { token }),
},
// Video Jobs
jobs: {
list: (token: string) =>
apiFetch<{ jobs: any[] }>("/api/jobs", { token }),
create: (token: string, data: any) =>
apiFetch<{ job: any }>("/api/jobs", { method: "POST", body: data, token }),
get: (token: string, id: string) =>
apiFetch<{ job: any; listing: any; clips: any[]; music_track: any }>(`/api/jobs/${id}`, { token }),
cancel: (token: string, id: string) =>
apiFetch<{ success: boolean }>(`/api/jobs/${id}`, { method: "DELETE", token }),
},
// Clips
clips: {
approve: (token: string, jobId: string, clipId: string) =>
apiFetch<{ clip: any }>(`/api/jobs/${jobId}/clips/${clipId}/approve`, { method: "POST", token }),
reject: (token: string, jobId: string, clipId: string, reason: string) =>
apiFetch<{ clip: any }>(`/api/jobs/${jobId}/clips/${clipId}/reject`, { method: "POST", body: { reason }, token }),
regenerate: (token: string, jobId: string, clipId: string) =>
apiFetch<{ clip: any }>(`/api/jobs/${jobId}/clips/${clipId}/regenerate`, { method: "POST", token }),
},
// Floorplan
floorplan: {
analyze: (token: string, data: { floorplan_url: string; property_type?: string }) =>
apiFetch<{ analysis: any; suggested_sequence: any[] }>("/api/floorplan/analyze", {
method: "POST", body: data, token,
}),
},
// Usage
usage: {
get: (token: string) =>
apiFetch("/api/usage", { token }),
},
// Upload (presigned URL approach for direct-to-R2)
upload: {
getPresignedUrl: (token: string, filename: string, contentType: string) =>
apiFetch<{ uploadUrl: string; fileUrl: string; key: string }>(
"/api/upload/presigned",
{ method: "POST", body: { filename, contentType }, token }
),
},
};
```
### `src/hooks/use-job-polling.ts`
```typescript
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api-client";
export function useJobPolling(jobId: string | null, enabled: boolean = true) {
const { getToken } = useAuth();
const { data, error, isLoading, mutate } = useSWR(
enabled && jobId ? `job-${jobId}` : null,
async () => {
const token = await getToken();
if (!token || !jobId) return null;
return api.jobs.get(token, jobId);
},
{
refreshInterval: (data) => {
// Poll every 5s while in progress, stop when complete
const status = data?.job?.status;
if (!status) return 5000;
if (["complete", "failed", "cancelled"].includes(status)) return 0;
return 5000;
},
revalidateOnFocus: false,
}
);
return {
job: data?.job ?? null,
listing: data?.listing ?? null,
clips: data?.clips ?? [],
musicTrack: data?.music_track ?? null,
isLoading,
error,
refresh: mutate,
};
}
```
---
## 12. API Routes — Express (RackNerd)
### `src/api/router.ts`
```typescript
import { Router } from "express";
import { authMiddleware } from "./middleware/auth";
import { listingRoutes } from "./routes/listings";
import { jobRoutes } from "./routes/jobs";
import { clipRoutes } from "./routes/clips";
import { floorplanRoutes } from "./routes/floorplan";
import { usageRoutes } from "./routes/usage";
import { webhookRoutes } from "./routes/webhooks";
export const router = Router();
// Webhooks — NO auth (verified by signature)
router.use("/webhooks", webhookRoutes);
// All other routes require Clerk JWT
router.use(authMiddleware);
router.use("/listings", listingRoutes);
router.use("/jobs", jobRoutes);
router.use("/floorplan", floorplanRoutes);
router.use("/usage", usageRoutes);
```
### `src/api/routes/jobs.ts` — Full Implementation
```typescript
import { Router, Request, Response } from "express";
import { z } from "zod";
import { query, queryOne } from "../../db/client";
import { videoPipelineQueue, VideoPipelineJobData } from "../../queue/queues";
import { TIER_LIMITS } from "../../types";
import { logger } from "../../utils/logger";
export const jobRoutes = Router();
// ─── LIST JOBS ───
// GET /api/jobs?status=complete&page=1&limit=20
jobRoutes.get("/", async (req: Request, res: Response) => {
const userId = req.userId!;
const status = req.query.status as string | undefined;
const page = Math.max(1, parseInt(req.query.page as string) || 1);
const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
const offset = (page - 1) * limit;
let sql = `
SELECT vj.*, l.address, l.city, l.state, l.thumbnail_url AS listing_thumbnail
FROM video_jobs vj
JOIN listings l ON l.id = vj.listing_id
WHERE vj.user_id = $1
`;
const params: any[] = [userId];
if (status) {
sql += ` AND vj.status = $${params.length + 1}`;
params.push(status);
}
sql += ` ORDER BY vj.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
params.push(limit, offset);
const jobs = await query(sql, params);
// Get total count
let countSql = `SELECT COUNT(*) FROM video_jobs WHERE user_id = $1`;
const countParams: any[] = [userId];
if (status) {
countSql += ` AND status = $2`;
countParams.push(status);
}
const [{ count }] = await query(countSql, countParams);
res.json({
jobs,
pagination: {
page,
limit,
total: parseInt(count),
total_pages: Math.ceil(parseInt(count) / limit),
},
});
});
// ─── GET SINGLE JOB ───
// GET /api/jobs/:id
jobRoutes.get("/:id", async (req: Request, res: Response) => {
const userId = req.userId!;
const jobId = req.params.id;
const job = await queryOne(
"SELECT * FROM video_jobs WHERE id = $1 AND user_id = $2",
[jobId, userId]
);
if (!job) {
return res.status(404).json({ error: "Job not found" });
}
const listing = await queryOne(
"SELECT * FROM listings WHERE id = $1",
[job.listing_id]
);
const clips = await query(
"SELECT * FROM clips WHERE video_job_id = $1 ORDER BY clip_number",
[jobId]
);
let music_track = null;
if (job.music_track_id) {
music_track = await queryOne(
"SELECT * FROM music_tracks WHERE id = $1",
[job.music_track_id]
);
}
res.json({ job, listing, clips, music_track });
});
// ─── CREATE JOB ───
// POST /api/jobs
const createJobSchema = z.object({
listing_id: z.string().uuid(),
model_preference: z.enum(["kling_3", "veo_31_fast", "veo_31_quality"]).optional(),
tour_sequence: z.array(z.object({
order: z.number(),
from: z.string(),
to: z.string(),
transition_type: z.enum(["walk", "enter", "stairs", "exit"]),
})).optional(),
music_style: z.string().max(100).optional(),
music_track_id: z.string().uuid().optional(),
transition_style: z.enum([
"fade", "dissolve", "wipeleft", "wiperight",
"circleopen", "circleclose", "radial", "smoothleft",
]).optional(),
include_exterior: z.boolean().optional(),
include_backyard: z.boolean().optional(),
});
jobRoutes.post("/", async (req: Request, res: Response) => {
const userId = req.userId!;
// Validate input
const parsed = createJobSchema.safeParse(req.body);
if (!parsed.success) {
return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
}
const data = parsed.data;
// Check user exists and has subscription
const user = await queryOne("SELECT * FROM users WHERE id = $1", [userId]);
if (!user) return res.status(404).json({ error: "User not found" });
// Check tier limits
const tierLimits = TIER_LIMITS[user.subscription_tier as keyof typeof TIER_LIMITS];
if (user.videos_used_this_month >= tierLimits.monthly_videos) {
return res.status(403).json({
error: "Monthly video limit reached",
used: user.videos_used_this_month,
limit: tierLimits.monthly_videos,
});
}
// Check model is allowed for tier
const model = data.model_preference || "veo_31_fast";
if (!tierLimits.models_allowed.includes(model as any)) {
return res.status(403).json({
error: `Model ${model} not available on ${user.subscription_tier} tier`,
allowed: tierLimits.models_allowed,
});
}
// Verify listing belongs to user
const listing = await queryOne(
"SELECT * FROM listings WHERE id = $1 AND user_id = $2",
[data.listing_id, userId]
);
if (!listing) return res.status(404).json({ error: "Listing not found" });
// Create job
const [job] = await query(
`INSERT INTO video_jobs (
listing_id, user_id, model_preference, tour_sequence,
music_style, music_track_id, transition_style,
include_exterior, include_backyard, status
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
RETURNING *`,
[
data.listing_id,
userId,
model,
data.tour_sequence ? JSON.stringify(data.tour_sequence) : null,
data.music_style || "elegant",
data.music_track_id || null,
data.transition_style || "fade",
data.include_exterior ?? true,
data.include_backyard ?? false,
]
);
// Enqueue the pipeline job
const jobData: VideoPipelineJobData = {
jobId: job.id,
listingId: data.listing_id,
userId,
};
await videoPipelineQueue.add(`video-${job.id}`, jobData, {
priority: user.subscription_tier === "team" ? 1 : 3, // Team gets priority
});
logger.info({
msg: "Video job created and enqueued",
jobId: job.id,
model,
userId,
});
res.status(201).json({ job });
});
// ─── CANCEL JOB ───
// DELETE /api/jobs/:id
jobRoutes.delete("/:id", async (req: Request, res: Response) => {
const userId = req.userId!;
const jobId = req.params.id;
const job = await queryOne(
"SELECT * FROM video_jobs WHERE id = $1 AND user_id = $2",
[jobId, userId]
);
if (!job) return res.status(404).json({ error: "Job not found" });
if (["complete", "failed", "cancelled"].includes(job.status)) {
return res.status(400).json({ error: `Cannot cancel job in ${job.status} status` });
}
await query(
"UPDATE video_jobs SET status = 'cancelled', error_message = 'Cancelled by user' WHERE id = $1",
[jobId]
);
res.json({ success: true });
});
```
---
## 13. Deployment Configuration
### `ecosystem.config.js` (PM2)
```javascript
module.exports = {
apps: [
{
name: "tourreel-api",
script: "dist/index.js",
cwd: "/home/deploy/tourreel-worker",
instances: 1, // Single instance (6GB RAM constraint)
exec_mode: "fork",
max_memory_restart: "4G", // Restart if memory exceeds 4GB
env: {
NODE_ENV: "production",
},
error_file: "/home/deploy/logs/tourreel-error.log",
out_file: "/home/deploy/logs/tourreel-out.log",
log_date_format: "YYYY-MM-DD HH:mm:ss Z",
watch: false,
autorestart: true,
max_restarts: 10,
restart_delay: 5000,
},
],
};
```
### `scripts/cleanup-temp.sh`
```bash
#!/bin/bash
# Cron: */30 * * * * /home/deploy/tourreel-worker/scripts/cleanup-temp.sh
# Clean up temp files older than 2 hours
TEMP_DIR="/tmp/tourreel-jobs"
if [ -d "$TEMP_DIR" ]; then
find "$TEMP_DIR" -type f -mmin +120 -delete
find "$TEMP_DIR" -type d -empty -mmin +120 -delete
echo "$(date): Cleanup complete" >> /home/deploy/logs/cleanup.log
fi
```
### `vercel.json`
```json
{
"headers": [
{
"source": "/(.*)",
"headers": [
{ "key": "X-Frame-Options", "value": "DENY" },
{ "key": "X-Content-Type-Options", "value": "nosniff" }
]
}
],
"rewrites": [
{
"source": "/api/proxy/:path*",
"destination": "https://api.tourreel.com/api/:path*"
}
]
}
```
---
## 14. Critical Implementation Notes for AI Agents
**READ THIS SECTION BEFORE WRITING ANY CODE.**
1. **BullMQ concurrency = 1** — The RackNerd VPS has 6GB RAM. FFmpeg stitching uses 2-4GB. NEVER set worker concurrency above 1 for the video pipeline. Clip generation (API calls only) can run at concurrency 3.
2. **Always clean up temp files** — Every job creates ~750MB in /tmp. If cleanup fails, disk fills in ~130 jobs. ALWAYS wrap FFmpeg operations in try/finally that calls cleanupTempFiles.
3. **Frame chain extraction** — After each clip generates, extract the last frame using `extractLastFrame()` and upload it to R2. This becomes the `start_frame_url` for the next clip. This is the core continuity mechanism.
4. **Kie.ai uses callback pattern** — Submit task via `createKlingTask()`, receive completion via `/api/webhooks/kie` callback. Poll `getTaskStatus()` as fallback.
5. **No raw SQL string concatenation** — Always use parameterized queries ($1, $2). The `query()` and `queryOne()` helpers enforce this.
6. **Clerk JWT verification on every request** — The auth middleware extracts `userId` from the JWT and attaches it to `req.userId`. All database queries MUST filter by `user_id` to prevent data leaks.
7. **R2 keys must include userId** — File structure: `{userId}/{jobId}/filename.mp4`. This enables future per-user cleanup and access control.
8. **Stripe webhook must be idempotent** — The same webhook event can fire multiple times. Always check if the event was already processed (use `stripe_meter_event_id` as dedup key).
9. **FFmpeg timeout** — Set explicit timeout on ALL execFileAsync calls. Stitching: 300s. Single clip normalize: 120s. Variants: 120s each. Without timeouts, a hung FFmpeg process blocks the entire worker forever.
10. **Music tracks should be pre-generated** — Don't generate fresh music for every video. Seed 20+ tracks at deployment, store on R2, and randomly assign. Only generate fresh for premium users who request custom music.
---
## 15. Proof-of-Concept Validation Script
Run this BEFORE building the full app. If this fails, the product concept doesn't work.
### `scripts/poc-validate.ts`
```typescript
// Run: KIE_API_KEY=xxx tsx scripts/poc-validate.ts
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFileSync, mkdirSync, existsSync } from "fs";
const execFileAsync = promisify(execFile);
const POC_DIR = "/tmp/tourreel-poc";
const KIE_API_KEY = process.env.KIE_API_KEY!;
async function main() {
if (!existsSync(POC_DIR)) mkdirSync(POC_DIR, { recursive: true });
console.log("═══ TOURREEL PROOF OF CONCEPT ═══\n");
// Step 1: Generate clip 1 (exterior → door) from a test image
console.log("Step 1: Generating clip 1 with Kling 3.0...");
const clip1 = await createKlingTask({
input: {
prompt: "Smooth cinematic dolly shot approaching a modern house. Camera glides along the walkway toward the front door. Warm golden hour lighting. Professional real estate cinematography.",
image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1280", // Modern house
duration: "5",
aspect_ratio: "16:9",
audio: false,
},
});
console.log(` ✅ Clip 1 generated: ${(clip1 as any).video.url}\n`);
// Step 2: Extract last frame from clip 1
console.log("Step 2: Extracting last frame from clip 1...");
// Download clip 1
const clip1Response = await fetch((clip1 as any).video.url);
const clip1Buffer = Buffer.from(await clip1Response.arrayBuffer());
writeFileSync(`${POC_DIR}/clip1.mp4`, clip1Buffer);
await execFileAsync("ffmpeg", [
"-sseof", "-0.1", "-i", `${POC_DIR}/clip1.mp4`,
"-frames:v", "1", "-q:v", "1", "-y", `${POC_DIR}/clip1_lastframe.jpg`,
]);
console.log(" ✅ Last frame extracted\n");
// Step 3: Generate clip 2 using clip 1's last frame as start frame
console.log("Step 3: Generating clip 2 (chained from clip 1 end frame)...");
// For POC, upload lastframe somewhere accessible or use a known image
// In production, this would be uploaded to R2 first
console.log(" ⏭️ Skipping chained generation in POC (requires public URL for last frame)");
console.log(" → In production: upload last frame to R2, use R2 URL as start_frame for clip 2\n");
// Step 4: Stitch clips with xfade
console.log("Step 4: Testing FFmpeg xfade stitch...");
// Duplicate clip 1 as clip 2 for stitch test
await execFileAsync("cp", [`${POC_DIR}/clip1.mp4`, `${POC_DIR}/clip2.mp4`]);
await execFileAsync("ffmpeg", [
"-i", `${POC_DIR}/clip1.mp4`,
"-i", `${POC_DIR}/clip2.mp4`,
"-filter_complex", "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5[v]",
"-map", "[v]",
"-c:v", "libx264", "-crf", "18",
"-y", `${POC_DIR}/stitched.mp4`,
]);
console.log(" ✅ Stitch complete\n");
// Step 5: Generate music via kie.ai Suno
console.log("Step 5: Generating music via kie.ai Suno...");
const musicRes = await fetch("https://api.kie.ai/v1/suno/generate", {
method: "POST",
headers: {
Authorization: `Bearer ${process.env.KIE_API_KEY}`,
"Content-Type": "application/json",
},
body: JSON.stringify({
model: "v5",
prompt: "Elegant real estate tour background music",
make_instrumental: true,
custom_mode: true,
style: "ambient, warm piano, acoustic guitar, elegant",
title: "Property Tour",
}),
});
const musicData = await musicRes.json();
console.log(` Music task: ${musicData.task_id}`);
console.log(" ⏳ Music takes 30-60s to generate. Poll task status to get audio URL.\n");
console.log("═══ POC COMPLETE ═══");
console.log(`Files in ${POC_DIR}:`);
console.log(" clip1.mp4 — Generated video clip");
console.log(" clip1_lastframe.jpg — Extracted last frame (for chain)");
console.log(" stitched.mp4 — Two clips stitched with xfade");
console.log("\n✅ If clip1.mp4 looks good and stitched.mp4 has a smooth transition,");
console.log(" the core product concept is validated. Build everything else.\n");
}
main().catch(console.error);
```
---
*End of Implementation Spec. This document contains everything an AI coding agent needs to build TourReel from scratch. Follow the build order exactly, test each phase before proceeding, and validate the proof-of-concept before committing to full development.*