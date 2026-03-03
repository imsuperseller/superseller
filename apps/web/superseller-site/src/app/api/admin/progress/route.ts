// GET /api/admin/progress — Aggregated progress data for ProgressHub dashboard

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getDailyExpenses, getTotalExpenses, getExpenseTrend, detectAnomalies } from '@/lib/monitoring/expense-tracker';
import { getLatestHealthStatus } from '@/lib/monitoring/health-checker';
import { getActiveAlerts } from '@/lib/monitoring/alert-engine';
import { SERVICE_REGISTRY } from '@/lib/monitoring/service-registry';
import { prisma } from '@/lib/prisma';

// Hardcoded product status from PRODUCT_STATUS.md
const PRODUCTS = [
  { id: 'tourreel', name: 'TourReel', status: 'live' as const, statusLabel: 'Live — 25+ videos', description: 'AI real estate video pipeline (Kling + Remotion)', customers: ['UAD', 'MissParty'], completionPct: 90 },
  { id: 'fb-bot', name: 'FB Marketplace Bot', status: 'live' as const, statusLabel: 'Live — posting daily', description: 'Automated FB Marketplace listing & reposting', customers: ['UAD', 'MissParty'], completionPct: 85 },
  { id: 'socialhub', name: 'SocialHub / Buzz', status: 'live' as const, statusLabel: 'Live — Phase 1', description: 'AI content → WhatsApp approval → FB publish', customers: [], completionPct: 60 },
  { id: 'winner-studio', name: 'Winner Studio', status: 'built' as const, statusLabel: 'Built, not active', description: 'AI avatar video pipeline for Mivnim/Yossi', customers: ['Yossi'], completionPct: 75 },
  { id: 'lead-pages', name: 'Lead Landing Pages', status: 'partial' as const, statusLabel: 'Infrastructure only', description: '/lp/[slug] dynamic pages with per-customer branding', customers: [], completionPct: 40 },
  { id: 'frontdesk', name: 'FrontDesk Voice AI', status: 'partial' as const, statusLabel: 'Partial', description: 'Telnyx AI voice assistant for business calls', customers: [], completionPct: 35 },
  { id: 'claudeclaw', name: 'ClaudeClaw', status: 'built' as const, statusLabel: 'Built, disabled', description: 'WhatsApp → Claude Code remote control bridge', customers: [], completionPct: 50 },
  { id: 'rag', name: 'RAG / pgvector', status: 'partial' as const, statusLabel: 'Infrastructure only', description: 'Ollama + pgvector + API endpoints for vector search', customers: [], completionPct: 30 },
  { id: 'agentforge', name: 'AgentForge', status: 'spec' as const, statusLabel: 'Spec only', description: 'Internal multi-stage AI research tool', customers: [], completionPct: 5 },
];

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.isValid || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run all queries in parallel with fault tolerance
    const [
      dailyExpensesResult,
      weekExpensesResult,
      monthExpensesResult,
      trendResult,
      anomaliesResult,
      healthResult,
      alertsResult,
      leadsTodayResult,
      leads30dResult,
      contentResult,
      activityResult,
      pipelineResult,
    ] = await Promise.allSettled([
      getDailyExpenses(),
      getTotalExpenses(7),
      getTotalExpenses(30),
      getExpenseTrend(14),
      detectAnomalies(),
      getLatestHealthStatus(),
      getActiveAlerts(),
      // Leads today
      prisma.lead.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      // Leads 30d
      prisma.lead.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      // Content post stats
      prisma.contentPost.groupBy({
        by: ['status'],
        _count: true,
      }),
      // Activity feed: recent alerts + expenses
      Promise.all([
        prisma.alertHistory.findMany({
          orderBy: { firedAt: 'desc' },
          take: 8,
        }),
        prisma.apiExpense.findMany({
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: { id: true, service: true, operation: true, estimatedCost: true, createdAt: true },
        }),
      ]),
      // Pipeline: jobs table (Drizzle table, same DB)
      prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
        SELECT status, COUNT(*)::bigint as count FROM jobs GROUP BY status
      `.catch(() => []),
    ]);

    // Extract values with fallbacks
    const dailyExpenses = dailyExpensesResult.status === 'fulfilled' ? dailyExpensesResult.value : {};
    const weekExpenses = weekExpensesResult.status === 'fulfilled' ? weekExpensesResult.value : { total: 0, byService: {} };
    const monthExpenses = monthExpensesResult.status === 'fulfilled' ? monthExpensesResult.value : { total: 0, byService: {} };
    const trend = trendResult.status === 'fulfilled' ? trendResult.value : [];
    const anomalies = anomaliesResult.status === 'fulfilled' ? anomaliesResult.value : [];
    const healthStatus = healthResult.status === 'fulfilled' ? healthResult.value : [];
    const alerts = alertsResult.status === 'fulfilled' ? alertsResult.value : [];
    const leadsToday = leadsTodayResult.status === 'fulfilled' ? leadsTodayResult.value : 0;
    const leads30d = leads30dResult.status === 'fulfilled' ? leads30dResult.value : 0;
    const contentGroups = contentResult.status === 'fulfilled' ? contentResult.value : [];
    const [recentAlerts, recentExpenses] = activityResult.status === 'fulfilled' ? activityResult.value : [[], []];
    const pipelineStats = pipelineResult.status === 'fulfilled' ? pipelineResult.value : [];

    // Compute cost today
    const costToday = Object.values(dailyExpenses).reduce((s, v) => s + v, 0);

    // Health summary
    const servicesHealthy = healthStatus.filter((s: any) => s.status === 'healthy').length;

    // Content post counts
    const contentTotal = contentGroups.reduce((s: number, g: any) => s + g._count, 0);
    const contentPublished = contentGroups.find((g: any) => g.status === 'published')?._count || 0;
    const contentDraft = contentGroups.find((g: any) => g.status === 'draft')?._count || 0;

    // Pipeline job counts
    const jobCounts: Record<string, number> = {};
    for (const row of pipelineStats) {
      jobCounts[row.status] = Number(row.count);
    }
    const activeJobs = (jobCounts['queued'] || 0) + (jobCounts['processing'] || 0) + (jobCounts['generating'] || 0);
    const completedJobs = jobCounts['done'] || 0;
    const failedJobs = jobCounts['failed'] || 0;

    // Recent jobs for pipeline view
    let recentJobs: any[] = [];
    try {
      recentJobs = await prisma.$queryRaw<any[]>`
        SELECT id, status, progress, current_step, created_at
        FROM jobs ORDER BY created_at DESC LIMIT 10
      `;
    } catch { /* table may not exist in web prisma */ }

    // Build activity feed
    const activity = [
      ...recentAlerts.map((a: any) => ({
        id: a.id,
        type: 'alert' as const,
        title: a.message,
        detail: `${a.severity} — ${a.serviceId}`,
        timestamp: a.firedAt.toISOString(),
        severity: a.severity === 'critical' ? 'critical' as const : a.severity === 'warning' ? 'warning' as const : 'info' as const,
      })),
      ...recentExpenses.map((e: any) => ({
        id: e.id,
        type: 'expense' as const,
        title: `${e.service} / ${e.operation}`,
        detail: `$${e.estimatedCost.toFixed(4)}`,
        timestamp: e.createdAt.toISOString(),
        severity: 'info' as const,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);

    return NextResponse.json({
      success: true,
      pulse: {
        costToday: Math.round(costToday * 100) / 100,
        costWeek: weekExpenses.total,
        cost30d: monthExpenses.total,
        servicesTotal: SERVICE_REGISTRY.length,
        servicesHealthy: servicesHealthy,
        activeAlerts: alerts.length,
        leadsToday,
        leads30d,
      },
      activity,
      costs: {
        today: dailyExpenses,
        trend,
        total30d: monthExpenses,
        anomalies,
      },
      pipeline: {
        videoJobs: {
          active: activeJobs,
          completed: completedJobs,
          failed: failedJobs,
          recent: recentJobs.map((j: any) => ({
            id: j.id,
            status: j.status,
            progress: j.progress || 0,
            currentStep: j.current_step || 'Unknown',
            createdAt: j.created_at?.toISOString?.() || new Date().toISOString(),
          })),
        },
        contentPosts: { total: contentTotal, published: contentPublished, draft: contentDraft },
      },
      products: PRODUCTS,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('[PROGRESS] GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
