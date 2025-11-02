# ✅ CORRECTED: Webflow Custom Code API

**Date**: October 31, 2025  
**Status**: API DOES support custom code - requires 2-step process

---

## 🎯 **WHAT I FOUND**

Webflow API **DOES** support custom code management via v2 API:

### **Endpoints Available**:

1. **Register Script to Site**: `POST /v2/sites/{siteId}/custom_code`
   - Registers a script (hosted URL or inline code)
   - Returns script ID

2. **Apply Scripts to Page**: `PUT /v2/pages/{pageId}/custom_code`
   - Applies registered scripts to a specific page
   - Can apply multiple scripts
   - Remove scripts by omitting from request

3. **Get Registered Scripts**: `GET /v2/sites/{siteId}/custom_code`
   - Lists all registered scripts on site

4. **Get Applied Scripts**: `GET /v2/sites/{siteId}/custom_code/applied`
   - Lists scripts applied to site/pages

5. **Delete Script**: `DELETE /v2/sites/{siteId}/custom_code/{scriptId}`
   - Removes registered script

---

## 📋 **CORRECT WORKFLOW**

### **For Inline Code (CSS in `<head>`)**

1. **Register inline script**:
```json
POST /v2/sites/{siteId}/custom_code
{
  "codeLocation": "head",
  "sourceCode": "<style>/* CSS here */</style>",
  "name": "UI Fixes CSS"
}
```

2. **Apply to pages**:
```json
PUT /v2/pages/{pageId}/custom_code
{
  "scripts": [
    { "scriptId": "script_id_from_step_1" }
  ]
}
```

3. **Publish site** (using v1 API we already know works)

---

### **For Hosted Scripts (External JS)**

1. **Register hosted script**:
```json
POST /v2/sites/{siteId}/custom_code
{
  "codeLocation": "body",
  "hostedLocation": "https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js",
  "integrityHash": "...",  // Optional but recommended
  "name": "Stripe Core"
}
```

2. **Apply to pages** (same as inline)

---

## ✅ **WHAT NEEDS TO HAPPEN**

1. ✅ Use Site API token (not OAuth) - already have
2. ✅ Register CSS as inline script with `codeLocation: "head"`
3. ✅ Register external JS scripts with `hostedLocation`
4. ✅ Apply registered scripts to pages
5. ✅ Publish using v1 API

---

## 🔧 **IMPLEMENTATION**

The MCP server already has:
- ✅ `addWebflowInlineSiteScript` method
- ✅ `getWebflowRegisteredSiteScripts` method
- ✅ `getWebflowAppliedSiteScripts` method

**Missing**:
- ❌ `applyScriptsToPage` method (PUT to `/v2/pages/{pageId}/custom_code`)

---

**Next**: Implement the page application method and create deployment script

