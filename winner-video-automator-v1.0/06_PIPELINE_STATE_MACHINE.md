# Doc 6: Pipeline State Machine

> **Purpose:** Define every legal stage transition, callback handling flow, error recovery strategy, retry logic, and the sync gate pattern.
> **Action:** This is the contract that `src/lib/pipeline.ts` implements. Every state transition updates Postgres, Redis, and fires the next async task.

---

## 1. Stage Enum

```typescript
enum GenerationStage {
  PENDING            = 'PENDING',
  SCRIPT_PROCESSING  = 'SCRIPT_PROCESSING',
  AUDIO_ISOLATING    = 'AUDIO_ISOLATING',
  VIDEO_GENERATING   = 'VIDEO_GENERATING',
  MUSIC_GENERATING   = 'MUSIC_GENERATING',       // Phase 2
  AWAITING_MUSIC_SELECT = 'AWAITING_MUSIC_SELECT', // Phase 2
  POST_PROCESSING    = 'POST_PROCESSING',          // Phase 2
  DELIVERING         = 'DELIVERING',
  COMPLETE           = 'COMPLETE',
  FAILED             = 'FAILED',
}
```

---

## 2. State Transition Diagram

### Phase 1 Flow (simplified — no music, no FFmpeg)

```
                 ┌──────────┐
                 │ PENDING  │
                 └────┬─────┘
                      │ POST /api/generate received
                      ▼
            ┌──────────────────┐
            │SCRIPT_PROCESSING │  ← Gemini brain call (synchronous, 5-15s)
            └────────┬─────────┘
                     │
            ┌────────┴────────┐
            │                 │
   needs_isolation?     !needs_isolation
            │                 │
            ▼                 │
   ┌─────────────────┐       │
   │AUDIO_ISOLATING  │       │
   │(kie.ai async)   │       │
   └────────┬────────┘       │
            │ callback        │
            │ success         │
            └────────┬────────┘
                     │
                     ▼
           ┌──────────────────┐
           │VIDEO_GENERATING  │  ← kie.ai async task
           │(kie.ai async)    │
           └────────┬─────────┘
                    │ callback success
                    ▼
           ┌──────────────────┐
           │   DELIVERING     │  ← Download video → R2, WhatsApp send
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │    COMPLETE      │  ✅ Terminal state
           └──────────────────┘


   Any stage ──── error + retries exhausted ────▶ ┌────────┐
                                                  │ FAILED │  ❌ Terminal state
                                                  └────────┘
```

### Full Flow (Phase 2+ with music + FFmpeg)

```
PENDING → SCRIPT_PROCESSING → [AUDIO_ISOLATING] → VIDEO_GENERATING
                                                          │
                                     ┌────────────────────┤
                                     │                    │
                              MUSIC_GENERATING    (video callback)
                                     │
                              AWAITING_MUSIC_SELECT
                                     │
                              ──── SYNC GATE ────
                              (both video + music ready?)
                                     │
                              POST_PROCESSING (FFmpeg)
                                     │
                              DELIVERING → COMPLETE
```

---

## 3. Legal Transitions Table

Every transition must go through the `transitionStage()` function. Illegal transitions throw an error.

| From | To | Trigger | Condition |
|------|----|---------|-----------|
| `PENDING` | `SCRIPT_PROCESSING` | `POST /api/generate` starts | Always |
| `SCRIPT_PROCESSING` | `AUDIO_ISOLATING` | Gemini complete | `needs_isolation === true` |
| `SCRIPT_PROCESSING` | `VIDEO_GENERATING` | Gemini complete | `needs_isolation === false` |
| `AUDIO_ISOLATING` | `VIDEO_GENERATING` | Isolation callback success | Always |
| `AUDIO_ISOLATING` | `VIDEO_GENERATING` | Isolation callback fail | Fallback: use original audio |
| `VIDEO_GENERATING` | `DELIVERING` | Video callback success | Phase 1 (no FFmpeg) |
| `VIDEO_GENERATING` | `POST_PROCESSING` | Video callback success | Phase 2 (with FFmpeg) |
| `DELIVERING` | `COMPLETE` | WhatsApp sent + DB updated | Always |
| Any active stage | `FAILED` | Retries exhausted | `retry_count >= MAX_RETRY` |
| `FAILED` | — | Terminal | No outbound transitions |
| `COMPLETE` | — | Terminal | No outbound transitions |

Phase 2 additions:
| `SCRIPT_PROCESSING` | `MUSIC_GENERATING` | Gemini complete | Fires in parallel with isolation/video |
| `MUSIC_GENERATING` | `AWAITING_MUSIC_SELECT` | Suno callback complete | Always |
| `AWAITING_MUSIC_SELECT` | `POST_PROCESSING` | User selects track + video ready | Sync gate |
| `POST_PROCESSING` | `DELIVERING` | FFmpeg callback success | Always |

---

## 4. Core Transition Function

```typescript
// src/lib/pipeline.ts

interface TransitionParams {
  generationId: string;
  fromStage: GenerationStage;
  toStage: GenerationStage;
  updates?: Partial<GenerationRow>;   // Additional column updates
  eventPayload?: Record<string, any>; // Logged in generation_events
}

async function transitionStage(params: TransitionParams): Promise<void> {
  const { generationId, fromStage, toStage, updates = {}, eventPayload } = params;

  // 1. Validate transition is legal
  if (!LEGAL_TRANSITIONS[fromStage]?.includes(toStage)) {
    throw new Error(`Illegal transition: ${fromStage} → ${toStage}`);
  }

  // 2. Atomic Postgres update with optimistic lock
  const result = await db.query(`
    UPDATE generations
    SET stage = $1,
        ${Object.keys(updates).map((k, i) => `${k} = $${i + 4}`).join(', ')}
        ${Object.keys(updates).length > 0 ? ',' : ''}
        updated_at = NOW()
    WHERE id = $2 AND stage = $3
    RETURNING id
  `, [toStage, generationId, fromStage, ...Object.values(updates)]);

  // 3. If no rows updated → stage already changed (race condition / duplicate callback)
  if (result.rowCount === 0) {
    console.warn(`Stage transition skipped: gen=${generationId} expected ${fromStage}, already moved`);
    return;
  }

  // 4. Update Redis cache
  await redis.set(`winner:state:${generationId}`, toStage, 'EX', 7200);

  // 5. Log events
  await db.query(`
    INSERT INTO generation_events (generation_id, stage, event_type, payload)
    VALUES ($1, $2, 'stage_exit', $3),
           ($1, $4, 'stage_enter', $3)
  `, [generationId, fromStage, eventPayload ? JSON.stringify(eventPayload) : null, toStage]);
}
```

### Legal Transitions Map

```typescript
const LEGAL_TRANSITIONS: Record<GenerationStage, GenerationStage[]> = {
  PENDING:               ['SCRIPT_PROCESSING'],
  SCRIPT_PROCESSING:     ['AUDIO_ISOLATING', 'VIDEO_GENERATING', 'MUSIC_GENERATING', 'FAILED'],
  AUDIO_ISOLATING:       ['VIDEO_GENERATING', 'FAILED'],
  VIDEO_GENERATING:      ['DELIVERING', 'POST_PROCESSING', 'FAILED'],
  MUSIC_GENERATING:      ['AWAITING_MUSIC_SELECT', 'FAILED'],
  AWAITING_MUSIC_SELECT: ['POST_PROCESSING', 'FAILED'],
  POST_PROCESSING:       ['DELIVERING', 'FAILED'],
  DELIVERING:            ['COMPLETE', 'FAILED'],
  COMPLETE:              [],  // Terminal
  FAILED:                [],  // Terminal
};
```

---

## 5. Callback Processing Flow

When `/api/callbacks/kie` receives a POST:

```
┌─────────────────────────────┐
│ POST /api/callbacks/kie     │
│ body: { data: { taskId,     │
│   state, resultJson, ... }} │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Look up Redis:               │
│ winner:task:{taskId}         │
│ → { generationId, stage,    │
│     model, attempt }         │
└──────────────┬───────────────┘
               │
         Found? ─── No ──▶ Log warning, return 200
               │
              Yes
               │
               ▼
┌──────────────────────────────┐
│ Load generation from DB      │
│ SELECT * FROM generations    │
│ WHERE id = $1 FOR UPDATE     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Verify stage matches         │
│ gen.stage === expected stage? │
└──────────────┬───────────────┘
               │
         Match? ─── No ──▶ Log "duplicate callback", return 200
               │
              Yes
               │
               ▼
┌──────────────────────────────┐
│ Check callback state         │
└──────┬──────────────┬────────┘
       │              │
   "success"       "fail"
       │              │
       ▼              ▼
  processSuccess  processFailure
```

### processSuccess(generation, callbackData)

```typescript
async function processSuccess(gen: Generation, data: KieCallbackData): Promise<void> {
  const resultUrls = JSON.parse(data.resultJson).resultUrls;
  const resultUrl = resultUrls?.[0];

  // Log cost
  await logApiCost(gen.id, data.model, data.costTime);

  switch (gen.stage) {
    case 'AUDIO_ISOLATING': {
      // Store cleaned audio, fire video generation
      await transitionStage({
        generationId: gen.id,
        fromStage: 'AUDIO_ISOLATING',
        toStage: 'VIDEO_GENERATING',
        updates: { cleaned_audio_url: resultUrl },
        eventPayload: { isolation_result: resultUrl },
      });
      // Fire video task with cleaned audio
      const audioUrl = resultUrl || gen.input_audio_url; // Fallback to original
      await fireVideoTask(gen, audioUrl);
      break;
    }

    case 'VIDEO_GENERATING': {
      // Download video to R2, then deliver
      const r2Url = await downloadToR2(resultUrl, `generations/${gen.id}/raw-video.mp4`);
      await transitionStage({
        generationId: gen.id,
        fromStage: 'VIDEO_GENERATING',
        toStage: 'DELIVERING',
        updates: {
          video_result_url: resultUrl,
          raw_video_r2_url: r2Url,
          final_video_url: r2Url, // Phase 1: raw = final
          video_model_used: data.model,
        },
        eventPayload: { video_url: resultUrl, r2_url: r2Url },
      });
      // Deliver via WhatsApp
      await deliverGeneration(gen.id);
      break;
    }
  }

  // Clean up Redis task tracking
  await redis.del(`winner:task:${data.taskId}`);
}
```

### processFailure(generation, callbackData)

```typescript
async function processFailure(gen: Generation, data: KieCallbackData): Promise<void> {
  const canRetry = gen.retry_count < env.limits.maxRetryCount;

  await db.query(`
    INSERT INTO generation_events (generation_id, stage, event_type, payload)
    VALUES ($1, $2, 'error', $3)
  `, [gen.id, gen.stage, JSON.stringify({
    failCode: data.failCode,
    failMsg: data.failMsg,
    attempt: gen.retry_count + 1,
    willRetry: canRetry,
  })]);

  if (canRetry) {
    // ─── RETRY ───
    await db.query(
      'UPDATE generations SET retry_count = retry_count + 1 WHERE id = $1',
      [gen.id]
    );

    // Special case: audio isolation failure → use original audio, skip to video
    if (gen.stage === 'AUDIO_ISOLATING') {
      console.warn(`Isolation failed for ${gen.id}, falling back to original audio`);
      await transitionStage({
        generationId: gen.id,
        fromStage: 'AUDIO_ISOLATING',
        toStage: 'VIDEO_GENERATING',
        eventPayload: { fallback: 'using original audio after isolation failure' },
      });
      await fireVideoTask(gen, gen.input_audio_url!);
      return;
    }

    // Re-fire the same task
    await retryCurrentStage(gen);

  } else {
    // ─── EXHAUSTED ───
    await failGeneration(gen.id, gen.stage, data.failMsg || 'Task failed after max retries');
  }

  await redis.del(`winner:task:${data.taskId}`);
}
```

---

## 6. Retry Strategy

| Stage | Max Retries | Backoff | Special Behavior |
|-------|-------------|---------|-----------------|
| `AUDIO_ISOLATING` | 1 | None | On fail: skip isolation, use original audio |
| `VIDEO_GENERATING` | 3 | 0s, 10s, 30s | On fail: try default model before giving up |
| `DELIVERING` | 3 | 5s, 10s, 30s | WhatsApp only; gallery update is non-retriable |

### Retry with Model Fallback

If the Gemini-selected model fails twice, the third retry switches to `kling/ai-avatar-pro`:

```typescript
async function retryCurrentStage(gen: Generation): Promise<void> {
  if (gen.stage === 'VIDEO_GENERATING' && gen.retry_count >= 2) {
    // Third attempt: switch to fallback model
    const fallbackModel = 'kling/ai-avatar-pro';
    console.warn(`Switching ${gen.id} to fallback model: ${fallbackModel}`);

    await db.query(
      'UPDATE generations SET video_model_used = $1 WHERE id = $2',
      [fallbackModel, gen.id]
    );

    await fireVideoTask(gen, gen.cleaned_audio_url || gen.input_audio_url!, fallbackModel);
  } else {
    // Normal retry: same model
    await fireVideoTask(gen, gen.cleaned_audio_url || gen.input_audio_url!);
  }
}
```

---

## 7. Failure Handler

```typescript
async function failGeneration(
  generationId: string,
  failedStage: string,
  errorMessage: string
): Promise<void> {
  // 1. Mark generation as failed
  await db.query(`
    UPDATE generations SET
      stage = 'FAILED',
      failed_at_stage = $2,
      error_message = $3,
      updated_at = NOW()
    WHERE id = $1
  `, [generationId, failedStage, errorMessage]);

  // 2. Log event
  await db.query(`
    INSERT INTO generation_events (generation_id, stage, event_type, payload)
    VALUES ($1, 'FAILED', 'stage_enter', $2)
  `, [generationId, JSON.stringify({ failed_at: failedStage, error: errorMessage })]);

  // 3. Refund credit
  await refundCredit(generationId);

  // 4. Decrement concurrent counter
  const gen = await db.queryRow('SELECT user_id FROM generations WHERE id = $1', [generationId]);
  if (gen) {
    await redis.decr(`winner:rate:concurrent:${gen.user_id}`);
  }

  // 5. Update Redis state cache
  await redis.set(`winner:state:${generationId}`, 'FAILED', 'EX', 7200);
  // Invalidate credit cache
  if (gen) await redis.del(`winner:user:credits:${gen.user_id}`);

  // 6. Notify user via WhatsApp
  const user = await db.queryRow('SELECT whatsapp_jid, name FROM users WHERE id = $1', [gen?.user_id]);
  if (user?.whatsapp_jid) {
    await waha.sendText({
      session: env.waha.session,
      chatId: user.whatsapp_jid,
      text: `⚠️ ${user.name || 'Boss'}, the video hit a snag. No credits were charged. Our team is looking into it.\n\nTry again: ${env.app.url}/dashboard`,
    }).catch(err => console.error('WhatsApp notify failed:', err));
  }
}
```

---

## 8. Credit Refund

```typescript
async function refundCredit(generationId: string): Promise<void> {
  const gen = await db.queryRow(
    'SELECT user_id, credits_charged, credit_refunded FROM generations WHERE id = $1',
    [generationId]
  );

  if (!gen || gen.credit_refunded || gen.credits_charged === 0) return;

  await db.transaction(async (tx) => {
    // Restore credits
    await tx.query(`
      UPDATE user_credits
      SET used_credits = used_credits - $2,
          monthly_used = GREATEST(monthly_used - $2, 0)
      WHERE user_id = $1
    `, [gen.user_id, gen.credits_charged]);

    // Mark refunded
    await tx.query(
      'UPDATE generations SET credit_refunded = true WHERE id = $1',
      [generationId]
    );

    // Get new balance
    const balance = await tx.queryRow(
      'SELECT available_credits FROM user_credits WHERE user_id = $1',
      [gen.user_id]
    );

    // Log transaction
    await tx.query(`
      INSERT INTO credit_transactions (user_id, type, amount, balance_after, generation_id, description)
      VALUES ($1, 'refund', $2, $3, $4, 'Automatic refund — generation failed')
    `, [gen.user_id, gen.credits_charged, balance?.available_credits || 0, generationId]);
  });

  // Invalidate cache
  await redis.del(`winner:user:credits:${gen.user_id}`);

  // Log event
  await db.query(`
    INSERT INTO generation_events (generation_id, stage, event_type, payload)
    VALUES ($1, 'FAILED', 'credit_refunded', $2)
  `, [generationId, JSON.stringify({ amount: gen.credits_charged })]);
}
```

---

## 9. Fire Task Helpers

### fireIsolationTask

```typescript
async function fireIsolationTask(gen: Generation): Promise<string> {
  const response = await kie.createTask({
    model: 'elevenlabs/audio-isolation',
    input: { audio_url: gen.input_audio_url },
    callBackUrl: env.kie.callbackUrl,
  });

  const taskId = response.data.taskId;

  // Track in Redis
  await redis.set(`winner:task:${taskId}`, JSON.stringify({
    generationId: gen.id,
    stage: 'AUDIO_ISOLATING',
    model: 'elevenlabs/audio-isolation',
    attempt: gen.retry_count + 1,
    createdAt: Date.now(),
  }), 'EX', 3600);

  // Update generation
  await db.query(
    'UPDATE generations SET isolation_task_id = $1 WHERE id = $2',
    [taskId, gen.id]
  );

  // Log event
  await db.query(`
    INSERT INTO generation_events (generation_id, stage, event_type, payload)
    VALUES ($1, 'AUDIO_ISOLATING', 'task_created', $2)
  `, [gen.id, JSON.stringify({ taskId, model: 'elevenlabs/audio-isolation' })]);

  return taskId;
}
```

### fireVideoTask

```typescript
async function fireVideoTask(
  gen: Generation,
  audioUrl: string,
  modelOverride?: string
): Promise<string> {
  const model = modelOverride || gen.recommended_model || 'kling/ai-avatar-pro';
  const imageUrl = gen.reference_image_url || getDefaultHeadshot(gen.tenant_id);

  // Build model-specific input
  let input: Record<string, any>;
  switch (model) {
    case 'kling/ai-avatar-pro':
      input = {
        image_url: imageUrl,
        audio_url: audioUrl,
        prompt: gen.video_prompt || '',
      };
      break;

    case 'infinitalk/from-audio':
      input = {
        image_url: imageUrl,
        audio_url: audioUrl,
        prompt: gen.video_prompt || '',
        resolution: gen.model_params?.resolution || '720p',
      };
      break;

    case 'kling-3.0/video':
      input = {
        mode: gen.model_params?.mode || 'std',
      };
      break;

    default:
      // Unknown model → fallback
      input = {
        image_url: imageUrl,
        audio_url: audioUrl,
        prompt: gen.video_prompt || '',
      };
  }

  const response = await kie.createTask({
    model,
    input,
    callBackUrl: env.kie.callbackUrl,
  });

  const taskId = response.data.taskId;

  // Track in Redis
  await redis.set(`winner:task:${taskId}`, JSON.stringify({
    generationId: gen.id,
    stage: 'VIDEO_GENERATING',
    model,
    attempt: gen.retry_count + 1,
    createdAt: Date.now(),
  }), 'EX', 3600);

  // Update generation
  await db.query(
    'UPDATE generations SET video_task_id = $1, video_model_used = $2 WHERE id = $3',
    [taskId, model, gen.id]
  );

  // Log event
  await db.query(`
    INSERT INTO generation_events (generation_id, stage, event_type, payload)
    VALUES ($1, 'VIDEO_GENERATING', 'task_created', $2)
  `, [gen.id, JSON.stringify({ taskId, model, audioUrl: audioUrl.slice(-40) })]);

  return taskId;
}
```

---

## 10. Delivery Flow

```typescript
async function deliverGeneration(generationId: string): Promise<void> {
  const gen = await db.queryRow('SELECT * FROM generations WHERE id = $1', [generationId]);
  if (!gen) throw new Error(`Generation ${generationId} not found`);

  const user = await db.queryRow('SELECT * FROM users WHERE id = $1', [gen.user_id]);
  if (!user) throw new Error(`User ${gen.user_id} not found`);

  const videoUrl = gen.final_video_url || gen.raw_video_r2_url || gen.video_result_url;

  // 1. Send WhatsApp (best effort — don't fail generation if WhatsApp fails)
  if (user.whatsapp_jid && videoUrl) {
    try {
      await waha.sendFile({
        session: env.waha.session,
        chatId: user.whatsapp_jid,
        file: {
          mimetype: 'video/mp4',
          filename: `winner-${gen.id.slice(0, 8)}.mp4`,
          url: videoUrl,
        },
        caption: '🎬 הסרטון שלך מוכן! It is Tremendous!',
      });

      await waha.sendText({
        session: env.waha.session,
        chatId: user.whatsapp_jid,
        text: `✅ סרטון חדש!\n\n📺 גלריה: ${env.app.url}/dashboard/gallery\n\n🔥 Keep winning!`,
      });

      await db.query(
        'UPDATE generations SET whatsapp_delivered = true, whatsapp_message_id = $2 WHERE id = $1',
        [gen.id, 'sent'] // WAHA doesn't return message ID in sendFile response
      );
    } catch (err) {
      console.error(`WhatsApp delivery failed for ${gen.id}:`, err);
      // Don't fail the generation — video is still in gallery
    }
  }

  // 2. Mark complete
  await transitionStage({
    generationId: gen.id,
    fromStage: 'DELIVERING',
    toStage: 'COMPLETE',
    updates: {
      completed_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    },
    eventPayload: {
      whatsapp_sent: !!user.whatsapp_jid,
      video_url: videoUrl,
    },
  });

  // 3. Decrement concurrent counter
  await redis.decr(`winner:rate:concurrent:${gen.user_id}`);

  // 4. Invalidate gallery cache
  await redis.del(`winner:gallery:user:${gen.user_id}`);
}
```

---

## 11. Stuck Task Recovery (Cron)

The cron job at `/api/cron/check-stuck` runs every 2 minutes:

```typescript
async function checkStuckGenerations(): Promise<CronResult> {
  const stuck = await db.query(`
    SELECT g.id, g.stage, g.video_task_id, g.isolation_task_id,
           g.retry_count, g.user_id, g.recommended_model,
           EXTRACT(EPOCH FROM (NOW() - g.updated_at)) / 60 as minutes_stuck
    FROM generations g
    WHERE g.stage IN ('AUDIO_ISOLATING', 'VIDEO_GENERATING')
      AND g.updated_at < NOW() - INTERVAL '${env.limits.stuckThresholdMinutes} minutes'
      AND g.retry_count < ${env.limits.maxRetryCount}
    ORDER BY g.updated_at ASC
    LIMIT 10
  `);

  let recovered = 0, stillStuck = 0, failed = 0;

  for (const gen of stuck.rows) {
    const taskId = gen.stage === 'AUDIO_ISOLATING'
      ? gen.isolation_task_id
      : gen.video_task_id;

    if (!taskId) {
      // No task ID — re-fire
      await retryCurrentStage(gen);
      recovered++;
      continue;
    }

    // Poll kie.ai for status
    try {
      const status = await kie.getTaskStatus(taskId);

      if (status.data.state === 'success') {
        // Callback was lost — process it now
        await processSuccess(gen, status.data);
        recovered++;
      } else if (status.data.state === 'fail') {
        await processFailure(gen, status.data);
        failed++;
      } else {
        // Still waiting — if over 15 min, re-fire
        if (gen.minutes_stuck > 15) {
          await retryCurrentStage(gen);
          recovered++;
        } else {
          stillStuck++;
        }
      }
    } catch (err) {
      console.error(`Cron poll failed for task ${taskId}:`, err);
      stillStuck++;
    }

    // Log event
    await db.query(`
      INSERT INTO generation_events (generation_id, stage, event_type, payload)
      VALUES ($1, $2, 'task_polled', $3)
    `, [gen.id, gen.stage, JSON.stringify({
      taskId, minutes_stuck: gen.minutes_stuck, action: 'cron_check'
    })]);
  }

  return { checked: stuck.rows.length, recovered, stillStuck, failed };
}
```

---

## 12. Download-to-R2 Helper

kie.ai CDN URLs are ephemeral (~10 min). We must download and re-upload to R2 immediately:

```typescript
async function downloadToR2(sourceUrl: string, r2Key: string): Promise<string> {
  // 1. Fetch the file
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || 'video/mp4';

  // 2. Upload to R2
  await r2.putObject({
    Bucket: env.r2.bucketName,
    Key: r2Key,
    Body: buffer,
    ContentType: contentType,
  });

  // 3. Return the R2 URL
  return `${env.r2.endpoint}/${env.r2.bucketName}/${r2Key}`;
}
```

**Note:** For large video files (50MB+), this should use streaming instead of buffering. Phase 1 videos are typically 5-15MB so buffer is fine.

---

## 13. Timeout Budget

Vercel serverless functions have execution limits. Here's how the time budget breaks down:

| Operation | Route | Time Budget | Notes |
|-----------|-------|-------------|-------|
| Gemini brain call | `/api/generate` | 5-15s | Synchronous within 60s function |
| Fire kie.ai task | `/api/generate` | 1-2s | Just POST, async processing |
| WhatsApp notification | `/api/generate` | 2-3s | Fire-and-forget |
| **Total /api/generate** | | **~10-20s** | Well within 60s limit |
| Process callback | `/api/callbacks/kie` | 2-5s | Parse + DB update + fire next |
| Download to R2 | `/api/callbacks/kie` | 5-15s | Depends on video file size |
| WhatsApp delivery | `/api/callbacks/kie` | 2-3s | Send file + text |
| **Total callback** | | **~10-25s** | Within 30s limit |
| Poll kie.ai per task | `/api/cron/check-stuck` | 1-2s | Simple GET |
| Process up to 10 tasks | `/api/cron/check-stuck` | 10-20s | Sequential polling |
| **Total cron** | | **~10-25s** | Within 30s limit |

---

## 14. Concurrency & Race Conditions

### Problem: Duplicate Callbacks
kie.ai might send the same callback twice. The `transitionStage` function uses `WHERE stage = $fromStage` as an optimistic lock — the second callback finds the stage already changed and no-ops.

### Problem: Cron + Callback Race
The cron job might poll a task that succeeds at the exact moment its callback arrives. Both `transitionStage` calls use the same optimistic lock, so only one proceeds.

### Problem: Concurrent Credit Updates
Credit consumption and refund use `FOR UPDATE` row locks:

```sql
-- Consume (in /api/generate)
UPDATE user_credits SET used_credits = used_credits + 1
WHERE user_id = $1 AND available_credits > 0;

-- Refund (in failGeneration)
UPDATE user_credits SET used_credits = used_credits - 1
WHERE user_id = $1;
```

Both are atomic single-row updates — Postgres handles concurrency natively.

### Problem: Multiple Generations from Same User
The concurrent counter `winner:rate:concurrent:{userId}` prevents >2 active generations. Redis INCR is atomic. The counter is decremented on COMPLETE or FAILED, with a 600s TTL as safety net.

---

## 15. Pipeline Lifecycle Summary

For a typical successful generation (with audio isolation):

```
t=0s    User clicks "Generate"
t=0.1s  POST /api/generate starts
t=0.2s  Auth check, credit check, rate check ✓
t=0.3s  Generation row created (PENDING)
t=0.4s  Stage → SCRIPT_PROCESSING
t=0.5s  Gemini brain call starts...
t=8s    Gemini responds with JSON
t=8.1s  Stage → AUDIO_ISOLATING
t=8.2s  kie.ai isolation task fired
t=8.3s  WhatsApp "cooking" notification sent
t=8.5s  Response returned to user (201)
        ── async gap (~30-60s) ──
t=40s   Isolation callback received
t=40.1s Stage → VIDEO_GENERATING
t=40.2s kie.ai video task fired (with cleaned audio)
        ── async gap (~2-8 minutes) ──
t=340s  Video callback received
t=341s  Video downloaded to R2
t=345s  Stage → DELIVERING
t=346s  WhatsApp video sent
t=348s  WhatsApp follow-up text sent
t=349s  Stage → COMPLETE ✅
        Total: ~5.8 minutes
```

Without isolation: subtract ~30s, total ~5 minutes.
