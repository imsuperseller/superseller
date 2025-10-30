export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

function isPresent(key: string): boolean {
  const value = process.env[key];
  return typeof value === 'string' && value.length > 0;
}

export async function GET() {
  const data = {
    WEBFLOW_CLIENT_ID: isPresent('WEBFLOW_CLIENT_ID'),
    WEBFLOW_CLIENT_SECRET: isPresent('WEBFLOW_CLIENT_SECRET'),
    WEBFLOW_REDIRECT_URI: process.env.WEBFLOW_REDIRECT_URI ?? null,
    WEBFLOW_SCOPES: process.env.WEBFLOW_SCOPES ?? null,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: isPresent('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    STRIPE_WEBHOOK_SECRET: isPresent('STRIPE_WEBHOOK_SECRET'),
  } as const;

  return NextResponse.json({ ok: true, data });
}


