import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const clientId = process.env.WEBFLOW_CLIENT_ID;
  const redirectUri = process.env.WEBFLOW_REDIRECT_URI || 'https://api.rensto.com/api/wf/oauth/callback';
  const scopes = process.env.WEBFLOW_SCOPES || [
    'sites:read',
    'cms:read_write',
    'assets:read_write',
    'pages:read',
    'custom_code:read_write',
    'webhooks:read_write',
    'publish:write'
  ].join(' ');

  if (!clientId) {
    return NextResponse.json({ error: 'WEBFLOW_CLIENT_ID not configured' }, { status: 500 });
  }

  const state = Math.random().toString(36).slice(2);
  const authUrl = new URL('https://webflow.com/oauth/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString(), { status: 302 });
}

