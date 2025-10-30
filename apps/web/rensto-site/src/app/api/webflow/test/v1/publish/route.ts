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
    // Fetch domains first
    const domainsRes = await fetch(`https://api.webflow.com/sites/${siteId}/domains`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'accept-version': '1.0.0'
      }
    });
    const domainsJson = await domainsRes.json();
    if (!domainsRes.ok) {
      return NextResponse.json({ ok: false, step: 'domains', status: domainsRes.status, data: domainsJson });
    }
    const domainNames: string[] = (domainsJson || []).map((d: any) => d.name).filter(Boolean);

    const publishRes = await fetch(`https://api.webflow.com/sites/${siteId}/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'accept-version': '1.0.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domains: domainNames })
    });
    const publishJson = await publishRes.json().catch(() => ({}));
    return NextResponse.json({ ok: publishRes.ok, status: publishRes.status, data: publishJson });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to publish v1', detail: err?.message }, { status: 500 });
  }
}


