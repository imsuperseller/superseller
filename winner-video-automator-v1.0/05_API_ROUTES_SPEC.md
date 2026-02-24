# Doc 5: API Routes Specification

> **Purpose:** Complete specification for every API route — method, auth, request/response shapes, validation, error codes, and implementation notes.
> **Action:** Each route maps to a file in `src/app/api/`. Claude Code implements each using Next.js App Router `route.ts` files.

---

## Route Map

```
AUTH
  POST  /api/auth/magic-link      Send magic link email
  GET   /api/auth/verify           Verify magic link token → create session
  POST  /api/auth/whatsapp-otp     Send OTP via WhatsApp
  POST  /api/auth/verify-otp       Verify WhatsApp OTP → create session
  GET   /api/auth/me               Get current user from session

PIPELINE
  POST  /api/upload                Upload audio/image → R2
  POST  /api/generate              Start video generation pipeline
  GET   /api/generations           List user's generations
  GET   /api/generations/[id]      Get single generation with status

CALLBACKS
  POST  /api/callbacks/kie         kie.ai task completion callback

CRON
  GET   /api/cron/check-stuck      Poll stuck tasks (Vercel Cron)

SYSTEM
  GET   /api/health                Health check
```

---

## Authentication Pattern

All protected routes use the same auth check:

```typescript
// Shared pattern for protected routes
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // session.userId, session.tenantId available
}
```

The `getSessionFromRequest` function:
1. Reads `winner_session` cookie from request
2. Looks up token in `sessions` table (or Redis cache)
3. Validates expiry
4. Returns `{ userId, tenantId }` or `null`

Callback routes (`/api/callbacks/*`) and cron routes use different auth (API key / cron secret).

---

## Route 1: POST /api/auth/magic-link

**Purpose:** Send a magic link email to the user. Creates user if first visit.

**Auth:** None (public)

**File:** `src/app/api/auth/magic-link/route.ts`

### Request

```typescript
// Body
{
  email: string;   // Required. Valid email address.
}
```

### Validation (Zod)

```typescript
const schema = z.object({
  email: z.string().email('Invalid email address'),
});
```

### Logic

1. Validate email format
2. Find or create user:
   ```sql
   INSERT INTO users (email, tenant_id, auth_method)
   VALUES ($1, 'mivnim', 'email')
   ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
   RETURNING id, name;
   ```
3. If new user → also create `user_credits` row with 5 starter credits
4. Generate token: `nanoid(32)`
5. Store in Redis: `winner:magic:{token}` → `{ userId, email }` TTL 15min
6. Also update user row: `magic_link_token`, `magic_link_expires_at`
7. Send email via Resend:
   ```
   From: Winner Video Studio <studio@rensto.com>
   Subject: 🔗 הכניסה שלך ל-Winner Video Studio
   Body: Click to sign in: {APP_URL}/verify?token={token}
   ```
8. Return success (never reveal if email exists)

### Response

```typescript
// 200 OK
{ message: "Magic link sent", email: "y***i@example.com" }

// 400 Bad Request
{ error: "Invalid email address" }

// 429 Too Many Requests (max 3 per email per 15 min)
{ error: "Too many requests. Try again in a few minutes." }

// 500 Internal Server Error
{ error: "Failed to send email" }
```

### Rate Limit

Redis counter: `winner:rate:magic:{email}` — max 3 per 15 minutes.

---

## Route 2: GET /api/auth/verify

**Purpose:** Verify magic link token, create session, redirect to dashboard.

**Auth:** None (public, token in URL)

**File:** `src/app/api/auth/verify/route.ts`

### Request

```
GET /api/auth/verify?token={magic_link_token}
```

### Logic

1. Extract `token` from query params
2. Look up in Redis: `winner:magic:{token}`
3. If not found or expired → redirect to `/login?error=expired`
4. Delete the Redis key (one-time use)
5. Create session:
   ```sql
   INSERT INTO sessions (user_id, token, expires_at)
   VALUES ($1, $2, NOW() + INTERVAL '7 days')
   RETURNING token;
   ```
6. Also cache in Redis: `winner:session:{token}` TTL 7 days
7. Set cookie:
   ```
   Set-Cookie: winner_session={session_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
   ```
8. Update user: `last_login = NOW()`
9. Redirect to `/dashboard`

### Response

```
302 Redirect → /dashboard (with Set-Cookie header)

302 Redirect → /login?error=expired (if token invalid)

302 Redirect → /login?error=invalid (if token malformed)
```

---

## Route 3: POST /api/auth/whatsapp-otp

**Purpose:** Send 6-digit OTP to user's WhatsApp number via WAHA.

**Auth:** None (public)

**File:** `src/app/api/auth/whatsapp-otp/route.ts`

### Request

```typescript
{
  phone: string;   // Required. Israeli phone: "0501234567" or "+972501234567"
}
```

### Validation

```typescript
const schema = z.object({
  phone: z.string().min(9).max(15).regex(/^[\d\+\-\s]+$/, 'Invalid phone number'),
});
```

### Logic

1. Normalize phone → international format (strip +, leading 0 → 972)
2. Find or create user:
   ```sql
   INSERT INTO users (phone, whatsapp_jid, tenant_id, auth_method)
   VALUES ($1, $2, 'mivnim', 'whatsapp')
   ON CONFLICT (phone) DO UPDATE SET updated_at = NOW()
   RETURNING id;
   ```
3. Generate OTP: 6-digit random number
4. Store in Redis: `winner:otp:{normalizedPhone}` → `{ code, userId, attempts: 0 }` TTL 5min
5. Send via WAHA:
   ```
   POST {WAHA_URL}/api/sendText
   X-Api-Key: {WAHA_API_KEY}
   {
     "session": "rensto-whatsapp",
     "chatId": "{normalizedPhone}@c.us",
     "text": "🔐 Winner Video Studio\n\nקוד הכניסה שלך: {OTP}\n\nתקף ל-5 דקות."
   }
   ```

### Response

```typescript
// 200 OK
{ message: "OTP sent", phone: "050***4567" }

// 400 Bad Request
{ error: "Invalid phone number" }

// 429 Too Many Requests
{ error: "Too many attempts. Try again in 5 minutes." }

// 503 Service Unavailable (WAHA down)
{ error: "WhatsApp service temporarily unavailable. Try magic link instead." }
```

---

## Route 4: POST /api/auth/verify-otp

**Purpose:** Verify OTP code, create session.

**Auth:** None (public)

**File:** `src/app/api/auth/verify-otp/route.ts`

### Request

```typescript
{
  phone: string;   // Same format as sent
  code: string;    // 6-digit OTP
}
```

### Logic

1. Normalize phone
2. Look up Redis: `winner:otp:{normalizedPhone}`
3. Check attempts < 3 (increment on each try)
4. Compare code
5. If match → delete OTP key, create session (same as magic link verify step 5-8)
6. If no match → increment attempts, return error
7. If 3 failed attempts → delete OTP key, force re-send

### Response

```typescript
// 200 OK (with Set-Cookie)
{ success: true, redirect: "/dashboard" }

// 400 Bad Request
{ error: "Invalid or expired code" }

// 429 Too Many Attempts
{ error: "Too many failed attempts. Request a new code." }
```

---

## Route 5: GET /api/auth/me

**Purpose:** Get current authenticated user info.

**Auth:** Required (session cookie)

**File:** `src/app/api/auth/me/route.ts`

### Response

```typescript
// 200 OK
{
  user: {
    id: "uuid",
    name: "Yossi Laham",
    email: "yossi@example.com",
    phone: "+972501234567",
    tenant_id: "mivnim",
    tier: "starter",
    credits: {
      available: 4,
      total: 5,
      monthly_remaining: 29
    }
  }
}

// 401 Unauthorized
{ error: "Not authenticated" }
```

### Query

```sql
SELECT u.id, u.name, u.email, u.phone, u.tenant_id, u.tier,
       uc.available_credits, uc.total_credits,
       (uc.monthly_cap - uc.monthly_used) as monthly_remaining
FROM users u
JOIN user_credits uc ON uc.user_id = u.id
WHERE u.id = $1;
```

---

## Route 6: POST /api/upload

**Purpose:** Upload audio or image file to R2. Returns the R2 URL.

**Auth:** Required (session cookie)

**File:** `src/app/api/upload/route.ts`

### Request

```
Content-Type: multipart/form-data

Fields:
  file: File          (required — audio or image)
  type: "audio" | "image"  (required)
```

### Validation

```typescript
// Audio
const AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/ogg'];
const AUDIO_MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Image
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
```

### Logic

1. Parse multipart form data
2. Validate file type and size
3. Generate R2 key: `{tenant_id}/{userId}/{timestamp}-{nanoid}.{ext}`
4. Upload to R2 bucket `winner-video-studio`
5. Return the R2 URL

### Response

```typescript
// 200 OK
{
  url: "https://46a5b8a6516f86865992dbdfdb3cd77b.r2.cloudflarestorage.com/winner-video-studio/mivnim/uuid/1708300000-abc123.mp3",
  key: "mivnim/uuid/1708300000-abc123.mp3",
  size: 2048576,
  type: "audio/mpeg"
}

// 400 Bad Request
{ error: "Invalid file type. Accepted: mp3, wav, aac, ogg" }

// 413 Payload Too Large
{ error: "File too large. Maximum 10MB." }

// 401 Unauthorized
{ error: "Not authenticated" }
```

---

## Route 7: POST /api/generate

**Purpose:** Start the video generation pipeline. The main entry point.

**Auth:** Required (session cookie)

**File:** `src/app/api/generate/route.ts`

**Max Duration:** 60 seconds (Vercel config)

### Request

```typescript
{
  audioUrl?: string;         // R2 URL from /api/upload (audio)
  imageUrl?: string;         // R2 URL from /api/upload (image/headshot)
  script?: string;           // Optional text script (used if no audio)
  character: string;         // "ceo" | "agent" | "architect" | "client" | "trump" | "asher" | "nehorai"
  vibe: string;              // "winner" | "luxury" | "urgent" | "family"
  language: string;          // "he" | "en" | "ar" | "mixed"
  contentTypeHint?: string;  // "podcast" | "party" | "property-tour" | "invitation" | "general"
}
```

### Validation

```typescript
const schema = z.object({
  audioUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  script: z.string().max(5000).optional(),
  character: z.enum(['ceo', 'agent', 'architect', 'client', 'trump', 'asher', 'nehorai']),
  vibe: z.enum(['winner', 'luxury', 'urgent', 'family']),
  language: z.enum(['he', 'en', 'ar', 'mixed']),
  contentTypeHint: z.enum(['podcast', 'party', 'property-tour', 'invitation', 'general']).optional(),
}).refine(data => data.audioUrl || data.script, {
  message: 'Either audioUrl or script is required',
});
```

### Logic (Sequential within the 60s function)

```
1. AUTH: Get session → userId
2. RATE LIMIT CHECK:
   a. Redis: winner:rate:generate:{userId} < 5/hour?
   b. Redis: winner:rate:concurrent:{userId} < 2?
3. CREDIT CHECK:
   SELECT available_credits, monthly_cap - monthly_used as monthly_remaining
   FROM user_credits WHERE user_id = $1;
   → If insufficient → 402 error
4. CREATE GENERATION ROW:
   INSERT INTO generations (user_id, tenant_id, stage, input_audio_url,
     reference_image_url, raw_script, character, vibe, language, content_type_hint)
   VALUES (...) RETURNING id;
5. CONSUME CREDIT (atomic):
   UPDATE user_credits SET used_credits = used_credits + 1, monthly_used = monthly_used + 1
   WHERE user_id = $1 AND available_credits > 0;
   INSERT INTO credit_transactions (...);
6. INCREMENT RATE COUNTERS:
   INCR winner:rate:generate:{userId} (TTL 3600)
   INCR winner:rate:concurrent:{userId} (TTL 600)
7. UPDATE STAGE → SCRIPT_PROCESSING
8. CALL GEMINI BRAIN (synchronous, ~5-15s):
   - Build system prompt (hydrate from Aitable)
   - Build user payload
   - POST to kie.ai gemini-3-pro
   - Parse JSON response
   - Store Gemini output in generations row
9. SEND "GENERATION STARTED" WHATSAPP (fire-and-forget):
   If user has whatsapp_jid → send notification via WAHA
10. TRIGGER NEXT STAGE:
    If needs_isolation → fire audio isolation task (async via kie.ai)
    Else → fire video generation task (async via kie.ai)
    Store taskId in Redis: winner:task:{taskId}
11. UPDATE STAGE → AUDIO_ISOLATING or VIDEO_GENERATING
12. RETURN generation ID + initial status
```

**Important:** Steps 1-7 are fast (< 1s). Step 8 (Gemini) takes 5-15s. Steps 9-12 are fast. Total: 10-20s typical, fits within 60s limit.

### Response

```typescript
// 201 Created
{
  generation: {
    id: "uuid",
    stage: "SCRIPT_PROCESSING",  // or AUDIO_ISOLATING / VIDEO_GENERATING
    character: "asher",
    vibe: "winner",
    processed_script: "My friends! Tonight we make party...",  // From Gemini
    recommended_model: "kling/ai-avatar-pro",
    routing_reasoning: "Podcast format with audio input...",
    needs_isolation: true,
    voice_clarity_score: 5,
    created_at: "2026-02-18T23:30:00Z"
  },
  credits_remaining: 4
}

// 400 Bad Request
{ error: "Either audioUrl or script is required" }

// 401 Unauthorized
{ error: "Not authenticated" }

// 402 Payment Required
{ error: "No credits remaining. Upgrade your plan to continue." }

// 429 Too Many Requests
{ error: "Rate limit exceeded. Max 5 videos per hour." }
// or
{ error: "You already have 2 active generations. Wait for one to complete." }

// 500 Internal Server Error
{ error: "Generation failed to start", details: "Gemini API timeout" }
```

### On Gemini Failure

If the Gemini brain call fails, DON'T fail the whole generation. Use fallback defaults (see Doc 4 Section 10) and continue the pipeline with `kling/ai-avatar-pro` + raw script.

---

## Route 8: GET /api/generations

**Purpose:** List current user's generations for dashboard and gallery.

**Auth:** Required (session cookie)

**File:** `src/app/api/generations/route.ts`

### Request

```
GET /api/generations?status=all&limit=20&offset=0

Query params:
  status: "all" | "active" | "complete" | "failed"  (default: "all")
  limit:  1-50  (default: 20)
  offset: 0+    (default: 0)
```

### Response

```typescript
// 200 OK
{
  generations: [
    {
      id: "uuid",
      stage: "COMPLETE",
      character: "asher",
      vibe: "winner",
      language: "mixed",
      processed_script: "My friends! Tonight...",  // Preview (first 200 chars)
      video_model_used: "kling/ai-avatar-pro",
      final_video_url: "https://r2.../final.mp4",
      raw_video_r2_url: "https://r2.../raw.mp4",   // Phase 1: same as final
      whatsapp_delivered: true,
      duration_seconds: 22.5,
      created_at: "2026-02-18T23:30:00Z",
      completed_at: "2026-02-18T23:42:00Z"
    }
    // ...
  ],
  total: 42,
  limit: 20,
  offset: 0
}
```

### Query

```sql
SELECT id, stage, character, vibe, language,
       LEFT(processed_script, 200) as processed_script,
       video_model_used,
       COALESCE(final_video_url, raw_video_r2_url, video_result_url) as final_video_url,
       raw_video_r2_url,
       whatsapp_delivered, final_duration as duration_seconds,
       created_at, completed_at
FROM generations
WHERE user_id = $1
  AND ($2 = 'all' OR
       ($2 = 'active' AND stage NOT IN ('COMPLETE', 'FAILED')) OR
       ($2 = 'complete' AND stage = 'COMPLETE') OR
       ($2 = 'failed' AND stage = 'FAILED'))
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```

---

## Route 9: GET /api/generations/[id]

**Purpose:** Get full details of a single generation. Used for status polling.

**Auth:** Required (session cookie). User can only access their own generations.

**File:** `src/app/api/generations/[id]/route.ts`

### Request

```
GET /api/generations/{generationId}
```

### Response

```typescript
// 200 OK
{
  generation: {
    id: "uuid",
    stage: "VIDEO_GENERATING",

    // Input
    input_audio_url: "https://r2.../audio.mp3",
    reference_image_url: "https://r2.../headshot.png",
    raw_script: "Original text...",
    character: "asher",
    vibe: "winner",
    language: "mixed",

    // Gemini output
    processed_script: "Rewritten script...",
    video_prompt: "Three men at podcast table...",
    recommended_model: "kling/ai-avatar-pro",
    routing_reasoning: "Podcast format with audio...",
    voice_clarity_score: 5,
    needs_isolation: true,
    subtitle_text: "Asher: My friends!...",
    content_tags: ["podcast", "party"],
    music_prompt: { style: "...", title: "...", negativeTags: "..." },

    // Results (populated as pipeline progresses)
    cleaned_audio_url: "https://r2.../cleaned.mp3",  // After isolation
    video_result_url: null,                            // Not yet
    final_video_url: null,                             // Not yet
    whatsapp_delivered: false,

    // Metadata
    error_message: null,
    credits_charged: 1,
    created_at: "2026-02-18T23:30:00Z",
    updated_at: "2026-02-18T23:35:00Z",
    completed_at: null
  },

  // Recent events for this generation (for timeline UI)
  events: [
    { stage: "PENDING", event_type: "stage_enter", created_at: "..." },
    { stage: "SCRIPT_PROCESSING", event_type: "stage_enter", created_at: "..." },
    { stage: "SCRIPT_PROCESSING", event_type: "stage_exit", created_at: "..." },
    { stage: "AUDIO_ISOLATING", event_type: "task_created", payload: { taskId: "..." }, created_at: "..." },
    { stage: "AUDIO_ISOLATING", event_type: "callback_received", created_at: "..." },
    { stage: "VIDEO_GENERATING", event_type: "task_created", payload: { taskId: "...", model: "..." }, created_at: "..." }
  ]
}

// 404 Not Found (or belongs to different user)
{ error: "Generation not found" }
```

### Query

```sql
-- Generation
SELECT * FROM generations WHERE id = $1 AND user_id = $2;

-- Events (last 20)
SELECT stage, event_type, payload, created_at
FROM generation_events
WHERE generation_id = $1
ORDER BY created_at DESC
LIMIT 20;
```

### Polling Pattern

The frontend polls this endpoint every 3 seconds while a generation is active:

```typescript
// Frontend polling
const pollInterval = setInterval(async () => {
  const res = await fetch(`/api/generations/${id}`);
  const data = await res.json();
  setGeneration(data.generation);
  if (['COMPLETE', 'FAILED'].includes(data.generation.stage)) {
    clearInterval(pollInterval);
  }
}, 3000);
```

---

## Route 10: POST /api/callbacks/kie

**Purpose:** Receive task completion callbacks from kie.ai for ALL model types.

**Auth:** None (kie.ai doesn't send auth). Validate by checking taskId exists in Redis.

**File:** `src/app/api/callbacks/kie/route.ts`

**Max Duration:** 30 seconds (Vercel config)

### Request (from kie.ai)

kie.ai POST the same shape as their Query Task response:

```typescript
{
  code: 200,
  msg: "success",
  data: {
    taskId: "abc123def456",
    model: "kling/ai-avatar-pro",
    state: "success" | "fail",
    param: "{...}",                    // JSON string of original createTask params
    resultJson: "{\"resultUrls\":[\"https://...mp4\"]}",  // JSON string
    failCode: null | "string",
    failMsg: null | "string",
    costTime: 45000,                   // ms
    completeTime: 1771455900000,       // epoch ms
    createTime: 1771455826000
  }
}
```

### Logic

```
1. PARSE body
2. VALIDATE: Look up Redis winner:task:{taskId}
   If not found → 404 (unknown task, might be duplicate callback)
3. GET generation context from Redis:
   { generationId, stage, model, attempt }
4. LOG EVENT:
   INSERT INTO generation_events (generation_id, stage, event_type, payload)
   VALUES ($1, $2, 'callback_received', $3);
5. IF state === 'fail':
   a. Check retry_count < MAX_RETRY_COUNT
   b. If retriable → increment retry, re-fire createTask, update Redis
   c. If exhausted → mark FAILED, refund credit, notify user, decrement concurrent counter
   d. DELETE Redis key
   e. Return 200
6. IF state === 'success':
   a. Parse resultJson → extract resultUrls[0]
   b. Log kie credits consumed in generation_costs
   c. SWITCH on stage:

      CASE 'AUDIO_ISOLATING':
        - Store cleaned_audio_url = resultUrls[0]
        - Fire video generation task (using cleaned audio)
        - Store new taskId in Redis
        - Update stage → VIDEO_GENERATING

      CASE 'VIDEO_GENERATING':
        - Store video_result_url = resultUrls[0]
        - Download video from kie.ai CDN → upload to R2
        - Store raw_video_r2_url = R2 URL
        - Phase 1: Set final_video_url = raw_video_r2_url (skip FFmpeg)
        - Update stage → DELIVERING
        - Trigger WhatsApp delivery (fire-and-forget)
        - After delivery → stage = COMPLETE
        - Decrement concurrent counter

   d. DELETE Redis key
   e. Return 200
```

### Response

```typescript
// 200 OK (always return 200 to kie.ai to prevent retries)
{ received: true }

// 404 (unknown taskId — log but still return 200 to prevent kie.ai retries)
{ received: true, warning: "unknown task" }
```

### Important: Always Return 200

kie.ai will retry callbacks if they receive non-200. Always return 200 even on errors to prevent duplicate processing. Handle errors internally.

### Idempotency

Check if the generation has already advanced past the expected stage before processing. If `generation.stage !== expectedStage`, this is a duplicate callback — log and skip.

---

## Route 11: GET /api/cron/check-stuck

**Purpose:** Find and recover stuck generations. Runs every 2 minutes via Vercel Cron.

**Auth:** Vercel Cron Secret (header `Authorization: Bearer {CRON_SECRET}`)

**File:** `src/app/api/cron/check-stuck/route.ts`

**Max Duration:** 30 seconds

### Logic

```
1. VERIFY cron secret:
   If req.headers.authorization !== `Bearer ${CRON_SECRET}` → 401
2. DEDUP CHECK:
   If Redis winner:stuck:checked exists → skip (another instance running)
   SET winner:stuck:checked with TTL 180s
3. FIND STUCK GENERATIONS:
   SELECT id, stage, video_task_id, isolation_task_id, retry_count
   FROM generations
   WHERE stage IN ('AUDIO_ISOLATING', 'VIDEO_GENERATING')
     AND updated_at < NOW() - INTERVAL '10 minutes'
     AND retry_count < 3;
4. FOR EACH stuck generation:
   a. Determine which taskId to check (isolation or video based on stage)
   b. POLL kie.ai: GET /api/v1/jobs/recordInfo?taskId={taskId}
   c. IF state === 'success' → process as if callback received
   d. IF state === 'fail' → process failure (retry or mark failed)
   e. IF state === 'waiting' AND created > 15 min ago → re-fire task
   f. LOG event: 'task_polled'
5. RETURN summary
```

### Response

```typescript
// 200 OK
{
  checked: 3,
  recovered: 1,
  still_stuck: 1,
  failed: 1,
  timestamp: "2026-02-18T23:40:00Z"
}

// 401 Unauthorized
{ error: "Invalid cron secret" }
```

---

## Route 12: GET /api/health

**Purpose:** Health check for monitoring.

**Auth:** None (public)

**File:** `src/app/api/health/route.ts`

### Response

```typescript
// 200 OK
{
  status: "ok",
  version: "1.0.0",
  timestamp: "2026-02-18T23:45:00Z",
  services: {
    database: "connected",    // Quick SELECT 1 check
    redis: "connected",       // Quick PING check
    r2: "connected",          // Quick HeadBucket check
    waha: "connected",        // Quick GET /api/sessions check
    kie: "ok"                 // Static (no health endpoint)
  }
}

// 503 (if any critical service down)
{
  status: "degraded",
  services: {
    database: "connected",
    redis: "error: timeout",
    ...
  }
}
```

---

## Error Response Convention

All error responses follow the same shape:

```typescript
interface ErrorResponse {
  error: string;          // Human-readable message (safe for UI display)
  code?: string;          // Machine-readable error code
  details?: string;       // Debug info (only in development)
}
```

### Standard HTTP Status Codes Used

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful read/action |
| 201 | Created | Generation started |
| 302 | Redirect | Auth verify → dashboard |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | No/invalid session |
| 402 | Payment Required | No credits |
| 404 | Not Found | Generation doesn't exist or wrong user |
| 413 | Payload Too Large | File upload > 10MB |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | Unexpected failure |
| 503 | Service Unavailable | External service down |

---

## CORS Configuration

- All `/api/callbacks/*` routes: Open CORS (kie.ai needs to POST)
- All other routes: Same-origin only (Next.js default)

Configured in `next.config.ts`:

```typescript
async headers() {
  return [{
    source: '/api/callbacks/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
    ],
  }];
}
```

---

## Request Size Limits

| Route | Max Body Size |
|-------|--------------|
| `/api/upload` | 10MB (multipart) |
| `/api/callbacks/kie` | 1MB (JSON) |
| All others | 100KB (JSON) |

Configure in `next.config.ts`:

```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100kb',
    },
  },
};
```

Upload route configures its own limit via the route segment config:

```typescript
// src/app/api/upload/route.ts
export const config = {
  api: { bodyParser: false },  // Handle multipart manually
};
```

---

## WhatsApp Delivery Helper

Used by both `/api/generate` (start notification) and `/api/callbacks/kie` (video delivery):

```typescript
// Called from callback handler after video is ready
async function deliverViaWhatsApp(generation: Generation, user: User): Promise<void> {
  if (!user.whatsapp_jid) return; // Skip if no WhatsApp

  const videoUrl = generation.final_video_url || generation.raw_video_r2_url;
  if (!videoUrl) return;

  // Send video
  await waha.sendFile({
    session: env.waha.session,
    chatId: user.whatsapp_jid,
    file: {
      mimetype: 'video/mp4',
      filename: `winner-${generation.id.slice(0, 8)}.mp4`,
      url: videoUrl,
    },
    caption: '🎬 הסרטון שלך מוכן! It is tremendous!',
  });

  // Send follow-up text
  await waha.sendText({
    session: env.waha.session,
    chatId: user.whatsapp_jid,
    text: `✅ סרטון חדש מ-Winner Video Studio!\n\n📺 צפה בגלריה:\n${env.app.url}/dashboard/gallery\n\n🔥 Keep winning!`,
  });

  // Update delivery status
  await db.query(
    'UPDATE generations SET whatsapp_delivered = true, delivered_at = NOW() WHERE id = $1',
    [generation.id]
  );
}
```

---

## Summary: Route → File Mapping

| Route | File | Lines (est.) |
|-------|------|-------------|
| `POST /api/auth/magic-link` | `src/app/api/auth/magic-link/route.ts` | ~60 |
| `GET /api/auth/verify` | `src/app/api/auth/verify/route.ts` | ~50 |
| `POST /api/auth/whatsapp-otp` | `src/app/api/auth/whatsapp-otp/route.ts` | ~60 |
| `POST /api/auth/verify-otp` | `src/app/api/auth/verify-otp/route.ts` | ~50 |
| `GET /api/auth/me` | `src/app/api/auth/me/route.ts` | ~30 |
| `POST /api/upload` | `src/app/api/upload/route.ts` | ~70 |
| `POST /api/generate` | `src/app/api/generate/route.ts` | ~200 |
| `GET /api/generations` | `src/app/api/generations/route.ts` | ~50 |
| `GET /api/generations/[id]` | `src/app/api/generations/[id]/route.ts` | ~60 |
| `POST /api/callbacks/kie` | `src/app/api/callbacks/kie/route.ts` | ~150 |
| `GET /api/cron/check-stuck` | `src/app/api/cron/check-stuck/route.ts` | ~80 |
| `GET /api/health` | `src/app/api/health/route.ts` | ~40 |
| **Total** | **12 files** | **~900 lines** |
