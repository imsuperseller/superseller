import { query, queryRow, transaction } from "./db";
import * as redis from "./redis";
import { uploadFromUrl, ensurePublicUrl } from "./r2";
import { createTask, getTaskStatus, extractResultUrls, buildAvatarProInput, buildInfinitalkInput, buildKling3Input, buildIsolationInput } from "./kie";
import { sendText, sendVideo } from "./waha";
import { refundCredit } from "./credits";
import { createPipelineRun, updatePipelineRun, findPipelineRunByGenerationId } from "./pipeline-run";
import { getEnv } from "./env";
import { LEGAL_TRANSITIONS, type GenerationStage, type GenerationRow } from "@/types";

// ── Redis task tracking shape ──────────────────────────────────────

interface TaskTracker {
  generationId: string;
  stage: string;
  model: string;
  attempt: number;
  createdAt: number;
}

// ── Callback data from kie.ai ──────────────────────────────────────

export interface KieCallbackData {
  taskId: string;
  model: string;
  state: "waiting" | "success" | "fail";
  resultJson: string;
  failCode?: string | null;
  failMsg?: string | null;
  costTime?: number | null;
}

// ── Stage Transition (optimistic locking) ──────────────────────────

export async function transitionStage(params: {
  generationId: string;
  fromStage: GenerationStage;
  toStage: GenerationStage;
  updates?: Record<string, unknown>;
  eventPayload?: Record<string, unknown>;
}): Promise<boolean> {
  const { generationId, fromStage, toStage, updates = {}, eventPayload } = params;

  // Validate transition is legal
  if (!LEGAL_TRANSITIONS[fromStage]?.includes(toStage)) {
    throw new Error(`Illegal transition: ${fromStage} → ${toStage}`);
  }

  // Build SET clause for additional updates
  const setClauses = ["stage = $1", "updated_at = NOW()"];
  const values: unknown[] = [toStage, generationId, fromStage];
  let paramIdx = 4;

  for (const [key, val] of Object.entries(updates)) {
    setClauses.push(`${key} = $${paramIdx}`);
    values.push(val);
    paramIdx++;
  }

  // Atomic update with optimistic lock
  const rows = await query(
    `UPDATE winner_generations SET ${setClauses.join(", ")}
     WHERE id = $2 AND stage = $3
     RETURNING id`,
    values
  );

  if (rows.length === 0) {
    console.warn(`Stage transition skipped: gen=${generationId} expected ${fromStage}, already moved`);
    return false;
  }

  // Update Redis state cache
  await redis.setJson(`winner:state:${generationId}`, toStage, 7200);

  // Log events
  const payload = eventPayload ? JSON.stringify(eventPayload) : null;
  await query(
    `INSERT INTO winner_generation_events (generation_id, stage, event_type, payload)
     VALUES ($1, $2, 'stage_exit', $3)`,
    [generationId, fromStage, payload]
  );
  await query(
    `INSERT INTO winner_generation_events (generation_id, stage, event_type, payload)
     VALUES ($1, $2, 'stage_enter', $3)`,
    [generationId, toStage, payload]
  );

  return true;
}

// ── Fire Isolation Task ────────────────────────────────────────────

export async function fireIsolationTask(gen: GenerationRow): Promise<string> {
  const env = getEnv();
  const callbackUrl = `${env.CALLBACK_BASE_URL}/api/callbacks/kie`;

  // Convert R2 URL to presigned URL so kie.ai can fetch it
  const publicAudioUrl = ensurePublicUrl(gen.input_audio_url!);

  const response = await createTask({
    model: "elevenlabs/audio-isolation",
    input: buildIsolationInput({ audioUrl: publicAudioUrl }),
    callBackUrl: callbackUrl,
  });

  const taskId = response.data.taskId;

  // Track in Redis
  const tracker: TaskTracker = {
    generationId: gen.id,
    stage: "AUDIO_ISOLATING",
    model: "elevenlabs/audio-isolation",
    attempt: gen.retry_count + 1,
    createdAt: Date.now(),
  };
  await redis.setJson(`winner:task:${taskId}`, tracker, 3600);

  // Update generation
  await query(
    `UPDATE winner_generations SET isolation_task_id = $1 WHERE id = $2`,
    [taskId, gen.id]
  );

  // Log event
  await query(
    `INSERT INTO winner_generation_events (generation_id, stage, event_type, payload)
     VALUES ($1, 'AUDIO_ISOLATING', 'task_created', $2)`,
    [gen.id, JSON.stringify({ taskId, model: "elevenlabs/audio-isolation" })]
  );

  return taskId;
}

// ── Fire Video Task ────────────────────────────────────────────────

export async function fireVideoTask(
  gen: GenerationRow,
  audioUrl: string,
  modelOverride?: string
): Promise<string> {
  const env = getEnv();
  const callbackUrl = `${env.CALLBACK_BASE_URL}/api/callbacks/kie`;
  const model = modelOverride || gen.recommended_model || "kling/ai-avatar-pro";

  // Convert R2 URLs to presigned URLs so kie.ai can fetch them
  const publicAudioUrl = audioUrl ? ensurePublicUrl(audioUrl) : "";
  const publicImageUrl = gen.reference_image_url ? ensurePublicUrl(gen.reference_image_url) : "";

  // Build model-specific input
  let input: Record<string, unknown>;
  const modelParams = gen.model_params as Record<string, string> | null;

  switch (model) {
    case "kling/ai-avatar-pro":
      input = buildAvatarProInput({
        imageUrl: publicImageUrl,
        audioUrl: publicAudioUrl,
        prompt: gen.video_prompt || "",
      });
      break;

    case "infinitalk/from-audio":
      input = buildInfinitalkInput({
        imageUrl: publicImageUrl,
        audioUrl: publicAudioUrl,
        prompt: gen.video_prompt || "",
        resolution: (modelParams?.resolution as "480p" | "720p") || "720p",
      });
      break;

    case "kling-3.0/video":
      input = buildKling3Input({
        mode: (modelParams?.mode as "std" | "pro") || "std",
        prompt: gen.video_prompt || "",
        imageUrl: publicImageUrl || undefined,
      });
      break;

    default:
      input = buildAvatarProInput({
        imageUrl: publicImageUrl,
        audioUrl: publicAudioUrl,
        prompt: gen.video_prompt || "",
      });
  }

  const response = await createTask({
    model,
    input,
    callBackUrl: callbackUrl,
  });

  const taskId = response.data.taskId;

  // Track in Redis
  const tracker: TaskTracker = {
    generationId: gen.id,
    stage: "VIDEO_GENERATING",
    model,
    attempt: gen.retry_count + 1,
    createdAt: Date.now(),
  };
  await redis.setJson(`winner:task:${taskId}`, tracker, 3600);

  // Update generation
  await query(
    `UPDATE winner_generations SET video_task_id = $1 WHERE id = $2`,
    [taskId, gen.id]
  );

  // Log event
  await query(
    `INSERT INTO winner_generation_events (generation_id, stage, event_type, payload)
     VALUES ($1, 'VIDEO_GENERATING', 'task_created', $2)`,
    [gen.id, JSON.stringify({ taskId, model })]
  );

  // PipelineRun tracking (best-effort, never breaks pipeline)
  try {
    await createPipelineRun({
      tenantId: gen.tenant_id ?? undefined,
      pipelineType: "avatar_video",
      status: "running",
      inputJson: { generationId: gen.id, taskId, stage: "VIDEO_GENERATING" },
      modelUsed: model,
    });
  } catch (err) {
    console.error(`PipelineRun create failed for gen ${gen.id}:`, err);
  }

  return taskId;
}

// ── Process Callback Success ───────────────────────────────────────

export async function processCallbackSuccess(
  gen: GenerationRow,
  data: KieCallbackData
): Promise<void> {
  const resultUrls = extractResultUrls(data.resultJson);
  const resultUrl = resultUrls[0];

  // Log cost — upsert into winner_generation_costs
  if (data.costTime) {
    const creditColumn = gen.stage === "AUDIO_ISOLATING" ? "isolation_credits" : "video_credits";
    await query(
      `INSERT INTO winner_generation_costs (generation_id, ${creditColumn})
       VALUES ($1, $2)
       ON CONFLICT (generation_id) DO UPDATE SET ${creditColumn} = $2`,
      [gen.id, 0]
    ).catch((err) => console.error("Cost logging failed:", err));
  }

  switch (gen.stage) {
    case "AUDIO_ISOLATING": {
      await transitionStage({
        generationId: gen.id,
        fromStage: "AUDIO_ISOLATING",
        toStage: "VIDEO_GENERATING",
        updates: { cleaned_audio_url: resultUrl || null },
        eventPayload: { isolation_result: resultUrl },
      });
      const audioForVideo = resultUrl || gen.input_audio_url!;
      await fireVideoTask(gen, audioForVideo);
      break;
    }

    case "VIDEO_GENERATING": {
      if (!resultUrl) {
        await failGeneration(gen.id, "VIDEO_GENERATING", "Video completed but no result URL");
        return;
      }
      // Download video to R2 (kie.ai CDN URLs are ephemeral)
      const r2Key = `generations/${gen.id}/raw-video.mp4`;
      const r2Url = await downloadToR2(resultUrl, r2Key);

      await transitionStage({
        generationId: gen.id,
        fromStage: "VIDEO_GENERATING",
        toStage: "DELIVERING",
        updates: {
          video_result_url: resultUrl,
          raw_video_r2_url: r2Url,
          final_video_url: r2Url, // Phase 1: raw = final
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

// ── Process Callback Failure ───────────────────────────────────────

const MAX_RETRIES = 3;

// Avatar/talking-head models — when these fail, fall back to kling-3.0/video
const AVATAR_MODELS = ["kling/ai-avatar-pro", "kling/ai-avatar-standard", "infinitalk/from-audio"];
const FALLBACK_MODEL = "kling-3.0/video";

export async function processCallbackFailure(
  gen: GenerationRow,
  data: KieCallbackData
): Promise<void> {
  const canRetry = gen.retry_count < MAX_RETRIES;
  const failedModel = data.model || gen.recommended_model || "kling/ai-avatar-pro";
  const isAvatarModel = AVATAR_MODELS.includes(failedModel);

  // Log error event
  await query(
    `INSERT INTO winner_generation_events (generation_id, stage, event_type, payload)
     VALUES ($1, $2, 'error', $3)`,
    [gen.id, gen.stage, JSON.stringify({
      failCode: data.failCode,
      failMsg: data.failMsg,
      failedModel,
      attempt: gen.retry_count + 1,
      willRetry: canRetry,
      willFallback: isAvatarModel && gen.stage === "VIDEO_GENERATING",
    })]
  );

  if (canRetry) {
    // Increment retry count
    await query(
      `UPDATE winner_generations SET retry_count = retry_count + 1 WHERE id = $1`,
      [gen.id]
    );

    // Audio isolation failure → use original audio, skip to video
    if (gen.stage === "AUDIO_ISOLATING") {
      console.warn(`Isolation failed for ${gen.id}, falling back to original audio`);
      await transitionStage({
        generationId: gen.id,
        fromStage: "AUDIO_ISOLATING",
        toStage: "VIDEO_GENERATING",
        eventPayload: { fallback: "using original audio after isolation failure" },
      });
      await fireVideoTask(gen, gen.input_audio_url || "");
    } else if (gen.stage === "VIDEO_GENERATING") {
      if (isAvatarModel) {
        // Avatar/talking-head models are down — immediately fall back to kling-3.0/video
        // No lip-sync, but at least produces a video using reference image + prompt
        console.warn(`Avatar model ${failedModel} failed for ${gen.id}, falling back to ${FALLBACK_MODEL}`);
        await query(
          `INSERT INTO winner_generation_events (generation_id, stage, event_type, payload)
           VALUES ($1, 'VIDEO_GENERATING', 'model_fallback', $2)`,
          [gen.id, JSON.stringify({ from: failedModel, to: FALLBACK_MODEL, reason: "avatar model failure" })]
        );
        await fireVideoTask(
          gen,
          gen.cleaned_audio_url || gen.input_audio_url || "",
          FALLBACK_MODEL
        );
      } else {
        // Non-avatar model (kling-3.0/video etc.) — retry same model
        await fireVideoTask(gen, gen.cleaned_audio_url || gen.input_audio_url || "");
      }
    }
  } else {
    await failGeneration(gen.id, gen.stage, data.failMsg || "Task failed after max retries");
  }

  await redis.del(`winner:task:${data.taskId}`);
}

// ── Fail Generation ────────────────────────────────────────────────

export async function failGeneration(
  generationId: string,
  failedStage: string,
  errorMessage: string
): Promise<void> {
  const env = getEnv();

  // Mark as failed
  await query(
    `UPDATE winner_generations SET
      stage = 'FAILED', failed_at_stage = $2, error_message = $3, updated_at = NOW()
     WHERE id = $1`,
    [generationId, failedStage, errorMessage]
  );

  // Log event
  await query(
    `INSERT INTO winner_generation_events (generation_id, stage, event_type, payload)
     VALUES ($1, 'FAILED', 'stage_enter', $2)`,
    [generationId, JSON.stringify({ failed_at: failedStage, error: errorMessage })]
  );

  // PipelineRun: mark failed (best-effort)
  try {
    const pipelineRunId = await findPipelineRunByGenerationId(generationId);
    if (pipelineRunId) {
      await updatePipelineRun(pipelineRunId, {
        status: "failed",
        errorMessage,
      });
    }
  } catch (err) {
    console.error(`PipelineRun update (failed) failed for gen ${generationId}:`, err);
  }

  // Refund credit
  await refundCredit(generationId).catch((err) =>
    console.error(`Credit refund failed for ${generationId}:`, err)
  );

  // Decrement concurrent counter + update Redis state
  const gen = await queryRow<{ user_id: string }>(
    `SELECT user_id FROM winner_generations WHERE id = $1`,
    [generationId]
  );

  if (gen) {
    await redis.decr(`winner:rate:concurrent:${gen.user_id}`);
    await redis.setJson(`winner:state:${generationId}`, "FAILED", 7200);
    await redis.del(`winner:user:credits:${gen.user_id}`);
  }

  // WhatsApp notification (best effort)
  if (gen) {
    const user = await queryRow<{ whatsapp_jid: string | null; name: string | null }>(
      `SELECT whatsapp_jid, name FROM winner_users WHERE id = $1`,
      [gen.user_id]
    );
    if (user?.whatsapp_jid) {
      await sendText(
        user.whatsapp_jid,
        `⚠️ ${user.name || "בוס"}, הייתה תקלה בהפקת הסרטון. לא חויבת. נסה שוב:\n${env.APP_URL}/dashboard`
      ).catch((err: unknown) => console.error("WhatsApp notify failed:", err));
    }
  }
}

// ── Deliver Generation ─────────────────────────────────────────────

export async function deliverGeneration(generationId: string): Promise<void> {
  const env = getEnv();

  const gen = await queryRow<GenerationRow>(
    `SELECT * FROM winner_generations WHERE id = $1`,
    [generationId]
  );
  if (!gen) throw new Error(`Generation ${generationId} not found`);

  const user = await queryRow<{
    whatsapp_jid: string | null;
    name: string | null;
  }>(
    `SELECT whatsapp_jid, name FROM winner_users WHERE id = $1`,
    [gen.user_id]
  );

  // Prefer original kie.ai CDN URL for delivery (R2 may not be publicly accessible)
  // R2 URL is for long-term storage; kie.ai CDN URL is for immediate delivery
  const videoUrl = gen.video_result_url || gen.final_video_url || gen.raw_video_r2_url;

  // Send WhatsApp (best effort)
  if (user?.whatsapp_jid && videoUrl) {
    try {
      const msgId = await sendVideo(
        user.whatsapp_jid,
        videoUrl,
        "🎬 הסרטון שלך מוכן!"
      );

      if (msgId) {
        await sendText(
          user.whatsapp_jid,
          `✅ הסרטון שלך מוכן!\n\n📺 גלריה: ${env.APP_URL}/dashboard/gallery`
        );

        await query(
          `UPDATE winner_generations SET whatsapp_delivered = true, whatsapp_message_id = $2 WHERE id = $1`,
          [gen.id, msgId]
        );
      } else {
        console.error(`WhatsApp sendFile returned null for ${gen.id}`);
      }
    } catch (err) {
      console.error(`WhatsApp delivery failed for ${gen.id}:`, err);
    }
  }

  // Mark complete
  await transitionStage({
    generationId: gen.id,
    fromStage: "DELIVERING",
    toStage: "COMPLETE",
    eventPayload: {
      whatsapp_sent: !!user?.whatsapp_jid,
      video_url: videoUrl,
    },
  });

  // PipelineRun: mark completed (best-effort)
  try {
    const pipelineRunId = await findPipelineRunByGenerationId(gen.id);
    if (pipelineRunId) {
      await updatePipelineRun(pipelineRunId, {
        status: "completed",
        outputJson: { videoUrl: videoUrl ?? null, whatsappSent: !!user?.whatsapp_jid },
        deliveredVia: user?.whatsapp_jid ? "whatsapp" : "gallery",
        deliveredAt: new Date(),
      });
    }
  } catch (err) {
    console.error(`PipelineRun update (completed) failed for gen ${gen.id}:`, err);
  }

  // Decrement concurrent counter + invalidate caches
  await redis.decr(`winner:rate:concurrent:${gen.user_id}`);
  await redis.del(`winner:gallery:user:${gen.user_id}`);
}

// ── Download to R2 ─────────────────────────────────────────────────

export async function downloadToR2(
  sourceUrl: string,
  r2Key: string
): Promise<string> {
  return uploadFromUrl(r2Key, sourceUrl);
}

// ── Check Stuck Generations (for cron) ─────────────────────────────

export async function checkStuckGenerations(): Promise<{
  checked: number;
  recovered: number;
  stillStuck: number;
  failed: number;
}> {
  const stuckRows = await query<
    GenerationRow & { minutes_stuck: number }
  >(
    `SELECT g.*,
            EXTRACT(EPOCH FROM (NOW() - g.updated_at)) / 60 as minutes_stuck
     FROM winner_generations g
     WHERE g.stage IN ('AUDIO_ISOLATING', 'VIDEO_GENERATING')
       AND g.updated_at < NOW() - INTERVAL '10 minutes'
       AND g.retry_count < $1
     ORDER BY g.updated_at ASC
     LIMIT 10`,
    [MAX_RETRIES]
  );

  let recovered = 0, stillStuck = 0, failed = 0;

  for (const gen of stuckRows) {
    const taskId = gen.stage === "AUDIO_ISOLATING"
      ? gen.isolation_task_id
      : gen.video_task_id;

    if (!taskId) {
      // No task ID — increment retry and re-fire
      await query(
        `UPDATE winner_generations SET retry_count = retry_count + 1 WHERE id = $1`,
        [gen.id]
      );
      if (gen.stage === "VIDEO_GENERATING") {
        // If the stuck model is an avatar model, fall back to kling-3.0/video
        const stuckModel = gen.recommended_model || "kling/ai-avatar-pro";
        const useModel = AVATAR_MODELS.includes(stuckModel) ? FALLBACK_MODEL : undefined;
        await fireVideoTask(gen, gen.cleaned_audio_url || gen.input_audio_url!, useModel);
      }
      recovered++;
      continue;
    }

    try {
      const status = await getTaskStatus(taskId);

      if (status.data.state === "success") {
        await processCallbackSuccess(gen, {
          taskId,
          model: status.data.model,
          state: "success",
          resultJson: status.data.resultJson,
          costTime: status.data.costTime,
        });
        recovered++;
      } else if (status.data.state === "fail") {
        await processCallbackFailure(gen, {
          taskId,
          model: status.data.model,
          state: "fail",
          resultJson: status.data.resultJson,
          failCode: status.data.failCode,
          failMsg: status.data.failMsg,
        });
        failed++;
      } else {
        // Still waiting — if over 15 min, re-fire
        if (gen.minutes_stuck > 15) {
          await query(
            `UPDATE winner_generations SET retry_count = retry_count + 1 WHERE id = $1`,
            [gen.id]
          );
          if (gen.stage === "VIDEO_GENERATING") {
            const stuckModel = gen.recommended_model || "kling/ai-avatar-pro";
            const useModel = AVATAR_MODELS.includes(stuckModel) ? FALLBACK_MODEL : undefined;
            await fireVideoTask(gen, gen.cleaned_audio_url || gen.input_audio_url!, useModel);
          }
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
    await query(
      `INSERT INTO winner_generation_events (generation_id, stage, event_type, payload)
       VALUES ($1, $2, 'task_polled', $3)`,
      [gen.id, gen.stage, JSON.stringify({ taskId, minutes_stuck: gen.minutes_stuck })]
    );
  }

  return { checked: stuckRows.length, recovered, stillStuck, failed };
}
