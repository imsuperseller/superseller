import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { verifySession } from "@/lib/auth";

const CRON_SECRET = process.env.CRON_SECRET;

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) {
    return { session: { isValid: true, role: "admin" } };
  }
  const session = await verifySession();
  if (!session.isValid || session.role !== "admin") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

interface RankingRow {
  prompt_key: string;
  version: string;
  shot_type: string;
  avg_score: number;
  sample_count: bigint;
  avg_cost: number;
}

// GET /api/admin/prompt-effectiveness
// Returns ranked prompt performance data grouped by prompt_key, version, shot_type
// Optional ?shot_type= filter
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const shotType = searchParams.get("shot_type");

    // content_entries is a Drizzle-managed table, not in Prisma schema
    // Must use $queryRaw with Prisma.sql for parameterized queries (prevents SQL injection)
    let rankings: RankingRow[];

    if (shotType) {
      rankings = await prisma.$queryRaw<RankingRow[]>(Prisma.sql`
        SELECT
          generation_meta->>'prompt_key'     AS prompt_key,
          generation_meta->>'prompt_version' AS version,
          generation_meta->>'shot_type'      AS shot_type,
          AVG(performance_score)             AS avg_score,
          COUNT(*)                           AS sample_count,
          AVG((generation_meta->>'generation_cost_usd')::float) AS avg_cost
        FROM content_entries
        WHERE performance_score IS NOT NULL
          AND generation_meta IS NOT NULL
          AND generation_meta->>'shot_type' = ${shotType}
        GROUP BY 1, 2, 3
        ORDER BY avg_score DESC
      `);
    } else {
      rankings = await prisma.$queryRaw<RankingRow[]>(Prisma.sql`
        SELECT
          generation_meta->>'prompt_key'     AS prompt_key,
          generation_meta->>'prompt_version' AS version,
          generation_meta->>'shot_type'      AS shot_type,
          AVG(performance_score)             AS avg_score,
          COUNT(*)                           AS sample_count,
          AVG((generation_meta->>'generation_cost_usd')::float) AS avg_cost
        FROM content_entries
        WHERE performance_score IS NOT NULL
          AND generation_meta IS NOT NULL
        GROUP BY 1, 2, 3
        ORDER BY avg_score DESC
      `);
    }

    // Convert BigInt sample_count to number — JSON.stringify cannot serialize BigInt
    const serialized = rankings.map((r) => ({
      prompt_key: r.prompt_key,
      version: r.version,
      shot_type: r.shot_type,
      avg_score: Number(r.avg_score),
      sample_count: Number(r.sample_count),
      avg_cost: Number(r.avg_cost),
    }));

    return NextResponse.json({ rankings: serialized });
  } catch (err: any) {
    console.error("GET /api/admin/prompt-effectiveness failed:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch prompt effectiveness data" },
      { status: 500 }
    );
  }
}
