import { NextResponse } from "next/server";
import { healthCheck as dbHealth } from "@/lib/db";
import { healthCheck as redisHealth } from "@/lib/redis";
import { isSessionAlive as wahaHealth } from "@/lib/waha";

export async function GET() {
  const [db, redis, waha] = await Promise.all([
    dbHealth(),
    redisHealth(),
    wahaHealth(),
  ]);

  const status = db && redis ? "ok" : "degraded";

  return NextResponse.json({
    status,
    services: { db, redis, waha, r2: true },
    timestamp: new Date().toISOString(),
  });
}
