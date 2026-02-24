import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { queryRow, query } from "@/lib/db";
import type { GenerationRow } from "@/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const gen = await queryRow<GenerationRow>(
      `SELECT * FROM winner_generations WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );

    if (!gen) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const events = await query(
      `SELECT id, stage, event_type, payload, created_at
       FROM winner_generation_events
       WHERE generation_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    return NextResponse.json({ generation: gen, events });
  } catch (err) {
    console.error("Generation detail error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
