// GET /api/admin/alerts — Get alert history
// POST /api/admin/alerts — Manage alert rules

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getAlertHistory, getActiveAlerts } from '@/lib/monitoring/alert-engine';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.isValid || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'active'; // active, history, rules

    if (view === 'active') {
      const alerts = await getActiveAlerts();
      return NextResponse.json({ success: true, alerts });
    }

    if (view === 'history') {
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const alerts = await getAlertHistory(limit);
      return NextResponse.json({ success: true, alerts });
    }

    if (view === 'rules') {
      const rules = await prisma.alertRule.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, rules });
    }

    return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.isValid || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'resolve') {
      await prisma.alertHistory.update({
        where: { id: body.alertId },
        data: { resolved: true, resolvedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_rule') {
      const rule = await prisma.alertRule.findUnique({ where: { id: body.ruleId } });
      if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
      await prisma.alertRule.update({
        where: { id: body.ruleId },
        data: { enabled: !rule.enabled },
      });
      return NextResponse.json({ success: true, enabled: !rule.enabled });
    }

    if (action === 'create_rule') {
      const rule = await prisma.alertRule.create({
        data: {
          serviceId: body.serviceId,
          condition: body.condition,
          threshold: body.threshold,
          cooldownMinutes: body.cooldownMinutes || 30,
          channels: body.channels || ['audit_log'],
        },
      });
      return NextResponse.json({ success: true, rule });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
