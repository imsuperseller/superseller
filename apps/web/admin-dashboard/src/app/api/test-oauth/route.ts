import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Generate a secure random state parameter
    const state = randomBytes(32).toString('hex');
    
    console.log('🔐 Generated state parameter:', state);
    
    // Build the authorization URL with state parameter
    const authUrl = new URL('https://appcenter.intuit.com/connect/oauth2');
    authUrl.searchParams.set('client_id', process.env.QUICKBOOKS_CLIENT_ID!);
    authUrl.searchParams.set('scope', 'com.intuit.quickbooks.accounting');
    authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/quickbooks-callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('state', state);
    
    console.log('🔗 Generated authorization URL with state parameter');
    
    return NextResponse.json({
      success: true,
      authorizationUrl: authUrl.toString(),
      state: state,
      message: 'Use the authorizationUrl to initiate OAuth flow',
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/quickbooks-callback`,
      instructions: [
        '1. Update QuickBooks redirect URI in Intuit Developer portal to the redirectUri above',
        '2. Visit the authorizationUrl to start OAuth flow',
        '3. Complete OAuth authorization',
        '4. Check callback response for credentials'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error generating OAuth URL:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'oauth_init_error',
      message: 'Failed to generate OAuth authorization URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
