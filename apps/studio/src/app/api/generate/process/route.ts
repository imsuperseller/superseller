import { NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { callGeminiBrain } from "@/lib/gemini";
import { KieApiError } from "@/lib/kie";
import {
  transitionStage,
  fireIsolationTask,
  fireVideoTask,
  failGeneration,
} from "@/lib/pipeline";
import { sendText } from "@/lib/waha";
import { getEnv } from "@/lib/env";
import { ensurePublicUrl } from "@/lib/r2";
import type { GenerationRow } from "@/types";

export const maxDuration = 60;

/**
 * POST /api/generate/process
 *
 * Internal endpoint called fire-and-forget by /api/generate.
 * Runs the heavy Gemini brain + kie.ai task creation.
 * Protected by a shared secret so only our own generate route can call it.
 */
export async function POST(req: Request) {
  const env = getEnv();

  // Verify internal secret
  const authHeader = req.headers.get("x-internal-secret");
  if (authHeader !== env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    generationId,
    raw_script,
    audio_url,
    reference_image_url,
    character,
    vibe,
    language,
    content_type_hint,
    audio_duration_seconds,
    whatsapp_jid,
  } = body as {
    generationId: string;
    raw_script?: string;
    audio_url?: string;
    reference_image_url?: string;
    character: string;
    vibe: string;
    language: string;
    content_type_hint?: string;
    audio_duration_seconds?: number;
    whatsapp_jid?: string;
  };

  try {
    // Convert R2 URLs to presigned URLs for external APIs
    const publicAudioUrl = audio_url ? ensurePublicUrl(audio_url) : undefined;
    const publicImageUrl = reference_image_url ? ensurePublicUrl(reference_image_url) : undefined;

    // Call Gemini Brain
    let geminiResult;
    try {
      geminiResult = await callGeminiBrain({
        rawScript: raw_script,
        audioUrl: publicAudioUrl,
        imageUrl: publicImageUrl,
        character,
        vibe,
        language,
        contentTypeHint: content_type_hint,
        audioDurationSeconds: audio_duration_seconds,
      });
    } catch (err) {
      if (err instanceof KieApiError && err.isInsufficientBalance) {
        await failGeneration(generationId, "SCRIPT_PROCESSING", "Gemini API balance depleted");
        return NextResponse.json({ error: "Gemini balance depleted" }, { status: 503 });
      }
      await failGeneration(
        generationId,
        "SCRIPT_PROCESSING",
        err instanceof Error ? err.message : "Gemini brain call failed"
      );
      return NextResponse.json({ error: "Gemini failed" }, { status: 502 });
    }

    // Store Gemini results
    await query(
      `UPDATE winner_generations SET
        processed_script = $2,
        video_prompt = $3,
        recommended_model = $4,
        model_params = $5,
        routing_reasoning = $6,
        voice_clarity_score = $7,
        needs_isolation = $8,
        content_tags = $9,
        music_prompt = $10,
        subtitle_text = $11
      WHERE id = $1`,
      [
        generationId,
        geminiResult.processed_script,
        geminiResult.video_prompt,
        geminiResult.recommended_model,
        JSON.stringify(geminiResult.model_params),
        geminiResult.routing_reasoning,
        geminiResult.voice_clarity_score,
        geminiResult.needs_isolation,
        geminiResult.content_tags,
        JSON.stringify(geminiResult.music_prompt),
        geminiResult.subtitle_text,
      ]
    );

    // Load full gen row for pipeline
    const gen = await queryRow<GenerationRow>(
      `SELECT * FROM winner_generations WHERE id = $1`,
      [generationId]
    );

    if (!gen) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    // Fire next stage
    try {
      if (geminiResult.needs_isolation && audio_url) {
        await transitionStage({
          generationId,
          fromStage: "SCRIPT_PROCESSING",
          toStage: "AUDIO_ISOLATING",
          eventPayload: { voice_clarity_score: geminiResult.voice_clarity_score },
        });
        await fireIsolationTask(gen);
      } else {
        await transitionStage({
          generationId,
          fromStage: "SCRIPT_PROCESSING",
          toStage: "VIDEO_GENERATING",
          eventPayload: { skipped_isolation: true },
        });
        await fireVideoTask(gen, publicAudioUrl || "");
      }
    } catch (taskErr) {
      console.error("Task creation failed:", taskErr);
      await failGeneration(
        generationId,
        "SCRIPT_PROCESSING",
        taskErr instanceof Error ? taskErr.message : "Failed to create task"
      );
      return NextResponse.json({ error: "Task creation failed" }, { status: 502 });
    }

    // WhatsApp "cooking" notification
    if (whatsapp_jid) {
      sendText(
        whatsapp_jid,
        `🎬 מכין את הסרטון שלך...\n\nזמן משוער: כ-5 דקות`
      ).catch(() => {});
    }

    return NextResponse.json({ ok: true, stage: gen.stage });
  } catch (err) {
    console.error("Process pipeline error:", err);
    await failGeneration(
      generationId,
      "SCRIPT_PROCESSING",
      err instanceof Error ? err.message : "Pipeline processing failed"
    ).catch((e) => console.error("failGeneration failed:", e));
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
