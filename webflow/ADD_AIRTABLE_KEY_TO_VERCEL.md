# ✅ Add AIRTABLE_API_KEY to Vercel

**Status**: ⚠️ **REQUIRED** - API endpoint deployed but missing environment variable  
**Date**: November 2, 2025

---

## 🚨 **ISSUE**

The API endpoint `https://api.rensto.com/api/marketplace/workflows` is deployed but returns:
```json
{"success":false,"error":"AIRTABLE_API_KEY not configured","workflows":[]}
```

---

## ✅ **SOLUTION**

Add `AIRTABLE_API_KEY` to Vercel project `api-rensto-site`:

### **Option 1: Via Vercel Dashboard** (Recommended)

1. Go to: https://vercel.com/dashboard
2. Find project: **`api-rensto-site`** (or **`rensto-site`**)
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `AIRTABLE_API_KEY`
   - **Value**: `pattFjaYM0LkLb0gb.8026a945a8cbcc7b3d6fe7d2085a74f5b019184379f84ccf7bbbca1f65fc55fb`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development (check all three)
6. Click **Save**
7. **Redeploy** the latest deployment (or wait for next auto-deploy)

### **Option 2: Via Vercel CLI**

```bash
cd apps/web/rensto-site
vercel env add AIRTABLE_API_KEY production
# When prompted, paste: pattFjaYM0LkLb0gb.8026a945a8cbcc7b3d6fe7d2085a74f5b019184379f84ccf7bbbca1f65fc55fb

vercel env add AIRTABLE_API_KEY preview
# Same value

vercel env add AIRTABLE_API_KEY development
# Same value

# Force redeploy
vercel --prod
```

---

## ✅ **VERIFICATION**

After adding the key and redeploying (2-3 minutes):

```bash
curl "https://api.rensto.com/api/marketplace/workflows?limit=1"
```

**Expected Response**:
```json
{
  "success": true,
  "count": 1,
  "workflows": [
    {
      "id": "...",
      "name": "...",
      "category": "...",
      ...
    }
  ]
}
```

---

## 📋 **OTHER REQUIRED ENVIRONMENT VARIABLES**

While you're in Vercel, verify these are also set:

| Variable | Status | Required For |
|----------|--------|--------------|
| `STRIPE_SECRET_KEY` | ✅ Verify | Stripe checkout |
| `STRIPE_WEBHOOK_SECRET` | ✅ Verify | Webhook validation |
| `AIRTABLE_API_KEY` | ⚠️ **ADD NOW** | Marketplace workflows API |
| `TIDYCAL_API_KEY` | ✅ Verify | Installation booking |
| `WEBFLOW_CLIENT_ID` | ✅ Verify | Webflow OAuth |
| `WEBFLOW_CLIENT_SECRET` | ✅ Verify | Webflow OAuth |
| `WEBFLOW_REDIRECT_URI` | ✅ Verify | Webflow OAuth |

---

## 🔒 **SECURITY NOTE**

The Airtable PAT shown above is from `claude_desktop_config.json`. This is a real production token. After adding it to Vercel:
- ✅ It will be encrypted in Vercel
- ⚠️ Consider rotating it later (see `docs/security/CREDENTIAL_ROTATION_CHECKLIST.md`)

---

**After adding**: Wait 2-3 minutes for redeploy, then test the endpoint again.

