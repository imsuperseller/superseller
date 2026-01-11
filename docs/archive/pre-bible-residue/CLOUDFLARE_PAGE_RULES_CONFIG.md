# Cloudflare Page Rules Configuration

**Date**: November 12, 2025  
**Zone ID**: `031333b77c859d1dd4d4fd4afdc1b9bc`  
**Domain**: `rensto.com`

---

## 📋 **MANUAL CONFIGURATION REQUIRED**

The Cloudflare API token doesn't have Page Rules permissions. Configure these rules manually in the Cloudflare Dashboard.

**Dashboard URL**: https://dash.cloudflare.com/031333b77c859d1dd4d4fd4afdc1b9bc/rensto.com/rules

---

## 🎯 **PAGE RULES TO CREATE**

### **Rule 1: Static Assets (Images, Fonts, CSS, JS)**

**URL Pattern**: `*rensto.com/*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js)`

**Settings**:
- ✅ **Cache Level**: Cache Everything
- ✅ **Edge Cache TTL**: 1 month
- ✅ **Browser Cache TTL**: Respect Existing Headers
- ✅ **Auto Minify**: CSS, HTML, JavaScript (all enabled)

**Priority**: 1 (highest)

---

### **Rule 2: API Routes (No Caching)**

**URL Pattern**: `*rensto.com/api/*`

**Settings**:
- ✅ **Cache Level**: Bypass
- ✅ **Disable Apps**: Off
- ✅ **Disable Performance**: Off
- ✅ **Disable Security**: Off

**Priority**: 2

---

### **Rule 3: HTML Pages (Standard Caching)**

**URL Pattern**: `*rensto.com/*`

**Settings**:
- ✅ **Cache Level**: Standard
- ✅ **Edge Cache TTL**: 1 hour
- ✅ **Browser Cache TTL**: Respect Existing Headers
- ✅ **Auto Minify**: CSS, HTML, JavaScript (all enabled)
- ✅ **Rocket Loader**: On (optional, for faster JS loading)

**Priority**: 3 (lowest - catch-all)

---

## 📝 **STEP-BY-STEP INSTRUCTIONS**

1. **Go to Cloudflare Dashboard**:
   - Navigate to: https://dash.cloudflare.com/031333b77c859d1dd4d4fd4afdc1b9bc/rensto.com/rules

2. **Click "Create rule"** (or "Add rule" if you have existing rules)

3. **Configure Rule 1 (Static Assets)**:
   - **Rule name**: "Static Assets - Cache Everything"
   - **URL**: `*rensto.com/*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js)`
   - **Then the settings are**:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month
     - Auto Minify: Enable CSS, HTML, JavaScript
   - **Deploy**

4. **Configure Rule 2 (API Routes)**:
   - **Rule name**: "API Routes - Bypass Cache"
   - **URL**: `*rensto.com/api/*`
   - **Then the settings are**:
     - Cache Level: Bypass
   - **Deploy**

5. **Configure Rule 3 (HTML Pages)**:
   - **Rule name**: "HTML Pages - Standard Cache"
   - **URL**: `*rensto.com/*`
   - **Then the settings are**:
     - Cache Level: Standard
     - Edge Cache TTL: 1 hour
     - Auto Minify: Enable CSS, HTML, JavaScript
     - Rocket Loader: On (optional)
   - **Deploy**

---

## ⚠️ **IMPORTANT NOTES**

1. **Rule Priority**: Rules are evaluated in order (top to bottom). Make sure static assets rule is first, API rule is second, and HTML rule is last.

2. **Free Plan Limit**: Cloudflare Free plan allows 3 Page Rules. All 3 rules above fit within this limit.

3. **Testing**: After creating rules, test:
   - Static assets load from cache (check `cf-cache-status: HIT` header)
   - API routes bypass cache (check `cf-cache-status: DYNAMIC` header)
   - HTML pages cache properly (check `cf-cache-status: HIT` after first request)

4. **Monitoring**: Check Cloudflare Analytics → Caching to see cache hit rates.

---

## 🔍 **VERIFICATION**

After configuration, test with:

```bash
# Static asset (should show cf-cache-status: HIT)
curl -I https://rensto.com/_next/static/chunks/main.js

# API route (should show cf-cache-status: DYNAMIC or BYPASS)
curl -I https://rensto.com/api/marketplace/workflows

# HTML page (should show cf-cache-status: HIT after first request)
curl -I https://rensto.com/marketplace
```

---

## 📊 **EXPECTED RESULTS**

- **Static Assets**: 90%+ cache hit rate
- **API Routes**: 0% cache hit rate (always fresh)
- **HTML Pages**: 60-80% cache hit rate (depending on traffic patterns)

---

**Status**: ⚠️ **MANUAL CONFIGURATION REQUIRED**  
**Next Steps**: Configure Page Rules in Cloudflare Dashboard using instructions above.

