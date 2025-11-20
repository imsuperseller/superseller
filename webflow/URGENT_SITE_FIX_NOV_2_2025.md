# ⚠️ OUTDATED: URGENT Site Fix (Migration Day)

**Date**: November 2, 2025 (MIGRATION DAY)  
**Status**: ⚠️ **OUTDATED** - Site migrated to Vercel Nov 2, 2025  
**Current Status**: rensto.com is on Vercel (Next.js), not Webflow

**⚠️ NOTE**: This document was created on migration day and references Webflow Designer. The site is now on Vercel. This guide is for historical reference only.

---

## 🚨 URGENT (Historical - Migration Day)

**Issue**: Only header/footer visible, all content missing  
**Cause**: HTML files exist but NOT deployed to Webflow custom code  
**Fix Time**: 10 minutes

---

## ✅ **SOLUTION: Manual Deployment in Webflow Designer** (OUTDATED)

### **Step 1: Homepage Fix** (OUTDATED - Site now on Vercel)

1. **Open Webflow Designer** (OUTDATED):
   - Go to: https://webflow.com/designer
   - Select site: **Rensto** (or navigate to: https://rensto.design.webflow.com)
   - Wait for Designer to load

2. **Navigate to Homepage** (OUTDATED):
   - Left sidebar → Pages panel
   - Click **"Home"** (slug: `/`)

3. **Open Page Settings**:
   - Top right corner → Click **Settings** icon (gear)
   - Scroll down to **Custom Code** section

4. **Add Content to "Code before </body> tag"**:
   - Find field: **"Code before </body> tag"**
   - Open file: `/Users/shaifriedman/New Rensto/rensto/webflow/pages/WEBFLOW_EMBED_HOMEPAGE.html`
   - Copy **ENTIRE FILE** (all 1,530 lines)
   - Paste into the field
   - Click **Save**

5. **Publish**:
   - Top right → Click **Publish** button
   - Select domains: `rensto.com` and `www.rensto.com`
   - Click **Publish to site**

---

### **Step 2: Marketplace Fix**

1. **Navigate to Marketplace Page**:
   - Left sidebar → Pages panel
   - Click **"Marketplace"** (slug: `/marketplace`)

2. **Open Page Settings**:
   - Top right → **Settings** icon (gear)
   - Scroll to **Custom Code** section

3. **Add Content to "Code before </body> tag"**:
   - Open file: `/Users/shaifriedman/New Rensto/rensto/webflow/pages/WEBFLOW_EMBED_MARKETPLACE_CVJ.html`
   - Copy **ENTIRE FILE** (all 1,630 lines)
   - Paste into **"Code before </body> tag"** field
   - Click **Save**

4. **Publish**:
   - Top right → **Publish** button
   - Confirm domains and publish

---

## ✅ **VERIFICATION**

After publishing both pages:

1. **Homepage** (https://www.rensto.com):
   - ✅ Hero section with headline visible
   - ✅ Stats (500+ businesses, 80% time saved)
   - ✅ 4 path selector cards
   - ✅ Lead magnet form
   - ✅ All content sections visible

2. **Marketplace** (https://www.rensto.com/marketplace):
   - ✅ Hero section
   - ✅ Categories visible
   - ✅ Pricing tiers visible
   - ✅ Template cards (if dynamic workflows working)
   - ✅ FAQ section

---

## 🚨 **WHY THIS HAPPENED**

The HTML files were created in the repo but never deployed to Webflow's custom code sections. Webflow Designer only has header/footer components, so without the custom code, the pages appear blank.

---

## ⚡ **QUICK REFERENCE**

**Files to Deploy**:
- Homepage: `webflow/pages/WEBFLOW_EMBED_HOMEPAGE.html` (1,530 lines)
- Marketplace: `webflow/pages/WEBFLOW_EMBED_MARKETPLACE_CVJ.html` (1,630 lines)

**Where to Paste**: Page Settings → Custom Code → "Code before </body> tag"

**Time Required**: ~10 minutes total (5 min per page + publish)

---

**Status**: ⚠️ **URGENT - Site is broken until deployed**

