# Vercel Environment Variables Checklist

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**.
Apply to **Production**, **Preview**, and **Development** as needed.

---

## Required (Core)

| Variable | Used by | Notes |
|----------|---------|-------|
| `DATABASE_URL` | Prisma, API routes | PostgreSQL connection string (RackNerd pgvector container) |
| `PAYPAL_CLIENT_ID` | Checkout | PayPal app client ID (migrated from Stripe Feb 2026) |
| `PAYPAL_CLIENT_SECRET` | Webhooks, verification | PayPal app secret |
| `PAYPAL_WEBHOOK_ID` | `/api/webhooks/usage` | PayPal webhook verification ID |
| `NEXT_PUBLIC_SITE_URL` | Checkout success URLs, downloads | `https://superseller.agency` |
| `NEXT_PUBLIC_BASE_URL` | Magic link, custom solutions | `https://superseller.agency` |

---

## Required for Video (VideoForge)

| Variable | Used by | Notes |
|----------|---------|-------|
| `VIDEO_WORKER_URL` | `/api/video/jobs/*` | RackNerd worker URL: `http://172.245.56.50:3002` |

---

## Required for Auth / Magic Link

| Variable | Used by | Notes |
|----------|---------|-------|
| `RESEND_API_KEY` | Magic link emails | Resend.com API key |
| `ADMIN_EMAILS` | Admin auth | Comma-separated, default `shai@superseller.agency` |

---

## Required for SocialHub

| Variable | Used by | Notes |
|----------|---------|-------|
| `FB_PAGE_ACCESS_TOKEN` | Social publish | Permanent Facebook page token |
| `FB_PAGE_ID` | Social publish | `294290977372290` |
| `INSTAGRAM_ACCOUNT_ID` | Social publish | `17841410951596580` |

---

## Optional (features may degrade)

| Variable | Used by | Notes |
|----------|---------|-------|
| `OPENAI_API_KEY` | Proposals, solutions | Without: AI features fail |
| `ANTHROPIC_API_KEY` | SocialHub content gen | Claude API for text creation |
| `KIE_AI_API_KEY` | SocialHub image gen | Kie.ai image creation |
| `WAHA_API_URL` | WhatsApp notifications | WAHA Pro base URL |
| `WAHA_API_KEY` | WhatsApp notifications | WAHA session key |
| `AITABLE_API_TOKEN` | Dashboard sync | Aitable.ai API token |
| `AITABLE_SPACE_ID` | Dashboard sync | `spc63cnXLdMYc` |
| `N8N_WEBHOOK_URL` | Contact form | Main n8n webhook |
| `SLACK_WEBHOOK_URL` | Notifications | Slack inbound webhook |
| `DASHBOARD_SYNC_SECRET` | `/api/dashboard/sync-usage` | Shared secret for usage sync |
| `SUPERSELLER_API_KEY` | `/api/webhooks/usage` | API key validation |
| `RACKNERD_IP` | Admin diagnostics | `172.245.56.50` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Legal, contact | Default `shai@superseller.agency` |
| `TELNYX_API_KEY` | FrontDesk voice AI | Telnyx AI assistant API key |

---

## Quick minimum (deploy without video)

1. `DATABASE_URL`
2. `PAYPAL_CLIENT_ID`
3. `PAYPAL_CLIENT_SECRET`
4. `NEXT_PUBLIC_SITE_URL` = `https://superseller.agency`
5. `NEXT_PUBLIC_BASE_URL` = `https://superseller.agency`

Add `VIDEO_WORKER_URL` when you deploy the video worker and want `/video/create` to work.
