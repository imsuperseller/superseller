import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get('apiKey') || '';
  const siteId = searchParams.get('siteId') || '';
  if (!apiKey || !siteId) {
    return NextResponse.json({ error: 'Missing apiKey or siteId' }, { status: 400 });
  }
  try {
    const res = await fetch(`https://api.webflow.com/v2/sites/${siteId}/domains`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: res.ok, status: res.status, data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to get v2 domains', detail: err?.message }, { status: 500 });
  }
}


