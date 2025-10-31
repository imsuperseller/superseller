# 🚀 Designer Extension Deployment Guide

**Date**: October 30, 2025  
**Goal**: Deploy Designer Extension to enable automated page custom code updates

---

## 📋 **PRE-REQUISITES**

✅ **Credentials Available**:
- Client ID: `9019376a6596d4dff6bc765563e07aee92469e257a7cfefd7c8839ccc3773edb`
- Client Secret: `7d5cf2ea9f9a3a18795ceeac7f083c77e9c3d7e9bc7f378c789d7f16eff5f5c1`
- Redirect URI: `https://68df6a6f4c7ce10d908b36e5.webflow-ext.com/auth/webflow/callback`
- Extension URL: `https://68df6e8d3098a65fadc8f111.webflow-ext.com`

---

## 🔧 **DEPLOYMENT STEPS**

### **Step 1: Prepare Extension Code**

The extension server exists at:
- `infra/mcp-servers/webflow-mcp-server/designer-extension/index.js`

**Verify it's ready**:
```bash
cd infra/mcp-servers/webflow-mcp-server/designer-extension
npm install
npm start  # Test locally first
```

---

### **Step 2: Deploy Extension Server**

**Option A: Deploy to Vercel** (Recommended)

1. **Create Vercel Project**:
   ```bash
   cd infra/mcp-servers/webflow-mcp-server/designer-extension
   vercel --prod
   ```

2. **Update Environment Variables**:
   - `WEBFLOW_CLIENT_ID`
   - `WEBFLOW_CLIENT_SECRET`
   - `PORT` (Vercel auto-assigns)

3. **Update Extension URL** in Webflow Developer Portal

**Option B: Deploy to RackNerd VPS**

1. **SSH to VPS**: `173.254.201.134`
2. **Deploy extension server**
3. **Use Cloudflare Tunnel** to expose it

---

### **Step 3: Register in Webflow Developer Portal**

1. Go to: https://developers.webflow.com/apps
2. Create/Update Designer Extension
3. Set Extension URL to deployed server
4. Configure OAuth callback URL
5. Set required scopes/permissions

---

### **Step 4: Install Extension in Designer**

1. Open Webflow Designer
2. Go to **Apps** panel
3. Install your Designer Extension
4. Authorize via OAuth flow

---

## 🎯 **ALTERNATIVE: Use Site Custom Code API**

**For scripts that work site-wide**, use Webflow's Site Custom Code API:

```javascript
// Register script site-wide (applies to all pages)
POST https://api.webflow.com/v2/sites/{siteId}/custom_code
{
  "canCopy": true,
  "sourceType": "url",
  "location": "bodyEnd",
  "code": "<script src='https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js'></script>"
}
```

**Limitations**:
- Site-level only (not page-specific)
- Can't target individual pages

---

## ✅ **CURRENT WORKAROUND**

**Manual Deployment Ready**:
- ✅ All page IDs mapped
- ✅ All snippets prepared
- ✅ Deployment guide complete

**Time**: ~35 minutes to deploy manually

---

**Status**: Extension fix in progress, manual deployment ready as fallback

