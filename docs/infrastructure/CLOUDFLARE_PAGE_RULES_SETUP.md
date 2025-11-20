# Cloudflare Page Rules Setup - Updated

**Date**: November 12, 2025  
**Zone ID**: `031333b77c859d1dd4d4fd4afdc1b9bc`  
**Domain**: `rensto.com`  
**Current Status**: 1 of 3 rules used

---

## 📋 **CURRENT SITUATION**

You have **1 existing Page Rule**:
- **URL**: `rensto.com/*`
- **Action**: Forwarding URL (301 Permanent Redirect to `https://www.rensto.com/$1`)
- **Status**: ✅ Active

**Remaining Slots**: 2 out of 3 (Free plan limit)

---

## 🎯 **RECOMMENDED CONFIGURATION**

Since you have a redirect from `rensto.com` → `www.rensto.com`, we need to configure caching rules for `www.rensto.com` (the actual destination).

### **Option 1: Keep Redirect + Add 2 Caching Rules** (Recommended)

**Rule 1** (Keep existing):
- **URL**: `rensto.com/*`
- **Action**: Forwarding URL (301 → `https://www.rensto.com/$1`)
- **Priority**: 1 (highest)

**Rule 2** (New):
- **URL**: `www.rensto.com/*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js)`
- **Action**: 
  - Cache Level: **Cache Everything**
  - Edge Cache TTL: **1 month**
  - Auto Minify: **CSS, HTML, JavaScript** (all enabled)
- **Priority**: 2

**Rule 3** (New):
- **URL**: `www.rensto.com/api/*`
- **Action**:
  - Cache Level: **Bypass**
- **Priority**: 3

**Note**: HTML pages will use Next.js cache headers (already configured in `next.config.mjs`), so we don't need a separate rule for them.

---

### **Option 2: Remove Redirect + Add 3 Caching Rules** (If redirect not needed)

If both `rensto.com` and `www.rensto.com` work the same, you can remove the redirect and add 3 caching rules:

**Rule 1** (New):
- **URL**: `*rensto.com/*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js)`
- **Action**: Cache Everything, 1 month

**Rule 2** (New):
- **URL**: `*rensto.com/api/*`
- **Action**: Bypass Cache

**Rule 3** (New):
- **URL**: `*rensto.com/*`
- **Action**: Standard Cache, 1 hour

---

## 📝 **STEP-BY-STEP INSTRUCTIONS (Option 1 - Recommended)**

### **Step 1: Create Static Assets Rule**

1. Click **"Create Page Rule"** button
2. **URL Pattern**: `www.rensto.com/*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js)`
3. **Then the settings are**:
   - ✅ **Cache Level**: Select "Cache Everything"
   - ✅ **Edge Cache TTL**: Select "1 month"
   - ✅ **Auto Minify**: Enable "CSS", "HTML", and "JavaScript"
4. Click **"Deploy"**

### **Step 2: Create API Bypass Rule**

1. Click **"Create Page Rule"** button again
2. **URL Pattern**: `www.rensto.com/api/*`
3. **Then the settings are**:
   - ✅ **Cache Level**: Select "Bypass"
4. Click **"Deploy"**

### **Step 3: Verify Rule Order**

After creating both rules, verify the order (using up/down arrows):
1. **Position 1**: `rensto.com/*` → Redirect (existing)
2. **Position 2**: `www.rensto.com/*.(extensions)` → Cache Everything (new)
3. **Position 3**: `www.rensto.com/api/*` → Bypass (new)

**Important**: The redirect rule should stay at Position 1 (highest priority).

---

## ✅ **VERIFICATION**

After setup, test:

```bash
# Static asset (should show cf-cache-status: HIT after first request)
curl -I https://www.rensto.com/_next/static/chunks/main.js | grep -i cache

# API route (should show cf-cache-status: DYNAMIC or BYPASS)
curl -I https://www.rensto.com/api/marketplace/workflows | grep -i cache

# HTML page (should respect Next.js headers: s-maxage=3600)
curl -I https://www.rensto.com/marketplace | grep -i cache
```

---

## ⚠️ **IMPORTANT NOTES**

1. **Rule Priority**: Rules are evaluated top-to-bottom. The redirect rule should be first.

2. **URL Patterns**: 
   - Use `www.rensto.com/*` for caching rules (since that's where traffic goes after redirect)
   - The redirect rule handles `rensto.com/*` → `www.rensto.com/*`

3. **HTML Pages**: Don't need a separate rule - Next.js cache headers in `next.config.mjs` handle this.

4. **Free Plan Limit**: You're using all 3 slots with Option 1. If you need more rules, consider upgrading.

---

## 🎯 **RECOMMENDATION**

**Use Option 1** (Keep redirect + 2 caching rules):
- ✅ Preserves existing redirect behavior
- ✅ Optimizes static assets (biggest performance gain)
- ✅ Ensures API routes are always fresh
- ✅ Uses all 3 available slots efficiently

---

**Status**: ⚠️ **READY TO CONFIGURE**  
**Next Steps**: Follow Step-by-Step Instructions above to create the 2 new rules.

