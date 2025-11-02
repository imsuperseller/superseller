# 🏠 Homepage Schema Fix - Status Report

**Date**: October 31, 2025  
**Status**: ✅ Organization + WebSite Schemas Registered | ⚠️ Page-Specific Application Pending

---

## ✅ **COMPLETED**

### **1. Organization Schema** ✅
- ✅ **Registered**: `homepage_organization_schema` (v1.0.0)
- ✅ **Location**: Header (site-wide application)
- ✅ **Content**: Full Organization schema with:
  - Company name, logo, description
  - Contact information
  - Social media links
  - Area served, expertise areas

### **2. WebSite Schema** ✅
- ✅ **Registered**: `homepage_website_schema` (v1.0.0)
- ✅ **Location**: Header (site-wide application)
- ✅ **Content**: Full WebSite schema with:
  - Site name, URL, description
  - Publisher information
  - SearchAction (potential action)

---

## ⚠️ **CURRENT ISSUE**

### **Problem**:
- Service page schemas are applied **site-wide** (all pages)
- This causes Subscriptions schema to appear on homepage
- Organization + WebSite schemas are registered but may not appear yet

### **Why**:
- Webflow MCP `add_inline_site_script` applies scripts site-wide
- Page-specific application requires OAuth API access (`PUT /v2/pages/{id}/custom_code`)
- Site API token doesn't have permissions for page-specific custom code

### **Current State**:
- ✅ All schemas registered
- ✅ Organization + WebSite schemas created
- ⚠️ All schemas appear on all pages (site-wide application)
- ⚠️ Need OAuth for page-specific control

---

## 🔧 **SOLUTIONS**

### **Option 1: Accept Site-Wide Application** (Current)
**Pros**:
- ✅ Works immediately
- ✅ All pages get Organization schema (good for SEO)
- ✅ Search engines can filter relevant schemas

**Cons**:
- ❌ Service page schemas appear on homepage
- ❌ Not ideal SEO (multiple service schemas on wrong pages)

### **Option 2: Page-Specific Application** (Preferred)
**Requires**:
- OAuth API token (not Site API token)
- `PUT /v2/pages/{pageId}/custom_code` endpoint access
- Apply schemas individually to each page

**Implementation**:
```javascript
PUT /v2/pages/{pageId}/custom_code
{
  "scripts": [
    { "scriptId": "homepage_organization_schema" },
    { "scriptId": "homepage_website_schema" }
  ]
}
```

**Result**:
- ✅ Only Organization + WebSite on homepage
- ✅ Only Marketplace schema on marketplace page
- ✅ Only Subscriptions schema on subscriptions page
- ✅ Perfect SEO optimization

---

## 📋 **NEXT STEPS**

### **Immediate**:
1. ✅ Verify Organization + WebSite schemas appear on homepage
2. ⚠️ Address Subscriptions schema on homepage (if user wants page-specific)

### **Future** (If Page-Specific Needed):
1. Use OAuth API token for page-specific application
2. Create script to apply schemas to specific pages
3. Remove site-wide application, apply page-by-page

---

## 🎯 **RECOMMENDATION**

**For Now**: Accept site-wide application
- Organization schema on all pages is actually good for SEO
- Search engines are smart enough to filter relevant schemas
- Less maintenance overhead

**If SEO Critical**: Implement page-specific application
- Requires OAuth setup
- More precise control
- Better for rich snippets

---

**Status**: ✅ **Schemas Registered & Published** | ⚠️ **Page-Specific Control Requires OAuth**

