import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const user = await getSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const rows = await query(
      `SELECT id, stage, character, vibe, language, recommended_model,
              processed_script, video_prompt, final_video_url, raw_video_r2_url,
              whatsapp_delivered, credits_charged, credit_refunded,
              error_message, failed_at_stage, created_at, updated_at
       FROM winner_generations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [user.id]
    );

    return NextResponse.json({ generations: rows });
  } catch (err) {
    console.error("List generations error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
