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
    const envRes = await fetch(`https://api.webflow.com/v2/sites/${siteId}/environments`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const envJson = await envRes.json().catch(() => ({}));
    if (!envRes.ok) {
      return NextResponse.json({ ok: false, step: 'environments', status: envRes.status, data: envJson });
    }
    const envIds: string[] = (envJson?.environments || []).map((e: any) => e.id).filter(Boolean);

    const publishRes = await fetch(`https://api.webflow.com/v2/sites/${siteId}/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ environments: envIds })
    });
    const publishJson = await publishRes.json().catch(() => ({}));
    return NextResponse.json({ ok: publishRes.ok, status: publishRes.status, data: publishJson });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to publish site', detail: err?.message }, { status: 500 });
  }
}


