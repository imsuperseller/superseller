// GET /api/admin/notifications — List notifications with filters
// PATCH /api/admin/notifications — Mark notification(s) as handled

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.isValid || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const since = searchParams.get('since');
    const until = searchParams.get('until');
    const correlationId = searchParams.get('correlation_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (source) {
      conditions.push(`source = $${paramIdx++}`);
      params.push(source);
    }
    if (type) {
      conditions.push(`type = $${paramIdx++}`);
      params.push(type);
    }
    if (status) {
      conditions.push(`status = $${paramIdx++}`);
      params.push(status);
    }
    if (since) {
      conditions.push(`created_at >= $${paramIdx++}`);
      params.push(since);
    }
    if (until) {
      conditions.push(`created_at <= $${paramIdx++}`);
      params.push(until);
    }
    if (correlationId) {
      conditions.push(`correlation_id = $${paramIdx++}`);
      params.push(correlationId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [notifications, countResult] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM notification_log ${where}
         ORDER BY created_at DESC
         LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        ...params, limit, offset
      ),
      prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT COUNT(*) as count FROM notification_log ${where}`,
        ...params
      ),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      notifications,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.isValid || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'mark_handled') {
      const { id, ids, handled_by } = body;
      const handledBy = handled_by || 'user';

      if (ids && Array.isArray(ids) && ids.length > 0) {
        const rows = await prisma.$queryRawUnsafe<any[]>(
          `UPDATE notification_log
           SET status = 'handled', handled_at = NOW(), handled_by = $1
           WHERE id = ANY($2::int[])
           RETURNING id`,
          handledBy, ids
        );
        return NextResponse.json({ success: true, updated: rows.length });
      }

      if (id) {
        const rows = await prisma.$queryRawUnsafe<any[]>(
          `UPDATE notification_log
           SET status = 'handled', handled_at = NOW(), handled_by = $1
           WHERE id = $2
           RETURNING id`,
          handledBy, id
        );
        if (rows.length === 0) {
          return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Provide id or ids' }, { status: 400 });
    }

    if (action === 'update_status') {
      const { id, status } = body;
      const validStatuses = ['sent', 'delivered', 'read', 'handled', 'failed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      const rows = await prisma.$queryRawUnsafe<any[]>(
        `UPDATE notification_log SET status = $1 WHERE id = $2 RETURNING id`,
        status, id
      );
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
