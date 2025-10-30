import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function doPublish(accessToken: string, siteId: string) {
  // 1) Read site details (v2) to get customDomains → domain IDs
  const siteRes = await fetch(`https://api.webflow.com/v2/sites/${siteId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const siteJson = await siteRes.json().catch(() => ({}));
  if (!siteRes.ok) {
    return NextResponse.json({ ok: false, step: 'site', status: siteRes.status, data: siteJson });
  }
  const domainIds: string[] = (siteJson?.customDomains || [])
    .map((d: any) => d?.id)
    .filter(Boolean);

  // 2) Publish to specific domains (v2 requirement)
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
}

export async function POST(req: NextRequest) {
  const { accessToken, siteId } = await req.json().catch(() => ({ accessToken: undefined, siteId: undefined }));
  if (!accessToken || !siteId) {
    return NextResponse.json({ error: 'Missing accessToken or siteId' }, { status: 400 });
  }
  try {
    return await doPublish(accessToken, siteId);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to publish site', detail: err?.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken') || '';
  const siteId = searchParams.get('siteId') || '';
  if (!accessToken || !siteId) {
    return NextResponse.json({ error: 'Missing accessToken or siteId' }, { status: 400 });
  }
  try {
    return await doPublish(accessToken, siteId);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to publish site', detail: err?.message }, { status: 500 });
  }
}


