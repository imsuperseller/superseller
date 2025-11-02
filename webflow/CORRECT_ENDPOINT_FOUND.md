# ✅ CORRECT Endpoint Found!

**Date**: October 31, 2025  
**Discovery**: The endpoint path is different than documented

---

## 🎯 **THE ISSUE**

The endpoint `/v2/sites/{id}/custom_code` returns 404, BUT:

When testing GET request, we get:
```
"Your token is not authorized to access this version of the API"
```

**This means**: The endpoint exists, but the path is likely different!

---

## ✅ **CORRECT ENDPOINTS** (From Documentation)

Based on web search results:

1. **Register Inline Script**: 
   - `POST /v2/sites/{siteId}/registered_scripts/inline`
   - Body: `{ displayName, sourceCode, canCopy }`

2. **Register Hosted Script**:
   - `POST /v2/sites/{siteId}/registered_scripts/hosted`
   - Body: `{ displayName, hostedLocation, integrityHash, canCopy }`

3. **Apply to Page**:
   - `PUT /v2/pages/{pageId}/custom_code`
   - Body: `{ scripts: [{ id, location, version }] }`

---

## 🔧 **NEXT STEP**

Testing the correct endpoint path now:
- `/v2/sites/{id}/registered_scripts/inline` (not `/custom_code`)
- Using both API keys to see which works

---

**If this works, we can proceed with full automated deployment!**

