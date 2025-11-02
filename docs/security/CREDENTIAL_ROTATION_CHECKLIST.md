# 🔐 Credential Rotation Checklist

**Date**: November 2, 2025  
**Reason**: GitHub secret scanning detected credentials in `claude_desktop_config.json` (commit `d15988b`)  
**Status**: ⏳ **AWAITING ROTATION**

---

## 🚨 **EXPOSED CREDENTIALS**

The following credentials were committed to git history and need rotation:

### **1. Notion API Token** (Line 142) ⚠️ **HIGH PRIORITY**
- **Token**: `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`
- **Risk**: Can access all Notion databases
- **Location**: `claude_desktop_config.json:142`

**Rotation Steps**:
1. Go to https://www.notion.so/my-integrations
2. Revoke the existing integration token
3. Create a new integration with same permissions
4. Update token in `~/.cursor/mcp.json` (NOT in repo file)
5. Update token in `claude_desktop_config.json` (local only, won't commit)
6. Test MCP server connection

---

### **2. n8n API Keys** (Lines 19, 39, 59) ⚠️ **HIGH PRIORITY**
- **Rensto VPS**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (line 19)
- **Tax4Us Cloud**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (line 39)
- **Shelly Cloud**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (line 59)
- **Risk**: Full workflow management access

**Rotation Steps**:
1. Rensto VPS (http://173.254.201.134:5678):
   - Login to n8n
   - Go to Settings → API
   - Revoke old API key
   - Generate new API key
   - Update in `~/.cursor/mcp.json` and Docker env

2. Tax4Us Cloud (https://tax4usllc.app.n8n.cloud):
   - Login to n8n Cloud dashboard
   - API → Generate new key
   - Update in `~/.cursor/mcp.json` and Docker env

3. Shelly Cloud (https://shellyins.app.n8n.cloud):
   - Login to n8n Cloud dashboard
   - API → Generate new key
   - Update in `~/.cursor/mcp.json` and Docker env

---

### **3. Stripe API Key** (Line 104) ⚠️ **CRITICAL**
- **Key**: `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`
- **Type**: **LIVE SECRET KEY** (most dangerous!)
- **Risk**: Can process real payments, access all Stripe data

**Rotation Steps**:
1. ⚠️ **IMMEDIATE ACTION REQUIRED**
2. Go to https://dashboard.stripe.com/apikeys
3. Rotate the secret key (create new, then revoke old)
4. Update in:
   - Vercel environment variables (all environments)
   - `~/.cursor/mcp.json` (Docker args)
   - Any local `.env` files
5. Update webhook endpoints if signing secret changes
6. Test payment flow immediately after rotation

**Note**: This is a LIVE key - highest priority rotation!

---

### **4. Airtable PAT** (Line 93) ⚠️ **MEDIUM PRIORITY**
- **Token**: `pattFjaYM0LkLb0gb.8026a945a8cbcc7b3d6fe7d2085a74f5b019184379f84ccf7bbbca1f65fc55fb`
- **Risk**: Can access all Airtable bases

**Rotation Steps**:
1. Go to https://airtable.com/account
2. API → Personal access tokens
3. Revoke old token
4. Create new token with same scopes
5. Update in:
   - `~/.cursor/mcp.json`
   - Vercel environment variables
   - n8n credentials (if stored there)

---

### **5. Other Credentials** (Lower Priority)

**TidyCal API Key** (Line 113):
- Rotate if using production account
- Update in `~/.cursor/mcp.json`

**Supabase Token** (Line 125):
- Rotate if using production database
- Update in `~/.cursor/mcp.json` and Vercel

**Boost.space API Key** (Line 152):
- Lower risk (metadata storage only)
- Rotate if concerned

**Webflow Token** (Line 70):
- Rotate if concerned
- Update in `~/.cursor/mcp.json`

---

## ✅ **VERIFICATION CHECKLIST**

After rotating each credential:

- [ ] Credential revoked in source service
- [ ] New credential generated
- [ ] Updated in `~/.cursor/mcp.json` (NOT in repo)
- [ ] Updated in Vercel env vars (if applicable)
- [ ] Updated in n8n credentials (if applicable)
- [ ] MCP server restarted and tested
- [ ] Any workflows using credential tested
- [ ] Old credential confirmed revoked

---

## 🔒 **PREVENTION**

**Completed**:
- ✅ Added `claude_desktop_config.json` to `.gitignore`

**Remaining**:
- ⚠️ Remove file from git history (BFG Repo-Cleaner or git filter-branch)
- ⚠️ Consider using `.cursor/mcp.json` only (not repo-level config)
- ⚠️ Set up pre-commit hooks to scan for secrets

---

## 📝 **NOTES**

- All credentials are now in `.gitignore` (won't commit in future)
- Repository-level `claude_desktop_config.json` should be removed or secrets redacted
- Primary config should be `~/.cursor/mcp.json` (already ignored)
- Consider using GitHub Secrets for CI/CD instead of env files

---

**Priority Order**:
1. 🔴 **Stripe LIVE key** (immediate)
2. 🔴 **n8n API keys** (high - workflow access)
3. 🟡 **Notion token** (medium - database access)
4. 🟡 **Airtable PAT** (medium - data access)
5. 🟢 **Other tokens** (as needed)

