# Microsoft Outlook OAuth2 Setup for Self-Hosted n8n

**Last Updated**: November 3, 2025  
**Environment**: RackNerd VPS (173.254.201.134)  
**n8n Public URL**: `https://n8n.rensto.com`  
**n8n Internal URL**: `http://173.254.201.134:5678`

---

## Problem

Microsoft Outlook OAuth2 connection fails on self-hosted n8n. Common causes:
1. Redirect URI mismatch between Azure and n8n
2. n8n base URL not configured correctly
3. Azure app registration missing required permissions
4. OAuth2 credentials expired or invalid

---

## Solution

### Step 1: Verify n8n Base URL Configuration

**SSH into RackNerd VPS**:
```bash
ssh root@173.254.201.134
```

**Check n8n environment variables**:
```bash
# If using Docker
docker exec -it n8n env | grep -E "WEBHOOK_URL|N8N_BASE_URL|N8N_HOST"

# If using systemd service
cat /etc/systemd/system/n8n.service | grep -E "WEBHOOK_URL|N8N_BASE_URL"
```

**Required Environment Variable**:
```bash
WEBHOOK_URL=https://n8n.rensto.com
# OR
N8N_BASE_URL=https://n8n.rensto.com
```

**If missing, add to n8n configuration**:
- **Docker**: Update `docker-compose.yml` or `.env` file
- **Systemd**: Update service file or `/etc/environment`
- **PM2**: Update ecosystem.config.js

---

### Step 2: Configure Azure App Registration

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to**: Azure Active Directory → App registrations
3. **Find your app** (or create new one):
   - **Name**: "n8n Outlook Integration" (or your existing name)
   - **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: `https://n8n.rensto.com/rest/oauth2-credential/callback`
     - **Type**: Web
     - **IMPORTANT**: Must match exactly (no trailing slash, correct protocol)

4. **API Permissions** (Microsoft Graph):
   - ✅ `Mail.Send` (Delegated)
   - ✅ `Mail.ReadWrite` (Delegated)
   - ✅ `User.Read` (Delegated)
   - Click **"Grant admin consent"** if needed

5. **Certificates & secrets**:
   - Create new client secret
   - **Copy the value immediately** (you won't see it again)
   - Note expiration date

---

### Step 3: Get OAuth2 Credentials

From Azure App Registration:

**Client ID**:
- Copy from "Overview" → "Application (client) ID"
- Example: `d6515b73-44a9-4f4e-942c-ae231bc18062`

**Client Secret**:
- From "Certificates & secrets" → Latest secret value
- If expired, create new one

**Authorization URL**:
```
https://login.microsoftonline.com/common/oauth2/v2.0/authorize
```

**Access Token URL**:
```
https://login.microsoftonline.com/common/oauth2/v2.0/token
```

**Scope** (for n8n):
```
https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read offline_access
```

---

### Step 4: Configure n8n Credential

1. **Go to n8n**: https://n8n.rensto.com
2. **Navigate to**: Credentials → Add Credential
3. **Select**: **Microsoft Outlook OAuth2 API** (this automatically pre-fills the correct URLs)
4. **Fill in**:
   - **Credential Name**: `service@rensto.com` (or your preferred name)
   - **Client ID**: Your Azure Application (client) ID (e.g., `d6515b73-44a9-4f4e-942c-ae231bc18062`)
   - **Client Secret**: Your Azure Client Secret
   - **Note**: Authorization URL and Access Token URL are pre-filled by n8n (you don't need to enter them)

5. **Click "Connect my account"**:
   - This will redirect to Microsoft login
   - Sign in with `service@rensto.com` (or your Microsoft account)
   - Grant permissions
   - Should redirect back to n8n

**Important**: With `WEBHOOK_URL` now correctly set (no trailing slash), PKCE should work automatically. You don't need to manually configure URLs or scopes - n8n handles this for Microsoft Outlook OAuth2 API credentials.

---

### Step 5: Verify Connection

1. **Test in workflow**:
   - Create test workflow with Microsoft Outlook node
   - Select "Send" operation
   - Choose your credential
   - Fill in test email fields
   - Execute workflow

2. **Check for errors**:
   - If "redirect_uri_mismatch": Azure redirect URI is wrong
   - If "invalid_client": Client ID/Secret is wrong
   - If "access_denied": Permissions not granted

---

## Troubleshooting

### Issue: "redirect_uri_mismatch"

**Solution**:
1. Verify Azure redirect URI is exactly: `https://n8n.rensto.com/rest/oauth2-credential/callback`
2. Check n8n `WEBHOOK_URL` environment variable matches
3. Ensure Cloudflare tunnel is routing correctly
4. Try clearing browser cache and cookies

### Issue: "invalid_client" or "AADSTS7000215: Invalid client secret provided"

**Error Message**: `AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID`

**Root Cause**: You copied the **Secret ID** instead of the **Secret Value** from Azure.

**Critical Difference**:
- ❌ **Secret ID**: `3ce8bb30-6890-4d94-af67-d2698d67e603` (UUID format - this is NOT the secret)
- ✅ **Secret Value**: `j_y8Q~kU3PMggBiEcAFfB58oyNKd7rGu...` (long string - this IS the secret)

**Solution**:

1. **Go to Azure Portal** → App registrations → Your app → **Certificates & secrets**
2. **Find your client secret** in the table
3. **Copy the VALUE** (not the Secret ID):
   - Click the **copy icon** next to the **"Value"** column (not the Secret ID column)
   - The Value is a long string that starts with characters like `j_y8Q~...`
   - **Important**: If the Value column shows "Hidden" or is blank, you **cannot** retrieve it - you must create a new secret
4. **If Value is hidden**, create a new client secret:
   - Click **"+ New client secret"**
   - Add description (e.g., "n8n integration")
   - Set expiration (recommended: 24 months)
   - Click **"Add"**
   - **IMMEDIATELY copy the Value** - you won't see it again!
5. **Update n8n credential**:
   - Go to n8n → Credentials → Edit your Microsoft Outlook credential
   - Paste the **Secret Value** (not Secret ID) into "Client Secret" field
   - Save and try connecting again

**Common Mistake**: Copying the Secret ID (`3ce8bb30-6890-4d94-af67-d2698d67e603`) instead of the Value (`j_y8Q~kU3PMggBiEcAFfB58oyNKd7rGu...`)

### Issue: OAuth worked once, now fails

**Common causes**:
1. **Client Secret expired**: Create new secret in Azure
2. **Azure app registration changed**: Verify redirect URI still correct
3. **n8n base URL changed**: Check `WEBHOOK_URL` environment variable
4. **Token expired**: Re-authenticate in n8n credential

### Issue: "access_denied" or missing permissions

**Solution**:
1. Go to Azure → App registrations → Your app → API permissions
2. Verify all required permissions are added
3. Click "Grant admin consent for [Your Organization]"
4. Wait 5-10 minutes for propagation
5. Try connecting again

### Issue: "AADSTS9002325: Proof Key for Code Exchange is required" (PKCE Error)

**Error Message**: `AADSTS9002325: Proof Key for Code Exchange is required for cross-origin authorization code redemption`

**Root Cause**: Microsoft requires PKCE (Proof Key for Code Exchange) for OAuth2 cross-origin flows. n8n v1.115.0 supports PKCE, but it needs proper environment configuration to work correctly.

**Solution** (for n8n v1.115.0):

#### Step 1: Verify n8n Environment Variables (CRITICAL)

**SSH into RackNerd VPS**:
```bash
ssh root@173.254.201.134

# Check current environment variables
docker exec n8n env | grep -E "WEBHOOK_URL|N8N_BASE_URL|N8N_HOST|N8N_PROTOCOL"
```

**Required Environment Variables** (n8n needs these for PKCE to work):
```bash
WEBHOOK_URL=https://n8n.rensto.com
# OR all of these:
N8N_PROTOCOL=https
N8N_HOST=n8n.rensto.com
N8N_PORT=443
```

**If missing, add them**:
- **Docker**: Update your `docker-compose.yml` or `.env` file
- **Systemd**: Update service file
- **Then restart n8n**

#### Step 2: Delete and Recreate Credential (After Fixing WEBHOOK_URL)

1. **Delete existing credential** in n8n (clears cached OAuth state)
2. **Create new credential**:
   - Select "Microsoft Outlook OAuth2 API" (URLs are pre-filled automatically)
   - Enter **Client ID** from Azure
   - Enter **Client Secret** from Azure
   - Click **"Connect my account"**

**Most Common Fix**: Setting `WEBHOOK_URL=https://n8n.rensto.com` (no trailing slash) environment variable and restarting n8n. This enables PKCE automatically.

---

## Verification Checklist

- [ ] n8n `WEBHOOK_URL` environment variable set to `https://n8n.rensto.com`
- [ ] Azure redirect URI is exactly `https://n8n.rensto.com/rest/oauth2-credential/callback`
- [ ] Azure app has required Microsoft Graph permissions
- [ ] Admin consent granted for all permissions
- [ ] Client Secret is not expired
- [ ] n8n credential created with correct URLs and credentials
- [ ] OAuth flow completes successfully (redirects back to n8n)
- [ ] Test email sends successfully from workflow

---

## Quick Reference

**n8n Public URL**: `https://n8n.rensto.com`  
**n8n Internal URL**: `http://173.254.201.134:5678`  
**OAuth Redirect URI**: `https://n8n.rensto.com/rest/oauth2-credential/callback`  
**Authorization URL**: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`  
**Access Token URL**: `https://login.microsoftonline.com/common/oauth2/v2.0/token`

**Required Permissions**:
- `Mail.Send`
- `Mail.ReadWrite`
- `User.Read`

---

## Related Documentation

- [n8n Microsoft Outlook Node Documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftoutlook/)
- [Microsoft Graph API Permissions](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Azure App Registration Guide](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

