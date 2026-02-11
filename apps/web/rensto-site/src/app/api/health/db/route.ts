import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    const [userCount, templateCount, paymentCount] = await Promise.all([
      prisma.user.count(),
      prisma.template.count(),
      prisma.payment.count(),
    ]);
    const latency = Date.now() - start;
    return NextResponse.json({
      status: 'connected',
      latencyMs: latency,
      counts: { users: userCount, templates: templateCount, payments: paymentCount },
      databaseUrl: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'set'}` : 'NOT SET',
    });
  } catch (error: any) {
    const latency = Date.now() - start;
    return NextResponse.json({
      status: 'error',
      latencyMs: latency,
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'set'}` : 'NOT SET',
    }, { status: 500 });
  }
}
