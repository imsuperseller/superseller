import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const realmId = searchParams.get('realmId');
    const error = searchParams.get('error');

    console.log('🔗 QuickBooks OAuth Callback Received:');
    console.log('Code:', code ? 'Present' : 'Missing');
    console.log('State:', state);
    console.log('RealmId:', realmId);
    console.log('Error:', error);

    // Validate state parameter for security
    if (!state) {
      console.error('❌ Missing state parameter');
      return NextResponse.json({ 
        success: false, 
        error: 'missing_state',
        message: 'State parameter is missing for security validation'
      }, { status: 400 });
    }

    // In production, you would validate the state parameter against what was stored
    // For now, we'll just ensure it exists and has a reasonable format
    if (state.length < 16) {
      console.error('❌ Invalid state parameter format');
      return NextResponse.json({ 
        success: false, 
        error: 'invalid_state',
        message: 'State parameter format is invalid'
      }, { status: 400 });
    }

    if (error) {
      console.error('❌ OAuth Error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error,
        message: 'OAuth authorization failed'
      }, { status: 400 });
    }

    if (!code) {
      console.error('❌ Missing authorization code');
      return NextResponse.json({ 
        success: false, 
        error: 'missing_code',
        message: 'Authorization code is missing'
      }, { status: 400 });
    }

    if (!realmId) {
      console.error('❌ Missing realm ID');
      return NextResponse.json({ 
        success: false, 
        error: 'missing_realm_id',
        message: 'Realm ID is missing'
      }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/quickbooks-callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorData);
      return NextResponse.json({ 
        success: false, 
        error: 'token_exchange_failed',
        message: 'Failed to exchange code for access token',
        details: errorData
      }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Access token obtained successfully');

    // Save credentials
    const credentials = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
      realmId: realmId,
      clientId: process.env.QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
      obtainedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    };

    // Save to file system (in production, use secure storage)
    const fs = require('fs');
    const path = require('path');
    const credentialsPath = path.join(process.cwd(), 'scripts', 'quickbooks-fresh-credentials.json');
    
    // Ensure directory exists
    const dir = path.dirname(credentialsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    console.log('💾 Credentials saved to scripts/quickbooks-fresh-credentials.json');

    // Test the connection by getting company info
    try {
      const companyResponse = await fetch(`https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json'
        }
      });

      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        const companyInfo = companyData.QueryResponse.CompanyInfo[0];
        console.log(`🏢 Connected to company: ${companyInfo.CompanyName}`);
        
        return NextResponse.json({
          success: true,
          message: 'QuickBooks OAuth successful',
          companyName: companyInfo.CompanyName,
          realmId: realmId,
          expiresAt: credentials.expiresAt
        });
      }
    } catch (error) {
      console.error('⚠️ Warning: Could not verify company info:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'QuickBooks OAuth successful',
      realmId: realmId,
      expiresAt: credentials.expiresAt
    });

  } catch (error) {
    console.error('❌ QuickBooks OAuth callback error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'callback_error',
      message: 'Internal server error during OAuth callback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests if needed
  return GET(request);
}
