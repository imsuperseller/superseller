import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { accessToken, siteId } = await req.json().catch(() => ({ accessToken: undefined, siteId: undefined }));
  if (!accessToken || !siteId) {
    return NextResponse.json({ error: 'Missing accessToken or siteId' }, { status: 400 });
  }

  try {
    // 1) Get site domains
    const domainsRes = await fetch(`https://api.webflow.com/v2/sites/${siteId}/domains`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const domainsJson = await domainsRes.json();
    if (!domainsRes.ok) {
      return NextResponse.json({ ok: false, step: 'domains', status: domainsRes.status, data: domainsJson });
    }
    const domainIds: string[] = (domainsJson?.domains || []).map((d: any) => d.id).filter(Boolean);

    // 2) Publish to domains
    const publishRes = await fetch(`https://api.webflow.com/v2/sites/${siteId}/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publishTo: domainIds })
    });
    const publishJson = await publishRes.json().catch(() => ({}));
    return NextResponse.json({ ok: publishRes.ok, status: publishRes.status, data: publishJson });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to publish site', detail: err?.message }, { status: 500 });
  }
}


