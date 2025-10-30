import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const clientId = process.env.WEBFLOW_CLIENT_ID;
  const clientSecret = process.env.WEBFLOW_CLIENT_SECRET;
  const redirectUri = process.env.WEBFLOW_REDIRECT_URI || 'https://api.rensto.com/api/webflow/oauth/callback';

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'WEBFLOW client config missing' }, { status: 500 });
  }

  try {
    const tokenRes = await fetch('https://api.webflow.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return NextResponse.json({ error: 'Token exchange failed', detail: text }, { status: 502 });
    }

    const tokens = await tokenRes.json();

    // TODO: Store in MCP secure storage; temporary response confirms success
    return NextResponse.json({ success: true, state, tokens });

  } catch (err: any) {
    return NextResponse.json({ error: 'OAuth callback error', detail: err?.message }, { status: 500 });
  }
}

