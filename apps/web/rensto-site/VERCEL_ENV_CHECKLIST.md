# Vercel Environment Variables Checklist

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**.  
Apply to **Production**, **Preview**, and **Development** as needed.

---

## Required (Core)

| Variable | Used by | Notes |
|----------|---------|-------|
| `DATABASE_URL` | Prisma, API routes | PostgreSQL connection string. Neon/Vercel Postgres injects automatically if integrated. |
| `STRIPE_SECRET_KEY` | Checkout, webhooks | From Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | `/api/webhooks/stripe` | From Stripe webhook config |
| `NEXT_PUBLIC_SITE_URL` | Checkout success URLs, downloads | `https://rensto.com` |
| `NEXT_PUBLIC_BASE_URL` | Magic link, custom solutions | `https://rensto.com` |

---

## Required for Video (TourReel)

| Variable | Used by | Notes |
|----------|---------|-------|
| `VIDEO_WORKER_URL` | `/api/video/jobs/*` | Public URL of your video worker (e.g. `https://your-worker.onrender.com` or RackNerd). Without it: "Video worker not configured." |

---

## Required for Auth / Magic Link

| Variable | Used by | Notes |
|----------|---------|-------|
| `RESEND_API_KEY` | Magic link emails | Resend.com API key |
| `ADMIN_EMAILS` | Admin auth | Comma-separated, default `admin@rensto.com` |

---

## Required for Stripe Webhooks → n8n

| Variable | Used by | Notes |
|----------|---------|-------|
| `N8N_STRIPE_WEBHOOK_URL` | Stripe webhook handler | n8n webhook URL for payment events |
| `CREDITS_PER_SUBSCRIPTION_CYCLE` | Usage/billing | User-configurable default (e.g. `500`) |

---

## Optional (features may degrade)

| Variable | Used by | Notes |
|----------|---------|-------|
| `OPENAI_API_KEY` | Proposals, solutions, audit agent | Without: AI features fail |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firestore fallback | JSON string if still using Firestore |
| `N8N_WEBHOOK_URL` | Contact form, custom solutions | Main n8n webhook |
| `N8N_CUSTOMIZE_WEBHOOK_URL` | Marketplace customize | n8n webhook for template customization |
| `N8N_FULFILLMENT_WEBHOOK_URL` | Fulfillment orchestration | Default: `https://n8n.rensto.com/webhook/fulfillment-orchestrator` |
| `N8N_OPTIMIZER_WEBHOOK` | Provisioning service | Template optimization |
| `N8N_INDEXING_WEBHOOK_URL` | Knowledge indexing | Default: `https://n8n.rensto.com/webhook/knowledge-indexing` |
| `N8N_SUPPORT_AGENT_WEBHOOK_URL` | Support create | Support ticket webhook |
| `SLACK_WEBHOOK_URL` | Notifications | Slack inbound webhook |
| `DASHBOARD_SYNC_SECRET` | `/api/dashboard/sync-usage` | Shared secret for usage sync |
| `RENSTO_API_KEY` | `/api/webhooks/usage` | API key validation |
| `VPS_PASSWORD` / `RACKNERD_SSH_PASSWORD` | Admin n8n route | Only if using admin SSH diagnostics |
| `RACKNERD_IP` | Admin n8n route | `172.245.56.50` |
| `NEXT_PUBLIC_STRIPE_LINK_*` | Hero, HomePageClient | Stripe product links (optional) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Legal, contact | Default `service@rensto.com` |

---

## Quick minimum (deploy without video)

1. `DATABASE_URL`
2. `STRIPE_SECRET_KEY`
3. `STRIPE_WEBHOOK_SECRET`
4. `NEXT_PUBLIC_SITE_URL` = `https://rensto.com`
5. `NEXT_PUBLIC_BASE_URL` = `https://rensto.com`

Add `VIDEO_WORKER_URL` when you deploy the video worker and want `/video/create` to work.
