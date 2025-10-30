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

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/webflow/oauth/callback
 * Exchanges authorization code for access/refresh tokens.
 * Returns token payload as JSON so it can be captured and loaded into MCP credentials.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  if (error) {
    return NextResponse.json({ error: `OAuth error: ${error}` }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const clientId = process.env.WEBFLOW_CLIENT_ID;
  const clientSecret = process.env.WEBFLOW_CLIENT_SECRET;
  const redirectUri = process.env.WEBFLOW_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Missing Webflow OAuth env vars' }, { status: 500 });
  }

  try {
    const tokenResp = await fetch('https://api.webflow.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });

    const data = await tokenResp.json();
    if (!tokenResp.ok) {
      return NextResponse.json({ error: 'Token exchange failed', details: data }, { status: 502 });
    }

    // Return tokens so operator can load into MCP runtime; do not persist here
    return NextResponse.json({ success: true, tokens: data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected token exchange error', details: (e as Error).message }, { status: 500 });
  }
}


