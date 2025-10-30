import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const clientId = process.env.WEBFLOW_CLIENT_ID;
  const redirectUri = process.env.WEBFLOW_REDIRECT_URI || 'https://api.rensto.com/api/webflow/oauth/callback';
  const scopes = [
    'sites:read',
    'sites:write',
    'cms:read',
    'cms:write',
    'assets:read',
    'assets:write',
    'pages:read',
    'custom_code:read',
    'custom_code:write'
  ].join(' ');

  if (!clientId) {
    return NextResponse.json({ error: 'WEBFLOW_CLIENT_ID not configured' }, { status: 500 });
  }

  const authUrl = new URL('https://webflow.com/oauth/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', Math.random().toString(36).slice(2));

  return NextResponse.json({ ok: true, authorizeUrl: authUrl.toString(), clientId, redirectUri, scopes });
}


