# ⚡ Phase 2: Quick Start Guide

**Purpose**: Fast deployment to Vercel Preview

---

## 🚀 **3-STEP DEPLOYMENT**

### **Step 1: Set Environment Variables**

```bash
cd apps/web/rensto-site

# Set Airtable key
vercel env add AIRTABLE_API_KEY preview
# Paste: pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9
# Press Enter

# Set TidyCal key (optional - uses fallback if not set)
vercel env add TIDYCAL_API_KEY preview
# Paste TidyCal JWT token or press Enter to skip
```

### **Step 2: Deploy**

```bash
vercel --prod=false
```

**Copy the preview URL** (e.g., `rensto-site-abc123.vercel.app`)

### **Step 3: Test**

```bash
# Test download endpoint
curl -X POST https://YOUR_PREVIEW_URL.vercel.app/api/marketplace/downloads \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "email-persona-system",
    "customerEmail": "test@test.com",
    "sessionId": "cs_test",
    "purchaseRecordId": "rec123"
  }'
```

---

## ✅ **SUCCESS INDICATORS**

- ✅ Deployment succeeds (no build errors)
- ✅ API returns 200 OK (not 401/500)
- ✅ Download link generated
- ✅ Response contains `downloadLink` field

---

**Full Guide**: See `PHASE_2_DEPLOYMENT_GUIDE.md` for complete testing instructions.

