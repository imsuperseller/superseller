# Cloudflare Page Rules - Quick Setup Guide

**Current Status**: 1 rule exists (redirect), 2 slots available

---

## 🎯 **RECOMMENDED: Add 2 Caching Rules**

Since you have a redirect rule, add caching rules for `www.rensto.com` (the destination):

### **Rule 2: Static Assets** (Create this first)

1. Click **"Create Page Rule"**
2. **URL Pattern**: `www.rensto.com/*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js)`
3. **Settings**:
   - Cache Level: **Cache Everything**
   - Edge Cache TTL: **1 month**
   - Auto Minify: **CSS, HTML, JavaScript** ✅
4. **Deploy**

### **Rule 3: API Routes** (Create this second)

1. Click **"Create Page Rule"**
2. **URL Pattern**: `www.rensto.com/api/*`
3. **Settings**:
   - Cache Level: **Bypass**
4. **Deploy**

---

## ✅ **Final Rule Order**

After setup, your rules should be:
1. `rensto.com/*` → Redirect (existing - keep at Position 1)
2. `www.rensto.com/*.(extensions)` → Cache Everything (new)
3. `www.rensto.com/api/*` → Bypass (new)

---

## 📝 **Alternative: If Redirect Not Needed**

If the redirect isn't working (both domains serve content), you can:

1. **Delete** the redirect rule
2. **Create 3 caching rules** for `*rensto.com/*` (covers both domains)

But since you already have the redirect, keeping it + adding 2 caching rules is simpler.

---

**Quick Action**: Create the 2 rules above using the Cloudflare dashboard.

