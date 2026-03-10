import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const WORKER_URL = `http://172.245.56.50:3002`;

async function fetchWorker(path: string, timeoutMs = 8000): Promise<any | null> {
  try {
    const res = await fetch(`${WORKER_URL}/api${path}`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const start = Date.now();

  const [opsData, healthData, dbStats] = await Promise.all([
    fetchWorker('/ops'),
    fetchWorker('/health'),
    fetchDbStats(),
  ]);

  const workerOnline = !!healthData;
  const redisOk = healthData?.checks?.redis === 'ok';
  const postgresOk = healthData?.checks?.postgres === 'ok';

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - start,
    infrastructure: {
      worker: { online: workerOnline, latencyMs: workerOnline ? Date.now() - start : null },
      redis: redisOk,
      postgres: postgresOk,
    },
    queues: opsData?.queues || [],
    schedulerJobs: opsData?.schedulerJobs || [],
    recentVideoJobs: opsData?.recentVideoJobs || [],
    recentExpenses: opsData?.recentExpenses || [],
    dbStats,
  });
}

async function fetchDbStats() {
  try {
    const [userCount, jobCount, leadCount, expenseSum] = await Promise.all([
      prisma.user.count(),
      prisma.$queryRawUnsafe<{ count: bigint }[]>('SELECT count(*) as count FROM video_jobs').then(r => Number(r[0]?.count || 0)).catch(() => 0),
      prisma.lead.count().catch(() => 0),
      prisma.$queryRawUnsafe<{ sum: number }[]>(
        "SELECT COALESCE(SUM(estimated_cost), 0) as sum FROM api_expenses WHERE created_at > NOW() - INTERVAL '24 hours'"
      ).then(r => Number(r[0]?.sum || 0)).catch(() => 0),
    ]);

    return { users: userCount, videoJobs: jobCount, leads: leadCount, todaySpend: expenseSum };
  } catch {
    return { users: 0, videoJobs: 0, leads: 0, todaySpend: 0 };
  }
}
