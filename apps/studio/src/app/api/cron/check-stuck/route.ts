import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { checkStuckGenerations } from "@/lib/pipeline";

export async function GET(req: Request) {
  try {
    // Verify cron secret (Vercel sends this header)
    const env = getEnv();
    if (env.CRON_SECRET) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const result = await checkStuckGenerations();

    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron check-stuck error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
