import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'fail'> = {};

  // Postgres
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = 'ok';
  } catch {
    checks.postgres = 'fail';
  }

  const allOk = Object.values(checks).every(v => v === 'ok');

  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks },
    { status: allOk ? 200 : 503 },
  );
}
