import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await verifySession();

  if (!session.isValid || !session.clientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [services, usageLogs] = await Promise.all([
    prisma.serviceInstance.findMany({
      where: { clientId: session.clientId },
    }),
    prisma.usageLog.findMany({
      where: { clientId: session.clientId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    }),
  ]);

  return NextResponse.json({ services, usageLogs });
}
