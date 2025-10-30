import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken') || '';
  const siteId = searchParams.get('siteId') || '';
  const domainsParam = searchParams.get('domains') || '';
  if (!accessToken || !siteId) {
    return NextResponse.json({ error: 'Missing accessToken or siteId' }, { status: 400 });
  }
  const domains = domainsParam
    ? domainsParam.split(',').map((s) => s.trim()).filter(Boolean)
    : ['rensto.com', 'www.rensto.com'];
  try {
    const publishRes = await fetch(`https://api.webflow.com/sites/${siteId}/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'accept-version': '1.0.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domains })
    });
    const publishJson = await publishRes.json().catch(() => ({}));
    return NextResponse.json({ ok: publishRes.ok, status: publishRes.status, data: publishJson });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to publish direct v1', detail: err?.message }, { status: 500 });
  }
}


