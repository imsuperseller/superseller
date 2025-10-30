import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json().catch(() => ({ accessToken: undefined }));
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.webflow.com/v2/sites', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    return NextResponse.json({ ok: res.ok, status: res.status, data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to list sites', detail: err?.message }, { status: 500 });
  }
}


