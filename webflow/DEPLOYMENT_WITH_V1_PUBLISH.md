# 🎯 Deployment Guide with v1 Publish

**Date**: October 31, 2025  
**Status**: ✅ **VERIFIED & WORKING** - Use Site API Token with v1 endpoint

---

## ✅ **CORRECT APPROACH**

### **For Publishing** (What Works):
- ✅ **Use Site API Token**: `90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b`
- ✅ **Use v1 API endpoint**: `POST /sites/{siteId}/publish` with `accept-version: '1.0.0'`
- ✅ **Direct domain names**: Pass `domains: ['rensto.com', 'www.rensto.com']` in body
- ✅ **Publish Script**: `scripts/publish-webflow-site.js` (updated and working)

### **For Custom Code** (API Limitations):
- ❌ **Custom code updates** - Not available via API (use Webflow MCP tools or manual)
- ✅ **Use Webflow MCP tools**: `mcp_webflow_add_inline_site_script` (works!)
- ❌ **Page-level code** - Requires Designer Extension or manual

---

## 📋 **DEPLOYMENT WORKFLOW**

### **Step 1: Deploy Custom Code**

**Option A: Use Webflow MCP Tools** (Recommended):
```bash
# Automated via MCP tools - already done for CSS fixes
# Tool: mcp_webflow_add_inline_site_script
```

**Option B: Manual** (If MCP unavailable):
1. Webflow Designer → Site Settings → Custom Code → Code in `<head> tag`
2. Paste CSS/JS code
3. Save (don't publish yet)

---

### **Step 2: Publish Using v1 API** ✅ Automated

**Method 1: Use API Endpoint** (Recommended):
```bash
curl "https://api.rensto.com/api/webflow/test/v1/publish-direct?accessToken=90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b&siteId=66c7e551a317e0e9c9f906d8"
```

**Method 2: Use Updated Script**:
```bash
node scripts/publish-webflow-site.js
```

**This will**:
- ✅ Use Site API token from env or MCP config
- ✅ Call v1 publish endpoint with `accept-version: '1.0.0'`
- ✅ Publish to `rensto.com` and `www.rensto.com`
- ✅ Return `{"ok": true, "data": {"queued": true}}` on success

---

## 🔧 **IMPORTANT: Token Types**

### **Site API Token** (For Publishing):
- **Value**: `90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b`
- **Location**: `~/.cursor/mcp.json` → `webflow-local.env.WEBFLOW_API_TOKEN`
- **Usage**: Publishing, site info, CMS operations
- **Endpoint**: v1 API (`accept-version: '1.0.0'`)

### **OAuth Client Secret** (For OAuth flows):
- **Location**: Environment variables or MCP config
- **Usage**: OAuth authorization (not for publishing)
- **Do NOT use for publishing** ❌

---

## ✅ **WORKFLOW SUMMARY**

1. **Deploy Code**: Use Webflow MCP tools or manual in Designer
2. **Automated Publish**: Run script or use API endpoint
3. **Result**: Site published with new code ✅

---

## 🚨 **REMOVED INCORRECT REFERENCES**

**Deleted**:
- ❌ Old wrong token: `fd74dac2e8dc23c2e8047d7854be9e303afe85249301b14a91b657b36d1759ed`
- ❌ Hardcoded credentials in scripts
- ❌ Outdated v2 API domain lookup approach

**Now**:
- ✅ Scripts use environment variables
- ✅ Correct Site API token documented
- ✅ v1 API approach verified and working

---

**Last Updated**: October 31, 2025
**Status**: ✅ Production-ready, verified working
