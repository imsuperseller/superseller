// GET /api/admin/monitoring — Get latest health status + run checks
// POST /api/admin/monitoring — Trigger immediate health check

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { runHealthChecks, getLatestHealthStatus, getUptimePercentage } from '@/lib/monitoring/health-checker';
import { evaluateAlerts, getActiveAlerts, seedDefaultRules } from '@/lib/monitoring/alert-engine';
import { getTotalExpenses, detectAnomalies } from '@/lib/monitoring/expense-tracker';
import { SERVICE_REGISTRY } from '@/lib/monitoring/service-registry';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.isValid || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get latest cached results
    const healthStatus = await getLatestHealthStatus();

    // Calculate uptimes
    const uptimes: Record<string, { h24: number; h168: number }> = {};
    for (const service of SERVICE_REGISTRY) {
      uptimes[service.id] = {
        h24: await getUptimePercentage(service.id, 24),
        h168: await getUptimePercentage(service.id, 168),
      };
    }

    // Get active alerts
    const activeAlerts = await getActiveAlerts();

    // Get expense summary (30 days)
    const expenses = await getTotalExpenses(30);
    const anomalies = await detectAnomalies();

    return NextResponse.json({
      success: true,
      services: healthStatus,
      uptimes,
      activeAlerts: activeAlerts.length,
      alerts: activeAlerts,
      expenses,
      anomalies,
      lastChecked: healthStatus.length > 0
        ? Math.max(...healthStatus.map(s => s.checkedAt.getTime()))
        : null,
    });
  } catch (error: any) {
    console.error('[MONITORING] GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.isValid || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || 'run_checks';

    if (action === 'seed_rules') {
      const count = await seedDefaultRules();
      return NextResponse.json({ success: true, seeded: count });
    }

    // Run all health checks
    const results = await runHealthChecks(body.serviceIds);

    // Evaluate alert rules
    const firedAlerts = await evaluateAlerts(results);

    return NextResponse.json({
      success: true,
      results,
      alertsFired: firedAlerts.length,
      alerts: firedAlerts,
    });
  } catch (error: any) {
    console.error('[MONITORING] POST error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
