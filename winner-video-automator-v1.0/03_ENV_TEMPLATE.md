# Doc 3: Environment Variables

> **Purpose:** Complete `.env.local` file with real values. Copy to project root.
> **Action:** Create `.env.local` in project root. Never commit this file.
> **Security:** All secrets are real production values. Handle accordingly.

---

## 1. The .env.local File

Copy this entire block into `.env.local` at the project root:

```env
# ============================================================
# Winner Video Studio — Environment Variables
# ============================================================
# Last updated: 2026-02-18
# ============================================================


# ────────────────────────────────────────────────────────────
# DATABASE (Option A: Vercel Postgres — RECOMMENDED)
# ────────────────────────────────────────────────────────────
# These will be auto-injected by Vercel when you create a
# Postgres store via the dashboard (Storage → Create → Postgres).
# After creation, run: npx vercel env pull .env.local
# 
# Placeholder format — Vercel fills these automatically:
# POSTGRES_URL="postgres://default:XXXXX@ep-XXXXX.us-east-2.aws.neon.tech/verceldb?sslmode=require"
# POSTGRES_PRISMA_URL="postgres://default:XXXXX@ep-XXXXX.us-east-2.aws.neon.tech/verceldb?sslmode=require&pgbouncer=true"
# POSTGRES_URL_NON_POOLING="postgres://default:XXXXX@ep-XXXXX.us-east-2.aws.neon.tech/verceldb?sslmode=require"
# POSTGRES_URL_NO_SSL="postgres://default:XXXXX@ep-XXXXX.us-east-2.aws.neon.tech/verceldb"
# POSTGRES_USER="default"
# POSTGRES_HOST="ep-XXXXX.us-east-2.aws.neon.tech"
# POSTGRES_PASSWORD="XXXXX"
# POSTGRES_DATABASE="verceldb"

# ────────────────────────────────────────────────────────────
# DATABASE (Option B: Racknerd Postgres — if firewall opened)
# ────────────────────────────────────────────────────────────
# Uncomment these if using Racknerd directly:
# DATABASE_URL="postgresql://admin:a1efbcd564b928d3ef1d7cae@172.245.56.50:5432/app_db"
# Note: Requires `sudo ufw allow 5432/tcp` on the server

# ────────────────────────────────────────────────────────────
# REDIS (Option A: Upstash — RECOMMENDED)
# ────────────────────────────────────────────────────────────
# These will be auto-injected by Vercel when you create a
# KV store via the dashboard (Storage → Create → KV).
# After creation, run: npx vercel env pull .env.local
#
# Placeholder format — Vercel fills these automatically:
# KV_URL="redis://default:XXXXX@XXXXX.upstash.io:6379"
# KV_REST_API_URL="https://XXXXX.upstash.io"
# KV_REST_API_TOKEN="XXXXX"
# KV_REST_API_READ_ONLY_TOKEN="XXXXX"

# ────────────────────────────────────────────────────────────
# REDIS (Option B: Racknerd Redis — if firewall opened)
# ────────────────────────────────────────────────────────────
# Uncomment if using Racknerd directly:
# REDIS_URL="redis://:2ea94441a41477c9b8081659@172.245.56.50:6379"
# Note: Requires `sudo ufw allow 6379/tcp` on the server


# ────────────────────────────────────────────────────────────
# CLOUDFLARE R2 (Object Storage)
# ────────────────────────────────────────────────────────────
R2_ACCOUNT_ID="46a5b8a6516f86865992dbdfdb3cd77b"
R2_ACCESS_KEY_ID="b6326c4a74421a530ce9d577bb96555d"
R2_SECRET_ACCESS_KEY="ac0f9225863a96588ba35905c614d9bf5c1fd59eb7b29c375eeb6422116cf2f1"
R2_ENDPOINT="https://46a5b8a6516f86865992dbdfdb3cd77b.r2.cloudflarestorage.com"
R2_BUCKET_NAME="winner-video-studio"
# Public access URL — set after enabling R2 public access or custom domain:
R2_PUBLIC_URL="https://46a5b8a6516f86865992dbdfdb3cd77b.r2.cloudflarestorage.com/winner-video-studio"
# Cloudflare API token (for Workers/DNS management if needed):
CLOUDFLARE_API_TOKEN="qCQRpYUU90uVtIH03PFL-fXu3MLHlMZcgrfhTGt6"


# ────────────────────────────────────────────────────────────
# KIE.AI (AI Model API — video, audio, music)
# ────────────────────────────────────────────────────────────
KIE_API_KEY="cb711f74a221be35a20df8e26e722e04"
KIE_API_BASE_URL="https://api.kie.ai"
KIE_GEMINI_URL="https://api.kie.ai/gemini-3-pro/v1/chat/completions"
KIE_TASK_CREATE_URL="https://api.kie.ai/api/v1/jobs/createTask"
KIE_TASK_STATUS_URL="https://api.kie.ai/api/v1/jobs/recordInfo"
KIE_CALLBACK_URL="https://studio.rensto.com/api/callbacks/kie"


# ────────────────────────────────────────────────────────────
# WAHA PRO (WhatsApp API)
# ────────────────────────────────────────────────────────────
WAHA_API_URL="http://172.245.56.50:3000"
WAHA_API_KEY="4fc7e008d7d24fc995475029effc8fa8"
WAHA_SESSION="rensto-whatsapp"
# The Rensto WhatsApp number: +1 (214) 436-2102
# JID format: 12144362102@c.us


# ────────────────────────────────────────────────────────────
# RESEND (Email — Magic Link Auth)
# ────────────────────────────────────────────────────────────
RESEND_API_KEY="re_XQiEhnaA_93skkNUt1ahqY7QdtHTvdZsb"
RESEND_FROM_EMAIL="Winner Video Studio <studio@rensto.com>"
# Note: Domain 'rensto.com' must be verified in Resend dashboard.
# If not yet verified, use: "onboarding@resend.dev" for testing.
RESEND_FROM_EMAIL_FALLBACK="onboarding@resend.dev"


# ────────────────────────────────────────────────────────────
# AITABLE (Configuration Database)
# ────────────────────────────────────────────────────────────
AITABLE_API_KEY="uskBpO7SVJC8RMDSSOSs7tM"
AITABLE_BASE_URL="https://aitable.ai/fusion/v1"
AITABLE_SPACE_ID="spc4tjiuDMjfY"
# Table IDs (created during blueprint phase):
AITABLE_MODEL_REGISTRY_ID="dstdAf6nZ7TBGymLdD"
AITABLE_SCRIPT_LIBRARY_ID="dstRhwMFwyrJZkeBBy"
AITABLE_BRAND_ASSETS_ID="dsthE4dR4jmNGqZLC4"
AITABLE_TONE_PRESETS_ID="dstYWq7kSBuBnoVuAe"
AITABLE_MASTER_REGISTRY_ID="dstwsqbXSmK5wYMmeQ"


# ────────────────────────────────────────────────────────────
# AUTH
# ────────────────────────────────────────────────────────────
AUTH_SECRET="1513ebc1ba18dc52b17f1fad73e39d05da7179001f3bb952c87178fbc56961fb"
# Session cookie config:
SESSION_COOKIE_NAME="winner_session"
SESSION_MAX_AGE_DAYS="7"
# Magic link config:
MAGIC_LINK_EXPIRY_MINUTES="15"
# WhatsApp OTP config:
OTP_EXPIRY_MINUTES="5"
OTP_MAX_ATTEMPTS="3"


# ────────────────────────────────────────────────────────────
# APP CONFIG
# ────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://studio.rensto.com"
NEXT_PUBLIC_APP_NAME="Winner Video Studio"
NEXT_PUBLIC_TENANT_ID="mivnim"
# Rate limits:
RATE_LIMIT_GENERATIONS_PER_HOUR="5"
RATE_LIMIT_MAX_CONCURRENT="2"
# Pipeline config:
STUCK_TASK_THRESHOLD_MINUTES="10"
MAX_RETRY_COUNT="3"
# Video constraints (from Yossi's requirements):
MAX_VIDEO_DURATION_SECONDS="30"
MIN_VIDEO_DURATION_SECONDS="20"
VIDEO_PROMPT_MAX_CHARS="500"


# ────────────────────────────────────────────────────────────
# STRIPE (Phase 2 — leave empty for now)
# ────────────────────────────────────────────────────────────
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
# STRIPE_STARTER_PRICE_ID=""
# STRIPE_PRO_PRICE_ID=""
# STRIPE_ELITE_PRICE_ID=""


# ────────────────────────────────────────────────────────────
# RACKNERD SERVER (for SSH/FFmpeg in Phase 2)
# ────────────────────────────────────────────────────────────
# RACKNERD_HOST="172.245.56.50"
# RACKNERD_USER="root"
# RACKNERD_PASSWORD="<set in .env.racknerd — never hardcode>"
# Note: SSH port 22 may need to be opened in firewall.


# ────────────────────────────────────────────────────────────
# N8N (existing automation platform)
# ────────────────────────────────────────────────────────────
N8N_BASE_URL="https://n8n.rensto.com"
# Webhook URLs for existing WAHA sessions (reference only):
# default session: https://n8n.rensto.com/webhook/7512b576-dadc-4f19-a5d9-baaf4cb165ef/waha
# InternalBoss:    https://n8n.rensto.com/webhook/0372ce60-84ae-409f-8f0c-4869a02251c9/waha
# rensto-whatsapp: https://n8n.rensto.com/webhook/556f1aab-220c-4281-90b8-0570465d50b1/waha


# ────────────────────────────────────────────────────────────
# VERCEL (auto-injected, listed for reference)
# ────────────────────────────────────────────────────────────
# VERCEL="1"
# VERCEL_ENV="production"
# VERCEL_URL="winner-video-studio.vercel.app"
# VERCEL_REGION="iad1"
# CRON_SECRET="" — set in Vercel dashboard for cron auth
```

---

## 2. Vercel Environment Variables Setup

After creating the project in Vercel, set these environment variables in the Vercel dashboard (Settings → Environment Variables). 

### Required for all environments (Production + Preview + Development):

| Variable | Value | Sensitive? |
|----------|-------|-----------|
| `R2_ACCOUNT_ID` | `46a5b8a6516f86865992dbdfdb3cd77b` | No |
| `R2_ACCESS_KEY_ID` | `b6326c4a74421a530ce9d577bb96555d` | Yes |
| `R2_SECRET_ACCESS_KEY` | `ac0f9225863a96588ba35905c614d9bf5c1fd59eb7b29c375eeb6422116cf2f1` | Yes |
| `R2_ENDPOINT` | `https://46a5b8a6516f86865992dbdfdb3cd77b.r2.cloudflarestorage.com` | No |
| `R2_BUCKET_NAME` | `winner-video-studio` | No |
| `KIE_API_KEY` | `cb711f74a221be35a20df8e26e722e04` | Yes |
| `KIE_CALLBACK_URL` | `https://studio.rensto.com/api/callbacks/kie` | No |
| `WAHA_API_URL` | `http://172.245.56.50:3000` | No |
| `WAHA_API_KEY` | `4fc7e008d7d24fc995475029effc8fa8` | Yes |
| `WAHA_SESSION` | `rensto-whatsapp` | No |
| `RESEND_API_KEY` | `re_XQiEhnaA_93skkNUt1ahqY7QdtHTvdZsb` | Yes |
| `AITABLE_API_KEY` | `uskBpO7SVJC8RMDSSOSs7tM` | Yes |
| `AUTH_SECRET` | `1513ebc1ba18dc52b17f1fad73e39d05da7179001f3bb952c87178fbc56961fb` | Yes |
| `NEXT_PUBLIC_APP_URL` | `https://studio.rensto.com` | No |
| `NEXT_PUBLIC_APP_NAME` | `Winner Video Studio` | No |
| `NEXT_PUBLIC_TENANT_ID` | `mivnim` | No |

### Auto-injected by Vercel Storage:

| Variable | Source |
|----------|--------|
| `POSTGRES_URL` | Vercel Postgres (create via dashboard) |
| `KV_REST_API_URL` | Vercel KV / Upstash (create via dashboard) |
| `KV_REST_API_TOKEN` | Vercel KV / Upstash (create via dashboard) |

### Set a CRON_SECRET for securing cron endpoints:

| Variable | Value | Note |
|----------|-------|------|
| `CRON_SECRET` | (generate a random string) | Used by Vercel cron to authenticate |

---

## 3. env.d.ts — Type-Safe Environment

Create as `src/env.d.ts` for TypeScript autocomplete and validation:

```typescript
// src/env.d.ts
// Type declarations for environment variables.
// Ensures TypeScript catches missing env vars at build time.

declare namespace NodeJS {
  interface ProcessEnv {
    // Database (Vercel Postgres)
    POSTGRES_URL?: string;
    POSTGRES_PRISMA_URL?: string;
    POSTGRES_URL_NON_POOLING?: string;
    POSTGRES_URL_NO_SSL?: string;
    POSTGRES_USER?: string;
    POSTGRES_HOST?: string;
    POSTGRES_PASSWORD?: string;
    POSTGRES_DATABASE?: string;
    // Database (Racknerd fallback)
    DATABASE_URL?: string;

    // Redis (Vercel KV / Upstash)
    KV_URL?: string;
    KV_REST_API_URL?: string;
    KV_REST_API_TOKEN?: string;
    KV_REST_API_READ_ONLY_TOKEN?: string;
    // Redis (Racknerd fallback)
    REDIS_URL?: string;

    // Cloudflare R2
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_ENDPOINT: string;
    R2_BUCKET_NAME: string;
    R2_PUBLIC_URL: string;
    CLOUDFLARE_API_TOKEN?: string;

    // kie.ai
    KIE_API_KEY: string;
    KIE_API_BASE_URL?: string;
    KIE_GEMINI_URL?: string;
    KIE_TASK_CREATE_URL?: string;
    KIE_TASK_STATUS_URL?: string;
    KIE_CALLBACK_URL: string;

    // WAHA
    WAHA_API_URL: string;
    WAHA_API_KEY: string;
    WAHA_SESSION: string;

    // Resend
    RESEND_API_KEY: string;
    RESEND_FROM_EMAIL?: string;
    RESEND_FROM_EMAIL_FALLBACK?: string;

    // Aitable
    AITABLE_API_KEY: string;
    AITABLE_BASE_URL?: string;
    AITABLE_SPACE_ID: string;
    AITABLE_MODEL_REGISTRY_ID: string;
    AITABLE_SCRIPT_LIBRARY_ID: string;
    AITABLE_BRAND_ASSETS_ID: string;
    AITABLE_TONE_PRESETS_ID: string;
    AITABLE_MASTER_REGISTRY_ID?: string;

    // Auth
    AUTH_SECRET: string;
    SESSION_COOKIE_NAME?: string;
    SESSION_MAX_AGE_DAYS?: string;
    MAGIC_LINK_EXPIRY_MINUTES?: string;
    OTP_EXPIRY_MINUTES?: string;
    OTP_MAX_ATTEMPTS?: string;

    // App
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_TENANT_ID: string;
    RATE_LIMIT_GENERATIONS_PER_HOUR?: string;
    RATE_LIMIT_MAX_CONCURRENT?: string;
    STUCK_TASK_THRESHOLD_MINUTES?: string;
    MAX_RETRY_COUNT?: string;
    MAX_VIDEO_DURATION_SECONDS?: string;
    MIN_VIDEO_DURATION_SECONDS?: string;
    VIDEO_PROMPT_MAX_CHARS?: string;

    // Stripe (Phase 2)
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;

    // Cron
    CRON_SECRET?: string;

    // Vercel (auto-injected)
    VERCEL?: string;
    VERCEL_ENV?: string;
    VERCEL_URL?: string;
    VERCEL_REGION?: string;

    // n8n
    N8N_BASE_URL?: string;
  }
}
```

---

## 4. Environment Validation Utility

Create as `src/lib/env.ts` — validates all required env vars at startup:

```typescript
// src/lib/env.ts
// Validates environment variables and provides typed access.
// Fails fast on missing required vars (better than runtime crashes).

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function optionalInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

// Lazy-init singleton — validated once on first access
let _env: ReturnType<typeof buildEnv> | null = null;

function buildEnv() {
  return {
    // Database — support both Vercel Postgres and direct connection
    databaseUrl: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
    hasDatabaseUrl: !!(process.env.POSTGRES_URL || process.env.DATABASE_URL),
    isNeon: (process.env.POSTGRES_URL || '').includes('neon.tech'),

    // Redis — support both Vercel KV and direct connection
    redisUrl: process.env.KV_URL || process.env.REDIS_URL || '',
    kvRestUrl: process.env.KV_REST_API_URL || '',
    kvRestToken: process.env.KV_REST_API_TOKEN || '',
    hasRedis: !!(process.env.KV_URL || process.env.REDIS_URL || process.env.KV_REST_API_URL),

    // R2
    r2: {
      accountId: required('R2_ACCOUNT_ID'),
      accessKeyId: required('R2_ACCESS_KEY_ID'),
      secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
      endpoint: required('R2_ENDPOINT'),
      bucketName: required('R2_BUCKET_NAME'),
      publicUrl: optional('R2_PUBLIC_URL', ''),
    },

    // kie.ai
    kie: {
      apiKey: required('KIE_API_KEY'),
      baseUrl: optional('KIE_API_BASE_URL', 'https://api.kie.ai'),
      geminiUrl: optional('KIE_GEMINI_URL', 'https://api.kie.ai/gemini-3-pro/v1/chat/completions'),
      taskCreateUrl: optional('KIE_TASK_CREATE_URL', 'https://api.kie.ai/api/v1/jobs/createTask'),
      taskStatusUrl: optional('KIE_TASK_STATUS_URL', 'https://api.kie.ai/api/v1/jobs/recordInfo'),
      callbackUrl: required('KIE_CALLBACK_URL'),
    },

    // WAHA
    waha: {
      apiUrl: required('WAHA_API_URL'),
      apiKey: required('WAHA_API_KEY'),
      session: required('WAHA_SESSION'),
    },

    // Resend
    resend: {
      apiKey: required('RESEND_API_KEY'),
      fromEmail: optional('RESEND_FROM_EMAIL', 'Winner Video Studio <studio@rensto.com>'),
      fromEmailFallback: optional('RESEND_FROM_EMAIL_FALLBACK', 'onboarding@resend.dev'),
    },

    // Aitable
    aitable: {
      apiKey: required('AITABLE_API_KEY'),
      baseUrl: optional('AITABLE_BASE_URL', 'https://aitable.ai/fusion/v1'),
      spaceId: required('AITABLE_SPACE_ID'),
      tables: {
        modelRegistry: required('AITABLE_MODEL_REGISTRY_ID'),
        scriptLibrary: required('AITABLE_SCRIPT_LIBRARY_ID'),
        brandAssets: required('AITABLE_BRAND_ASSETS_ID'),
        tonePresets: required('AITABLE_TONE_PRESETS_ID'),
      },
    },

    // Auth
    auth: {
      secret: required('AUTH_SECRET'),
      cookieName: optional('SESSION_COOKIE_NAME', 'winner_session'),
      sessionMaxAgeDays: optionalInt('SESSION_MAX_AGE_DAYS', 7),
      magicLinkExpiryMinutes: optionalInt('MAGIC_LINK_EXPIRY_MINUTES', 15),
      otpExpiryMinutes: optionalInt('OTP_EXPIRY_MINUTES', 5),
      otpMaxAttempts: optionalInt('OTP_MAX_ATTEMPTS', 3),
    },

    // App
    app: {
      url: required('NEXT_PUBLIC_APP_URL'),
      name: optional('NEXT_PUBLIC_APP_NAME', 'Winner Video Studio'),
      tenantId: optional('NEXT_PUBLIC_TENANT_ID', 'mivnim'),
    },

    // Rate limits
    limits: {
      generationsPerHour: optionalInt('RATE_LIMIT_GENERATIONS_PER_HOUR', 5),
      maxConcurrent: optionalInt('RATE_LIMIT_MAX_CONCURRENT', 2),
      stuckThresholdMinutes: optionalInt('STUCK_TASK_THRESHOLD_MINUTES', 10),
      maxRetryCount: optionalInt('MAX_RETRY_COUNT', 3),
    },

    // Video constraints
    video: {
      maxDuration: optionalInt('MAX_VIDEO_DURATION_SECONDS', 30),
      minDuration: optionalInt('MIN_VIDEO_DURATION_SECONDS', 20),
      promptMaxChars: optionalInt('VIDEO_PROMPT_MAX_CHARS', 500),
    },

    // Cron
    cronSecret: process.env.CRON_SECRET || '',

    // Flags
    isVercel: process.env.VERCEL === '1',
    isProduction: process.env.VERCEL_ENV === 'production',
  } as const;
}

export function getEnv() {
  if (!_env) {
    _env = buildEnv();
  }
  return _env;
}

// Quick access for lib modules
export const env = new Proxy({} as ReturnType<typeof buildEnv>, {
  get(_, prop) {
    return getEnv()[prop as keyof ReturnType<typeof buildEnv>];
  },
});
```

---

## 5. Resend Domain Verification

Before magic link emails work from `studio@rensto.com`, the domain needs verification in Resend:

1. Go to https://resend.com/domains
2. Add domain: `rensto.com`
3. Add the DNS records Resend provides (TXT + MX + CNAME)
4. Wait for verification (usually < 5 minutes)

Until verified, use `RESEND_FROM_EMAIL_FALLBACK` (`onboarding@resend.dev`) for testing. The `src/lib/resend.ts` module should try the primary address and fall back automatically.

---

## 6. R2 Public Access

For videos to be playable in WhatsApp and the gallery, the R2 bucket needs a public access URL.

**Option A: R2.dev subdomain (quick)**
1. Cloudflare Dashboard → R2 → `winner-video-studio` → Settings
2. Enable "Public Access" → Get assigned `*.r2.dev` URL
3. Update `R2_PUBLIC_URL` in env

**Option B: Custom domain (production)**
1. Add CNAME: `media.rensto.com` → R2 bucket
2. Configure in Cloudflare R2 custom domains
3. Update `R2_PUBLIC_URL="https://media.rensto.com"`

For Phase 1, Option A is fastest. The lib module generates signed URLs as fallback regardless.

---

## 7. studio.rensto.com DNS

Add to Cloudflare DNS for `rensto.com`:

```
Type: CNAME
Name: studio
Target: cname.vercel-dns.com
Proxy: OFF (DNS only — Vercel handles TLS)
TTL: Auto
```

Then in Vercel project settings, add `studio.rensto.com` as a domain.

---

## 8. Quick Verification Commands

After setting up, verify all services connect:

```bash
# Test R2
node -e "
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY }
});
s3.send(new ListBucketsCommand({})).then(r => console.log('✅ R2:', r.Buckets.map(b=>b.Name)));
"

# Test kie.ai
curl -s https://api.kie.ai/api/v1/jobs/recordInfo?taskId=test \
  -H "Authorization: Bearer $KIE_API_KEY" | head -50

# Test WAHA
curl -s "$WAHA_API_URL/api/sessions" \
  -H "X-Api-Key: $WAHA_API_KEY" | python3 -m json.tool | head -5

# Test Aitable
curl -s "https://aitable.ai/fusion/v1/datasheets/$AITABLE_MODEL_REGISTRY_ID/records?pageSize=1" \
  -H "Authorization: Bearer $AITABLE_API_KEY" | python3 -m json.tool | head -10

# Test Resend
curl -s https://api.resend.com/domains \
  -H "Authorization: Bearer $RESEND_API_KEY" | python3 -m json.tool | head -10

# Test Postgres (after Vercel Postgres created)
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT NOW()').then(r => { console.log('✅ PG:', r.rows[0].now); pool.end(); });
"
```
