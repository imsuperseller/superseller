import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { getSessionFromCookies } from "@/lib/auth";
import { query, queryRow } from "@/lib/db";
import * as redis from "@/lib/redis";
import { checkCredits, consumeCredit, InsufficientCreditsError } from "@/lib/credits";
import {
  transitionStage,
} from "@/lib/pipeline";
import { getEnv } from "@/lib/env";

export const maxDuration = 60;

/**
 * POST /api/generate
 *
 * Returns 201 immediately after validation + credit charge + SCRIPT_PROCESSING transition.
 * Heavy processing (Gemini brain, kie.ai task) runs in a separate serverless function
 * via fire-and-forget fetch to /api/generate/process.
 */
export async function POST(req: Request) {
  const env = getEnv();

  try {
    // ── Auth ──
    const user = await getSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ── Parse body ──
    const body = await req.json();
    const {
      raw_script,
      audio_url,
      reference_image_url,
      character,
      vibe,
      language,
      content_type_hint,
      audio_duration_seconds,
    } = body as {
      raw_script?: string;
      audio_url?: string;
      reference_image_url?: string;
      character: string;
      vibe: string;
      language: string;
      content_type_hint?: string;
      audio_duration_seconds?: number;
    };

    if (!character || !vibe || !language) {
      return NextResponse.json(
        { error: "character, vibe, and language are required" },
        { status: 400 }
      );
    }

    if (!raw_script && !audio_url) {
      return NextResponse.json(
        { error: "Provide a script or audio" },
        { status: 400 }
      );
    }

    // Avatar/lip-sync models require a reference image
    if (!reference_image_url && audio_url) {
      return NextResponse.json(
        { error: "Reference image required when using audio (for avatar/lip-sync)" },
        { status: 400 }
      );
    }

    // ── Rate limit (max 2 concurrent) ──
    const concurrent = await redis.incr(
      `winner:rate:concurrent:${user.id}`,
      600
    );
    if (concurrent > 2) {
      await redis.decr(`winner:rate:concurrent:${user.id}`);
      return NextResponse.json(
        { error: "Max 2 concurrent generations. Wait for current ones to finish." },
        { status: 429 }
      );
    }

    // ── Credit check ──
    const credits = await checkCredits(user.id);
    if (credits.available <= 0 || credits.monthlyRemaining <= 0) {
      await redis.decr(`winner:rate:concurrent:${user.id}`);
      return NextResponse.json(
        { error: "No credits remaining" },
        { status: 402 }
      );
    }

    // ── Create generation row (PENDING) ──
    const genRow = await queryRow<{ id: string }>(
      `INSERT INTO winner_generations (
        user_id, tenant_id, stage,
        raw_script, input_audio_url, reference_image_url,
        character, vibe, language
      ) VALUES ($1, $2, 'PENDING', $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        user.id,
        user.tenant_id,
        raw_script || null,
        audio_url || null,
        reference_image_url || null,
        character,
        vibe,
        language,
      ]
    );

    if (!genRow) {
      await redis.decr(`winner:rate:concurrent:${user.id}`);
      return NextResponse.json({ error: "Failed to create generation" }, { status: 500 });
    }

    const generationId = genRow.id;

    // ── Consume credit ──
    try {
      await consumeCredit(user.id, generationId);
      await query(
        `UPDATE winner_generations SET credits_charged = 1 WHERE id = $1`,
        [generationId]
      );
    } catch (err) {
      await redis.decr(`winner:rate:concurrent:${user.id}`);
      await query(`DELETE FROM winner_generations WHERE id = $1`, [generationId]);
      if (err instanceof InsufficientCreditsError) {
        return NextResponse.json({ error: "No credits remaining" }, { status: 402 });
      }
      throw err;
    }

    // ── Transition to SCRIPT_PROCESSING ──
    await transitionStage({
      generationId,
      fromStage: "PENDING",
      toStage: "SCRIPT_PROCESSING",
    });

    // ── Fire background processing ──
    // waitUntil keeps the serverless function alive after response is sent.
    // The process endpoint runs in a SEPARATE function invocation with its own 60s timeout.
    const processUrl = `${env.CALLBACK_BASE_URL}/api/generate/process`;
    waitUntil(
      fetch(processUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": env.INTERNAL_SECRET,
        },
        body: JSON.stringify({
          generationId,
          raw_script,
          audio_url,
          reference_image_url,
          character,
          vibe,
          language,
          content_type_hint,
          audio_duration_seconds,
          whatsapp_jid: user.whatsapp_jid,
        }),
      }).catch((err) => {
        console.error("Process call failed:", err);
      })
    );

    // ── Return immediately ──
    return NextResponse.json(
      {
        id: generationId,
        stage: "SCRIPT_PROCESSING",
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("Generate error:", message, stack);
    return NextResponse.json(
      { error: "Internal error", detail: message },
      { status: 500 }
    );
  }
}
