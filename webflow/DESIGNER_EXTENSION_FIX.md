# 🔧 Designer Extension Fix Guide

**Date**: October 30, 2025  
**Issue**: Designer Extension URL returns 404  
**URL**: `https://68df6e8d3098a65fadc8f111.webflow-ext.com`

---

## 🔍 **ROOT CAUSE**

The Designer Extension URL is a **Webflow-hosted extension**, but the extension server needs to be:
1. **Deployed to Webflow's Extension Platform**, OR
2. **Running locally** and accessible via tunnel, OR
3. **Active in Webflow Designer** browser session

---

## 🎯 **SOLUTION OPTIONS**

### **Option 1: Use Webflow Data API Directly** ⚡ **IMMEDIATE**

**Works For**:
- Site-level custom code
- Publishing site
- Listing pages
- Getting page metadata

**Limitations**:
- ❌ Cannot update page-level custom code (head/body)
- ❌ Requires Designer Extension for page custom code

**Action**: Use MCP tools or API directly for what's possible

---

### **Option 2: Deploy Designer Extension to Webflow** 🚀 **RECOMMENDED**

**Steps**:

1. **Build Extension**:
   ```bash
   cd infra/mcp-servers/webflow-mcp-server/designer-extension
   npm install
   npm run build
   ```

2. **Deploy to Webflow Extension Platform**:
   - Go to https://developers.webflow.com/apps
   - Create/update your Designer Extension
   - Upload the extension bundle
   - Configure OAuth (client ID/secret already provided)

3. **Install on Site**:
   - In Webflow Designer, go to Apps
   - Install your extension
   - Authorize with OAuth

**Extension Configuration**:
- **Client ID**: `9019376a6596d4dff6bc765563e07aee92469e257a7cfefd7c8839ccc3773edb`
- **Client Secret**: `7d5cf2ea9f9a3a18795ceeac7f083c77e9c3d7e9bc7f378c789d7f16eff5f5c1`
- **Redirect URI**: `https://68df6a6f4c7ce10d908b36e5.webflow-ext.com/auth/webflow/callback`
- **Extension URI**: `https://68df6e8d3098a65fadc8f111.webflow-ext.com`

---

### **Option 3: Run Extension Locally with Tunnel** 🔧

**Using Cloudflare Tunnel or ngrok**:

1. **Start Extension Server**:
   ```bash
   cd infra/mcp-servers/webflow-mcp-server/designer-extension
   PORT=3000 npm start
   ```

2. **Create Tunnel**:
   ```bash
   # Using Cloudflare Tunnel
   cloudflared tunnel --url http://localhost:3000
   
   # Or ngrok
   ngrok http 3000
   ```

3. **Update Extension URL** in Webflow Developer Portal to tunnel URL

---

### **Option 4: Manual Deployment** ✅ **READY NOW**

**Already Prepared**:
- ✅ All page IDs retrieved
- ✅ All deployment snippets ready
- ✅ Exact page mappings available

**Time**: ~35 minutes manual deployment

---

## 🔧 **QUICK FIX: Update Deployer Script**

The deployer now handles:
- ✅ Designer Extension detection
- ✅ Fallback to manual instructions
- ✅ Site Custom Code API where applicable
- ✅ Clear error messages

---

## 📋 **CURRENT STATUS**

### **Working** ✅:
- Webflow Data API (list pages, get site info, publish)
- All 49 pages mapped with IDs
- Deployment snippets ready

### **Requires Extension** ⚠️:
- Page-level custom code updates (head/body)
- Real-time Designer content editing

### **Alternative** ✅:
- Manual deployment (all prepared)
- Site-level custom code via API

---

## 🎯 **IMMEDIATE ACTION**

**For Now**: Use manual deployment (all snippets ready)

**For Future**: Deploy Designer Extension to Webflow platform for automation

---

*See `webflow/DEPLOYMENT_READY_WITH_PAGE_IDS.md` for manual deployment guide*

