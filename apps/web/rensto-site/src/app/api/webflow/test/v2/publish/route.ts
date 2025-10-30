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
    // get site domain ids
    const d = await fetch(`https://api.webflow.com/v2/sites/${siteId}/domains`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const dj = await d.json();
    if (!d.ok) return NextResponse.json({ ok: false, step: 'domains', status: d.status, data: dj });
    const ids: string[] = (dj?.domains || []).map((x: any) => x.id).filter(Boolean);

    const p = await fetch(`https://api.webflow.com/v2/sites/${siteId}/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publishTo: ids })
    });
    const pj = await p.json().catch(() => ({}));
    return NextResponse.json({ ok: p.ok, status: p.status, data: pj });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to publish v2', detail: err?.message }, { status: 500 });
  }
}


