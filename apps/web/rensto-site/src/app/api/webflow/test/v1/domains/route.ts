import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken') || '';
  const siteId = searchParams.get('siteId') || '';
  if (!accessToken || !siteId) {
    return NextResponse.json({ error: 'Missing accessToken or siteId' }, { status: 400 });
  }
  try {
    const res = await fetch(`https://api.webflow.com/sites/${siteId}/domains`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'accept-version': '1.0.0'
      }
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: res.ok, status: res.status, data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to get v1 domains', detail: err?.message }, { status: 500 });
  }
}


