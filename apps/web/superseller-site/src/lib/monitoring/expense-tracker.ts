// Expense Tracker — Track estimated API costs per external call
// Costs are estimates based on known pricing (Feb 2026)

import { prisma } from '@/lib/prisma';

// Known cost rates (USD)
const COST_RATES: Record<string, Record<string, number>> = {
  kie: {
    kling_clip_pro: 0.10,
    kling_clip_std: 0.03,
    suno_music: 0.06,   // Corrected: actual Kie.ai rate (was 0.02)
    nano_banana: 0.02,  // 4 credits × $0.005 = $0.02 per image
    flux_image: 0.025,  // Flux 2 Pro text-to-image
  },
  gemini: {
    flash_prompt: 0.001,
    flash_vision: 0.002,
  },
  resend: {
    send_email: 0.001,
  },
  r2_storage: {
    storage_gb_month: 0.015,
    upload: 0.0001,
  },
  paypal_fees: {
    transaction_percentage: 0.0349, // PayPal standard rate 3.49% + $0.49
    transaction_fixed: 0.49,
  },
  ollama: {
    embedding: 0.0, // Self-hosted, no per-call cost
  },
};

interface TrackExpenseParams {
  service: string;
  operation: string;
  estimatedCost?: number;
  jobId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Track an API expense. Auto-calculates cost if not provided.
 */
export async function trackExpense(params: TrackExpenseParams): Promise<void> {
  const cost = params.estimatedCost ??
    COST_RATES[params.service]?.[params.operation] ?? 0;

  try {
    await prisma.apiExpense.create({
      data: {
        service: params.service,
        operation: params.operation,
        estimatedCost: cost,
        jobId: params.jobId,
        userId: params.userId,
        metadata: params.metadata ? (params.metadata as any) : undefined,
      },
    });
  } catch (err: any) {
    console.error(`[EXPENSE] Failed to track ${params.service}/${params.operation}:`, err.message);
  }
}

/**
 * Get daily expense summary by service.
 */
export async function getDailyExpenses(date?: Date): Promise<Record<string, number>> {
  const targetDate = date || new Date();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const expenses = await prisma.apiExpense.groupBy({
    by: ['service'],
    where: { createdAt: { gte: dayStart, lte: dayEnd } },
    _sum: { estimatedCost: true },
  });

  const result: Record<string, number> = {};
  for (const e of expenses) {
    result[e.service] = Math.round((e._sum.estimatedCost || 0) * 10000) / 10000;
  }
  return result;
}

/**
 * Get expense trend over N days.
 */
export async function getExpenseTrend(days: number = 30): Promise<Array<{ date: string; total: number; byService: Record<string, number> }>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const expenses = await prisma.apiExpense.findMany({
    where: { createdAt: { gte: since } },
    select: { service: true, estimatedCost: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by day
  const byDay: Record<string, { total: number; byService: Record<string, number> }> = {};

  for (const e of expenses) {
    const day = e.createdAt.toISOString().split('T')[0];
    if (!byDay[day]) byDay[day] = { total: 0, byService: {} };
    byDay[day].total += e.estimatedCost;
    byDay[day].byService[e.service] = (byDay[day].byService[e.service] || 0) + e.estimatedCost;
  }

  return Object.entries(byDay).map(([date, data]) => ({
    date,
    total: Math.round(data.total * 10000) / 10000,
    byService: data.byService,
  }));
}

/**
 * Get per-customer cost attribution.
 */
export async function getCustomerCosts(days: number = 30): Promise<Array<{ userId: string; total: number; byService: Record<string, number> }>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const expenses = await prisma.apiExpense.groupBy({
    by: ['userId', 'service'],
    where: { createdAt: { gte: since }, userId: { not: null } },
    _sum: { estimatedCost: true },
  });

  const byUser: Record<string, { total: number; byService: Record<string, number> }> = {};

  for (const e of expenses) {
    const uid = e.userId || 'unknown';
    if (!byUser[uid]) byUser[uid] = { total: 0, byService: {} };
    const cost = e._sum.estimatedCost || 0;
    byUser[uid].total += cost;
    byUser[uid].byService[e.service] = cost;
  }

  return Object.entries(byUser)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Check for spending anomalies (daily spend > 2x rolling 7-day average).
 */
export async function detectAnomalies(): Promise<Array<{ date: string; dailySpend: number; average: number; ratio: number }>> {
  const trend = await getExpenseTrend(14);
  const anomalies: Array<{ date: string; dailySpend: number; average: number; ratio: number }> = [];

  for (let i = 7; i < trend.length; i++) {
    const window = trend.slice(i - 7, i);
    const avg = window.reduce((sum, d) => sum + d.total, 0) / 7;
    if (avg > 0 && trend[i].total > avg * 2) {
      anomalies.push({
        date: trend[i].date,
        dailySpend: trend[i].total,
        average: Math.round(avg * 100) / 100,
        ratio: Math.round((trend[i].total / avg) * 100) / 100,
      });
    }
  }

  return anomalies;
}

/**
 * Get total expenses for a period.
 */
export async function getTotalExpenses(days: number = 30): Promise<{ total: number; byService: Record<string, number> }> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const expenses = await prisma.apiExpense.groupBy({
    by: ['service'],
    where: { createdAt: { gte: since } },
    _sum: { estimatedCost: true },
  });

  let total = 0;
  const byService: Record<string, number> = {};

  for (const e of expenses) {
    const cost = e._sum.estimatedCost || 0;
    total += cost;
    byService[e.service] = Math.round(cost * 100) / 100;
  }

  return { total: Math.round(total * 100) / 100, byService };
}
