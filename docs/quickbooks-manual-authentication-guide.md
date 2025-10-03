# QuickBooks Manual Authentication Guide

## 🔄 Manual OAuth2 Authentication Process

The redirect URI issue has been resolved. Follow this process:

### Step 1: Generate Authorization URL

Visit this URL in your browser:
```
https://appcenter.intuit.com/connect/oauth2?response_type=code&client_id=ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f&redirect_uri=https%3A%2F%2Frensto.com%2Foauth%2Fcallback&scope=com.intuit.quickbooks.accounting&state=rensto-quickbooks-auth-manual
```

### Step 2: Complete Authentication

1. **Sign in** to your QuickBooks account
2. **Authorize** the Rensto application
3. **You will be redirected** to: `https://rensto.com/oauth/callback?code=YOUR_AUTH_CODE`
4. **Copy the authorization code** from the URL (the part after `code=`)

### Step 3: Exchange Code for Tokens

Use the simple authentication script:

```bash
node scripts/quickbooks-simple-auth.js YOUR_AUTH_CODE
```

Or use this curl command (replace `YOUR_AUTH_CODE` with the actual code):

```bash
curl -X POST https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic QUJDcU1GSDJoYzRBb0ViY3g5VXpKQlNydU9LVFRsTGVvc3E0WFpJcXhtM0FmOXVWMGY6Q2YyV2VFaGRJWkxvSkNLczYwWXJSMTh5TWVxTEpNdGgyV2FTdUszago=" \
  -d "grant_type=authorization_code&code=YOUR_AUTH_CODE&redirect_uri=https://rensto.com/oauth/callback"
```

### Step 4: Save New Credentials

The script will automatically create:
- `quickbooks-fresh-credentials.json` - JSON format
- `quickbooks-fresh-credentials.env` - Environment variables format

### Step 5: Test New Credentials

Run the test script with new credentials:

```bash
node scripts/test-quickbooks-credentials.js
```

## 🔧 Alternative Authentication Methods

### Method 1: QuickBooks Developer Console

1. Go to [QuickBooks Developer Console](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
2. Create a new app or use existing app
3. Generate new OAuth2 credentials
4. Follow the OAuth2 flow

### Method 2: QuickBooks App Center

1. Visit [QuickBooks App Center](https://appcenter.intuit.com/)
2. Find your app or create a new one
3. Generate new OAuth2 tokens
4. Update your credentials

## 📋 Required Credentials

- **Client ID**: `ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f`
- **Client Secret**: `Cf2WeEhdIZLoJCKs60YrR17yMeqLJmth2WaSuK3j`
- **Realm ID**: `9341454031329905`
- **Redirect URI**: `https://rensto.com/oauth/callback` ✅ **CORRECT**
- **Scope**: `com.intuit.quickbooks.accounting`

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri"** ✅ **FIXED**
   - Now using: `https://rensto.com/oauth/callback`
   - This should be registered in your QuickBooks app

2. **"Invalid client_id"**
   - Verify client ID is correct
   - Check app is active in QuickBooks

3. **"Authorization code expired"**
   - Authorization codes expire in 10 minutes
   - Generate a new code quickly

4. **"Invalid scope"**
   - Use exact scope: `com.intuit.quickbooks.accounting`
   - Check app permissions

### Support Resources:

- [QuickBooks OAuth2 Documentation](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [QuickBooks API Reference](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/companyinfo)
- [QuickBooks Developer Support](https://developer.intuit.com/app/developer/qbo/docs/support)

## ✅ Success Indicators

After successful authentication, you should see:

1. **Valid access token** (starts with `eyJ`)
2. **Valid refresh token** (starts with `RT1-`)
3. **Successful API test** (company info retrieved)
4. **No 401 errors** in API calls

## 🔄 Next Steps After Authentication

1. **Update environment variables** with new credentials
2. **Test Ben Ginati payment verification**
3. **Deploy QuickBooks MCP server** to Racknerd VPS
4. **Update all scripts** with new credentials
5. **Verify customer payment status**

## 🎯 Quick Start Commands

```bash
# Generate auth URL
node scripts/quickbooks-simple-auth.js

# After getting auth code, exchange for tokens
node scripts/quickbooks-simple-auth.js YOUR_AUTH_CODE

# Test the new credentials
node scripts/test-quickbooks-credentials.js
```


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)