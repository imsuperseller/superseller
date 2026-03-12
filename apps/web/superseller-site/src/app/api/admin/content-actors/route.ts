import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface ContentActorRow {
  id: string;
  tenant_id: string;
  name: string;
  role: string;
  sora_cameo_url: string | null;
  thumbnail_url: string | null;
  voice_id: string | null;
  appearance_notes: string | null;
  available_for: unknown;
  usage_count: number;
  avg_engagement: number | null;
  meta: unknown;
  created_at: string | null;
  updated_at: string | null;
}

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    let rows: ContentActorRow[];
    if (tenantId) {
      rows = await prisma.$queryRawUnsafe<ContentActorRow[]>(
        `SELECT * FROM content_actors WHERE tenant_id = $1 ORDER BY usage_count DESC, name ASC`,
        tenantId
      );
    } else {
      rows = await prisma.$queryRawUnsafe<ContentActorRow[]>(
        `SELECT * FROM content_actors ORDER BY tenant_id, usage_count DESC, name ASC`
      );
    }

    const actors = rows.map(r => ({
      id: r.id,
      tenantId: r.tenant_id,
      name: r.name,
      role: r.role,
      soraCameoUrl: r.sora_cameo_url,
      thumbnailUrl: r.thumbnail_url,
      voiceId: r.voice_id,
      appearanceNotes: r.appearance_notes,
      availableFor: r.available_for,
      usageCount: r.usage_count,
      avgEngagement: r.avg_engagement,
      meta: r.meta,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    const total = actors.length;
    const withVoice = actors.filter(a => a.voiceId).length;
    const withCameo = actors.filter(a => a.soraCameoUrl).length;
    const tenants = [...new Set(actors.map(a => a.tenantId))];

    return NextResponse.json({
      actors,
      summary: { total, withVoice, withCameo, tenantCount: tenants.length, tenants },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[admin/content-actors] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch content actors', detail: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tenantId, name, role, soraCameoUrl, voiceId, appearanceNotes, availableFor } = body;

    if (!tenantId || !name || !role) {
      return NextResponse.json({ error: 'tenantId, name, and role are required' }, { status: 400 });
    }

    const result = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `INSERT INTO content_actors (tenant_id, name, role, sora_cameo_url, voice_id, appearance_notes, available_for)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING id`,
      tenantId,
      name,
      role,
      soraCameoUrl || null,
      voiceId || null,
      appearanceNotes || null,
      JSON.stringify(availableFor || ['reel', 'story', 'carousel'])
    );

    return NextResponse.json({ success: true, id: result[0]?.id });
  } catch (error: any) {
    console.error('[admin/content-actors] POST Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to create actor', detail: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, role, soraCameoUrl, voiceId, appearanceNotes, availableFor } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing actor id' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(
      `UPDATE content_actors SET
        name = COALESCE($1, name),
        role = COALESCE($2, role),
        sora_cameo_url = COALESCE($3, sora_cameo_url),
        voice_id = COALESCE($4, voice_id),
        appearance_notes = COALESCE($5, appearance_notes),
        available_for = COALESCE($6::jsonb, available_for),
        updated_at = NOW()
       WHERE id = $7`,
      name || null,
      role || null,
      soraCameoUrl || null,
      voiceId || null,
      appearanceNotes || null,
      availableFor ? JSON.stringify(availableFor) : null,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[admin/content-actors] PATCH Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to update actor', detail: error.message },
      { status: 500 }
    );
  }
}
