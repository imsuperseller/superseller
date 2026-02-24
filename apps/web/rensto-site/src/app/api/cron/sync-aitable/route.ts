import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AITableService, AITABLE_DATASHEETS } from '@/lib/services/AITableService';

/**
 * Sync Watchdog — Cron-triggered Aitable sync.
 *
 * Pushes unsynced leads and recent clients from Postgres to Aitable dashboards.
 * Designed to be called by Vercel Cron or external scheduler every 15 minutes.
 *
 * GET /api/cron/sync-aitable?key=CRON_SECRET
 */

const BATCH_SIZE = 50;

export async function GET(request: Request) {
  // Verify cron secret (Vercel Cron sends this, or pass manually)
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && key !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, { synced: number; errors: string[] }> = {};

  // 1. Sync unsynced leads
  try {
    const unsyncedLeads = await prisma.lead.findMany({
      where: { syncedToAITable: false },
      take: BATCH_SIZE,
      orderBy: { createdAt: 'asc' },
    });

    if (unsyncedLeads.length > 0) {
      const records = unsyncedLeads.map((lead) => ({
        fields: {
          '标题': lead.name || lead.email || 'Unknown',
          Email: lead.email || '',
          Phone: lead.phone || '',
          Source: lead.source || 'Website',
          Status: lead.status || 'new',
          'Postgres ID': lead.id,
          'Created At': lead.createdAt.toISOString(),
        },
      }));

      await AITableService.addRecords(AITABLE_DATASHEETS.LEADS, records);

      await prisma.lead.updateMany({
        where: { id: { in: unsyncedLeads.map((l) => l.id) } },
        data: { syncedToAITable: true },
      });

      results.leads = { synced: unsyncedLeads.length, errors: [] };
    } else {
      results.leads = { synced: 0, errors: [] };
    }
  } catch (err: any) {
    results.leads = { synced: 0, errors: [err.message] };
  }

  // 2. Check total unsynced count for alerting
  const totalUnsynced = await prisma.lead.count({ where: { syncedToAITable: false } });

  // 3. Log audit trail
  await prisma.audit.create({
    data: {
      service: 'aitable-sync',
      action: 'cron_sync',
      status: results.leads.errors.length > 0 ? 'error' : 'success',
      details: { ...results, remainingUnsynced: totalUnsynced },
      errorMessage: results.leads.errors.length > 0 ? results.leads.errors.join('; ') : undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    results,
    remainingUnsynced: totalUnsynced,
    timestamp: new Date().toISOString(),
  });
}
