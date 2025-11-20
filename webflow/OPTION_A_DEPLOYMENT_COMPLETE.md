# ⚠️ OUTDATED: Option A Deployment - Complete Instructions

**Date**: November 2, 2025 (MIGRATION DAY)  
**Status**: ⚠️ **OUTDATED** - Site migrated to Vercel Nov 2, 2025  
**Current Status**: rensto.com is on Vercel (Next.js), not Webflow

**⚠️ NOTE**: This document references Webflow Designer deployment. The site is now on Vercel. This guide is for historical reference only.

---

## 📋 **WHAT YOU NEED TO DO**

### **Step 1: Deploy JavaScript Files to Vercel CDN** (5 minutes)

**Files to copy to `rensto-webflow-scripts` repository**:

1. **Homepage Interactions**:
   - Copy from: `webflow/pages/homepage-interactions.js`
   - Paste into: `rensto-webflow-scripts/homepage/interactions.js`
   - **Create folder if it doesn't exist**: `rensto-webflow-scripts/homepage/`

2. **Marketplace Interactions**:
   - Copy from: `webflow/pages/marketplace-interactions.js`
   - Paste into: `rensto-webflow-scripts/marketplace/interactions.js`
   - **File already exists?** Replace it.

**Quick Steps**:
```bash
cd /Users/shaifriedman/New\ Rensto/rensto-webflow-scripts

# Create homepage folder if needed
mkdir -p homepage

# Copy files
cp /Users/shaifriedman/New\ Rensto/rensto/webflow/pages/homepage-interactions.js homepage/interactions.js
cp /Users/shaifriedman/New\ Rensto/rensto/webflow/pages/marketplace-interactions.js marketplace/interactions.js

# Commit and push
git add homepage/interactions.js marketplace/interactions.js
git commit -m "Add homepage and marketplace interactions scripts"
git push origin main
```

**Wait 30 seconds** for Vercel to auto-deploy.

**Verify**:
- ✅ `https://rensto-webflow-scripts.vercel.app/homepage/interactions.js`
- ✅ `https://rensto-webflow-scripts.vercel.app/marketplace/interactions.js`

---

### **Step 2: Remove Designer Embed Elements** (2 minutes per page)

**For Homepage**:
1. Open Webflow Designer → Homepage
2. Look for any **Embed/Custom Code element** between Nav and Footer
3. If it exists: **Delete it** (we're using Page Settings only)

**For Marketplace**:
1. Open Webflow Designer → Marketplace page
2. Look for **Embed/Custom Code element** between Nav and Footer
3. **Delete it** (it has DOCTYPE/html tags which are wrong)

**Why**: We're using Page Settings only - Designer Embeds cause duplication.

---

### **Step 3: Deploy Homepage HTML** (3 minutes)

1. **Open Webflow Designer**: https://rensto.design.webflow.com
2. **Go to Homepage**
3. **Page Settings** (gear icon, top right) → **Custom Code** tab
4. **"Code before </body> tag"** field:
   - **Delete everything** (or select all and replace)
   - **Paste**: Open `webflow/pages/WEBFLOW_EMBED_HOMEPAGE_OPTIMIZED.html`
   - **Copy entire file** (1,388 lines)
   - **Paste** into the field
5. **Click Save**
6. **Publish Site**

---

### **Step 4: Deploy Marketplace HTML** (3 minutes)

1. **Open Webflow Designer**: https://rensto.design.webflow.com
2. **Go to Marketplace page**
3. **Page Settings** → **Custom Code** tab
4. **"Code before </body> tag"** field:
   - **Delete everything** (or select all and replace)
   - **Paste**: Open `webflow/pages/WEBFLOW_EMBED_MARKETPLACE_CVJ_OPTIMIZED.html`
   - **Copy entire file** (622 lines)
   - **Paste** into the field
5. **Click Save**
6. **Publish Site**

---

## ✅ **VERIFICATION CHECKLIST**

After deployment, verify:

1. ✅ **JavaScript Files Load**:
   - Homepage: Open browser console → Check for `homepage-interactions.js` loaded
   - Marketplace: Check for `marketplace-interactions.js` loaded

2. ✅ **No Console Errors**:
   - Open `rensto.com` → Console should show no 404 errors
   - Open `rensto.com/marketplace` → Console should show no 404 errors

3. ✅ **Functionality Works**:
   - Homepage: FAQ toggles work, lead magnet form works
   - Marketplace: FAQ toggles work, pricing toggle works, checkout buttons work

4. ✅ **No Duplication**:
   - View page source → Content should appear once (not twice)
   - Scripts should load once (check Network tab)

---

## 🚨 **TROUBLESHOOTING**

### **JavaScript 404 Errors**:
- **Fix**: Wait 30 seconds after git push, then hard refresh (Cmd+Shift+R)

### **Content Appears Twice**:
- **Fix**: Make sure Designer Embed elements are deleted (Step 2)

### **Scripts Don't Execute**:
- **Fix**: Check script tag URLs in HTML match Vercel CDN paths
- **Fix**: Verify GSAP libraries load before interactions.js

---

## 📁 **FILES READY FOR DEPLOYMENT**

✅ **Ready to Paste**:
- `webflow/pages/WEBFLOW_EMBED_HOMEPAGE_OPTIMIZED.html` (41,318 chars)
- `webflow/pages/WEBFLOW_EMBED_MARKETPLACE_CVJ_OPTIMIZED.html` (33,660 chars)

✅ **Ready to Copy to rensto-webflow-scripts**:
- `webflow/pages/homepage-interactions.js` (4,075 chars)
- `webflow/pages/marketplace-interactions.js` (3,679 chars)

---

**Status**: 🎯 **READY TO DEPLOY** - All files prepared, just follow steps above

