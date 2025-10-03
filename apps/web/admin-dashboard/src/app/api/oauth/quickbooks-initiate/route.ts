import { NextRequest, NextResponse } from 'next/server';
import { OAuthStateManager } from '@/lib/oauth-state';

export async function GET(request: NextRequest) {
  try {
    // Generate secure state parameter
    const state = OAuthStateManager.generateState();
    
    // Build QuickBooks OAuth URL
    const authUrl = new URL('https://appcenter.intuit.com/connect/oauth2');
    authUrl.searchParams.set('client_id', process.env.QUICKBOOKS_CLIENT_ID || '');
    authUrl.searchParams.set('scope', 'com.intuit.quickbooks.accounting');
    authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/quickbooks-callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');

    console.log('🔗 Generated QuickBooks OAuth URL with secure state');

    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
      state: state // For debugging - remove in production
    });

  } catch (error) {
    console.error('❌ QuickBooks OAuth initiation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'initiation_error',
      message: 'Failed to initiate OAuth flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
