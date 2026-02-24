import { NextResponse } from "next/server";
import { queryRow } from "@/lib/db";
import * as redis from "@/lib/redis";
import {
  processCallbackSuccess,
  processCallbackFailure,
  type KieCallbackData,
} from "@/lib/pipeline";
import type { GenerationRow } from "@/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Callback received:", JSON.stringify(body).slice(0, 500));

    // kie.ai callback shape: { code, msg, data: { taskId, state, resultJson, ... } }
    const data = body.data || body;
    const taskId = data.taskId;

    if (!taskId) {
      console.warn("Callback received without taskId:", JSON.stringify(body).slice(0, 200));
      return NextResponse.json({ ok: true, note: "no taskId" });
    }

    // Look up task tracking in Redis
    const tracker = await redis.getJson<{
      generationId: string;
      stage: string;
      model: string;
      attempt: number;
    }>(`winner:task:${taskId}`);

    if (!tracker) {
      console.warn(`Callback for unknown task ${taskId} — possibly already processed`);
      return NextResponse.json({ ok: true, note: "no tracker" });
    }

    console.log(`Tracker found: gen=${tracker.generationId} stage=${tracker.stage}`);

    // Load generation from DB
    const gen = await queryRow<GenerationRow>(
      `SELECT * FROM winner_generations WHERE id = $1`,
      [tracker.generationId]
    );

    if (!gen) {
      console.warn(`Generation ${tracker.generationId} not found for task ${taskId}`);
      return NextResponse.json({ ok: true, note: "gen not found" });
    }

    // Verify stage matches (duplicate callback protection)
    if (gen.stage !== tracker.stage) {
      console.warn(
        `Duplicate callback: task=${taskId} expected stage=${tracker.stage}, gen is at ${gen.stage}`
      );
      return NextResponse.json({ ok: true, note: "stage mismatch" });
    }

    // Build callback data
    const callbackData: KieCallbackData = {
      taskId,
      model: data.model || tracker.model,
      state: data.state,
      resultJson: typeof data.resultJson === "string" ? data.resultJson : JSON.stringify(data.resultJson || {}),
      failCode: data.failCode || null,
      failMsg: data.failMsg || null,
      costTime: data.costTime || null,
    };

    // Process based on state
    if (callbackData.state === "success") {
      console.log(`Processing success for gen=${gen.id} stage=${gen.stage}`);
      await processCallbackSuccess(gen, callbackData);
      console.log(`Success processing complete for gen=${gen.id}`);
    } else if (callbackData.state === "fail") {
      await processCallbackFailure(gen, callbackData);
    } else {
      console.log(`Task ${taskId} still waiting`);
    }

    return NextResponse.json({ ok: true, processed: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("Callback processing error:", msg, stack);
    // Return error details for debugging (kie.ai won't retry on 200)
    return NextResponse.json({ ok: false, error: msg });
  }
}
