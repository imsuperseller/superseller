# 🔍 Webflow API Research Findings

**Date**: October 31, 2025  
**Status**: Researching actual API endpoints

---

## ✅ **WHAT THE DOCUMENTATION SAYS**

According to Webflow Developer Docs:

1. **Register Script**: `POST /v2/sites/{siteId}/custom_code`
2. **Apply to Page**: `PUT /v2/pages/{pageId}/custom_code`
3. **Get Registered**: `GET /v2/sites/{siteId}/custom_code`
4. **Get Applied**: `GET /v2/sites/{siteId}/custom_code/applied`

---

## ❌ **ACTUAL API TEST RESULT**

```bash
POST /v2/sites/{siteId}/custom_code
Response: 404 - Route not found
```

**This suggests**:
- Endpoint might be different
- Might require Data API (not Sites API)
- Might require different token type
- Might be newer feature requiring OAuth token

---

## 🔍 **NEED TO VERIFY**

1. Check if endpoint exists in Data API vs Sites API
2. Check if requires OAuth token vs Site API token
3. Check API version requirements
4. Test actual endpoint structure

---

## 📋 **NEXT STEPS**

1. Test with OAuth token (if available)
2. Check Data API endpoints
3. Verify token permissions
4. Test actual working examples

**Current Status**: API documentation exists but endpoint returns 404 - investigating

